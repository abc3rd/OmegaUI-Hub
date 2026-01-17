import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Shield, FileText, Clock, Users, CheckCircle, 
  ArrowRight, Camera, Lock, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        // Not logged in
      }
    };
    checkAuth();
  }, []);

  const features = [
    {
      icon: FileText,
      title: "Complete Documentation",
      description: "Step-by-step wizard helps you capture every detail of your incident"
    },
    {
      icon: Camera,
      title: "Evidence Vault",
      description: "Securely store photos, videos, and documents in one place"
    },
    {
      icon: Clock,
      title: "Timeline Reports",
      description: "Generate professional incident reports when you need them"
    },
    {
      icon: Users,
      title: "Professional Help",
      description: "Connect with verified attorneys, clinics, and repair shops when ready"
    },
    {
      icon: Lock,
      title: "Privacy First",
      description: "You control who sees your information and when"
    },
    {
      icon: Shield,
      title: "Compliance Built-In",
      description: "Waiting periods and consent gates ensure proper procedures"
    }
  ];

  const steps = [
    { number: "1", title: "Document", description: "Record incident details while they're fresh" },
    { number: "2", title: "Gather", description: "Upload photos, videos, and documents" },
    { number: "3", title: "Review", description: "Generate comprehensive reports" },
    { number: "4", title: "Connect", description: "Request help when you're ready" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694ab548df9978830eeb95a3/9d98f704c_iwitnesslogo.jpg" 
                alt="iWitness"
                className="h-24 w-auto mb-4"
              />
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-white/90">Patent Pending Technology • Trusted Documentation Platform</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Document Your Accident.
              <br />
              <span className="text-[#ea00ea]">Protect Your Rights.</span>
            </h1>
            
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
              iWitness helps you capture every detail of your incident, store evidence securely, 
              and connect with professionals when you're ready.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Button asChild size="lg" className="bg-[#ea00ea] hover:bg-[#d100d1] text-white gap-2">
                  <Link to={createPageUrl('Dashboard')}>
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="bg-[#ea00ea] hover:bg-[#d100d1] text-white gap-2"
                    onClick={() => base44.auth.redirectToLogin()}
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white/30 text-white hover:bg-white/10"
                    onClick={() => base44.auth.redirectToLogin()}
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How iWitness Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A simple, guided process to document your incident and get help when needed
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#ea00ea] text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive tools to document, store, and manage your accident case
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-slate-700" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Document Your Incident?
            </h2>
            <p className="text-xl text-slate-400 mb-8">
              Start capturing important details while they're fresh. It only takes a few minutes.
            </p>
            <Button 
              size="lg" 
              className="bg-[#ea00ea] hover:bg-[#d100d1] text-white gap-2"
              onClick={() => user ? window.location.href = createPageUrl('IncidentWizard') : base44.auth.redirectToLogin()}
            >
              Start Your Report
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 text-slate-400 mb-8">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#ea00ea]" />
              <span>Secure & Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#ea00ea]" />
              <span>Compliance-First</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#ea00ea]" />
              <span>User-Controlled Sharing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#ea00ea]" />
              <span>No Lead Scraping</span>
            </div>
          </div>
          
          {/* Patent Notice */}
          <div className="text-center border-t border-slate-200 pt-8">
            <p className="text-sm font-medium text-slate-700 mb-2">
              Protected by Patent Pending Technology
            </p>
            <p className="text-xs text-slate-500 mb-6">
              U.S. Patent Application No. [PATENT-1] & [PATENT-2]
            </p>
            
            {/* Omega Ecosystem */}
            <div className="max-w-3xl mx-auto">
              <p className="text-xs font-medium text-slate-600 mb-3">
                Part of the Omega Digital Ecosystem
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
                <a 
                  href="https://omegalegal.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Omega Legal Platform
                </a>
                <span className="text-slate-300">•</span>
                <a 
                  href="https://omegamedical.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Omega Medical Network
                </a>
                <span className="text-slate-300">•</span>
                <a 
                  href="https://omegaconnect.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Omega Connect
                </a>
                <span className="text-slate-300">•</span>
                <a 
                  href="https://omegaclaims.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Omega Claims Management
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}