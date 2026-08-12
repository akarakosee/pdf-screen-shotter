import fs from 'fs';

function makeShell(name, handlerCall, eventHooks) {
  return `import { useCallback, useEffect, useState, useRef } from 'react';
import { validatePdfFile } from '../app/validators';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
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
        setToast({ kind: 'error', message: msg === 'encrypted' ? t.encryptedFile : t.corruptFile });
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
    setPhase('processing');
    ${handlerCall}
  }, [t]);

  const reset = useCallback(() => {
    setFile(null);
    setOutput(null);
    setPhase('upload');
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {toast && (
        <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />
      )}

      {phase === 'upload' && (
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone t={t} hasFiles={false} onFiles={addFile} multiple={false} />
          <PrivacyLine t={t} />
        </div>
      )}

      {phase === 'processing' && (
        <div className="phase-enter flex flex-col gap-3">
          <div className="flex items-baseline justify-between text-xs text-ink-muted dark:text-ink-muted-dark">
            <span>{t.converting || 'Processing...'}</span>
          </div>
          <div className="h-1 overflow-hidden rounded-lg bg-surface border dark:bg-surface-dark">
            <div className="h-full w-full origin-left animate-custom-pulse bg-ink dark:bg-ink-dark" />
          </div>
        </div>
      )}

      {phase === 'done' && output && (
        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col items-center justify-center py-8 duration-700 w-full mx-auto">
          <ResultPanel
            t={t}
            title={t.doneTitle || 'Done'}
            onDownload={() => triggerDownload(output.blob, output.name)}
            onRestart={reset}
          />
        </div>
      )}
    </div>
  );
}
`;
}

fs.writeFileSync('./src/components/ExtractJavascriptShell.tsx', makeShell('ExtractJavascript', 'controller.current?.runExtractJavascript(f);', `onExtractJavascriptDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: 'No JavaScript found in this document.' });
        }
      }`));

fs.writeFileSync('./src/components/SplitBookmarksShell.tsx', makeShell('SplitBookmarks', 'controller.current?.runSplitBookmarks(f);', `onSplitBookmarksDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: 'Could not find any Table of Contents (Bookmarks) to split by.' });
        }
      }`));

fs.writeFileSync('./src/components/SplitBlankShell.tsx', makeShell('SplitBlank', 'controller.current?.runSplitBlank(f);', `onSplitBlankDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: 'Could not find any blank pages to split by.' });
        }
      }`));

// Update toolCopy.ts
const newCopies = `
export const extractJavascriptCopy = {
  en: {
    title: 'Extract JavaScript — malware analysis',
    description: 'Scan and extract embedded JavaScript code from PDF documents for security and malware analysis.',
    h1: 'PDF JavaScript Extractor',
    tagline: 'The ultimate tool for cyber security analysts.',
    howToName: 'How to extract JavaScript from PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select a potentially malicious PDF.' },
      { name: 'Scan', text: 'We scan dictionaries and actions for JS.' },
      { name: 'Download', text: 'Download a clean .js file for analysis.' }
    ],
  },
  tr: {
    title: 'JS Sökücü — Malware Analizi',
    description: 'Siber güvenlik ve zararlı yazılım analizi için PDF belgelerine gizlenmiş JavaScript kodlarını tespit edip çıkarın.',
    h1: 'PDF JavaScript Sökücü',
    tagline: 'Siber güvenlik uzmanları için eşsiz bir araç.',
    howToName: 'PDF\\'den JavaScript nasıl çıkarılır',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Şüpheli PDF dosyasını seçin.' },
      { name: 'Tara', text: 'Tüm PDF ağaçlarında gizli JS kodlarını tararız.' },
      { name: 'İndir', text: 'Güvenli analiz için .js dosyasını indirin.' }
    ],
  }
};

export const splitBookmarksCopy = {
  en: {
    title: 'Split by Bookmarks — auto chapter split',
    description: 'Automatically split large textbooks or reports into multiple PDFs based on their Table of Contents (TOC) bookmarks.',
    h1: 'Split PDF by Bookmarks',
    tagline: 'Instantly break down textbooks into chapters.',
    howToName: 'How to split PDF by TOC',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select a PDF with a Table of Contents.' },
      { name: 'Parse', text: 'We read the bookmarks and chapter points.' },
      { name: 'Download', text: 'Get a ZIP file of chapter-separated PDFs.' }
    ],
  },
  tr: {
    title: 'Bölümlere Göre Parçala — İçindekiler Ayırıcı',
    description: 'Büyük ders kitaplarını veya raporları, İçindekiler (TOC) tablosundaki bölüm başlıklarına göre otomatik olarak ayrı PDF\\'lere bölün.',
    h1: 'İçindekiler Tablosuna Göre Böl',
    tagline: 'Yüzlerce sayfalık kitapları saniyeler içinde bölümlere ayırın.',
    howToName: 'PDF bölümlere göre nasıl ayrılır',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'İçindekiler bölümü olan bir PDF seçin.' },
      { name: 'Böl', text: 'Bölüm başlıklarını tespit edip keseriz.' },
      { name: 'İndir', text: 'Ayrı ayrı PDF\\'leri ZIP olarak indirin.' }
    ],
  }
};

export const splitBlankCopy = {
  en: {
    title: 'Split by Blank Page — auto scanner split',
    description: 'Automatically divide a large scanned PDF into multiple documents whenever a blank page is detected.',
    h1: 'Split PDF by Blank Page',
    tagline: 'A lifesaver for batch scanning and archiving.',
    howToName: 'How to split PDF by blank pages',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select your batch-scanned PDF.' },
      { name: 'Detect', text: 'We scan every page for completely blank pixels.' },
      { name: 'Download', text: 'Get a ZIP of properly separated documents.' }
    ],
  },
  tr: {
    title: 'Boş Sayfadan Parçala — Tarayıcı Ayırıcı',
    description: 'Tarayıcıdan toplu olarak taranmış büyük bir belgeyi, aradaki boş sayfaları tespit ederek otomatik olarak ayrı PDF\\'lere bölün.',
    h1: 'Boş Sayfalardan Böl',
    tagline: 'Arşivciler ve fotokopi merkezleri için devrim niteliğinde.',
    howToName: 'PDF boş sayfalara göre nasıl bölünür',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Toplu taranmış evrakları seçin.' },
      { name: 'Tara', text: 'Piksel bazında beyaz/boş sayfaları buluruz.' },
      { name: 'İndir', text: 'Ayrılmış onlarca evrakı ZIP olarak indirin.' }
    ],
  }
};
`;
fs.appendFileSync('./src/i18n/toolCopy.ts', '\n' + newCopies);

function makeAstroFixed(name, shellName, copyName, lang) {
  const isTr = lang === 'tr';
  const prefix = isTr ? '../../' : '../';
  const trImport = isTr ? `\nimport { tr } from '${prefix}i18n/tr';` : '';
  const tProp = isTr ? ` t={tr}` : '';

  return `---
import ToolPage from '${prefix}layouts/ToolPage.astro';
import { ${copyName} } from '${prefix}i18n/toolCopy';
import { ${shellName} } from '${prefix}components/${shellName}';${trImport}

const copy = ${copyName}.${lang};
---

<ToolPage
  title={copy.title}
  description={copy.description}
  h1={copy.h1}
  tagline={copy.tagline}
  howToName={copy.howToName}
  howItWorks={copy.howItWorks}
  steps={copy.steps}
  lang="${lang}"
>
  <${shellName} client:load${tProp} />
</ToolPage>
`;
}

const features = [
  ['extract-javascript', 'ExtractJavascriptShell', 'extractJavascriptCopy'],
  ['split-bookmarks', 'SplitBookmarksShell', 'splitBookmarksCopy'],
  ['split-blank', 'SplitBlankShell', 'splitBlankCopy']
];

for (const [name, shell, copy] of features) {
  fs.writeFileSync('./src/pages/' + name + '.astro', makeAstroFixed(name, shell, copy, 'en'));
  fs.writeFileSync('./src/pages/tr/' + name + '.astro', makeAstroFixed(name, shell, copy, 'tr'));
}

console.log('UI Scaffolding complete for Phase 5.');
