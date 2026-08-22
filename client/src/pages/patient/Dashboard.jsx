import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Stethoscope, Bell } from 'lucide-react';
import * as appointmentsService from '../../services/appointmentsService';
import useAuth from '../../hooks/useAuth';

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Here's what's coming up.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link to="/patient/doctors" className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <Stethoscope className="w-6 h-6 text-blue-500 mb-2" />
            <p className="font-bold text-gray-900 dark:text-white text-sm">Find a Doctor</p>
          </Link>
          <Link to="/patient/appointments" className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <CalendarDays className="w-6 h-6 text-indigo-500 mb-2" />
            <p className="font-bold text-gray-900 dark:text-white text-sm">My Appointments</p>
          </Link>
          <Link to="/patient/calendar-connect" className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <Bell className="w-6 h-6 text-violet-500 mb-2" />
            <p className="font-bold text-gray-900 dark:text-white text-sm">Connect Calendar</p>
          </Link>
        </div>

        <h2 className="font-bold text-gray-900 dark:text-white mb-3">Upcoming Appointments</h2>
        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : upcoming.length === 0 ? (
          <p className="text-sm text-gray-400">No upcoming appointments. <Link to="/patient/doctors" className="text-blue-600 hover:underline">Book one now</Link>.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 5).map((a) => (
              <Link
                key={a._id}
                to={`/patient/appointments/${a._id}`}
                className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">Dr. {a.doctorId?.userId?.name}</p>
                  <p className="text-xs text-gray-400">{new Date(a.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} · {a.startTime}</p>
                </div>
                <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full">{a.status}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
