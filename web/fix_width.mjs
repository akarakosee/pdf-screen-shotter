import fs from 'fs';
import path from 'path';

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Shell.tsx'));

for (const file of files) {
  const p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf8');
  if (content.includes('max-w-xl')) {
    content = content.replace(/max-w-xl/g, 'max-w-[800px]');
    fs.writeFileSync(p, content);
    console.log(`Updated ${file}`);
  }
}
