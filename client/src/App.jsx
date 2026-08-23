import { useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Sparkles, CalendarClock, BellRing, ArrowRight } from 'lucide-react';
import { AuthContext } from './AuthContext';
import Button from './components/ui/Button';

const ROLE_HOME = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard' };

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Symptom Analysis',
    description: 'Describe your symptoms and get an instant triage summary before your visit.',
  },
  {
    icon: CalendarClock,
    title: 'Smart Scheduling',
    description: 'Real-time availability with atomic slot holds — no double-booked appointments.',
  },
  {
    icon: BellRing,
    title: 'Instant Notifications',
    description: 'Booking confirmations, reminders, and visit summaries delivered by email.',
  },
];

export default function App() {
  const { currentUser, role } = useContext(AuthContext);

  if (currentUser) {
    return <Navigate to={ROLE_HOME[role] || '/'} replace />;
  }

  return (
    <div className="bg-white dark:bg-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle, #0F172A 1px, transparent 1px)', backgroundSize: '32px 32px' }}
          aria-hidden
        />
        <div
          className="absolute -top-24 -right-24 w-[480px] h-[480px] bg-primary-light dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden
        />

        <div className="relative max-w-6xl mx-auto px-6 py-20 sm:py-28">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-text-primary dark:text-white max-w-2xl">
            Healthcare appointments,
            <br />
            simplified.
          </h1>
          <p className="text-lg text-text-secondary dark:text-slate-400 max-w-lg mt-5">
            Find the right doctor, book an open slot, and get AI-assisted pre-visit guidance — all in one place.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-8">
            <Link to="/register">
              <Button size="lg">Book an appointment</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">I'm a doctor</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title}>
              <div className="w-10 h-10 rounded-xl bg-primary-light dark:bg-blue-900/20 text-primary flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary dark:text-white mb-1.5">{title}</h3>
              <p className="text-sm text-text-secondary dark:text-slate-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Doctor CTA */}
      <section className="border-t border-border dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-semibold text-text-primary dark:text-white">Are you a healthcare provider?</h2>
            <p className="text-sm text-text-secondary dark:text-slate-400 mt-1">Ask your clinic admin to add you to DocConnect.</p>
          </div>
          <Link to="/login">
            <Button variant="secondary" rightIcon={ArrowRight}>Sign in</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border dark:border-slate-800 py-8">
        <p className="text-sm text-text-muted text-center">© {new Date().getFullYear()} DocConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}
