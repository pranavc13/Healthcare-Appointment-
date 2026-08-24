import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { Reveal } from './motion';
import { CLINIC_ADDRESS, CLINIC_EMAIL, CLINIC_PHONE_DISPLAY, CLINIC_PHONE_TEL } from '../clinicInfo';

const COLUMNS = [
  {
    title: 'Care',
    links: [
      { to: '/doctors', label: 'Find a doctor' },
      { to: '/ai-assistant', label: 'Symptom checker' },
      { to: '/emergency', label: 'Emergency' },
      { to: '/bmi-tracker', label: 'BMI tracker' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About us' },
      { to: '/help', label: 'NGO partners' },
      { to: '/faq', label: 'FAQ' },
      { to: '/game', label: 'Health games' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/login', label: 'Sign in' },
      { to: '/register', label: 'Create account' },
      { to: '/medical-records', label: 'Medical records' },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="relative bg-brand-950 text-cream-100 overflow-hidden grain-overlay">
      <div className="absolute -left-32 -top-32 w-[420px] h-[420px] rounded-full bg-brand-700/25 blur-3xl" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-20 pb-10">
        <div className="grid lg:grid-cols-[1.4fr_repeat(3,0.8fr)] gap-12 lg:gap-10">
          <Reveal>
            <Link to="/" className="flex items-center gap-3 w-fit">
              <img src="/logo.png" alt="" className="w-10 h-10 rounded-full bg-white object-cover ring-1 ring-white/20" />
              <span className="font-display text-[22px] font-semibold tracking-tight">DocConnect</span>
            </Link>
            <p className="mt-5 text-[13.5px] leading-relaxed text-brand-200 max-w-sm">
              A dental clinic appointment and follow-up manager for our two dentists and the patients
              who trust them, with AI briefs, email and calendar sync wired in.
            </p>

            <div className="mt-7 space-y-3 text-[13.5px] text-brand-200">
              <a href={`tel:${CLINIC_PHONE_TEL}`} className="flex items-center gap-3 hover:text-gold-300 transition-colors w-fit">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" /> {CLINIC_PHONE_DISPLAY}
              </a>
              <a href={`mailto:${CLINIC_EMAIL}`} className="flex items-center gap-3 hover:text-gold-300 transition-colors w-fit">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" /> {CLINIC_EMAIL}
              </a>
              <p className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0" /> {CLINIC_ADDRESS}
              </p>
            </div>
          </Reveal>

          {COLUMNS.map((col, i) => (
            <Reveal key={col.title} delay={0.08 * (i + 1)}>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-300">{col.title}</p>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="group inline-flex items-center gap-1.5 text-[13.5px] text-brand-200 hover:text-cream-100 transition-colors"
                    >
                      {l.label}
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 pt-7 border-t border-cream-100/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px] text-brand-200">
          <p>© {new Date().getFullYear()} DocConnect. All rights reserved.</p>
          <p>Not a substitute for emergency medical care. In a crisis, call your local emergency number.</p>
        </div>
      </div>
    </footer>
  );
}
