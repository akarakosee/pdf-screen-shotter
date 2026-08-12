import fs from 'fs';

function makeShell(name, handlerCall, eventHooks, hasOptions = false) {
  const optionsState = hasOptions ? `
  const [fullScreen, setFullScreen] = useState(false);
  const [hideToolbar, setHideToolbar] = useState(false);
  const [hideMenubar, setHideMenubar] = useState(false);
  const [fitWindow, setFitWindow] = useState(false);
  const [centerWindow, setCenterWindow] = useState(false);` : '';

  const optionsUI = hasOptions ? `
          <div className="space-y-4 rounded-xl border bg-surface-alt p-4 dark:bg-surface-dark-alt">
            <h3 className="font-medium">Viewer Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={fullScreen} onChange={e => setFullScreen(e.target.checked)} className="rounded border-ink-muted/30" />
                <span>Open in Full Screen Mode</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={hideToolbar} onChange={e => setHideToolbar(e.target.checked)} className="rounded border-ink-muted/30" />
                <span>Hide Toolbar</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={hideMenubar} onChange={e => setHideMenubar(e.target.checked)} className="rounded border-ink-muted/30" />
                <span>Hide Menu Bar</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={fitWindow} onChange={e => setFitWindow(e.target.checked)} className="rounded border-ink-muted/30" />
                <span>Fit Window to Page</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={centerWindow} onChange={e => setCenterWindow(e.target.checked)} className="rounded border-ink-muted/30" />
                <span>Center Window</span>
              </label>
            </div>
          </div>` : '';

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
import { ArrowRight } from 'lucide-react';

type Phase = 'upload' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

export function ${name}Shell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);
  const controller = useRef<JobController | null>(null);${optionsState}

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
    ${hasOptions ? '' : `setPhase('processing');
    ${handlerCall}`}
  }, [t]);

  const reset = useCallback(() => {
    setFile(null);
    setOutput(null);
    setPhase('upload');
  }, []);

  const startJob = useCallback(() => {
    if (!file) return;
    setPhase('processing');
    ${handlerCall}
  }, [file${hasOptions ? ', fullScreen, hideToolbar, hideMenubar, fitWindow, centerWindow' : ''}]);

  return (
    <div className="flex flex-col gap-5">
      {toast && (
        <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />
      )}

      {phase === 'upload' && !file && (
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone t={t} hasFiles={false} onFiles={addFile} multiple={false} />
          <PrivacyLine t={t} />
        </div>
      )}

      {phase === 'upload' && file && (
        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col gap-5">
          <div className="flex items-center justify-between rounded-xl border bg-surface p-3 sm:p-4 dark:bg-surface-dark">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-ink dark:text-ink-dark">{file.name}</p>
                <p className="text-xs text-ink-muted dark:text-ink-muted-dark">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button onClick={reset} className="shrink-0 p-2 text-ink-muted hover:text-ink dark:text-ink-muted-dark hover:dark:text-ink-dark" aria-label="Remove">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          ${optionsUI}
          <button onClick={startJob} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 font-semibold text-white transition-all hover:bg-brand-hover active:scale-[0.98]">
            {t.start || 'Start'}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
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

fs.writeFileSync('./src/components/ViewerPrefsShell.tsx', makeShell('ViewerPrefs', 'controller.current?.runViewerPrefs(file, { fullScreen, hideToolbar, hideMenubar, fitWindow, centerWindow });', `onViewerPrefsDone: (result) => {
        if (result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: 'Error setting viewer preferences.' });
        }
      }`, true));

fs.writeFileSync('./src/components/ExtractHiddenTextShell.tsx', makeShell('ExtractHiddenText', 'controller.current?.runExtractHiddenText(file);', `onExtractHiddenTextDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: 'No hidden or invisible text detected in this document.' });
        }
      }`, false));

fs.writeFileSync('./src/components/WipeBookmarksShell.tsx', makeShell('WipeBookmarks', 'controller.current?.runWipeBookmarks(file);', `onWipeBookmarksDone: (result) => {
        if (result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: 'Error wiping bookmarks.' });
        }
      }`, false));


// Update toolCopy.ts
const newCopies = `
export const viewerPrefsCopy = {
  en: {
    title: 'Viewer Preferences — PDF auto open settings',
    description: 'Configure how your PDF behaves when opened. Force full screen mode, hide toolbars, or center the window automatically.',
    h1: 'Set PDF Viewer Preferences',
    tagline: 'Professional presentation settings for eBooks and reports.',
    howToName: 'How to set PDF initial view',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select the PDF you want to configure.' },
      { name: 'Configure', text: 'Choose to hide toolbars, menus, or force full screen.' },
      { name: 'Download', text: 'Download the modified PDF.' }
    ],
  },
  tr: {
    title: 'Açılış Ayarları — PDF görünümünü ayarla',
    description: 'PDF\\'iniz açıldığında nasıl davranacağını kodlayın. Tam ekranda açmaya zorlayın veya menü çubuklarını gizleyin.',
    h1: 'PDF Açılış Ayarları (ViewerPrefs)',
    tagline: 'E-kitaplar ve profesyonel sunumlar için olmazsa olmaz.',
    howToName: 'PDF açılış ayarları nasıl yapılır',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Ayarlanacak belgeyi seçin.' },
      { name: 'Seç', text: 'Tam ekran, araç çubuğu gizleme gibi modları seçin.' },
      { name: 'İndir', text: 'Düzenlenmiş dosyayı indirin.' }
    ],
  }
};

export const extractHiddenTextCopy = {
  en: {
    title: 'Extract Hidden Text — forensics tool',
    description: 'A forensics tool to detect and extract invisible or white-on-white text hidden inside a PDF document.',
    h1: 'Hidden Text Detector',
    tagline: 'Uncover hidden trackers, SEO spam, or steganography.',
    howToName: 'How to detect hidden text in PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select a suspicious PDF document.' },
      { name: 'Scan', text: 'We scan content streams for invisible rendering modes.' },
      { name: 'Download', text: 'Download a report of all hidden text blocks.' }
    ],
  },
  tr: {
    title: 'Gizli Yazı Dedektörü — Forensics aracı',
    description: 'Adli bilişim (forensics) amaçlı olarak PDF içine gizlenmiş, görünmez kodlu veya beyaz metinleri tespit edip çıkarın.',
    h1: 'Gizli Metin Sökücü',
    tagline: 'SEO spamlarnı veya görünmez filigranları ortaya çıkarın.',
    howToName: 'PDF\\'den gizli metin nasıl çıkarılır',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Şüpheli belgeyi seçin.' },
      { name: 'Tara', text: 'Raw byteları tarayarak gizli komutları buluruz.' },
      { name: 'İndir', text: 'Deşifre edilen yazıları TXT olarak indirin.' }
    ],
  }
};

export const wipeBookmarksCopy = {
  en: {
    title: 'Wipe Bookmarks — remove TOC',
    description: 'Completely delete the Table of Contents (Bookmarks) structure from a PDF for privacy or file size reduction.',
    h1: 'Remove PDF Bookmarks',
    tagline: 'Hide your document structure before publishing.',
    howToName: 'How to delete PDF bookmarks',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select a PDF with a Table of Contents.' },
      { name: 'Wipe', text: 'We safely destroy the Outlines hierarchy.' },
      { name: 'Download', text: 'Download your cleaned document.' }
    ],
  },
  tr: {
    title: 'İçindekiler Silici — Outline Yok Et',
    description: 'Gizlilik veya boyut tasarrufu amacıyla PDF içindeki "İçindekiler" (Bookmarks/Outlines) ağacını tamamen yok edin.',
    h1: 'PDF İçindekiler Silici',
    tagline: 'Belgenizin iskeletini ve başlık hiyerarşisini gizleyin.',
    howToName: 'PDF içindekiler nasıl silinir',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'İçindekiler listesi olan bir PDF seçin.' },
      { name: 'Sil', text: 'Outlines hiyerarşisini kökünden yok ederiz.' },
      { name: 'İndir', text: 'Temizlenmiş belgeyi indirin.' }
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
  ['viewer-prefs', 'ViewerPrefsShell', 'viewerPrefsCopy'],
  ['extract-hidden-text', 'ExtractHiddenTextShell', 'extractHiddenTextCopy'],
  ['wipe-bookmarks', 'WipeBookmarksShell', 'wipeBookmarksCopy']
];

for (const [name, shell, copy] of features) {
  fs.writeFileSync('./src/pages/' + name + '.astro', makeAstroFixed(name, shell, copy, 'en'));
  fs.writeFileSync('./src/pages/tr/' + name + '.astro', makeAstroFixed(name, shell, copy, 'tr'));
}

console.log('UI Scaffolding complete for Phase 6.');
