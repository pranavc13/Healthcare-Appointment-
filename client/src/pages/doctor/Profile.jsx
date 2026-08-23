import { useEffect, useState } from 'react';
import * as doctorPortalService from '../../services/doctorPortalService';
import { useToast } from '../../components/Toast';
import { apiErrorMessage } from '../../services/api';
import { Card, Avatar, Button, Input } from '../../components/ui';

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

  if (loading) return null;

  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <div className="flex flex-col items-center text-center mb-6">
          <Avatar name={profile?.userId?.name} src={form.profileImage} size="lg" className="!h-20 !w-20 !text-xl mb-3" />
          <p className="font-semibold text-text-primary dark:text-white">{profile?.userId?.name}</p>
          <p className="text-sm text-text-secondary dark:text-brand-300">{profile?.specialisation}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" value={profile?.userId?.name || ''} disabled />
            <Input label="Email" value={profile?.userId?.email || ''} disabled />
          </div>

          <Input label="Specialisation" value={profile?.specialisation || ''} disabled />

          <Input
            label="Qualifications"
            name="qualifications"
            value={form.qualifications}
            onChange={handleChange}
            placeholder="MBBS, MD - Cardiology"
          />

          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Tell patients about your experience and approach to care..."
              className="w-full px-3 py-2.5 rounded-lg border border-border dark:border-brand-800 bg-white dark:bg-brand-950 text-sm text-text-primary dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-primary transition"
            />
          </div>

          <Input
            label="Profile image URL"
            name="profileImage"
            value={form.profileImage}
            onChange={handleChange}
            placeholder="https://..."
          />

          <p className="text-xs text-text-muted">Specialisation, working hours and slot duration are managed by your clinic admin.</p>

          <Button type="submit" loading={saving} className="w-full">Save Changes</Button>
        </form>
      </Card>
    </div>
  );
}
