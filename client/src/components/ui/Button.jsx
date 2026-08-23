import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'bg-white border border-border text-text-secondary hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700',
  danger: 'bg-danger-bg text-danger border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-900/40 dark:hover:bg-red-900/30',
  ghost: 'bg-transparent text-text-muted hover:bg-gray-100 hover:text-text-secondary dark:hover:bg-slate-800 dark:hover:text-slate-200',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
};

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, leftIcon: LeftIcon, rightIcon: RightIcon, className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        loading && 'pointer-events-none opacity-80',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {LeftIcon && <LeftIcon className="w-4 h-4 shrink-0" />}
          {children}
          {RightIcon && <RightIcon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
});

export default Button;
