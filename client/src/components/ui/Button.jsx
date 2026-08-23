import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-brand-700 text-cream-100 hover:bg-brand-800 shadow-soft',
  accent: 'bg-gold-400 text-brand-900 hover:bg-gold-300 shadow-soft',
  secondary:
    'bg-white border border-border text-text-secondary hover:bg-cream-100 hover:border-border-hover ' +
    'dark:bg-brand-900 dark:border-brand-200/15 dark:text-brand-200 dark:hover:bg-brand-800',
  danger:
    'bg-danger-bg text-danger border border-danger/25 hover:bg-danger/10 ' +
    'dark:bg-red-900/20 dark:border-red-900/40 dark:hover:bg-red-900/30',
  ghost:
    'bg-transparent text-text-muted hover:bg-cream-200 hover:text-text-secondary ' +
    'dark:hover:bg-brand-800 dark:hover:text-cream-100',
};

const SIZES = {
  sm: 'h-9 px-3.5 text-xs gap-1.5',
  md: 'h-11 px-5 text-[13.5px] gap-2',
  lg: 'h-12 px-6 text-sm gap-2',
};

const Button = forwardRef(function Button(
  {
    variant = 'primary', size = 'md', loading = false,
    leftIcon: LeftIcon, rightIcon: RightIcon,
    className, children, disabled, type = 'button', ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={clsx(
        'group inline-flex items-center justify-center rounded-full font-semibold',
        'transition-all duration-200 active:scale-[0.98]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2',
        'dark:focus-visible:ring-offset-brand-950',
        'disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100',
        loading && 'pointer-events-none opacity-80',
        VARIANTS[variant] || VARIANTS.primary,
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
          {RightIcon && (
            <RightIcon className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
          )}
        </>
      )}
    </button>
  );
});

export default Button;
