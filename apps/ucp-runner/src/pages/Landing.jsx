import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Zap, Shield, Clock, Globe, CheckCircle, ArrowRight, 
  Brain, Lock, TrendingUp, Code, Sparkles, Package,
  Activity, Database, Bell, Eye, Award, Rocket,
  ChevronRight, Star, Users, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const stats = [
  { value: '100%', label: 'Deterministic', icon: CheckCircle },
  { value: '<10ms', label: 'Execution Time', icon: Clock },
  { value: 'SHA-256', label: 'Cryptographic', icon: Shield },
  { value: '∞', label: 'Scalability', icon: TrendingUp }
];

const features = [
  {
    icon: Shield,
    title: 'Cryptographic Verification',
    description: 'Every execution generates a SHA-256 hashed receipt. Prove what happened, when, and how.',
    color: 'from-[#EA00EA] to-[#EA00EA]/70'
  },
  {
    icon: Brain,
    title: 'AI-Powered Templates',
    description: 'Build once, reuse forever. Templates cache expensive LLM calls and save tokens on every run.',
    color: 'from-[#EA00EA] to-[#C3C3C3]'
  },
  {
    icon: Lock,
    title: 'HMAC Authentication',
    description: 'Enterprise-grade API keys with permissions, rate limits, and HMAC-SHA256 packet signing.',
    color: 'from-[#C3C3C3] to-[#EA00EA]'
  },
  {
    icon: Activity,
    title: 'Real-Time Monitoring',
    description: 'Watch operations execute live with token counting, cost estimation, and detailed logs.',
    color: 'from-[#EA00EA]/80 to-[#EA00EA]/60'
  },
  {
    icon: Globe,
    title: 'Universal Protocol',
    description: 'HTTP, Storage, LLM, Notifications. One unified format for all your automation needs.',
    color: 'from-[#EA00EA] to-[#EA00EA]/50'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Track token savings, execution patterns, and ROI with comprehensive dashboards.',
    color: 'from-[#C3C3C3] to-[#EA00EA]/70'
  }
];

const useCases = [
  {
    title: 'API Orchestration',
    description: 'Chain multiple API calls with conditional logic and error handling',
    icon: Package,
    metric: '10x faster'
  },
  {
    title: 'AI Workflows',
    description: 'Build complex LLM pipelines with caching and cost optimization',
    icon: Sparkles,
    metric: '80% cost savings'
  },
  {
    title: 'Data Processing',
    description: 'Transform, validate, and route data through multi-step pipelines',
    icon: Database,
    metric: '100% reliable'
  },
  {
    title: 'Notification Systems',
    description: 'Multi-channel alerting with retry logic and delivery confirmation',
    icon: Bell,
    metric: '99.9% uptime'
  }
];

const testimonials = [
  {
    quote: "UCP transformed how we handle AI workflows. The token caching alone saved us $10k/month.",
    author: "Sarah Chen",
    role: "CTO, AI Startup",
    avatar: "💼"
  },
  {
    quote: "Finally, a protocol that makes automation auditable. The cryptographic receipts are game-changing.",
    author: "Marcus Rodriguez",
    role: "DevOps Lead",
    avatar: "🚀"
  },
  {
    quote: "We replaced 5 different tools with UCP. The unified format simplified everything.",
    author: "Emily Watson",
    role: "Engineering Manager",
    avatar: "⚡"
  }
];

export default function Landing() {
  const [activeFeature, setActiveFeature] = useState(0);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-x-hidden">
      {/* Hero Section */}
      <motion.section 
        style={{ opacity, scale }}
        className="relative min-h-screen flex items-center justify-center px-4 py-20"
      >
        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />
        
        {/* Floating Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 right-20 w-96 h-96 bg-[#EA00EA]/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-[#EA00EA]/10 rounded-full blur-3xl"
        />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#EA00EA]/10 to-[#EA00EA]/20 border border-[#EA00EA]/30 rounded-full mb-8"
          >
            <Sparkles className="w-4 h-4 text-[#EA00EA]" />
            <span className="text-sm text-[#C3C3C3] font-medium">Patent Pending Technology</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-[#EA00EA] to-[#C3C3C3] bg-clip-text text-transparent leading-tight"
          >
            Universal Command
            <br />
            Protocol
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            The world's first <span className="text-[#EA00EA] font-semibold">deterministic</span>, 
            <span className="text-[#C3C3C3] font-semibold"> cryptographically verifiable</span> automation protocol.
            Build workflows that prove themselves.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap gap-4 justify-center mb-16"
          >
            <Link to={createPageUrl('Home')}>
              <Button className="bg-gradient-to-r from-[#EA00EA] to-[#EA00EA]/80 hover:from-[#EA00EA]/90 hover:to-[#EA00EA]/70 text-white px-8 py-6 text-lg">
                <Rocket className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
            </Link>
            <Link to={createPageUrl('CommandBuilder')}>
              <Button variant="outline" className="border-slate-600 text-white px-8 py-6 text-lg hover:bg-slate-800">
                <Code className="w-5 h-5 mr-2" />
                View Demo
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
                >
                  <Icon className="w-6 h-6 text-[#EA00EA] mb-2 mx-auto" />
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-white mb-4">Why UCP?</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Built for the future of verifiable automation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-white mb-4">Built for Real-World Use Cases</h2>
            <p className="text-xl text-slate-400">
              From startups to enterprises, UCP powers critical workflows
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {useCases.map((useCase, i) => {
              const Icon = useCase.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/50 rounded-2xl p-8 hover:border-[#EA00EA]/50 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#EA00EA]/20 rounded-xl">
                      <Icon className="w-6 h-6 text-[#EA00EA]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold text-white mb-2">{useCase.title}</h3>
                      <p className="text-slate-400 mb-4">{useCase.description}</p>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
                        <TrendingUp className="w-4 h-4" />
                        {useCase.metric}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-white mb-4">Trusted by Innovators</h2>
            <p className="text-xl text-slate-400">
              See what teams are building with UCP
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gradient-to-br from-[#EA00EA]/10 to-[#EA00EA]/5 border border-[#EA00EA]/20 rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-sm text-slate-400">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specs */}
      <section className="py-20 px-4 bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Technical Excellence</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-[#EA00EA] mb-4">Protocol Features</h3>
              {[
                'SHA-256 cryptographic receipts',
                'HMAC-SHA256 packet signing',
                'Deterministic execution engine',
                'Control flow: conditionals, loops, parallel',
                'Template-based caching system',
                'Real-time operation monitoring'
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-300">{item}</span>
                </motion.div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-[#C3C3C3] mb-4">Integrations</h3>
              {[
                'HTTP/REST API orchestration',
                'LLM providers (OpenAI, Anthropic, etc.)',
                'Local key-value storage',
                'Browser notifications',
                'Data transformation pipelines',
                'Custom driver extensions'
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-300">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-gradient-to-br from-[#EA00EA]/20 via-[#EA00EA]/10 to-[#EA00EA]/5 border border-[#EA00EA]/30 rounded-3xl p-12 backdrop-blur-sm">
            <h2 className="text-5xl font-bold text-white mb-6">
              Ready to Build the Future?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join the revolution in verifiable automation. Start building with UCP today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to={createPageUrl('Home')}>
                <Button className="bg-gradient-to-r from-[#EA00EA] to-[#EA00EA]/80 hover:from-[#EA00EA]/90 hover:to-[#EA00EA]/70 text-white px-10 py-6 text-lg">
                  Get Started Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('Analytics')}>
                <Button variant="outline" className="border-slate-600 text-white px-10 py-6 text-lg hover:bg-slate-800">
                  View Analytics Demo
                  <Eye className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692ff195a5105440a7d0cd82/d4c8621ee_ChatGPTImageJan1202601_38_18AM.png" 
                alt="Omega UI Logo" 
                className="w-12 h-12 rounded-xl"
              />
              <div>
                <div className="text-xl font-bold text-white">UCP Runner</div>
                <div className="text-sm text-[#C3C3C3]">by Omega UI, LLC</div>
              </div>
            </div>
            <div className="flex gap-4">
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" className="text-slate-400 hover:text-white">
                  App
                </Button>
              </Link>
              <Link to={createPageUrl('Analytics')}>
                <Button variant="ghost" className="text-slate-400 hover:text-white">
                  Analytics
                </Button>
              </Link>
              <Link to={createPageUrl('Settings')}>
                <Button variant="ghost" className="text-slate-400 hover:text-white">
                  Settings
                </Button>
              </Link>
            </div>
          </div>
          <div className="text-center text-slate-500 text-sm">
            <p className="mb-1">Patent Pending • © {new Date().getFullYear()} Omega UI, LLC</p>
            <p>Universal Command Protocol - The Future of Verifiable Automation</p>
          </div>
        </div>
      </footer>
    </div>
  );
}