export function InputField({ label, type = 'text', icon: Icon, ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-sand-700 dark:text-sand-200 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 text-sand-400 dark:text-brand-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        )}
        <input
          type={type}
          className={`w-full ${Icon ? 'pl-10 pr-3.5' : 'px-3.5'} py-2.5 rounded-xl border border-sand-200 dark:border-brand-800 bg-white dark:bg-brand-900 text-sm text-sand-900 dark:text-white placeholder:text-sand-400 dark:placeholder:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow disabled:opacity-60 disabled:cursor-not-allowed`}
          {...props}
        />
      </div>
    </div>
  );
}
