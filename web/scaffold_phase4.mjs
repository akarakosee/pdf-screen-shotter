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

fs.writeFileSync('./src/components/ExtractAttachmentsShell.tsx', makeShell('ExtractAttachments', 'controller.current?.runExtractAttachments(f);', `onExtractAttachmentsDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: 'No embedded attachments found.' });
        }
      }`));

fs.writeFileSync('./src/components/ExtractColorsShell.tsx', makeShell('ExtractColors', 'controller.current?.runExtractColors(f);', `onExtractColorsDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: 'Could not extract color palette.' });
        }
      }`));

fs.writeFileSync('./src/components/RemoveTextShell.tsx', makeShell('RemoveText', 'controller.current?.runRemoveText(f);', `onRemoveTextDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: 'Error removing text.' });
        }
      }`));

// Update toolCopy.ts
const newCopies = `
export const extractAttachmentsCopy = {
  en: {
    title: 'Extract Attachments — recover embedded files',
    description: 'Find and extract hidden XML, Word, Excel, or other files embedded inside a PDF.',
    h1: 'Extract PDF Attachments',
    tagline: 'Recover hidden files and portfolios instantly.',
    howToName: 'How to extract attachments from PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select a PDF with embedded files.' },
      { name: 'Extract', text: 'We scan the /EmbeddedFiles dictionary.' },
      { name: 'Download', text: 'Download a ZIP of all attachments.' }
    ],
  },
  tr: {
    title: 'Ek Dosyaları Sök — Gömülü dosyaları kurtar',
    description: 'PDF içine gizlenmiş XML, Word, Excel gibi gömülü ek dosyaları (attachments) bulup çıkarın.',
    h1: 'PDF Ek Dosyası Çıkarıcı',
    tagline: 'E-faturalardaki veya kurum belgelerindeki gizli dosyaları kurtarın.',
    howToName: 'PDF\\'den ekler nasıl çıkarılır',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Ek içeren bir PDF seçin.' },
      { name: 'Ayıkla', text: 'Gömülü dosyalar sözlüğünü tararız.' },
      { name: 'İndir', text: 'Tüm ekleri ZIP olarak indirin.' }
    ],
  }
};

export const extractColorsCopy = {
  en: {
    title: 'Extract Color Palette — find HEX codes',
    description: 'Scan your PDF to extract a complete color palette of all HEX codes used in vectors, backgrounds, and fonts.',
    h1: 'PDF Color Palette Extractor',
    tagline: 'The ultimate tool for graphic designers and brand managers.',
    howToName: 'How to extract colors from PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select your designed PDF.' },
      { name: 'Scan', text: 'We analyze the raw drawing operations.' },
      { name: 'Download', text: 'Get your HEX color palette.' }
    ],
  },
  tr: {
    title: 'Renk Paleti Çıkarıcı — HEX Kodlarını Bul',
    description: 'Vektörlerde, arka planlarda ve metinlerde kullanılan tüm HEX renk kodlarını çıkarıp tam bir renk paleti oluşturun.',
    h1: 'PDF Renk Hırsızı',
    tagline: 'Grafikerler ve tasarımcılar için bulunmaz bir araç.',
    howToName: 'PDF\\'den renkler nasıl çıkarılır',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Tasarım içeren PDF\\'i seçin.' },
      { name: 'Tara', text: 'Ham çizim operasyonlarını analiz ederiz.' },
      { name: 'İndir', text: 'Renk paletinizi indirin.' }
    ],
  }
};

export const removeTextCopy = {
  en: {
    title: 'Remove Text from PDF — template mode',
    description: 'Strip all text from a PDF, leaving only images, graphics, and backgrounds intact.',
    h1: 'Remove Text from PDF',
    tagline: 'Perfect for stealing templates or preparing documents for translation.',
    howToName: 'How to remove text from PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select your PDF document.' },
      { name: 'Strip', text: 'We safely delete all text drawing operators.' },
      { name: 'Download', text: 'Get your text-free document.' }
    ],
  },
  tr: {
    title: 'Metinleri Sil — Sadece Görsel/Şablon',
    description: 'Sadece resimlerin ve arka planların kalması için PDF\\'teki tüm metinleri tamamen silin.',
    h1: 'PDF Yazılarını Sil',
    tagline: 'Şablonları kopyalamak veya çeviri altlığı hazırlamak için ideal.',
    howToName: 'PDF\\'den metin nasıl silinir',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Belgenizi seçin.' },
      { name: 'Temizle', text: 'Tüm metin çizim operatörlerini yok ederiz.' },
      { name: 'İndir', text: 'Yazısız (sadece görsel) şablonu indirin.' }
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
  ['extract-attachments', 'ExtractAttachmentsShell', 'extractAttachmentsCopy'],
  ['extract-colors', 'ExtractColorsShell', 'extractColorsCopy'],
  ['remove-text', 'RemoveTextShell', 'removeTextCopy']
];

for (const [name, shell, copy] of features) {
  fs.writeFileSync('./src/pages/' + name + '.astro', makeAstroFixed(name, shell, copy, 'en'));
  fs.writeFileSync('./src/pages/tr/' + name + '.astro', makeAstroFixed(name, shell, copy, 'tr'));
}

console.log('UI Scaffolding complete for Phase 4.');
