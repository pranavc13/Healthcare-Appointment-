import { clsx } from 'clsx';

const SIZES = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base',
};

const DOT_SIZES = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3' };
const STATUS_COLOR = { online: 'bg-emerald-500', offline: 'bg-text-muted', busy: 'bg-danger' };

export default function Avatar({ name, src, size = 'md', status, className }) {
  const initials = name
    ? name.trim().replace(/^Dr\.?\s*/i, '').split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
    : '?';

  return (
    <div className={clsx('relative inline-flex shrink-0', SIZES[size], className)}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full rounded-full object-cover" />
      ) : (
        <div className="w-full h-full rounded-full bg-brand-700 text-cream-100 font-semibold flex items-center justify-center ring-1 ring-inset ring-gold-400/30">
          {initials}
        </div>
      )}
      {status && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-brand-900',
            DOT_SIZES[size],
            STATUS_COLOR[status] || STATUS_COLOR.offline
          )}
        />
      )}
    </div>
  );
}
