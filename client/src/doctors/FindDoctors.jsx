import { useEffect, useState } from 'react';
import { Stethoscope } from 'lucide-react';
import * as doctorsService from '../services/doctorsService';
import DoctorCard from '../components/DoctorCard';
import { DoctorCardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { Reveal, RevealGroup, RevealItem } from '../components/motion';
import { CLINIC_LOCALITY, CLINIC_CITY } from '../clinicInfo';

export default function FindDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    doctorsService
      .listDoctors({ sort: 'rating', limit: 12 })
      .then((res) => { if (!cancelled) setDoctors(res.doctors || []); })
      .catch(() => { if (!cancelled) setDoctors([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="bg-cream-100 dark:bg-brand-950 min-h-screen">
      {/* ── Header ── */}
      <section className="relative overflow-hidden bg-brand-900 dark:bg-brand-950 text-cream-100 grain-overlay">
        <div className="absolute -right-32 -top-32 w-[520px] h-[520px] rounded-full bg-brand-700/40 blur-3xl animate-float-slow" aria-hidden />
        <div className="absolute -left-24 bottom-0 w-[360px] h-[360px] rounded-full bg-gold-700/15 blur-3xl animate-float" aria-hidden />

        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <Reveal>
            <p className="eyebrow !text-gold-300">Meet the Team</p>
            <h1 className="mt-4 font-display text-4xl sm:text-[3.1rem] leading-[1.08] font-semibold max-w-2xl">
              Two dentists, <span className="text-gold-gradient italic">one clinic</span>
            </h1>
            <p className="mt-4 text-[15px] text-brand-200 max-w-lg">
              Every appointment at our {CLINIC_LOCALITY}, {CLINIC_CITY} clinic is with a dentist you can
              actually get to know. Pick a profile below to see their schedule and book directly.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Doctors ── */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-6">
            <DoctorCardSkeleton /><DoctorCardSkeleton />
          </div>
        ) : doctors.length === 0 ? (
          <div className="surface-card rounded-2xl">
            <EmptyState
              icon={Stethoscope}
              title="No doctors available right now"
              description="Please check back shortly, or contact the clinic directly."
            />
          </div>
        ) : (
          <RevealGroup className="grid sm:grid-cols-2 gap-6" stagger={0.1}>
            {doctors.map((doc) => (
              <RevealItem key={doc._id}>
                <DoctorCard doctor={doc} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </section>
    </div>
  );
}
