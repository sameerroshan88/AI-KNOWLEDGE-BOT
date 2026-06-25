# 🧠 AI Knowledge Base Bot

**A document-grounded chatbot platform that lets organizations upload PDFs and get instant, cited answers — built for Vidyashilp University and TechQRT.**

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20pgvector-3ECF8E) ![Ollama](https://img.shields.io/badge/Embeddings-nomic--embed--text-orange) ![OpenAI](https://img.shields.io/badge/Answers-OpenAI-412991)

[Repository](https://github.com/sameerroshan88/AI-KNOWLEDGE-BOT) • [Report Bug](https://github.com/sameerroshan88/AI-KNOWLEDGE-BOT/issues)

---

## 📋 Table of Contents
- [🌟 Overview](#-overview)
- [🎯 Key Features](#-key-features)
- [🏗️ System Architecture](#️-system-architecture)
- [📊 Database Schema](#-database-schema)
- [⚡ Quick Start](#-quick-start)
- [🔧 Environment Variables](#-environment-variables)
- [🎨 Application Walkthrough](#-application-walkthrough)
- [🧠 RAG Pipeline Details](#-rag-pipeline-details)
- [🔒 Security](#-security)
- [🐛 Known Issues & Lessons Learned](#-known-issues--lessons-learned)
- [📚 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)
- [⚖️ License](#️-license)
- [📧 Contact](#-contact)
- [⚠️ Disclaimer](#️-disclaimer)

---

## 🌟 Overview

**AI Knowledge Base Bot** lets users upload PDF documents and chat with them in plain English, instead of searching manually through files or waiting on support staff. Every answer is grounded in the actual document content and cited back to a specific page, so users can verify it at the source.

### 🎯 Who it's for
- **Vidyashilp University** — student-facing support for admissions, fees, courses, hostel and placement queries.
- **TechQRT** — internal/external knowledge base for product, process, and policy documentation.

### Problem it solves
Organizations field the same repetitive questions every day. Staff spend time searching through PDFs or answering the same queries repeatedly. This bot lets users self-serve sourced, accurate answers in seconds — 24/7, without a human in the loop.

---

## 🎯 Key Features

### 📄 Document Management
- Multiple upload entry points: dashboard file picker, drag-and-drop, the new-chat modal, and a dedicated upload page
- Files uploaded to Supabase Storage (`documents` bucket) with a real, persistent public URL
- Metadata (filename, URL, uploader, type) tracked in the `documents` table
- In-app PDF viewer alongside the chat panel

### 🤖 Retrieval-Augmented Generation (RAG)
- Automatic indexing pipeline: text extraction → chunking → embeddings → pgvector storage
- **Local embeddings via Ollama** (`nomic-embed-text`, 768 dimensions) — chunk content never leaves your own infrastructure to be embedded
- **OpenAI** used for grounded answer generation from retrieved chunks
- Vector similarity search via a Postgres RPC function (`match_document_chunks`) using cosine distance over an HNSW index
- **Page-level citations** on every answer (e.g. *"Cited from Chunk 1, Page 9"*), with clickable page chips

### 💬 Chat Experience
- Persistent chat history (`chat_history` table, linked to the source document)
- Suggested follow-up questions generated per document
- Status polling while a document is indexing, with graceful failure states (`indexing_status`, `indexing_error`)

### 👤 Account & Support
- Supabase Auth–based sign-in
- Account dropdown: profile, contact support, sign out
- "Contact support" surfaces the right organization's email — Vidyashilp University or TechQRT

### 🔒 Reliability & Security Foundations
- Row Level Security on `documents` and `document_embeddings`, scoped to `auth.uid()`
- Service-role inserts run only inside server actions, with a **graceful fallback** if the key isn't configured (storage upload still succeeds even if the metadata insert can't)
- No OpenAI or Supabase service-role secrets ever shipped to the client

---

## 🏗️ System Architecture

### Data Flow

```
User selects/drops a PDF
      ↓
Authenticate user (supabase.auth.getUser())
      ↓
Upload to Supabase Storage  (documents bucket)
      ↓
Get public URL
      ↓
Insert metadata → documents table  (server action, service-role key, graceful fallback)
      ↓
Indexing triggers  (status: pending → processing)
      ↓
Extract text (pdf-parse) → Chunk text (tracking page numbers)
      ↓
Generate embeddings per chunk → Ollama (nomic-embed-text, 768-dim)
      ↓
Store chunks + vectors → document_embeddings table  (pgvector, HNSW index)
      ↓
documents.indexing_status → completed  (or failed, with indexing_error set)
      ↓
User asks a question
      ↓
Embed the question (Ollama) → match_document_chunks() RPC → top-k relevant chunks
      ↓
Chunks + question → OpenAI chat completion → cited answer
      ↓
Answer + page citations → saved to chat_history
```

### Repository Structure (as it exists today)

```
AI-KNOWLEDGE-BOT/
├── public/                             # Static assets
├── src/
│   └── app/
│       ├── actions/
│       │   └── documents.ts            # Server action: insertDocumentAsServer()
│       │                                #  - service-role insert, graceful RLS fallback
│       ├── dashboard/
│       │   ├── page.tsx                # Main dashboard: upload handlers, chat panel
│       │   └── upload/
│       │       └── page.tsx            # Dedicated upload page
│       └── ...                         # Chat, auth, API routes
├── schema.sql                          # Full DB schema — run manually in SQL Editor
├── SUPABASE_SETUP.md                   # Service-role key setup instructions
├── FIXES_APPLIED.md                    # Upload-flow fix log
├── AUTH_TESTING_RESULTS.md             # Auth flow test notes
├── brand-name-transparent.png          # Logo asset
├── next.config.ts
├── package.json
└── README.md
```

### Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js 16, React 19, TypeScript 5 | App Router |
| Styling | Tailwind CSS 4, Radix UI primitives | Dialog, dropdown, accordion, tooltip, etc. |
| Animation | Framer Motion, GSAP, Three.js | Landing/marketing page polish |
| Auth & DB | Supabase (Auth, Postgres, Storage) | `@supabase/supabase-js` |
| Vector Store | pgvector (HNSW index, cosine similarity) | `VECTOR(768)` |
| Embeddings | Ollama — `nomic-embed-text` | Local, 768-dim — **not** OpenAI embeddings |
| Answer Generation | OpenAI SDK | Used for grounded chat completions |
| PDF Parsing | `pdf-parse` | Server-side text extraction |
| File Upload UI | `react-dropzone` | Drag-and-drop |

> Note: `package.json`'s internal name field is `chatpdf-website` — a leftover working title from earlier in the project; the product itself is the AI Knowledge Base Bot.

---

## 📊 Database Schema

Defined in [`schema.sql`](https://github.com/sameerroshan88/AI-KNOWLEDGE-BOT/blob/main/schema.sql), run manually in the Supabase SQL Editor.

### `documents`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| filename | text | Original filename |
| file_url | text | Public Supabase Storage URL |
| document_type | text | e.g. `pdf` |
| uploaded_by | uuid | References the authenticated user |
| uploaded_at | timestamptz | Upload timestamp |
| indexing_status | varchar(50) | `pending` (default) → `processing` → `completed` / `failed` |
| indexing_error | text | Populated only when indexing fails |

### `document_embeddings`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key, `gen_random_uuid()` |
| document_id | uuid | References `documents.id`, `ON DELETE CASCADE` |
| chunk_index | int | Order of chunk within the document |
| page_number | int | Nullable — powers citations |
| content | text | The chunk text |
| embedding | `VECTOR(768)` | nomic-embed-text dimension — **not** 1536 |
| created_at | timestamptz | Default `now()` |

Indexes: a lookup index on `document_id`, plus an **HNSW index** (`vector_cosine_ops`) for fast similarity search.

### `chat_history`
| Column | Type | Notes |
|---|---|---|
| document_id | uuid | References `documents.id`, `ON DELETE CASCADE` (added via migration in `schema.sql`) |
| *(other existing columns — see live table)* | | |

### RPC: `match_document_chunks`
```sql
match_document_chunks(p_document_id UUID, p_query_embedding VECTOR(768), p_match_count INT DEFAULT 5)
```
Returns the top-`k` chunks for a document ordered by cosine similarity to the query embedding. Called from the Next.js API layer at query time.

### Row Level Security
`document_embeddings` has RLS enabled — a user can only `SELECT` embeddings belonging to documents they uploaded (`d.uploaded_by = auth.uid()`).

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- A Supabase project (Postgres + Storage + Auth enabled, `vector` extension available)
- [Ollama](https://ollama.com) installed locally, with the embedding model pulled:
  ```bash
  ollama pull nomic-embed-text
  ```
- An OpenAI API key

### 1. Clone the repository
```bash
git clone https://github.com/sameerroshan88/AI-KNOWLEDGE-BOT.git
cd AI-KNOWLEDGE-BOT
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create `.env.local` (see [Environment Variables](#-environment-variables) below).

### 4. Apply the database schema
Open the Supabase SQL Editor for your project and run the entire contents of `schema.sql`.

### 5. Start Ollama (if not already running) and the dev server
```bash
ollama serve
npm run dev
```
The app will be available at `http://localhost:3000`.

---

## 🔧 Environment Variables

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Public anon key, used with RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | Used in `src/app/actions/documents.ts` to insert metadata, bypassing RLS. Optional — uploads still succeed without it (Storage upload completes; only the metadata insert is skipped) |
| `OPENAI_API_KEY` | **Server only** | Used for answer generation from retrieved chunks |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` must never carry the `NEXT_PUBLIC_` prefix and must never be imported into a client component.

> 📝 If Ollama runs on a non-default host/port, also check whether your code expects an `OLLAMA_BASE_URL` (or similar) env var — confirm the exact name against `src/app/actions/` / your embeddings helper before deploying.

---

## 🎨 Application Walkthrough

### 1. 🏠 Dashboard
Shows uploaded documents in a sidebar, with an embedded PDF viewer and chat panel side-by-side.

### 2. 📤 Upload Flow
User selects or drops a PDF → authenticate → upload to Storage → get public URL → insert metadata via `insertDocumentAsServer()` server action (graceful fallback if the service-role key isn't configured) → indexing kicks off → dashboard polls `indexing_status` until `completed` or `failed`.

### 3. 💬 Chat Flow
User asks a question → question embedded via Ollama → `match_document_chunks` RPC retrieves top matches → chunks passed to OpenAI for a grounded, cited answer → saved to `chat_history`.

### 4. 👤 Account Menu
Top-right avatar → **Account**, **Contact support**, **Sign out**. Contact support shows the relevant organization's email.

---

## 🧠 RAG Pipeline Details

### Chunking
Extracted PDF text is split into chunks while tracking page numbers, so every chunk stored in `document_embeddings` can be cited back to a specific page.

### Embeddings — local, not OpenAI
Embeddings are generated by **Ollama's `nomic-embed-text`** model (768 dimensions) rather than an OpenAI embedding model. This keeps document content embedding entirely on infrastructure you control, and avoids per-token embedding costs at indexing time.

### Retrieval
User questions are embedded the same way, then matched against stored chunks via the `match_document_chunks` Postgres function — a cosine-similarity search over the HNSW index, scoped to the specific `document_id` being chatted with.

### Answer Generation — OpenAI
Retrieved chunks are passed to OpenAI as grounding context for the final answer, which is returned with page citations rendered as clickable chips in the UI.

### Reliability
- `indexing_status` and `indexing_error` columns mean a failed indexing run is visible and diagnosable rather than leaving a document stuck in limbo.
- Upload has a documented graceful-degradation path: if the service-role key is missing or the metadata insert fails, the file still lands in Storage and the user still sees a success state — only the DB metadata step is skipped.

---

## 🔒 Security

- RLS enabled on `document_embeddings`, scoped to `auth.uid()` via the owning `documents` row.
- `documents` also has RLS — this is *why* a service-role key is needed server-side for inserts (see `SUPABASE_SETUP.md`).
- Service-role key and OpenAI key are used exclusively inside server actions / API routes — never in client components.
- Storage uploads are tied to the authenticated user (`supabase.auth.getUser()`) at upload time.

---

## 🐛 Known Issues & Lessons Learned

A running log of real issues hit during development, kept here so fixes aren't accidentally reverted.

| Issue | Root Cause | Fix |
|---|---|---|
| RLS policy violation on document insert | `documents` table RLS blocked client-side inserts | Server action (`insertDocumentAsServer`) using the service-role key, with graceful fallback if the key is absent |
| Dashboard used fake local uploads | `URL.createObjectURL()` instead of real Storage upload | All upload entry points (file picker, drag-and-drop, new-chat modal, upload page) now use real Supabase Storage |
| Chat / document state lost on navigation | Relied on in-memory state instead of persisted rows | Chat and document status are read from `chat_history` / `documents` on load, not just held in React state |
| Uploaded files showed timestamp-prefixed names | Upload path used `${timestamp}-${filename}` to avoid collisions | Moved toward a stable, user-scoped storage path with the clean original filename |
| Document stuck in infinite indexing-status polling | Indexing failures weren't written back to `documents` | `indexing_status` / `indexing_error` columns added; failures are now recorded instead of leaving status stuck at `pending` |
| `pdf-parse` build error (`Export default doesn't exist`) | ESM/CJS export mismatch with the bundler | Resolved by adjusting the import / pinning a compatible `pdf-parse` version |

---

## 📚 Documentation
- `README.md` — this file
- `schema.sql` — full database schema, run manually in the Supabase SQL Editor
- `SUPABASE_SETUP.md` — how to obtain and configure the service-role key
- `FIXES_APPLIED.md` — detailed log of the upload-flow fixes
- `AUTH_TESTING_RESULTS.md` — authentication flow test notes

---

## 🤝 Contributing

```bash
# Fork and clone
git clone https://github.com/sameerroshan88/AI-KNOWLEDGE-BOT.git
cd AI-KNOWLEDGE-BOT

# Create a feature branch
git checkout -b feature/your-feature

# Install and run
npm install
npm run dev

# Commit and push
git commit -m "Add your feature"
git push origin feature/your-feature

# Open a Pull Request
```

---

## ⚖️ License

This repository does not currently include a `LICENSE` file. Until one is added, all rights are reserved by default under standard copyright. If you'd like this project to be open source, the MIT License is a common, permissive choice for a project like this:

```
MIT License

Copyright (c) 2026 Shaik Sameer Roshan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 📧 Contact

- **GitHub:** [@sameerroshan88](https://github.com/sameerroshan88)
- **Repository:** [AI-KNOWLEDGE-BOT](https://github.com/sameerroshan88/AI-KNOWLEDGE-BOT)
- **Vidyashilp University support:** admission@vidyashilp.edu.in
- **TechQRT support:** info@techqrt.com
- **Issues:** [Report a bug](https://github.com/sameerroshan88/AI-KNOWLEDGE-BOT/issues)

---

## ⚠️ Disclaimer

This platform answers questions based only on the content of documents uploaded by users. It is not a substitute for official communication from Vidyashilp University or TechQRT — answers should be verified against original source documents for any decision with academic, financial, or legal consequences. Uploaded documents may contain personal data; ensure usage complies with your organization's data protection obligations.

---

Made for Vidyashilp University & TechQRT by [Shaik Sameer Roshan](https://github.com/sameerroshan88)

[⬆ Back to Top](#-ai-knowledge-base-bot)
