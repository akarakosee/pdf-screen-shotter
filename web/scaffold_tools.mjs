import fs from 'fs';

function makeShell(name, title, icon, actionStr, handlerCall, eventHooks) {
  return `import { useCallback, useEffect, useState, useRef } from 'react';
import { validatePdfFile } from '../app/validators';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Button } from './ui/Button';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { ${icon}, Check, Download, RefreshCw } from 'lucide-react';
import { ResultPanel } from './ResultPanel';
import { JobController } from '../app/JobController';

type Phase = 'upload' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

export function ${name}Shell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);
  const controller = useRef<JobController | null>(null);

  useEffect(() => {
    controller.current = new JobController({
      onFileError: (_, msg) => {
        setToast({ kind: 'error', message: msg === 'encrypted' ? t.lockedFile : t.corruptFile });
        setPhase('upload');
      },
      ${eventHooks}
    });
    return () => {
      controller.current?.dispose();
    };
  }, [t]);

  const addFile = useCallback(async (incoming: File[]) => {
    if (incoming.length === 0) return;
    const f = incoming[0];
    const rejection = await validatePdfFile(f);
    if (rejection) {
      setToast({ kind: 'error', message: rejection === 'empty-file' ? t.emptyFile : t.notPdf });
      return;
    }
    setFile(f);
    
    // Auto-start for tools with no options
    setPhase('processing');
    ${handlerCall}
  }, [t]);

  const reset = () => {
    setPhase('upload');
    setFile(null);
    setOutput(null);
  };

  return (
    <div className="flex flex-col">
      {toast && (
        <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />
      )}

      {phase === 'upload' && (
        <>
          <div className="mb-6 text-center text-gray-800 dark:text-gray-200">
            <h1 className="text-3xl font-bold mb-2">${title}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t.features.${name}Desc || 'Process your PDF file securely.'}</p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700 p-6 md:p-8 transition-colors">
            <DropZone onFiles={addFile} disabled={false} multiple={false} accept=".pdf,application/pdf" />
          </div>
          <PrivacyLine t={t} />
        </>
      )}

      {phase === 'processing' && (
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700 p-12 text-center transition-colors">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t.processing}</h2>
          <p className="text-gray-500 dark:text-gray-400">{t.workingOnIt}</p>
        </div>
      )}

      {phase === 'done' && output && (
        <ResultPanel
          t={t}
          icon={<${icon} className="w-12 h-12 text-green-500 mb-4" />}
          title={t.ready}
          message={t.fileReady}
          onDownload={() => triggerDownload(output.blob, output.name)}
          onRestart={reset}
          downloadText={t.download}
          restartText={t.startOver}
        />
      )}
    </div>
  );
}
`;
}

const shells = [
  {
    name: 'RemoveAnnotations',
    title: 'Remove Annotations',
    icon: 'Stamp',
    handlerCall: 'controller.current?.runRemoveAnnotations(f);',
    eventHooks: `onRemoveAnnotationsDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: t.corruptFile });
        }
      }`
  },
  {
    name: 'PdfToWebp',
    title: 'PDF to WebP',
    icon: 'Download',
    handlerCall: 'controller.current?.runPdfToWebp(f);',
    eventHooks: `onPdfToWebpDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: t.corruptFile });
        }
      }`
  },
  {
    name: 'AutoCrop',
    title: 'Auto-Crop PDF',
    icon: 'Check',
    handlerCall: 'controller.current?.runAutoCrop(f);',
    eventHooks: `onAutoCropDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: t.corruptFile });
        }
      }`
  }
];

for (const s of shells) {
  fs.writeFileSync('./src/components/' + s.name + 'Shell.tsx', makeShell(s.name, s.title, s.icon, '', s.handlerCall, s.eventHooks));
}

// Generate Astro pages
function makeAstro(name, lang) {
  const i18nImport = lang === 'en' ? `import { en } from '../i18n/en';` : `import { tr } from '../../i18n/tr';`;
  const dict = lang === 'en' ? 'en' : 'tr';
  const headTitle = lang === 'en' ? `{${dict}.features.${name}} | PDF Screen Shotter` : `{${dict}.features.${name}} | PDF Screen Shotter`;
  
  return `---
import Layout from '${lang === 'en' ? '../layouts/Layout.astro' : '../../layouts/Layout.astro'}';
import { ${name}Shell } from '${lang === 'en' ? '../components' : '../../components'}/${name}Shell';
${i18nImport}
---

<Layout title=${headTitle} description={${dict}.features.${name}Desc}>
  <main class="min-h-[calc(100vh-80px)] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <${name}Shell client:load t={${dict}} />
    </div>
  </main>
</Layout>
`;
}

fs.writeFileSync('./src/pages/remove-annotations.astro', makeAstro('RemoveAnnotations', 'en'));
fs.writeFileSync('./src/pages/tr/remove-annotations.astro', makeAstro('RemoveAnnotations', 'tr'));
fs.writeFileSync('./src/pages/pdf-to-webp.astro', makeAstro('PdfToWebp', 'en'));
fs.writeFileSync('./src/pages/tr/pdf-to-webp.astro', makeAstro('PdfToWebp', 'tr'));
fs.writeFileSync('./src/pages/auto-crop.astro', makeAstro('AutoCrop', 'en'));
fs.writeFileSync('./src/pages/tr/auto-crop.astro', makeAstro('AutoCrop', 'tr'));

console.log('Shells and pages scaffolded.');
