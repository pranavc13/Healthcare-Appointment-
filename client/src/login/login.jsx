import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { InputField } from '../signup/InputField';
import useAuth from '../hooks/useAuth';
import { apiErrorMessage } from '../services/api';

const ROLE_HOME = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard' };

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
    <div className="min-h-screen flex text-left">
      {/* Left Side — Form */}
      <div className="w-full lg:w-1/2 px-5 py-8 sm:p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">

          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="Jeevan Chakra" className="w-10 h-10 object-contain" />
            <div>
              <p className="font-black text-lg bg-gradient-to-r from-green-600 via-blue-600 to-orange-500 bg-clip-text text-transparent leading-none">Jeevan Chakra</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Healthcare Platform</p>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Log in to your account</h1>
          <p className="text-gray-500 mb-8 text-sm">Patients, doctors and admins all sign in here.</p>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <InputField
              label="Email Address"
              type="email"
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
              placeholder="••••••••"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={submitting}
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
            >
              {submitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {submitting ? 'Signing in...' : 'Log In'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side — Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex-col items-center justify-center">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mb-8 flex items-center justify-center">
          <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Welcome to Jeevan Chakra</h2>
        <p className="text-gray-600 text-center max-w-md leading-relaxed">
          "Your health, your control — Jeevan Chakra simplifies care, secures your records, and connects you to better healthcare anytime, anywhere."
        </p>
      </div>
    </div>
  );
}
