export function InputField({ label, type = 'text', icon: Icon, className = '', ...props }) {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted mb-2">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        )}
        <input
          type={type}
          className={`h-12 w-full ${Icon ? 'pl-10 pr-3.5' : 'px-3.5'} rounded-xl border border-border dark:border-brand-200/15 bg-white dark:bg-brand-900 text-[14px] text-brand-900 dark:text-cream-100 placeholder:text-text-muted outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15 disabled:opacity-60 disabled:cursor-not-allowed`}
          {...props}
        />
      </div>
    </div>
  );
}
