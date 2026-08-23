import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(function Select({ label, error, className, containerClassName, children, ...props }, ref) {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5">{label}</label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={clsx(
            'h-10 w-full appearance-none rounded-lg border text-sm outline-none transition pl-3 pr-9',
            'bg-white dark:bg-slate-900 text-text-primary dark:text-white',
            error
              ? 'border-red-300 focus:border-danger focus:ring-2 focus:ring-red-100 dark:border-red-900'
              : 'border-border dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
});

export default Select;
