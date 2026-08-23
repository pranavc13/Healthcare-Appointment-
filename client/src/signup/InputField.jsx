export function InputField({ label, type = 'text', icon: Icon, ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        )}
        <input
          type={type}
          className={`w-full ${Icon ? 'pl-10 pr-3.5' : 'px-3.5'} py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow disabled:opacity-60 disabled:cursor-not-allowed`}
          {...props}
        />
      </div>
    </div>
  );
}
