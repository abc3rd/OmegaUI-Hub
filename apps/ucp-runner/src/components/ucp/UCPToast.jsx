import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell } from 'lucide-react';

const UCPToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((title, body) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, body }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Expose addToast globally for the notify driver
  useEffect(() => {
    window.__ucpShowToast = addToast;
    return () => {
      delete window.__ucpShowToast;
    };
  }, [addToast]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Bell className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white text-sm">{toast.title}</h4>
                <p className="text-slate-400 text-sm mt-0.5">{toast.body}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default UCPToast;