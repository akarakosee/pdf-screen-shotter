import { useState, useRef } from 'react';
import { Button } from './ui/Button';
import { Toast, type ToastData } from './Toast';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { Download, Code } from 'lucide-react';

interface Props {
  t?: Strings;
}

const DEFAULT_HTML = `<div>
  <h1 style="color: #2563eb; font-family: sans-serif;">Hello HTML!</h1>
  <p style="font-size: 16px; color: #4b5563; font-family: serif;">
    This is raw HTML rendered directly into the browser and converted to PDF.
  </p>
  <div style="padding: 20px; background: #f3f4f6; border-radius: 8px; margin-top: 20px;">
    <strong>Features:</strong>
    <ul>
      <li>Supports inline CSS styles</li>
      <li>Renders exactly as the browser sees it</li>
      <li>100% Secure & Local</li>
    </ul>
  </div>
</div>`;

export function HtmlShell({ t = en }: Props) {
  const [htmlCode, setHtmlCode] = useState(DEFAULT_HTML);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  
  const previewRef = useRef<HTMLDivElement>(null);

  const generatePdf = async () => {
    if (!previewRef.current) return;
    
    setIsProcessing(true);
    try {
      // Yield to allow UI update
      await new Promise(r => setTimeout(r, 50));
      
      const opt = {
        margin:       10,
        filename:     'html_document.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf().set(opt).from(previewRef.current).save();
      setToast({ kind: 'success', message: 'PDF downloaded successfully!' });
    } catch (err: any) {
      console.error(err);
      setToast({ kind: 'error', message: 'Failed to generate PDF.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setHtmlCode(DEFAULT_HTML);
  };

  return (
    <div className="flex flex-col gap-5">
      {toast && <Toast data={toast} onDismiss={() => setToast(null)} />}
      
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="flex flex-col lg:flex-row gap-6 h-[70vh]">
          {/* Editor Column */}
          <div className="flex-1 flex flex-col bg-surface dark:bg-surface-dark border border-black/10 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex justify-between items-center">
              <h3 className="font-medium text-ink-muted dark:text-ink-muted-dark flex items-center gap-2">
                <Code className="w-4 h-4" /> HTML Code Editor
              </h3>
              <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
            </div>
            <textarea
              className="flex-1 w-full p-4 resize-none bg-transparent focus:outline-none text-[#1D1108] dark:text-[#E8B65F] font-mono text-sm"
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              placeholder="Paste raw HTML here..."
            />
          </div>

          {/* Preview Column */}
          <div className="flex-1 flex flex-col bg-surface dark:bg-surface-dark border border-black/10 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden relative">
            <div className="px-4 py-3 border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex justify-between items-center z-10">
              <h3 className="font-medium text-ink-muted dark:text-ink-muted-dark">Live Preview</h3>
              <Button onClick={generatePdf} disabled={isProcessing} className="flex items-center gap-2">
                <Download className="w-4 h-4" /> {isProcessing ? 'Generating...' : 'Download PDF'}
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto p-8 bg-bg dark:bg-bg-dark">
              <div 
                ref={previewRef}
                className="bg-white text-black p-8 shadow-sm min-h-full mx-auto"
                style={{ width: '210mm', minHeight: '297mm', maxWidth: '100%' }} // A4 proportions
                dangerouslySetInnerHTML={{ __html: htmlCode }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
