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

      {phase === 'upload' && !file && (
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
            <div className="h-full w-full origin-left animate-custom-pulse bg-brand dark:bg-brand-dark" />
          </div>
        </div>
      )}

      {phase === 'done' && output && (
        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col items-center justify-center py-8 w-full mx-auto">
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

// Custom ScanToPdfShell
const scanShell = `import { useCallback, useEffect, useState, useRef } from 'react';
import { PrivacyLine } from './PrivacyLine';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { ResultPanel } from './ResultPanel';
import { JobController } from '../app/JobController';
import { Camera, StopCircle, Aperture, X } from 'lucide-react';

type Phase = 'camera' | 'processing' | 'done';

export function ScanToPdfShell({ t = en }: { t?: Strings }) {
  const [phase, setPhase] = useState<Phase>('camera');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);
  const [images, setImages] = useState<File[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const controller = useRef<JobController | null>(null);

  useEffect(() => {
    controller.current = new JobController({
      onScanToPdfDone: (result) => {
        if (result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('camera');
          setToast({ kind: 'error', message: 'Failed to create PDF.' });
        }
      }
    });
    return () => {
      controller.current?.dispose();
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setToast({ kind: 'error', message: 'Camera access denied or not available.' });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (phase === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  }, [phase]);

  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob(blob => {
      if (blob) {
        const file = new File([blob], \`scanned_page_\${images.length + 1}.jpg\`, { type: 'image/jpeg' });
        setImages(prev => [...prev, file]);
      }
    }, 'image/jpeg', 0.9);
  };

  const generatePDF = () => {
    if (images.length === 0) return;
    setPhase('processing');
    controller.current?.runScanToPdf(images, 'Scanned_Document.pdf');
  };

  const reset = () => {
    setImages([]);
    setOutput(null);
    setPhase('camera');
  };

  return (
    <div className="flex flex-col gap-5">
      {toast && <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />}

      {phase === 'camera' && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border bg-surface p-4 shadow-sm sm:p-6 dark:bg-surface-dark">
          <div className="relative w-full overflow-hidden rounded-xl bg-black aspect-[3/4] sm:aspect-video flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
            <button 
              onClick={captureFrame} 
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-xl transition-transform active:scale-90"
              aria-label="Capture"
            >
              <Aperture className="h-8 w-8" />
            </button>
          </div>
          
          <div className="flex w-full flex-col gap-4">
            {images.length > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-surface-alt px-4 py-3 text-sm dark:bg-surface-dark-alt">
                <span className="font-medium text-ink dark:text-ink-dark">{images.length} pages captured</span>
                <button 
                  onClick={generatePDF}
                  className="rounded-lg bg-brand px-4 py-2 font-medium text-white hover:bg-brand-hover active:scale-95"
                >
                  Generate PDF
                </button>
              </div>
            )}
            <PrivacyLine t={t} />
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <div className="phase-enter flex flex-col gap-3">
          <div className="flex items-baseline justify-between text-xs text-ink-muted dark:text-ink-muted-dark">
            <span>Generating PDF...</span>
          </div>
          <div className="h-1 overflow-hidden rounded-lg bg-surface border dark:bg-surface-dark">
            <div className="h-full w-full origin-left animate-custom-pulse bg-brand dark:bg-brand-dark" />
          </div>
        </div>
      )}

      {phase === 'done' && output && (
        <div className="animate-in fade-in flex flex-col items-center justify-center py-8">
          <ResultPanel t={t} title="Scanned PDF Ready" onDownload={() => triggerDownload(output.blob, output.name)} onRestart={reset} />
        </div>
      )}
    </div>
  );
}
`;


fs.writeFileSync('./src/components/ExtractTablesShell.tsx', makeShell('ExtractTables', 'controller.current?.runExtractTables(f);', `onExtractTablesDone: (result) => {
        if (result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: 'Failed to extract tables.' });
        }
      }`));

fs.writeFileSync('./src/components/PdfToJsonShell.tsx', makeShell('PdfToJson', 'controller.current?.runPdfToJson(f);', `onPdfToJsonDone: (result) => {
        if (result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: 'Failed to generate JSON.' });
        }
      }`));

fs.writeFileSync('./src/components/AudioReaderShell.tsx', makeShell('AudioReader', 'controller.current?.runAudioReader(f);', `onAudioReaderDone: (result) => {
        if (result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: 'Failed to extract text for audio.' });
        }
      }`));

fs.writeFileSync('./src/components/ScanToPdfShell.tsx', scanShell);

// Update toolCopy.ts
const newCopies = `
export const extractTablesCopy = {
  en: {
    title: 'Extract Tables — PDF to CSV',
    description: 'Mathematically analyze bounding boxes to extract tabular data from PDF into an Excel-ready CSV format.',
    h1: 'PDF to CSV Converter',
    tagline: 'Automated tabular data extraction for analysts.',
    howToName: 'How to extract PDF tables',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select a PDF with tables.' },
      { name: 'Analyze', text: 'We calculate text alignment to reconstruct rows.' },
      { name: 'Download', text: 'Download the CSV file.' }
    ],
  },
  tr: {
    title: 'Tablo Çıkarıcı — PDF to CSV',
    description: 'PDF içindeki metin hizalamalarını matematiksel analiz ederek verileri Excel (CSV) formatına dökün.',
    h1: 'PDF Tablo Çıkarıcı (CSV)',
    tagline: 'Fatura ve veri analizleri için birebir.',
    howToName: 'PDF içindeki tablolar nasıl çıkarılır',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Tablo içeren bir belge seçin.' },
      { name: 'Analiz', text: 'Kelimelerin X ve Y koordinatları birleştirilir.' },
      { name: 'İndir', text: 'Excel\\'de açılabilir CSV\\'yi indirin.' }
    ],
  }
};

export const pdfToJsonCopy = {
  en: {
    title: 'PDF to JSON — for developers',
    description: 'Convert a PDF into a structured JSON payload containing text, fonts, and bounding box coordinates.',
    h1: 'PDF to JSON Converter',
    tagline: 'A developer tool for AI pipelines and parsing.',
    howToName: 'How to convert PDF to JSON',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select a PDF document.' },
      { name: 'Parse', text: 'We build a structural JSON tree.' },
      { name: 'Download', text: 'Download the raw JSON data.' }
    ],
  },
  tr: {
    title: 'PDF to JSON — Yazılımcılar İçin',
    description: 'Yazılımcılar ve AI projeleri için PDF belgelerini tüm yapısal haritası ve koordinatlarıyla JSON formatına çevirin.',
    h1: 'PDF to JSON Çevirici',
    tagline: 'Geliştiricilerin aradığı o eşsiz araç.',
    howToName: 'PDF JSON formatına nasıl çevrilir',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Analiz edilecek belgeyi seçin.' },
      { name: 'Parse', text: 'Belge ağacı JSON objesine dönüştürülür.' },
      { name: 'İndir', text: 'Ham JSON verisini indirin.' }
    ],
  }
};

export const scanToPdfCopy = {
  en: {
    title: 'Scan to PDF — camera scanner',
    description: 'Use your webcam or mobile camera to snap pictures of documents and instantly turn them into a single PDF.',
    h1: 'Camera Scanner to PDF',
    tagline: 'Turn your device into a portable document scanner.',
    howToName: 'How to scan documents to PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Allow Camera', text: 'Grant webcam access.' },
      { name: 'Capture', text: 'Take photos of your physical documents.' },
      { name: 'Generate', text: 'We compile them into a secure PDF.' }
    ],
  },
  tr: {
    title: 'Kameradan PDF — Scan to PDF',
    description: 'Bilgisayar veya telefon kameranızı kullanarak fiziksel evraklarınızı anında tek bir PDF belgesine dönüştürün.',
    h1: 'Kamera Tarayıcı (Scan to PDF)',
    tagline: 'Cihazınızı portatif bir tarayıcıya dönüştürün.',
    howToName: 'Kameradan PDF nasıl yapılır',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'İzin Ver', text: 'Kamera erişimine izin verin.' },
      { name: 'Çek', text: 'Evrakların fotoğraflarını çekin.' },
      { name: 'Birleştir', text: 'Anında tek bir PDF olarak indirin.' }
    ],
  }
};

export const audioReaderCopy = {
  en: {
    title: 'Audio Reader — Text to Speech',
    description: 'Extract raw text from a PDF optimized for audio reading (Text-to-Speech) software and audiobooks.',
    h1: 'PDF Audio Reader Prep',
    tagline: 'Prepare your documents for smooth listening.',
    howToName: 'How to make a PDF ready for audio',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select a readable PDF.' },
      { name: 'Extract', text: 'We extract clean, flowing text.' },
      { name: 'Download', text: 'Download a clean TXT file ready for TTS engines.' }
    ],
  },
  tr: {
    title: 'Sesli Okuma — TTS Hazırlık',
    description: 'PDF belgelerindeki metinleri Sesli Kitap (Text-to-Speech) uygulamalarının pürüzsüz okuyabilmesi için saf txt formatına dökün.',
    h1: 'Sesli Okuyucu Hazırlığı',
    tagline: 'Belgelerinizi dinlemek için en temiz formata çevirin.',
    howToName: 'PDF sese nasıl çevrilir',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Okunabilir bir PDF seçin.' },
      { name: 'Ayıkla', text: 'Sayfa numaraları ve kırılmalar temizlenir.' },
      { name: 'İndir', text: 'Ses motorları için pürüzsüz bir metin indirin.' }
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
  ['extract-tables', 'ExtractTablesShell', 'extractTablesCopy'],
  ['pdf-to-json', 'PdfToJsonShell', 'pdfToJsonCopy'],
  ['scan-to-pdf', 'ScanToPdfShell', 'scanToPdfCopy'],
  ['audio-reader', 'AudioReaderShell', 'audioReaderCopy']
];

for (const [name, shell, copy] of features) {
  fs.writeFileSync('./src/pages/' + name + '.astro', makeAstroFixed(name, shell, copy, 'en'));
  fs.writeFileSync('./src/pages/tr/' + name + '.astro', makeAstroFixed(name, shell, copy, 'tr'));
}

console.log('UI Scaffolding complete for Phase 7.');
