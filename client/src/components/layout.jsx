import { useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import BottomNav from './BottomNav';
import ChatWidget from './ChatWidget';
import SiteFooter from './SiteFooter';
import { AuthContext } from '../AuthContext';

const Layout = () => {
  const { currentUser } = useContext(AuthContext);
  const { pathname } = useLocation();

  // The landing hero sits *under* the transparent navbar and supplies its own
  // top spacing; every other page needs to clear the fixed bar.
  const heroPage = pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 dark:bg-brand-950">
      <Navbar />
      <main className={`flex-1 ${heroPage ? '' : 'pt-[84px]'}`}>
        <Outlet />
      </main>
      <SiteFooter />
      {currentUser && <BottomNav />}
      <ChatWidget />
    </div>
  );
};

export default Layout;
