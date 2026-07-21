import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
}

const base =
  'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-s px-4 text-sm font-medium ' +
  'transition-colors duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)] disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  secondary:
    'border bg-surface text-ink hover:bg-bg dark:bg-surface-dark dark:text-ink-dark dark:hover:bg-bg-dark',
  ghost:
    'text-ink-muted hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark',
  danger: 'bg-danger text-white hover:opacity-90',
};

export function Button({ variant = 'primary', loading = false, children, disabled, ...rest }: Props) {
  return (
    <button
      type="button"
      className={`${base} ${variants[variant]}`}
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
