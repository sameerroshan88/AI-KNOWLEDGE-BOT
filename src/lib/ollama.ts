/**
 * src/lib/ollama.ts
 *
 * Shared Ollama helpers for the RAG chat pipeline.
 * - embedQuery:       embed a single user question (nomic-embed-text)
 * - buildRagPrompt:   assemble system + context + question prompt
 * - generateAnswer:   call llama3 for the final answer
 */

import { Ollama } from 'ollama'

const OLLAMA_HOST = process.env.OLLAMA_HOST ?? 'http://localhost:11434'
const EMBED_MODEL = 'nomic-embed-text'
const CHAT_MODEL  = 'llama3'

export const ollama = new Ollama({ host: OLLAMA_HOST })

// ─── Embed a single query string (768-dim) ────────────────────────────────────
export async function embedQuery(text: string): Promise<number[]> {
  console.log('[OLLAMA]   Embedding query...')

  const response = await ollama.embed({
    model: EMBED_MODEL,
    input: [text],
  })

  if (!response.embeddings || response.embeddings.length === 0) {
    throw new Error('nomic-embed-text returned no embeddings for query')
  }

  return response.embeddings[0]
}

// ─── Build RAG prompt ─────────────────────────────────────────────────────────
export function buildRagPrompt(
  question: string,
  chunks:   Array<{ content: string; page_number: number | null; chunk_index: number }>
): string {
  const context = chunks
    .map((c, i) => {
      const page = c.page_number ? ` [Page ${c.page_number}]` : ''
      return `--- Chunk ${i + 1}${page} ---\n${c.content}`
    })
    .join('\n\n')

  return `You are a helpful AI assistant. Answer the user's question based ONLY on the document context provided below.
If the answer is not found in the context, say: "I couldn't find that information in the document."
Do not make up or infer information beyond what is stated. Be concise and cite page numbers where available.

=== DOCUMENT CONTEXT ===
${context}

=== USER QUESTION ===
${question}

=== ANSWER ===`
}

// ─── Generate answer via llama3 ───────────────────────────────────────────────
export async function generateAnswer(prompt: string): Promise<string> {
  console.log(`[OLLAMA]   Calling ${CHAT_MODEL}...`)

  const response = await ollama.generate({
    model:  CHAT_MODEL,
    prompt: prompt,
    stream: false,
    options: {
      temperature: 0.1,    // low temperature = factual, minimal hallucination
      num_predict: 1024,
    },
  })

  if (!response.response) {
    throw new Error(`${CHAT_MODEL} returned an empty response`)
  }

  console.log('[OLLAMA]   Answer received.')
  return response.response.trim()
}
