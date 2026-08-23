import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarCheck, Phone } from 'lucide-react';
import { Reveal } from '../components/motion';

export default function CTABand() {
  return (
    <section className="px-5 sm:px-8 pb-20 pt-4 bg-cream-50 dark:bg-brand-950">
      <Reveal className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-800 dark:bg-brand-900 text-cream-100 arc-lines px-7 sm:px-12 py-11 sm:py-14">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute -right-24 -top-24 w-72 h-72 rounded-full border border-cream-100/10"
            aria-hidden
          />
          <div className="absolute -left-16 -bottom-20 w-64 h-64 rounded-full bg-gold-500/10 blur-2xl animate-float" aria-hidden />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="w-14 h-14 rounded-2xl bg-cream-100/10 border border-cream-100/15 flex items-center justify-center">
                <CalendarCheck className="w-6 h-6 text-gold-300" strokeWidth={1.75} />
              </div>
              <h2 className="mt-6 font-display text-[2rem] sm:text-[2.6rem] leading-[1.1] font-semibold">
                Your health deserves
                <br />
                the <span className="text-gold-gradient italic">best care</span>.
              </h2>
              <p className="mt-4 text-[14.5px] leading-relaxed text-brand-200">
                Book today and experience appointments that confirm instantly, remind you on time and
                follow up on their own.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 shrink-0">
              <Link
                to="/doctors"
                className="shine inline-flex items-center justify-center gap-2.5 h-[54px] px-8 rounded-full bg-gold-400 hover:bg-gold-300 text-brand-900 text-[15px] font-bold transition-colors"
              >
                <CalendarCheck className="w-[18px] h-[18px]" />
                Book Appointment
              </Link>
              <a
                href="tel:+911800123456"
                className="inline-flex items-center justify-center gap-2.5 h-[54px] px-8 rounded-full border border-cream-100/25 text-cream-100 text-[15px] font-semibold hover:bg-cream-100/10 transition-colors"
              >
                <Phone className="w-[18px] h-[18px]" />
                1800 123 456
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
