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
  if (line.startsWith('async function') && open > 1) {
    console.log(`Function started with open = ${open} at line ${i+1}`);
  }
}
