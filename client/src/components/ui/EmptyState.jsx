export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="max-w-sm mx-auto text-center py-16">
      {Icon && <Icon className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" strokeWidth={1.5} />}
      {title && <h3 className="text-text-primary dark:text-white font-semibold">{title}</h3>}
      {description && <p className="text-text-secondary dark:text-slate-400 text-sm mt-1.5">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
