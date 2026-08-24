import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, FileHeart, Pill, Siren, Sparkles } from 'lucide-react';
import { EASE, Reveal, RevealGroup, RevealItem } from '../components/motion';

const QUESTIONS = [
  'How long has the sensitivity to cold been going on?',
  'Have you noticed any swelling near the gum line?',
  'Is the pain worse when biting down?',
];

const OUTPUTS = [
  { icon: Siren, title: 'Urgency triage', body: 'Every symptom form is rated Low, Medium or High so the clinic can prioritise.' },
  { icon: FileHeart, title: 'Pre-visit brief', body: 'Chief complaint plus three questions worth asking, ready before you sit down.' },
  { icon: Pill, title: 'Post-visit summary', body: 'Clinical notes rewritten in plain language with a medication schedule.' },
];

export default function AIShowcase() {
  return (
    <section className="relative py-24 lg:py-32 px-5 sm:px-8 bg-brand-900 dark:bg-brand-950 text-cream-100 overflow-hidden grain-overlay">
      <div className="absolute -right-40 top-0 w-[620px] h-[620px] rounded-full bg-brand-700/40 blur-3xl animate-float-slow" aria-hidden />
      <div className="absolute -left-32 bottom-0 w-[420px] h-[420px] rounded-full bg-gold-700/20 blur-3xl animate-float" aria-hidden />

      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <Reveal>
            <p className="eyebrow !text-gold-300">Powered by Gemini</p>
            <h2 className="mt-4 font-display text-4xl sm:text-[2.9rem] leading-[1.1] font-semibold">
              Your dentist reads the
              <br />
              <span className="text-gold-gradient italic">brief before you speak</span>
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-brand-200 max-w-lg">
              Symptoms you type turn into a structured summary for the clinician, and clinical notes turn
              back into something you can actually follow at home. If the model is ever unavailable, the
              appointment still goes through — the summary simply retries in the background.
            </p>
          </Reveal>

          <RevealGroup className="mt-10 space-y-5" stagger={0.12}>
            {OUTPUTS.map(({ icon: Icon, title, body }) => (
              <RevealItem key={title} className="flex gap-4 group">
                <span className="w-11 h-11 shrink-0 rounded-full bg-brand-800 border border-brand-200/15 flex items-center justify-center text-gold-300 transition-all duration-400 group-hover:bg-gold-400 group-hover:text-brand-900 group-hover:scale-110">
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="font-semibold text-[15px]">{title}</h3>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-brand-200">{body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.3}>
            <Link
              to="/ai-assistant"
              className="mt-10 group inline-flex items-center gap-2.5 h-12 px-6 rounded-full bg-gold-400 hover:bg-gold-300 text-brand-900 text-sm font-bold transition-colors shine"
            >
              <Sparkles className="w-4 h-4" />
              Try the symptom checker
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        {/* Mock summary card */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 8 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="relative"
          style={{ perspective: 1000 }}
        >
          <div className="rounded-[1.75rem] bg-cream-50 dark:bg-brand-900 text-brand-900 dark:text-cream-100 shadow-lift p-6 sm:p-7 border border-brand-200/20">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">Pre-visit summary</p>
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 16 }}
                className="rounded-full bg-warning-bg text-warning px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
              >
                Medium urgency
              </motion.span>
            </div>

            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">Chief complaint</p>
            <p className="mt-2 font-display text-[19px] leading-snug font-semibold">
              Persistent pain in the lower right molar with sensitivity to cold, three days.
            </p>

            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">
              Suggested questions
            </p>
            <ul className="mt-3 space-y-2.5">
              {QUESTIONS.map((q, i) => (
                <motion.li
                  key={q}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + i * 0.15, duration: 0.5, ease: EASE }}
                  className="flex gap-3 text-[13.5px] leading-relaxed text-text-secondary dark:text-brand-200"
                >
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0" />
                  {q}
                </motion.li>
              ))}
            </ul>

            <div className="mt-6 pt-5 border-t border-border dark:border-brand-200/10 flex items-center gap-2.5">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 animate-pulse-ring" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
              </span>
              <p className="text-[12px] text-text-secondary dark:text-brand-200">
                Delivered to the doctor's dashboard and stored on the appointment record.
              </p>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-6 -left-4 sm:-left-8 rounded-2xl bg-gold-400 text-brand-900 px-5 py-3.5 shadow-lift"
          >
            <p className="text-[11px] font-bold uppercase tracking-widest opacity-70">Generated in</p>
            <p className="font-display text-2xl font-semibold leading-none mt-1">1.4s</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
