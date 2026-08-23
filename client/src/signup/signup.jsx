import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowRight, Loader2, Lock, Mail, Phone, User } from 'lucide-react';
import { InputField } from './InputField';
import AuthShell from '../components/AuthShell';
import useAuth from '../hooks/useAuth';
import { apiErrorMessage } from '../services/api';

// Public self-registration is patient-only — doctor accounts are created by an
// admin (see /admin/doctors) and the admin account by the seed script.
export default function SignupPage() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
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
      const name = `${formData.firstName} ${formData.lastName}`.trim();
      await register({ name, email: formData.email, password: formData.password, phone: formData.phone });
      navigate('/patient/dashboard');
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not create your account. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Join Jeevan Chakra"
      title="Create your free account"
      subtitle="Book appointments, share symptoms ahead of the visit, and keep every summary in one place."
      quote="Search 17,000 specialists. Hold a real slot in seconds."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-700 dark:text-gold-300 hover:underline">
            Log in
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
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="First name"
            icon={User}
            placeholder="Ananya"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            disabled={submitting}
          />
          <InputField
            label="Last name"
            icon={User}
            placeholder="Rao"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            disabled={submitting}
          />
        </div>

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
          label="Phone number"
          type="tel"
          icon={Phone}
          placeholder="+91 98765 43210"
          name="phone"
          autoComplete="tel"
          value={formData.phone}
          onChange={handleChange}
          disabled={submitting}
        />

        <InputField
          label="Password"
          type="password"
          icon={Lock}
          placeholder="Minimum 6 characters"
          name="password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
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
              <Loader2 className="w-4 h-4 animate-spin" /> Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </motion.button>

        <p className="mt-4 text-center text-[11.5px] leading-relaxed text-text-muted">
          Are you a doctor? Ask your clinic admin to create your account.
        </p>
      </form>
    </AuthShell>
  );
}
