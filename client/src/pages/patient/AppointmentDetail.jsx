import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, CheckCircle2, XCircle, Sparkles, ListChecks } from 'lucide-react';
import * as appointmentsService from '../../services/appointmentsService';
import * as doctorsService from '../../services/doctorsService';
import { useToast } from '../../components/Toast';
import { apiErrorMessage } from '../../services/api';
import { Card, Badge, Table } from '../../components/ui';

const STATUS_BANNER = {
  confirmed: { className: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-900/40 dark:text-emerald-300', icon: CheckCircle2, text: 'Your appointment is confirmed.' },
  completed: { className: 'bg-brand-50 border-brand-200 text-brand-800 dark:bg-brand-900/20 dark:border-brand-900/40 dark:text-brand-300', icon: CheckCircle2, text: 'Visit completed.' },
  cancelled: { className: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-900/40 dark:text-red-300', icon: XCircle, text: 'This appointment was cancelled.' },
  pending: { className: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-900/40 dark:text-amber-300', icon: RefreshCw, text: 'Awaiting confirmation.' },
  rescheduled: { className: 'bg-sand-100 border-sand-200 text-sand-700 dark:bg-brand-900 dark:border-brand-800 dark:text-brand-200', icon: RefreshCw, text: 'This appointment was rescheduled.' },
};

function AISummaryPending() {
  return (
    <div className="flex items-center gap-2 text-sm text-text-muted">
      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
      AI summary unavailable — being generated
    </div>
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

  if (loading) return null;
  if (!appointment) return <Card><p className="text-center text-text-muted py-8">Appointment not found.</p></Card>;

  const pre = appointment.preVisitSummary;
  const post = appointment.postVisitSummary;
  const banner = STATUS_BANNER[appointment.status] || STATUS_BANNER.pending;
  const BannerIcon = banner.icon;

  const prescriptionColumns = [
    { key: 'medication', header: 'Medication' },
    { key: 'dosage', header: 'Dosage' },
    { key: 'frequency', header: 'Frequency' },
    { key: 'duration', header: 'Duration' },
  ];

  return (
    <div className="space-y-6">
      <Link to="/patient/appointments" className="inline-flex items-center gap-1.5 text-sm text-text-secondary dark:text-brand-300 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to appointments
      </Link>

      <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 ${banner.className}`}>
        <BannerIcon className="w-4 h-4 shrink-0" />
        <span className="text-sm font-medium">{banner.text}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left column */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-text-primary dark:text-white">Dr. {appointment.doctorId?.userId?.name}</p>
                <p className="text-sm text-primary">{appointment.doctorId?.specialisation}</p>
              </div>
              <Badge variant={appointment.status}>{appointment.status}</Badge>
            </div>
            <p className="text-sm text-text-secondary dark:text-brand-300">
              {new Date(appointment.date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })} · {appointment.startTime} – {appointment.endTime}
            </p>

            {['pending', 'confirmed'].includes(appointment.status) && (
              <div className="flex gap-4 mt-4 pt-4 border-t border-border dark:border-brand-800">
                <button onClick={() => setRescheduling((v) => !v)} className="text-sm font-medium text-primary hover:underline">
                  Reschedule
                </button>
                <button onClick={handleCancel} className="text-sm font-medium text-danger hover:underline">
                  Cancel
                </button>
              </div>
            )}

            {rescheduling && (
              <div className="mt-4 pt-4 border-t border-border dark:border-brand-800">
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={newDate}
                  onChange={(e) => loadNewSlots(e.target.value)}
                  className="w-full mb-3 h-10 px-3 rounded-lg border border-border dark:border-brand-800 bg-white dark:bg-brand-950 text-sm text-text-primary dark:text-white"
                />
                {newSlots.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {newSlots.map((s) => (
                      <button
                        key={s}
                        disabled={savingReschedule}
                        onClick={() => handleReschedule(s)}
                        className="text-xs font-medium py-2 rounded-lg border border-border dark:border-brand-800 hover:border-primary hover:text-primary transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>

          {appointment.symptoms && (
            <Card>
              <h3 className="text-base font-semibold text-text-primary dark:text-white mb-2">Your symptoms</h3>
              <p className="text-sm text-text-secondary dark:text-brand-200 border-l-4 border-brand-200 dark:border-brand-800 bg-sand-50 dark:bg-brand-950 rounded-r-lg p-4">
                {appointment.symptoms}
              </p>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {appointment.symptoms && (
            <Card>
              <h3 className="text-base font-semibold text-text-primary dark:text-white mb-3 inline-flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" /> Pre-Visit Analysis
              </h3>
              {pre?.chiefComplaint ? (
                <div>
                  <Badge variant={(pre.urgencyLevel || '').toLowerCase()} className="mb-3">{pre.urgencyLevel} urgency</Badge>
                  <p className="text-sm text-text-secondary dark:text-brand-200 mb-3">{pre.chiefComplaint}</p>
                  {pre.suggestedQuestions?.length > 0 && (
                    <>
                      <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5">Suggested questions for doctor</p>
                      <ol className="list-decimal list-inside text-sm text-text-secondary dark:text-brand-200 space-y-1">
                        {pre.suggestedQuestions.map((q, i) => <li key={i}>{q}</li>)}
                      </ol>
                    </>
                  )}
                </div>
              ) : (
                <AISummaryPending />
              )}
            </Card>
          )}

          {appointment.status === 'completed' && (
            <Card>
              <h3 className="text-base font-semibold text-text-primary dark:text-white mb-3 inline-flex items-center gap-1.5">
                <ListChecks className="w-4 h-4 text-success" /> Your Visit Summary
              </h3>
              {post?.patientFriendlySummary ? (
                <p className="text-sm text-text-secondary dark:text-brand-200 leading-relaxed whitespace-pre-wrap mb-4">{post.patientFriendlySummary}</p>
              ) : (
                <AISummaryPending />
              )}

              {appointment.prescription?.length > 0 && (
                <>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2 mt-4">Medication schedule</p>
                  <Card fullBleed className="mb-4">
                    <Table columns={prescriptionColumns} data={appointment.prescription} keyField="medication" />
                  </Card>
                </>
              )}

              {post?.followUpSteps && (
                <>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5">Follow-up steps</p>
                  <p className="text-sm text-text-secondary dark:text-brand-200 whitespace-pre-wrap">{post.followUpSteps}</p>
                </>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
