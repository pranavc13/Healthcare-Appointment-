import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowRight, Loader2, Lock, Mail } from 'lucide-react';
import { InputField } from '../signup/InputField';
import AuthShell from '../components/AuthShell';
import useAuth from '../hooks/useAuth';
import { apiErrorMessage } from '../services/api';

const ROLE_HOME = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard' };

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      // Honour a redirect handed over by a protected page (e.g. "book this doctor").
      navigate(location.state?.from || ROLE_HOME[user.role] || '/');
    } catch (err) {
      setError(apiErrorMessage(err, 'Login failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in to your account"
      subtitle="Patients, doctors and clinic admins all sign in here."
      quote="Your doctor reads the brief before you speak."
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-700 dark:text-gold-300 hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-start gap-2.5 bg-danger-bg dark:bg-red-900/20 border border-danger/25 dark:border-red-900/40 text-danger dark:text-red-300 text-[13px] rounded-xl px-4 py-3 overflow-hidden"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit}>
        <InputField
          label="Email address"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          name="email"
          autoComplete="email"
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
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={submitting}
        />

        <motion.button
          whileHover={{ scale: submitting ? 1 : 1.015 }}
          whileTap={{ scale: 0.985 }}
          type="submit"
          disabled={submitting}
          className="shine group mt-2 w-full h-[52px] rounded-full bg-brand-700 hover:bg-brand-800 text-cream-100 text-[14.5px] font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
            </>
          ) : (
            <>
              Log in
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </motion.button>
      </form>
    </AuthShell>
  );
}
