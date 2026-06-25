const fs = require('fs')
const path = require('path')
const root = path.join(process.cwd(), 'src')
const all = []
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (p.includes('node_modules') || p.includes('.next')) continue
      walk(p)
    } else if (/\.(ts|tsx|js|jsx)$/.test(ent.name)) {
      all.push(p)
    }
  }
}
walk(root)
const idx = new Map(all.map(f => [path.relative(root, f).replace(/\\/g, '/'), f]))
const imp = '@/components/blocks/site-nav'
const target = imp.slice(2)
const candidates = [
  target,
  target + '.ts',
  target + '.tsx',
  target + '.js',
  target + '.jsx',
  path.join(target, 'index.ts'),
  path.join(target, 'index.tsx'),
  path.join(target, 'index.js'),
  path.join(target, 'index.jsx'),
]
console.log('target', target)
for (const c of candidates) {
  const norm = c.replace(/\\/g, '/')
  console.log('candidate', norm, 'exists', idx.has(norm))
}
console.log('index entries for site-nav:', [...idx.keys()].filter(k => k.includes('site-nav')))
