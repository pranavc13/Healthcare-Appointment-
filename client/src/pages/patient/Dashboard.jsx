import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Stethoscope, Bell } from 'lucide-react';
import * as appointmentsService from '../../services/appointmentsService';
import useAuth from '../../hooks/useAuth';

const EASE = [0.22, 1, 0.36, 1];

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentsService
      .myAppointments()
      .then(setAppointments)
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = appointments
    .filter((a) => ['pending', 'confirmed'].includes(a.status) && new Date(a.date) >= new Date(now.toDateString()))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const QUICK_ACTIONS = [
    { to: '/patient/doctors', icon: Stethoscope, label: 'Find a Doctor', color: 'text-blue-500' },
    { to: '/patient/appointments', icon: CalendarDays, label: 'My Appointments', color: 'text-indigo-500' },
    { to: '/patient/calendar-connect', icon: Bell, label: 'Connect Calendar', color: 'text-violet-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Here's what's coming up.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {QUICK_ACTIONS.map(({ to, icon: Icon, label, color }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.08, ease: EASE }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Link to={to} className="block bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-slate-950/50 transition-shadow duration-300">
                <Icon className={`w-6 h-6 ${color} mb-2`} />
                <p className="font-bold text-gray-900 dark:text-white text-sm">{label}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="font-bold text-gray-900 dark:text-white mb-3">
          Upcoming Appointments
        </motion.h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-16 rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
        ) : upcoming.length === 0 ? (
          <p className="text-sm text-gray-400">No upcoming appointments. <Link to="/patient/doctors" className="text-blue-600 hover:underline">Book one now</Link>.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 5).map((a, i) => (
              <motion.div
                key={a._id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.06, duration: 0.35, ease: EASE }}
                whileHover={{ x: 4 }}
              >
                <Link
                  to={`/patient/appointments/${a._id}`}
                  className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">Dr. {a.doctorId?.userId?.name}</p>
                    <p className="text-xs text-gray-400">{new Date(a.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} · {a.startTime}</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full">{a.status}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
