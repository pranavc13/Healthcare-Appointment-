import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, AlertCircle, HeartPulse } from 'lucide-react';
import { InputField } from '../signup/InputField';
import useAuth from '../hooks/useAuth';
import { apiErrorMessage } from '../services/api';

const ROLE_HOME = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard' };
const EASE = [0.22, 1, 0.36, 1];

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(formData.email, formData.password);
      navigate(ROLE_HOME[user.role] || '/');
    } catch (err) {
      setError(apiErrorMessage(err, 'Login failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex text-left bg-white dark:bg-brand-950">
      {/* Left Side — Form */}
      <div className="relative w-full lg:w-1/2 px-5 py-8 sm:p-8 flex flex-col justify-center overflow-hidden">
        {/* Ambient gradient orbs, matching the rest of the app */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.2, 0.12] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-gold-300/20 dark:bg-brand-600/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-0 -right-24 w-[360px] h-[360px] bg-gold-300/15 dark:bg-brand-600/8 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-md mx-auto w-full">

          {/* Mobile brand header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="lg:hidden flex items-center gap-3 mb-8"
          >
            <img src="/logo.png" alt="DocConnect" className="w-10 h-10 object-contain" />
            <div>
              <p className="font-black text-lg bg-gradient-to-r from-green-600 via-brand-700 to-orange-500 bg-clip-text text-transparent leading-none">DocConnect</p>
              <p className="text-[10px] text-sand-400 dark:text-brand-600 uppercase tracking-widest">Healthcare Platform</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}>
            <h1 className="text-2xl sm:text-3xl font-black text-sand-900 dark:text-white mb-2">Log in to your account</h1>
            <p className="text-sand-500 dark:text-sand-400 mb-8 text-sm">Patients, doctors and admins all sign in here.</p>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-sm rounded-xl px-4 py-3 overflow-hidden"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: EASE }}
            onSubmit={handleSubmit}
          >
            <InputField
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="abc@example.com"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={submitting}
            />

            <InputField
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={submitting}
            />

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-brand-700 to-brand-700 hover:from-brand-800 hover:to-brand-800 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4 shadow-lg shadow-brand-200/50 dark:shadow-none"
            >
              {submitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {submitting ? 'Signing in...' : 'Log In'}
            </motion.button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="text-center text-sand-600 dark:text-sand-400 mt-4 text-sm"
          >
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-700 dark:text-gold-300 font-semibold hover:underline">
              Sign up
            </Link>
          </motion.p>
        </div>
      </div>

      {/* Right Side — Branding */}
      <div className="hidden lg:flex relative w-1/2 bg-gradient-to-br from-brand-50 via-brand-50 to-white dark:from-brand-950 dark:via-brand-900/60 dark:to-brand-950 p-8 flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <motion.div
            animate={{ scale: [1, 1.18, 1], opacity: [0.14, 0.22, 0.14] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-24 right-1/4 w-[420px] h-[420px] bg-gold-300/20 dark:bg-brand-600/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.18, 0.1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            className="absolute -bottom-16 left-1/4 w-[360px] h-[360px] bg-gold-300/15 dark:bg-brand-600/8 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          initial={{ scale: 0.85, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.1 }}
          className="relative w-32 h-32 bg-gradient-to-br from-gold-300 to-brand-600 rounded-full mb-8 flex items-center justify-center shadow-xl shadow-brand-200/50 dark:shadow-none"
        >
          <HeartPulse className="w-16 h-16 text-white" strokeWidth={1.5} />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="relative text-3xl font-black mb-4 text-sand-800 dark:text-white"
        >
          Welcome to DocConnect
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="relative text-sand-600 dark:text-sand-400 text-center max-w-md leading-relaxed"
        >
          "Your health, your control — DocConnect simplifies care, secures your records, and connects you to better healthcare anytime, anywhere."
        </motion.p>
      </div>
    </div>
  );
}
