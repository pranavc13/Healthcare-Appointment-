import { Quote, Star } from 'lucide-react';
import SmartImage from '../components/SmartImage';
import { Marquee, Reveal, RevealGroup, RevealItem } from '../components/motion';
import { FACES } from './images';

const REVIEWS = [
  {
    name: 'Ananya Rao',
    city: 'Bangalore',
    body: 'I booked a paediatrician at 11pm and had a confirmed 9am slot with a calendar invite before I went to bed. The reminder the next morning was the nudge I needed.',
  },
  {
    name: 'Rohit Menon',
    city: 'Kochi',
    body: 'The symptom form meant my cardiologist already knew why I was there. We spent the whole consultation on the plan instead of the backstory.',
  },
  {
    name: 'Farhan Qureshi',
    city: 'Hyderabad',
    body: 'My doctor went on leave and I was told the same hour, with the cancellation already reflected in my calendar. No chasing the front desk.',
  },
  {
    name: 'Meera Iyer',
    city: 'Chennai',
    body: 'The post-visit summary is the part I keep coming back to — the medication schedule in plain words, not handwriting I cannot read.',
  },
];

const CITIES = [
  'Bangalore', 'Delhi', 'Hyderabad', 'Chennai', 'Mumbai', 'Pune', 'Gurgaon',
  'Kolkata', 'Ahmedabad', 'Jaipur', 'Indore', 'Chandigarh', 'Coimbatore', 'Bhopal',
];

export default function Testimonials() {
  return (
    <section className="py-24 lg:py-28 bg-cream-50 dark:bg-brand-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Patient Stories</p>
          <h2 className="mt-4 font-display text-4xl sm:text-[2.75rem] leading-[1.1] font-semibold text-brand-900 dark:text-cream-100">
            Care people <span className="text-gold-gradient italic">come back to</span>
          </h2>
        </Reveal>

        <RevealGroup className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5" stagger={0.1}>
          {REVIEWS.map((r, i) => (
            <RevealItem
              key={r.name}
              className="surface-card rounded-2xl p-6 flex flex-col transition-all duration-400 hover:-translate-y-2 hover:shadow-lift"
            >
              <Quote className="w-7 h-7 text-gold-300 rotate-180" strokeWidth={1.5} />
              <p className="mt-4 flex-1 text-[13.5px] leading-relaxed text-text-secondary dark:text-brand-200">
                {r.body}
              </p>
              <div className="mt-5 pt-4 border-t border-border dark:border-brand-200/10 flex items-center gap-3">
                <SmartImage src={FACES[i % FACES.length]} alt="" className="w-10 h-10 rounded-full shrink-0" />
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-brand-900 dark:text-cream-100 truncate">{r.name}</p>
                  <p className="text-[11.5px] text-text-muted">{r.city}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <Star key={s} className="w-3 h-3 fill-gold-400 text-gold-400" />
                  ))}
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>

      <div className="mt-16">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-text-muted mb-6">
          Practitioners across India
        </p>
        <Marquee speed={44} itemClassName="shrink-0">
          {CITIES.map((c) => (
            <span
              key={c}
              className="inline-flex items-center h-11 px-6 rounded-full border border-border dark:border-brand-200/12 bg-white/60 dark:bg-brand-900/50 font-display text-[17px] font-semibold text-brand-800 dark:text-cream-100 whitespace-nowrap"
            >
              {c}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
