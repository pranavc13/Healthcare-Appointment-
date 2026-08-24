import { Link } from 'react-router-dom';
import DoctorCard from '../components/DoctorCard';
import { Reveal, RevealGroup, RevealItem } from '../components/motion';
import { DoctorCardSkeleton } from '../components/ui/Skeleton';

export default function FeaturedDoctors({ doctors = [], loading = false }) {
  if (!loading && doctors.length === 0) return null;

  return (
    <section className="py-24 lg:py-28 px-5 sm:px-8 bg-cream-100 dark:bg-brand-900/40">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <p className="eyebrow">Meet the Team</p>
            <h2 className="mt-4 font-display text-4xl sm:text-[2.75rem] leading-[1.1] font-semibold text-brand-900 dark:text-cream-100">
              Your <span className="text-gold-gradient italic">dentists</span>
            </h2>
          </Reveal>

          <Reveal direction="left" delay={0.15}>
            <Link to="/doctors" className="text-sm font-semibold text-brand-800 dark:text-cream-100 link-underline">
              View full profiles
            </Link>
          </Reveal>
        </div>

        <RevealGroup className="mt-12 grid sm:grid-cols-2 gap-5" stagger={0.1}>
          {(loading ? [null, null] : doctors).map((doc, i) => (
            <RevealItem key={doc?._id || i}>
              {loading || !doc ? <DoctorCardSkeleton /> : <DoctorCard doctor={doc} />}
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
