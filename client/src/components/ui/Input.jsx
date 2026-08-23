import { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(function Input({ label, icon: Icon, error, className, containerClassName, ...props }, ref) {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-[0.14em] mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        )}
        <input
          ref={ref}
          className={clsx(
            'h-11 w-full rounded-xl border text-[13.5px] outline-none transition',
            'bg-white dark:bg-brand-900 text-text-primary dark:text-cream-100 placeholder:text-text-muted',
            Icon ? 'pl-10 pr-3.5' : 'px-3.5',
            error
              ? 'border-danger/50 focus:border-danger focus:ring-2 focus:ring-danger/15'
              : 'border-border dark:border-brand-200/15 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
});

export default Input;
