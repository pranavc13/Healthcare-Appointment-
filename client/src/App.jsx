import { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import * as doctorsService from './services/doctorsService';
import { ScrollProgress } from './components/motion';
import Hero from './home/Hero';
import FeatureStrip from './home/FeatureStrip';
import About from './home/About';
import Specialities from './home/Specialities';
import HowItWorks from './home/HowItWorks';
import FeaturedDoctors from './home/FeaturedDoctors';
import AIShowcase from './home/AIShowcase';
import Testimonials from './home/Testimonials';
import CTABand from './home/CTABand';

const ROLE_HOME = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard' };

export default function App() {
  const { currentUser, role } = useContext(AuthContext);
  const [facets, setFacets] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    doctorsService
      .getFacets()
      .then((data) => { if (!cancelled) setFacets(data); })
      .catch(() => {});
    doctorsService
      .listDoctors({ limit: 2, sort: 'rating' })
      .then((res) => { if (!cancelled) setDoctors(res.doctors || []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setDoctorsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (currentUser) {
    return <Navigate to={ROLE_HOME[role] || '/'} replace />;
  }

  return (
    <div className="bg-cream-100 dark:bg-brand-950">
      <ScrollProgress />
      <Hero stats={facets?.stats} doctors={doctors} />
      <FeatureStrip />
      <About stats={facets?.stats} />
      <Specialities />
      <HowItWorks />
      <FeaturedDoctors doctors={doctors} loading={doctorsLoading} />
      <AIShowcase />
      <Testimonials />
      <CTABand />
    </div>
  );
}
