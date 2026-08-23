import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, RefreshCw, Sparkles, Mail, Phone } from 'lucide-react';
import * as doctorPortalService from '../../services/doctorPortalService';
import { useToast } from '../../components/Toast';
import { apiErrorMessage } from '../../services/api';
import { Card, Badge, Button, Input, Select, Table } from '../../components/ui';

const EMPTY_ROW = { medication: '', dosage: '', frequency: '', duration: '', instructions: '' };
const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'As needed'];

function AISummaryPending() {
  return (
    <div className="flex items-center gap-2 text-sm text-text-muted">
      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
      AI summary unavailable — being generated
    </div>
  );
}

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

  if (loading) return null;
  if (!appointment) return <Card><p className="text-center text-text-muted py-8">Appointment not found.</p></Card>;

  const pre = appointment.preVisitSummary;

  const prescriptionColumns = [
    { key: 'medication', header: 'Medication' },
    { key: 'dosage', header: 'Dosage' },
    { key: 'frequency', header: 'Frequency' },
    { key: 'duration', header: 'Duration' },
  ];

  return (
    <div className="space-y-6">
      <Link to="/doctor/dashboard" className="inline-flex items-center gap-1.5 text-sm text-text-secondary dark:text-slate-400 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left column — patient info */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-start justify-between mb-2">
              <p className="font-semibold text-text-primary dark:text-white text-lg">{appointment.patientId?.name}</p>
              <Badge variant={appointment.status}>{appointment.status}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary dark:text-slate-400">
              {appointment.patientId?.email && (
                <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {appointment.patientId.email}</span>
              )}
              {appointment.patientId?.phone && (
                <span className="inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {appointment.patientId.phone}</span>
              )}
            </div>
            <p className="text-sm text-text-secondary dark:text-slate-400 mt-2">
              {new Date(appointment.date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })} · {appointment.startTime}
            </p>
          </Card>

          {appointment.symptoms && (
            <Card>
              <h3 className="text-base font-semibold text-text-primary dark:text-white mb-2">Reported Symptoms</h3>
              <p className="text-sm text-text-secondary dark:text-slate-300 border-l-4 border-blue-200 dark:border-blue-800 bg-gray-50 dark:bg-slate-900 rounded-r-lg p-4 mb-4">
                {appointment.symptoms}
              </p>

              <h3 className="text-base font-semibold text-text-primary dark:text-white mb-3 inline-flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" /> Pre-Visit Analysis <span className="text-xs font-normal text-text-muted">(AI-generated)</span>
              </h3>
              {pre?.chiefComplaint ? (
                <div>
                  <Badge variant={(pre.urgencyLevel || '').toLowerCase()} className="mb-3">{pre.urgencyLevel} urgency</Badge>
                  <p className="text-sm text-text-secondary dark:text-slate-300 mb-3">{pre.chiefComplaint}</p>
                  {pre.suggestedQuestions?.length > 0 && (
                    <>
                      <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5">Suggested questions to ask</p>
                      <ol className="list-decimal list-inside text-sm text-text-secondary dark:text-slate-300 space-y-1">
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
        </div>

        {/* Right column — doctor actions */}
        <div>
          {appointment.status === 'completed' ? (
            <Card>
              <h3 className="text-base font-semibold text-text-primary dark:text-white mb-2">Visit Notes</h3>
              <p className="text-sm text-text-secondary dark:text-slate-300 mb-5">{appointment.doctorNotes}</p>
              {appointment.prescription?.length > 0 && (
                <>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">Prescription</p>
                  <Card fullBleed>
                    <Table columns={prescriptionColumns} data={appointment.prescription} keyField="medication" />
                  </Card>
                </>
              )}
            </Card>
          ) : appointment.status === 'confirmed' ? (
            <Card>
              <form onSubmit={handleComplete}>
                <h3 className="text-base font-semibold text-text-primary dark:text-white mb-4">Complete this visit</h3>

                <label className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5">Clinical notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={8}
                  placeholder="Diagnosis, observations, treatment plan..."
                  className="w-full mb-5 px-3 py-2.5 rounded-lg border border-border dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-text-primary dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-primary transition"
                />

                <p className="text-sm font-semibold text-text-primary dark:text-white mb-2">Prescription</p>
                <div className="space-y-3 mb-3">
                  {prescription.map((row, i) => (
                    <div key={i} className="border border-border dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-900 space-y-2 relative">
                      {prescription.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(i)}
                          className="absolute top-3 right-3 text-text-muted hover:text-danger transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <div className="flex gap-2 pr-6">
                        <Input placeholder="Medication" value={row.medication} onChange={(e) => updateRow(i, 'medication', e.target.value)} containerClassName="flex-grow" />
                        <Input placeholder="Dosage" value={row.dosage} onChange={(e) => updateRow(i, 'dosage', e.target.value)} containerClassName="w-28 shrink-0" />
                      </div>
                      <div className="flex gap-2">
                        <Select value={row.frequency} onChange={(e) => updateRow(i, 'frequency', e.target.value)} containerClassName="flex-1">
                          <option value="">Frequency</option>
                          {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                        </Select>
                        <Input placeholder="Duration (e.g. 7 days)" value={row.duration} onChange={(e) => updateRow(i, 'duration', e.target.value)} containerClassName="flex-1" />
                      </div>
                      <textarea
                        placeholder="Instructions (optional)"
                        value={row.instructions}
                        onChange={(e) => updateRow(i, 'instructions', e.target.value)}
                        rows={1}
                        className="w-full px-3 py-2 rounded-lg border border-border dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-text-primary dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-primary transition"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addRow}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mb-6"
                >
                  <Plus className="w-3.5 h-3.5" /> Add medication
                </button>

                <Button type="submit" size="lg" loading={submitting} className="w-full">
                  Complete Visit
                </Button>
                <p className="text-xs text-text-muted text-center mt-3">This will generate a patient summary and send it via email.</p>
              </form>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
