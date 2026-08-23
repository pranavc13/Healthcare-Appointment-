import { clsx } from 'clsx';

export function Skeleton({ className }) {
  return <div className={clsx('animate-pulse bg-cream-200 dark:bg-brand-800 rounded-md', className)} />;
}

export function StatSkeleton() {
  return (
    <div className="surface-card p-5">
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-7 w-12" />
    </div>
  );
}

export function AppointmentCardSkeleton() {
  return (
    <div className="surface-card p-4 flex items-center gap-4">
      <Skeleton className="w-14 h-14 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-3 w-1/5" />
      </div>
    </div>
  );
}

export function DoctorCardSkeleton() {
  return (
    <div className="surface-card rounded-2xl overflow-hidden">
      <Skeleton className="w-full aspect-[4/3] rounded-none" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="pt-3 flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div>
      <div className="bg-cream-100 dark:bg-brand-900/40 border-b border-border dark:border-brand-200/10 px-4 py-3">
        <Skeleton className="h-3 w-24" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 px-4 py-3 border-b border-border dark:border-brand-200/10 last:border-0">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
