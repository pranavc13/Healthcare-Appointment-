import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function SpecialtyCard({ icon, name, to, onClick }) {
  const content = (
    <>
      <div className="w-16 h-16 bg-white dark:bg-brand-800 rounded-2xl flex items-center justify-center mb-3 overflow-hidden shadow-sm">
        <img src={icon} alt={name} className="w-10 h-10 object-contain" />
      </div>
      <span className="text-sand-700 dark:text-sand-200 text-xs text-center font-semibold leading-snug">{name}</span>
    </>
  );

  const cls =
    'flex flex-col items-center justify-center bg-white dark:bg-brand-900 border border-sand-100 dark:border-brand-800 rounded-2xl p-5 hover:shadow-lg hover:border-brand-200 dark:hover:border-brand-800 transition-all cursor-pointer';

  if (to) {
    return (
      <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.96 }}>
        <Link to={to} className={cls}>{content}</Link>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.96 }}>
      <div onClick={onClick} className={cls}>{content}</div>
    </motion.div>
  );
}
