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
const BookMedicine    = lazy(() => import('./book-medicine/BookMedicine.jsx'));
const MedicalRecords  = lazy(() => import('./medical-records/MedicalRecords.jsx'));

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
      <div className="text-center">
        <p className="text-8xl font-black text-gray-100 dark:text-slate-800 mb-4 select-none">404</p>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Page not found</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          ← Back to Home
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
          <Route path="about"         element={<About />} />
          <Route path="ai-assistant"  element={<AIAssistant />} />
          <Route path="faq"           element={<FAQ />} />
          <Route path="game"          element={<HealthGame />} />
          <Route path="bmi-tracker"   element={<BMITracker />} />
          <Route path="book-medicine" element={<BookMedicine />} />
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
