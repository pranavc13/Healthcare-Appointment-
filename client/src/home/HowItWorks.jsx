import { motion } from 'framer-motion';
import { CalendarCheck, ClipboardList, MessageSquareText, Search } from 'lucide-react';
import { Reveal, RevealGroup, RevealItem } from '../components/motion';

const STEPS = [
  { icon: Search, title: 'Find your specialist', body: 'Filter by speciality, city, fee and experience across the full directory.' },
  { icon: CalendarCheck, title: 'Hold a real slot', body: 'Live availability with a short reservation window while you finish booking.' },
  { icon: ClipboardList, title: 'Describe your symptoms', body: 'Your answers become an urgency-rated brief your doctor reads beforehand.' },
  { icon: MessageSquareText, title: 'Leave with a plan', body: 'A plain-language summary, prescription schedule and reminders, by email.' },
];

export default function HowItWorks() {
  return (
    <section className="relative py-24 lg:py-32 px-5 sm:px-8 bg-cream-50 dark:bg-brand-950 overflow-hidden">
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent dark:via-brand-200/10 hidden lg:block" aria-hidden />

      <div className="relative max-w-7xl mx-auto">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">How It Works</p>
          <h2 className="mt-4 font-display text-4xl sm:text-[2.75rem] leading-[1.1] font-semibold text-brand-900 dark:text-cream-100">
            Four steps, <span className="text-gold-gradient italic">no phone tag</span>
          </h2>
        </Reveal>

        <RevealGroup className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6" stagger={0.13}>
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <RevealItem key={title} className="relative group">
              <div className="surface-card rounded-2xl p-7 h-full transition-all duration-400 group-hover:-translate-y-2 group-hover:shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="w-12 h-12 rounded-full bg-brand-700 text-cream-100 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </span>
                  <span className="font-display text-5xl font-semibold text-cream-200 dark:text-brand-800 select-none leading-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="mt-6 font-semibold text-[16px] text-brand-900 dark:text-cream-100">{title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-text-secondary dark:text-brand-200">{body}</p>
              </div>

              {i < STEPS.length - 1 && (
                <motion.span
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.35 + i * 0.13 }}
                  className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gold-400 origin-left"
                  aria-hidden
                />
              )}
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
