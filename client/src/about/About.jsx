import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, BellRing, Brain, CalendarSync, HeartHandshake,
  Lock, ShieldCheck, Stethoscope, UserCog, Users,
} from 'lucide-react';
import * as doctorsService from '../services/doctorsService';
import SmartImage from '../components/SmartImage';
import { CountUp, EASE, Parallax, Reveal, RevealGroup, RevealItem } from '../components/motion';
import { IMAGES } from '../home/images';
import { COMBINED_YEARS_EXPERIENCE } from '../clinicInfo';

const VALUES = [
  {
    icon: HeartHandshake,
    title: 'Human first',
    body: 'Software should absorb the admin so the consultation can stay a conversation between two people.',
  },
  {
    icon: ShieldCheck,
    title: 'Never lose a booking',
    body: 'Slots are held atomically and leave days cascade into cancellations, notifications and calendar cleanup.',
  },
  {
    icon: Lock,
    title: 'Careful with data',
    body: 'Role-scoped access, hashed credentials and encrypted calendar tokens at rest. Nothing shared sideways.',
  },
  {
    icon: BellRing,
    title: 'Follow-up is the job',
    body: 'A visit is not finished at the door — summaries, prescriptions and medication reminders keep going.',
  },
];

const PORTALS = [
  {
    icon: Users,
    role: 'Patients',
    body: 'Choose Dr. Rohith or Dr. Shanmukha, hold a slot, describe symptoms, and keep every visit summary in one timeline.',
    points: ['Live slot availability', 'AI symptom brief', 'Email + calendar sync'],
  },
  {
    icon: Stethoscope,
    role: 'Dentists',
    body: 'Arrive at each appointment already briefed, then turn consultation notes into a patient-friendly plan.',
    points: ['Urgency-rated pre-visit brief', 'Post-visit summary generation', 'Working hours and leave'],
  },
  {
    icon: UserCog,
    role: 'Clinic admin',
    body: 'Manage both dentist profiles, set slot durations, and mark leave days safely.',
    points: ['Profile management', 'Leave-day conflict handling', 'Schedule oversight'],
  },
];

const PIPELINE = [
  { icon: Brain, label: 'Symptoms in', detail: 'Patient describes what is wrong, in their own words.' },
  { icon: ShieldCheck, label: 'Structured brief', detail: 'Urgency level, chief complaint and three questions to ask.' },
  { icon: Stethoscope, label: 'Consultation', detail: 'The doctor opens the appointment already knowing the context.' },
  { icon: CalendarSync, label: 'Plan out', detail: 'Plain-language summary, medication schedule and reminders.' },
];

export default function About() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    doctorsService
      .getFacets()
      .then((d) => { if (!cancelled) setStats(d.stats); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="bg-cream-100 dark:bg-brand-950">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-brand-900 dark:bg-brand-950 text-cream-100 grain-overlay">
        <div className="absolute -right-40 -top-40 w-[600px] h-[600px] rounded-full bg-brand-700/40 blur-3xl animate-float-slow" aria-hidden />
        <div className="absolute -left-32 bottom-0 w-[420px] h-[420px] rounded-full bg-gold-700/15 blur-3xl animate-float" aria-hidden />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <Reveal>
              <p className="eyebrow !text-gold-300">About DocConnect</p>
              <h1 className="mt-4 font-display text-[2.6rem] sm:text-[3.4rem] leading-[1.06] font-semibold">
                Appointments that
                <br />
                <span className="text-gold-gradient italic">look after themselves</span>
              </h1>
              <p className="mt-6 text-[16px] leading-relaxed text-brand-200 max-w-lg">
                DocConnect is our dental clinic's appointment and follow-up manager. It gives patients
                and our two dentists their own portal over one shared source of truth — then wires
                AI briefs, email and Google Calendar into the parts everyone usually forgets.
              </p>
            </Reveal>

            <Reveal delay={0.2} className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/doctors"
                className="shine group inline-flex items-center gap-2.5 h-[52px] px-7 rounded-full bg-gold-400 hover:bg-gold-300 text-brand-900 text-[14.5px] font-bold transition-colors"
              >
                Find a doctor
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/ai-assistant"
                className="inline-flex items-center gap-2.5 h-[52px] px-6 rounded-full border border-cream-100/25 text-cream-100 text-[14.5px] font-semibold hover:bg-cream-100/10 transition-colors"
              >
                Symptom checker
              </Link>
            </Reveal>
          </div>

          <Parallax distance={28}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
            >
              <SmartImage
                src={IMAGES.consult}
                alt="A doctor talking with a patient"
                priority
                className="rounded-[2rem] aspect-[4/3.2] shadow-lift ring-1 ring-cream-100/10"
              />
            </motion.div>
          </Parallax>
        </div>
      </section>

      {/* ── Live numbers ── */}
      <section className="px-5 sm:px-8 -mt-12 relative z-10">
        <RevealGroup className="max-w-7xl mx-auto surface-card rounded-[1.75rem] p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { value: stats?.totalDoctors ?? 2, suffix: '', label: 'Specialist dentists' },
            { value: COMBINED_YEARS_EXPERIENCE, suffix: '+', label: 'Years combined experience' },
            { value: stats?.avgRating ?? 4.8, decimals: 1, suffix: '/5', label: 'Average rating' },
            { value: 3, suffix: '', label: 'Dedicated portals' },
          ].map((s, i) => (
            <RevealItem
              key={s.label}
              className={`px-4 sm:px-6 py-4 text-center ${
                i < 3 ? 'lg:border-r lg:border-border dark:lg:border-brand-200/10' : ''
              }`}
            >
              <p className="font-display text-[30px] sm:text-[34px] leading-none font-semibold text-brand-900 dark:text-cream-100">
                <CountUp value={s.value} decimals={s.decimals || 0} suffix={s.suffix} />
              </p>
              <p className="mt-2.5 text-[12px] text-text-secondary dark:text-brand-200">{s.label}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ── Story ── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24 lg:py-28 grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center">
        <Parallax distance={30}>
          <SmartImage
            src={IMAGES.reception}
            alt="Clinic reception"
            className="rounded-[1.75rem] aspect-[4/3.4] shadow-lift"
          />
        </Parallax>

        <Reveal direction="left">
          <p className="eyebrow">Why we built it</p>
          <h2 className="mt-4 font-display text-[2.2rem] sm:text-[2.7rem] leading-[1.1] font-semibold text-brand-900 dark:text-cream-100">
            A booking form was never
            <br />
            the <span className="text-gold-gradient italic">hard part</span>
          </h2>
          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-text-secondary dark:text-brand-200">
            <p>
              Clinics rarely lose patients at the moment of booking. They lose them in the gaps — the
              double-booked slot nobody caught, the doctor who went on leave without the front desk
              knowing, the discharge instructions that got read once and forgotten.
            </p>
            <p>
              So we started at the gaps. Two people cannot claim the same slot, because a booking is
              held before it is confirmed. Marking a doctor on leave cancels the affected appointments,
              emails everyone involved and deletes their calendar events in the same action.
            </p>
            <p>
              And when the model that writes summaries is slow or unavailable, the appointment still
              goes through — the summary retries quietly in the background instead of blocking care.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── The AI pipeline ── */}
      <section className="bg-cream-50 dark:bg-brand-900/40 py-24 lg:py-28 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">From symptoms to a plan</p>
            <h2 className="mt-4 font-display text-[2.2rem] sm:text-[2.7rem] leading-[1.1] font-semibold text-brand-900 dark:text-cream-100">
              What the <span className="text-gold-gradient italic">AI</span> actually does
            </h2>
          </Reveal>

          <RevealGroup className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5" stagger={0.11}>
            {PIPELINE.map(({ icon: Icon, label, detail }, i) => (
              <RevealItem key={label} className="relative group">
                <div className="surface-card rounded-2xl p-6 h-full transition-all duration-400 group-hover:-translate-y-2 group-hover:shadow-lift">
                  <span className="w-11 h-11 rounded-full bg-brand-700 text-cream-100 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                  </span>
                  <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.15em] text-gold-600 dark:text-gold-400">
                    Step {i + 1}
                  </p>
                  <h3 className="mt-2 font-semibold text-[15.5px] text-brand-900 dark:text-cream-100">{label}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-text-secondary dark:text-brand-200">{detail}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── Portals ── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24 lg:py-28">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Three portals, one record</p>
          <h2 className="mt-4 font-display text-[2.2rem] sm:text-[2.7rem] leading-[1.1] font-semibold text-brand-900 dark:text-cream-100">
            Everyone sees the <span className="text-gold-gradient italic">same truth</span>
          </h2>
        </Reveal>

        <RevealGroup className="mt-12 grid md:grid-cols-3 gap-5" stagger={0.12}>
          {PORTALS.map(({ icon: Icon, role, body, points }) => (
            <RevealItem
              key={role}
              className="group surface-card rounded-2xl p-7 flex flex-col transition-all duration-400 hover:-translate-y-2 hover:shadow-lift"
            >
              <span className="w-12 h-12 rounded-full bg-cream-200 dark:bg-brand-800 text-brand-700 dark:text-gold-300 flex items-center justify-center transition-all duration-500 group-hover:bg-brand-700 group-hover:text-cream-100 group-hover:rotate-[8deg]">
                <Icon className="w-5 h-5" strokeWidth={1.75} />
              </span>
              <h3 className="mt-5 font-display text-[21px] font-semibold text-brand-900 dark:text-cream-100">{role}</h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-text-secondary dark:text-brand-200">{body}</p>
              <ul className="mt-5 pt-5 border-t border-border dark:border-brand-200/10 space-y-2.5">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-[13px] text-text-secondary dark:text-brand-200">
                    <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ── Values ── */}
      <section className="bg-brand-900 dark:bg-brand-950 text-cream-100 py-24 lg:py-28 px-5 sm:px-8 grain-overlay relative overflow-hidden">
        <div className="absolute -left-40 top-0 w-[520px] h-[520px] rounded-full bg-brand-700/35 blur-3xl animate-float-slow" aria-hidden />

        <div className="relative max-w-7xl mx-auto">
          <Reveal className="max-w-2xl">
            <p className="eyebrow !text-gold-300">What we hold to</p>
            <h2 className="mt-4 font-display text-[2.2rem] sm:text-[2.7rem] leading-[1.1] font-semibold">
              Principles, not <span className="text-gold-gradient italic">slogans</span>
            </h2>
          </Reveal>

          <RevealGroup className="mt-12 grid sm:grid-cols-2 gap-x-10 gap-y-9" stagger={0.1}>
            {VALUES.map(({ icon: Icon, title, body }) => (
              <RevealItem key={title} className="flex gap-5 group">
                <span className="w-12 h-12 shrink-0 rounded-full bg-brand-800 border border-brand-200/15 flex items-center justify-center text-gold-300 transition-all duration-400 group-hover:bg-gold-400 group-hover:text-brand-900 group-hover:scale-110">
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="font-semibold text-[16px]">{title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-brand-200">{body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-5 sm:px-8 py-20">
        <Reveal className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-[2.2rem] sm:text-[2.8rem] leading-[1.1] font-semibold text-brand-900 dark:text-cream-100">
            Ready when you are
          </h2>
          <p className="mt-4 text-[15px] text-text-secondary dark:text-brand-200 max-w-lg mx-auto">
            Meet our dentists, or create an account and keep every appointment, summary and reminder
            in one place.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/doctors"
              className="shine group inline-flex items-center gap-2.5 h-[52px] px-7 rounded-full bg-brand-700 hover:bg-brand-800 text-cream-100 text-[14.5px] font-bold transition-colors"
            >
              Meet our dentists
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center h-[52px] px-7 rounded-full border border-brand-700/25 dark:border-brand-200/25 text-brand-900 dark:text-cream-100 text-[14.5px] font-semibold hover:bg-white/70 dark:hover:bg-brand-800/50 transition-colors"
            >
              Create an account
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
