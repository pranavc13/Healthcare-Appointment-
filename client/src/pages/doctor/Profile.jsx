import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as doctorPortalService from '../../services/doctorPortalService';
import { useToast } from '../../components/Toast';
import { apiErrorMessage } from '../../services/api';

const EASE = [0.22, 1, 0.36, 1];

export default function DoctorProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ bio: '', qualifications: '', profileImage: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    doctorPortalService
      .getProfile()
      .then((data) => {
        setProfile(data);
        setForm({ bio: data.bio || '', qualifications: data.qualifications || '', profileImage: data.profileImage || '' });
      })
      .catch((err) => toast.error('Could not load profile', apiErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await doctorPortalService.updateProfile(form);
      setProfile(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Could not save profile', apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-24 text-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">My Profile</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {profile?.userId?.name} · {profile?.specialisation}
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: EASE }}
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm space-y-5"
        >
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Qualifications</label>
            <input
              name="qualifications"
              value={form.qualifications}
              onChange={handleChange}
              placeholder="MBBS, MD - Cardiology"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white transition-shadow focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Tell patients about your experience and approach to care..."
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white resize-none transition-shadow focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Profile image URL</label>
            <input
              name="profileImage"
              value={form.profileImage}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white transition-shadow focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <p className="text-xs text-gray-400">
            Specialisation, working hours and slot duration are managed by your clinic admin.
          </p>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-2xl text-sm transition-colors shadow-lg shadow-blue-200/40 dark:shadow-none"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}
