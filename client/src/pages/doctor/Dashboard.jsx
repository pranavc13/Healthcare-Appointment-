import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as doctorPortalService from '../../services/doctorPortalService';
import { useToast } from '../../components/Toast';
import { apiErrorMessage } from '../../services/api';

const EASE = [0.22, 1, 0.36, 1];

const URGENCY_COLOR = {
  Low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const TABS = ['Today', 'Upcoming', 'Completed'];

function isSameDay(a, b) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Today');
  const toast = useToast();

  useEffect(() => {
    doctorPortalService
      .myAppointments()
      .then(setAppointments)
      .catch((err) => toast.error('Could not load appointments', apiErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const today = new Date();
  const filtered = appointments
    .filter((a) => {
      if (tab === 'Completed') return a.status === 'completed';
      if (tab === 'Today') return a.status === 'confirmed' && isSameDay(a.date, today);
      return a.status === 'confirmed' && !isSameDay(a.date, today) && new Date(a.date) >= today;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date) || a.startTime.localeCompare(b.startTime));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-2xl font-black text-gray-900 dark:text-white mb-6">
          Doctor Dashboard
        </motion.h1>

        <div className="flex gap-2 mb-6">
          {TABS.map((t, i) => (
            <motion.button
              key={t}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setTab(t)}
              className={`text-sm font-bold px-4 py-2 rounded-xl transition-colors ${
                tab === t ? 'bg-blue-600 text-white shadow-md shadow-blue-200/50' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700'
              }`}
            >
              {t}
            </motion.button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-400">No appointments here.</motion.p>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((a, i) => (
                <motion.div
                  key={a._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.3), ease: EASE }}
                  whileHover={{ y: -3, scale: 1.005 }}
                >
                  <Link
                    to={`/doctor/appointments/${a._id}`}
                    className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{a.patientId?.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(a.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} · {a.startTime}
                      </p>
                      {a.symptoms && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-md">{a.symptoms}</p>}
                    </div>
                    {a.preVisitSummary?.urgencyLevel && (
                      <motion.span
                        animate={a.preVisitSummary.urgencyLevel === 'High' ? { scale: [1, 1.06, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                        className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${URGENCY_COLOR[a.preVisitSummary.urgencyLevel]}`}
                      >
                        {a.preVisitSummary.urgencyLevel}
                      </motion.span>
                    )}
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
