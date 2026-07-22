import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
}

const base =
  'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-s px-4 text-sm font-medium ' +
  'disabled:opacity-50 disabled:pointer-events-none';

// ADR-005 motion: surfaced variants get .btn-motion (hover lift + pseudo-shadow
// fade, active press); ghost has no surface to lift, keeps a color transition.
const variants: Record<Variant, string> = {
  primary:
    'btn-motion bg-gradient-to-r from-amber to-[#F0C778] text-[#1D1108] shadow-[0_14px_32px_-12px_rgba(232,182,95,0.5)] hover:brightness-[0.97] dark:from-amber-dark dark:to-[#F0C778]',
  secondary:
    'btn-motion border bg-surface text-ink hover:bg-bg dark:bg-surface-dark dark:text-ink-dark dark:hover:bg-bg-dark',
  ghost:
    'transition-colors duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)] text-ink-muted hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark',
  danger: 'btn-motion bg-danger text-white hover:opacity-90',
};

export function Button({
  variant = 'primary',
  loading = false,
  children,
  disabled,
  className = '',
  ...rest
}: Props) {
  return (
    <button
      type="button"
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
