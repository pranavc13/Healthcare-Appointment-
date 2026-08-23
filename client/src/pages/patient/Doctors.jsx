import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Stethoscope, ArrowRight } from 'lucide-react';
import * as doctorsService from '../../services/doctorsService';
import { useToast } from '../../components/Toast';
import { Card, Badge, Avatar, EmptyState } from '../../components/ui';
import Input from '../../components/ui/Input';
import { DoctorCardSkeleton } from '../../components/ui/Skeleton';

function isOnLeaveToday(doctor) {
  const today = new Date().toDateString();
  return (doctor.leaveDays || []).some((d) => new Date(d).toDateString() === today);
}

export default function PatientDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [specialisation, setSpecialisation] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = async (params = {}) => {
    setLoading(true);
    try {
      const data = await doctorsService.listDoctors(params);
      setDoctors(data);
    } catch (err) {
      toast.error('Could not load doctors', err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(specialisation ? { specialisation } : {});
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          icon={Search}
          value={specialisation}
          onChange={(e) => setSpecialisation(e.target.value)}
          placeholder="Search by specialisation, e.g. Cardiologist"
          containerClassName="flex-1"
        />
        <button
          type="submit"
          className="h-10 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors shrink-0"
        >
          Search
        </button>
      </form>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <DoctorCardSkeleton /><DoctorCardSkeleton /><DoctorCardSkeleton /><DoctorCardSkeleton />
        </div>
      ) : doctors.length === 0 ? (
        <Card>
          <EmptyState icon={Stethoscope} title="No doctors found" description="Try a different specialisation." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {doctors.map((doc) => {
            const onLeave = isOnLeaveToday(doc);
            return (
              <Card key={doc._id} hoverable>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar name={doc.userId?.name} size="lg" />
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary dark:text-white truncate">{doc.userId?.name}</p>
                    <Badge variant="neutral" dot={false} className="mt-1">{doc.specialisation}</Badge>
                  </div>
                </div>
                {doc.qualifications && (
                  <p className="text-sm text-text-secondary dark:text-slate-400 mb-4 truncate">{doc.qualifications}</p>
                )}
                <div className="flex items-center justify-between">
                  {onLeave ? (
                    <span className="text-sm font-medium text-danger">On leave today</span>
                  ) : (
                    <span className="text-sm font-medium text-success">Accepting bookings</span>
                  )}
                  <Link
                    to={`/patient/doctors/${doc._id}/book`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Book <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
