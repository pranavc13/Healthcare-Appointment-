import Card from './Card';

export default function Stat({ icon: Icon, label, value, loading, iconClassName = 'text-primary bg-primary-light' }) {
  return (
    <Card className="!p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-text-primary dark:text-white mt-1">{loading ? '—' : value}</p>
        </div>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconClassName}`}>
            <Icon className="w-[18px] h-[18px]" />
          </div>
        )}
      </div>
    </Card>
  );
}
