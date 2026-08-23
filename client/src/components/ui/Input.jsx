import { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(function Input({ label, icon: Icon, error, className, containerClassName, ...props }, ref) {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5">{label}</label>
      )}
      <div className="relative">
        {Icon && <Icon className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />}
        <input
          ref={ref}
          className={clsx(
            'h-10 w-full rounded-lg border text-sm outline-none transition',
            'bg-white dark:bg-slate-900 text-text-primary dark:text-white placeholder:text-text-muted',
            Icon ? 'pl-10 pr-3' : 'px-3',
            error
              ? 'border-red-300 focus:border-danger focus:ring-2 focus:ring-red-100 dark:border-red-900'
              : 'border-border dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30',
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
