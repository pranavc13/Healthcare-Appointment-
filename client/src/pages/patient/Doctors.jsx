import { useEffect, useState } from 'react';
import { Stethoscope } from 'lucide-react';
import * as doctorsService from '../../services/doctorsService';
import { useToast } from '../../components/Toast';
import DoctorCard from '../../components/DoctorCard';
import { EmptyState } from '../../components/ui';
import { DoctorCardSkeleton } from '../../components/ui/Skeleton';

export default function PatientDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    doctorsService
      .listDoctors({ sort: 'rating', limit: 12 })
      .then((res) => { if (!cancelled) setDoctors(res.doctors || []); })
      .catch((err) => {
        if (cancelled) return;
        toast.error('Could not load doctors', err.response?.data?.message);
        setDoctors([]);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-[22px] font-semibold text-text-primary dark:text-cream-100">
          Our dentists
        </h2>
        <p className="mt-1 text-[13px] text-text-secondary dark:text-brand-200">
          Pick a profile to see their schedule and book a slot.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <DoctorCardSkeleton /><DoctorCardSkeleton />
        </div>
      ) : doctors.length === 0 ? (
        <div className="surface-card rounded-2xl">
          <EmptyState
            icon={Stethoscope}
            title="No doctors available"
            description="Please check back shortly, or contact the clinic directly."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {doctors.map((doc) => (
            <DoctorCard key={doc._id} doctor={doc} bookTo={`/patient/doctors/${doc._id}/book`} />
          ))}
        </div>
      )}
    </div>
  );
}
