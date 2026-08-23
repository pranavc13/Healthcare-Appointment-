import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, description, children, footer, maxWidth = 'max-w-md' }) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className={`bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full ${maxWidth} mx-4 p-6 max-h-[90vh] overflow-y-auto sm:rounded-2xl max-sm:rounded-none max-sm:h-full max-sm:max-h-full max-sm:mx-0`}
          >
            <div className="flex items-start justify-between mb-1">
              <div>
                {title && <h2 className="text-lg font-semibold text-text-primary dark:text-white">{title}</h2>}
                {description && <p className="text-sm text-text-secondary dark:text-slate-400 mt-1">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 -m-1.5 rounded-lg text-text-muted hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4">{children}</div>

            {footer && <div className="mt-6 flex items-center justify-end gap-3">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
