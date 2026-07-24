import { useEffect, useRef, useState } from 'react';
import type { JobController } from '../app/JobController';

interface PageCardProps {
  page: number;
  file: File;
  controller: JobController;
  isSelected: boolean;
  onToggle: (page: number) => void;
  index: number;
}

export function PageCard({ page, file, controller, isSelected, onToggle, index }: PageCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

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
      onClick={() => onToggle(page)}
      style={{ ...(enterDelay > 0 ? { animationDelay: `${enterDelay}ms` } : {}) }}
      className={`
        relative flex flex-col items-center justify-center rounded-xl overflow-hidden
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

      {thumbUrl ? (
        <img
          src={thumbUrl}
          alt={`Page ${page}`}
          className="w-full h-full object-contain p-2"
          loading="lazy"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-ink/40 dark:text-ink-dark/40 animate-pulse">
          <span className="text-sm font-medium">Loading...</span>
        </div>
      )}

      {/* Page number badge */}
      <div className={`
        absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-xs font-semibold backdrop-blur-md transition-colors
        ${isSelected 
          ? 'bg-amber text-white dark:bg-amber-dark' 
          : 'bg-surface/80 dark:bg-surface-200/80 text-ink/70 dark:text-ink-dark/70'}
      `}>
        {page}
      </div>
    </button>
  );
}
