import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, LogOut } from 'lucide-react';
import Avatar from './ui/Avatar';
import useAuth from '../hooks/useAuth';

const ROLE_LABEL = { patient: 'Patient', doctor: 'Doctor', admin: 'Administrator' };

function NavItems({ items, onNavigate }) {
  return (
    <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
      {items.map(({ to, icon: Icon, label, end }) => (
        <NavLink key={to} to={to} end={end} onClick={onNavigate} className="block px-3">
          {({ isActive }) => (
            <span
              className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors ${
                isActive ? 'text-cream-50' : 'text-sidebar-text hover:text-cream-50 hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-brand-700"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <Icon className="relative w-[18px] h-[18px] shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="relative">{label}</span>
              {isActive && <span className="relative ml-auto w-1.5 h-1.5 rounded-full bg-gold-400" />}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarBody({ items, onNavigate }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full bg-sidebar">
      <Link to="/" className="px-5 py-5 border-b border-white/10 flex items-center gap-2.5">
        <img src="/logo.png" alt="" className="w-8 h-8 rounded-full bg-white object-cover ring-1 ring-white/20" />
        <span className="flex flex-col leading-none">
          <span className="font-display text-[17px] font-semibold text-cream-50 tracking-tight">DocConnect</span>
          <span className="text-[8.5px] font-bold tracking-[0.22em] text-gold-400 uppercase mt-1">
            {ROLE_LABEL[user?.role] || 'Portal'}
          </span>
        </span>
      </Link>

      <NavItems items={items} onNavigate={onNavigate} />

      <div className="border-t border-white/10 p-3 space-y-1">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-sidebar-text hover:text-cream-50 hover:bg-white/5 transition-colors"
        >
          <Home className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
          Back to site
        </Link>

        <div className="flex items-center gap-3 px-3.5 py-2.5">
          <Avatar name={user?.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-cream-50 truncate">{user?.name}</p>
            <p className="text-[11px] text-sidebar-text truncate">{user?.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-sidebar-text hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
          Log out
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ items, mobileOpen, onCloseMobile }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 z-30">
        <SidebarBody items={items} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-brand-950/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 top-0 h-screen w-64 z-50 lg:hidden"
            >
              <SidebarBody items={items} onNavigate={onCloseMobile} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
