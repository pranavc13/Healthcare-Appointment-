import { Cpu, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';
import { RevealGroup, RevealItem } from '../components/motion';

const ITEMS = [
  {
    icon: Cpu,
    title: 'AI-Assisted Triage',
    body: 'Symptoms are summarised into a chief complaint and urgency level before you arrive.',
  },
  {
    icon: ShieldCheck,
    title: 'Never Double-Booked',
    body: 'Slots are held atomically, so two people can never claim the same appointment.',
  },
  {
    icon: HeartHandshake,
    title: 'Care That Follows Up',
    body: 'Plain-language visit summaries and medication reminders land in your inbox.',
  },
  {
    icon: Sparkles,
    title: 'Always In Sync',
    body: 'Every booking, change and cancellation flows to your email and Google Calendar.',
  },
];

export default function FeatureStrip() {
  return (
    <section className="relative z-10 -mt-16 lg:-mt-24 px-5 sm:px-8">
      <RevealGroup className="max-w-7xl mx-auto surface-card rounded-[2rem] p-6 sm:p-9 grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {ITEMS.map(({ icon: Icon, title, body }, i) => (
          <RevealItem
            key={title}
            className={`group px-4 sm:px-6 py-5 rounded-2xl transition-colors hover:bg-cream-100 dark:hover:bg-brand-900/60 ${
              i < ITEMS.length - 1 ? 'lg:border-r lg:border-border dark:lg:border-brand-200/10' : ''
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-cream-200 dark:bg-brand-800 flex items-center justify-center text-brand-700 dark:text-gold-300 transition-all duration-500 group-hover:bg-brand-700 group-hover:text-cream-100 group-hover:rotate-[8deg] group-hover:scale-110">
              <Icon className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <h3 className="mt-4 font-semibold text-[15px] text-brand-900 dark:text-cream-100">{title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-text-secondary dark:text-brand-200">{body}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
