import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ErrorBoundary from './ErrorBoundary.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './components/Toast.jsx';
import PrivateRoute from './PrivateRoute.jsx';
import Layout from './components/layout.jsx';
import PortalLayout from './components/PortalLayout.jsx';

/* Eagerly loaded (always needed) */
import App           from './App.jsx';
import CustomCursor  from './components/CustomCursor.jsx';

/* Lazy loaded — splits the bundle per route */
const SignupPage      = lazy(() => import('./signup/signup.jsx'));
const LoginPage        = lazy(() => import('./login/login.jsx'));
const NGO             = lazy(() => import('./NGOs/ngo.jsx'));
const AIAssistant     = lazy(() => import('./ai-assistant/AIAssistant.jsx'));
const Emergency       = lazy(() => import('./emergency/Emergency.jsx'));
const About           = lazy(() => import('./about/About.jsx'));
const FAQ             = lazy(() => import('./faq/FAQ.jsx'));
const HealthGame      = lazy(() => import('./game/Game.jsx'));
const BMITracker      = lazy(() => import('./bmi-tracker/BMITracker.jsx'));
const MedicalRecords  = lazy(() => import('./medical-records/MedicalRecords.jsx'));

/* Public doctor directory (backed by the imported practitioner dataset) */
const FindDoctors     = lazy(() => import('./doctors/FindDoctors.jsx'));
const DoctorDetail    = lazy(() => import('./doctors/DoctorDetail.jsx'));

/* Patient portal */
const PatientDashboard      = lazy(() => import('./pages/patient/Dashboard.jsx'));
const PatientDoctors        = lazy(() => import('./pages/patient/Doctors.jsx'));
const PatientBookAppointment = lazy(() => import('./pages/patient/BookAppointment.jsx'));
const PatientAppointments   = lazy(() => import('./pages/patient/Appointments.jsx'));
const PatientAppointmentDetail = lazy(() => import('./pages/patient/AppointmentDetail.jsx'));
const PatientCalendarConnect = lazy(() => import('./pages/patient/CalendarConnect.jsx'));

/* Doctor portal */
const DoctorDashboard       = lazy(() => import('./pages/doctor/Dashboard.jsx'));
const DoctorAppointmentDetail = lazy(() => import('./pages/doctor/AppointmentDetail.jsx'));
const DoctorProfile         = lazy(() => import('./pages/doctor/Profile.jsx'));
const DoctorCalendarConnect = lazy(() => import('./pages/doctor/CalendarConnect.jsx'));

/* Admin portal */
const AdminDashboard        = lazy(() => import('./pages/admin/Dashboard.jsx'));
const AdminDoctors          = lazy(() => import('./pages/admin/Doctors.jsx'));
const AdminDoctorEdit       = lazy(() => import('./pages/admin/DoctorEdit.jsx'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-100 dark:bg-brand-950">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-brand-200 dark:border-brand-800" />
          <div className="absolute inset-0 rounded-full border-2 border-gold-400 border-t-transparent animate-spin" />
        </div>
        <p className="text-[13px] font-medium tracking-wide text-text-muted">Loading…</p>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-100 dark:bg-brand-950 px-5">
      <div className="text-center">
        <p className="font-display text-[7rem] leading-none font-semibold text-cream-200 dark:text-brand-900 mb-2 select-none">404</p>
        <h1 className="font-display text-3xl font-semibold text-brand-900 dark:text-cream-100 mb-3">Page not found</h1>
        <p className="text-text-secondary dark:text-brand-200 text-sm mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-brand-700 hover:bg-brand-800 text-cream-100 font-semibold text-sm transition-colors"
        >
          ← Back to home
        </a>
      </div>
    </div>
  );
}

/* Inner component so AnimatePresence can read useLocation */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Routes using Layout (Navbar + BottomNav + ChatWidget) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<App />} />
          <Route path="help"          element={<NGO />} />
          <Route path="emergency"     element={<Emergency />} />
          <Route path="doctors"       element={<FindDoctors />} />
          <Route path="doctors/:id"   element={<DoctorDetail />} />
          <Route path="about"         element={<About />} />
          <Route path="ai-assistant"  element={<AIAssistant />} />
          <Route path="faq"           element={<FAQ />} />
          <Route path="game"          element={<HealthGame />} />
          <Route path="bmi-tracker"   element={<BMITracker />} />
          <Route path="medical-records" element={<PrivateRoute><MedicalRecords /></PrivateRoute>} />
        </Route>

        {/* Portal routes — Sidebar + TopBar shell instead of the marketing Navbar */}
        <Route element={<PortalLayout />}>
          {/* Patient portal */}
          <Route path="patient/dashboard"            element={<PrivateRoute roles={['patient']}><PatientDashboard /></PrivateRoute>} />
          <Route path="patient/doctors"               element={<PrivateRoute roles={['patient']}><PatientDoctors /></PrivateRoute>} />
          <Route path="patient/doctors/:id/book"      element={<PrivateRoute roles={['patient']}><PatientBookAppointment /></PrivateRoute>} />
          <Route path="patient/appointments"          element={<PrivateRoute roles={['patient']}><PatientAppointments /></PrivateRoute>} />
          <Route path="patient/appointments/:id"      element={<PrivateRoute roles={['patient']}><PatientAppointmentDetail /></PrivateRoute>} />
          <Route path="patient/calendar-connect"      element={<PrivateRoute roles={['patient']}><PatientCalendarConnect /></PrivateRoute>} />

          {/* Doctor portal */}
          <Route path="doctor/dashboard"              element={<PrivateRoute roles={['doctor']}><DoctorDashboard /></PrivateRoute>} />
          <Route path="doctor/appointments/:id"       element={<PrivateRoute roles={['doctor']}><DoctorAppointmentDetail /></PrivateRoute>} />
          <Route path="doctor/profile"                element={<PrivateRoute roles={['doctor']}><DoctorProfile /></PrivateRoute>} />
          <Route path="doctor/calendar-connect"       element={<PrivateRoute roles={['doctor']}><DoctorCalendarConnect /></PrivateRoute>} />

          {/* Admin portal */}
          <Route path="admin/dashboard"               element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="admin/doctors"                 element={<PrivateRoute roles={['admin']}><AdminDoctors /></PrivateRoute>} />
          <Route path="admin/doctors/:id"             element={<PrivateRoute roles={['admin']}><AdminDoctorEdit /></PrivateRoute>} />
        </Route>

        {/* Auth routes — no Layout */}
        <Route path="/register" element={<SignupPage />} />
        <Route path="/login"    element={<LoginPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <CustomCursor />
          <Router>
            <Suspense fallback={<PageLoader />}>
              <AnimatedRoutes />
            </Suspense>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
