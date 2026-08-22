import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as appointmentsService from '../../services/appointmentsService';
import AppointmentTimeline from '../../components/AppointmentTimeline';
import { useToast } from '../../components/Toast';
import { apiErrorMessage } from '../../services/api';

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  rescheduled: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300',
};

const TABS = ['Upcoming', 'Past', 'Cancelled'];

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Upcoming');
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await appointmentsService.myAppointments();
      setAppointments(data);
    } catch (err) {
      toast.error('Could not load appointments', apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentsService.cancelAppointment(id);
      toast.success('Appointment cancelled');
      load();
    } catch (err) {
      toast.error('Could not cancel appointment', apiErrorMessage(err));
    }
  };

  const now = new Date();
  const filtered = appointments.filter((a) => {
    const dt = new Date(a.date);
    if (tab === 'Cancelled') return a.status === 'cancelled' || a.status === 'rescheduled';
    if (tab === 'Past') return a.status === 'completed' || (dt < now && a.status !== 'cancelled');
    return ['pending', 'confirmed'].includes(a.status) && dt >= new Date(now.toDateString());
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-6">My Appointments</h1>

        <div className="flex gap-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-sm font-bold px-4 py-2 rounded-xl transition-colors ${
                tab === t ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400">No appointments here yet.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((a) => (
              <div key={a._id} className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Dr. {a.doctorId?.userId?.name}</p>
                    <p className="text-xs text-blue-500 font-medium">{a.doctorId?.specialisation}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(a.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} · {a.startTime}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${STATUS_BADGE[a.status]}`}>
                    {a.status}
                  </span>
                </div>

                {a.preVisitSummary?.urgencyLevel && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    AI triage: <span className="font-semibold">{a.preVisitSummary.urgencyLevel} urgency</span>
                  </p>
                )}

                <AppointmentTimeline status={a.status} />

                <div className="flex items-center gap-4 mt-3">
                  <Link to={`/patient/appointments/${a._id}`} className="text-xs font-bold text-blue-600 hover:underline">
                    View details
                  </Link>
                  {['pending', 'confirmed'].includes(a.status) && (
                    <button onClick={() => handleCancel(a._id)} className="text-xs font-bold text-red-500 hover:underline">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
