-- =======================================================================
-- AI Knowledge Base Bot — Complete Database Schema
-- Run this ENTIRE script in Supabase SQL Editor
-- nomic-embed-text produces 768-dimensional vectors (NOT 1536 / OpenAI)
-- =======================================================================

-- ── 1. Enable pgvector ──────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

-- ── 2. Add indexing columns to documents (safe — skips if already present) ─
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS indexing_status VARCHAR(50) DEFAULT 'pending' NOT NULL;

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS indexing_error TEXT;

-- ── 3. Drop old embeddings table (was VECTOR(1536) = OpenAI dims) ──────────
--       We need VECTOR(768) for nomic-embed-text.
--       CASCADE drops dependent indexes & policies automatically.
DROP TABLE IF EXISTS public.document_embeddings CASCADE;

-- ── 4. Recreate document_embeddings with 768 dimensions ────────────────────
CREATE TABLE public.document_embeddings (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  UUID        NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  chunk_index  INT         NOT NULL,
  page_number  INT,
  content      TEXT        NOT NULL,
  embedding    VECTOR(768) NOT NULL,   -- nomic-embed-text = 768 dims
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ── 5. Lookup index: fast filter by document_id ────────────────────────────
CREATE INDEX IF NOT EXISTS idx_document_embeddings_document_id
  ON public.document_embeddings (document_id);

-- ── 6. HNSW index for fast cosine similarity (best for query-time speed) ───
CREATE INDEX IF NOT EXISTS document_embeddings_hnsw_idx
  ON public.document_embeddings
  USING hnsw (embedding vector_cosine_ops);

-- ── 7. Enable RLS ──────────────────────────────────────────────────────────
ALTER TABLE public.document_embeddings ENABLE ROW LEVEL SECURITY;

-- ── 8. RLS policy: users read only their own document embeddings ────────────
DROP POLICY IF EXISTS "Users can view embeddings of their own documents"
  ON public.document_embeddings;

CREATE POLICY "Users can view embeddings of their own documents"
  ON public.document_embeddings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id            = public.document_embeddings.document_id
        AND d.uploaded_by   = auth.uid()
    )
  );

-- ── 9. RPC helper: vector similarity search called from Next.js API ─────────
--       Returns top-K chunks ordered by cosine similarity to query embedding.
CREATE OR REPLACE FUNCTION match_document_chunks(
  p_document_id      UUID,
  p_query_embedding  VECTOR(768),
  p_match_count      INT DEFAULT 5
)
RETURNS TABLE (
  id           UUID,
  document_id  UUID,
  chunk_index  INT,
  page_number  INT,
  content      TEXT,
  similarity   FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    de.id,
    de.document_id,
    de.chunk_index,
    de.page_number,
    de.content,
    1 - (de.embedding <=> p_query_embedding) AS similarity
  FROM public.document_embeddings de
  WHERE de.document_id = p_document_id
  ORDER BY de.embedding <=> p_query_embedding
  LIMIT p_match_count;
END;
$$;

-- ── 10. Optional/Migration: add document_id to chat_history ─────────────────
ALTER TABLE public.chat_history
  ADD COLUMN IF NOT EXISTS document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_chat_history_document_id
  ON public.chat_history(document_id);

-- ── 11. Verification queries (run after schema to confirm success) ──────────
-- SELECT COUNT(*) FROM document_embeddings;
-- SELECT document_id, COUNT(*) FROM document_embeddings GROUP BY document_id;
-- SELECT LEFT(content,100) FROM document_embeddings LIMIT 5;
