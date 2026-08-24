import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarCheck, Star, ShieldCheck, Activity } from 'lucide-react';
import SmartImage from '../components/SmartImage';
import { AnimatedHeading, CountUp, EASE, Parallax } from '../components/motion';
import { IMAGES } from './images';
import { CLINIC_LOCALITY, CLINIC_CITY, COMBINED_YEARS_EXPERIENCE, PATIENTS_TREATED } from '../clinicInfo';

export default function Hero({ stats, doctors = [] }) {
  const faces = doctors.length ? doctors : [null, null];

  return (
    <section className="relative overflow-hidden bg-cream-100 dark:bg-brand-950 grain-overlay">
      {/* Ambient wash */}
      <div className="absolute -top-40 -left-40 w-[560px] h-[560px] rounded-full bg-brand-200/40 dark:bg-brand-700/20 blur-3xl animate-float-slow pointer-events-none" aria-hidden />
      <div className="absolute top-24 right-0 w-[520px] h-[520px] rounded-full bg-gold-200/40 dark:bg-gold-700/10 blur-3xl animate-float pointer-events-none" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-28 sm:pt-32 lg:pt-36 pb-24 lg:pb-40">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
          {/* ── Copy ── */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="eyebrow"
            >
              {CLINIC_LOCALITY}, {CLINIC_CITY} · Dental Care
            </motion.p>

            <h1 className="mt-5 font-display text-[2.75rem] leading-[1.04] sm:text-6xl lg:text-[4.35rem] font-semibold text-brand-900 dark:text-cream-100">
              <AnimatedHeading text="Healthy Smiles," delay={0.15} className="block" />
              <AnimatedHeading
                text="Booked in Seconds."
                delay={0.4}
                className="block"
                wordClassName="text-gold-gradient italic"
              />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.75, ease: EASE }}
              className="mt-7 text-[17px] leading-relaxed text-text-secondary dark:text-brand-200 max-w-lg"
            >
              Book a visit with Dr. Rohith Rajashekhar or Dr. Shanmukha B S, hold your slot instantly,
              and walk in with an AI-prepared summary already waiting for your dentist.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.9, ease: EASE }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/doctors"
                className="shine group inline-flex items-center gap-2.5 h-[54px] px-7 rounded-full bg-brand-700 hover:bg-brand-800 text-cream-100 text-[15px] font-semibold shadow-lift transition-colors"
              >
                <CalendarCheck className="w-[18px] h-[18px]" />
                Book Appointment
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/ai-assistant"
                className="group inline-flex items-center gap-2.5 h-[54px] px-6 rounded-full border border-brand-700/25 dark:border-brand-200/25 text-brand-800 dark:text-cream-100 text-[15px] font-semibold hover:bg-white/70 dark:hover:bg-brand-800/50 transition-colors"
              >
                <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gold-400 text-brand-900">
                  <span className="absolute inset-0 rounded-full bg-gold-400 animate-pulse-ring" aria-hidden />
                  <Activity className="relative w-4 h-4" />
                </span>
                Check Symptoms
              </Link>
            </motion.div>

            {/* Trust row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 1.1 }}
              className="mt-10 flex flex-wrap items-center gap-5"
            >
              <div className="flex -space-x-3">
                {faces.map((doc, i) => (
                  <motion.div
                    key={doc?._id || i}
                    initial={{ opacity: 0, scale: 0.5, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ delay: 1.15 + i * 0.08, type: 'spring', stiffness: 260, damping: 18 }}
                    whileHover={{ y: -5, zIndex: 10 }}
                    className="relative"
                  >
                    <SmartImage
                      src={doc?.profileImage || IMAGES.team}
                      alt={doc?.userId?.name || ''}
                      className="w-11 h-11 rounded-full ring-[3px] ring-cream-100 dark:ring-brand-950"
                    />
                  </motion.div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-900 dark:text-cream-100">
                  Trusted by <CountUp value={PATIENTS_TREATED} suffix="+" /> patients
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.4, rotate: -40 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ delay: 1.35 + i * 0.07, type: 'spring', stiffness: 300, damping: 14 }}
                    >
                      <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                    </motion.span>
                  ))}
                  <span className="ml-1 text-xs font-semibold text-text-secondary dark:text-brand-200">
                    {stats?.avgRating ? stats.avgRating.toFixed(1) : '4.8'}/5
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Visual ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: EASE }}
            className="relative"
          >
            <SmartImage
              src={IMAGES.heroClinic}
              alt="A calm, modern dental treatment room"
              priority
              className="rounded-[2rem] aspect-[4/5] sm:aspect-[5/5] lg:aspect-[4/4.6] shadow-lift"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/55 via-transparent to-transparent" aria-hidden />
            </SmartImage>

            {/* Floating: combined experience */}
            <Parallax distance={26} className="absolute -left-3 sm:-left-8 top-10 sm:top-16">
              <motion.div
                initial={{ opacity: 0, x: -28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 1.05, ease: EASE }}
                className="glass rounded-2xl border border-white/60 dark:border-brand-200/15 shadow-lift px-4 py-3.5 w-[196px]"
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex w-2 h-2">
                    <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 animate-pulse-ring" />
                    <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
                  </span>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Now accepting</p>
                </div>
                <p className="mt-2 font-display text-2xl font-semibold text-brand-900 dark:text-cream-100">
                  <CountUp value={COMBINED_YEARS_EXPERIENCE} suffix="+" />
                </p>
                <p className="text-[11px] text-text-secondary dark:text-brand-200">years, both dentists combined</p>
              </motion.div>
            </Parallax>

            {/* Floating: promise card */}
            <Parallax distance={-24} className="absolute -right-2 sm:-right-6 bottom-8">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.2, ease: EASE }}
                className="rounded-2xl bg-brand-800 text-cream-100 shadow-lift px-5 py-4 w-[230px] arc-lines"
              >
                <ShieldCheck className="w-6 h-6 text-gold-300" />
                <p className="mt-2.5 font-display text-[17px] leading-snug font-semibold">
                  Excellence in every detail.
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-brand-200">
                  Your comfort. Your smile. Our priority.
                </p>
              </motion.div>
            </Parallax>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
