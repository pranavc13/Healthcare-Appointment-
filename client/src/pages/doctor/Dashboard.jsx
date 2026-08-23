import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ClipboardList, CalendarRange, CheckCircle2, AlertTriangle, Coffee } from 'lucide-react';
import * as doctorPortalService from '../../services/doctorPortalService';
import { useToast } from '../../components/Toast';
import { apiErrorMessage } from '../../services/api';
import { Card, Stat, Badge, EmptyState } from '../../components/ui';
import { StatSkeleton, AppointmentCardSkeleton } from '../../components/ui/Skeleton';

function isSameDay(a, b) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function startOfWeek(d) {
  const s = new Date(d);
  s.setDate(s.getDate() - s.getDay());
  s.setHours(0, 0, 0, 0);
  return s;
}

const URGENCY_BORDER = { High: 'border-l-danger', Medium: 'border-l-warning', Low: 'border-l-success' };

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    doctorPortalService
      .myAppointments()
      .then(setAppointments)
      .catch((err) => toast.error('Could not load appointments', apiErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const todaysSchedule = appointments
    .filter((a) => a.status === 'confirmed' && isSameDay(a.date, today))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const pendingReview = appointments.filter((a) => a.status === 'confirmed' && new Date(a.date) <= today);
  const thisWeek = appointments.filter((a) => ['confirmed', 'completed'].includes(a.status) && new Date(a.date) >= weekStart && new Date(a.date) < weekEnd);
  const completed = appointments.filter((a) => a.status === 'completed');
  const highUrgency = appointments.filter((a) => a.status === 'confirmed' && a.preVisitSummary?.urgencyLevel === 'High');

  const nowTime = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-text-primary dark:text-white">Dashboard</h2>
        <p className="text-sm text-text-secondary dark:text-brand-300 mt-1">
          {today.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
          </>
        ) : (
          <>
            <Stat icon={CalendarDays} label="Today's Appointments" value={todaysSchedule.length} iconClassName="text-primary bg-primary-light" />
            <Stat icon={ClipboardList} label="Pending Review" value={pendingReview.length} iconClassName="text-warning bg-warning-bg" />
            <Stat icon={CalendarRange} label="This Week" value={thisWeek.length} iconClassName="text-primary bg-primary-light" />
            <Stat icon={CheckCircle2} label="Completed" value={completed.length} iconClassName="text-success bg-success-bg" />
          </>
        )}
      </div>

      {!loading && highUrgency.length > 0 && (
        <Card className="!bg-danger-bg !border-red-200 dark:!bg-red-900/20 dark:!border-red-900/40">
          <h3 className="text-sm font-semibold text-danger inline-flex items-center gap-1.5 mb-3">
            <AlertTriangle className="w-4 h-4" /> Patients with High Urgency
          </h3>
          <div className="space-y-1.5">
            {highUrgency.map((a) => (
              <Link key={a._id} to={`/doctor/appointments/${a._id}`} className="flex items-center justify-between text-sm text-red-800 dark:text-red-200 hover:underline">
                <span>{a.patientId?.name}</span>
                <span>{a.startTime}</span>
              </Link>
            ))}
          </div>
        </Card>
      )}

      <div>
        <h3 className="text-xl font-semibold text-text-primary dark:text-white mb-4">Today's Schedule</h3>

        {loading ? (
          <div className="space-y-3">
            <AppointmentCardSkeleton /><AppointmentCardSkeleton />
          </div>
        ) : todaysSchedule.length === 0 ? (
          <Card>
            <EmptyState icon={Coffee} title="No appointments today" description="Enjoy your day off!" />
          </Card>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border dark:bg-brand-800" />
            <div className="space-y-3">
              {todaysSchedule.map((a) => {
                const isPast = a.startTime < nowTime;
                const isNext = !isPast && todaysSchedule.find((x) => x.startTime >= nowTime)?._id === a._id;
                const urgency = a.preVisitSummary?.urgencyLevel;
                return (
                  <div key={a._id} className="relative">
                    <span className={`absolute -left-[26px] top-5 w-3 h-3 rounded-full ring-4 ring-background dark:ring-brand-950 ${isPast ? 'bg-sand-300 dark:bg-brand-700' : 'bg-primary'}`} />
                    <Link to={`/doctor/appointments/${a._id}`}>
                      <Card
                        hoverable
                        className={`!p-4 border-l-4 ${urgency ? URGENCY_BORDER[urgency] : 'border-l-border dark:border-l-brand-800'} ${isPast ? 'opacity-60' : ''} ${isNext ? 'ring-2 ring-brand-100 bg-primary-light/30 dark:ring-brand-900/30 dark:bg-brand-900/10' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <span className="text-sm font-bold text-text-primary dark:text-white w-14 shrink-0">{a.startTime}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-text-primary dark:text-white truncate">{a.patientId?.name}</p>
                              {a.symptoms && <p className="text-xs text-text-muted truncate max-w-xs">{a.symptoms}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {urgency && <Badge variant={urgency.toLowerCase()}>{urgency}</Badge>}
                            <span className="text-xs font-medium text-primary">View</span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
