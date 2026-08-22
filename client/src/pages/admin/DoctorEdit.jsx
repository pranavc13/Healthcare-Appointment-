import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import * as adminService from '../../services/adminService';
import { TimeSelect } from '../../components/TimeSelect';
import { Switch } from '../../components/Switch';
import { useToast } from '../../components/Toast';
import { apiErrorMessage } from '../../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function buildDayMap(workingHours) {
  const map = {};
  DAYS.forEach((day) => {
    const existing = workingHours.find((w) => w.day === day);
    map[day] = existing ? { enabled: true, startTime: existing.startTime, endTime: existing.endTime } : { enabled: false, startTime: '09:00', endTime: '17:00' };
  });
  return map;
}

export default function AdminDoctorEdit() {
  const { id } = useParams();
  const toast = useToast();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ specialisation: '', qualifications: '', bio: '', slotDuration: 30 });
  const [dayMap, setDayMap] = useState(() => buildDayMap([]));
  const [saving, setSaving] = useState(false);

  const [leaveDate, setLeaveDate] = useState('');
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

  const handleMarkLeave = async () => {
    if (!leaveDate) return;
    setMarkingLeave(true);
    try {
      const result = await adminService.markLeave(id, { date: leaveDate });
      toast.success(
        'Leave marked',
        result.cancelledAppointments > 0 ? `${result.cancelledAppointments} appointment(s) cancelled and patients notified.` : undefined
      );
      setLeaveDate('');
      load();
    } catch (err) {
      toast.error('Could not mark leave', apiErrorMessage(err));
    } finally {
      setMarkingLeave(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-24 text-center text-gray-400">Loading...</div>;
  if (!doctor) return <div className="min-h-screen pt-24 text-center text-gray-400">Doctor not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/admin/doctors" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to doctors
        </Link>

        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{doctor.userId?.name}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{doctor.userId?.email}</p>

        <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm mb-6 space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input name="specialisation" value={form.specialisation} onChange={handleChange} placeholder="Specialisation" className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white" />
            <input name="qualifications" value={form.qualifications} onChange={handleChange} placeholder="Qualifications" className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white" />
          </div>
          <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} placeholder="Bio" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white resize-none" />
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">Slot duration (minutes)</label>
            <input type="number" name="slotDuration" min={5} step={5} value={form.slotDuration} onChange={handleChange} className="w-32 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white" />
          </div>

          <h2 className="font-bold text-gray-900 dark:text-white pt-2">Working Hours</h2>
          <div className="space-y-2">
            {DAYS.map((day) => (
              <div key={day} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-slate-700 last:border-0">
                <div className="w-28 shrink-0">
                  <Switch
                    checked={dayMap[day].enabled}
                    onChange={(v) => setDayMap((prev) => ({ ...prev, [day]: { ...prev[day], enabled: v } }))}
                    label={day}
                  />
                </div>
                {dayMap[day].enabled && (
                  <div className="flex items-center gap-2 flex-1">
                    <TimeSelect
                      value={dayMap[day].startTime}
                      onChange={(v) => setDayMap((prev) => ({ ...prev, [day]: { ...prev[day], startTime: v } }))}
                      interval={30}
                    />
                    <span className="text-gray-400 text-sm">to</span>
                    <TimeSelect
                      value={dayMap[day].endTime}
                      onChange={(v) => setDayMap((prev) => ({ ...prev, [day]: { ...prev[day], endTime: v } }))}
                      interval={30}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-2xl text-sm transition-colors">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
          <h2 className="font-bold text-gray-900 dark:text-white mb-1">Leave Days</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Marking a leave day automatically cancels any confirmed appointments on that date and emails the affected patients.
          </p>

          <div className="flex gap-2 mb-4">
            <input
              type="date"
              value={leaveDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setLeaveDate(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white"
            />
            <button
              onClick={handleMarkLeave}
              disabled={!leaveDate || markingLeave}
              className="bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold px-4 rounded-xl text-sm transition-colors"
            >
              {markingLeave ? 'Marking...' : 'Mark Leave'}
            </button>
          </div>

          {doctor.leaveDays?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {doctor.leaveDays
                .slice()
                .sort((a, b) => new Date(a) - new Date(b))
                .map((d) => (
                  <span key={d} className="text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-full">
                    {new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No leave days marked.</p>
          )}
        </div>
      </div>
    </div>
  );
}
