import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Quote, Star } from 'lucide-react';
import SmartImage from './SmartImage';
import { CountUp, EASE } from './motion';
import { IMAGES } from '../home/images';
import { COMBINED_YEARS_EXPERIENCE } from '../clinicInfo';

/**
 * Split-screen frame shared by the login and register pages: form on the left,
 * a photographic brand panel on the right.
 */
export default function AuthShell({ eyebrow, title, subtitle, children, footer, quote }) {
  return (
    <div className="min-h-screen flex bg-cream-50 dark:bg-brand-950 text-left">
      {/* ── Form column ── */}
      <div className="relative w-full lg:w-[52%] px-5 py-10 sm:px-10 flex flex-col overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[440px] h-[440px] rounded-full bg-brand-100/60 dark:bg-brand-800/30 blur-3xl animate-float-slow pointer-events-none"
          aria-hidden
        />

        <div className="relative">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 group w-fit"
          >
            <img src="/logo.png" alt="" className="w-9 h-9 rounded-full bg-white object-cover ring-1 ring-brand-900/10 shadow-sm" />
            <span className="font-display text-[19px] font-semibold tracking-tight text-brand-900 dark:text-cream-100">
              DocConnect
            </span>
          </Link>
        </div>

        <div className="relative flex-1 flex flex-col justify-center py-10">
          <div className="w-full max-w-[420px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              {eyebrow && <p className="eyebrow">{eyebrow}</p>}
              <h1 className="mt-3.5 font-display text-[2rem] sm:text-[2.4rem] leading-[1.1] font-semibold text-brand-900 dark:text-cream-100">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-3 text-[14px] leading-relaxed text-text-secondary dark:text-brand-200">
                  {subtitle}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12, ease: EASE }}
              className="mt-8"
            >
              {children}
            </motion.div>

            {footer && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mt-6 text-center text-[13.5px] text-text-secondary dark:text-brand-200"
              >
                {footer}
              </motion.div>
            )}
          </div>
        </div>

        <Link
          to="/"
          className="relative inline-flex items-center gap-2 text-[12.5px] font-semibold text-text-muted hover:text-brand-700 dark:hover:text-gold-300 transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </Link>
      </div>

      {/* ── Brand panel ── */}
      <div className="hidden lg:block relative w-[48%] p-3">
        <SmartImage
          src={IMAGES.consult}
          alt=""
          priority
          className="w-full h-full rounded-[1.75rem]"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/70 to-brand-900/40" aria-hidden />
          <div className="absolute inset-0 arc-lines opacity-60" aria-hidden />

          <div className="absolute inset-0 flex flex-col justify-end p-10 text-cream-100">
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
            >
              <Quote className="w-9 h-9 text-gold-300 rotate-180" strokeWidth={1.5} />
              <p className="mt-5 font-display text-[26px] leading-[1.25] font-semibold max-w-md">
                {quote || 'Care that confirms instantly, reminds you on time, and follows up on its own.'}
              </p>

              <div className="mt-8 flex items-center gap-8">
                <div>
                  <p className="font-display text-[26px] font-semibold leading-none">2</p>
                  <p className="mt-1.5 text-[11.5px] uppercase tracking-[0.16em] text-brand-200">Dentists</p>
                </div>
                <div className="w-px h-10 bg-cream-100/20" />
                <div>
                  <p className="font-display text-[26px] font-semibold leading-none">
                    <CountUp value={COMBINED_YEARS_EXPERIENCE} suffix="+" />
                  </p>
                  <p className="mt-1.5 text-[11.5px] uppercase tracking-[0.16em] text-brand-200">Years exp.</p>
                </div>
                <div className="w-px h-10 bg-cream-100/20" />
                <div>
                  <p className="flex items-center gap-1.5 font-display text-[26px] font-semibold leading-none">
                    4.8 <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
                  </p>
                  <p className="mt-1.5 text-[11.5px] uppercase tracking-[0.16em] text-brand-200">Rating</p>
                </div>
              </div>
            </motion.div>
          </div>
        </SmartImage>
      </div>
    </div>
  );
}
