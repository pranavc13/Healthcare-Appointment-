import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';
import * as appointmentsService from '../../services/appointmentsService';
import { useToast } from '../../components/Toast';
import { apiErrorMessage } from '../../services/api';
import { Card, Badge, Button, EmptyState } from '../../components/ui';
import { AppointmentCardSkeleton } from '../../components/ui/Skeleton';

const TABS = ['Upcoming', 'Past', 'Cancelled'];

function DateBlock({ date }) {
  const d = new Date(date);
  return (
    <div className="w-14 h-14 rounded-lg bg-primary-light dark:bg-blue-900/20 text-primary flex flex-col items-center justify-center shrink-0">
      <span className="text-lg font-bold leading-none">{d.getDate()}</span>
      <span className="text-[10px] font-medium uppercase mt-0.5">{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
    </div>
  );
}

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
    <div className="space-y-6">
      <div className="flex gap-6 border-b border-border dark:border-slate-700">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? 'text-primary border-primary' : 'text-text-muted border-transparent hover:text-text-secondary'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          <AppointmentCardSkeleton /><AppointmentCardSkeleton /><AppointmentCardSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState icon={CalendarIcon} title="No appointments here" description={`You have no ${tab.toLowerCase()} appointments.`} />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <Card key={a._id} className="!p-4">
              <div className="flex items-start gap-4">
                <DateBlock date={a.date} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary dark:text-white text-sm">Dr. {a.doctorId?.userId?.name}</p>
                  <p className="text-sm text-text-secondary dark:text-slate-400">{a.doctorId?.specialisation}</p>
                  <p className="text-xs text-text-muted mt-0.5 inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {a.startTime}
                  </p>
                  {a.preVisitSummary?.urgencyLevel && (
                    <Badge variant={a.preVisitSummary.urgencyLevel.toLowerCase()} className="mt-2">
                      {a.preVisitSummary.urgencyLevel} urgency
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge variant={a.status}>{a.status}</Badge>
                  <div className="flex items-center gap-3">
                    <Link to={`/patient/appointments/${a._id}`} className="text-xs font-medium text-primary hover:underline">
                      View Details
                    </Link>
                    {['pending', 'confirmed'].includes(a.status) && (
                      <button onClick={() => handleCancel(a._id)} className="text-xs font-medium text-danger hover:underline">
                        Cancel
                      </button>
                    )}
                  </div>
                  {a.status === 'completed' && (
                    <Link to={`/patient/appointments/${a._id}`}>
                      <Button size="sm" variant="secondary" className="!text-success !border-emerald-200 hover:!bg-emerald-50">
                        View Summary
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
