// CI check (ADR-001 action item 2): warn if the mupdf WASM gzip size exceeds 6 MB.
// Spike measurement was ~4.5 MB gzip. Non-fatal: prints a warning, exits 0.
import { promises as fs } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const BUDGET_BYTES = 6 * 1024 * 1024;
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

async function findWasm(dir) {
  const out = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await findWasm(p)));
    else if (e.name.endsWith('.wasm')) out.push(p);
  }
  return out;
}

const wasmFiles = await findWasm(path.join(root, 'dist'));
if (wasmFiles.length === 0) {
  console.log('wasm-budget: no .wasm files in dist/ (engine not integrated yet) — OK');
  process.exit(0);
}
for (const f of wasmFiles) {
  const raw = await fs.readFile(f);
  const gz = gzipSync(raw).length;
  const mb = (gz / 1024 / 1024).toFixed(2);
  if (gz > BUDGET_BYTES) {
    console.warn(`wasm-budget: WARNING — ${path.relative(root, f)} is ${mb} MB gzip (budget 6 MB)`);
  } else {
    console.log(`wasm-budget: ${path.relative(root, f)} is ${mb} MB gzip — within budget`);
  }
}
