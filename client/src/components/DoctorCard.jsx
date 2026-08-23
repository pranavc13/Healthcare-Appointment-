import { Link } from 'react-router-dom';
import { ArrowUpRight, IndianRupee, MapPin, Star } from 'lucide-react';
import SmartImage from './SmartImage';
import { faceFor } from '../home/images';

export function isOnLeaveToday(doctor) {
  const today = new Date().toDateString();
  return (doctor.leaveDays || []).some((d) => new Date(d).toDateString() === today);
}

export default function DoctorCard({ doctor, bookTo, compact = false }) {
  const name = doctor.userId?.name || 'Doctor';
  const onLeave = isOnLeaveToday(doctor);
  const to = bookTo || `/doctors/${doctor._id}`;

  return (
    <Link
      to={to}
      className="group flex flex-col h-full surface-card rounded-2xl overflow-hidden transition-all duration-400 hover:-translate-y-1.5 hover:shadow-lift"
    >
      <div className="relative">
        <SmartImage
          src={doctor.profileImage || faceFor(doctor._id || name)}
          alt={name}
          className={compact ? 'aspect-[4/3]' : 'aspect-[4/3.1]'}
          imgClassName="group-hover:scale-[1.06]"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950/75 via-brand-950/10 to-transparent" aria-hidden />
        </SmartImage>

        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-cream-50/95 dark:bg-brand-900/95 px-2.5 py-1 text-[11px] font-bold text-brand-800 dark:text-gold-300 shadow-sm">
          <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
          {(doctor.rating || 0).toFixed(1)}
        </span>

        <span
          className={`absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider ${
            onLeave ? 'bg-danger-bg text-danger' : 'bg-emerald-500/95 text-white'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {onLeave ? 'On leave' : 'Available'}
        </span>

        <div className="absolute bottom-0 inset-x-0 p-4">
          <h3 className="font-display text-[18px] leading-tight font-semibold text-cream-50 truncate">{name}</h3>
          <p className="mt-1 text-[12px] text-cream-200/85 truncate">{doctor.specialisation}</p>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col">
        {doctor.qualifications && (
          <p className="text-[12px] text-text-secondary dark:text-brand-200 line-clamp-1">{doctor.qualifications}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-text-secondary dark:text-brand-200">
          {(doctor.city || doctor.locality) && (
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-brand-500 dark:text-gold-400" />
              <span className="truncate">{[doctor.locality, doctor.city].filter(Boolean).join(', ')}</span>
            </span>
          )}
          {doctor.experienceYears > 0 && <span>{doctor.experienceYears} yrs exp</span>}
        </div>

        <div className="mt-4 pt-3.5 border-t border-border dark:border-brand-200/10 flex items-center justify-between">
          <span className="inline-flex items-center font-display text-[17px] font-semibold text-brand-900 dark:text-cream-100">
            <IndianRupee className="w-3.5 h-3.5" />
            {doctor.consultationFee ? doctor.consultationFee.toLocaleString('en-IN') : '—'}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand-700 dark:text-gold-300">
            Book
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
