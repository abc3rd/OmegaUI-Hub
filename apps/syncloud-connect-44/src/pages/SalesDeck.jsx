import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft,
  Zap, 
  TrendingDown,
  Rocket,
  Brain,
  DollarSign,
  Clock,
  Shield,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
  Cpu,
  Layers,
  Globe
} from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';
import GradientButton from '@/components/ui/GradientButton';
import { createPageUrl } from '@/utils';

const slides = [
  {
    id: 'hero',
    title: 'TEACH ONCE.\nREUSE FOREVER.',
    subtitle: 'Slash AI tokens by 95% and put YOU back in the driver\'s seat.',
    stats: [
      { value: '95%', label: 'FEWER TOKENS', sublabel: 'SLASH COSTS' },
      { value: '12x', label: 'FASTER EXECUTION', sublabel: 'BOOST SPEED' }
    ],
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6965a6091a36eddac5b365a6/139cdd326_ucp_graphic_with_qr.png',
    bgGradient: 'from-[#ea00ea]/20 via-[#2699fe]/15 to-transparent'
  },
  {
    id: 'problem',
    title: 'The AI Cost Crisis',
    subtitle: 'Every prompt costs money. Every token adds up. Every delay hurts productivity.',
    points: [
      { icon: DollarSign, text: 'AI costs spiraling out of control', color: 'red' },
      { icon: Clock, text: 'Slow execution killing momentum', color: 'orange' },
      { icon: Brain, text: 'Repetitive prompting wastes time', color: 'yellow' }
    ],
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6965a6091a36eddac5b365a6/9e365383c_Gemini_Generated_Image_s6gdi2s6gdi2s6gd.png',
    bgGradient: 'from-red-500/10 via-orange-500/10 to-transparent'
  },
  {
    id: 'solution',
    title: 'Universal Command Protocol',
    subtitle: 'The breakthrough that changes everything.',
    features: [
      { icon: Zap, title: '95% Token Reduction', desc: 'Compress prompts into efficient instruction packets', color: 'magenta' },
      { icon: Rocket, title: '12x Faster Execution', desc: 'Pre-optimized commands execute at lightning speed', color: 'blue' },
      { icon: Shield, title: 'Platform Agnostic', desc: 'Works with ChatGPT, Claude, Grok, and more', color: 'green' },
      { icon: Cpu, title: 'Teach Once, Use Forever', desc: 'Build reusable command libraries', color: 'warm' }
    ],
    bgGradient: 'from-[#ea00ea]/15 via-[#2699fe]/10 to-[#4bce2a]/10'
  },
  {
    id: 'how-it-works',
    title: 'How It Works',
    subtitle: 'Three steps to AI efficiency.',
    steps: [
      { number: '01', title: 'Create UCP Packets', desc: 'Package complex instructions into compact, reusable formats' },
      { number: '02', title: 'Deploy Anywhere', desc: 'Use across ChatGPT, Claude, Grok, and any AI platform' },
      { number: '03', title: 'Scale Infinitely', desc: 'Build your library of commands and share across teams' }
    ],
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6965a6091a36eddac5b365a6/ccde35ac1_ChatGPTImageJan1202601_38_18AM.png',
    bgGradient: 'from-[#4bce2a]/15 via-[#2699fe]/10 to-transparent'
  },
  {
    id: 'proof',
    title: 'The Numbers Don\'t Lie',
    subtitle: 'Real results from real implementations.',
    metrics: [
      { label: 'Token Reduction', value: '95%', icon: TrendingDown, color: 'text-green-400' },
      { label: 'Speed Increase', value: '12x', icon: Rocket, color: 'text-blue-400' },
      { label: 'Cost Savings', value: '$50K+', icon: DollarSign, color: 'text-[#ea00ea]' },
      { label: 'Time Saved', value: '200hrs', icon: Clock, color: 'text-[#4bce2a]' }
    ],
    testimonial: {
      text: 'UCP transformed how we use AI. We went from spending thousands monthly to hundreds—while executing faster than ever.',
      author: 'Enterprise Client',
      role: 'Fortune 500 Company'
    },
    bgGradient: 'from-[#2699fe]/15 via-[#4bce2a]/10 to-transparent'
  },
  {
    id: 'platform',
    title: 'The SynCloud Ecosystem',
    subtitle: 'More than a protocol—it\'s a complete platform.',
    products: [
      { name: 'GLYTCH', desc: 'Your AI Business Butler', color: 'from-[#ea00ea] to-[#2699fe]' },
      { name: 'LegendDB', desc: 'Voice-Driven Intelligence', color: 'from-[#2699fe] to-[#4bce2a]' },
      { name: 'Cloud QR', desc: 'Physical-Digital Bridge', color: 'from-[#4bce2a] to-[#c4653a]' },
      { name: 'UCP Protocol', desc: 'The Engine Behind It All', color: 'from-[#c4653a] to-[#ea00ea]' }
    ],
    bgGradient: 'from-[#ea00ea]/10 via-[#2699fe]/10 to-[#4bce2a]/10'
  },
  {
    id: 'patent',
    title: 'Protected Innovation',
    subtitle: 'Patent Pending Technology',
    points: [
      'Proprietary compression algorithm',
      'First-to-market AI protocol standard',
      'Intellectual property protection',
      'Future-proof investment'
    ],
    bgGradient: 'from-[#c4653a]/15 via-[#ea00ea]/10 to-transparent'
  },
  {
    id: 'cta',
    title: 'Ready to Transform\nYour AI Operations?',
    subtitle: 'Join the businesses already saving 95% on AI costs.',
    actions: [
      { label: 'Schedule Demo', variant: 'primary', href: '#contact' },
      { label: 'View Full Platform', variant: 'outline', href: createPageUrl('Home') }
    ],
    urgency: 'Limited early adopter pricing available',
    bgGradient: 'from-[#ea00ea]/20 via-[#2699fe]/15 to-[#4bce2a]/10'
  }
];

export default function SalesDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide]);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const slide = slides[currentSlide];

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <>
      <SEOHead 
        title="UCP Sales Deck - Transform Your AI Operations"
        description="Slash AI costs by 95% and boost speed 12x with Universal Command Protocol. Patent-pending technology from Omega UI, LLC."
        keywords="UCP, sales deck, AI efficiency, cost reduction, Universal Command Protocol"
      />

      <div className="fixed inset-0 bg-[#0f0f12] overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className={`absolute inset-0 bg-gradient-to-br ${slide.bgGradient}`}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#0f0f12]/50 to-[#0f0f12]" />
        </div>

        {/* Slide Content */}
        <div className="relative h-full flex flex-col">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-50">
            <motion.div
              className="h-full bg-gradient-to-r from-[#ea00ea] via-[#2699fe] to-[#4bce2a]"
              initial={{ width: 0 }}
              animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex items-center justify-center p-8 md:p-16">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="w-full max-w-6xl"
              >
                <SlideContent slide={slide} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="absolute bottom-8 left-0 right-0 z-50">
            <div className="max-w-6xl mx-auto px-8 flex items-center justify-between">
              {/* Prev Button */}
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all backdrop-blur-xl border border-white/20"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              {/* Slide Indicators */}
              <div className="flex items-center gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide 
                        ? 'w-8 bg-gradient-to-r from-[#ea00ea] to-[#2699fe]' 
                        : 'w-2 bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={nextSlide}
                disabled={currentSlide === slides.length - 1}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all backdrop-blur-xl border border-white/20"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Slide Counter */}
          <div className="absolute bottom-24 left-8 text-white/60 text-sm font-mono z-50">
            {String(currentSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </div>

          {/* Company Logo */}
          <div className="absolute top-8 left-8 z-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Omega UI, LLC</div>
                <div className="text-white/60 text-xs">UCP Technology</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SlideContent({ slide }) {
  if (slide.id === 'hero') {
    return (
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] mb-8"
        >
          {slide.title.split('\n').map((line, i) => (
            <div key={i}>
              <span className="bg-gradient-to-r from-[#ea00ea] via-[#ff00ff] to-[#2699fe] bg-clip-text text-transparent">
                {line}
              </span>
            </div>
          ))}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto"
        >
          {slide.subtitle}
        </motion.p>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {slide.stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="relative p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10"
            >
              <div className="text-6xl md:text-7xl font-black bg-gradient-to-r from-[#ea00ea] to-[#2699fe] bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-xl font-bold text-white mb-1">{stat.label}</div>
              <div className="text-sm text-white/60">{stat.sublabel}</div>
            </motion.div>
          ))}
        </div>

        {slide.image && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="relative max-w-4xl mx-auto"
          >
            <img src={slide.image} alt="UCP Graphic" className="w-full rounded-2xl shadow-2xl" />
          </motion.div>
        )}
      </div>
    );
  }

  if (slide.id === 'problem') {
    return (
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            {slide.title}
          </h2>
          <p className="text-xl text-white/70 mb-8">{slide.subtitle}</p>
          <div className="space-y-6">
            {slide.points.map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
              >
                <div className={`w-12 h-12 rounded-xl bg-${point.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                  <point.icon className={`w-6 h-6 text-${point.color}-400`} />
                </div>
                <p className="text-lg text-white/80 pt-2">{point.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        {slide.image && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <img src={slide.image} alt="Problem Visual" className="w-full rounded-2xl" />
          </motion.div>
        )}
      </div>
    );
  }

  if (slide.id === 'solution') {
    return (
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-black text-white mb-4"
        >
          {slide.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-white/70 mb-12"
        >
          {slide.subtitle}
        </motion.p>
        <div className="grid md:grid-cols-2 gap-6">
          {slide.features.map((feature, i) => {
            const colorMap = {
              magenta: 'from-[#ea00ea] to-[#ea00ea]/70',
              blue: 'from-[#2699fe] to-[#2699fe]/70',
              green: 'from-[#4bce2a] to-[#4bce2a]/70',
              warm: 'from-[#c4653a] to-[#c4653a]/70'
            };
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-left"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorMap[feature.color]} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/70">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  if (slide.id === 'how-it-works') {
    return (
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">{slide.title}</h2>
          <p className="text-xl text-white/70 mb-8">{slide.subtitle}</p>
          <div className="space-y-6">
            {slide.steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex gap-6"
              >
                <div className="text-5xl font-black text-white/10">{step.number}</div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-white/70">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        {slide.image && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <img src={slide.image} alt="How It Works" className="w-full rounded-2xl" />
          </motion.div>
        )}
      </div>
    );
  }

  if (slide.id === 'proof') {
    return (
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-black text-white mb-4"
        >
          {slide.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-white/70 mb-12"
        >
          {slide.subtitle}
        </motion.p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {slide.metrics.map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
            >
              <metric.icon className={`w-12 h-12 mx-auto mb-4 ${metric.color}`} />
              <div className="text-4xl font-black text-white mb-2">{metric.value}</div>
              <div className="text-sm text-white/60">{metric.label}</div>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-3xl mx-auto p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
        >
          <p className="text-2xl text-white/90 italic mb-6">"{slide.testimonial.text}"</p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ea00ea] to-[#2699fe]" />
            <div className="text-left">
              <div className="text-white font-bold">{slide.testimonial.author}</div>
              <div className="text-white/60 text-sm">{slide.testimonial.role}</div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (slide.id === 'platform') {
    return (
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-black text-white mb-4"
        >
          {slide.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-white/70 mb-12"
        >
          {slide.subtitle}
        </motion.p>
        <div className="grid md:grid-cols-2 gap-6">
          {slide.products.map((product, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 group hover:scale-105 transition-transform"
            >
              <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${product.color} flex items-center justify-center shadow-lg`}>
                <Layers className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-black text-white mb-2">{product.name}</h3>
              <p className="text-white/70">{product.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.id === 'patent') {
    return (
      <div className="text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-[#c4653a] to-[#ea00ea] flex items-center justify-center"
        >
          <Shield className="w-12 h-12 text-white" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-6xl font-black text-white mb-4"
        >
          {slide.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl text-[#ea00ea] font-bold mb-12"
        >
          {slide.subtitle}
        </motion.p>
        <div className="grid md:grid-cols-2 gap-4">
          {slide.points.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10"
            >
              <CheckCircle2 className="w-6 h-6 text-[#4bce2a] flex-shrink-0" />
              <span className="text-white text-left">{point}</span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.id === 'cta') {
    return (
      <div className="text-center max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight"
        >
          {slide.title.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl text-white/80 mb-4"
        >
          {slide.subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ea00ea]/20 border border-[#ea00ea]/30 text-[#ea00ea] font-bold mb-12"
        >
          <Clock className="w-4 h-4" />
          {slide.urgency}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          {slide.actions.map((action, i) => (
            <a
              key={i}
              href={action.href}
              className={`
                px-10 py-5 rounded-full text-lg font-bold transition-all
                ${action.variant === 'primary' 
                  ? 'bg-gradient-to-r from-[#ea00ea] to-[#2699fe] text-white shadow-2xl shadow-[#ea00ea]/30 hover:scale-105' 
                  : 'border-2 border-white/30 text-white hover:bg-white/10'
                }
              `}
            >
              {action.label}
            </a>
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-white/40 text-sm"
        >
          Omega UI, LLC • ucp.omegaui.com • Patent Pending
        </motion.div>
      </div>
    );
  }

  return null;
}