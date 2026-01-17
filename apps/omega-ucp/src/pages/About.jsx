import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowRight, Building2, Target, Zap, Shield, Globe } from 'lucide-react';

export default function About() {
  const colors = {
    purple: '#ea00ea',
    blue: '#2699fe',
    green: '#4bce2a',
    dark: '#3c3c3c',
    bg: '#0b0b10',
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0b10] text-gray-900 dark:text-white transition-colors">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Home')} className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f4efdc3458d09380ec104/9be157a01_UCPlogowithgeometricshield.png"
                alt="UCP Logo"
                className="h-10"
              />
            </Link>
            <Link
              to={createPageUrl('UCPSimulator')}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-black"
              style={{ background: `linear-gradient(90deg, ${colors.green}, ${colors.blue})` }}
            >
              Try Demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-4xl px-4 py-16 md:px-8 md:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-2 text-xs text-gray-700 dark:text-white/80 backdrop-blur mb-6">
              <Building2 className="h-4 w-4" style={{ color: colors.purple }} />
              About Omega UI
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-gray-900 dark:text-white">
              Rethinking AI workflows from the ground up
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-white/70 max-w-3xl mx-auto">
              Omega UI is building Universal Command Protocol (UCP) — a patent-pending intent layer 
              that transforms ambiguous AI prompts into deterministic, auditable execution packets.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-8 backdrop-blur">
              <Target className="h-8 w-8 mb-4" style={{ color: colors.blue }} />
              <h2 className="text-2xl font-black mb-4 text-gray-900 dark:text-white">Our Mission</h2>
              <p className="text-gray-600 dark:text-white/70 leading-relaxed">
                We believe AI workflows waste billions of tokens describing work that deterministic 
                systems can execute. UCP decouples AI reasoning from execution, creating a portable 
                intent layer that works across any AI provider. Our goal is to make AI workflows 
                efficient, auditable, and cost-effective at enterprise scale.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-8 backdrop-blur">
              <Zap className="h-8 w-8 mb-4" style={{ color: colors.green }} />
              <h2 className="text-2xl font-black mb-4 text-gray-900 dark:text-white">The Problem We Solve</h2>
              <p className="text-gray-600 dark:text-white/70 leading-relaxed">
                Current AI systems burn excessive tokens, produce inconsistent outputs, and lack 
                auditability. Enterprises struggle with costs, compliance, and reliability. UCP 
                solves this by compiling natural language into stable packets that expand into 
                deterministic steps — drastically reducing tokens, latency, and cost.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
          <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-8 md:p-12 backdrop-blur">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-8 w-8" style={{ color: colors.purple }} />
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Our Technology</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: colors.blue }}>Intent Compilation</h3>
                <p className="text-sm text-gray-600 dark:text-white/70">
                  Converts natural language into compact UCP packets using proprietary rule-based 
                  compilation with deterministic code emission.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: colors.purple }}>Detokenization</h3>
                <p className="text-sm text-gray-600 dark:text-white/70">
                  Expands UCP codes into deterministic execution steps using a command dictionary, 
                  ensuring consistent outputs across runs.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: colors.green }}>Cross-Platform</h3>
                <p className="text-sm text-gray-600 dark:text-white/70">
                  UCP packets are portable — paste into any AI system or integrate directly into 
                  your infrastructure for automated execution.
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 rounded-2xl bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-5 w-5" style={{ color: colors.green }} />
                <h3 className="font-bold text-gray-900 dark:text-white">Patent Pending IP</h3>
              </div>
              <p className="text-sm text-white/70">
                UCP is proprietary intellectual property under Omega UI, LLC with patent-pending 
                status. Our technology represents a fundamental shift in how AI systems process 
                and execute commands.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
          <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-8 backdrop-blur text-center">
            <h2 className="text-2xl font-black mb-4 text-gray-900 dark:text-white">Omega UI, LLC</h2>
            <p className="text-gray-600 dark:text-white/70 mb-6 max-w-2xl mx-auto">
              An AI technology company focused on building infrastructure for deterministic AI workflows. 
              Founded to solve the efficiency, cost, and reliability challenges facing enterprise AI deployments.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to={createPageUrl('UCPSimulator')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-black"
                style={{ background: `linear-gradient(90deg, ${colors.blue}, ${colors.purple})` }}
              >
                Try UCP Demo <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to={createPageUrl('Home')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
          <div className="text-center text-xs text-gray-500 dark:text-white/45">
            © {new Date().getFullYear()} Omega UI, LLC • Universal Command Protocol (UCP) • Patent Pending
          </div>
        </div>
      </footer>
    </div>
  );
}