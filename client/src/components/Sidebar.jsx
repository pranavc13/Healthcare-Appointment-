import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';
import Avatar from './ui/Avatar';
import useAuth from '../hooks/useAuth';

const ROLE_LABEL = { patient: 'Patient', doctor: 'Doctor', admin: 'Admin' };

function NavItems({ items, onNavigate }) {
  return (
    <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto">
      {items.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center px-3 py-2 mx-3 rounded-lg text-sm transition-colors ${
              isActive ? 'bg-sidebar-active text-white font-medium' : 'text-sidebar-text hover:text-white hover:bg-sidebar-active'
            }`
          }
        >
          <Icon className="w-[18px] h-[18px] mr-3 shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarBody({ items, onNavigate }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="px-6 py-5 border-b border-brand-900 flex items-center gap-2.5">
        <img src="/logo.png" alt="DocConnect" className="w-7 h-7 object-contain" />
        <span className="text-white font-bold text-[15px] tracking-tight">DocConnect</span>
      </div>

      <NavItems items={items} onNavigate={onNavigate} />

      <div className="border-t border-brand-900 p-3">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <Avatar name={user?.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-sidebar-text">{ROLE_LABEL[user?.role] || user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2 mt-1 rounded-lg text-sm text-sidebar-text hover:text-white hover:bg-sidebar-active transition-colors"
        >
          <LogOut className="w-[18px] h-[18px] mr-3 shrink-0" />
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
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
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
