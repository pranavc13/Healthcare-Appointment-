import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Award, Building2, Users } from 'lucide-react';
import SmartImage from '../components/SmartImage';
import { CountUp, Parallax, Reveal, RevealGroup, RevealItem } from '../components/motion';
import { IMAGES } from './images';

export default function About({ stats }) {
  const cards = [
    { icon: Award, value: stats?.avgRating || 4.6, decimals: 1, suffix: '/5', label: 'Average patient rating' },
    { icon: Users, value: stats?.totalDoctors || 17607, suffix: '+', label: 'Verified practitioners' },
    { icon: Building2, value: stats?.totalCities || 31, suffix: '', label: 'Cities covered' },
  ];

  return (
    <section id="about" className="relative py-24 lg:py-32 px-5 sm:px-8 bg-cream-50 dark:bg-brand-950">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[0.85fr_1fr_0.75fr] gap-10 lg:gap-12 items-center">
        {/* Copy */}
        <Reveal direction="right">
          <p className="eyebrow">About Jeevan Chakra</p>
          <h2 className="mt-4 font-display text-4xl sm:text-[2.9rem] leading-[1.1] font-semibold text-brand-900 dark:text-cream-100">
            Where Expertise
            <br />
            Meets <span className="text-gold-gradient italic">Empathy</span>
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-text-secondary dark:text-brand-200">
            Booking a doctor should not feel like paperwork. We pair a nationwide directory of
            practitioners with tooling that does the tedious part — holding the slot, briefing the
            doctor, chasing the follow-up — so the appointment itself can stay human.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-text-secondary dark:text-brand-200">
            Patients, doctors and clinic admins each get their own portal, and every one of them sees
            the same source of truth.
          </p>
          <Link
            to="/about"
            className="mt-8 group inline-flex items-center gap-2 h-12 px-6 rounded-full bg-brand-700 hover:bg-brand-800 text-cream-100 text-sm font-semibold transition-colors shine"
          >
            Learn More
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>

        {/* Image */}
        <Parallax distance={34}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <SmartImage
              src={IMAGES.reception}
              alt="Clinic reception"
              className="rounded-[1.75rem] aspect-[4/3.4] shadow-lift"
            />
            <div className="absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-brand-900/10 pointer-events-none" aria-hidden />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
              className="absolute -bottom-7 -left-7 w-24 h-24 hidden sm:block"
              aria-hidden
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <path id="jc-circle" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" />
                </defs>
                <text className="fill-brand-700 dark:fill-gold-300" style={{ fontSize: 11.5, letterSpacing: 3.1, fontWeight: 600 }}>
                  <textPath href="#jc-circle">JEEVAN CHAKRA · CARE IN MOTION · </textPath>
                </text>
              </svg>
            </motion.div>
          </motion.div>
        </Parallax>

        {/* Stats */}
        <RevealGroup className="space-y-4" stagger={0.13}>
          {cards.map(({ icon: Icon, value, decimals, suffix, label }) => (
            <RevealItem
              key={label}
              className="surface-card rounded-2xl p-5 flex items-center gap-4 hover:shadow-lift hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 shrink-0 rounded-full bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-300 flex items-center justify-center">
                <Icon className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-display text-[27px] leading-none font-semibold text-brand-900 dark:text-cream-100">
                  <CountUp value={value} decimals={decimals || 0} suffix={suffix} />
                </p>
                <p className="mt-1.5 text-[12.5px] text-text-secondary dark:text-brand-200">{label}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
