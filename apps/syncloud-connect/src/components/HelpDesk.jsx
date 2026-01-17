import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  HelpCircle, 
  X, 
  MessageCircle, 
  Book, 
  Mail, 
  ChevronRight,
  Search,
  ExternalLink
} from 'lucide-react';

const faqItems = [
  { q: "How do I access my applications?", a: "Sign in with your account and click on any app card to launch it." },
  { q: "Is my data secure?", a: "Yes, all data is encrypted and securely shared only between SynCloud applications." },
  { q: "How do I add new applications?", a: "Contact your administrator to add new applications to your dashboard." },
  { q: "Can I customize my dashboard?", a: "Theme settings are available via the sun/moon icon in the navigation." },
];

export default function HelpDesk() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaq = faqItems.filter(
    item => item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30 flex items-center justify-center hover:shadow-blue-500/50 transition-shadow"
      >
        <HelpCircle className="w-6 h-6 text-white" />
      </motion.button>

      {/* Help panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Help Center</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search for help..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setActiveTab('faq')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'faq' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Book className="w-4 h-4 inline mr-2" />
                  FAQ
                </button>
                <button
                  onClick={() => setActiveTab('contact')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'contact' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 inline mr-2" />
                  Contact
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'faq' && (
                  <div className="space-y-3">
                    {filteredFaq.map((item, index) => (
                      <details
                        key={index}
                        className="group bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden"
                      >
                        <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                          <span className="font-medium text-slate-900 dark:text-white text-sm">
                            {item.q}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                        </summary>
                        <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400">
                          {item.a}
                        </div>
                      </details>
                    ))}
                  </div>
                )}

                {activeTab === 'contact' && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Need more help? Send us a message and we'll get back to you shortly.
                    </p>
                    <Input placeholder="Your email" type="email" />
                    <Input placeholder="Subject" />
                    <Textarea placeholder="How can we help?" rows={4} />
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <a
                  href="#"
                  className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Documentation
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}