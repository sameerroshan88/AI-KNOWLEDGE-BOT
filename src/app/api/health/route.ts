/**
 * GET /api/health
 *
 * Verifies the entire local RAG pipeline is operational.
 * Checks:
 *   ✓ Ollama is reachable
 *   ✓ llama3 model is loaded
 *   ✓ nomic-embed-text model is loaded
 *   ✓ document_embeddings table exists and RPC function works
 *   ✓ pgvector extension is enabled
 */

import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabaseAdmin'
import { ollama } from '@/lib/ollama'

export async function GET() {
  const checks: Record<string, { ok: boolean; detail: string }> = {}

  // ── 1. Ollama connection + model availability ──────────────────────────────
  try {
    const list = await ollama.list()
    const names = list.models.map((m) => m.name)

    checks['ollama_connection'] = {
      ok:     true,
      detail: `Ollama reachable — ${names.length} model(s): ${names.join(', ')}`,
    }

    checks['llama3'] = {
      ok:     names.some((n) => n.startsWith('llama3')),
      detail: names.some((n) => n.startsWith('llama3'))
        ? 'llama3 available ✓'
        : 'llama3 NOT found — run: ollama pull llama3',
    }

    checks['nomic_embed_text'] = {
      ok:     names.some((n) => n.startsWith('nomic-embed-text')),
      detail: names.some((n) => n.startsWith('nomic-embed-text'))
        ? 'nomic-embed-text available ✓'
        : 'nomic-embed-text NOT found — run: ollama pull nomic-embed-text',
    }
  } catch (err: any) {
    const detail = err?.message?.includes('ECONNREFUSED')
      ? 'Ollama is not running — start with: ollama serve'
      : (err?.message ?? 'Unknown error')

    checks['ollama_connection']  = { ok: false, detail }
    checks['llama3']             = { ok: false, detail: 'Skipped — Ollama offline' }
    checks['nomic_embed_text']   = { ok: false, detail: 'Skipped — Ollama offline' }
  }

  // ── 2. pgvector + document_embeddings table + RPC ─────────────────────────
  try {
    const { error } = await supabaseAdmin.rpc('match_document_chunks', {
      p_document_id:     '00000000-0000-0000-0000-000000000000',
      p_query_embedding: new Array(768).fill(0),
      p_match_count:     1,
    })

    const isOk = !error

    checks['pgvector_table_rpc'] = {
      ok:     isOk,
      detail: isOk
        ? 'pgvector enabled, document_embeddings table ready, RPC function works ✓'
        : `Database error: ${error.message}. Please run schema.sql in Supabase SQL Editor.`,
    }
  } catch (err: any) {
    checks['pgvector_table_rpc'] = {
      ok:     false,
      detail: err?.message ?? 'Database connectivity error',
    }
  }

  const allOk = Object.values(checks).every((c) => c.ok)

  return NextResponse.json(
    { status: allOk ? 'healthy' : 'degraded', checks },
    { status: allOk ? 200 : 503 }
  )
}
