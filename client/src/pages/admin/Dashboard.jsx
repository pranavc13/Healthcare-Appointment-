import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, UserCheck, UserX, Plus } from 'lucide-react';
import * as adminService from '../../services/adminService';
import { Stat, Button } from '../../components/ui';
import { StatSkeleton } from '../../components/ui/Skeleton';

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.listDoctors().then(setDoctors).finally(() => setLoading(false));
  }, []);

  const active = doctors.filter((d) => d.isActive).length;
  const inactive = doctors.length - active;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary dark:text-white">Admin Dashboard</h2>
        <Link to="/admin/doctors">
          <Button leftIcon={Plus}>Manage Doctors</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {loading ? (
          <>
            <StatSkeleton /><StatSkeleton /><StatSkeleton />
          </>
        ) : (
          <>
            <Stat icon={Stethoscope} label="Total Doctors" value={doctors.length} iconClassName="text-primary bg-primary-light" />
            <Stat icon={UserCheck} label="Active" value={active} iconClassName="text-success bg-success-bg" />
            <Stat icon={UserX} label="Deactivated" value={inactive} iconClassName="text-danger bg-danger-bg" />
          </>
        )}
      </div>
    </div>
  );
}
