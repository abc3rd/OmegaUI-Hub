import React from 'react';
import { motion } from 'framer-motion';
import { 
  Terminal, 
  Zap, 
  Shield, 
  DollarSign,
  ArrowRight,
  Sparkles,
  Repeat,
  Globe,
  Cpu,
  Leaf,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import SEOHead from '@/components/seo/SEOHead';
import HeroSection from '@/components/ui/HeroSection';
import SectionTitle from '@/components/ui/SectionTitle';
import GlassCard from '@/components/ui/GlassCard';
import FeatureCard from '@/components/ui/FeatureCard';
import GradientButton from '@/components/ui/GradientButton';

const whatItRepresents = [
  {
    icon: Globe,
    title: 'Universal Standard',
    description: 'A consistent approach to AI interaction across all platforms and applications.',
    color: 'magenta'
  },
  {
    icon: Cpu,
    title: 'Protocol-Based',
    description: 'Structured communication that ensures reliability and predictability.',
    color: 'blue'
  },
  {
    icon: Repeat,
    title: 'Reusable Patterns',
    description: 'Build once, deploy everywhere with consistent results.',
    color: 'green'
  },
  {
    icon: Shield,
    title: 'Future-Ready',
    description: 'Designed to evolve with the rapidly changing AI landscape.',
    color: 'warm'
  }
];

const benefits = [
  {
    icon: Zap,
    title: 'Efficiency',
    description: 'Reduce time spent crafting prompts by using optimized, pre-built command structures.'
  },
  {
    icon: CheckCircle2,
    title: 'Consistency',
    description: 'Get predictable, reliable results every time with standardized interactions.'
  },
  {
    icon: DollarSign,
    title: 'Cost Reduction',
    description: 'Minimize token usage and computational overhead through efficient protocols.'
  },
  {
    icon: Leaf,
    title: 'Energy Savings',
    description: 'Lower environmental impact through optimized AI interactions.'
  }
];

const whyChanging = [
  {
    title: 'From Art to Science',
    description: 'Prompt engineering is evolving from an art form to a structured discipline.'
  },
  {
    title: 'Scalability Demands',
    description: 'Businesses need repeatable, consistent AI interactions at scale.'
  },
  {
    title: 'Resource Optimization',
    description: 'The industry is moving toward more efficient use of computational resources.'
  }
];

export default function UCP() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "name": "Universal Command Protocol",
    "alternateName": "UCP",
    "description": "The future of AI interaction—consistent, efficient, and powerful.",
    "about": {
      "@type": "Thing",
      "name": "AI Communication Protocol"
    },
    "author": {
      "@type": "Organization",
      "name": "Omega UI, LLC"
    }
  };

  return (
    <>
      <SEOHead 
        title="Universal Command Protocol (UCP) - The Future of AI Interaction"
        description="UCP represents the future of AI interaction—consistent, efficient, and powerful. Patent pending technology from Omega UI, LLC."
        keywords="Universal Command Protocol, UCP, AI interaction, prompt engineering, AI efficiency, SynCloud"
        structuredData={structuredData}
      />

      {/* Hero */}
      <HeroSection
        title="Universal Command Protocol"
        subtitle="The Future of AI Interaction"
        description="UCP represents a paradigm shift in how humans and machines communicate—bringing consistency, efficiency, and power to every AI interaction."
        primaryCta={{ label: 'Meet GLYTCH', href: createPageUrl('Glytch') }}
        secondaryCta={{ label: 'Explore Platform', href: createPageUrl('Home') }}
      />

      {/* What It Represents */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <SectionTitle
            subtitle="What It Represents"
            title="A New Era of AI Communication"
            description="UCP establishes a foundation for how we interact with artificial intelligence."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whatItRepresents.map((item, index) => (
              <FeatureCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
                color={item.color}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Prompting Is Changing */}
      <section className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider uppercase rounded-full bg-gradient-to-r from-[#c4653a]/10 to-[#ea00ea]/10 text-[#c4653a]">
                  The Shift
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-[#3c3c3c] mb-6 leading-tight">
                  Why Prompting Is Changing
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  The early days of AI interaction were characterized by experimentation—trial and error 
                  to find what works. But as AI becomes central to business operations, this approach 
                  no longer scales.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  UCP represents the natural evolution: from ad-hoc prompting to structured protocols 
                  that deliver consistent, reliable, and efficient results.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                {whyChanging.map((item, index) => (
                  <GlassCard key={item.title} delay={index * 0.1} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c4653a] to-[#ea00ea] flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#3c3c3c] mb-1">{item.title}</h3>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-gradient-to-br from-[#3c3c3c] to-[#2a2a2a] text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-96 h-96 rounded-full bg-[#c4653a]/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full bg-[#ea00ea]/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative">
          <SectionTitle
            subtitle="Benefits"
            title="The UCP Advantage"
            description="Transform your AI interactions from unpredictable experiments to reliable operations."
            className="text-white [&_h2]:text-white [&_p]:text-gray-300 [&_span]:bg-white/10 [&_span]:text-white"
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c4653a] to-[#ea00ea] flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Patent Pending Notice */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-8 md:p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#c4653a] to-[#ea00ea] flex items-center justify-center shadow-xl">
                <Terminal className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#3c3c3c] mb-3">
                Patent Pending Technology
              </h3>
              <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto mb-6">
                The Universal Command Protocol represents pioneering innovation in AI communication. 
                Omega UI, LLC has filed for patent protection on this groundbreaking approach to 
                human-machine interaction.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#c4653a] to-[#ea00ea]" />
                Patent Pending — Universal Command Protocol
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <Sparkles className="w-12 h-12 mx-auto mb-6 text-[#c4653a]" />
            <h2 className="text-3xl md:text-4xl font-bold text-[#3c3c3c] mb-4">
              Experience UCP in Action
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              UCP powers GLYTCH, your Online Business Butler. See how structured AI 
              communication transforms business operations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <GradientButton href={createPageUrl('Glytch')} size="lg" icon={ArrowRight}>
                Meet GLYTCH
              </GradientButton>
              <GradientButton href={createPageUrl('Home')} variant="outline" size="lg">
                Explore Platform
              </GradientButton>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}