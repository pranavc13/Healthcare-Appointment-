import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Calendar, Home, LayoutDashboard, Stethoscope } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const BY_ROLE = {
  patient: [
    { to: '/', icon: Home, label: 'Home', end: true },
    { to: '/doctors', icon: Stethoscope, label: 'Doctors' },
    { to: '/ai-assistant', icon: Activity, label: 'Symptoms' },
    { to: '/patient/appointments', icon: Calendar, label: 'Bookings' },
    { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Portal' },
  ],
  doctor: [
    { to: '/', icon: Home, label: 'Home', end: true },
    { to: '/doctors', icon: Stethoscope, label: 'Doctors' },
    { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Portal' },
  ],
  admin: [
    { to: '/', icon: Home, label: 'Home', end: true },
    { to: '/admin/doctors', icon: Stethoscope, label: 'Doctors' },
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Portal' },
  ],
};

export default function BottomNav() {
  const { user } = useAuth();
  const links = BY_ROLE[user?.role] || BY_ROLE.patient;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border dark:border-brand-200/10 lg:hidden pb-safe">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${links.length}, minmax(0, 1fr))` }}>
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} className="relative flex flex-col items-center justify-center gap-1 py-2.5">
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="bottomnav-pill"
                    className="absolute inset-x-3 inset-y-1 rounded-xl bg-brand-700/10 dark:bg-gold-400/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon
                  className={`relative w-5 h-5 transition-colors ${
                    isActive ? 'text-brand-700 dark:text-gold-300' : 'text-text-muted'
                  }`}
                  strokeWidth={isActive ? 2.3 : 1.7}
                />
                <span
                  className={`relative text-[10px] font-semibold transition-colors ${
                    isActive ? 'text-brand-700 dark:text-gold-300' : 'text-text-muted'
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
