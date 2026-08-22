import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, UserX, UserCheck } from 'lucide-react';
import * as adminService from '../../services/adminService';
import { useToast } from '../../components/Toast';
import { apiErrorMessage } from '../../services/api';

const EASE = [0.22, 1, 0.36, 1];
const EMPTY_FORM = { name: '', email: '', password: '', phone: '', specialisation: '', qualifications: '' };

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    adminService.listDoctors().then(setDoctors).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminService.createDoctor(form);
      toast.success('Doctor added');
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error('Could not add doctor', apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this doctor? They will no longer appear in patient search.')) return;
    try {
      await adminService.deactivateDoctor(id);
      toast.success('Doctor deactivated');
      load();
    } catch (err) {
      toast.error('Could not deactivate doctor', apiErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Doctors</h1>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-blue-200/40"
          >
            <Plus className="w-4 h-4" /> Add Doctor
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              onSubmit={handleCreate}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-hidden"
            >
              <input required name="name" placeholder="Full name" value={form.name} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white" />
              <input required type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white" />
              <input required type="password" name="password" placeholder="Initial password (min. 6 chars)" minLength={6} value={form.password} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white" />
              <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white" />
              <input required name="specialisation" placeholder="Specialisation (e.g. Cardiologist)" value={form.specialisation} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white" />
              <input name="qualifications" placeholder="Qualifications (e.g. MBBS, MD)" value={form.qualifications} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white" />
              <p className="sm:col-span-2 text-xs text-gray-400">Working hours and slot duration can be set after creating the doctor, from their edit page.</p>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={submitting} className="sm:col-span-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                {submitting ? 'Adding...' : 'Add Doctor'}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {doctors.map((doc, i) => (
                <motion.div
                  key={doc._id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3), ease: EASE }}
                  whileHover={{ y: -2 }}
                  className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                      {doc.userId?.name} {!doc.isActive && <span className="text-red-400 text-xs font-normal">(deactivated)</span>}
                    </p>
                    <p className="text-xs text-blue-500">{doc.specialisation}</p>
                    <p className="text-xs text-gray-400">{doc.userId?.email}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <Link to={`/admin/doctors/${doc._id}`} className="text-xs font-bold text-blue-600 hover:underline">
                      Edit / Leave
                    </Link>
                    {doc.isActive ? (
                      <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeactivate(doc._id)} className="text-red-400 hover:text-red-600" title="Deactivate">
                        <UserX className="w-4 h-4" />
                      </motion.button>
                    ) : (
                      <UserCheck className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
