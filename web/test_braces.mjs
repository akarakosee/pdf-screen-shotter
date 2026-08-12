import fs from 'fs';
const text = fs.readFileSync('src/workers/render.worker.ts', 'utf8');
let open = 0;
const lines = text.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let c of line) {
    if (c === '{') open++;
    if (c === '}') open--;
  }
  if (open < 0) {
    console.log(`Extra close brace at line ${i + 1}`);
    open = 0;
  }
}
console.log(`Final open braces: ${open}`);
