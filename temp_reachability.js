const fs = require('fs')
const path = require('path')
const root = path.join(process.cwd(), 'src')
const exts = ['.ts', '.tsx', '.js', '.jsx']
const allFiles = []
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (p.includes('node_modules') || p.includes('.next')) continue
      walk(p)
    } else if (exts.includes(path.extname(entry.name))) {
      allFiles.push(p)
    }
  }
}
walk(root)
const fileIndex = new Map(allFiles.map(f => [path.relative(root, f).replace(/\\/g, '/'), f]))
const importRe = /(?:import\s+(?:[^"']+?from\s*)?|export\s+(?:[^"']+?from\s*)?|require\()(["'])([^"'\)]+)\1/g
const graph = new Map()
for (const rel of fileIndex.keys()) {
  const abs = fileIndex.get(rel)
  const text = fs.readFileSync(abs, 'utf8')
  const deps = new Set()
  let m
  while ((m = importRe.exec(text))) {
    deps.add(m[2])
  }
  graph.set(rel, Array.from(deps))
}
function resolveImport(from, imp) {
  if (imp.startsWith('http') || imp.startsWith('data:')) return null
  if (imp.startsWith('@/')) {
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
    for (const c of candidates) {
      const norm = c.replace(/\\/g, '/')
      if (fileIndex.has(norm)) return norm
    }
    return null
  }
  if (imp.startsWith('./') || imp.startsWith('../')) {
    const base = path.dirname(from)
    const target = path.normalize(path.join(base, imp)).replace(/\\/g, '/')
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
      if (fileIndex.has(norm)) return norm
    }
    return null
  }
  return null
}
for (const [rel, deps] of graph) {
  const resolvedDeps = deps.map(dep => resolveImport(rel, dep)).filter(Boolean)
  graph.set(rel, resolvedDeps)
}
const entrypoints = Array.from(fileIndex.keys()).filter(rel => {
  if (rel === 'app/page.tsx') return true
  if (rel.startsWith('app/') && (rel.endsWith('/page.tsx') || rel.endsWith('/route.ts') || rel.endsWith('/layout.tsx') || rel.endsWith('/loading.tsx'))) return true
  if (path.dirname(rel) === 'app' && rel.endsWith('.tsx') && rel !== 'app/layout.tsx' && rel !== 'app/page.tsx') return true
  return false
})
const reachable = new Set(entrypoints)
const stack = [...entrypoints]
while (stack.length) {
  const cur = stack.pop()
  for (const dep of graph.get(cur) || []) {
    if (!reachable.has(dep)) {
      reachable.add(dep)
      stack.push(dep)
    }
  }
}
const unreachable = Array.from(fileIndex.keys()).filter(f => !reachable.has(f))
console.log('totalFiles', fileIndex.size)
console.log('entryFiles', entrypoints.length, entrypoints.sort().join(', '))
console.log('reachableFiles', reachable.size)
console.log('unreachableFiles', unreachable.length)
console.log('---UNREACHABLE---')
unreachable.sort().forEach(f => console.log(f))
const incoming = new Map()
for (const [from, deps] of graph) {
  for (const dep of deps) {
    if (!incoming.has(dep)) incoming.set(dep, [])
    incoming.get(dep).push(from)
  }
}
const noIncoming = Array.from(fileIndex.keys()).filter(f => !incoming.has(f) && !entrypoints.includes(f))
console.log('---NO INCOMING---')
noIncoming.sort().forEach(f => console.log(f))
