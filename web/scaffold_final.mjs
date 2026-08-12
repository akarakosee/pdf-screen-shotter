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
import { FileUp, Palette, FileText } from 'lucide-react';
import { Button } from './Button';

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

  ${name === 'OverlayPdf' ? 'const [templateFile, setTemplateFile] = useState<File | null>(null);' : ''}
  ${name === 'ChangeBackground' ? 'const [hexColor, setHexColor] = useState<string>("#1E1E1E");' : ''}

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

// 1. Extract TOC
const extractTocHtml = null;
const extractTocHooks = `onExtractTocDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: 'No Table of Contents found in this PDF.' });
        }
      }`;

// 2. Overlay PDF
const overlayPdfHtml = `{phase === 'options' && file && (
        <div className="phase-enter flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark min-w-0 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber/10 text-amber dark:bg-amber-dark/20 dark:text-amber-dark">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex flex-col overflow-hidden min-w-0 flex-1">
              <div className="overflow-x-auto whitespace-nowrap scrollbar-thin text-sm font-medium pr-2" title={file.name}>{file.name} (Target)</div>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark">
            <label className="text-sm font-medium">{t.lang === 'tr' ? 'Şablon / Antet Dosyası' : 'Template / Letterhead File'}</label>
            <input type="file" accept="application/pdf" onChange={(e) => setTemplateFile(e.target.files?.[0] || null)} className="text-sm" />
          </div>
          <div className="flex justify-end mt-2">
            <Button onClick={() => { setPhase('processing'); controller.current?.runOverlayPdf(file, templateFile!); }} disabled={!templateFile}>
              {t.lang === 'tr' ? 'Şablonu Ekle' : 'Apply Overlay'}
            </Button>
          </div>
        </div>
      )}`;
const overlayPdfHooks = `onOverlayPdfDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: t.corruptFile });
        }
      }`;

// 3. Change Background
const changeBgHtml = `{phase === 'options' && file && (
        <div className="phase-enter flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark min-w-0 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo/10 text-indigo dark:bg-indigo-dark/20 dark:text-indigo-dark">
              <Palette className="h-5 w-5" />
            </div>
            <div className="flex flex-col overflow-hidden min-w-0 flex-1">
              <div className="overflow-x-auto whitespace-nowrap scrollbar-thin text-sm font-medium pr-2" title={file.name}>{file.name}</div>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark">
            <label className="text-sm font-medium">{t.lang === 'tr' ? 'Arka Plan Rengi (HEX)' : 'Background Color (HEX)'}</label>
            <div className="flex items-center gap-3">
              <input type="color" value={hexColor} onChange={(e) => setHexColor(e.target.value)} className="h-10 w-10 rounded-md cursor-pointer border-0 p-0" />
              <input type="text" value={hexColor} onChange={(e) => setHexColor(e.target.value)} className="h-10 w-24 rounded-lg border bg-bg px-3 text-sm focus:border-indigo focus:outline-none dark:bg-bg-dark uppercase" />
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setHexColor('#1E1E1E')} className="px-3 py-1 text-xs rounded-full bg-[#1E1E1E] text-white border border-gray-600">Dark Mode</button>
              <button onClick={() => setHexColor('#F4ECD8')} className="px-3 py-1 text-xs rounded-full bg-[#F4ECD8] text-black border border-gray-300">Sepia</button>
              <button onClick={() => setHexColor('#E5F0FF')} className="px-3 py-1 text-xs rounded-full bg-[#E5F0FF] text-black border border-gray-300">Light Blue</button>
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <Button onClick={() => { setPhase('processing'); controller.current?.runChangeBackground(file, hexColor); }}>
              {t.lang === 'tr' ? 'Rengi Değiştir' : 'Change Background'}
            </Button>
          </div>
        </div>
      )}`;
const changeBgHooks = `onChangeBgDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: t.corruptFile });
        }
      }`;

fs.writeFileSync('./src/components/ExtractTocShell.tsx', makeShell('ExtractToc', 'controller.current?.runExtractToc(f);', extractTocHooks, extractTocHtml));
fs.writeFileSync('./src/components/OverlayPdfShell.tsx', makeShell('OverlayPdf', '', overlayPdfHooks, overlayPdfHtml));
fs.writeFileSync('./src/components/ChangeBackgroundShell.tsx', makeShell('ChangeBackground', '', changeBgHooks, changeBgHtml));

// Now update toolCopy.ts
const newCopies = `
export const extractTocCopy = {
  en: {
    title: 'Extract Bookmarks — export PDF Table of Contents',
    description: 'Instantly extract the Table of Contents (Bookmarks) from any PDF and save it as a Markdown file.',
    h1: 'Extract Bookmarks (TOC)',
    tagline: 'Export your PDF\\'s outline tree structure to a structured text file in one click.',
    howToName: 'How to extract bookmarks from a PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select a PDF that has an embedded outline.' },
      { name: 'Extract', text: 'The bookmarks are parsed entirely in your browser.' },
      { name: 'Download', text: 'Get your Markdown (.md) file.' }
    ],
  },
  tr: {
    title: 'İçindekileri Çıkar — PDF Başlık Ağacını Dışa Aktar',
    description: 'Herhangi bir PDF\\'in İçindekiler Tablosunu (Yer İmlerini) anında çıkarın ve Markdown dosyası olarak kaydedin.',
    h1: 'İçindekileri Çıkar',
    tagline: 'PDF belgenizin başlık hiyerarşisini tek tıkla yapılandırılmış bir metin dosyasına aktarın.',
    howToName: 'PDF\\'ten içindekiler nasıl çıkarılır',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'İçindekiler kısmı olan bir PDF seçin.' },
      { name: 'Çıkar', text: 'Başlık ağacı tamamen tarayıcınızda ayrıştırılır.' },
      { name: 'İndir', text: 'Markdown (.md) dosyanızı indirin.' }
    ],
  }
};

export const overlayPdfCopy = {
  en: {
    title: 'Add Letterhead — overlay a template behind your PDF',
    description: 'Stamp a company letterhead or invoice template to the background of every page in your PDF document.',
    h1: 'Add Letterhead (Overlay)',
    tagline: 'Seamlessly embed a template PDF into the background of your target document.',
    howToName: 'How to add a letterhead to a PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload Target', text: 'Select the main PDF document you want to stamp.' },
      { name: 'Upload Template', text: 'Select your 1-page letterhead or template PDF.' },
      { name: 'Download', text: 'Get your branded PDF document.' }
    ],
  },
  tr: {
    title: 'Antet Ekle — PDF\\'inizin arka planına şablon ekleyin',
    description: 'Şirket antetli kağıdınızı veya fatura şablonunuzu PDF belgenizin her sayfasının arka planına ekleyin.',
    h1: 'Antet / Şablon Ekle',
    tagline: 'Şablon bir PDF\\'i, hedef belgenizin tüm sayfalarının arka planına kusursuzca gömün.',
    howToName: 'PDF\\'e antet veya şablon nasıl eklenir',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Hedefi Yükle', text: 'Şablon basmak istediğiniz ana PDF\\'i seçin.' },
      { name: 'Şablon Yükle', text: '1 sayfalık antetli kağıdınızı veya şablon PDF\\'inizi seçin.' },
      { name: 'İndir', text: 'Kurumsal PDF belgenizi indirin.' }
    ],
  }
};

export const changeBgCopy = {
  en: {
    title: 'Change PDF Background — Dark Mode & Sepia',
    description: 'Change the background color of your transparent or white PDFs. Perfect for Dark Mode reading or eye protection.',
    h1: 'Change Background Color',
    tagline: 'Instantly set a custom background color for your PDF pages to reduce eye strain.',
    howToName: 'How to change the background color of a PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select your PDF document.' },
      { name: 'Select Color', text: 'Pick a color like Dark Gray or Sepia.' },
      { name: 'Download', text: 'Download the recolored PDF.' }
    ],
  },
  tr: {
    title: 'Arka Plan Rengini Değiştir — Gece Modu & Sepya',
    description: 'Şeffaf veya beyaz PDF\\'lerinizin arka plan rengini değiştirin. Gece okuması ve göz koruması için mükemmeldir.',
    h1: 'Arka Plan Rengini Değiştir',
    tagline: 'Göz yorgunluğunu azaltmak için PDF sayfalarınızın arka planına anında özel bir renk atayın.',
    howToName: 'PDF arka plan rengi nasıl değiştirilir',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'PDF belgenizi seçin.' },
      { name: 'Renk Seç', text: 'Koyu Gri veya Sepya gibi bir zemin rengi belirleyin.' },
      { name: 'İndir', text: 'Yeniden renklendirilmiş PDF\\'inizi indirin.' }
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

fs.writeFileSync('./src/pages/extract-toc.astro', makeAstroFixed('extract-toc', 'ExtractTocShell', 'extractTocCopy', 'en'));
fs.writeFileSync('./src/pages/tr/extract-toc.astro', makeAstroFixed('extract-toc', 'ExtractTocShell', 'extractTocCopy', 'tr'));
fs.writeFileSync('./src/pages/overlay-pdf.astro', makeAstroFixed('overlay-pdf', 'OverlayPdfShell', 'overlayPdfCopy', 'en'));
fs.writeFileSync('./src/pages/tr/overlay-pdf.astro', makeAstroFixed('overlay-pdf', 'OverlayPdfShell', 'overlayPdfCopy', 'tr'));
fs.writeFileSync('./src/pages/change-bg.astro', makeAstroFixed('change-bg', 'ChangeBackgroundShell', 'changeBgCopy', 'en'));
fs.writeFileSync('./src/pages/tr/change-bg.astro', makeAstroFixed('change-bg', 'ChangeBackgroundShell', 'changeBgCopy', 'tr'));

console.log('UI Scaffolding complete.');
