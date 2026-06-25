const fs = require('fs');
const path = require('path');
const root = process.cwd();
const exts = ['.ts', '.tsx', '.js', '.jsx'];
const files = [];
function walk(dir) {
  for (const dirent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      if (p.includes('node_modules') || p.includes('.next')) continue;
      walk(p);
    } else if (exts.includes(path.extname(dirent.name))) {
      files.push(path.normalize(p));
    }
  }
}
walk(path.join(root, 'src'));
const imports = new Map();
const resolved = new Map();
const reImport = /import\s+(?:[^"']+from\s+)?["']([^"']+)["']/g;
const reRequire = /require\(["']([^"']+)["']\)/g;
for (const f of files) {
  const text = fs.readFileSync(f, 'utf8');
  const deps = [];
  let m;
  while ((m = reImport.exec(text)) !== null) deps.push(m[1]);
  reImport.lastIndex = 0;
  while ((m = reRequire.exec(text)) !== null) deps.push(m[1]);
  reRequire.lastIndex = 0;
  imports.set(f, deps);
  resolved.set(f, []);
}
for (const [f, deps] of imports) {
  const base = path.dirname(f);
  for (const dep of deps) {
    if (!dep.startsWith('.')) continue;
    const candidates = [];
    if (exts.some(ext => dep.endsWith(ext))) {
      candidates.push(path.normalize(path.join(base, dep)));
    } else {
      for (const ext of exts) candidates.push(path.normalize(path.join(base, dep + ext)));
      for (const fn of ['index.ts', 'index.tsx', 'index.js', 'index.jsx']) candidates.push(path.normalize(path.join(base, dep, fn)));
    }
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        if (!resolved.has(c)) resolved.set(c, []);
        resolved.get(c).push(f);
        break;
      }
    }
  }
}
const isRoute = f => f.startsWith(path.normalize(path.join(root, 'src', 'app'))) || f === path.normalize(path.join(root, 'src', 'app', 'layout.tsx'));
const unused = [];
for (const [f, incoming] of resolved) {
  if (incoming.length === 0 && !isRoute(f)) unused.push(f);
}
unused.sort();
console.log(unused.length + ' candidates');
unused.forEach(f => console.log(f));
