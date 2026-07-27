import { useEffect, useRef, useState } from 'react';
import type { JobController } from '../app/JobController';

interface PageCardProps {
  page: number;
  file: File;
  controller: JobController;
  isSelected?: boolean;
  onToggle?: (page: number) => void;
  index: number;
  rotation?: number;
  badgeText?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageCard({ page, file, controller, isSelected, onToggle, index, rotation = 0, badgeText, children }: PageCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [minLoadingDone, setMinLoadingDone] = useState(false);

  // Enforce a minimum 1-second loading animation
  useEffect(() => {
    const timer = setTimeout(() => setMinLoadingDone(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Staggered enter animation freezing (Rule #3)
  const [hasEntered, setHasEntered] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setHasEntered(true), 600);
    return () => clearTimeout(timer);
  }, []);

  // IntersectionObserver for lazy loading thumbnails
  useEffect(() => {
    if (!cardRef.current || thumbUrl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Pre-load slightly before it enters the viewport
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [thumbUrl]);

  // Load thumbnail when visible
  useEffect(() => {
    if (!isIntersecting || thumbUrl) return;

    let active = true;
    controller.previewPage(file, page).then((blob) => {
      if (active) setThumbUrl(URL.createObjectURL(blob));
    }).catch(() => {
      // Thumbnails can fail (e.g., worker busy), we just leave it blank
    });

    return () => { active = false; };
  }, [isIntersecting, thumbUrl, controller, file, page]);

  const enterDelay = hasEntered ? 0 : index * 40;

  return (
    <button
      ref={cardRef}
      onClick={() => onToggle?.(page)}
      style={{ ...(enterDelay > 0 ? { animationDelay: `${enterDelay}ms` } : {}) }}
      className={`
        relative w-full flex flex-col items-center justify-center rounded-xl overflow-hidden
        aspect-[1/1.4] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
        border-2 select-none group
        ${!hasEntered ? 'chip-enter' : ''}
        ${
          isSelected
            ? 'border-amber dark:border-amber-dark bg-amber/5 dark:bg-amber-dark/10 shadow-[0_0_20px_rgba(232,182,95,0.25)] scale-[1.02] z-10'
            : 'border-ink/10 dark:border-surface-200 bg-surface/50 dark:bg-surface-100 hover:border-ink/20 dark:hover:border-surface-300 hover:scale-[1.01]'
        }
      `}
    >
      {/* 3D Glassmorphic overlay for unselected state to create depth */}
      {!isSelected && (
        <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}

      {/* Loading Animation Layer */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
          thumbUrl && minLoadingDone ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {(() => {
          const LINE_PATTERNS = [
            [72, 45, 58],
            [60, 80, 40],
            [50, 65, 70],
            [85, 40, 50],
            [55, 75, 45],
          ];
          const ACCENTS = ['teal', 'russet', 'amber', 'teal', 'russet'];
          const lines = LINE_PATTERNS[index % LINE_PATTERNS.length];
          const accent = ACCENTS[index % ACCENTS.length];
          const staggerDelay = 0; // Synchronized start for all cards

          return (
            <div className="relative flex w-full h-full flex-col justify-start gap-1.5 p-3">
              <span className="card-load-scan" style={{ animationDelay: `${staggerDelay}ms` }} />
              <span className="card-load-sparkle" style={{ animationDelay: `${staggerDelay + 300}ms` }} />
              <div
                className="card-load-title bg-amber dark:bg-amber-dark"
                style={{ animationDelay: `${staggerDelay}ms` }}
              />
              {lines.map((w, li) => (
                <div
                  key={li}
                  className="card-load-line bg-ink-muted/40 dark:bg-ink-muted-dark/40"
                  style={{ width: `${w}%`, animationDelay: `${staggerDelay + 50 * (li + 1)}ms` }}
                />
              ))}
              <div
                className={`card-load-accent ${
                  accent === 'teal' ? 'bg-accent dark:bg-teal-dark' :
                  accent === 'russet' ? 'bg-russet' :
                  'bg-amber dark:bg-amber-dark'
                }`}
                style={{ animationDelay: `${staggerDelay + 50 * (lines.length + 1)}ms` }}
              />
            </div>
          );
        })()}
      </div>

      {/* Actual Thumbnail Image Layer */}
      {thumbUrl && (
        <img
          src={thumbUrl}
          alt={`Page ${page}`}
          style={{ transform: `rotate(${rotation}deg)` }}
          className={`w-full h-full object-contain p-2 transition-all duration-500 ease-in-out ${
            minLoadingDone ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />
      )}

      {/* Page number badge */}
      <div className={`
        absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-xs font-semibold backdrop-blur-md transition-all duration-500 ease-in-out
        bg-ink dark:bg-surface-dark text-amber shadow-lg
        ${thumbUrl && minLoadingDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}>
        {badgeText ?? page}
      </div>

      {/* Children (e.g. hover controls) hidden during loading animation */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${thumbUrl && minLoadingDone ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {children}
      </div>
    </button>
  );
}
