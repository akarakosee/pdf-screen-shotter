import { useCallback, useEffect, useState, useRef } from 'react';
import { validatePdfFile } from '../app/validators';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { JobController } from '../app/JobController';

type Phase = 'upload' | 'processing' | 'player';

interface Props {
  t?: Strings;
}

export function AudioReaderShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [charIndex, setCharIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const controller = useRef<JobController | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize SpeechSynthesis Voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const avail = window.speechSynthesis.getVoices();
      if (avail.length > 0) {
        setVoices(avail);
        // Default to Turkish voice if on tr locale or default system voice
        const trVoice = avail.find(v => v.lang.startsWith('tr'));
        const enVoice = avail.find(v => v.lang.startsWith('en'));
        if (t.lang === 'tr' && trVoice) {
          setSelectedVoice(trVoice.name);
        } else if (enVoice) {
          setSelectedVoice(enVoice.name);
        } else {
          setSelectedVoice(avail[0].name);
        }
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [t.lang]);

  useEffect(() => {
    controller.current = new JobController({
      onFileError: (_, msg) => {
        setToast({ kind: 'error', message: msg === 'encrypted' ? t.encryptedFile : t.corruptFile });
        setPhase('upload');
      },
      onAudioReaderDone: async (result) => {
        if (result.output) {
          try {
            const txt = await result.output.text();
            if (txt.trim()) {
              setExtractedText(txt);
              setPhase('player');
            } else {
              setToast({ kind: 'error', message: 'No readable text found in this PDF.' });
              setPhase('upload');
            }
          } catch (e) {
            setToast({ kind: 'error', message: 'Failed to read extracted text.' });
            setPhase('upload');
          }
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: 'Failed to extract audio text.' });
        }
      }
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
    controller.current?.runAudioReader(f);
  }, [t]);

  // Audio Playback Controls
  const handlePlay = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setToast({ kind: 'error', message: 'Speech synthesis is not supported on this browser.' });
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    // Start speaking from current position or start
    const textToSpeak = charIndex > 0 ? extractedText.slice(charIndex) : extractedText;
    const utter = new SpeechSynthesisUtterance(textToSpeak);
    utter.rate = rate;
    utter.pitch = pitch;

    if (selectedVoice) {
      const v = voices.find(vox => vox.name === selectedVoice);
      if (v) utter.voice = v;
    }

    utter.onboundary = (event) => {
      if (event.name === 'word' || event.name === 'sentence') {
        setCharIndex((charIndex || 0) + event.charIndex);
      }
    };

    utter.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCharIndex(0);
    };

    utter.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCharIndex(0);
  };

  const changeSpeed = (newRate: number) => {
    setRate(newRate);
    if (isPlaying) {
      handleStop();
      setTimeout(() => {
        handlePlay();
      }, 50);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(extractedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadTxt = () => {
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    triggerDownload(blob, (file?.name.replace(/\.pdf$/i, '') || 'document') + '-text.txt');
  };

  const reset = useCallback(() => {
    if (typeof window !== 'undefined') window.speechSynthesis.cancel();
    setFile(null);
    setExtractedText('');
    setIsPlaying(false);
    setIsPaused(false);
    setCharIndex(0);
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
            <span>{t.converting || 'Extracting audio narration text...'}</span>
          </div>
          <div className="h-1 overflow-hidden rounded-lg bg-surface border dark:bg-surface-dark">
            <div className="h-full w-full origin-left animate-fake-progress progress-fill" />
          </div>
        </div>
      )}

      {phase === 'player' && extractedText && (
        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col gap-6 w-full mx-auto">
          
          {/* Main Audio Player Card */}
          <div className="rounded-2xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-6 shadow-md">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/80 dark:border-border-dark/80 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber/15 text-amber dark:bg-amber-dark/15 dark:text-amber-dark shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 5.636a9 9 0 0 1 0 12.728"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink dark:text-ink-dark truncate max-w-[280px] sm:max-w-[380px]">
                    {file?.name || 'PDF Document'}
                  </h3>
                  <p className="text-xs text-ink-muted dark:text-ink-muted-dark">
                    {extractedText.split(/\s+/).filter(Boolean).length} {t.lang === 'tr' ? 'Kelime Hazır' : 'Words Ready'}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  isPlaying 
                    ? 'bg-emerald-500/10 text-emerald-500 animate-pulse' 
                    : isPaused 
                    ? 'bg-amber/10 text-amber dark:text-amber-dark' 
                    : 'bg-border/60 dark:bg-border-dark/60 text-ink-muted dark:text-ink-muted-dark'
                }`}>
                  <span className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-emerald-500' : isPaused ? 'bg-amber dark:bg-amber-dark' : 'bg-ink-muted/50'}`} />
                  {isPlaying ? (t.lang === 'tr' ? 'Seslendiriliyor...' : 'Playing...') : isPaused ? (t.lang === 'tr' ? 'Duraklatıldı' : 'Paused') : (t.lang === 'tr' ? 'Hazır' : 'Ready')}
                </span>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-2">
              
              {/* Play / Pause / Stop Buttons */}
              <div className="flex items-center gap-2.5">
                {!isPlaying ? (
                  <button
                    type="button"
                    onClick={handlePlay}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber hover:bg-amber-dark text-black px-5 py-2.5 text-sm font-semibold shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                    <span>{isPaused ? (t.lang === 'tr' ? 'Devam Et' : 'Resume') : (t.lang === 'tr' ? 'Sesli Dinle' : 'Play Audio')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePause}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber/20 hover:bg-amber/30 text-amber dark:text-amber-dark px-5 py-2.5 text-sm font-semibold border border-amber/30 transition-all cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    <span>{t.lang === 'tr' ? 'Duraklat' : 'Pause'}</span>
                  </button>
                )}

                {(isPlaying || isPaused) && (
                  <button
                    type="button"
                    onClick={handleStop}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border dark:border-border-dark px-4 py-2.5 text-sm font-medium text-ink-muted hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark transition-all cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
                    <span>{t.lang === 'tr' ? 'Durdur' : 'Stop'}</span>
                  </button>
                )}
              </div>

              {/* Speed Buttons */}
              <div className="flex items-center gap-1 bg-surface-dark/5 dark:bg-surface-dark/40 p-1 rounded-xl border border-border/60 dark:border-border-dark/60">
                <span className="text-xs font-semibold px-2 text-ink-muted dark:text-ink-muted-dark">
                  {t.lang === 'tr' ? 'Hız:' : 'Speed:'}
                </span>
                {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => changeSpeed(s)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      rate === s
                        ? 'bg-amber text-black shadow-sm font-bold'
                        : 'text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Selector Row */}
            {voices.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/60 dark:border-border-dark/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <label className="text-xs font-medium text-ink-muted dark:text-ink-muted-dark flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                  {t.lang === 'tr' ? 'Okuyucu Sesi (Voice):' : 'Speech Voice:'}
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => {
                    setSelectedVoice(e.target.value);
                    if (isPlaying) {
                      handleStop();
                      setTimeout(handlePlay, 50);
                    }
                  }}
                  className="w-full sm:w-auto text-xs bg-bg dark:bg-bg-dark border border-border dark:border-border-dark rounded-lg px-3 py-1.5 text-ink dark:text-ink-dark focus:outline-none focus:border-amber cursor-pointer max-w-full sm:max-w-[340px]"
                >
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Text Reading & Preview Box */}
          <div className="rounded-2xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-border/80 dark:border-border-dark/80 pb-3 mb-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                {t.lang === 'tr' ? 'Belge Metni' : 'Document Text'}
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyText}
                  className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-amber dark:text-ink-muted-dark dark:hover:text-amber-dark transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  {copied ? (t.lang === 'tr' ? 'Kopyalandı!' : 'Copied!') : (t.lang === 'tr' ? 'Metni Kopyala' : 'Copy Text')}
                </button>
                <span className="text-border dark:text-border-dark">•</span>
                <button
                  type="button"
                  onClick={downloadTxt}
                  className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-amber dark:text-ink-muted-dark dark:hover:text-amber-dark transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  {t.lang === 'tr' ? 'TXT İndir' : 'Download TXT'}
                </button>
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto font-sans text-sm leading-relaxed text-ink/90 dark:text-ink-dark/90 whitespace-pre-wrap rounded-lg bg-bg/50 dark:bg-bg-dark/50 p-4 border border-border/50 dark:border-border-dark/50">
              {extractedText}
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 text-xs font-medium text-ink-muted hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
              {t.lang === 'tr' ? 'Başka Bir PDF Yükle' : 'Upload Another PDF'}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
