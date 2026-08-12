import fs from 'fs';

function makeShell(name, handlerCall, eventHooks, optionsPhaseHtml = null) {
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
import { FileUp, FileText, Sun } from 'lucide-react';

type Phase = 'upload' | 'options' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

export function ${name}Shell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);
  const controller = useRef<JobController | null>(null);

  ${name === 'ContrastEnhancer' ? 'const [brightness, setBrightness] = useState<number>(100);\n  const [contrast, setContrast] = useState<number>(200);' : ''}

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
    ${optionsPhaseHtml ? `setPhase('options');` : `setPhase('processing');\n    ${handlerCall}`}
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

      ${optionsPhaseHtml || ''}

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

// 1. AutoRedact
const autoRedactHooks = `onAutoRedactDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: 'No PII found or error occurred.' });
        }
      }`;
fs.writeFileSync('./src/components/AutoRedactShell.tsx', makeShell('AutoRedact', 'controller.current?.runAutoRedact(f);', autoRedactHooks, null));

// 2. SmartMarkdown
const smartMarkdownHooks = `onSmartMarkdownDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: 'No text found.' });
        }
      }`;
fs.writeFileSync('./src/components/SmartMarkdownShell.tsx', makeShell('SmartMarkdown', 'controller.current?.runSmartMarkdown(f);', smartMarkdownHooks, null));

// 3. ContrastEnhancer
const contrastEnhancerHtml = `{phase === 'options' && file && (
        <div className="phase-enter flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark min-w-0 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber/10 text-amber dark:bg-amber-dark/20 dark:text-amber-dark">
              <Sun className="h-5 w-5" />
            </div>
            <div className="flex flex-col overflow-hidden min-w-0 flex-1">
              <div className="overflow-x-auto whitespace-nowrap scrollbar-thin text-sm font-medium pr-2" title={file.name}>{file.name}</div>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark">
            <label className="text-sm font-medium">{t.lang === 'tr' ? 'Parlaklık (%)' : 'Brightness (%)'}</label>
            <input type="range" min="50" max="200" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full" />
            <div className="text-xs text-center">{brightness}%</div>

            <label className="text-sm font-medium mt-2">{t.lang === 'tr' ? 'Kontrast (%)' : 'Contrast (%)'}</label>
            <input type="range" min="100" max="300" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full" />
            <div className="text-xs text-center">{contrast}%</div>
          </div>
          <div className="flex justify-end mt-2">
            <button onClick={() => { setPhase('processing'); controller.current?.runContrastEnhancer(file, brightness, contrast); }} className="rounded-lg bg-indigo px-4 py-2 text-sm font-medium text-white hover:bg-indigo/90 dark:bg-indigo-dark dark:hover:bg-indigo-dark/90 disabled:opacity-50">
              {t.lang === 'tr' ? 'Geliştir' : 'Enhance Document'}
            </button>
          </div>
        </div>
      )}`;
const contrastEnhancerHooks = `onContrastEnhancerDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: t.corruptFile });
        }
      }`;
fs.writeFileSync('./src/components/ContrastEnhancerShell.tsx', makeShell('ContrastEnhancer', '', contrastEnhancerHooks, contrastEnhancerHtml));

// Update toolCopy.ts
const newCopies = `
export const autoRedactCopy = {
  en: {
    title: 'Auto-Redact PII — hide sensitive information',
    description: 'Automatically detect and censor Emails, Phone Numbers, and Credit Cards from your PDF using client-side AI.',
    h1: 'Auto-Redact PDF',
    tagline: 'Black out Personally Identifiable Information (PII) with zero uploads.',
    howToName: 'How to auto-redact a PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select your PDF document.' },
      { name: 'Scan', text: 'Our engine detects Emails, SSNs, and more.' },
      { name: 'Download', text: 'Get your censored PDF.' }
    ],
  },
  tr: {
    title: 'Otomatik Sansür — kişisel verileri gizleyin',
    description: 'PDF\\'nizdeki E-posta, Telefon ve Kredi Kartı gibi kişisel verileri (PII) otomatik olarak tespit edip sansürleyin.',
    h1: 'Otomatik PDF Sansür',
    tagline: 'Kişisel verilerinizi %100 gizlilikle otomatik siyah kutulara alın.',
    howToName: 'PDF nasıl otomatik sansürlenir',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'PDF belgenizi seçin.' },
      { name: 'Tara', text: 'Motorumuz hassas verileri otomatik bulur.' },
      { name: 'İndir', text: 'Sansürlü belgenizi indirin.' }
    ],
  }
};

export const smartMarkdownCopy = {
  en: {
    title: 'Smart PDF to Markdown — AI-ready export',
    description: 'Convert PDFs to structured Markdown. Infers headings (H1, H2, H3) based on font sizes automatically.',
    h1: 'Smart PDF to Markdown',
    tagline: 'Perfect for LLMs and AI agents. Get structured MD files instantly.',
    howToName: 'How to convert PDF to Markdown',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select a text-heavy PDF.' },
      { name: 'Convert', text: 'Font sizes are analyzed to structure the document.' },
      { name: 'Download', text: 'Get your Markdown (.md) file.' }
    ],
  },
  tr: {
    title: 'Akıllı PDF to Markdown — Yapay Zeka Çıktısı',
    description: 'PDF\\'leri yapılandırılmış Markdown formatına dönüştürün. Başlıkları font boyutlarına göre otomatik algılar.',
    h1: 'PDF to Markdown',
    tagline: 'LLM ve yapay zeka ajanları için kusursuz. Anında yapılandırılmış MD dosyaları alın.',
    howToName: 'PDF Markdown\\'a nasıl dönüştürülür',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Metin içeren bir PDF seçin.' },
      { name: 'Dönüştür', text: 'Font boyutları analiz edilerek belge yapılandırılır.' },
      { name: 'İndir', text: 'Markdown (.md) dosyanızı indirin.' }
    ],
  }
};

export const contrastEnhancerCopy = {
  en: {
    title: 'Enhance PDF — adjust contrast & brightness',
    description: 'Fix bad scans by increasing contrast and brightness. Make faded text crisp and readable again.',
    h1: 'Enhance Scanned PDF',
    tagline: 'Adjust brightness and contrast of poor PDF scans effortlessly.',
    howToName: 'How to enhance a scanned PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select your scanned PDF.' },
      { name: 'Adjust', text: 'Set your desired brightness and contrast.' },
      { name: 'Download', text: 'Download the enhanced PDF.' }
    ],
  },
  tr: {
    title: 'PDF Netleştir — kontrast ve parlaklık artır',
    description: 'Kötü taranmış soluk belgelerin kontrastını artırarak metinleri cam gibi net hale getirin.',
    h1: 'Taranmış PDF Netleştir',
    tagline: 'Soluk PDF taramalarının parlaklığını ve kontrastını zahmetsizce ayarlayın.',
    howToName: 'Taranmış PDF nasıl netleştirilir',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Taranmış PDF\\'nizi seçin.' },
      { name: 'Ayarla', text: 'Parlaklık ve kontrast oranını belirleyin.' },
      { name: 'İndir', text: 'Netleştirilmiş PDF\\'inizi indirin.' }
    ],
  }
};
`;
fs.appendFileSync('./src/i18n/toolCopy.ts', '\n' + newCopies);

// Astro Pages generator
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

fs.writeFileSync('./src/pages/auto-redact.astro', makeAstroFixed('auto-redact', 'AutoRedactShell', 'autoRedactCopy', 'en'));
fs.writeFileSync('./src/pages/tr/auto-redact.astro', makeAstroFixed('auto-redact', 'AutoRedactShell', 'autoRedactCopy', 'tr'));
fs.writeFileSync('./src/pages/smart-markdown.astro', makeAstroFixed('smart-markdown', 'SmartMarkdownShell', 'smartMarkdownCopy', 'en'));
fs.writeFileSync('./src/pages/tr/smart-markdown.astro', makeAstroFixed('smart-markdown', 'SmartMarkdownShell', 'smartMarkdownCopy', 'tr'));
fs.writeFileSync('./src/pages/contrast-enhancer.astro', makeAstroFixed('contrast-enhancer', 'ContrastEnhancerShell', 'contrastEnhancerCopy', 'en'));
fs.writeFileSync('./src/pages/tr/contrast-enhancer.astro', makeAstroFixed('contrast-enhancer', 'ContrastEnhancerShell', 'contrastEnhancerCopy', 'tr'));

console.log('UI Scaffolding complete for Phase 2.');
