import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(function Select({ label, error, className, containerClassName, children, ...props }, ref) {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-[0.14em] mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={clsx(
            'h-11 w-full appearance-none rounded-xl border text-[13.5px] outline-none transition pl-3.5 pr-10',
            'bg-white dark:bg-brand-900 text-text-primary dark:text-cream-100',
            error
              ? 'border-danger/50 focus:border-danger focus:ring-2 focus:ring-danger/15'
              : 'border-border dark:border-brand-200/15 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="w-4 h-4 text-text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
});

export default Select;
