import { useState, useContext, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, CalendarCheck, ChevronDown, Gamepad2, HandHeart, HelpCircle,
  LogOut, Menu, Moon, Scale, Stethoscope, Sun, X,
} from 'lucide-react';
import { AuthContext } from '../AuthContext';
import NotificationCenter from './NotificationCenter';

const TOOLS = [
  { to: '/ai-assistant', label: 'Symptom Checker', icon: Activity },
  { to: '/bmi-tracker', label: 'BMI Tracker', icon: Scale },
  { to: '/game', label: 'Health Games', icon: Gamepad2 },
  { to: '/help', label: 'NGO Partners', icon: HandHeart },
  { to: '/faq', label: 'FAQ', icon: HelpCircle },
];

const ROLE_HOME = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard' };

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  return [dark, () => setDark((v) => !v)];
}

const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.14 } },
};

export function Navbar() {
  const { currentUser, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dark, toggleDark] = useDarkMode();
  const toolsRef = useRef(null);

  const initial = currentUser?.name?.charAt(0).toUpperCase() ?? '?';
  const homePath = ROLE_HOME[role] || '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    setAvatarOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const h = () => setAvatarOpen(false);
    if (avatarOpen) document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, [avatarOpen]);

  useEffect(() => {
    const h = (e) => { if (toolsRef.current && !toolsRef.current.contains(e.target)) setToolsOpen(false); };
    if (toolsOpen) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [toolsOpen]);

  const primaryLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/about', label: 'About' },
    { to: '/doctors', label: 'Find Doctors' },
    ...(role === 'patient' ? [{ to: '/patient/appointments', label: 'Appointments' }] : []),
    ...(role === 'doctor' ? [{ to: '/doctor/dashboard', label: 'Dashboard' }] : []),
    ...(role === 'admin' ? [{ to: '/admin/doctors', label: 'Manage Doctors' }] : []),
    { to: '/emergency', label: 'Emergency' },
  ];

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed w-full top-0 left-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass border-b border-border/70 dark:border-brand-200/10 shadow-soft'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className={`flex items-center justify-between transition-all duration-500 ${scrolled ? 'h-[68px]' : 'h-[84px]'}`}>
          {/* ── Brand ── */}
          <Link to={currentUser ? homePath : '/'} className="flex items-center gap-2.5 shrink-0 group">
            <motion.img
              src="/logo.png"
              alt=""
              whileHover={{ scale: 1.08, rotate: -4 }}
              transition={{ type: 'spring', stiffness: 320, damping: 16 }}
              className="w-10 h-10 object-contain"
            />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[20px] font-semibold tracking-tight text-brand-900 dark:text-cream-100">
                Jeevan Chakra
              </span>
              <span className="text-[9px] font-bold tracking-[0.24em] text-gold-600 dark:text-gold-400 uppercase mt-0.5">
                Health · Care · Follow-up
              </span>
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden lg:flex items-center gap-7">
            {primaryLinks.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end}>
                {({ isActive }) => (
                  <span
                    data-active={isActive}
                    className={`link-underline text-[13px] font-semibold uppercase tracking-[0.09em] transition-colors ${
                      isActive
                        ? 'text-gold-600 dark:text-gold-300'
                        : 'text-brand-900/75 dark:text-cream-100/75 hover:text-brand-900 dark:hover:text-cream-100'
                    }`}
                  >
                    {label}
                  </span>
                )}
              </NavLink>
            ))}

            <div className="relative" ref={toolsRef}>
              <button
                onClick={() => setToolsOpen((v) => !v)}
                className={`flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.09em] transition-colors ${
                  toolsOpen ? 'text-gold-600 dark:text-gold-300' : 'text-brand-900/75 dark:text-cream-100/75 hover:text-brand-900 dark:hover:text-cream-100'
                }`}
              >
                Tools
                <motion.span animate={{ rotate: toolsOpen ? 180 : 0 }} transition={{ duration: 0.22 }}>
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.span>
              </button>

              <AnimatePresence>
                {toolsOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-60 rounded-2xl surface-card p-2 z-50"
                  >
                    {TOOLS.map((t, i) => (
                      <motion.div
                        key={t.to}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.045 }}
                      >
                        <Link
                          to={t.to}
                          onClick={() => setToolsOpen(false)}
                          className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-text-secondary dark:text-brand-200 hover:bg-cream-100 dark:hover:bg-brand-800 hover:text-brand-900 dark:hover:text-cream-100 transition-colors"
                        >
                          <t.icon className="w-4 h-4 text-brand-600 dark:text-gold-400 transition-transform duration-300 group-hover:scale-110" />
                          {t.label}
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Right side ── */}
          <div className="hidden lg:flex items-center gap-2.5">
            <button
              onClick={toggleDark}
              className="w-10 h-10 rounded-full flex items-center justify-center text-brand-900/70 dark:text-cream-100/70 hover:bg-cream-200/70 dark:hover:bg-brand-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              <AnimatePresence mode="wait" initial={false}>
                {dark ? (
                  <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Sun className="w-[18px] h-[18px] text-gold-400" />
                  </motion.span>
                ) : (
                  <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Moon className="w-[18px] h-[18px]" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {currentUser ? (
              <>
                <NotificationCenter />
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <motion.button
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setAvatarOpen((v) => !v)}
                    className="w-10 h-10 rounded-full bg-brand-700 text-cream-100 font-bold text-sm flex items-center justify-center ring-2 ring-gold-400/60 ring-offset-2 ring-offset-cream-100 dark:ring-offset-brand-950"
                  >
                    {initial}
                  </motion.button>

                  <AnimatePresence>
                    {avatarOpen && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 mt-3 w-60 rounded-2xl surface-card overflow-hidden z-50"
                      >
                        <div className="px-4 py-3.5 bg-cream-100 dark:bg-brand-900 border-b border-border dark:border-brand-200/10">
                          <p className="text-[13.5px] font-semibold text-brand-900 dark:text-cream-100 truncate">
                            {currentUser.name || currentUser.email}
                          </p>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400 mt-1">
                            {role ?? 'User'}
                          </p>
                        </div>
                        <div className="p-2">
                          <Link to={homePath} onClick={() => setAvatarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-text-secondary dark:text-brand-200 hover:bg-cream-100 dark:hover:bg-brand-800 transition-colors">
                            <Stethoscope className="w-4 h-4 text-brand-600 dark:text-gold-400" /> My Dashboard
                          </Link>
                          {TOOLS.slice(0, 3).map((t) => (
                            <Link key={t.to} to={t.to} onClick={() => setAvatarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-text-secondary dark:text-brand-200 hover:bg-cream-100 dark:hover:bg-brand-800 transition-colors">
                              <t.icon className="w-4 h-4 text-brand-600 dark:text-gold-400" /> {t.label}
                            </Link>
                          ))}
                          <div className="mt-1 pt-1 border-t border-border dark:border-brand-200/10">
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-danger hover:bg-danger-bg dark:hover:bg-red-900/20 transition-colors">
                              <LogOut className="w-4 h-4" /> Sign out
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 h-10 inline-flex items-center text-[13px] font-semibold uppercase tracking-[0.09em] text-brand-900/75 dark:text-cream-100/75 hover:text-brand-900 dark:hover:text-cream-100 transition-colors"
                >
                  Log in
                </Link>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/doctors"
                    className="shine inline-flex items-center gap-2 h-11 px-5 rounded-full bg-brand-700 hover:bg-brand-800 text-cream-100 text-[13px] font-bold uppercase tracking-[0.07em] transition-colors shadow-soft"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    Book Appointment
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* ── Mobile controls ── */}
          <div className="lg:hidden flex items-center gap-1">
            <button onClick={toggleDark} className="w-10 h-10 rounded-full flex items-center justify-center text-brand-900/70 dark:text-cream-100/70" aria-label="Toggle dark mode">
              {dark ? <Sun className="w-[18px] h-[18px] text-gold-400" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>
            {currentUser && <NotificationCenter />}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-brand-900 dark:text-cream-100"
              aria-label="Open menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.16 }}>
                    <X className="w-6 h-6" />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.16 }}>
                    <Menu className="w-6 h-6" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile sheet ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden bg-cream-50 dark:bg-brand-950 border-t border-border dark:border-brand-200/10"
          >
            <div className="px-5 py-5 max-h-[calc(100vh-84px)] overflow-y-auto">
              {[...primaryLinks, ...TOOLS.map((t) => ({ to: t.to, label: t.label }))].map(({ to, label, end }, i) => (
                <motion.div
                  key={to}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.035 }}
                >
                  <NavLink
                    to={to}
                    end={end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center py-3 border-b border-border/60 dark:border-brand-200/10 font-display text-[19px] font-semibold transition-colors ${
                        isActive ? 'text-gold-600 dark:text-gold-300' : 'text-brand-900 dark:text-cream-100'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </motion.div>
              ))}

              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="mt-5 w-full h-12 rounded-full border border-danger/30 text-danger text-sm font-bold uppercase tracking-wider"
                >
                  Sign out
                </button>
              ) : (
                <div className="mt-6 flex flex-col gap-3">
                  <Link
                    to="/doctors"
                    onClick={() => setMobileOpen(false)}
                    className="h-12 rounded-full bg-brand-700 text-cream-100 text-[13px] font-bold uppercase tracking-[0.07em] flex items-center justify-center gap-2"
                  >
                    <CalendarCheck className="w-4 h-4" /> Book Appointment
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="h-12 rounded-full border border-brand-700/25 dark:border-brand-200/25 text-brand-900 dark:text-cream-100 text-[13px] font-bold uppercase tracking-[0.07em] flex items-center justify-center"
                  >
                    Log in
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
