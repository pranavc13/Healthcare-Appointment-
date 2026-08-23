import { clsx } from 'clsx';

export function Skeleton({ className }) {
  return <div className={clsx('animate-pulse bg-gray-200 dark:bg-slate-700 rounded-md', className)} />;
}

export function StatSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-border dark:border-slate-700 shadow-sm p-5">
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-7 w-12" />
    </div>
  );
}

export function AppointmentCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-border dark:border-slate-700 shadow-sm p-4 flex items-center gap-4">
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
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-border dark:border-slate-700 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-12 h-12 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full mb-4" />
      <Skeleton className="h-8 w-24" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div>
      <div className="bg-gray-50 dark:bg-slate-900/40 border-b border-border dark:border-slate-700 px-4 py-3">
        <Skeleton className="h-3 w-24" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 px-4 py-3 border-b border-gray-100 dark:border-slate-700 last:border-0">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
