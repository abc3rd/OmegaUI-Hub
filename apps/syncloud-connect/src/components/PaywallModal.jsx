import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { X, Sparkles, Shield, Zap, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PaywallModal({ isOpen, onClose, appName }) {
  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-700/50 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>

            {/* Decorative gradient orb */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Logo/Icon */}
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25">
                <Sparkles className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-3">
                Thank You for Visiting{' '}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Omega!
                </span>
              </h2>

              <p className="text-slate-400 mb-8 text-lg">
                {appName ? `Unlock access to ${appName} and all our powerful solutions.` : 
                'Ready to explore our powerful solutions?'}
              </p>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <Shield className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Secure Access</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <Zap className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Instant Setup</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <Sparkles className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Full Features</p>
                </div>
              </div>

              {/* CTA */}
              <Button
                onClick={handleLogin}
                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 group"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <p className="text-slate-500 text-sm mt-4">
                Already have an account?{' '}
                <button onClick={handleLogin} className="text-blue-400 hover:text-blue-300 font-medium">
                  Sign in
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}