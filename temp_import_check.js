const fs = require('fs');
const path = require('path');
const root = process.cwd();
const file = path.join(root, 'src', 'app', 'page.tsx');
const text = fs.readFileSync(file, 'utf8');
const reImport = /import\s+(?:[^"']+from\s+)?["']([^"']+)["']/g;
let m;
console.log('--- IMPORTS in app/page.tsx ---');
while ((m = reImport.exec(text)) !== null) {
  console.log(m[1]);
}
console.log('--- END ---');
