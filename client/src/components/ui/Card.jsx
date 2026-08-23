import { clsx } from 'clsx';

export default function Card({ hoverable = false, fullBleed = false, className, children, ...props }) {
  return (
    <div
      className={clsx(
        'bg-white dark:bg-slate-800 rounded-xl border border-border dark:border-slate-700 shadow-sm overflow-hidden',
        !fullBleed && 'p-6',
        hoverable && 'hover:border-border-hover dark:hover:border-slate-600 hover:shadow transition-all duration-150 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={clsx('bg-gray-50 dark:bg-slate-900/40 border-b border-border dark:border-slate-700 px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={clsx('text-base font-semibold text-text-primary dark:text-white', className)} {...props}>
      {children}
    </h3>
  );
}
