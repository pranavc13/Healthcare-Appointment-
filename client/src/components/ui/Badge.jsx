import { clsx } from 'clsx';

const VARIANTS = {
  confirmed: 'bg-success-bg text-success border-success/25 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/40',
  pending: 'bg-warning-bg text-warning border-warning/25 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/40',
  cancelled: 'bg-danger-bg text-danger border-danger/25 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/40',
  rescheduled: 'bg-cream-200 text-text-secondary border-border dark:bg-brand-800 dark:text-brand-200 dark:border-brand-200/15',
  completed: 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-800 dark:text-brand-200 dark:border-brand-200/15',
  high: 'bg-danger-bg text-danger border-danger/25 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/40',
  medium: 'bg-warning-bg text-warning border-warning/25 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/40',
  low: 'bg-success-bg text-success border-success/25 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/40',
  accent: 'bg-gold-50 text-gold-700 border-gold-200 dark:bg-gold-900/20 dark:text-gold-300 dark:border-gold-700/40',
  neutral: 'bg-cream-200 text-text-secondary border-border dark:bg-brand-800 dark:text-brand-200 dark:border-brand-200/15',
};

const DOT = {
  confirmed: 'bg-success',
  pending: 'bg-warning',
  cancelled: 'bg-danger',
  rescheduled: 'bg-text-muted',
  completed: 'bg-brand-600',
  high: 'bg-danger',
  medium: 'bg-warning',
  low: 'bg-success',
  accent: 'bg-gold-500',
  neutral: 'bg-text-muted',
};

export default function Badge({ variant = 'neutral', dot = true, className, children }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap',
        VARIANTS[variant] || VARIANTS.neutral,
        className
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', DOT[variant] || DOT.neutral)} />}
      {children}
    </span>
  );
}
