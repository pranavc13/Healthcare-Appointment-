import { useState } from 'react';
import { clsx } from 'clsx';

/**
 * Image with a tinted gradient underlay that stays visible while loading and
 * remains in place if the source ever fails, so a broken URL degrades into a
 * deliberate-looking block rather than a torn layout.
 */
export default function SmartImage({ src, alt, className, imgClassName, children, priority = false }) {
  const [state, setState] = useState('loading');

  return (
    <div className={clsx('relative overflow-hidden bg-brand-800', className)}>
      <div
        className={clsx(
          'absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 transition-opacity duration-700',
          state === 'loaded' ? 'opacity-0' : 'opacity-100'
        )}
        aria-hidden
      />
      {state !== 'error' && (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
          className={clsx(
            'w-full h-full object-cover transition-all duration-[900ms] ease-out',
            state === 'loaded' ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-md',
            imgClassName
          )}
        />
      )}
      {children}
    </div>
  );
}
