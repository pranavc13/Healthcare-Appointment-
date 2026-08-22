import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { doc, setDoc, collection } from '@firebase/firestore';
import { auth, db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { createNotification } from '../utils/notifications';
import { format } from 'date-fns';
import { CheckCircle } from 'lucide-react';

const AppointmentBooking = ({ doctor, docid }) => {
  const [selectedDate, setSelectedDate]   = useState(null);
  const [showSlots, setShowSlots]         = useState(false);
  const [selectedSlot, setSelectedSlot]   = useState(null);
  const [isBooking, setIsBooking]         = useState(false);
  const [bookingError, setBookingError]   = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const navigate = useNavigate();

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM',
    '02:00 PM', '03:00 PM', '04:00 PM',
  ];

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowSlots(true);
    setSelectedSlot(null);
    setBookingError('');
  };

  const handleBooking = async () => {
    const user = auth.currentUser;
    if (!user) { setBookingError('Please log in to book an appointment.'); return; }

    setIsBooking(true);
    setBookingError('');

    try {
      const appointmentRef = doc(collection(db, 'appointments'));
      const dateStr = format(selectedDate, 'MMM d, yyyy');

      await setDoc(appointmentRef, {
        doctorId:    docid,
        patientId:   user.uid,
        date:        selectedDate,
        timeSlot:    selectedSlot,
        doctorName:  `${doctor.firstName} ${doctor.lastName}`,
        patientName: user.displayName || user.email,
        status:      'confirmed',
        createdAt:   new Date(),
      });

      /* Notification → patient */
      await createNotification({
        userId:        user.uid,
        message:       `Your appointment with Dr. ${doctor.firstName} ${doctor.lastName} on ${dateStr} at ${selectedSlot} is confirmed.`,
        type:          'appointment_confirmed',
        appointmentId: appointmentRef.id,
      });

      /* Notification → doctor */
      await createNotification({
        userId:        docid,
        message:       `New appointment from ${user.displayName || user.email} on ${dateStr} at ${selectedSlot}.`,
        type:          'new_appointment',
        appointmentId: appointmentRef.id,
      });

      setShowSlots(false);
      setSelectedDate(null);
      setSelectedSlot(null);
      setBookingSuccess(true);
    } catch (error) {
      console.error('Error booking appointment:', error);
      setBookingError('Failed to book appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  /* ── Success screen ── */
  if (bookingSuccess) {
    return (
      <div className="text-center py-8 space-y-4 animate-fade-in">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Booked!</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Your appointment is confirmed.</p>
        </div>
        <button
          onClick={() => navigate('/appointments')}
          className="w-full bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          View My Appointments
        </button>
        <button
          onClick={() => setBookingSuccess(false)}
          className="w-full text-gray-500 dark:text-gray-400 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-sm"
        >
          Book Another Slot
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden">
        <Calendar
          onChange={handleDateSelect}
          value={selectedDate}
          minDate={new Date()}
          className="w-full"
          tileClassName="hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors rounded"
        />
      </div>

      {/* Time slots modal */}
      {showSlots && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Choose a time</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {timeSlots.map(slot => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    selectedSlot === slot
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:border-blue-300'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSlots(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleBooking}
                disabled={!selectedSlot || isBooking}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isBooking ? 'Booking…' : 'Confirm'}
              </button>
            </div>

            {bookingError && (
              <p className="mt-3 text-red-500 text-sm text-center">{bookingError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentBooking;
