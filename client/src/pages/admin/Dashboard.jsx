import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, UserCheck, UserX, Plus } from 'lucide-react';
import * as adminService from '../../services/adminService';

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.listDoctors().then(setDoctors).finally(() => setLoading(false));
  }, []);

  const active = doctors.filter((d) => d.isActive).length;
  const inactive = doctors.length - active;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Admin Dashboard</h1>
          <Link to="/admin/doctors" className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <Plus className="w-4 h-4" /> Manage Doctors
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm">
            <Stethoscope className="w-6 h-6 text-blue-500 mb-2" />
            <p className="text-2xl font-black text-gray-900 dark:text-white">{loading ? '—' : doctors.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Doctors</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm">
            <UserCheck className="w-6 h-6 text-green-500 mb-2" />
            <p className="text-2xl font-black text-gray-900 dark:text-white">{loading ? '—' : active}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm">
            <UserX className="w-6 h-6 text-red-400 mb-2" />
            <p className="text-2xl font-black text-gray-900 dark:text-white">{loading ? '—' : inactive}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Deactivated</p>
          </div>
        </div>
      </div>
    </div>
  );
}
