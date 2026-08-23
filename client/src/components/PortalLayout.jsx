import { useState } from 'react';
import { Outlet, useLocation, matchPath } from 'react-router-dom';
import { LayoutDashboard, Stethoscope, Calendar, CalendarDays, User } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ChatWidget from './ChatWidget';
import useAuth from '../hooks/useAuth';

const NAV_ITEMS = {
  patient: [
    { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/patient/doctors', icon: Stethoscope, label: 'Find Doctors' },
    { to: '/patient/appointments', icon: Calendar, label: 'My Appointments' },
    { to: '/patient/calendar-connect', icon: CalendarDays, label: 'Calendar Sync' },
  ],
  doctor: [
    { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/doctor/profile', icon: User, label: 'My Profile' },
    { to: '/doctor/calendar-connect', icon: CalendarDays, label: 'Calendar Sync' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/doctors', icon: Stethoscope, label: 'Doctors' },
  ],
};

const TITLES = [
  { pattern: '/patient/dashboard', title: 'Dashboard' },
  { pattern: '/patient/doctors', title: 'Find a Doctor' },
  { pattern: '/patient/doctors/:id/book', title: 'Book Appointment' },
  { pattern: '/patient/appointments', title: 'My Appointments' },
  { pattern: '/patient/appointments/:id', title: 'Appointment Details' },
  { pattern: '/patient/calendar-connect', title: 'Calendar Sync' },
  { pattern: '/doctor/dashboard', title: 'Dashboard' },
  { pattern: '/doctor/appointments/:id', title: 'Appointment Details' },
  { pattern: '/doctor/profile', title: 'My Profile' },
  { pattern: '/doctor/calendar-connect', title: 'Calendar Sync' },
  { pattern: '/admin/dashboard', title: 'Admin Dashboard' },
  { pattern: '/admin/doctors', title: 'Doctors' },
  { pattern: '/admin/doctors/:id', title: 'Edit Doctor' },
];

function resolveTitle(pathname) {
  const match = TITLES.find((t) => matchPath({ path: t.pattern, end: true }, pathname));
  return match?.title || 'DocConnect';
}

export default function PortalLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = NAV_ITEMS[user?.role] || [];

  return (
    <div className="min-h-screen bg-background dark:bg-slate-900">
      <Sidebar items={items} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="lg:pl-64">
        <TopBar title={resolveTitle(pathname)} onOpenMobile={() => setMobileOpen(true)} />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Outlet />
        </main>
      </div>
      <ChatWidget />
    </div>
  );
}
