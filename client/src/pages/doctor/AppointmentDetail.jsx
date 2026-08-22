import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, RefreshCw } from 'lucide-react';
import * as doctorPortalService from '../../services/doctorPortalService';
import { useToast } from '../../components/Toast';
import { apiErrorMessage } from '../../services/api';

const EASE = [0.22, 1, 0.36, 1];

const URGENCY_COLOR = {
  Low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const EMPTY_ROW = { medication: '', dosage: '', frequency: '', duration: '', instructions: '' };

export default function DoctorAppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState([{ ...EMPTY_ROW }]);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await doctorPortalService.getAppointment(id);
      setAppointment(data);
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

  const updateRow = (i, field, value) => {
    setPrescription((prev) => prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  };
  const addRow = () => setPrescription((prev) => [...prev, { ...EMPTY_ROW }]);
  const removeRow = (i) => setPrescription((prev) => prev.filter((_, idx) => idx !== i));

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      toast.warning('Please add visit notes first');
      return;
    }
    const cleanedPrescription = prescription.filter((p) => p.medication.trim());
    setSubmitting(true);
    try {
      await doctorPortalService.completeAppointment(id, { notes, prescription: cleanedPrescription });
      toast.success('Visit completed', 'A summary email has been sent to the patient.');
      navigate('/doctor/dashboard');
    } catch (err) {
      toast.error('Could not complete visit', apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-24 text-center text-gray-400">Loading...</div>;
  if (!appointment) return <div className="min-h-screen pt-24 text-center text-gray-400">Appointment not found.</div>;

  const pre = appointment.preVisitSummary;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/doctor/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm mb-5">
          <p className="font-bold text-gray-900 dark:text-white text-lg">{appointment.patientId?.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{appointment.patientId?.email} {appointment.patientId?.phone && `· ${appointment.patientId.phone}`}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {new Date(appointment.date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })} · {appointment.startTime}
          </p>

          {appointment.symptoms && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Reported Symptoms</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{appointment.symptoms}</p>

              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">AI Pre-Visit Summary</h3>
              {pre?.chiefComplaint ? (
                <div>
                  <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 ${URGENCY_COLOR[pre.urgencyLevel] || ''}`}>
                    {pre.urgencyLevel} urgency
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{pre.chiefComplaint}</p>
                  {pre.suggestedQuestions?.length > 0 && (
                    <>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Suggested questions to ask:</p>
                      <ul className="list-disc list-inside text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        {pre.suggestedQuestions.map((q, i) => <li key={i}>{q}</li>)}
                      </ul>
                    </>
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
            </div>
          )}
        </motion.div>

        {appointment.status === 'completed' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1, ease: EASE }} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
            <h2 className="font-bold text-gray-900 dark:text-white mb-2">Visit Notes</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{appointment.doctorNotes}</p>
            {appointment.prescription?.length > 0 && (
              <>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Prescription</h3>
                <div className="space-y-2">
                  {appointment.prescription.map((p, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-slate-900 rounded-xl p-3 text-sm">
                      <p className="font-semibold text-gray-900 dark:text-white">{p.medication} — {p.dosage}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{p.frequency}, for {p.duration}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        ) : appointment.status === 'confirmed' ? (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: EASE }}
            onSubmit={handleComplete}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm"
          >
            <h2 className="font-bold text-gray-900 dark:text-white mb-3">Complete Visit</h2>

            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Clinical notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Diagnosis, observations, treatment plan..."
              className="w-full mb-5 px-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />

            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Prescription</label>
            <div className="space-y-3 mb-3">
              <AnimatePresence>
                {prescription.map((row, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-start bg-gray-50 dark:bg-slate-900 rounded-xl p-3"
                  >
                    <input
                      placeholder="Medication"
                      value={row.medication}
                      onChange={(e) => updateRow(i, 'medication', e.target.value)}
                      className="col-span-2 sm:col-span-1 px-2.5 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-gray-900 dark:text-white"
                    />
                    <input
                      placeholder="Dosage"
                      value={row.dosage}
                      onChange={(e) => updateRow(i, 'dosage', e.target.value)}
                      className="px-2.5 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-gray-900 dark:text-white"
                    />
                    <input
                      placeholder="Frequency (e.g. twice daily)"
                      value={row.frequency}
                      onChange={(e) => updateRow(i, 'frequency', e.target.value)}
                      className="px-2.5 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-gray-900 dark:text-white"
                    />
                    <input
                      placeholder="Duration (e.g. 5 days)"
                      value={row.duration}
                      onChange={(e) => updateRow(i, 'duration', e.target.value)}
                      className="px-2.5 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-gray-900 dark:text-white"
                    />
                    <div className="flex gap-1">
                      <input
                        placeholder="Instructions"
                        value={row.instructions}
                        onChange={(e) => updateRow(i, 'instructions', e.target.value)}
                        className="flex-1 px-2.5 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-gray-900 dark:text-white"
                      />
                      {prescription.length > 1 && (
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} type="button" onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600 shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline mb-5"
            >
              <Plus className="w-3.5 h-3.5" /> Add medication
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-2xl text-sm transition-colors shadow-lg shadow-blue-200/40 dark:shadow-none"
            >
              {submitting ? 'Completing visit...' : 'Complete Visit'}
            </motion.button>
          </motion.form>
        ) : null}
      </div>
    </div>
  );
}
