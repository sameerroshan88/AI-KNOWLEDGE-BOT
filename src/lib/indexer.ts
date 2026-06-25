/**
 * src/lib/indexer.ts
 *
 * Complete PDF indexing pipeline — 100% local, zero OpenAI, zero paid APIs.
 *
 * PDF Extraction: pdfjs-dist/legacy (Node.js mode, no web worker needed)
 * Embeddings:     Ollama nomic-embed-text (768-dim)
 * Storage:        Supabase pgvector (document_embeddings table)
 *
 * Pipeline steps:
 *   1. Fetch document record from Supabase
 *   2. Download PDF bytes from Supabase Storage URL
 *   3. Extract text page-by-page using pdfjs-dist (Node.js / no-worker mode)
 *   4. Clean & split text into smart chunks (700-1000 chars, 150 overlap, word-boundary)
 *   5. Generate 768-dim embeddings per chunk via Ollama nomic-embed-text
 *   6. Delete any previous embeddings (idempotent — makes Retry safe)
 *   7. Batch-insert all chunk rows into document_embeddings
 *   8. Mark indexing_status = 'completed'
 */

// @ts-ignore — pdfjs-dist/legacy is a valid subpath; types live at top level
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import { Ollama } from 'ollama'
import supabaseAdmin from '@/lib/supabaseAdmin'
import path from 'path'
import { pathToFileURL } from 'url'

// Point to the physical worker file using a file:// URL.
// This prevents Next.js's bundler runtime from attempting to resolve pdf.worker.mjs inside .next/
const workerPath = path.resolve('node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')
;(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).toString()

// ─── Config ──────────────────────────────────────────────────────────────────
const CHUNK_TARGET  = 900   // aim for this many chars per chunk
const CHUNK_MAX     = 1000  // hard cap
const CHUNK_OVERLAP = 150   // overlap between consecutive chunks
const EMBED_MODEL   = 'nomic-embed-text'
const OLLAMA_HOST   = process.env.OLLAMA_HOST ?? 'http://localhost:11434'
const EMBED_BATCH   = 8     // chunks per Ollama call
const MAX_RETRIES   = 3

const ollama = new Ollama({ host: OLLAMA_HOST })

// ─── Types ───────────────────────────────────────────────────────────────────
interface TextPage {
  pageNum: number
  text:    string
}

interface Chunk {
  text:       string
  pageNumber: number
  index:      number
}

// ─── Step A — Extract text via pdfjs-dist (Node.js mode) ─────────────────────
async function extractTextFromPdf(pdfBuffer: Buffer): Promise<TextPage[]> {
  console.log('[INDEXER]   Extracting PDF...')

  // Convert Buffer to Uint8Array which pdfjs expects
  const data = new Uint8Array(pdfBuffer.buffer, pdfBuffer.byteOffset, pdfBuffer.byteLength)

  const loadingTask = (pdfjsLib as any).getDocument({
    data,
    // Disable font loading for server-side rendering
    disableFontFace:       true,
    disableRange:          false,
    disableStream:         false,
    useSystemFonts:        false,
    useWorkerFetch:        false,
    isEvalSupported:       false,
    // Suppress pdfjs console noise
    verbosity:             0,
  })

  const pdf = await loadingTask.promise
  const numPages = pdf.numPages
  console.log(`[INDEXER]   ${numPages} pages found`)

  const pages: TextPage[] = []

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    try {
      const page    = await pdf.getPage(pageNum)
      const content = await page.getTextContent()

      // Concatenate all text items, preserving natural spacing
      const pageText = content.items
        .map((item: any) => {
          // Each item has a `str` string and `hasEOL` boolean
          return item.str + (item.hasEOL ? '\n' : '')
        })
        .join('')
        .replace(/[ \t]+/g, ' ')   // collapse horizontal whitespace
        .replace(/\n{3,}/g, '\n\n') // collapse triple+ newlines
        .trim()

      if (pageText.length > 0) {
        pages.push({ pageNum, text: pageText })
      }
    } catch (pageErr: any) {
      console.warn(`[INDEXER]   Warning: could not extract text from page ${pageNum}: ${pageErr?.message}`)
    }
  }

  await pdf.destroy()
  return pages
}

// ─── Step B — Smart chunker (word-boundary, overlap) ─────────────────────────
function chunkPage(text: string, pageNum: number, startIndex: number): Chunk[] {
  const chunks: Chunk[] = []
  let pos = 0
  let idx = startIndex

  while (pos < text.length) {
    // Find end: target length, extended to next word boundary up to CHUNK_MAX
    let end = Math.min(pos + CHUNK_TARGET, text.length)

    if (end < text.length) {
      // Walk forward to next space (never cut mid-word)
      let boundary = end
      while (boundary < text.length && boundary < pos + CHUNK_MAX && text[boundary] !== ' ' && text[boundary] !== '\n') {
        boundary++
      }
      end = boundary < text.length ? boundary : end
    }

    const slice = text.slice(pos, end).trim()

    if (slice.length >= 40) {
      chunks.push({ text: slice, pageNumber: pageNum, index: idx++ })
    }

    if (end >= text.length) break

    // Slide with overlap — find a word boundary to start the next chunk
    let nextStart = Math.max(pos + 1, end - CHUNK_OVERLAP)
    // Walk forward to next space so we don't start inside a word
    while (nextStart < end && text[nextStart] !== ' ' && text[nextStart] !== '\n') {
      nextStart++
    }
    nextStart = Math.min(nextStart + 1, end)
    if (nextStart <= pos) nextStart = pos + 1  // safety guard
    pos = nextStart
  }

  return chunks
}

// ─── Step C — Embed a single batch via Ollama (with retries) ─────────────────
async function embedBatch(texts: string[], label: string): Promise<number[][]> {
  let attempt = 0

  while (true) {
    attempt++
    try {
      const res = await ollama.embed({ model: EMBED_MODEL, input: texts })

      if (!res.embeddings || res.embeddings.length !== texts.length) {
        throw new Error(
          `Got ${res.embeddings?.length ?? 0} embeddings, expected ${texts.length}`
        )
      }

      return res.embeddings

    } catch (err: any) {
      const msg: string = err?.message ?? String(err)

      if (msg.includes('ECONNREFUSED') || msg.includes('fetch failed')) {
        throw new Error(
          `Ollama server not running.\n` +
          `Start Ollama first: run "ollama serve" in a terminal.\n` +
          `Expected at: ${OLLAMA_HOST}`
        )
      }

      if (attempt >= MAX_RETRIES) {
        throw new Error(`Embedding failed after ${MAX_RETRIES} attempts [${label}]: ${msg}`)
      }

      const delay = attempt * 2000
      console.warn(`[INDEXER]   Embed attempt ${attempt} failed (${msg}). Retrying in ${delay}ms...`)
      await new Promise(r => setTimeout(r, delay))
    }
  }
}

// ─── Step D — Embed all chunks, logging per-chunk progress ───────────────────
async function embedAllChunks(chunks: Chunk[]): Promise<number[][]> {
  console.log(`[INDEXER]   Connecting to Ollama at ${OLLAMA_HOST}...`)

  // Confirm Ollama is reachable and model is available
  let hasModel = false
  try {
    const list = await ollama.list()
    hasModel = list.models.some(m => m.name.startsWith('nomic-embed-text'))
  } catch {
    throw new Error(
      `Ollama server not running.\nStart Ollama first: run "ollama serve" in a terminal.\nExpected at: ${OLLAMA_HOST}`
    )
  }

  if (!hasModel) {
    throw new Error(
      `Embedding model "${EMBED_MODEL}" not found in Ollama.\n` +
      `Run: ollama pull nomic-embed-text`
    )
  }

  const total = chunks.length
  console.log(`[INDEXER]   Generating embeddings...`)

  const allEmbeddings: number[][] = []

  for (let i = 0; i < total; i += EMBED_BATCH) {
    const batch      = chunks.slice(i, i + EMBED_BATCH)
    const batchFirst = i + 1
    const batchLast  = Math.min(i + EMBED_BATCH, total)

    // Per-spec: log each chunk index
    for (let j = batchFirst; j <= batchLast; j++) {
      console.log(`[INDEXER]   Embedding chunk ${j}/${total}`)
    }

    const batchTexts = batch.map(c => c.text)
    const batchEmbs  = await embedBatch(batchTexts, `${batchFirst}-${batchLast}`)
    allEmbeddings.push(...batchEmbs)
  }

  console.log(`[INDEXER]   ${allEmbeddings.length} embeddings generated`)
  return allEmbeddings
}

// ─── Main export: indexDocument ───────────────────────────────────────────────
export async function indexDocument(
  documentId: string,
  options?: { force?: boolean }
): Promise<{ success: boolean; error?: string }> {

  const hr = '='.repeat(60)
  console.log(`\n${hr}`)
  console.log(`[INDEXER] Starting pipeline for: ${documentId}`)
  console.log(hr)

  try {
    // ── 1. Fetch document record ────────────────────────────────────────────
    const { data: doc, error: fetchErr } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (fetchErr || !doc) {
      const msg = fetchErr?.message ?? 'Document not found'
      console.error(`[INDEXER] ✗ ${msg}`)
      return { success: false, error: msg }
    }

    // Guard: don't double-process unless forced
    if (doc.indexing_status === 'processing' && !options?.force) {
      console.log('[INDEXER] Already processing — skipping.')
      return { success: true }
    }

    // ── 2. Mark processing ──────────────────────────────────────────────────
    console.log('[INDEXER]   Saving metadata...')
    await supabaseAdmin
      .from('documents')
      .update({ indexing_status: 'processing', indexing_error: null })
      .eq('id', documentId)

    // ── 3. Download PDF ─────────────────────────────────────────────────────
    console.log(`[INDEXER]   Uploading PDF... (downloading from storage)`)
    console.log(`[INDEXER]   URL: ${doc.file_url}`)

    const dlRes = await fetch(doc.file_url)
    if (!dlRes.ok) {
      throw new Error(`Failed to download PDF — HTTP ${dlRes.status} ${dlRes.statusText}`)
    }

    const pdfBuffer = Buffer.from(await dlRes.arrayBuffer())
    console.log(`[INDEXER]   Downloaded ${pdfBuffer.length} bytes`)

    // ── 4. Extract text ─────────────────────────────────────────────────────
    let pages: TextPage[]
    try {
      pages = await extractTextFromPdf(pdfBuffer)
    } catch (pdfErr: any) {
      throw new Error(`PDF extraction failed: ${pdfErr?.message ?? String(pdfErr)}`)
    }

    if (pages.length === 0) {
      console.warn('[INDEXER]   No text pages — PDF may be image-only or encrypted')
      await supabaseAdmin
        .from('documents')
        .update({
          indexing_status: 'completed',
          indexing_error:  'Warning: No extractable text found. PDF may be image-only.',
        })
        .eq('id', documentId)
      console.log(`${hr}\n`)
      return { success: true }
    }

    // ── 5. Chunk ────────────────────────────────────────────────────────────
    console.log('[INDEXER]   Creating chunks...')
    const allChunks: Chunk[] = []
    for (const page of pages) {
      const pageChunks = chunkPage(page.text, page.pageNum, allChunks.length)
      allChunks.push(...pageChunks)
    }
    console.log(`[INDEXER]   Chunks created: ${allChunks.length}`)

    if (allChunks.length === 0) {
      await supabaseAdmin
        .from('documents')
        .update({
          indexing_status: 'completed',
          indexing_error:  'Warning: Text found but no valid chunks created.',
        })
        .eq('id', documentId)
      return { success: true }
    }

    // ── 6. Embed ────────────────────────────────────────────────────────────
    const embeddings = await embedAllChunks(allChunks)

    // ── 7. Delete old embeddings (Retry Indexing safety) ────────────────────
    console.log('[INDEXER]   Saving embeddings...')
    const { error: delErr } = await supabaseAdmin
      .from('document_embeddings')
      .delete()
      .eq('document_id', documentId)

    if (delErr) {
      throw new Error(`Failed to clear old embeddings: ${delErr.message}`)
    }

    // ── 8. Batch insert ─────────────────────────────────────────────────────
    const rows = allChunks.map((chunk, i) => ({
      document_id: documentId,
      chunk_index: chunk.index,
      page_number: chunk.pageNumber,
      content:     chunk.text,
      embedding:   embeddings[i],
    }))

    const INSERT_BATCH = 100
    for (let i = 0; i < rows.length; i += INSERT_BATCH) {
      const batch = rows.slice(i, i + INSERT_BATCH)
      const { error: insertErr } = await supabaseAdmin
        .from('document_embeddings')
        .insert(batch)

      if (insertErr) {
        throw new Error(
          `Failed to insert embeddings (rows ${i}–${i + batch.length - 1}): ${insertErr.message}`
        )
      }
    }

    console.log(`[INDEXER]   Inserted ${rows.length} embeddings`)

    // ── 9. Mark completed ───────────────────────────────────────────────────
    await supabaseAdmin
      .from('documents')
      .update({ indexing_status: 'completed', indexing_error: null })
      .eq('id', documentId)

    console.log('[INDEXER] ✓ Index completed successfully')
    console.log(`${hr}\n`)
    return { success: true }

  } catch (err: any) {
    const msg = err?.message ?? String(err)
    console.error(`[INDEXER] ✗ Pipeline failed: ${msg}`)
    console.log(`${hr}\n`)

    try {
      await supabaseAdmin
        .from('documents')
        .update({ indexing_status: 'failed', indexing_error: msg })
        .eq('id', documentId)
    } catch (statusErr: any) {
      console.error('[INDEXER]   Could not update failure status:', statusErr?.message)
    }

    return { success: false, error: msg }
  }
}
