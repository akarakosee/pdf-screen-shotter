import fs from 'fs';

const files = [
  'ProtectShell.tsx',
  'SignShell.tsx',
  'WatermarkShell.tsx',
  'FlattenShell.tsx',
  'NumberShell.tsx',
  'UnlockShell.tsx',
  'ExtractShell.tsx',
  'SanitizeShell.tsx'
];

for (const file of files) {
  const path = `src/components/${file}`;
  let content = fs.readFileSync(path, 'utf8');

  // Add import
  if (!content.includes('import { ResultPanel }')) {
    content = content.replace(/(import.*lucide-react';)/, `$1\nimport { ResultPanel } from './ResultPanel';`);
  }

  // Find phase === 'done' block
  // We match from {phase === 'done' until just before <Toast or </div>\n  );
  const doneRegex = /\{phase === 'done'[\s\S]*?(?=\n\s*<Toast|\n\s*<\/div>\n\s*\);\n\})/;
  
  const replacement = `{phase === 'done' && (
        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col items-center justify-center py-8 duration-700 w-full max-w-xl mx-auto">
          <ResultPanel
            t={t}
            result={{
              totalPages: 1,
              succeeded: 1,
              failed: [],
              durationMs: 0,
              output: output?.blob,
              outputName: output?.name,
              cancelled: false
            }}
            skipped={[]}
            crossLink={null}
            onDownload={() => { if (output) triggerDownload(output.blob, output.name); }}
            onConvertMore={reset}
          />
        </div>
      )}`;

  if (doneRegex.test(content)) {
    content = content.replace(doneRegex, replacement);
    fs.writeFileSync(path, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`Could not find done block in ${file}`);
  }
}
