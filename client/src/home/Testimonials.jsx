import { Quote, Star } from 'lucide-react';
import SmartImage from '../components/SmartImage';
import { Reveal, RevealGroup, RevealItem } from '../components/motion';
import { FACES } from './images';

const REVIEWS = [
  {
    name: 'Ananya Rao',
    tag: 'Root canal, Dr. Shanmukha',
    body: 'Dr. Shanmukha diagnosed the issue in minutes and the root canal I had been dreading was over before I knew it. Genuinely painless.',
  },
  {
    name: 'Rohit Menon',
    tag: 'Cleaning, Dr. Rohith',
    body: 'Booked a cleaning online at 11pm and had a confirmed 9am slot with a calendar invite before I went to bed.',
  },
  {
    name: 'Farhan Qureshi',
    tag: 'Whitening, Dr. Rohith',
    body: 'Dr. Rohith walked me through the whitening options without any upselling. Exactly what I needed to hear.',
  },
  {
    name: 'Meera Iyer',
    tag: 'Filling, Dr. Shanmukha',
    body: 'The post-visit summary is the part I keep coming back to — my aftercare instructions in plain words, not handwriting I cannot read.',
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 lg:py-28 bg-cream-50 dark:bg-brand-950">
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
                  <p className="text-[11.5px] text-text-muted truncate">{r.tag}</p>
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
    </section>
  );
}
