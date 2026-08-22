import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import * as doctorsService from '../../services/doctorsService';
import * as appointmentsService from '../../services/appointmentsService';
import { ProgressSteps } from '../../components/ProgessSteps';
import { useToast } from '../../components/Toast';
import { apiErrorMessage } from '../../services/api';

const COMMON_SYMPTOMS = ['Fever', 'Headache', 'Cough', 'Fatigue', 'Nausea', 'Body ache', 'Shortness of breath', 'Chest pain'];
const HOLD_SECONDS = 5 * 60;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function BookAppointment() {
  const { id: doctorId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [step, setStep] = useState(1); // 1: pick slot, 2: symptoms, 3: done
  const [appointmentId, setAppointmentId] = useState(null);
  const [heldUntil, setHeldUntil] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(HOLD_SECONDS);
  const [holding, setHolding] = useState(false);

  const [checkedSymptoms, setCheckedSymptoms] = useState([]);
  const [symptomText, setSymptomText] = useState('');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    doctorsService.getDoctor(doctorId).then(setDoctor).catch(() => toast.error('Doctor not found'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  useEffect(() => {
    if (step !== 1) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    doctorsService
      .getSlots(doctorId, date)
      .then((data) => setSlots(data.slots))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [doctorId, date, step]);

  // Countdown for the 5-minute hold, shown to the patient while filling the symptom form.
  useEffect(() => {
    if (step !== 2 || !heldUntil) return undefined;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((new Date(heldUntil).getTime() - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        toast.warning('Your hold expired', 'Please pick a slot again.');
        setStep(1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [step, heldUntil, toast]);

  const handleSelectSlot = async (slot) => {
    setHolding(true);
    try {
      const result = await appointmentsService.holdSlot({ doctorId, date, startTime: slot });
      setAppointmentId(result.appointmentId);
      setHeldUntil(result.heldUntil);
      setSecondsLeft(HOLD_SECONDS);
      setSelectedSlot(slot);
      setStep(2);
    } catch (err) {
      toast.error('Slot unavailable', apiErrorMessage(err));
      setSlots((prev) => prev.filter((s) => s !== slot));
    } finally {
      setHolding(false);
    }
  };

  const toggleSymptom = (s) => {
    setCheckedSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    const combined = [checkedSymptoms.join(', '), symptomText.trim()].filter(Boolean).join(' — ');
    if (!combined) {
      toast.warning('Please describe your symptoms');
      return;
    }
    setConfirming(true);
    try {
      await appointmentsService.confirmAppointment({ appointmentId, symptoms: combined });
      setStep(3);
    } catch (err) {
      toast.error('Could not confirm appointment', apiErrorMessage(err));
      if (err.response?.status === 410) setStep(1);
    } finally {
      setConfirming(false);
    }
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/patient/doctors" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to doctors
        </Link>

        {doctor && (
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black">
              {doctor.userId?.name?.[0]}
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{doctor.userId?.name}</p>
              <p className="text-xs text-blue-500 font-medium">{doctor.specialisation}</p>
            </div>
          </div>
        )}

        <ProgressSteps currentStep={step} totalSteps={3} />

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
          {step === 1 && (
            <>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Select a date</label>
              <input
                type="date"
                value={date}
                min={todayISO()}
                onChange={(e) => setDate(e.target.value)}
                className="w-full mb-6 px-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white"
              />

              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Available slots</label>
              {slotsLoading ? (
                <p className="text-sm text-gray-400">Loading slots...</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-gray-400">No slots available on this date. Try another day.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      disabled={holding}
                      onClick={() => handleSelectSlot(slot)}
                      className="text-sm font-semibold py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleConfirm}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Holding your slot</p>
                  <p className="font-bold text-gray-900 dark:text-white">{date} at {selectedSlot}</p>
                </div>
                <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-xl text-sm font-bold">
                  <Clock className="w-4 h-4" /> {mm}:{ss}
                </div>
              </div>

              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Common symptoms</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {COMMON_SYMPTOMS.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                      checkedSymptoms.includes(s)
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Describe your symptoms</label>
              <textarea
                value={symptomText}
                onChange={(e) => setSymptomText(e.target.value)}
                rows={4}
                placeholder="Tell us more about what you're experiencing..."
                className="w-full mb-6 px-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                disabled={confirming}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-2xl text-sm transition-colors"
              >
                {confirming ? 'Confirming...' : 'Confirm Appointment'}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Appointment Confirmed!</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                We've sent a confirmation email. Your doctor will review an AI-generated pre-visit summary of your symptoms.
              </p>
              <button
                onClick={() => navigate('/patient/appointments')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-colors"
              >
                View My Appointments
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
