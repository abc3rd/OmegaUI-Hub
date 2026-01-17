import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Sparkles, Rocket, BookOpen, Zap, ArrowRight } from 'lucide-react';

export default function WelcomeModal({ isOpen, onStartTour, onSkip, userName }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg overflow-hidden"
          >
            {/* Background card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-slate-700/50">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

              {/* Content */}
              <div className="relative z-10 p-8">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30"
                >
                  <Rocket className="w-10 h-10 text-white" />
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-center text-white mb-3"
                >
                  Welcome to Omega{userName ? `, ${userName.split(' ')[0]}` : ''}! 🎉
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center text-slate-400 mb-8"
                >
                  Your central hub for all SynCloud applications. Let us show you around!
                </motion.p>

                {/* Features preview */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-3 gap-4 mb-8"
                >
                  <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <Sparkles className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">App Hub</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <BookOpen className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Help Center</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <Zap className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Analytics</p>
                  </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-3"
                >
                  <Button
                    onClick={onStartTour}
                    className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl shadow-lg shadow-blue-500/25 group"
                  >
                    Take the Tour
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  
                  <Button
                    onClick={onSkip}
                    variant="ghost"
                    className="w-full text-slate-400 hover:text-white"
                  >
                    Skip for now, I'll explore myself
                  </Button>
                </motion.div>

                {/* Tip */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center text-xs text-slate-500 mt-6"
                >
                  💡 Tip: You can restart the tour anytime from your profile menu
                </motion.p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}