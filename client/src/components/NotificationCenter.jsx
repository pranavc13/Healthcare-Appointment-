import { useEffect, useState, useRef, useContext } from 'react';
import { Bell, Check, X, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AuthContext } from '../AuthContext';
import * as notificationsService from '../services/notificationsService';

const STATUS_META = {
  sent:    { icon: Check, color: 'text-green-500 bg-green-50 dark:bg-green-900/30' },
  failed:  { icon: X,     color: 'text-red-500 bg-red-50 dark:bg-red-900/30' },
  pending: { icon: Clock, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/30' },
};

const TYPE_LABEL = {
  booking_confirmation: 'Booking confirmed',
  reminder: 'Appointment reminder',
  cancellation: 'Cancellation',
  leave_notice: 'Doctor on leave',
  medication_reminder: 'Medication reminder',
  post_visit_summary: 'Visit summary',
};

function NotifItem({ notif }) {
  const meta = STATUS_META[notif.status] ?? STATUS_META.pending;
  const Icon = meta.icon;
  const ts = notif.sentAt || notif.scheduledAt;

  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-sand-50 dark:hover:bg-brand-800 transition-colors">
      <div className={`${meta.color} p-2 rounded-lg shrink-0 mt-0.5`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug text-sand-900 dark:text-white font-medium truncate">
          {TYPE_LABEL[notif.type] || notif.type}
        </p>
        <p className="text-xs text-sand-500 dark:text-sand-400 truncate">{notif.subject}</p>
        <p className="text-xs text-sand-400 mt-0.5">{ts ? formatDistanceToNow(new Date(ts), { addSuffix: true }) : ''}</p>
      </div>
    </div>
  );
}

// Shows the real email-notification log (booking confirmations, reminders,
// cancellations, etc.) sent by the backend — a live view into the notification
// pipeline rather than a Firestore-backed read/unread inbox.
export default function NotificationCenter() {
  const { currentUser } = useContext(AuthContext);
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!currentUser || !open) return;
    notificationsService.myNotifications().then(setNotifs).catch(() => {});
  }, [currentUser, open]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!currentUser) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-sand-500 dark:text-sand-400 hover:bg-sand-100 dark:hover:bg-brand-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-brand-900 border border-border dark:border-brand-800 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-sand-100 dark:border-brand-800">
            <h3 className="font-semibold text-sand-900 dark:text-white text-sm">Notifications</h3>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-10 h-10 text-sand-200 dark:text-brand-700 mx-auto mb-2" />
                <p className="text-sm text-sand-400">No notifications yet</p>
              </div>
            ) : (
              notifs.map((n) => <NotifItem key={n._id} notif={n} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
