import React from 'react';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import DoctorRating from './DoctorRating';
import AppointmentTimeline from './AppointmentTimeline';

const STATUS_STYLE = {
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  pending:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
};

export default function AppointmentCard({ appointment, handleCancelAppointment, doctorId }) {
  const startTime = appointment.startTime instanceof Date
    ? appointment.startTime
    : new Date(appointment.startTime);

  const isFuture    = startTime > new Date();
  const isCancelled = appointment.status === 'cancelled';
  const isCompleted = appointment.status === 'completed';
  const hasRating   = !!appointment.rating;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 hover:shadow-md transition-shadow animate-fade-in">
      <div className="flex items-start gap-4">

        {/* Date block */}
        <div className="text-center min-w-[56px] bg-blue-50 dark:bg-blue-900/30 rounded-xl p-3 shrink-0">
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">{format(startTime, 'MMM')}</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 leading-none">{format(startTime, 'dd')}</div>
          <div className="text-xs text-gray-400">{format(startTime, 'yyyy')}</div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Dr. {appointment.doctorName}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{appointment.timeSlot}</p>
              {appointment.location && (
                <p className="text-xs text-gray-400 mt-0.5">{appointment.location}</p>
              )}
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${STATUS_STYLE[appointment.status] ?? STATUS_STYLE.pending}`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </div>

          {/* Rating for completed appointments */}
          {isCompleted && !hasRating && doctorId && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
              <DoctorRating
                appointmentId={appointment.id}
                doctorId={doctorId || appointment.doctorId}
              />
            </div>
          )}

          {isCompleted && hasRating && (
            <div className="mt-2 flex items-center gap-1 text-sm text-yellow-500">
              {'★'.repeat(appointment.rating)}{'☆'.repeat(5 - appointment.rating)}
              <span className="text-xs text-gray-400 ml-1">You rated this visit</span>
            </div>
          )}

          {/* Appointment Timeline */}
          {!isCancelled && (
            <AppointmentTimeline status={appointment.status} />
          )}

          {/* Cancel button */}
          {!isCancelled && !isCompleted && isFuture && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => handleCancelAppointment(appointment.id)}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
