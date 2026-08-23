import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarCheck2, ExternalLink, CheckCircle2 } from 'lucide-react';
import * as calendarService from '../services/calendarService';
import useAuth from '../hooks/useAuth';
import { useToast } from './Toast';
import { Card, Button } from './ui';

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
    } catch {
      toast.error('Could not start Google Calendar connection');
      setConnecting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="text-center">
        <div className="w-14 h-14 rounded-xl bg-primary-light dark:bg-brand-900/20 text-primary flex items-center justify-center mx-auto mb-5">
          <CalendarCheck2 className="w-7 h-7" />
        </div>
        <h1 className="text-lg font-semibold text-text-primary dark:text-white mb-2">Connect Google Calendar</h1>
        <p className="text-sm text-text-secondary dark:text-brand-300 mb-6">
          {user?.googleCalendarConnected
            ? 'Your Google Calendar is connected. Appointments sync automatically as events.'
            : 'Appointments will automatically sync to your Google Calendar, and cancellations are removed.'}
        </p>

        {user?.googleCalendarConnected && (
          <div className="inline-flex items-center gap-1.5 text-sm font-medium text-success mb-4">
            <CheckCircle2 className="w-4 h-4" /> Connected
          </div>
        )}

        <Button onClick={handleConnect} loading={connecting} rightIcon={ExternalLink} className="w-full">
          {user?.googleCalendarConnected ? 'Reconnect' : 'Connect with'} Google Calendar
        </Button>
      </Card>
    </div>
  );
}
