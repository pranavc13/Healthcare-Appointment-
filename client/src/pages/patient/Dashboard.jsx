import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, CheckCircle2, Clock, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import * as appointmentsService from '../../services/appointmentsService';
import useAuth from '../../hooks/useAuth';
import { Card, Stat, Badge, Button, EmptyState } from '../../components/ui';
import { StatSkeleton, AppointmentCardSkeleton } from '../../components/ui/Skeleton';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function DateBlock({ date }) {
  const d = new Date(date);
  return (
    <div className="w-14 h-14 rounded-lg bg-primary-light dark:bg-brand-900/20 text-primary flex flex-col items-center justify-center shrink-0">
      <span className="text-lg font-bold leading-none">{d.getDate()}</span>
      <span className="text-[10px] font-medium uppercase mt-0.5">{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
    </div>
  );
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentsService.myAppointments().then(setAppointments).finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = appointments
    .filter((a) => ['pending', 'confirmed'].includes(a.status) && new Date(a.date) >= new Date(now.toDateString()))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const completed = appointments.filter((a) => a.status === 'completed');
  const pending = appointments.filter((a) => a.status === 'pending');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-text-primary dark:text-white">
          {greeting()}, {user?.name?.split(' ')[0]}
        </h2>
        <p className="text-sm text-text-secondary dark:text-brand-300 mt-1">
          {now.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {loading ? (
          <>
            <StatSkeleton /><StatSkeleton /><StatSkeleton />
          </>
        ) : (
          <>
            <Stat icon={CalendarClock} label="Upcoming" value={upcoming.length} iconClassName="text-primary bg-primary-light" />
            <Stat icon={CheckCircle2} label="Completed" value={completed.length} iconClassName="text-success bg-success-bg" />
            <Stat icon={Clock} label="Pending" value={pending.length} iconClassName="text-warning bg-warning-bg" />
          </>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-text-primary dark:text-white">Upcoming appointments</h3>
          {upcoming.length > 0 && (
            <Link to="/patient/appointments" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-0.5">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            <AppointmentCardSkeleton /><AppointmentCardSkeleton />
          </div>
        ) : upcoming.length === 0 ? (
          <Card>
            <EmptyState
              icon={CalendarIcon}
              title="No upcoming appointments"
              description="Book a slot with a doctor to see it here."
              action={<Link to="/patient/doctors"><Button>Find a doctor</Button></Link>}
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 3).map((a) => (
              <Link key={a._id} to={`/patient/appointments/${a._id}`}>
                <Card hoverable className="!p-4 flex items-center gap-4">
                  <DateBlock date={a.date} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary dark:text-white text-sm truncate">Dr. {a.doctorId?.userId?.name}</p>
                    <p className="text-sm text-text-secondary dark:text-brand-300">{a.doctorId?.specialisation}</p>
                    <p className="text-xs text-text-muted mt-0.5 inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {a.startTime}
                    </p>
                  </div>
                  <Badge variant={a.status}>{a.status}</Badge>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
