import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function VerifiedBadge({ size = 'md', showLabel = true }) {
  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span className="inline-flex items-center gap-1 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-gold-300 border border-brand-200 dark:border-brand-800 px-2 py-0.5 rounded-full text-xs font-semibold">
      <ShieldCheck className={`${sizes[size]} shrink-0`} />
      {showLabel && 'Verified'}
    </span>
  );
}
