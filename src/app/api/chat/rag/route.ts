/**
 * POST /api/chat/rag
 *
 * Body: { question: string, documentId: string, userId: string }
 *
 * Full local RAG pipeline:
 *   1. Validate inputs & verify document ownership
 *   2. Embed question with nomic-embed-text (768-dim, Ollama)
 *   3. pgvector cosine similarity search via match_document_chunks RPC
 *   4. Build RAG prompt with top-5 context chunks
 *   5. Generate answer via llama3 (Ollama)
 *   6. Return { answer, citations, chunks }
 *
 * Zero paid APIs. Zero OpenAI. 100% local.
 */

import { NextRequest, NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabaseAdmin'
import { embedQuery, buildRagPrompt, generateAnswer } from '@/lib/ollama'

const TOP_K = 5

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, documentId, userId } = body

    // ── Validate inputs ──────────────────────────────────────────────────────
    if (!question?.trim()) {
      return NextResponse.json({ error: 'question is required' }, { status: 400 })
    }
    if (!documentId) {
      return NextResponse.json({ error: 'documentId is required' }, { status: 400 })
    }
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    console.log('\n[RAG] ========== Chat Request ==========')
    console.log(`[RAG]   Document: ${documentId}`)
    console.log(`[RAG]   Question: ${question}`)

    // ── Verify document exists and belongs to user ────────────────────────────
    const { data: doc, error: docErr } = await supabaseAdmin
      .from('documents')
      .select('id, indexing_status, filename')
      .eq('id', documentId)
      .eq('uploaded_by', userId)
      .single()

    if (docErr || !doc) {
      return NextResponse.json(
        { error: 'Document not found or access denied.' },
        { status: 404 }
      )
    }

    if (doc.indexing_status === 'pending') {
      return NextResponse.json({
        error: 'This document is queued for indexing. Please wait a moment and try again.',
      }, { status: 409 })
    }

    if (doc.indexing_status === 'processing') {
      return NextResponse.json({
        error: 'This document is currently being indexed. Please wait until indexing completes.',
      }, { status: 409 })
    }

    if (doc.indexing_status === 'failed') {
      return NextResponse.json({
        error: 'This document failed to index. Please use the "Retry Indexing" button to try again.',
      }, { status: 409 })
    }

    // ── Step 1: Embed the user's question ────────────────────────────────────
    let queryEmbedding: number[]
    try {
      queryEmbedding = await embedQuery(question)
    } catch (err: any) {
      const msg = err?.message ?? 'Embedding failed'
      console.error('[RAG] Embed error:', msg)
      return NextResponse.json(
        { error: `Failed to embed query: ${msg}` },
        { status: 503 }
      )
    }

    // ── Step 2: pgvector similarity search ───────────────────────────────────
    console.log(`[RAG]   Searching pgvector (top ${TOP_K})...`)

    const { data: chunks, error: searchErr } = await supabaseAdmin.rpc(
      'match_document_chunks',
      {
        p_document_id:     documentId,
        p_query_embedding: queryEmbedding,
        p_match_count:     TOP_K,
      }
    )

    if (searchErr) {
      console.error('[RAG] Vector search error:', searchErr.message)
      return NextResponse.json(
        { error: `Vector search failed: ${searchErr.message}` },
        { status: 500 }
      )
    }

    if (!chunks || chunks.length === 0) {
      console.warn('[RAG]   No chunks found for document.')
      return NextResponse.json({
        answer: "I couldn't find any relevant content in this document. " +
                'The document may not have been indexed yet or contains no text. ' +
                'Please try the "Retry Indexing" button.',
        citations: [],
        chunks: [],
      })
    }

    console.log(`[RAG]   Retrieved ${chunks.length} chunks`)

    // ── Step 3: Build RAG prompt ─────────────────────────────────────────────
    const prompt = buildRagPrompt(question, chunks)

    // ── Step 4: Generate answer via llama3 ───────────────────────────────────
    let answer: string
    try {
      answer = await generateAnswer(prompt)
    } catch (err: any) {
      const msg = err?.message ?? 'Generation failed'
      console.error('[RAG] Generation error:', msg)
      return NextResponse.json(
        { error: `Failed to generate answer: ${msg}` },
        { status: 503 }
      )
    }

    // ── Deduplicated page citations ───────────────────────────────────────────
    const citations = (chunks as any[])
      .filter((c) => c.page_number)
      .map((c) => `Page ${c.page_number}`)
      .filter((v: string, i: number, arr: string[]) => arr.indexOf(v) === i)

    console.log('[RAG] ========== Complete ==========\n')

    return NextResponse.json({ answer, citations, chunks })

  } catch (err: any) {
    console.error('[RAG] Unhandled error:', err)
    return NextResponse.json(
      { error: err?.message ?? 'Internal server error' },
      { status: 500 }
    )
  }
}
