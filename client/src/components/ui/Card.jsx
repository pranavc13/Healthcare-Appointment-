import { clsx } from 'clsx';

export default function Card({ hoverable = false, fullBleed = false, className, children, ...props }) {
  return (
    <div
      className={clsx(
        'surface-card rounded-2xl overflow-hidden',
        !fullBleed && 'p-6',
        hoverable && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-lift cursor-pointer',
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
    <div
      className={clsx(
        'bg-cream-100 dark:bg-brand-900/60 border-b border-border dark:border-brand-200/10 px-6 py-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={clsx('font-display text-[17px] font-semibold text-text-primary dark:text-cream-100', className)}
      {...props}
    >
      {children}
    </h3>
  );
}
