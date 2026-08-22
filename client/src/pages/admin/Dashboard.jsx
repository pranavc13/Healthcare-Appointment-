import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, UserCheck, UserX, Plus } from 'lucide-react';
import * as adminService from '../../services/adminService';

const EASE = [0.22, 1, 0.36, 1];

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.listDoctors().then(setDoctors).finally(() => setLoading(false));
  }, []);

  const active = doctors.filter((d) => d.isActive).length;
  const inactive = doctors.length - active;

  const STATS = [
    { icon: Stethoscope, value: doctors.length, label: 'Total Doctors', color: 'text-blue-500' },
    { icon: UserCheck, value: active, label: 'Active', color: 'text-green-500' },
    { icon: UserX, value: inactive, label: 'Deactivated', color: 'text-red-400' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Admin Dashboard</h1>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link to="/admin/doctors" className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-blue-200/40">
              <Plus className="w-4 h-4" /> Manage Doctors
            </Link>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATS.map(({ icon: Icon, value, label, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.08, ease: EASE }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-shadow duration-300"
            >
              <Icon className={`w-6 h-6 ${color} mb-2`} />
              <p className="text-2xl font-black text-gray-900 dark:text-white">{loading ? '—' : value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
