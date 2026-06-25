const fs = require('fs')
const path = require('path')
const root = path.join(process.cwd(), 'src')
const file = path.join(root, 'app', 'page.tsx')
const text = fs.readFileSync(file, 'utf8')
console.log('file:', file)
const importRe = /(?:import\s+(?:[^"']+?from\s*)?|export\s+(?:[^"']+?from\s*)?|require\()(["'])([^"'\)]+)\1/g
let m
while ((m = importRe.exec(text))) {
  console.log('import', m[2])
}
const all = []
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (p.includes('node_modules') || p.includes('.next')) continue
      walk(p)
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      all.push(p)
    }
  }
}
walk(root)
const idx = new Map(all.map(f => [path.relative(root, f).replace(/\\/g, '/'), f]))
function resolveImport(from, imp) {
  if (imp.startsWith('http') || imp.startsWith('data:')) return null
  if (imp.startsWith('@/')) {
    const target = imp.slice(3)
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
    for (const c of candidates) {
      const norm = c.replace(/\\/g, '/')
      if (idx.has(norm)) return norm
    }
  }
  if (imp.startsWith('./') || imp.startsWith('../')) {
    const dir = path.dirname(from)
    const target = path.normalize(path.join(dir, imp)).replace(/\\/g, '/')
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
    for (const c of candidates) {
      const norm = c.replace(/\\/g, '/')
      if (idx.has(norm)) return norm
    }
  }
  return null
}
const from = 'app/page.tsx'
importRe.lastIndex = 0
while ((m = importRe.exec(text))) {
  const resolved = resolveImport(from, m[2])
  console.log('resolve', m[2], '=>', resolved)
}
console.log('target exists', idx.has('components/blocks/site-nav.tsx'))
console.log('target file', idx.get('components/blocks/site-nav.tsx'))
