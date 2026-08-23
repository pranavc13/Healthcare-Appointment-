import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import * as doctorsService from '../../services/doctorsService';
import * as appointmentsService from '../../services/appointmentsService';
import { useToast } from '../../components/Toast';
import { apiErrorMessage } from '../../services/api';
import { Card, Avatar, Button, EmptyState } from '../../components/ui';
import { formatDateOnly } from '../../utils/date';

const COMMON_SYMPTOMS = ['Fever', 'Headache', 'Cough', 'Fatigue', 'Nausea', 'Body ache', 'Shortness of breath', 'Chest pain'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function toDateOnly(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function BookAppointment() {
  const { id: doctorId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(toDateOnly(new Date()));
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [appointmentId, setAppointmentId] = useState(null);
  const [holding, setHolding] = useState(false);
  const [confirmedDone, setConfirmedDone] = useState(false);

  const [checkedSymptoms, setCheckedSymptoms] = useState([]);
  const [symptomText, setSymptomText] = useState('');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    doctorsService.getDoctor(doctorId).then(setDoctor).catch(() => toast.error('Doctor not found'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  // Land on the first day this doctor actually works rather than on today,
  // which is often a non-clinic day and reads as "nothing available".
  useEffect(() => {
    if (!doctor) return;
    const today = toDateOnly(new Date());
    for (let i = 0; i < 60; i += 1) {
      const candidate = new Date(today);
      candidate.setDate(today.getDate() + i);
      const dayName = DAY_NAMES[candidate.getDay()];
      const works = (doctor.workingHours || []).some((wh) => wh.day === dayName);
      const onLeave = (doctor.leaveDays || []).some(
        (l) => toDateOnly(new Date(l)).getTime() === candidate.getTime()
      );
      if (works && !onLeave) {
        setDate(candidate);
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctor]);

  useEffect(() => {
    setSlotsLoading(true);
    setSelectedSlot(null);
    setAppointmentId(null);
    doctorsService
      .getSlots(doctorId, formatDateOnly(date))
      .then((data) => setSlots(data.slots))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [doctorId, date]);

  const isDayDisabled = (d) => {
    if (!doctor) return false;
    const dateOnly = toDateOnly(d);
    if (dateOnly < toDateOnly(new Date())) return true;
    const onLeave = (doctor.leaveDays || []).some((l) => toDateOnly(new Date(l)).getTime() === dateOnly.getTime());
    if (onLeave) return true;
    const dayName = DAY_NAMES[dateOnly.getDay()];
    return !(doctor.workingHours || []).some((wh) => wh.day === dayName);
  };

  const handleSelectSlot = async (slot) => {
    setHolding(true);
    try {
      const result = await appointmentsService.holdSlot({ doctorId, date: formatDateOnly(date), startTime: slot });
      setAppointmentId(result.appointmentId);
      setSelectedSlot(slot);
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
      setConfirmedDone(true);
    } catch (err) {
      toast.error('Could not confirm appointment', apiErrorMessage(err));
      if (err.response?.status === 410) {
        setSelectedSlot(null);
        setAppointmentId(null);
      }
    } finally {
      setConfirming(false);
    }
  };

  if (!doctor) return null;

  return (
    <div className="space-y-6">
      <Link to="/patient/doctors" className="inline-flex items-center gap-1.5 text-sm text-text-secondary dark:text-brand-300 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to doctors
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left column: doctor + calendar + slots */}
        <div className="space-y-6">
          <Card className="flex items-center gap-3">
            <Avatar name={doctor.userId?.name} size="lg" />
            <div>
              <p className="font-semibold text-text-primary dark:text-white">{doctor.userId?.name}</p>
              <p className="text-sm text-primary">{doctor.specialisation}</p>
              {doctor.qualifications && <p className="text-xs text-text-muted mt-0.5">{doctor.qualifications}</p>}
            </div>
          </Card>

          <Card>
            <ReactCalendar
              value={date}
              onChange={setDate}
              minDate={new Date()}
              tileDisabled={({ date: d }) => isDayDisabled(d)}
              className="!border-0 !w-full"
            />
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-text-primary dark:text-white mb-3">Available slots</h3>
            {slotsLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-lg bg-sand-100 dark:bg-brand-800 animate-pulse" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-text-muted">No slots available on this date. Try another day.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    disabled={holding}
                    onClick={() => handleSelectSlot(slot)}
                    className={`text-sm font-medium py-2 rounded-lg border transition-colors disabled:opacity-50 ${
                      selectedSlot === slot
                        ? 'bg-primary text-white border-primary'
                        : 'border-border dark:border-brand-800 text-text-secondary dark:text-brand-200 hover:border-primary hover:bg-primary-light dark:hover:bg-brand-900/20'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column: symptom form / confirmation */}
        <div className="lg:sticky lg:top-24">
          {confirmedDone ? (
            <Card>
              <EmptyState
                icon={CheckCircle}
                title="Appointment confirmed"
                description="We've sent a confirmation email. Your doctor will review an AI-generated pre-visit summary of your symptoms."
                action={<Button onClick={() => navigate('/patient/appointments')}>View my appointments</Button>}
              />
            </Card>
          ) : selectedSlot ? (
            <Card>
              <form onSubmit={handleConfirm}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-sm text-text-muted">Holding your slot</p>
                    <p className="font-semibold text-text-primary dark:text-white">
                      {date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} at {selectedSlot}
                    </p>
                  </div>
                  <Clock className="w-5 h-5 text-warning" />
                </div>

                <h3 className="text-base font-semibold text-text-primary dark:text-white mb-3">Tell us about your symptoms</h3>

                <div className="flex flex-wrap gap-2 mb-4">
                  {COMMON_SYMPTOMS.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggleSymptom(s)}
                      className={`text-sm font-medium px-3 py-1 rounded-full border transition-colors ${
                        checkedSymptoms.includes(s)
                          ? 'bg-primary-light text-primary border-brand-200 dark:bg-brand-900/30 dark:border-brand-800'
                          : 'bg-sand-50 text-text-secondary border-border dark:bg-brand-950 dark:text-brand-200 dark:border-brand-800 hover:border-border-hover'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <textarea
                  value={symptomText}
                  onChange={(e) => setSymptomText(e.target.value)}
                  rows={6}
                  placeholder="Describe your symptoms in detail..."
                  className="w-full mb-1 px-3 py-2.5 rounded-lg border border-border dark:border-brand-800 bg-white dark:bg-brand-950 text-sm text-text-primary dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-primary transition"
                />
                <p className="text-xs text-text-muted mb-5 text-right">{symptomText.length} characters</p>

                <Button type="submit" size="lg" loading={confirming} className="w-full">
                  Confirm Booking
                </Button>
                <p className="text-xs text-text-muted text-center mt-3">
                  Your slot will be held for 5 minutes while you fill this form.
                </p>
              </form>
            </Card>
          ) : (
            <Card>
              <EmptyState title="Pick a slot" description="Choose an available time on the left to continue." />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
