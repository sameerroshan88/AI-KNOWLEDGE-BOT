import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '.env.local')

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const idx = line.indexOf('=')
    if (idx > 0) {
      const k = line.substring(0, idx).trim()
      const v = line.substring(idx + 1).trim()
      process.env[k] = v
    }
  })
}

async function run() {
  const { indexDocument } = await import('./src/lib/indexer')
  const { createClient } = await import('@supabase/supabase-js')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  console.log('Fetching documents from Supabase...')
  const { data: docs, error: fetchErr } = await supabase
    .from('documents')
    .select('id, filename, indexing_status')
    .limit(5)

  if (fetchErr) {
    console.error('Fetch error:', fetchErr)
    process.exit(1)
  }

  console.log('Found documents:', docs)

  const doc = docs.find(d => d.filename.includes('Report') || d.filename === 'IMF.pdf')
  if (!doc) {
    console.error('No suitable document found to test indexer.')
    process.exit(1)
  }

  console.log(`\n>>> Indexing document: ${doc.filename} (ID: ${doc.id})`)
  const result = await indexDocument(doc.id, { force: true })
  console.log('Indexing result:', result)

  // Wait a moment for DB updates
  await new Promise(r => setTimeout(r, 2000))

  // Run verification queries
  console.log('\n============================================================')
  console.log('Running SQL Verification Queries...')
  console.log('============================================================')

  const { count, error: countErr } = await supabase
    .from('document_embeddings')
    .select('*', { count: 'exact', head: true })
    .eq('document_id', doc.id)

  if (countErr) {
    console.error('Failed to get embeddings count:', countErr)
  } else {
    console.log(`SELECT COUNT(*) FROM document_embeddings WHERE document_id = '${doc.id}';`)
    console.log(`=> Count: ${count} (Expected: > 0)`)
  }

  const { data: chunks, error: chunkErr } = await supabase
    .from('document_embeddings')
    .select('document_id, chunk_index, page_number, content')
    .eq('document_id', doc.id)
    .order('chunk_index', { ascending: true })

  if (chunkErr) {
    console.error('Failed to query chunks:', chunkErr)
  } else {
    console.log(`\nSELECT chunk_index, page_number, LEFT(content, 60) FROM document_embeddings LIMIT 3:`)
    chunks.slice(0, 3).forEach(c => {
      console.log(`  - Chunk ${c.chunk_index} (Page ${c.page_number}): "${c.content.replace(/\n/g, ' ').substring(0, 60)}..."`)
    })

    // Group check
    console.log('\nSELECT document_id, COUNT(*) FROM document_embeddings GROUP BY document_id;')
    const counts = chunks.reduce((acc, c) => {
      acc[c.document_id] = (acc[c.document_id] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    console.log('=> Grouped count:', counts)
  }

  // Check the document status again
  const { data: finalDoc } = await supabase
    .from('documents')
    .select('indexing_status, indexing_error')
    .eq('id', doc.id)
    .single()

  console.log('\nFinal Document Status in DB:', finalDoc)
}

run().catch(console.error)
