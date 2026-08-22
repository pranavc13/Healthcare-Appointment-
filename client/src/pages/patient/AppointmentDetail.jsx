import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import * as appointmentsService from '../../services/appointmentsService';
import * as doctorsService from '../../services/doctorsService';
import { useToast } from '../../components/Toast';
import { apiErrorMessage } from '../../services/api';

const EASE = [0.22, 1, 0.36, 1];

const URGENCY_COLOR = {
  Low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

function Section({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: EASE }}
      className={`bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm mb-5 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function PatientAppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newSlots, setNewSlots] = useState([]);
  const [savingReschedule, setSavingReschedule] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const all = await appointmentsService.myAppointments();
      const found = all.find((a) => a._id === id);
      setAppointment(found || null);
    } catch (err) {
      toast.error('Could not load appointment', apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadNewSlots = async (date) => {
    setNewDate(date);
    if (!appointment) return;
    try {
      const data = await doctorsService.getSlots(appointment.doctorId._id, date);
      setNewSlots(data.slots);
    } catch {
      setNewSlots([]);
    }
  };

  const handleReschedule = async (slot) => {
    setSavingReschedule(true);
    try {
      await appointmentsService.rescheduleAppointment(id, { date: newDate, startTime: slot });
      toast.success('Appointment rescheduled');
      setRescheduling(false);
      navigate('/patient/appointments');
    } catch (err) {
      toast.error('Could not reschedule', apiErrorMessage(err));
    } finally {
      setSavingReschedule(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentsService.cancelAppointment(id);
      toast.success('Appointment cancelled');
      load();
    } catch (err) {
      toast.error('Could not cancel', apiErrorMessage(err));
    }
  };

  if (loading) return <div className="min-h-screen pt-24 text-center text-gray-400">Loading...</div>;
  if (!appointment) return <div className="min-h-screen pt-24 text-center text-gray-400">Appointment not found.</div>;

  const pre = appointment.preVisitSummary;
  const post = appointment.postVisitSummary;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/patient/appointments" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to appointments
        </Link>

        <Section>
          <p className="font-bold text-gray-900 dark:text-white text-lg">Dr. {appointment.doctorId?.userId?.name}</p>
          <p className="text-sm text-blue-500 font-medium mb-2">{appointment.doctorId?.specialisation}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(appointment.date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })} · {appointment.startTime} – {appointment.endTime}
          </p>
          <p className="text-xs uppercase font-bold tracking-wide text-gray-400 mt-2">{appointment.status}</p>

          {['pending', 'confirmed'].includes(appointment.status) && (
            <div className="flex gap-3 mt-4">
              <button onClick={() => setRescheduling((v) => !v)} className="text-xs font-bold text-blue-600 hover:underline">
                Reschedule
              </button>
              <button onClick={handleCancel} className="text-xs font-bold text-red-500 hover:underline">
                Cancel
              </button>
            </div>
          )}

          <AnimatePresence>
            {rescheduling && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 overflow-hidden"
              >
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={newDate}
                  onChange={(e) => loadNewSlots(e.target.value)}
                  className="w-full mb-3 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white"
                />
                {newSlots.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {newSlots.map((s) => (
                      <motion.button
                        key={s}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={savingReschedule}
                        onClick={() => handleReschedule(s)}
                        className="text-xs font-semibold py-2 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600"
                      >
                        {s}
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        {appointment.symptoms && (
          <Section delay={0.08}>
            <h2 className="font-bold text-gray-900 dark:text-white mb-2">Reported Symptoms</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{appointment.symptoms}</p>

            <h3 className="font-bold text-gray-900 dark:text-white mt-4 mb-2 text-sm">AI Pre-Visit Summary</h3>
            {pre?.chiefComplaint ? (
              <div>
                <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 ${URGENCY_COLOR[pre.urgencyLevel] || ''}`}>
                  {pre.urgencyLevel} urgency
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{pre.chiefComplaint}</p>
                {pre.suggestedQuestions?.length > 0 && (
                  <ul className="list-disc list-inside text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    {pre.suggestedQuestions.map((q, i) => <li key={i}>{q}</li>)}
                  </ul>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
                  <RefreshCw className="w-3.5 h-3.5" />
                </motion.span>
                AI summary unavailable — being generated
              </div>
            )}
          </Section>
        )}

        {appointment.status === 'completed' && (
          <Section delay={0.16}>
            <h2 className="font-bold text-gray-900 dark:text-white mb-2">Visit Summary</h2>
            {post?.patientFriendlySummary ? (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap mb-3">{post.patientFriendlySummary}</p>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Medication Schedule</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap mb-3">{post.medicationSchedule}</p>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Follow-up Steps</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{post.followUpSteps}</p>
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
                  <RefreshCw className="w-3.5 h-3.5" />
                </motion.span>
                AI summary unavailable — being generated
              </div>
            )}

            {appointment.doctorNotes && (
              <>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-4 mb-1">Doctor's Notes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{appointment.doctorNotes}</p>
              </>
            )}

            {appointment.prescription?.length > 0 && (
              <>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-4 mb-2">Prescription</h3>
                <div className="space-y-2">
                  {appointment.prescription.map((p, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="bg-gray-50 dark:bg-slate-900 rounded-xl p-3 text-sm">
                      <p className="font-semibold text-gray-900 dark:text-white">{p.medication} — {p.dosage}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{p.frequency}, for {p.duration}</p>
                      {p.instructions && <p className="text-xs text-gray-400 mt-1">{p.instructions}</p>}
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}
