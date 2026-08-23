import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserX, UserCheck, Pencil, CalendarDays } from 'lucide-react';
import * as adminService from '../../services/adminService';
import { useToast } from '../../components/Toast';
import { apiErrorMessage } from '../../services/api';
import { Card, Table, Badge, Avatar, Button, Modal, Input } from '../../components/ui';
import { TableSkeleton } from '../../components/ui/Skeleton';

const EMPTY_FORM = { name: '', email: '', password: '', phone: '', specialisation: '', qualifications: '' };
const SLOT_DURATIONS = [15, 20, 30, 45, 60];

export default function AdminDoctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM, slotDuration: 30 });
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
      setForm({ ...EMPTY_FORM, slotDuration: 30 });
      setShowModal(false);
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

  const columns = [
    {
      key: 'doctor',
      header: 'Doctor',
      render: (d) => (
        <div className="flex items-center gap-3">
          <Avatar name={d.userId?.name} size="sm" />
          <div className="min-w-0">
            <p className="font-medium text-text-primary dark:text-white truncate">{d.userId?.name}</p>
            <p className="text-xs text-text-muted truncate">{d.userId?.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'specialisation', header: 'Specialisation' },
    { key: 'slotDuration', header: 'Slot Duration', render: (d) => `${d.slotDuration || 30} min` },
    { key: 'status', header: 'Status', render: (d) => <Badge variant={d.isActive ? 'confirmed' : 'cancelled'}>{d.isActive ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (d) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/admin/doctors/${d._id}`)}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={() => navigate(`/admin/doctors/${d._id}`)}
            className="inline-flex items-center gap-1 text-xs font-medium text-text-secondary dark:text-slate-400 hover:underline"
          >
            <CalendarDays className="w-3.5 h-3.5" /> Manage Leave
          </button>
          {d.isActive ? (
            <button onClick={() => handleDeactivate(d._id)} className="text-text-muted hover:text-danger transition-colors" title="Deactivate">
              <UserX className="w-4 h-4" />
            </button>
          ) : (
            <UserCheck className="w-4 h-4 text-gray-300 dark:text-slate-600" />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary dark:text-white">Doctors</h2>
        <Button leftIcon={Plus} onClick={() => setShowModal(true)}>Add Doctor</Button>
      </div>

      <Card fullBleed>
        {loading ? <TableSkeleton rows={4} cols={5} /> : <Table columns={columns} data={doctors} />}
      </Card>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Add Doctor"
        description="Creates a login account and doctor profile."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Full name" required name="name" value={form.name} onChange={handleChange} placeholder="Dr. Alexa Mathew" />
          <Input label="Email" required type="email" name="email" value={form.email} onChange={handleChange} placeholder="doctor@example.com" />
          <Input label="Password" required type="password" minLength={6} name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" />
          <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
          <Input label="Specialisation" required name="specialisation" value={form.specialisation} onChange={handleChange} placeholder="Cardiologist" />
          <Input label="Qualifications" name="qualifications" value={form.qualifications} onChange={handleChange} placeholder="MBBS, MD" />
          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5">Slot duration</label>
            <select
              name="slotDuration"
              value={form.slotDuration}
              onChange={handleChange}
              className="h-10 w-full rounded-lg border border-border dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-text-primary dark:text-white px-3 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-primary transition"
            >
              {SLOT_DURATIONS.map((m) => <option key={m} value={m}>{m} minutes</option>)}
            </select>
          </div>
          <p className="text-xs text-text-muted">Working hours can be set after creating the doctor, from their edit page.</p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
