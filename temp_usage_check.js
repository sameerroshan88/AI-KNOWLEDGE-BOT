const fs = require('fs')
const path = require('path')
const root = path.join(process.cwd(), 'src')
const exts = ['.ts', '.tsx', '.js', '.jsx']
const files = []
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (filePath.includes('node_modules') || filePath.includes('.next')) continue
      walk(filePath)
    } else if (exts.includes(path.extname(entry.name))) {
      files.push(filePath)
    }
  }
}
walk(root)
const index = new Map(files.map(f => [path.relative(root, f).replace(/\\/g, '/'), f]))
const candidates = [
  'app/actions/documents.ts',
  'app/supabase-test.tsx',
  'components/blocks/hero-sidebar.tsx',
  'components/blocks/pricing.tsx',
  'components/blocks/product-demo.tsx',
  'components/blocks/sidebar.tsx',
  'components/blocks/whatsapp-sidebar.tsx',
  'components/dashboard/DashboardTrustBar.tsx',
  'components/ui/ai-input.tsx',
  'components/ui/badge.tsx',
  'components/ui/cookie-banner.tsx',
  'components/ui/demo.tsx',
  'components/ui/hero.tsx',
  'components/ui/oauth-callback.tsx',
  'components/ui/separator.tsx',
  'components/ui/skeleton.tsx',
  'components/ui/social-links-demo.tsx',
  'components/ui/social-links.tsx',
  'components/ui/textarea.tsx',
  'components/ui/tooltip.tsx',
  'components/ui/v0-ai-chat.tsx',
  'components/ui/wave-path.tsx',
  'hooks/use-mobile.ts',
]
function filterImports(text, candidate) {
  const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(from\s+['"][^'"]*${escaped}[^'"]*['"])|(['"][^'"]*${escaped}[^'"]*['"])`, 'g')
  return regex.test(text)
}
for (const candidate of candidates) {
  const matches = []
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')
    if (content.includes(candidate) || filterImports(content, candidate)) {
      matches.push(path.relative(root, file).replace(/\\/g, '/'))
    }
  }
  console.log(`CANDIDATE: ${candidate}`)
  console.log(`  matches: ${matches.length}`)
  if (matches.length <= 20) matches.forEach(m => console.log(`    ${m}`))
  else console.log(`    ... ${matches.length} matches`) 
}
