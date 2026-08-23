import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, BadgeCheck, CalendarCheck, CalendarX, Clock, GraduationCap,
  IndianRupee, MapPin, Star, Stethoscope,
} from 'lucide-react';
import * as doctorsService from '../services/doctorsService';
import { AuthContext } from '../AuthContext';
import SmartImage from '../components/SmartImage';
import { isOnLeaveToday } from '../components/DoctorCard';
import { CountUp, Reveal, RevealGroup, RevealItem } from '../components/motion';
import { Skeleton } from '../components/ui/Skeleton';
import { faceFor } from '../home/images';
import { formatDateOnly } from '../utils/date';

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** The next 7 calendar days, used for the availability strip. */
function nextWeek() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}

export default function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, role } = useContext(AuthContext);

  const [doctor, setDoctor] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [availability, setAvailability] = useState({});

  useEffect(() => {
    let cancelled = false;
    setDoctor(null);
    setNotFound(false);
    doctorsService
      .getDoctor(id)
      .then((d) => { if (!cancelled) setDoctor(d); })
      .catch(() => { if (!cancelled) setNotFound(true); });
    return () => { cancelled = true; };
  }, [id]);

  // Slot counts for the week ahead. Failures are swallowed per-day so one bad
  // request never blanks out the whole strip.
  useEffect(() => {
    if (!doctor) return undefined;
    let cancelled = false;
    Promise.all(
      nextWeek().map((d) =>
        doctorsService
          .getSlots(id, formatDateOnly(d))
          .then((res) => [formatDateOnly(d), res.slots?.length || 0])
          .catch(() => [formatDateOnly(d), 0])
      )
    ).then((entries) => { if (!cancelled) setAvailability(Object.fromEntries(entries)); });
    return () => { cancelled = true; };
  }, [doctor, id]);

  if (notFound) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <Stethoscope className="w-12 h-12 text-text-muted mb-4" strokeWidth={1.5} />
        <h1 className="font-display text-2xl font-semibold text-brand-900 dark:text-cream-100">Doctor not found</h1>
        <p className="mt-2 text-sm text-text-secondary dark:text-brand-200">
          This profile may have been deactivated.
        </p>
        <Link to="/doctors" className="mt-6 h-11 px-6 rounded-full bg-brand-700 text-cream-100 text-sm font-semibold inline-flex items-center">
          Back to the directory
        </Link>
      </div>
    );
  }

  if (!doctor) return <DetailSkeleton />;

  const name = doctor.userId?.name || 'Doctor';
  const onLeave = isOnLeaveToday(doctor);
  const specialities = doctor.specialities?.length ? doctor.specialities : [doctor.specialisation];

  const groupedHours = DAY_ORDER.map((day) => ({
    day,
    ranges: (doctor.workingHours || []).filter((wh) => wh.day === day),
  })).filter((g) => g.ranges.length > 0);

  const handleBook = () => {
    if (currentUser && role === 'patient') navigate(`/patient/doctors/${id}/book`);
    else navigate('/login', { state: { from: `/patient/doctors/${id}/book` } });
  };

  return (
    <div className="bg-cream-100 dark:bg-brand-950 min-h-screen">
      {/* ── Profile header ── */}
      <section className="relative overflow-hidden bg-brand-900 dark:bg-brand-950 text-cream-100 grain-overlay">
        <div className="absolute -right-40 -top-40 w-[560px] h-[560px] rounded-full bg-brand-700/40 blur-3xl animate-float-slow" aria-hidden />
        <div className="absolute -left-24 bottom-0 w-[380px] h-[380px] rounded-full bg-gold-700/15 blur-3xl animate-float" aria-hidden />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
          <Link
            to="/doctors"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-brand-200 hover:text-cream-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to directory
          </Link>

          <div className="mt-8 grid sm:grid-cols-[168px_1fr] gap-7 items-start">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <SmartImage
                src={doctor.profileImage || faceFor(doctor._id || name)}
                alt={name}
                priority
                className="w-[140px] h-[140px] sm:w-[168px] sm:h-[168px] rounded-[1.5rem] shadow-lift ring-1 ring-cream-100/15"
              />
            </motion.div>

            <div>
              <Reveal direction="left">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-3xl sm:text-[2.6rem] leading-tight font-semibold">{name}</h1>
                  <BadgeCheck className="w-6 h-6 text-gold-300" />
                </div>
                <p className="mt-2 text-[15px] text-gold-300 font-medium">{doctor.specialisation}</p>

                {doctor.qualifications && (
                  <p className="mt-3 flex items-start gap-2 text-[13.5px] text-brand-200">
                    <GraduationCap className="w-4 h-4 mt-0.5 shrink-0" />
                    {doctor.qualifications}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13.5px] text-brand-200">
                  <span className="inline-flex items-center gap-2">
                    <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
                    <span className="font-semibold text-cream-100">{(doctor.rating || 0).toFixed(1)}</span>
                    {doctor.reviewCount > 0 && <span>({doctor.reviewCount.toLocaleString('en-IN')} patients)</span>}
                  </span>
                  {(doctor.city || doctor.locality) && (
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {[doctor.locality, doctor.city].filter(Boolean).join(', ')}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-2 font-semibold ${
                      onLeave ? 'text-red-300' : 'text-emerald-300'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {onLeave ? 'On leave today' : 'Accepting bookings'}
                  </span>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleBook}
                    className="shine inline-flex items-center gap-2.5 h-[52px] px-7 rounded-full bg-gold-400 hover:bg-gold-300 text-brand-900 text-[14.5px] font-bold transition-colors"
                  >
                    <CalendarCheck className="w-[18px] h-[18px]" />
                    Book appointment
                  </button>
                  <span className="inline-flex items-center gap-1.5 h-[52px] px-6 rounded-full border border-cream-100/25 font-display text-[19px] font-semibold">
                    <IndianRupee className="w-4 h-4" />
                    {doctor.consultationFee ? doctor.consultationFee.toLocaleString('en-IN') : '—'}
                    <span className="ml-1.5 font-sans text-[12px] font-medium text-brand-200">per visit</span>
                  </span>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16 grid lg:grid-cols-[1fr_340px] gap-8 items-start">
        <div className="space-y-8">
          {/* Stats */}
          <RevealGroup className="grid grid-cols-3 gap-4" stagger={0.09}>
            {[
              { label: 'Years of experience', value: doctor.experienceYears || 0, suffix: '+' },
              { label: 'Patient rating', value: doctor.rating || 0, decimals: 1, suffix: '/5' },
              { label: 'Minutes per slot', value: doctor.slotDuration || 30, suffix: '' },
            ].map((s) => (
              <RevealItem key={s.label} className="surface-card rounded-2xl p-5 text-center">
                <p className="font-display text-[28px] leading-none font-semibold text-brand-900 dark:text-cream-100">
                  <CountUp value={s.value} decimals={s.decimals || 0} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-[11.5px] text-text-secondary dark:text-brand-200 leading-snug">{s.label}</p>
              </RevealItem>
            ))}
          </RevealGroup>

          {/* About */}
          {doctor.bio && (
            <Reveal className="surface-card rounded-2xl p-7">
              <h2 className="font-display text-[22px] font-semibold text-brand-900 dark:text-cream-100">About</h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-text-secondary dark:text-brand-200">{doctor.bio}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {specialities.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center h-8 px-3.5 rounded-full bg-cream-200 dark:bg-brand-800 text-[12.5px] font-semibold text-brand-800 dark:text-gold-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Reveal>
          )}

          {/* Availability strip */}
          <Reveal className="surface-card rounded-2xl p-7">
            <h2 className="font-display text-[22px] font-semibold text-brand-900 dark:text-cream-100">
              Next seven days
            </h2>
            <p className="mt-1.5 text-[13px] text-text-secondary dark:text-brand-200">
              Open slots refresh live as other patients book.
            </p>

            <div className="mt-5 grid grid-cols-4 sm:grid-cols-7 gap-2.5">
              {nextWeek().map((d, i) => {
                const key = formatDateOnly(d);
                const count = availability[key];
                const loaded = count !== undefined;
                const free = loaded && count > 0;
                return (
                  <motion.button
                    key={key}
                    type="button"
                    onClick={handleBook}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className={`rounded-xl border p-3 text-center transition-all duration-300 hover:-translate-y-1 ${
                      free
                        ? 'border-brand-600/30 bg-brand-50 dark:bg-brand-800/60 dark:border-brand-200/15'
                        : 'border-border dark:border-brand-200/10 opacity-60'
                    }`}
                  >
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">
                      {d.toLocaleDateString('en-IN', { weekday: 'short' })}
                    </p>
                    <p className="mt-1 font-display text-[19px] font-semibold text-brand-900 dark:text-cream-100">
                      {d.getDate()}
                    </p>
                    <p className={`mt-1.5 text-[10.5px] font-semibold ${free ? 'text-brand-700 dark:text-gold-300' : 'text-text-muted'}`}>
                      {!loaded ? '—' : free ? `${count} slots` : 'Full'}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </Reveal>
        </div>

        {/* Sidebar: schedule */}
        <Reveal direction="left" className="lg:sticky lg:top-28 surface-card rounded-2xl p-6">
          <h2 className="flex items-center gap-2.5 font-display text-[20px] font-semibold text-brand-900 dark:text-cream-100">
            <Clock className="w-[18px] h-[18px] text-gold-500" />
            Clinic hours
          </h2>

          {groupedHours.length === 0 ? (
            <p className="mt-4 text-[13.5px] text-text-secondary dark:text-brand-200">
              No schedule published yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {groupedHours.map(({ day, ranges }) => (
                <li key={day} className="flex items-start justify-between gap-4 text-[13px]">
                  <span className="font-semibold text-brand-900 dark:text-cream-100">{day.slice(0, 3)}</span>
                  <span className="text-right text-text-secondary dark:text-brand-200">
                    {ranges.map((r) => `${r.startTime}–${r.endTime}`).join(', ')}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {doctor.leaveDays?.length > 0 && (
            <div className="mt-6 pt-5 border-t border-border dark:border-brand-200/10">
              <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-danger">
                <CalendarX className="w-4 h-4" /> Upcoming leave
              </p>
              <p className="mt-2.5 text-[13px] text-text-secondary dark:text-brand-200">
                {doctor.leaveDays
                  .map((d) => new Date(d))
                  .filter((d) => d >= new Date(new Date().toDateString()))
                  .slice(0, 4)
                  .map((d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }))
                  .join(' · ') || 'None scheduled'}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleBook}
            className="shine mt-6 w-full h-12 rounded-full bg-brand-700 hover:bg-brand-800 text-cream-100 text-[14px] font-bold transition-colors inline-flex items-center justify-center gap-2"
          >
            <CalendarCheck className="w-4 h-4" /> Book now
          </button>
          {!currentUser && (
            <p className="mt-3 text-center text-[11.5px] text-text-muted">
              You'll be asked to sign in first.
            </p>
          )}
        </Reveal>
      </section>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="bg-cream-100 dark:bg-brand-950 min-h-screen">
      <div className="bg-brand-900 dark:bg-brand-950 py-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid sm:grid-cols-[168px_1fr] gap-7">
          <Skeleton className="w-[168px] h-[168px] rounded-[1.5rem]" />
          <div className="space-y-3.5 pt-3">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-12 w-56 rounded-full mt-4" />
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 grid lg:grid-cols-[1fr_340px] gap-8">
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
          <Skeleton className="h-44 rounded-2xl" />
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}
