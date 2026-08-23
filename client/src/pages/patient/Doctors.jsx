import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Search, Stethoscope } from 'lucide-react';
import * as doctorsService from '../../services/doctorsService';
import { useToast } from '../../components/Toast';
import DoctorCard from '../../components/DoctorCard';
import { EmptyState } from '../../components/ui';
import { DoctorCardSkeleton } from '../../components/ui/Skeleton';

const FIELD =
  'h-11 w-full rounded-xl border border-border dark:border-brand-200/15 bg-white dark:bg-brand-900 ' +
  'text-[13.5px] text-brand-900 dark:text-cream-100 px-3.5 outline-none transition ' +
  'focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15';

const SORTS = [
  { value: 'rating', label: 'Top rated' },
  { value: 'experience', label: 'Most experienced' },
  { value: 'fee_asc', label: 'Fee: low to high' },
  { value: 'fee_desc', label: 'Fee: high to low' },
];

export default function PatientDoctors() {
  const [params, setParams] = useSearchParams();
  const [facets, setFacets] = useState(null);
  const [result, setResult] = useState({ doctors: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const query = useMemo(
    () => ({
      search: params.get('search') || '',
      specialisation: params.get('specialisation') || '',
      city: params.get('city') || '',
      sort: params.get('sort') || 'rating',
      page: Number(params.get('page')) || 1,
    }),
    [params]
  );

  const [draft, setDraft] = useState(query.search);
  useEffect(() => setDraft(query.search), [query.search]);

  const patch = (changes, { resetPage = true } = {}) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (resetPage) next.delete('page');
    setParams(next, { replace: true });
  };

  useEffect(() => {
    doctorsService.getFacets().then(setFacets).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    doctorsService
      .listDoctors({
        search: query.search || undefined,
        specialisation: query.specialisation || undefined,
        city: query.city || undefined,
        sort: query.sort,
        page: query.page,
        limit: 12,
      })
      .then((data) => { if (!cancelled) setResult(data); })
      .catch((err) => {
        if (cancelled) return;
        toast.error('Could not load doctors', err.response?.data?.message);
        setResult({ doctors: [], total: 0, totalPages: 1 });
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const hasFilters = Boolean(query.search || query.specialisation || query.city);

  return (
    <div className="space-y-6">
      {/* Search + filters */}
      <div className="surface-card rounded-2xl p-5">
        <form
          onSubmit={(e) => { e.preventDefault(); patch({ search: draft.trim() }); }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Search by name, speciality or locality"
              className={`${FIELD} pl-10`}
            />
          </div>
          <button
            type="submit"
            className="h-11 px-6 rounded-xl bg-brand-700 hover:bg-brand-800 text-cream-100 text-[13.5px] font-semibold transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select value={query.specialisation} onChange={(e) => patch({ specialisation: e.target.value })} className={FIELD} aria-label="Speciality">
            <option value="">All specialities</option>
            {(facets?.specialities || []).map((s) => (
              <option key={s.name} value={s.name}>{s.name} ({s.count.toLocaleString('en-IN')})</option>
            ))}
          </select>
          <select value={query.city} onChange={(e) => patch({ city: e.target.value })} className={FIELD} aria-label="City">
            <option value="">All cities</option>
            {(facets?.cities || []).map((c) => (
              <option key={c.name} value={c.name}>{c.name} ({c.count.toLocaleString('en-IN')})</option>
            ))}
          </select>
          <select value={query.sort} onChange={(e) => patch({ sort: e.target.value })} className={FIELD} aria-label="Sort">
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="mt-3.5 flex items-center justify-between gap-4">
          <p className="text-[12.5px] text-text-secondary dark:text-brand-200">
            {loading ? 'Searching…' : `${result.total.toLocaleString('en-IN')} doctors found`}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={() => patch({ search: '', specialisation: '', city: '' })}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand-700 dark:text-gold-300 hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <DoctorCardSkeleton key={i} />)}
        </div>
      ) : result.doctors.length === 0 ? (
        <div className="surface-card rounded-2xl">
          <EmptyState
            icon={Stethoscope}
            title="No doctors found"
            description="Try a different speciality, city, or clear your filters."
          />
        </div>
      ) : (
        <motion.div
          key={`${query.page}-${query.specialisation}-${query.city}-${query.sort}`}
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
        >
          {result.doctors.map((doc) => (
            <motion.div
              key={doc._id}
              variants={{
                hidden: { opacity: 0, y: 22 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
              }}
            >
              <DoctorCard doctor={doc} bookTo={`/patient/doctors/${doc._id}/book`} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {!loading && result.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            disabled={query.page <= 1}
            onClick={() => patch({ page: String(query.page - 1) }, { resetPage: false })}
            className="w-10 h-10 rounded-xl border border-border dark:border-brand-200/15 flex items-center justify-center text-brand-900 dark:text-cream-100 disabled:opacity-40 disabled:pointer-events-none hover:bg-cream-200 dark:hover:bg-brand-800 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[13px] font-medium text-text-secondary dark:text-brand-200">
            Page {query.page} of {result.totalPages}
          </span>
          <button
            type="button"
            disabled={query.page >= result.totalPages}
            onClick={() => patch({ page: String(query.page + 1) }, { resetPage: false })}
            className="w-10 h-10 rounded-xl border border-border dark:border-brand-200/15 flex items-center justify-center text-brand-900 dark:text-cream-100 disabled:opacity-40 disabled:pointer-events-none hover:bg-cream-200 dark:hover:bg-brand-800 transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
