import React, { useState, useEffect } from 'react';
import { ChevronDown, Phone, Mail, Calendar, Star, Award, DollarSign, MapPin, Menu, X, Sun, Moon, User } from 'lucide-react';
import VictimIntakeChat from '../components/agents/VictimIntakeChat';
import { base44 } from '@/api/base44Client';

export default function UCrashLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Check if user is logged in
    const checkUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const user = await base44.auth.me();
          setCurrentUser(user);
        }
      } catch (e) {
        // Not logged in
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
      setMenuOpen(false);
    }
  };

  const handleQrClick = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (newCount === 1) {
      setQrModalOpen(true);
      setTimeout(() => setTapCount(0), 500);
    } else if (newCount === 2) {
      window.open('https://links.abcdashboard.com/widget/form/Kz0XoGSPFIzyav3t7aGM', '_blank');
      setTapCount(0);
      setQrModalOpen(false);
    }
  };

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const attorneys = [
    {
      name: "John D. Matthews, Esq.",
      firm: "Matthews Injury Law",
      specialty: "Commercial Truck & Auto Accidents",
      rating: 5,
      years: "20+",
      recovered: "$50M+",
      location: "Tampa, FL",
      image: "https://storage.googleapis.com/msgsndr/y4ABqxnk279eDc0f5DqY/media/6913e61c7757659586111f9e.png"
    },
    {
      name: "Sarah Chen, Esq.",
      firm: "Chen & Associates Trial Lawyers",
      specialty: "Motorcycle & Pedestrian Accidents",
      rating: 5,
      years: "15+",
      recovered: "$35M+",
      location: "Miami, FL",
      image: "https://storage.googleapis.com/msgsndr/y4ABqxnk279eDc0f5DqY/media/6913e61c02ab9b802613b593.png"
    },
    {
      name: "David Goldstein, Esq.",
      firm: "Goldstein Law Group",
      specialty: "Slip & Fall and Premises Liability",
      rating: 5,
      years: "25+",
      recovered: "$70M+",
      location: "Orlando, FL",
      image: "https://storage.googleapis.com/msgsndr/y4ABqxnk279eDc0f5DqY/media/6913e61c372f87a895b6c31a.png"
    }
  ];

  const faqs = [
    {
      question: "How does u-CRA$H work?",
      answer: "u-CRA$H is an attorney advertising directory. We are not a law firm. We provide a free platform for accident victims to browse profiles and connect with personal injury attorneys who advertise with us. You can submit your case details for a free review by one or more participating attorneys."
    },
    {
      question: "How much does it cost to use u-CRA$H?",
      answer: "Our directory is 100% FREE for you to use. The attorneys who advertise on our platform typically work on a contingency basis, meaning you don't pay them unless they win your case. You can discuss their fee structure with them directly during your free consultation."
    },
    {
      question: "Does U CRASH list lawyers in my state?",
      answer: "Yes! U CRASH is a nationwide directory. We have advertising attorneys from all 50 states. No matter where your accident occurred, you can use our platform to find local attorneys licensed and experienced in your specific state."
    },
    {
      question: "What information do I need to provide?",
      answer: "To get started, we'll ask for basic information about your accident: when and where it occurred, the type of accident, and your injuries. This information is securely passed to the advertising attorneys you select (or who participate in your area) so they can conduct your free case review."
    },
    {
      question: "How quickly will I hear back from an attorney?",
      answer: "After you submit your information, it is made available to participating attorneys. Response times vary by firm, but many are able to respond very quickly, often within minutes or hours. Our platform is available 24/7 for you to submit your information."
    }
  ];

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark' : ''}`}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          overflow-x: hidden;
        }

        /* Professional Card Styles */
        .glass {
          background: #FFFFFF;
          border: 1px solid #CECFD0;
          box-shadow: 0 2px 12px rgba(3, 1, 1, 0.08);
        }

        .glass-strong {
          background: #FFFFFF;
          border: 1px solid #CECFD0;
          box-shadow: 0 4px 16px rgba(3, 1, 1, 0.1);
        }

        .glass-card {
          background: #FFFFFF;
          border: 1px solid #CECFD0;
          box-shadow: 0 2px 12px rgba(3, 1, 1, 0.08);
          transition: all 0.3s ease;
        }

        .glass-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 24px rgba(3, 1, 1, 0.12);
          border-color: #71D6B5;
        }

        /* Professional Background */
        .gradient-bg {
          background: #F8F9FA;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Subtle Shadow Effects */
        .shadow-crimson {
          box-shadow: 0 2px 8px rgba(198, 28, 57, 0.15);
        }

        .shadow-blue {
          box-shadow: 0 2px 8px rgba(21, 94, 239, 0.15);
        }

        .shadow-teal {
          box-shadow: 0 2px 8px rgba(113, 214, 181, 0.15);
        }

        /* Smooth Fade In */
        .fade-in {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }

        /* Stagger animations */
        .fade-in:nth-child(1) { animation-delay: 0.1s; }
        .fade-in:nth-child(2) { animation-delay: 0.2s; }
        .fade-in:nth-child(3) { animation-delay: 0.3s; }
        .fade-in:nth-child(4) { animation-delay: 0.4s; }
        .fade-in:nth-child(5) { animation-delay: 0.5s; }
        .fade-in:nth-child(6) { animation-delay: 0.6s; }

        /* Scroll Animations */
        .scroll-fade {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .scroll-fade.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Button Styles */
        .btn-primary {
          background: #c61c39;
          color: white;
          border: none;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          background: #a01530;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(198, 28, 57, 0.2);
        }

        .btn-secondary {
          background: transparent;
          border: 2px solid #c61c39;
          color: #c61c39;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          background: #c61c39;
          color: white;
          transform: translateY(-2px);
        }

        /* Gavel Bullet Points */
        .gavel-bullet {
          list-style: none;
          padding-left: 0;
        }
        .gavel-bullet li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }
        .gavel-bullet li::before {
          content: '';
          width: 24px;
          height: 24px;
          background-image: url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691be92ffa93cfd887f03662/ec034b41f_Screenshot2025-11-21163422.png');
          background-size: contain;
          background-repeat: no-repeat;
          flex-shrink: 0;
          margin-top: 2px;
        }

        /* Omega UI Badge */
        .omega-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: #155EEF;
          color: white;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          vertical-align: middle;
        }
        .omega-badge img {
          width: 16px;
          height: 16px;
        }

        /* Mobile Menu */
        .mobile-menu {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
        }

        .dark .mobile-menu {
          background: rgba(30, 30, 30, 0.95);
        }

        /* Omega CTA Animation */
        .omega-cta {
          position: relative;
        }

        .omega-cta::after {
          content: "";
          position: absolute;
          inset: -4px -8px;
          border-radius: 9999px;
          border: 1px solid rgba(37, 99, 235, 0.3);
          animation: omegaPulse 2.5s ease-out infinite;
          pointer-events: none;
        }

        @keyframes omegaPulse {
          0% { opacity: 0; transform: scale(0.9); }
          40% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0; transform: scale(1.2); }
        }
      `}</style>

      {/* Professional Background */}
      <div className="fixed inset-0 -z-10 gradient-bg" />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: '#E2E8F0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo with MURPHY Link for Registered Users */}
            <div className="flex-shrink-0">
              {currentUser ? (
                <a href="https://ui.omegaui.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691be92ffa93cfd887f03662/8740d5677_background-ucrash-999kb.png" 
                    alt="UCRASH Logo - We Get You Cash" 
                    className="h-16 w-auto cursor-pointer group-hover:opacity-80 transition-opacity"
                  />
                  <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#c61c39] to-[#030101] text-white rounded-full text-xs font-bold animate-pulse">
                    <User className="w-3 h-3" />
                    <span>MURPHY AI →</span>
                  </div>
                </a>
              ) : (
                <button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="flex items-center gap-2 group">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691be92ffa93cfd887f03662/8740d5677_background-ucrash-999kb.png" 
                    alt="UCRASH Logo - We Get You Cash" 
                    className="h-16 w-auto cursor-pointer"
                  />
                  <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-gray-400 text-white rounded-full text-xs font-bold">
                    <User className="w-3 h-3" />
                    <span>Login for MURPHY</span>
                  </div>
                </button>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-3">
              {['attorneys', 'case-types', 'reviews', 'faq'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className="px-4 py-2 text-sm font-semibold capitalize text-[#030101] hover:text-[#c61c39] transition-colors rounded-lg hover:bg-white/50"
              >
                {item.replace('-', ' ')}
              </button>
              ))}

              <a
                href="https://links.abcdashboard.com/widget/form/Kz0XoGSPFIzyav3t7aGM"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-[#71D6B5] text-white rounded-full text-sm font-semibold hover:bg-[#5fc4a3] transition-all shadow-teal animate-pulse"
              >
                🚀 FREE Case Review
              </a>
              <a
                href="tel:+18886926211"
                className="px-5 py-2.5 bg-[#c61c39] text-white rounded-full text-sm font-semibold hover:bg-[#a01530] transition-all shadow-crimson"
              >
                📞 1 (888) 692-6211
              </a>
              <a
                href="/MembersPortal"
                className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full hover:shadow-lg transition-all border-2 border-[#155EEF] hover:scale-105"
              >
                <User className="w-5 h-5 text-[#155EEF]" />
                <span className="text-sm font-bold text-[#030101]">Member Login</span>
              </a>
              </nav>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 glass rounded-lg"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden mobile-menu border-t border-white/20">
            <div className="px-4 py-3 space-y-2">
              {['attorneys', 'case-types', 'reviews', 'faq', 'contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="block w-full text-left px-4 py-3 text-base font-semibold capitalize rounded-lg hover:bg-white/10 transition-colors"
                >
                  {item.replace('-', ' ')}
                </button>
              ))}

              <a
                href="https://links.abcdashboard.com/widget/form/Kz0XoGSPFIzyav3t7aGM"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-4 py-3 bg-[#71D6B5] text-white rounded-lg font-bold mb-2"
              >
                🚀 FREE Case Review
              </a>
              <a
                href="tel:+18886926211"
                className="block w-full text-center px-4 py-3 bg-[#c61c39] text-white rounded-lg font-bold mb-2"
              >
                📞 1 (888) 692-6211
              </a>
              <a
                href="https://links.abcdashboard.com/qr/Hz9JhDFmE-3n"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-[#71D6B5] rounded-lg font-bold text-[#030101]"
              >
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691be92ffa93cfd887f03662/c680ed68b_QR-ucrashcampaign1.png"
                  alt="QR Code"
                  className="w-8 h-8"
                />
                Scan QR Code
              </a>
              </div>
              </div>
              )}
              </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691be92ffa93cfd887f03662/8740d5677_background-ucrash-999kb.png" 
                    alt="UCRASH Logo - We Get You Cash" 
                    className="h-48 md:h-64 lg:h-80 w-auto mx-auto mb-12 filter drop-shadow-2xl fade-in"
                    style={{ maxWidth: '90vw' }}
                  />
                  <h1 className="text-5xl md:text-7xl font-black mb-6 text-[#030101] fade-in" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Find a Car Accident Attorney Near You
                  </h1>
                  <div className="text-3xl md:text-5xl font-black mb-8 text-[#c61c39] fade-in" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Find the Attorney Who Gets You Ca$h
                  </div>
                  <p className="text-xl md:text-2xl mb-12 text-[#030101] max-w-4xl mx-auto fade-in" style={{ fontFamily: 'Inter, sans-serif' }}>
                  America's Premier Attorney Directory. Find, compare, and connect with top-rated personal injury lawyers nationwide.
                  </p>
          </div>

          {/* CTA Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto fade-in">
            <a
              href="tel:+12392476030"
              className="glass-card p-6 rounded-2xl text-center hover:scale-105 transition-transform border-2 border-[#c61c39] bg-white"
              >
              <Phone className="w-12 h-12 mx-auto mb-3 text-[#c61c39]" />
              <h3 className="font-bold text-[#030101] mb-2">Call Now</h3>
              <p className="text-sm text-gray-600 mb-3">24/7 Support</p>
              <div className="px-4 py-2 bg-[#c61c39] text-white rounded-full text-sm font-bold">
                +1 239-247-6030
              </div>
            </a>

            <button
              onClick={() => scrollToSection('book-consultation')}
              className="glass-card p-6 rounded-2xl text-center hover:scale-105 transition-transform border-2 border-[#155EEF] bg-white"
              >
              <Calendar className="w-12 h-12 mx-auto mb-3 text-[#155EEF]" />
              <h3 className="font-bold text-[#030101] mb-2">Free Case Review</h3>
              <p className="text-sm text-gray-600 mb-3">No Obligation</p>
              <div className="px-4 py-2 bg-[#155EEF] text-white rounded-full text-sm font-bold">
                Book Now
              </div>
            </button>

            <a
              href="/AttorneySignup"
              className="glass-card p-6 rounded-2xl text-center hover:scale-105 transition-transform border-2 border-[#71D6B5] bg-white"
              >
              <Award className="w-12 h-12 mx-auto mb-3 text-[#71D6B5]" />
              <h3 className="font-bold text-[#030101] mb-2">For Attorneys</h3>
              <p className="text-sm text-gray-600 mb-3">Join Directory</p>
              <div className="px-4 py-2 bg-[#71D6B5] text-white rounded-full text-sm font-bold">
                Sign Up
              </div>
            </a>

            <a
              href="/ClientIntake"
              className="glass-card p-6 rounded-2xl text-center hover:scale-105 transition-transform border-2 border-[#030101] bg-white"
              >
              <svg className="w-12 h-12 mx-auto mb-3 text-[#030101]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="font-bold text-[#030101] mb-2">Submit Case</h3>
              <p className="text-sm text-gray-600 mb-3">Start Intake</p>
              <div className="px-4 py-2 bg-[#030101] text-white rounded-full text-sm font-bold">
                Start Now
              </div>
            </a>
          </div>

          {/* Bonus Strip */}
          <div className="mt-12 max-w-4xl mx-auto fade-in">
            <a 
              href="/ReferralSignup"
              className="block bg-white rounded-3xl p-8 text-center hover:scale-105 transition-transform border-2 border-[#71D6B5] shadow-lg"
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <DollarSign className="w-8 h-8 text-[#71D6B5]" />
                <h3 className="text-3xl font-black text-[#030101]">BONUS: Earn $1,000 Per Qualified Case!</h3>
              </div>
              <p className="text-xl text-gray-700 mb-4">
                Know someone who was in a crash? Refer them and earn when their claim is accepted.
              </p>
              <div className="inline-block px-8 py-3 bg-gradient-to-r from-[#71D6B5] to-[#155EEF] text-white rounded-full text-lg font-bold">
                Become a Referral Partner →
              </div>
            </a>
          </div>

          {/* Members Portal Access */}
          <div className="mt-8 max-w-5xl mx-auto fade-in">
            <div className="bg-white rounded-3xl p-8 border-2 border-[#155EEF] shadow-lg">
              <h3 className="text-3xl font-black text-center text-[#030101] mb-6">Members Portal Access</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a 
                  href="/MembersPortal"
                  className="group bg-white p-8 rounded-2xl text-center hover:scale-105 transition-transform border-2 border-[#71D6B5] shadow-md"
                >
                  <Award className="w-16 h-16 mx-auto mb-4 text-[#71D6B5] group-hover:scale-110 transition-transform" />
                  <h4 className="text-2xl font-bold text-[#030101] mb-3">Attorney Login</h4>
                  <p className="text-gray-700 mb-4">Access your dashboard, view new leads, and manage cases</p>
                  <div className="inline-block px-6 py-3 bg-gradient-to-r from-[#71D6B5] to-[#155EEF] text-white rounded-full text-lg font-bold">
                    Attorney Portal →
                  </div>
                </a>

                <a 
                  href="/ClientIntake"
                  className="group bg-white p-8 rounded-2xl text-center hover:scale-105 transition-transform border-2 border-[#c61c39] shadow-md"
                >
                  <svg className="w-16 h-16 mx-auto mb-4 text-[#c61c39] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h4 className="text-2xl font-bold text-[#030101] mb-3">Submit Your Case</h4>
                  <p className="text-gray-700 mb-4">Complete intake questionnaire and get matched with an attorney</p>
                  <div className="inline-block px-6 py-3 bg-gradient-to-r from-[#c61c39] to-[#030101] text-white rounded-full text-lg font-bold">
                    Start Intake →
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MURPHY AI Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-[#c61c39] via-[#030101] to-[#c61c39] rounded-3xl p-1">
            <div className="bg-white rounded-3xl p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#c61c39] to-[#030101] text-white rounded-full text-sm font-bold mb-4">
                  🤖 Powered by Omega UI
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-4 text-[#030101]">
                  Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c61c39] to-[#030101]">MURPHY</span>
                </h2>
                <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                  Your AI-Powered Legal Document Handler & Case Management Assistant
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-gray-50 rounded-2xl">
                  <div className="text-4xl mb-3">📄</div>
                  <h3 className="font-bold text-[#155EEF] mb-2">Document Organization</h3>
                  <p className="text-gray-600 text-sm">Automatically organize and manage your case documents</p>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-2xl">
                  <div className="text-4xl mb-3">⚡</div>
                  <h3 className="font-bold text-[#71D6B5] mb-2">Case Tracking</h3>
                  <p className="text-gray-600 text-sm">Monitor your case progress and important deadlines</p>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-2xl">
                  <div className="text-4xl mb-3">💬</div>
                  <h3 className="font-bold text-[#c61c39] mb-2">24/7 Assistance</h3>
                  <p className="text-gray-600 text-sm">Get answers to common questions anytime</p>
                </div>
              </div>
              
              <div className="text-center mb-6">
                {currentUser ? (
                  <a
                    href="https://ui.omegaui.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-8 py-4 bg-gradient-to-r from-[#c61c39] to-[#030101] text-white rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-lg"
                  >
                    🚀 Access MURPHY Now
                  </a>
                ) : (
                  <button
                    onClick={() => base44.auth.redirectToLogin(window.location.href)}
                    className="inline-block px-8 py-4 bg-gradient-to-r from-[#c61c39] to-[#030101] text-white rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-lg"
                  >
                    🔐 Login to Access MURPHY
                  </button>
                )}
              </div>
              
              {/* Legal Disclaimer */}
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>⚠️ Important Disclaimer:</strong> MURPHY is an AI-powered document management and informational assistant only. 
                  <strong> MURPHY does NOT provide legal advice</strong> and should not be relied upon as a substitute for professional legal counsel. 
                  Information provided by MURPHY may not always be accurate or complete. 
                  <strong> Always consult with a licensed attorney</strong> for legal advice specific to your situation. 
                  MURPHY is designed to help organize documents and provide general information, not to replace the expertise of qualified legal professionals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "⚡", title: "Submit Your Case 24/7", desc: "Our secure platform is available 24/7 to accept your case information.", color: "#c61c39", omega: true },
              { icon: "💯", title: "Free Case Review", desc: "Connect with attorneys for a completely free, no-obligation case review.", color: "#030101", omega: false },
              { icon: "🎯", title: "100% Free Consultations", desc: "The lawyers on our platform offer free consultations to discuss your case.", color: "#71D6B5", omega: false },
              { icon: "✅", title: "Find Proven Results", desc: "Browse profiles of experienced attorneys with proven track records.", color: "#155EEF", omega: true }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center fade-in shadow-lg" style={{ borderLeft: `4px solid ${feature.color}` }}>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold mb-3 flex items-center justify-center gap-2" style={{ color: feature.color }}>
                  {feature.title}
                  {feature.omega && (
                    <span className="omega-badge">
                      <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691be92ffa93cfd887f03662/441f9a3dd_Screenshot2025-11-21163403.png" alt="UCRASH" />
                      Omega UI
                    </span>
                  )}
                </h3>
                <p className="text-gray-700">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-12 text-[#030101]">
            About <span className="text-[#c61c39]">U CRASH</span>
          </h2>
          <div className="bg-white rounded-3xl p-8 md:p-12 mb-8 shadow-lg">
            <p className="text-xl leading-relaxed text-[#030101] text-center mb-8">
              U CRASH is a premier <strong>attorney advertising directory</strong>, dedicated to helping accident victims find and connect with legal professionals nationwide. <strong>We are not a law firm or a lawyer referral service.</strong> We provide a platform where you can browse the profiles of experienced attorneys, understand their specialties, and contact them directly for a free case evaluation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: "🏆", title: "Find Proven Lawyers", desc: "Our directory features attorneys with track records of recovering millions for their clients.", omega: false, color: "#C41E3A" },
              { icon: "🤝", title: "Detailed Attorney Profiles", desc: "Our extensive directory includes respected personal injury attorneys.", omega: true, color: "#C41E3A" },
              { icon: "⚡", title: "Submit Your Case 24/7", desc: "Our platform is always on, ready to securely send your information.", omega: true, color: "#C41E3A" },
              { icon: "💰", title: "Lawyers Offer Free Consults", desc: "Attorneys on our platform offer free consultations and typically work on contingency.", omega: false, color: "#000000" }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 hover:scale-105 transition-transform shadow-lg">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: item.color }}>
                  {item.title}
                  {item.omega && (
                    <span className="omega-badge">
                      <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691be92ffa93cfd887f03662/441f9a3dd_Screenshot2025-11-21163403.png" alt="UCRASH" />
                      Omega UI
                    </span>
                  )}
                </h3>
                <p className="text-gray-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Types Section */}
      <section id="case-types" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-12 text-[#030101]">
            Find Lawyers for <span className="text-[#c61c39]">All Types</span> of Accidents
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: "🚗",
              title: "Auto Accidents",
              desc: "Find attorneys who specialize in car accident claims, from fender benders to serious collisions.",
              cases: ["Rear-end collisions", "Head-on crashes", "T-bone accidents", "Multi-vehicle pileups"],
              color: "#A6102C"
              },
              {
              icon: "🚚",
              title: "Truck Accidents",
              desc: "Connect with lawyers experienced in complex trucking regulations and commercial liability.",
              cases: ["18-wheeler collisions", "Semi-truck accidents", "Jackknife accidents", "Driver fatigue cases"],
              color: "#155EEF"
              },
              {
              icon: "🏍️",
              title: "Motorcycle Accidents",
              desc: "Motorcycle cases have unique challenges. Find attorneys who understand them.",
              cases: ["Lane splitting accidents", "Left-turn collisions", "Road hazard crashes", "Traumatic brain injuries"],
              color: "#71D6B5"
              },
              {
              icon: "🤕",
              title: "Slip & Fall",
              desc: "Property owners have a duty to keep you safe. Find lawyers who handle premises liability.",
              cases: ["Wet floor accidents", "Uneven surfaces", "Poor lighting incidents", "Snow and ice hazards"],
              color: "#030101"
              }
          ].map((caseType, index) => (
            <div key={index} className="bg-white rounded-3xl p-8 hover:scale-105 transition-transform shadow-lg" style={{ borderTop: `4px solid ${caseType.color}` }}>
              <div className="text-5xl mb-4">{caseType.icon}</div>
              <h3 className="text-3xl font-bold mb-3" style={{ color: caseType.color }}>{caseType.title}</h3>
              <p className="text-gray-700 mb-4 text-lg">{caseType.desc}</p>
              <ul className="gavel-bullet">
                {caseType.cases.map((item, i) => (
                  <li key={i} className="text-gray-600">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* Attorney Profiles Section */}
      <section id="attorneys" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-12 text-[#030101]">
            Find a <span className="text-[#A6102C]">Top-Rated</span> Attorney
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attorneys.map((attorney, index) => (
              <div key={index} className="glass-card rounded-3xl overflow-hidden hover:scale-105 transition-transform">
                <div 
                  className="h-64 bg-cover bg-center border-b-4"
                  style={{ backgroundImage: `url(${attorney.image})`, borderColor: '#2699fe' }}
                />
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-1 text-[#c4653a]">{attorney.name}</h3>
                  <p className="font-semibold mb-3 text-white/90">{attorney.firm}</p>
                  <p className="text-sm mb-4 text-white/70">Specializes in <strong>{attorney.specialty}</strong></p>
                  
                  <div className="flex items-center mb-4 text-[#c4653a] text-xl">
                    {[...Array(attorney.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="glass rounded-lg p-3 text-center">
                      <div className="font-bold text-lg" style={{ color: '#2699fe' }}>{attorney.years}</div>
                      <div className="text-xs text-white/60">Years Exp.</div>
                    </div>
                    <div className="glass rounded-lg p-3 text-center">
                      <div className="font-bold text-lg" style={{ color: '#2699fe' }}>{attorney.recovered}</div>
                      <div className="text-xs text-white/60">Recovered</div>
                    </div>
                    <div className="glass rounded-lg p-3 text-center">
                      <div className="font-bold text-sm" style={{ color: '#2699fe' }}>{attorney.location}</div>
                      <div className="text-xs text-white/60">Location</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <a
                      href={`/AttorneyProfile?id=${index + 1}`}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white text-center rounded-full font-bold hover:bg-blue-700 transition-all"
                    >
                      View Profile
                    </a>
                    <button
                      onClick={() => scrollToSection('book-consultation')}
                      className="flex-1 px-6 py-3 btn-primary rounded-full font-bold"
                    >
                      Get Review
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-6 text-white drop-shadow-lg">
            See What <span style={{ color: '#4bce2a', textShadow: '0 0 20px rgba(75, 206, 42, 0.5)' }}>People Say</span>
          </h2>
          
          <div className="bg-white rounded-2xl p-6 mb-12 text-center shadow-lg">
            <p className="text-gray-700">
              <strong>Testimonials reflect the experiences of clients who found their attorneys.</strong> U CRASH is an advertising platform, and these testimonials do not represent all outcomes or clients. Past results do not guarantee a similar outcome.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                stars: 5,
                text: "After my car accident, I was overwhelmed. I used U CRASH to find an amazing attorney within hours. The lawyer handled everything and I received a settlement that covered all my medical bills and lost wages. Thank you!",
                author: "Maria G., Tampa, FL"
              },
              {
                stars: 5,
                text: "I was hit by a truck and suffered serious injuries. I found an attorney on U CRASH who specialized in truck accidents. The process was smooth and stress-free. I highly recommend this site to anyone who's been in an accident.",
                author: "James R., Dallas, TX"
              },
              {
                stars: 5,
                text: "The U CRASH platform was easy to use, professional, and helped me get in touch with a lawyer fast. They helped me find a top attorney who fought hard for me. I got the compensation I deserved!",
                author: "Sarah T., Los Angeles, CA"
              }
            ].map((review, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex mb-4 text-[#c61c39]">
                  {[...Array(review.stars)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-4 leading-relaxed">{review.text}</p>
                <p className="font-bold text-[#030101]">- {review.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-12 text-[#030101]">
            Get in <span className="text-[#c61c39]">Touch</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: <Phone className="w-10 h-10" />, title: "Call Us", desc: "Available 24/7", link: "tel:+18886926211", linkText: "1-888-692-6211" },
              { icon: <Calendar className="w-10 h-10" />, title: "Free Case Review", desc: "Submit your case", link: "#book-consultation", linkText: "Book Now" },
              { icon: <Mail className="w-10 h-10" />, title: "Email Us", desc: "Send us details", link: "mailto:contact@omegaui.com", linkText: "contact@omegaui.com" },
              { icon: <MapPin className="w-10 h-10" />, title: "Nationwide", desc: "All 50 States", link: "#", linkText: "Learn More" }
            ].map((contact, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 text-center hover:scale-105 transition-transform shadow-lg">
                <div className="mb-4 flex justify-center text-[#c61c39]">{contact.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-[#030101]">{contact.title}</h3>
                <p className="text-gray-600 mb-3">{contact.desc}</p>
                <a href={contact.link} className="text-[#155EEF] font-bold hover:text-[#71D6B5]">
                  {contact.linkText}
                </a>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-8 text-center shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-[#c61c39]">Contact Information</h3>
            <div className="space-y-2 text-gray-700">
              <p><strong>Service Area:</strong> Nationwide - All 50 States</p>
              <p><strong>Platform Availability:</strong> 24/7</p>
              <p><strong>Support Line:</strong> 24/7 Emergency Line</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-12 text-[#030101]">
            Frequently Asked <span className="text-[#c61c39]">Questions</span>
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg">
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-lg text-[#030101] pr-4">{faq.question}</span>
                  <ChevronDown 
                    className={`w-6 h-6 flex-shrink-0 transition-transform ${
                      activeAccordion === index ? 'rotate-180' : ''
                    }`}
                    className="text-[#c61c39]"
                  />
                </button>
                {activeAccordion === index && (
                  <div className="px-6 pb-6 text-gray-700 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="book-consultation" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-6 text-[#030101]">
            Get Your <span className="text-[#c61c39]">Free Case Review</span>
          </h2>
          <p className="text-center text-xl text-[#030101] mb-12 max-w-3xl mx-auto">
            Complete the quick qualifying form below, then schedule your free consultation with a participating attorney.
          </p>

          <div className="glass-strong rounded-3xl p-4 mb-8">
            <iframe 
              src="https://links.abcdashboard.com/widget/form/Kz0XoGSPFIzyav3t7aGM" 
              className="w-full h-[800px] rounded-2xl"
              frameBorder="0"
              allow="geolocation; microphone; camera"
            />
          </div>

          <div className="bg-white rounded-3xl p-8 text-center shadow-lg">
            <p className="text-xl font-bold mb-4 text-[#030101]">Prefer to call instead?</p>
            <a 
              href="tel:+18886926211"
              className="inline-block px-8 py-4 btn-primary rounded-full text-lg font-bold"
            >
              📞 Call 1 (888) 692-6211
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#155EEF] to-[#71D6B5]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-white drop-shadow-lg">
            Don't Wait - Find the Help You Deserve!
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Submit your case for a FREE review from a local attorney. Available 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+12392476030"
              className="px-8 py-4 bg-white text-[#c61c39] rounded-full text-lg font-bold hover:bg-gray-100 transition-all"
            >
              CALL 1-888-692-6211 NOW
            </a>
            <button
              onClick={() => scrollToSection('book-consultation')}
              className="px-8 py-4 bg-[#c61c39] text-white rounded-full text-lg font-bold hover:bg-[#030101] transition-all"
            >
              📅 GET YOUR FREE REVIEW
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-16 px-4 border-t-4 border-[#71D6B5]" style={{ backgroundColor: '#E2E8F0' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <a
              href="https://links.abcdashboard.com/widget/form/Kz0XoGSPFIzyav3t7aGM"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-12 py-5 bg-gradient-to-r from-[#71D6B5] to-[#155EEF] text-white rounded-full text-2xl font-black hover:scale-110 transition-transform shadow-2xl animate-pulse"
              style={{ boxShadow: '0 0 30px rgba(113, 214, 181, 0.5)' }}
            >
              🚀 START YOUR FREE CASE REVIEW NOW
            </a>
            <p className="text-sm text-gray-600 mt-4">Takes only 2 minutes • Get matched with top attorneys</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#71D6B5]">U CRASH</h3>
              <p className="text-gray-700 text-sm">America's Premier Attorney Advertising Directory</p>
              <p className="text-gray-700 text-sm mt-2">Platform by Omega UI</p>
              <p className="text-gray-600 text-xs mt-1">A Division of Omega UI, LLC</p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 text-[#71D6B5]">Quick Links</h3>
              <div className="space-y-2">
                {['attorneys', 'case-types', 'reviews', 'faq', 'contact'].map((link) => (
                  <button
                    key={link}
                    onClick={() => scrollToSection(link)}
                    className="block text-gray-700 hover:text-[#71D6B5] text-sm transition-colors"
                  >
                    {link.charAt(0).toUpperCase() + link.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 text-[#71D6B5]">Contact Info</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">Phone: <a href="tel:+18886926211" className="hover:text-[#71D6B5]">1 (888) 692-6211</a></p>
                <p className="text-gray-700">Email: <a href="mailto:contact@omegaui.com" className="hover:text-[#71D6B5]">contact@omegaui.com</a></p>
                <p className="text-gray-600 text-xs mt-2">2744 Edison Avenue, Unit-7, Suite C-3<br/>Fort Myers, FL 33916</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 text-[#71D6B5]">Omega UI Network</h3>
              <div className="space-y-2">
                <a href="https://www.omegaui.com" target="_blank" rel="noopener noreferrer" className="block text-gray-700 hover:text-[#71D6B5] text-sm transition-colors">Omega UI</a>
                <a href="https://syncloud.omegaui.com" target="_blank" rel="noopener noreferrer" className="block text-gray-700 hover:text-[#71D6B5] text-sm transition-colors">SynCloud</a>
                <a href="https://www.ancdashboard.com" target="_blank" rel="noopener noreferrer" className="block text-gray-700 hover:text-[#71D6B5] text-sm transition-colors">ABC Dashboard</a>
                <a href="https://glytch.cloud" target="_blank" rel="noopener noreferrer" className="block text-gray-700 hover:text-[#71D6B5] text-sm transition-colors">GLYTCH</a>
                <a href="https://glytch.cloud/functions" target="_blank" rel="noopener noreferrer" className="block text-gray-700 hover:text-[#71D6B5] text-sm transition-colors">GLYTCH Functions</a>
                <a href="https://qr.omegaui.com" target="_blank" rel="noopener noreferrer" className="block text-gray-700 hover:text-[#71D6B5] text-sm transition-colors">QR Generator</a>
                <a href="https://ui.omegaui.com" target="_blank" rel="noopener noreferrer" className="block text-gray-700 hover:text-[#71D6B5] text-sm transition-colors">UI Tools</a>
                <a href="https://cloudconvert.omegaui.com" target="_blank" rel="noopener noreferrer" className="block text-gray-700 hover:text-[#71D6B5] text-sm transition-colors">Cloud Convert</a>
                <a href="https://chess.omegaui.com" target="_blank" rel="noopener noreferrer" className="block text-gray-700 hover:text-[#71D6B5] text-sm transition-colors">Chess</a>
                <a href="https://echo.omegaui.com" target="_blank" rel="noopener noreferrer" className="block text-gray-700 hover:text-[#71D6B5] text-sm transition-colors">Echo</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-8 text-center text-sm text-gray-600">
            <p className="mb-4">&copy; 2025 U CRASH. All Rights Reserved.</p>
            <p className="mb-2 text-xs">A Service of Omega UI, LLC</p>
            <p className="mb-2">
              <strong>ATTORNEY ADVERTISING:</strong> U CRASH is an attorney advertising platform. We are not a law firm, do not provide legal advice, and are not a lawyer referral service.
            </p>
            <p>
              Using this website does not create an attorney-client relationship. The choice of a lawyer is an important decision and should not be based solely upon advertisements. Past results do not guarantee future outcomes.
            </p>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-14 h-14 btn-primary rounded-full flex items-center justify-center text-2xl font-bold glow-orange z-50 hover:scale-110 transition-transform"
        >
          ↑
        </button>
      )}

      {/* Victim Intake Chat Widget */}
      <VictimIntakeChat 
        isOpen={chatOpen || chatMinimized}
        onClose={() => {
          setChatOpen(false);
          setChatMinimized(false);
        }}
        minimized={chatMinimized}
        onToggleMinimize={() => setChatMinimized(!chatMinimized)}
      />

      {/* QR Code Modal */}
      {qrModalOpen && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={() => setQrModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl p-8 max-w-md mx-4 transform transition-all animate-in"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'scaleIn 0.3s ease-out' }}
          >
            <h3 className="text-2xl font-bold text-center text-[#030101] mb-4">Scan for Quick Access</h3>
            <p className="text-center text-gray-600 mb-6">Double-tap QR code to open form directly</p>
            <button
              onClick={handleQrClick}
              className="block w-full"
            >
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691be92ffa93cfd887f03662/c680ed68b_QR-ucrashcampaign1.png"
                alt="UCRASH QR Code - Double tap to open form"
                className="w-full h-auto rounded-xl shadow-2xl hover:scale-105 transition-transform cursor-pointer"
              />
            </button>
            <button
              onClick={() => setQrModalOpen(false)}
              className="mt-6 w-full px-6 py-3 bg-gray-200 text-[#030101] rounded-full font-bold hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Floating Chat Button (when closed) */}
      {!chatOpen && !chatMinimized && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-4 left-4 w-16 h-16 sm:bottom-6 sm:left-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform z-40 animate-bounce"
          style={{ animationDuration: '2s', boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)' }}
        >
          <div className="relative">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18.5c-3.87-.96-7-5.54-7-10.5V8.3l7-3.11 7 3.11V10c0 4.96-3.13 9.54-7 10.5z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
          </div>
        </button>
      )}

      <style>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
      </div>
      );
      }