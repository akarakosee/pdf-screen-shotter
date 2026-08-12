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

fs.writeFileSync('./src/components/PdfToHtmlShell.tsx', makeShell('PdfToHtml', 'controller.current?.runPdfToHtml(f);', `onPdfToHtmlDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: 'No HTML could be extracted.' });
        }
      }`));

fs.writeFileSync('./src/components/ExtractFontsShell.tsx', makeShell('ExtractFonts', 'controller.current?.runExtractFonts(f);', `onExtractFontsDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: 'No fonts found in this document.' });
        }
      }`));

fs.writeFileSync('./src/components/RemoveImagesShell.tsx', makeShell('RemoveImages', 'controller.current?.runRemoveImages(f);', `onRemoveImagesDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: 'Error removing images.' });
        }
      }`));

fs.writeFileSync('./src/components/ExtractUrlsShell.tsx', makeShell('ExtractUrls', 'controller.current?.runExtractUrls(f);', `onExtractUrlsDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: 'No URLs or clickable links found.' });
        }
      }`));

fs.writeFileSync('./src/components/RemoveDuplicatesShell.tsx', makeShell('RemoveDuplicates', 'controller.current?.runRemoveDuplicates(f);', `onRemoveDuplicatesDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: 'No duplicates found or error occurred.' });
        }
      }`));

// Update toolCopy.ts
const newCopies = `
export const pdfToHtmlCopy = {
  en: {
    title: 'PDF to HTML — export as web page',
    description: 'Convert your PDF documents into clean, semantic HTML files directly in your browser.',
    h1: 'PDF to HTML Converter',
    tagline: 'Publish your PDFs on the web easily without losing text formatting.',
    howToName: 'How to convert PDF to HTML',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select the PDF file.' },
      { name: 'Convert', text: 'Our engine extracts the semantic structure.' },
      { name: 'Download', text: 'Get your web-ready HTML file.' }
    ],
  },
  tr: {
    title: 'PDF to HTML — web sayfası yap',
    description: 'PDF belgelerinizi doğrudan tarayıcınızda temiz ve anlamsal (semantic) HTML dosyalarına dönüştürün.',
    h1: 'PDF HTML Çevirici',
    tagline: 'PDF\\'lerinizi web\\'de kolayca yayınlayın.',
    howToName: 'PDF HTML\\'e nasıl çevrilir',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'PDF dosyasını seçin.' },
      { name: 'Dönüştür', text: 'Motorumuz metin yapısını HTML\\'e çevirir.' },
      { name: 'İndir', text: 'HTML dosyanızı indirin.' }
    ],
  }
};

export const extractFontsCopy = {
  en: {
    title: 'Extract Fonts from PDF — recover TTF/OTF',
    description: 'Find and extract embedded TrueType (TTF) and OpenType (OTF) font files from any PDF.',
    h1: 'Extract PDF Fonts',
    tagline: 'A lifesaver for graphic designers. Recover original fonts instantly.',
    howToName: 'How to extract fonts from PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select a PDF with embedded fonts.' },
      { name: 'Extract', text: 'We scan the resource dictionaries for font streams.' },
      { name: 'Download', text: 'Download a ZIP of all fonts.' }
    ],
  },
  tr: {
    title: 'PDF Font Çıkarıcı — TTF/OTF Kurtar',
    description: 'Herhangi bir PDF içine gömülmüş TrueType (TTF) ve OpenType (OTF) font dosyalarını bulup çıkarın.',
    h1: 'PDF Font Kurtarıcı',
    tagline: 'Tasarımcılar için hayat kurtarıcı. Orijinal fontları saniyeler içinde geri alın.',
    howToName: 'PDF\\'den font nasıl çıkarılır',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Gömülü fontlar içeren bir PDF seçin.' },
      { name: 'Ayıkla', text: 'Font dosyalarını kaynak koddan sökeriz.' },
      { name: 'İndir', text: 'Tüm fontları ZIP olarak indirin.' }
    ],
  }
};

export const removeImagesCopy = {
  en: {
    title: 'Remove Images from PDF — ink saver',
    description: 'Strip all images, photos, and heavy graphics from your PDF to save 90% printer ink.',
    h1: 'Remove Images from PDF',
    tagline: 'Create text-only documents instantly. Perfect for printing long slides.',
    howToName: 'How to remove images from PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select your heavy PDF.' },
      { name: 'Strip', text: 'We safely remove all image objects.' },
      { name: 'Download', text: 'Get your ink-saving text-only PDF.' }
    ],
  },
  tr: {
    title: 'Görselleri Sil — Mürekkep Tasarrufu',
    description: 'Yazıcı mürekkebinden %90 tasarruf etmek için PDF\\'nizdeki tüm resimleri ve ağır grafikleri silin.',
    h1: 'PDF Resimlerini Sil',
    tagline: 'Saniyeler içinde sadece-metin belgeleri oluşturun. Slayt yazdırmak için ideal.',
    howToName: 'PDF\\'den resimler nasıl silinir',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Görsel dolu PDF\\'inizi seçin.' },
      { name: 'Temizle', text: 'Tüm görsel nesneleri güvenle kaldırırız.' },
      { name: 'İndir', text: 'Sadece metinden oluşan PDF\\'i indirin.' }
    ],
  }
};

export const extractUrlsCopy = {
  en: {
    title: 'Extract URLs from PDF — link parser',
    description: 'Find all clickable links, URLs, and external references inside a PDF and export them.',
    h1: 'Extract Links from PDF',
    tagline: 'Parse academic papers and reports for external references in one click.',
    howToName: 'How to extract links from PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select a PDF containing hyperlinks.' },
      { name: 'Parse', text: 'We scan link annotations across all pages.' },
      { name: 'Download', text: 'Download a text file with all URLs.' }
    ],
  },
  tr: {
    title: 'Linkleri Çıkar — URL Ayrıştırıcı',
    description: 'Bir PDF\\'in içindeki tüm tıklanabilir bağlantıları, URL\\'leri ve harici referansları bulup dışa aktarın.',
    h1: 'PDF\\'den Link Çıkar',
    tagline: 'Akademik makaleler ve raporlardaki bağlantıları tek tıkla listeleyin.',
    howToName: 'PDF\\'den linkler nasıl çıkarılır',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Link içeren bir PDF seçin.' },
      { name: 'Tara', text: 'Tüm sayfalardaki bağlantı noktalarını tararız.' },
      { name: 'İndir', text: 'Tüm URL\\'lerin olduğu dosyayı indirin.' }
    ],
  }
};

export const removeDuplicatesCopy = {
  en: {
    title: 'Remove Duplicate Pages — de-duplicator',
    description: 'Automatically find and delete visually identical pages from your PDF.',
    h1: 'Remove Duplicate Pages',
    tagline: 'Clean up merged or poorly scanned documents by eliminating double pages.',
    howToName: 'How to remove duplicate PDF pages',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select your PDF document.' },
      { name: 'Analyze', text: 'We do a fast pixel-hash comparison of all pages.' },
      { name: 'Download', text: 'Get your cleaned up PDF.' }
    ],
  },
  tr: {
    title: 'Kopya Sayfaları Sil — Tekilleştirici',
    description: 'PDF\\'nizdeki görsel olarak tamamen aynı olan kopya sayfaları otomatik bulup silin.',
    h1: 'Kopya Sayfaları Sil',
    tagline: 'Hatalı taranmış belgelerdeki çifte sayfaları yok edin.',
    howToName: 'PDF\\'deki çift sayfalar nasıl silinir',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'PDF belgenizi seçin.' },
      { name: 'Analiz', text: 'Hızlı bir piksel-hash karşılaştırması yaparız.' },
      { name: 'İndir', text: 'Temizlenmiş PDF\\'nizi indirin.' }
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
  ['pdf-to-html', 'PdfToHtmlShell', 'pdfToHtmlCopy'],
  ['extract-fonts', 'ExtractFontsShell', 'extractFontsCopy'],
  ['remove-images', 'RemoveImagesShell', 'removeImagesCopy'],
  ['extract-urls', 'ExtractUrlsShell', 'extractUrlsCopy'],
  ['remove-duplicates', 'RemoveDuplicatesShell', 'removeDuplicatesCopy']
];

for (const [name, shell, copy] of features) {
  fs.writeFileSync('./src/pages/' + name + '.astro', makeAstroFixed(name, shell, copy, 'en'));
  fs.writeFileSync('./src/pages/tr/' + name + '.astro', makeAstroFixed(name, shell, copy, 'tr'));
}

console.log('UI Scaffolding complete for Phase 3.');
