import React, { useState, useEffect } from 'react';
import { ChevronDown, Phone, Mail, Calendar, Star, Shield, CheckCircle, MessageCircle, Menu, X, Clock, Award, Users } from 'lucide-react';
import VictimIntakeChat from '../components/agents/VictimIntakeChat';

export default function ClientLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in');
      elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const isVisible = (rect.top <= window.innerHeight * 0.85);
        if (isVisible) {
          element.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
      setMenuOpen(false);
    }
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
      image: "https://storage.googleapis.com/msgsndr/y4ABqxnk279eDc0f5DqY/media/6913e61c7757659586111f9e.png",
      verified: true
    },
    {
      name: "Sarah Chen, Esq.",
      firm: "Chen & Associates Trial Lawyers",
      specialty: "Motorcycle & Pedestrian Accidents",
      rating: 5,
      years: "15+",
      recovered: "$35M+",
      location: "Miami, FL",
      image: "https://storage.googleapis.com/msgsndr/y4ABqxnk279eDc0f5DqY/media/6913e61c02ab9b802613b593.png",
      verified: true
    },
    {
      name: "David Goldstein, Esq.",
      firm: "Goldstein Law Group",
      specialty: "Slip & Fall and Premises Liability",
      rating: 5,
      years: "25+",
      recovered: "$70M+",
      location: "Orlando, FL",
      image: "https://storage.googleapis.com/msgsndr/y4ABqxnk279eDc0f5DqY/media/6913e61c372f87a895b6c31a.png",
      verified: true
    }
  ];

  const faqs = [
    {
      question: "How does u-CRA$H work?",
      answer: "u-CRA$H is an attorney advertising directory. We are not a law firm. We provide a free platform for accident victims to browse profiles and connect with personal injury attorneys who advertise with us."
    },
    {
      question: "How much does it cost?",
      answer: "Our directory is 100% FREE for you to use. The attorneys who advertise on our platform typically work on a contingency basis, meaning you don't pay unless they win your case."
    },
    {
      question: "How quickly will I hear back?",
      answer: "After you submit your information, it is made available to participating attorneys. Response times vary by firm, but many respond within minutes or hours."
    },
    {
      question: "Do I have to hire the attorney who contacts me?",
      answer: "Absolutely not. You are under no obligation. Our platform simply helps you find qualified attorneys. The choice is always yours."
    }
  ];

  return (
    <div className="min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap');
        
        :root {
          --primary-orange: #c4653a;
          --primary-orange-hover: #d47a52;
          --primary-blue: #1f8ec0;
          --secondary-blue-hover: #3da8d6;
          --light-base: #ffffff;
          --light-card: #f8f8f8;
          --text-dark: #222222;
          --text-secondary: #555555;
          --text-light: #f5f5f5;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', 'Segoe UI', sans-serif;
          color: var(--text-dark);
          overflow-x: hidden;
        }

        /* Animated Background */
        .animated-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 50%, rgba(31, 142, 192, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(196, 101, 58, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 50% 20%, rgba(31, 142, 192, 0.04) 0%, transparent 50%);
          animation: backgroundPulse 15s ease-in-out infinite;
          z-index: -1;
        }

        @keyframes backgroundPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        /* Fade Animations */
        .fade-in, .fade-in-left, .fade-in-right, .scale-in {
          opacity: 0;
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        .fade-in {
          transform: translateY(30px);
        }

        .fade-in-left {
          transform: translateX(-50px);
        }

        .fade-in-right {
          transform: translateX(50px);
        }

        .scale-in {
          transform: scale(0.8);
        }

        .fade-in.visible, .fade-in-left.visible, .fade-in-right.visible {
          opacity: 1;
          transform: translate(0, 0);
        }

        .scale-in.visible {
          opacity: 1;
          transform: scale(1);
        }

        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes pulse-orange {
          0%, 100% { box-shadow: 0 4px 15px rgba(196, 101, 58, 0.5); }
          50% { box-shadow: 0 4px 30px rgba(196, 101, 58, 0.9); }
        }
      `}</style>

      <div className="animated-bg" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b-2 border-orange-500 shadow-lg" style={{ backgroundColor: '#E2E8F0', animation: 'slideDown 0.5s ease-out' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0">
              <img 
                src="https://storage.googleapis.com/msgsndr/y4ABqxnk279eDc0f5DqY/media/691c36a0c20a256df3ab1ad8.svg" 
                alt="u-CRA$H Logo" 
                className="h-12 md:h-16 w-auto filter drop-shadow-lg"
              />
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-1">
              {['how-it-works', 'attorneys', 'case-types', 'reviews', 'faq'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="px-4 py-2 text-sm font-semibold capitalize text-blue-600 hover:text-white hover:bg-blue-600 transition-all rounded-lg"
                >
                  {item.replace('-', ' ')}
                </button>
              ))}
              <button
                onClick={() => scrollToSection('book-consultation')}
                className="ml-2 px-5 py-2.5 rounded-full text-sm font-bold text-white"
                style={{
                  background: 'var(--primary-orange)',
                  boxShadow: '0 4px 15px rgba(196, 101, 58, 0.5)',
                  animation: 'pulse-orange 2s infinite'
                }}
              >
                📅 Free Review
              </button>
              <a
                href="tel:18886926211"
                className="ml-2 px-5 py-2.5 bg-orange-600 text-white rounded-full text-sm font-bold hover:bg-orange-700 transition-all"
              >
                📞 1-888-692-6211
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/50 backdrop-blur-sm"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200 py-4">
              <div className="space-y-2">
                {['how-it-works', 'attorneys', 'case-types', 'reviews', 'faq'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item)}
                    className="block w-full text-left px-4 py-3 text-base font-semibold capitalize rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {item.replace('-', ' ')}
                  </button>
                ))}
                <button
                  onClick={() => scrollToSection('book-consultation')}
                  className="block w-full text-center px-4 py-3 bg-orange-600 text-white rounded-lg font-bold"
                >
                  📅 Get Free Review
                </button>
                <a
                  href="tel:18886926211"
                  className="block w-full text-center px-4 py-3 bg-orange-600 text-white rounded-lg font-bold"
                >
                  📞 1-888-692-6211
                </a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-blue-50/50 to-orange-50/30 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-600 uppercase tracking-tight" style={{ lineHeight: '1.1' }}>
            Been in an Accident?
          </h1>
          <div className="text-3xl md:text-5xl font-black mb-8 text-orange-600 uppercase">
            Find the Attorney Who Gets You Ca$h
          </div>
          <p className="text-xl md:text-2xl mb-12 text-gray-600 max-w-4xl mx-auto">
            America's Premier Attorney Directory. Find, compare, and connect with top-rated personal injury lawyers nationwide — 100% FREE.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="tel:18886926211"
              className="px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-full text-lg font-bold min-w-[280px] text-center hover:scale-105 transition-transform shadow-lg"
            >
              CALL NOW: 1-888-692-6211
            </a>
            <button
              onClick={() => scrollToSection('book-consultation')}
              className="px-8 py-4 bg-transparent border-3 border-orange-600 text-orange-600 rounded-full text-lg font-bold min-w-[280px] hover:bg-orange-600 hover:text-white transition-all"
            >
              📅 GET FREE CASE REVIEW
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-16 px-4 bg-gray-50 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-12 text-gray-800">
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-600">u-CRA$H</span> Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <MessageCircle className="w-12 h-12" />, title: "1. Tell Us Your Story", desc: "Share your accident details through our secure AI assistant — available 24/7." },
              { icon: <Shield className="w-12 h-12" />, title: "2. We Find Your Match", desc: "Our AI connects you with verified, local attorneys who specialize in your type of case." },
              { icon: <CheckCircle className="w-12 h-12" />, title: "3. Free Consultation", desc: "Speak with qualified attorneys at no cost. No obligation, no pressure." },
              { icon: <Award className="w-12 h-12" />, title: "4. Get Justice", desc: "Choose the attorney you trust and let them fight for the compensation you deserve." }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-2xl text-center border-2 border-blue-600 hover:border-orange-600 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 fade-in scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-orange-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-12 text-gray-800">
            Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-600">u-CRA$H?</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: <Shield className="w-16 h-16 text-blue-600" />,
                title: "Verified Attorneys Only",
                desc: "Every attorney in our directory is verified, licensed, and in good standing with their state bar."
              },
              {
                icon: <Clock className="w-16 h-16 text-blue-600" />,
                title: "24/7 Availability",
                desc: "Our AI assistant and platform are available around the clock to capture your information and start your case review."
              },
              {
                icon: <Users className="w-16 h-16 text-blue-600" />,
                title: "Nationwide Coverage",
                desc: "Find qualified attorneys in all 50 states. No matter where your accident happened, we can help."
              },
              {
                icon: <Award className="w-16 h-16 text-blue-600" />,
                title: "Proven Track Records",
                desc: "Browse attorney profiles showing years of experience, total recovered, and real client reviews."
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 rounded-2xl border-l-4 border-orange-600 hover:scale-105 transition-transform duration-300 fade-in"
              >
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-orange-600">{item.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Types Section */}
      <section id="case-types" className="py-20 px-4 bg-gradient-to-br from-blue-50/50 to-orange-50/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-12 text-gray-800">
            We Handle <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-600">All Types</span> of Accidents
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: "🚗",
                title: "Auto Accidents",
                desc: "Car crashes, rear-end collisions, intersection accidents, and more.",
                cases: ["Rear-end collisions", "Head-on crashes", "T-bone accidents", "Hit and run"]
              },
              {
                icon: "🚚",
                title: "Truck Accidents",
                desc: "Commercial truck and semi-trailer accident claims.",
                cases: ["18-wheeler collisions", "Jackknife accidents", "Cargo incidents", "Driver fatigue cases"]
              },
              {
                icon: "🏍️",
                title: "Motorcycle Accidents",
                desc: "Specialized representation for motorcycle injury claims.",
                cases: ["Lane splitting", "Left-turn collisions", "Road hazards", "Head injuries"]
              },
              {
                icon: "🤕",
                title: "Slip & Fall",
                desc: "Premises liability and property owner negligence.",
                cases: ["Wet floors", "Uneven surfaces", "Poor lighting", "Snow and ice"]
              }
            ].map((caseType, index) => (
              <div 
                key={index} 
                className="bg-white rounded-3xl p-8 hover:scale-105 transition-transform duration-300 shadow-lg fade-in"
              >
                <div className="text-5xl mb-4">{caseType.icon}</div>
                <h3 className="text-3xl font-bold mb-3 text-blue-600">{caseType.title}</h3>
                <p className="text-gray-600 mb-4 text-lg">{caseType.desc}</p>
                <ul className="space-y-2">
                  {caseType.cases.map((item, i) => (
                    <li key={i} className="flex items-start text-gray-700">
                      <span className="text-green-500 mr-2 text-xl">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Attorney Profiles */}
      <section id="attorneys" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-12 text-gray-800">
            Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-600">Top-Rated</span> Attorneys
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attorneys.map((attorney, index) => (
              <div 
                key={index} 
                className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-200 hover:scale-105 transition-transform duration-300 fade-in"
              >
                <div className="relative">
                  <div 
                    className="h-64 bg-cover bg-center border-b-4 border-blue-600"
                    style={{ backgroundImage: `url(${attorney.image})` }}
                  />
                  {attorney.verified && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      ✓ Verified
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-1 text-orange-600">{attorney.name}</h3>
                  <p className="font-semibold mb-3 text-gray-700">{attorney.firm}</p>
                  <p className="text-sm mb-4 text-gray-600">
                    Specializes in <strong>{attorney.specialty}</strong>
                  </p>
                  
                  <div className="flex items-center mb-4 text-orange-600 text-xl">
                    {[...Array(attorney.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="font-bold text-blue-600 text-lg">{attorney.years}</div>
                      <div className="text-xs text-gray-600">Experience</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="font-bold text-blue-600 text-lg">{attorney.recovered}</div>
                      <div className="text-xs text-gray-600">Recovered</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="font-bold text-blue-600 text-sm">{attorney.location}</div>
                      <div className="text-xs text-gray-600">Location</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => scrollToSection('book-consultation')}
                    className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-full font-bold hover:scale-105 transition-transform"
                  >
                    Get Free Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 px-4 bg-gradient-to-br from-blue-50/50 to-orange-50/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-6 text-gray-800">
            Real Stories, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-600">Real Results</span>
          </h2>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-12 text-center border border-gray-200">
            <p className="text-gray-600">
              <strong>Testimonials reflect client experiences.</strong> Results vary by case. Past results do not guarantee future outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                stars: 5,
                text: "After my car accident, I was overwhelmed. I used u-CRA$H to find an amazing attorney within hours. They handled everything and I received a settlement that covered all my bills. Thank you!",
                author: "Maria G., Tampa, FL"
              },
              {
                stars: 5,
                text: "I was hit by a truck and suffered serious injuries. I found an attorney on u-CRA$H who specialized in truck accidents. The process was smooth and stress-free. Highly recommend!",
                author: "James R., Dallas, TX"
              },
              {
                stars: 5,
                text: "The u-CRA$H platform was easy to use and professional. They helped me find a top attorney who fought hard for me. I got the compensation I deserved!",
                author: "Sarah T., Los Angeles, CA"
              }
            ].map((review, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg fade-in">
                <div className="flex mb-4 text-orange-600">
                  {[...Array(review.stars)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 italic mb-4 leading-relaxed">{review.text}</p>
                <p className="font-bold text-orange-600">- {review.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-12 text-gray-800">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-600">Questions</span>
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-lg text-gray-800 pr-4">{faq.question}</span>
                  <ChevronDown 
                    className={`w-6 h-6 text-blue-600 flex-shrink-0 transition-transform ${
                      activeAccordion === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {activeAccordion === index && (
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="book-consultation" className="py-20 px-4 bg-gradient-to-br from-blue-50/50 to-orange-50/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-6 text-gray-800">
            Get Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-600">Free Case Review</span>
          </h2>
          <p className="text-center text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Book your appointment now! A participating attorney's office will contact you to confirm your free, no-obligation case review.
          </p>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 mb-8 border border-gray-200">
            <iframe 
              src="https://links.abcdashboard.com/widget/booking/PZcHumEAEH77AdSbkm3k" 
              className="w-full h-[800px] rounded-2xl"
              frameBorder="0"
              allow="geolocation; microphone; camera"
            />
          </div>

          <div className="bg-white rounded-3xl p-8 text-center shadow-lg">
            <p className="text-xl font-bold mb-4 text-gray-800">Prefer to call instead?</p>
            <a 
              href="tel:18886926211"
              className="inline-block px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-lg"
            >
              📞 Call 1-888-692-6211
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Don't Wait - Find the Help You Deserve!
          </h2>
          <p className="text-xl mb-8">
            Submit your case for a FREE review from a local attorney. Available 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:18886926211"
              className="px-8 py-4 bg-orange-600 text-white rounded-full text-lg font-bold hover:bg-orange-700 transition-all"
            >
              CALL 1-888-692-6211 NOW
            </a>
            <button
              onClick={() => scrollToSection('book-consultation')}
              className="px-8 py-4 bg-white text-blue-600 rounded-full text-lg font-bold hover:bg-gray-100 transition-all"
            >
              📅 GET YOUR FREE REVIEW
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-16 px-4 border-t-4 border-orange-600" style={{ backgroundColor: '#E2E8F0' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-bold mb-4 text-orange-600">u-CRA$H</h3>
              <p className="text-gray-400 text-sm">America's Premier Attorney Advertising Directory</p>
              <p className="text-gray-400 text-sm mt-2">Platform by SynCloud</p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4 text-orange-600">Quick Links</h3>
              <div className="space-y-2">
                {['how-it-works', 'attorneys', 'case-types', 'reviews', 'faq'].map((link) => (
                  <button
                    key={link}
                    onClick={() => scrollToSection(link)}
                    className="block text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.charAt(0).toUpperCase() + link.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4 text-orange-600">Contact Info</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-400">
                  Phone: <a href="tel:18886926211" className="hover:text-white">1-888-692-6211</a>
                </p>
                <p className="text-gray-400">
                  Email: <a href="mailto:contactus@ucrash.omegaui.com" className="hover:text-white">contactus@ucrash.omegaui.com</a>
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4 text-orange-600">Service Areas</h3>
              <p className="text-gray-400 text-sm">All 50 States</p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4 text-orange-600">Omega UI, LLC Network</h3>
              <div className="space-y-2">
                <a href="https://www.omegaui.com" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white text-sm transition-colors">Omega UI</a>
                <a href="https://syncloud.omegaui.com" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white text-sm transition-colors">SynCloud</a>
                <a href="https://www.ancdashboard.com" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white text-sm transition-colors">ABC Dashboard</a>
                <a href="https://glytch.cloud" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white text-sm transition-colors">GLYTCH</a>
                <a href="https://glytch.cloud/functions" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white text-sm transition-colors">GLYTCH Functions</a>
                <a href="https://qr.omegaui.com" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white text-sm transition-colors">QR Generator</a>
                <a href="https://ui.omegaui.com" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white text-sm transition-colors">UI Tools</a>
                <a href="https://cloudconvert.omegaui.com" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white text-sm transition-colors">Cloud Convert</a>
                <a href="https://chess.omegaui.com" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white text-sm transition-colors">Chess</a>
                <a href="https://echo.omegaui.com" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white text-sm transition-colors">Echo</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-500">
            <p className="mb-4">&copy; 2025 u-CRA$H. All Rights Reserved.</p>
            <p className="mb-2">
              <strong>ATTORNEY ADVERTISING:</strong> u-CRA$H is an attorney advertising platform. We are not a law firm, do not provide legal advice, and are not a lawyer referral service.
            </p>
            <p>
              Using this website does not create an attorney-client relationship. Past results do not guarantee future outcomes.
            </p>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-full flex items-center justify-center text-2xl font-bold hover:scale-110 transition-transform z-50 shadow-lg"
        style={{ animation: 'pulse-orange 2s infinite' }}
      >
        ↑
      </button>

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

      {/* Floating Chat Button (when closed) */}
      {!chatOpen && !chatMinimized && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-24 right-8 w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform z-40"
          style={{ animation: 'pulse-orange 2s infinite' }}
        >
          <MessageCircle className="w-8 h-8" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-ping"></span>
        </button>
      )}
    </div>
  );
}