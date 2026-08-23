import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as doctorsService from '../services/doctorsService';
import DoctorCard from '../components/DoctorCard';
import { Reveal } from '../components/motion';
import { DoctorCardSkeleton } from '../components/ui/Skeleton';

export default function FeaturedDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    doctorsService
      .listDoctors({ limit: 12, sort: 'rating' })
      .then((res) => { if (!cancelled) setDoctors(res.doctors || []); })
      .catch(() => { if (!cancelled) setDoctors([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: 'smooth' });
  };

  if (!loading && doctors.length === 0) return null;

  return (
    <section className="py-24 lg:py-28 px-5 sm:px-8 bg-cream-100 dark:bg-brand-900/40 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <p className="eyebrow">Top Rated This Week</p>
            <h2 className="mt-4 font-display text-4xl sm:text-[2.75rem] leading-[1.1] font-semibold text-brand-900 dark:text-cream-100">
              Meet the <span className="text-gold-gradient italic">specialists</span>
            </h2>
          </Reveal>

          <Reveal direction="left" delay={0.15} className="flex items-center gap-3">
            <Link to="/doctors" className="text-sm font-semibold text-brand-800 dark:text-cream-100 link-underline mr-2">
              Browse all
            </Link>
            {[['Previous', ChevronLeft, -1], ['Next', ChevronRight, 1]].map(([label, Icon, dir]) => (
              <button
                key={label}
                onClick={() => scrollBy(dir)}
                aria-label={label}
                className="w-11 h-11 rounded-full border border-brand-700/25 dark:border-brand-200/25 flex items-center justify-center text-brand-800 dark:text-cream-100 transition-all duration-300 hover:bg-brand-700 hover:text-cream-100 hover:border-brand-700 active:scale-95"
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </Reveal>
        </div>

        <div
          ref={trackRef}
          className="mt-12 flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-1 px-1"
        >
          {(loading ? Array.from({ length: 4 }) : doctors).map((doc, i) => (
            <div key={doc?._id || i} className="snap-start shrink-0 w-[270px] sm:w-[290px]">
              {loading ? <DoctorCardSkeleton /> : <DoctorCard doctor={doc} compact />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
