import { clsx } from 'clsx';

const VARIANTS = {
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/40',
  pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/40',
  cancelled: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/40',
  rescheduled: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  completed: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/40',
  high: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/40',
  medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/40',
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/40',
  neutral: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
};

const DOT = {
  confirmed: 'bg-emerald-500',
  pending: 'bg-amber-500',
  cancelled: 'bg-red-500',
  rescheduled: 'bg-slate-400',
  completed: 'bg-blue-500',
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
  neutral: 'bg-gray-400',
};

export default function Badge({ variant = 'neutral', dot = true, className, children }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border whitespace-nowrap',
        VARIANTS[variant] || VARIANTS.neutral,
        className
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', DOT[variant] || DOT.neutral)} />}
      {children}
    </span>
  );
}
