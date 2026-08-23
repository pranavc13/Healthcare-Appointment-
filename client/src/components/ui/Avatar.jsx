import { clsx } from 'clsx';

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

const DOT_SIZES = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3' };
const STATUS_COLOR = { online: 'bg-emerald-500', offline: 'bg-gray-300', busy: 'bg-red-500' };

export default function Avatar({ name, src, size = 'md', status, className }) {
  const initials = name
    ? name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
    : '?';

  return (
    <div className={clsx('relative inline-flex shrink-0', SIZES[size], className)}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full rounded-full object-cover" />
      ) : (
        <div className="w-full h-full rounded-full bg-primary-light text-primary font-medium flex items-center justify-center">
          {initials}
        </div>
      )}
      {status && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-slate-800',
            DOT_SIZES[size],
            STATUS_COLOR[status] || STATUS_COLOR.offline
          )}
        />
      )}
    </div>
  );
}
