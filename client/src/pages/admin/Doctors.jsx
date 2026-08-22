import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, UserX, UserCheck } from 'lucide-react';
import * as adminService from '../../services/adminService';
import { useToast } from '../../components/Toast';
import { apiErrorMessage } from '../../services/api';

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Doctors</h1>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Doctor
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input required name="name" placeholder="Full name" value={form.name} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white" />
            <input required type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white" />
            <input required type="password" name="password" placeholder="Initial password (min. 6 chars)" minLength={6} value={form.password} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white" />
            <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white" />
            <input required name="specialisation" placeholder="Specialisation (e.g. Cardiologist)" value={form.specialisation} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white" />
            <input name="qualifications" placeholder="Qualifications (e.g. MBBS, MD)" value={form.qualifications} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white" />
            <p className="sm:col-span-2 text-xs text-gray-400">Working hours and slot duration can be set after creating the doctor, from their edit page.</p>
            <button type="submit" disabled={submitting} className="sm:col-span-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
              {submitting ? 'Adding...' : 'Add Doctor'}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : (
          <div className="space-y-3">
            {doctors.map((doc) => (
              <div key={doc._id} className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm">
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
                    <button onClick={() => handleDeactivate(doc._id)} className="text-red-400 hover:text-red-600" title="Deactivate">
                      <UserX className="w-4 h-4" />
                    </button>
                  ) : (
                    <UserCheck className="w-4 h-4 text-gray-300" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
