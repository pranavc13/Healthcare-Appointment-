import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarCheck2, ExternalLink } from 'lucide-react';
import * as calendarService from '../services/calendarService';
import useAuth from '../hooks/useAuth';
import { useToast } from './Toast';

// Shared by /patient/calendar-connect and /doctor/calendar-connect — the OAuth flow
// and messaging are identical for both roles.
export default function CalendarConnectPage() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [connecting, setConnecting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const connected = params.get('connected');
    if (connected === '1') toast.success('Google Calendar connected!');
    if (connected === '0') toast.error('Could not connect Google Calendar', 'Please try again.');
  }, [params, toast]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const { url } = await calendarService.getAuthUrl();
      window.location.href = url;
    } catch (err) {
      toast.error('Could not start Google Calendar connection');
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20 pb-16 px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-5">
          <CalendarCheck2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white mb-2">Connect Google Calendar</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {user?.googleCalendarConnected
            ? 'Your Google Calendar is connected. Appointments will automatically sync as events.'
            : 'Connect your Google Calendar so confirmed appointments are added automatically, and cancellations are removed.'}
        </p>
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-colors"
        >
          {user?.googleCalendarConnected ? 'Reconnect' : 'Connect'} Google Calendar <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
