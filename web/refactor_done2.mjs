import fs from 'fs';

const files = [
  { name: 'ImgToPdfShell.tsx', var: 'output', blobStr: 'output?.blob', nameStr: 'output?.name' },
  { name: 'OrganizeShell.tsx', var: 'organizeResult', blobStr: 'organizeResult?.output', nameStr: 'organizeResult?.outputName' },
  { name: 'MergeShell.tsx', var: 'mergeResult', blobStr: 'mergeResult?.output', nameStr: 'mergeResult?.outputName' },
  { name: 'SplitShell.tsx', var: 'splitResult', blobStr: 'splitResult?.output', nameStr: 'splitResult?.outputName', onDown: '() => { if(splitResult?.output) triggerDownload(splitResult.output, splitResult.outputName || "split.pdf"); else if(splitResult?.outputUrl) { const a = document.createElement("a"); a.href = splitResult.outputUrl; a.download = splitResult.outputName; a.click(); } }' },
  { name: 'CompressShell.tsx', var: 'result', blobStr: 'result?.output', nameStr: 'result?.outputName' },
  { name: 'ExtractImagesShell.tsx', var: 'result', blobStr: 'result?.output', nameStr: 'result?.outputName', onDown: '() => { if(result?.output) triggerDownload(result.output, result.outputName || "images.zip"); }' }
];

for (const f of files) {
  const path = `src/components/${f.name}`;
  let content = fs.readFileSync(path, 'utf8');

  // Add import
  if (!content.includes('import { ResultPanel }')) {
    content = content.replace(/(import.*lucide-react';)/, `$1\nimport { ResultPanel } from './ResultPanel';`);
  }

  const doneRegex = /\{phase === 'done'[\s\S]*?(?=\n\s*<Toast|\n\s*<\/div>\n\s*\);\n\})/;
  
  let downloadFunc = f.onDown || `() => { if (${f.blobStr}) triggerDownload(${f.blobStr}, ${f.nameStr}); }`;
  
  const replacement = `{phase === 'done' && (
        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col items-center justify-center py-8 duration-700 w-full max-w-xl mx-auto">
          <ResultPanel
            t={t}
            result={{
              totalPages: 1,
              succeeded: 1,
              failed: [],
              durationMs: 0,
              output: ${f.blobStr},
              outputName: ${f.nameStr},
              cancelled: false
            }}
            skipped={[]}
            crossLink={null}
            onDownload={${downloadFunc}}
            onConvertMore={reset}
          />
        </div>
      )}`;

  if (doneRegex.test(content)) {
    content = content.replace(doneRegex, replacement);
    fs.writeFileSync(path, content);
    console.log(`Updated ${f.name}`);
  } else {
    console.log(`Could not find done block in ${f.name}`);
  }
}
