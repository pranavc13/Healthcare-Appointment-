import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Search, SlidersHorizontal, Stethoscope } from 'lucide-react';
import * as doctorsService from '../services/doctorsService';
import DoctorCard from '../components/DoctorCard';
import { DoctorCardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { CountUp, Reveal } from '../components/motion';

const SORTS = [
  { value: 'rating', label: 'Top rated' },
  { value: 'experience', label: 'Most experienced' },
  { value: 'fee_asc', label: 'Fee: low to high' },
  { value: 'fee_desc', label: 'Fee: high to low' },
];

const EXPERIENCE_BANDS = [
  { value: '', label: 'Any experience' },
  { value: '5', label: '5+ years' },
  { value: '10', label: '10+ years' },
  { value: '20', label: '20+ years' },
  { value: '30', label: '30+ years' },
];

const FEE_BANDS = [
  { value: '', label: 'Any fee' },
  { value: '0-300', label: 'Under ₹300' },
  { value: '300-600', label: '₹300 – ₹600' },
  { value: '600-1000', label: '₹600 – ₹1,000' },
  { value: '1000-', label: 'Above ₹1,000' },
];

const FIELD =
  'h-11 w-full rounded-xl border border-border dark:border-brand-200/15 bg-white dark:bg-brand-900 ' +
  'text-[13.5px] text-brand-900 dark:text-cream-100 px-3.5 outline-none transition ' +
  'focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15';

export default function FindDoctors() {
  const [params, setParams] = useSearchParams();
  const [facets, setFacets] = useState(null);
  const [result, setResult] = useState({ doctors: [], total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [searchDraft, setSearchDraft] = useState(params.get('search') || '');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const query = useMemo(
    () => ({
      search: params.get('search') || '',
      specialisation: params.get('specialisation') || '',
      city: params.get('city') || '',
      fee: params.get('fee') || '',
      minExperience: params.get('minExperience') || '',
      sort: params.get('sort') || 'rating',
      page: Number(params.get('page')) || 1,
    }),
    [params]
  );

  const activeFilters = [query.specialisation, query.city, query.fee, query.minExperience].filter(Boolean).length;

  const patch = useCallback(
    (changes, { resetPage = true } = {}) => {
      const next = new URLSearchParams(params);
      Object.entries(changes).forEach(([k, v]) => {
        if (v) next.set(k, v);
        else next.delete(k);
      });
      if (resetPage) next.delete('page');
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  useEffect(() => {
    doctorsService.getFacets().then(setFacets).catch(() => {});
  }, []);

  useEffect(() => {
    setSearchDraft(query.search);
  }, [query.search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const [minFee, maxFee] = query.fee ? query.fee.split('-') : [];
    doctorsService
      .listDoctors({
        search: query.search || undefined,
        specialisation: query.specialisation || undefined,
        city: query.city || undefined,
        minFee: minFee || undefined,
        maxFee: maxFee || undefined,
        minExperience: query.minExperience || undefined,
        sort: query.sort,
        page: query.page,
        limit: 12,
      })
      .then((data) => { if (!cancelled) setResult(data); })
      .catch(() => { if (!cancelled) setResult({ doctors: [], total: 0, totalPages: 1, page: 1 }); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [query]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [query.page]);

  const goToPage = (p) => patch({ page: p > 1 ? String(p) : '' }, { resetPage: false });

  const pageNumbers = useMemo(() => {
    const { page } = query;
    const last = result.totalPages;
    const around = [page - 1, page, page + 1].filter((p) => p > 1 && p < last);
    return [...new Set([1, ...around, last])].filter((p) => p >= 1 && p <= last);
  }, [query, result.totalPages]);

  return (
    <div className="bg-cream-100 dark:bg-brand-950 min-h-screen">
      {/* ── Header ── */}
      <section className="relative overflow-hidden bg-brand-900 dark:bg-brand-950 text-cream-100 grain-overlay">
        <div className="absolute -right-32 -top-32 w-[520px] h-[520px] rounded-full bg-brand-700/40 blur-3xl animate-float-slow" aria-hidden />
        <div className="absolute -left-24 bottom-0 w-[360px] h-[360px] rounded-full bg-gold-700/15 blur-3xl animate-float" aria-hidden />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <Reveal>
            <p className="eyebrow !text-gold-300">The Directory</p>
            <h1 className="mt-4 font-display text-4xl sm:text-[3.1rem] leading-[1.08] font-semibold max-w-2xl">
              Find the right <span className="text-gold-gradient italic">specialist</span>
            </h1>
            <p className="mt-4 text-[15px] text-brand-200 max-w-lg">
              <CountUp value={facets?.stats?.totalDoctors || 17607} /> verified practitioners across{' '}
              {facets?.stats?.totalCities || 31} cities. Filter, compare, and hold a slot in one go.
            </p>
          </Reveal>

          {/* Search */}
          <Reveal delay={0.15} className="mt-9">
            <form
              onSubmit={(e) => { e.preventDefault(); patch({ search: searchDraft.trim() }); }}
              className="flex flex-col sm:flex-row gap-3 max-w-3xl"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-brand-300 pointer-events-none" />
                <input
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  placeholder="Search by name, speciality or locality"
                  className="h-[54px] w-full rounded-full bg-cream-50 dark:bg-brand-900 border border-transparent dark:border-brand-200/15 pl-12 pr-4 text-[14.5px] text-brand-900 dark:text-cream-100 placeholder:text-text-muted outline-none focus:ring-2 focus:ring-gold-400/50"
                />
              </div>
              <button
                type="submit"
                className="shine h-[54px] px-8 rounded-full bg-gold-400 hover:bg-gold-300 text-brand-900 text-[14px] font-bold transition-colors shrink-0"
              >
                Search
              </button>
            </form>
          </Reveal>

          {/* Speciality quick chips */}
          {facets?.specialities?.length > 0 && (
            <Reveal delay={0.25} className="mt-6">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {facets.specialities.slice(0, 12).map((s) => {
                  const active = query.specialisation === s.name;
                  return (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => patch({ specialisation: active ? '' : s.name })}
                      className={`shrink-0 h-9 px-4 rounded-full text-[12.5px] font-semibold whitespace-nowrap transition-colors ${
                        active
                          ? 'bg-gold-400 text-brand-900'
                          : 'bg-cream-100/10 text-cream-100 hover:bg-cream-100/20 border border-cream-100/15'
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── Filters + results ── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-[13.5px] text-text-secondary dark:text-brand-200">
            {loading ? 'Searching…' : (
              <>
                <span className="font-semibold text-brand-900 dark:text-cream-100">
                  {result.total.toLocaleString('en-IN')}
                </span>{' '}
                {result.total === 1 ? 'doctor' : 'doctors'} found
                {query.city ? ` in ${query.city}` : ''}
              </>
            )}
          </p>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="lg:hidden inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-border dark:border-brand-200/15 text-[13px] font-semibold text-brand-900 dark:text-cream-100"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilters > 0 && (
                <span className="w-5 h-5 rounded-full bg-brand-700 text-cream-100 text-[11px] font-bold flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>

            <select
              value={query.sort}
              onChange={(e) => patch({ sort: e.target.value === 'rating' ? '' : e.target.value })}
              className={`${FIELD} w-auto min-w-[168px]`}
              aria-label="Sort results"
            >
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Filter row */}
        <AnimatePresence initial={false}>
          {filtersOpen && (
            <motion.div
              key="mobile-filters"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden overflow-hidden"
            >
              <FilterFields facets={facets} query={query} patch={patch} className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-3" />
            </motion.div>
          )}
        </AnimatePresence>

        <FilterFields facets={facets} query={query} patch={patch} className="hidden lg:grid grid-cols-4 gap-3 mt-5" />

        {activeFilters > 0 && (
          <button
            type="button"
            onClick={() => patch({ specialisation: '', city: '', fee: '', minExperience: '', search: '' })}
            className="mt-4 inline-flex items-center gap-2 text-[12.5px] font-semibold text-brand-700 dark:text-gold-300 hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear all filters
          </button>
        )}

        {/* Results */}
        {loading ? (
          <div className="mt-9 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <DoctorCardSkeleton key={i} />)}
          </div>
        ) : result.doctors.length === 0 ? (
          <div className="mt-9 surface-card rounded-2xl">
            <EmptyState
              icon={Stethoscope}
              title="No doctors match those filters"
              description="Try widening the fee range, clearing the city, or searching a different speciality."
            />
          </div>
        ) : (
          <motion.div
            key={`${query.page}-${query.specialisation}-${query.city}-${query.sort}`}
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="mt-9 grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {result.doctors.map((doc) => (
              <motion.div
                key={doc._id}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
                }}
              >
                <DoctorCard doctor={doc} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && result.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <PagerButton disabled={query.page <= 1} onClick={() => goToPage(query.page - 1)} label="Previous">
              <ChevronLeft className="w-4 h-4" />
            </PagerButton>

            {pageNumbers.map((p, i) => (
              <span key={p} className="flex items-center gap-2">
                {i > 0 && p - pageNumbers[i - 1] > 1 && <span className="text-text-muted px-1">…</span>}
                <button
                  type="button"
                  onClick={() => goToPage(p)}
                  className={`min-w-[42px] h-[42px] px-3 rounded-xl text-[13.5px] font-semibold transition-colors ${
                    p === query.page
                      ? 'bg-brand-700 text-cream-100'
                      : 'border border-border dark:border-brand-200/15 text-brand-900 dark:text-cream-100 hover:bg-cream-200 dark:hover:bg-brand-800'
                  }`}
                >
                  {p}
                </button>
              </span>
            ))}

            <PagerButton disabled={query.page >= result.totalPages} onClick={() => goToPage(query.page + 1)} label="Next">
              <ChevronRight className="w-4 h-4" />
            </PagerButton>
          </div>
        )}
      </section>
    </div>
  );
}

function PagerButton({ disabled, onClick, label, children }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="w-[42px] h-[42px] rounded-xl border border-border dark:border-brand-200/15 flex items-center justify-center text-brand-900 dark:text-cream-100 transition-colors hover:bg-cream-200 dark:hover:bg-brand-800 disabled:opacity-40 disabled:pointer-events-none"
    >
      {children}
    </button>
  );
}

function FilterFields({ facets, query, patch, className }) {
  return (
    <div className={className}>
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

      <select value={query.fee} onChange={(e) => patch({ fee: e.target.value })} className={FIELD} aria-label="Consultation fee">
        {FEE_BANDS.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
      </select>

      <select value={query.minExperience} onChange={(e) => patch({ minExperience: e.target.value })} className={FIELD} aria-label="Experience">
        {EXPERIENCE_BANDS.map((x) => <option key={x.label} value={x.value}>{x.label}</option>)}
      </select>
    </div>
  );
}
