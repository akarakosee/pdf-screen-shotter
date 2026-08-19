import { useState } from 'react';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { Download, RefreshCw, FormInput } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Toast } from './Toast';

interface Props {
  t?: Strings;
}

interface FormField {
  name: string;
  type: string;
  value: string;
}

export function FormsShell({ t = en }: Props) {
  const [phase, setPhase] = useState<'upload' | 'fill' | 'done'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [fields, setFields] = useState<FormField[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const handleFile = async (files: File[]) => {
    if (!files.length) return;
    const f = files[0];
    setFile(f);
    
    try {
      const arrayBuffer = await f.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      setPdfBytes(bytes);
      
      // Parse forms
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const form = pdfDoc.getForm();
      const extractedFields: FormField[] = [];
      const initialValues: Record<string, string> = {};
      
      const pdfFields = form.getFields();
      for (const field of pdfFields) {
        const name = field.getName();
        const type = field.constructor.name; // PDFTextField, PDFCheckBox, etc.
        
        // We will only support text fields in this simplified version
        if (type === 'PDFTextField') {
          const textField = form.getTextField(name);
          const value = textField.getText() || '';
          extractedFields.push({ name, type: 'text', value });
          initialValues[name] = value;
        }
      }
      
      if (extractedFields.length === 0) {
        setToast({ kind: 'error', message: 'No text fields found in this PDF form.' });
        setErrorMsg(null);
    setPhase('upload');
        return;
      }
      
      setFields(extractedFields);
      setFieldValues(initialValues);
      setPhase('fill');
    } catch (e) {
      console.error(e);
      setToast({ kind: 'error', message: 'Failed to load PDF or extract forms.' });
      setErrorMsg(null);
    setPhase('upload');
    }
  };

  const handleFill = async () => {
    if (!pdfBytes || !file) return;

    try {
      const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      const form = pdfDoc.getForm();
      
      for (const field of fields) {
        if (field.type === 'text') {
          const textField = form.getTextField(field.name);
          textField.setText(fieldValues[field.name] || '');
        }
      }

      // Flatten the form so it becomes part of the document
      form.flatten();

      const modifiedPdfBytes = await pdfDoc.save();
      
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.[^/.]+$/, "") + '_filled.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setPhase('done');
      setToast({ kind: 'success', message: 'PDF filled successfully!' });
    } catch (e) {
      console.error(e);
      setToast({ kind: 'error', message: 'Failed to fill PDF.' });
    }
  };

  const reset = () => {
    setErrorMsg(null);
    setPhase('upload');
    setFile(null);
    setPdfBytes(null);
    setFields([]);
    setFieldValues({});
  };

  return (
    <div className="flex flex-col gap-5">
      {toast && <Toast data={toast} onDismiss={() => setToast(null)} />}
      
      {phase === 'upload' && (
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone t={t} hasFiles={false} onFiles={handleFile} accept=".pdf" multiple={false} />
          <PrivacyLine t={t} />
        </div>
      )}

      {phase === 'fill' && file && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
          <div className="bg-surface dark:bg-surface-dark rounded-2xl p-6 border  shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent/10 dark:bg-teal-dark/10 flex items-center justify-center text-accent dark:text-teal-dark">
                <FormInput className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-ink dark:text-ink-dark line-clamp-1">{file.name}</h3>
                <p className="text-sm text-ink-muted dark:text-ink-muted-dark">Fill PDF Form</p>
              </div>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-ink dark:text-ink-dark mb-1">
                    {field.name}
                  </label>
                  <input 
                    type="text" 
                    value={fieldValues[field.name] || ''} 
                    onChange={e => setFieldValues({...fieldValues, [field.name]: e.target.value})} 
                    className="w-full rounded-md border  bg-surface dark:bg-surface-dark px-3 py-2 text-sm text-ink dark:text-ink-dark" 
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-4 border-t ">
              <button onClick={reset} className="px-4 py-2 text-sm font-medium text-ink dark:text-ink-dark hover:text-ink dark:hover:text-ink-dark">
                Cancel
              </button>
              <button onClick={handleFill} className="flex items-center gap-2 px-4 py-2 bg-accent dark:bg-teal-dark text-white text-sm font-medium rounded-lg hover:opacity-90 focus:ring-4 focus:ring-accent/20">
                <Download className="w-4 h-4" /> Save Filled PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-6">
            <Download className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-semibold text-ink dark:text-ink-dark mb-2">Done!</h2>
          <p className="text-ink-muted dark:text-ink-muted-dark mb-8">Your filled PDF has been downloaded.</p>
          <button onClick={reset} className="inline-flex items-center gap-2 px-4 py-2 bg-ink dark:bg-ink-dark text-white dark:text-bg-dark text-sm font-medium rounded-lg hover:opacity-90">
            <RefreshCw className="w-4 h-4" /> Fill Another
          </button>
        </div>
      )}
    </div>
  );
}
