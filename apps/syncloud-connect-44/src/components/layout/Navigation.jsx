import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Cloud, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPageUrl } from '@/utils';

const navItems = [
  { label: 'SynCloud Connect', href: createPageUrl('Home') },
  { label: 'GLYTCH', href: createPageUrl('Glytch') },
  { label: 'LegendDB', href: createPageUrl('LegendDB') },
  { label: 'Cloud QR', href: createPageUrl('CloudQR') },
  { label: 'UCP', href: createPageUrl('UCP') },
  { label: 'Omega UI', href: createPageUrl('OmegaUI') },
  { label: 'Tools', href: createPageUrl('QRTools'), dropdown: [
    { label: 'QR Dashboard', href: createPageUrl('QRDashboard') },
    { label: 'Create QR Code', href: createPageUrl('QRNew') },
    { label: 'Bulk Management', href: createPageUrl('QRTools') }
  ] }
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-white/20" 
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link 
            to={createPageUrl('Home')} 
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center shadow-lg shadow-[#ea00ea]/20 group-hover:shadow-[#ea00ea]/40 transition-shadow">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <span className="hidden sm:block text-lg font-bold bg-gradient-to-r from-[#ea00ea] to-[#2699fe] bg-clip-text text-transparent">
              SynCloud
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href === createPageUrl('Home') && location.pathname === '/');
              
              if (item.dropdown) {
                return (
                  <div 
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1",
                        isActive 
                          ? "bg-gradient-to-r from-[#ea00ea]/10 to-[#2699fe]/10 text-[#ea00ea]" 
                          : "text-gray-600 hover:text-[#ea00ea] hover:bg-gray-100"
                      )}
                    >
                      {item.label}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {openDropdown === item.label && (
                      <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[200px]">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.href}
                            to={subItem.href}
                            className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#ea00ea] transition-colors"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-gradient-to-r from-[#ea00ea]/10 to-[#2699fe]/10 text-[#ea00ea]" 
                      : "text-gray-600 hover:text-[#ea00ea] hover:bg-gray-100"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-gray-100"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  
                  if (item.dropdown) {
                    return (
                      <div key={item.href}>
                        <div className="px-4 py-2 text-sm font-semibold text-gray-400 uppercase">
                          {item.label}
                        </div>
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.href}
                            to={subItem.href}
                            className="px-6 py-3 rounded-xl text-base text-gray-600 hover:bg-gray-100 block"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    );
                  }
                  
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "px-4 py-3 rounded-xl text-base font-medium transition-all",
                        isActive 
                          ? "bg-gradient-to-r from-[#ea00ea]/10 to-[#2699fe]/10 text-[#ea00ea]" 
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}