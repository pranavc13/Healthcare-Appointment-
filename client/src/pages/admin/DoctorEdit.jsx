import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { ArrowLeft } from 'lucide-react';
import * as adminService from '../../services/adminService';
import { TimeSelect } from '../../components/TimeSelect';
import { Switch } from '../../components/Switch';
import { useToast } from '../../components/Toast';
import { apiErrorMessage } from '../../services/api';
import { Card, Badge, Button, Input, Modal } from '../../components/ui';
import { formatDateOnly } from '../../utils/date';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function buildDayMap(workingHours) {
  const map = {};
  DAYS.forEach((day) => {
    const existing = workingHours.find((w) => w.day === day);
    map[day] = existing ? { enabled: true, startTime: existing.startTime, endTime: existing.endTime } : { enabled: false, startTime: '09:00', endTime: '17:00' };
  });
  return map;
}

function toDateOnly(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function AdminDoctorEdit() {
  const { id } = useParams();
  const toast = useToast();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ specialisation: '', qualifications: '', bio: '', slotDuration: 30 });
  const [dayMap, setDayMap] = useState(() => buildDayMap([]));
  const [saving, setSaving] = useState(false);

  const [pendingLeaveDate, setPendingLeaveDate] = useState(null);
  const [markingLeave, setMarkingLeave] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const doctors = await adminService.listDoctors();
      const found = doctors.find((d) => d._id === id);
      setDoctor(found || null);
      if (found) {
        setForm({
          specialisation: found.specialisation || '',
          qualifications: found.qualifications || '',
          bio: found.bio || '',
          slotDuration: found.slotDuration || 30,
        });
        setDayMap(buildDayMap(found.workingHours || []));
      }
    } catch (err) {
      toast.error('Could not load doctor', apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const workingHours = DAYS.filter((d) => dayMap[d].enabled).map((d) => ({
        day: d,
        startTime: dayMap[d].startTime,
        endTime: dayMap[d].endTime,
      }));
      await adminService.updateDoctor(id, { ...form, slotDuration: Number(form.slotDuration), workingHours });
      toast.success('Doctor profile updated');
      load();
    } catch (err) {
      toast.error('Could not save changes', apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const leaveDateKeys = new Set((doctor?.leaveDays || []).map((d) => toDateOnly(new Date(d)).getTime()));

  const handleConfirmLeave = async () => {
    if (!pendingLeaveDate) return;
    setMarkingLeave(true);
    try {
      const result = await adminService.markLeave(id, { date: formatDateOnly(pendingLeaveDate) });
      toast.success(
        'Leave marked',
        result.cancelledAppointments > 0 ? `${result.cancelledAppointments} appointment(s) cancelled and patients notified.` : undefined
      );
      setPendingLeaveDate(null);
      load();
    } catch (err) {
      toast.error('Could not mark leave', apiErrorMessage(err));
    } finally {
      setMarkingLeave(false);
    }
  };

  if (loading) return null;
  if (!doctor) return <Card><p className="text-center text-text-muted py-8">Doctor not found.</p></Card>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/admin/doctors" className="inline-flex items-center gap-1.5 text-sm text-text-secondary dark:text-brand-300 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to doctors
      </Link>

      <div>
        <h2 className="text-xl font-semibold text-text-primary dark:text-white">{doctor.userId?.name}</h2>
        <p className="text-sm text-text-secondary dark:text-brand-300">{doctor.userId?.email}</p>
      </div>

      <Card>
        <form onSubmit={handleSave} className="space-y-4">
          <h3 className="text-base font-semibold text-text-primary dark:text-white">Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Specialisation" name="specialisation" value={form.specialisation} onChange={handleChange} />
            <Input label="Qualifications" name="qualifications" value={form.qualifications} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-border dark:border-brand-800 bg-white dark:bg-brand-950 text-sm text-text-primary dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-primary transition"
            />
          </div>
          <Input label="Slot duration (minutes)" type="number" min={5} step={5} name="slotDuration" value={form.slotDuration} onChange={handleChange} containerClassName="w-40" />

          <h3 className="text-base font-semibold text-text-primary dark:text-white pt-2">Working Hours</h3>
          <div className="space-y-1">
            {DAYS.map((day) => (
              <div key={day} className="flex flex-wrap items-center gap-3 py-2 border-b border-border dark:border-brand-800 last:border-0">
                <div className="w-28 shrink-0">
                  <Switch checked={dayMap[day].enabled} onChange={(v) => setDayMap((prev) => ({ ...prev, [day]: { ...prev[day], enabled: v } }))} label={day} />
                </div>
                {dayMap[day].enabled && (
                  <div className="flex items-center gap-2">
                    <TimeSelect value={dayMap[day].startTime} onChange={(v) => setDayMap((prev) => ({ ...prev, [day]: { ...prev[day], startTime: v } }))} interval={30} />
                    <span className="text-text-muted text-sm">to</span>
                    <TimeSelect value={dayMap[day].endTime} onChange={(v) => setDayMap((prev) => ({ ...prev, [day]: { ...prev[day], endTime: v } }))} interval={30} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button type="submit" loading={saving} className="w-full">Save Changes</Button>
        </form>
      </Card>

      <Card>
        <h3 className="text-base font-semibold text-text-primary dark:text-white mb-1">Leave Days</h3>
        <p className="text-xs text-text-muted mb-4">
          Click a date to mark it as leave. Any confirmed appointments on that date are automatically cancelled and the patients are emailed.
        </p>

        <ReactCalendar
          minDate={new Date()}
          tileDisabled={({ date }) => leaveDateKeys.has(toDateOnly(date).getTime())}
          tileClassName={({ date }) => (leaveDateKeys.has(toDateOnly(date).getTime()) ? '!bg-red-100 !text-red-600 dark:!bg-red-900/30 dark:!text-red-300' : null)}
          onClickDay={(d) => setPendingLeaveDate(d)}
          className="!border-0 !w-full mb-4"
        />

        {doctor.leaveDays?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {doctor.leaveDays
              .slice()
              .sort((a, b) => new Date(a) - new Date(b))
              .map((d) => (
                <Badge key={d} variant="cancelled" dot={false}>
                  {new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Badge>
              ))}
          </div>
        ) : (
          <p className="text-xs text-text-muted">No leave days marked.</p>
        )}
      </Card>

      <Modal
        open={!!pendingLeaveDate}
        onClose={() => setPendingLeaveDate(null)}
        title="Mark leave day?"
        description={pendingLeaveDate ? pendingLeaveDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' }) : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingLeaveDate(null)}>Go Back</Button>
            <Button variant="danger" loading={markingLeave} onClick={handleConfirmLeave}>Cancel Appointments &amp; Mark Leave</Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary dark:text-brand-200">
          Any confirmed appointments on this date will be cancelled and patients will be notified by email.
        </p>
      </Modal>
    </div>
  );
}
