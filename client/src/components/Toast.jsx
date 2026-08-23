import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: <CheckCircle className="w-5 h-5 text-success" />,
  error: <XCircle className="w-5 h-5 text-danger" />,
  warning: <AlertCircle className="w-5 h-5 text-warning" />,
  info: <Info className="w-5 h-5 text-primary" />,
};

const BAR_COLOR = {
  success: 'bg-success',
  error: 'bg-danger',
  warning: 'bg-warning',
  info: 'bg-primary',
};

function ToastItem({ toast, onClose }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="relative flex items-start gap-3 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl shadow-lg p-4 max-w-sm w-full overflow-hidden pl-4"
    >
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${BAR_COLOR[toast.type]}`} />
      <span className="mt-0.5 shrink-0">{ICONS[toast.type]}</span>
      <div className="flex-1 min-w-0">
        {toast.title && <p className="text-sm font-semibold text-text-primary dark:text-white">{toast.title}</p>}
        {toast.message && <p className="text-sm text-text-secondary dark:text-slate-300 mt-0.5">{toast.message}</p>}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="shrink-0 p-0.5 rounded-lg text-text-muted hover:text-text-secondary dark:hover:text-slate-200 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      <motion.span
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: toast.duration / 1000, ease: 'linear' }}
        className={`absolute bottom-0 left-0 right-0 h-0.5 origin-left ${BAR_COLOR[toast.type]} opacity-40`}
      />
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (type, titleOrOpts, message) => {
      const id = `${Date.now()}-${Math.random()}`;
      const opts = typeof titleOrOpts === 'string' ? { title: titleOrOpts, message } : titleOrOpts;
      const duration = opts.duration ?? (type === 'error' ? 6000 : 5000);

      setToasts((prev) => [...prev.slice(-4), { id, type, duration, ...opts }]);
      setTimeout(() => remove(id), duration);
    },
    [remove]
  );

  const api = {
    success: (t, m) => toast('success', t, m),
    error: (t, m) => toast('error', t, m),
    warning: (t, m) => toast('warning', t, m),
    info: (t, m) => toast('info', t, m),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-6 right-4 z-[100] flex flex-col gap-2 items-end">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onClose={remove} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
