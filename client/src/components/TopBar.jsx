import { useEffect, useState } from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import Avatar from './ui/Avatar';
import useAuth from '../hooks/useAuth';

function useDarkMode() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  return [dark, () => setDark((v) => !v)];
}

export default function TopBar({ title, onOpenMobile }) {
  const { user } = useAuth();
  const [dark, toggleDark] = useDarkMode();

  return (
    <header className="sticky top-0 z-20 h-16 px-4 sm:px-6 flex items-center justify-between glass border-b border-border dark:border-brand-200/10">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobile}
          className="lg:hidden p-2 -ml-2 rounded-xl text-text-secondary dark:text-brand-200 hover:bg-cream-200 dark:hover:bg-brand-800 transition-colors shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-display text-[19px] font-semibold text-text-primary dark:text-cream-100 truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={toggleDark}
          className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary dark:text-brand-200 hover:bg-cream-200 dark:hover:bg-brand-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun className="w-[18px] h-[18px] text-gold-400" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>
        <NotificationCenter />
        <Avatar name={user?.name} size="sm" />
      </div>
    </header>
  );
}
