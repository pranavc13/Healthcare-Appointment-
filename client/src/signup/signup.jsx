import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { InputField } from './InputField';
import useAuth from '../hooks/useAuth';
import { apiErrorMessage } from '../services/api';

// Public self-registration is patient-only — doctor and admin accounts are created
// by an admin (see /admin/doctors) and the seed script, respectively.
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
    <div className="min-h-screen flex text-left">
      {/* Left Side — Form */}
      <div className="w-full lg:w-1/2 px-5 py-8 sm:p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">

          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <img src="/logo.png" alt="Jeevan Chakra" className="w-10 h-10 object-contain" />
            <div>
              <p className="font-black text-lg bg-gradient-to-r from-green-600 via-blue-600 to-orange-500 bg-clip-text text-transparent leading-none">Jeevan Chakra</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Healthcare Platform</p>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Create a free account</h1>
          <p className="text-gray-500 mb-6 text-sm">
            Sign up as a patient to book appointments. Are you a doctor?{' '}
            <span className="text-gray-600">Ask your clinic admin to add you.</span>
          </p>

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
              label="First Name"
              placeholder="Alexa"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              disabled={submitting}
            />

            <InputField
              label="Last Name"
              placeholder="Mathew"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              disabled={submitting}
            />

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
              label="Phone Number"
              type="tel"
              placeholder="+91 98765 43210"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={submitting}
            />

            <InputField
              label="Password"
              type="password"
              placeholder="Min. 6 characters"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              disabled={submitting}
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
            >
              {submitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {submitting ? 'Creating account...' : 'Sign up as Patient'}
            </button>
          </form>

          <p className="text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side — Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-50 to-blue-100 p-8 flex-col items-center justify-center">
        <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mb-8 flex items-center justify-center">
          <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
