import { Link } from 'react-router-dom';
import {
  ArrowUpRight, Baby, Bone, Brain, Ear, Eye, HeartPulse,
  Smile, Sparkles, Stethoscope, Syringe, Wind,
} from 'lucide-react';
import { Reveal, RevealGroup, RevealItem } from '../components/motion';

const ICONS = [
  { match: /pediatric|child/i, icon: Baby },
  { match: /cardio|heart/i, icon: HeartPulse },
  { match: /dent|dental/i, icon: Smile },
  { match: /ortho|bone|joint/i, icon: Bone },
  { match: /neuro|brain/i, icon: Brain },
  { match: /ophthal|eye/i, icon: Eye },
  { match: /ent|otorhino|ear/i, icon: Ear },
  { match: /derma|skin|cosmet/i, icon: Sparkles },
  { match: /pulmo|chest|respir/i, icon: Wind },
  { match: /surg/i, icon: Syringe },
];

const iconFor = (name) => (ICONS.find((e) => e.match.test(name)) || { icon: Stethoscope }).icon;

const FALLBACK = [
  { name: 'General Physician', count: 739 },
  { name: 'Pediatrician', count: 776 },
  { name: 'Cardiologist', count: 268 },
  { name: 'Dentist', count: 604 },
  { name: 'Orthopedic surgeon', count: 528 },
  { name: 'Dermatologist', count: 217 },
  { name: 'Neurologist', count: 216 },
  { name: 'Ophthalmologist', count: 467 },
];

export default function Specialities({ specialities }) {
  const list = (specialities?.length ? specialities : FALLBACK).slice(0, 8);

  return (
    <section id="specialities" className="py-24 lg:py-28 px-5 sm:px-8 bg-cream-100 dark:bg-brand-900/40">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <p className="eyebrow">Our Specialities</p>
            <h2 className="mt-4 font-display text-4xl sm:text-[2.75rem] leading-[1.1] font-semibold text-brand-900 dark:text-cream-100">
              Complete Care for <span className="text-gold-gradient italic">You</span>
              <br className="hidden sm:block" /> and <span className="text-gold-gradient italic">Your Family</span>
            </h2>
          </Reveal>
          <Reveal direction="left" delay={0.15}>
            <Link
              to="/doctors"
              className="group inline-flex items-center gap-2.5 text-sm font-semibold text-brand-800 dark:text-cream-100"
            >
              View all specialities
              <span className="w-9 h-9 rounded-full border border-brand-700/25 dark:border-brand-200/25 flex items-center justify-center transition-all duration-300 group-hover:bg-brand-700 group-hover:text-cream-100 group-hover:border-brand-700 group-hover:rotate-45">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </Link>
          </Reveal>
        </div>

        <RevealGroup className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4" stagger={0.07}>
          {list.map(({ name, count }) => {
            const Icon = iconFor(name);
            return (
              <RevealItem key={name}>
                <Link
                  to={`/doctors?specialisation=${encodeURIComponent(name)}`}
                  className="group relative flex flex-col h-full surface-card rounded-2xl p-6 overflow-hidden transition-all duration-400 hover:-translate-y-2 hover:shadow-lift"
                >
                  <span
                    className="absolute inset-0 bg-gradient-to-br from-brand-700 to-brand-900 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                    aria-hidden
                  />
                  <span className="relative w-12 h-12 rounded-full bg-cream-200 dark:bg-brand-800 text-brand-700 dark:text-gold-300 flex items-center justify-center transition-colors duration-400 group-hover:bg-gold-400 group-hover:text-brand-900">
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="relative mt-5 font-semibold text-[15px] leading-snug text-brand-900 dark:text-cream-100 transition-colors duration-400 group-hover:text-cream-100">
                    {name}
                  </h3>
                  <p className="relative mt-1.5 text-[12.5px] text-text-secondary dark:text-brand-200 transition-colors duration-400 group-hover:text-brand-200">
                    {count.toLocaleString('en-IN')} specialists available
                  </p>
                  <span className="relative mt-auto pt-5 inline-flex items-center text-brand-700 dark:text-gold-300 transition-colors duration-400 group-hover:text-gold-300">
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-400 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </span>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
