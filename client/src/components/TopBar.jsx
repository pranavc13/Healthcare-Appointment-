import { Menu } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import Avatar from './ui/Avatar';
import useAuth from '../hooks/useAuth';

export default function TopBar({ title, onOpenMobile }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 h-16 px-4 sm:px-6 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-slate-800">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 -ml-2 rounded-lg text-text-secondary dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-text-primary dark:text-white truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <NotificationCenter />
        <Avatar name={user?.name} size="sm" />
      </div>
    </header>
  );
}
