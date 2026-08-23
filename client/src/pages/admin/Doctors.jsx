import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, ChevronLeft, ChevronRight, Pencil, Plus, Search, UserCheck, UserX } from 'lucide-react';
import * as adminService from '../../services/adminService';
import { useToast } from '../../components/Toast';
import { apiErrorMessage } from '../../services/api';
import { Card, Table, Badge, Avatar, Button, Modal, Input } from '../../components/ui';
import { TableSkeleton } from '../../components/ui/Skeleton';

const EMPTY_FORM = {
  name: '', email: '', password: '', phone: '', specialisation: '',
  qualifications: '', city: '', locality: '', consultationFee: '', experienceYears: '',
};
const SLOT_DURATIONS = [15, 20, 30, 45, 60];

export default function AdminDoctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM, slotDuration: 30 });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  // The directory holds ~17k profiles once the dataset is imported, so this
  // list is always paginated and filtered server-side.
  const load = useCallback(() => {
    setLoading(true);
    adminService
      .listDoctors({ page, limit: 20, search: search || undefined })
      .then((res) => {
        setDoctors(res.doctors || []);
        setMeta({ page: res.page, totalPages: res.totalPages, total: res.total });
      })
      .catch((err) => toast.error('Could not load doctors', apiErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  useEffect(load, [load]);

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
            <p className="font-medium text-text-primary dark:text-cream-100 truncate">{d.userId?.name}</p>
            <p className="text-xs text-text-muted truncate">{d.userId?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'specialisation',
      header: 'Specialisation',
      render: (d) => (
        <div className="min-w-0">
          <p className="truncate">{d.specialisation}</p>
          {d.city && <p className="text-xs text-text-muted truncate">{[d.locality, d.city].filter(Boolean).join(', ')}</p>}
        </div>
      ),
    },
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
            className="inline-flex items-center gap-1 text-xs font-medium text-text-secondary dark:text-brand-200 hover:underline"
          >
            <CalendarDays className="w-3.5 h-3.5" /> Manage Leave
          </button>
          {d.isActive ? (
            <button onClick={() => handleDeactivate(d._id)} className="text-text-muted hover:text-danger transition-colors" title="Deactivate">
              <UserX className="w-4 h-4" />
            </button>
          ) : (
            <UserCheck className="w-4 h-4 text-text-muted/50" />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-[26px] font-semibold text-text-primary dark:text-cream-100">Doctors</h2>
          <p className="mt-1 text-[13px] text-text-secondary dark:text-brand-200">
            {loading ? 'Loading...' : `${meta.total.toLocaleString('en-IN')} profiles in the directory`}
          </p>
        </div>
        <Button leftIcon={Plus} onClick={() => setShowModal(true)}>Add Doctor</Button>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(searchDraft.trim()); }}
        className="flex gap-3"
      >
        <Input
          icon={Search}
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          placeholder="Search by name, specialisation or city"
          containerClassName="flex-1"
        />
        <Button type="submit" className="shrink-0">Search</Button>
      </form>

      <Card fullBleed>
        {loading ? <TableSkeleton rows={6} cols={5} /> : <Table columns={columns} data={doctors} />}
      </Card>

      {!loading && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={meta.page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="w-10 h-10 rounded-xl border border-border dark:border-brand-200/15 flex items-center justify-center text-text-primary dark:text-cream-100 disabled:opacity-40 disabled:pointer-events-none hover:bg-cream-200 dark:hover:bg-brand-800 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[13px] font-medium text-text-secondary dark:text-brand-200">
            Page {meta.page} of {meta.totalPages}
          </span>
          <button
            type="button"
            disabled={meta.page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="w-10 h-10 rounded-xl border border-border dark:border-brand-200/15 flex items-center justify-center text-text-primary dark:text-cream-100 disabled:opacity-40 disabled:pointer-events-none hover:bg-cream-200 dark:hover:bg-brand-800 transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

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
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" name="city" value={form.city} onChange={handleChange} placeholder="Bangalore" />
            <Input label="Locality" name="locality" value={form.locality} onChange={handleChange} placeholder="Indiranagar" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Consultation fee" type="number" min={0} name="consultationFee" value={form.consultationFee} onChange={handleChange} placeholder="600" />
            <Input label="Years of experience" type="number" min={0} name="experienceYears" value={form.experienceYears} onChange={handleChange} placeholder="12" />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5">Slot duration</label>
            <select
              name="slotDuration"
              value={form.slotDuration}
              onChange={handleChange}
              className="h-10 w-full rounded-lg border border-border dark:border-brand-200/15 bg-white dark:bg-brand-900 text-sm text-text-primary dark:text-cream-100 px-3 focus:outline-none focus:ring-2 focus:ring-brand-600/15 focus:border-brand-600 transition"
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
