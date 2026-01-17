import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  Sparkles, 
  Workflow, 
  Shield, 
  Zap,
  Database,
  QrCode,
  Terminal,
  ArrowRight,
  Brain,
  Clock,
  Users,
  Layers
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import SEOHead from '@/components/seo/SEOHead';
import HeroSection from '@/components/ui/HeroSection';
import SectionTitle from '@/components/ui/SectionTitle';
import GlassCard from '@/components/ui/GlassCard';
import FeatureCard from '@/components/ui/FeatureCard';
import GradientButton from '@/components/ui/GradientButton';

const whatGlytchDoes = [
  {
    icon: Workflow,
    title: 'Orchestrates Workflows',
    description: 'Coordinates complex business processes across multiple systems and platforms seamlessly.',
    color: 'magenta'
  },
  {
    icon: Brain,
    title: 'Intelligent Decisions',
    description: 'Makes smart decisions based on your business rules and real-time data analysis.',
    color: 'blue'
  },
  {
    icon: Clock,
    title: 'Always Available',
    description: 'Works around the clock, ensuring your business never misses an opportunity.',
    color: 'green'
  },
  {
    icon: Users,
    title: 'Team Enablement',
    description: 'Empowers your team with tools and insights to be more productive.',
    color: 'warm'
  }
];

const platformModules = [
  {
    icon: Database,
    title: 'LegendDatabase',
    description: 'Voice-driven business intelligence that turns conversations into actionable data.',
    href: createPageUrl('LegendDB'),
    gradient: 'from-[#2699fe] to-[#4bce2a]'
  },
  {
    icon: QrCode,
    title: 'Cloud QR',
    description: 'Bridge the physical and digital worlds with intelligent QR experiences.',
    href: createPageUrl('CloudQR'),
    gradient: 'from-[#4bce2a] to-[#c4653a]'
  },
  {
    icon: Terminal,
    title: 'Universal Command Protocol',
    description: 'The future of AI interaction—consistent, efficient, and powerful.',
    href: createPageUrl('UCP'),
    gradient: 'from-[#c4653a] to-[#ea00ea]'
  }
];

const whyMatters = [
  {
    icon: Zap,
    title: 'Reduce Complexity',
    description: 'One butler, infinite capabilities. No more juggling multiple tools and interfaces.'
  },
  {
    icon: Shield,
    title: 'Consistent Quality',
    description: 'Every task executed with the same precision and attention to detail.'
  },
  {
    icon: Layers,
    title: 'Unified Experience',
    description: 'All your business operations through a single, intelligent interface.'
  }
];

export default function Glytch() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "GLYTCH Online Butler",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Cloud",
    "description": "GLYTCH is the central intelligence that operates your digital world—your online business butler.",
    "provider": {
      "@type": "Organization",
      "name": "Omega UI, LLC"
    },
    "isPartOf": {
      "@type": "SoftwareApplication",
      "name": "SynCloud Connect"
    }
  };

  return (
    <>
      <SEOHead 
        title="GLYTCH - Your Online Business Butler"
        description="GLYTCH is the central intelligence that operates your digital world. More than software—it's your online business butler."
        keywords="GLYTCH, business butler, AI assistant, automation, SynCloud Connect"
        structuredData={structuredData}
      />

      {/* Hero */}
      <HeroSection
        title="Meet GLYTCH"
        subtitle="Your Online Business Butler"
        description="GLYTCH is the central intelligence that operates your digital world. More than software—it's your butler, orchestrating everything so you don't have to."
        primaryCta={{ label: 'See the Platform', href: createPageUrl('Home') + '#platform' }}
        secondaryCta={{ label: 'Learn About UCP', href: createPageUrl('UCP') }}
      />

      {/* What GLYTCH Is */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider uppercase rounded-full bg-gradient-to-r from-[#ea00ea]/10 to-[#2699fe]/10 text-[#ea00ea]">
                  What is GLYTCH?
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-[#3c3c3c] mb-6 leading-tight">
                  The Intelligence Behind Your Operations
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  GLYTCH isn't just another business tool—it's the central nervous system of your digital operations. 
                  Think of it as having a dedicated butler who understands your business inside and out.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  From coordinating complex workflows to making intelligent decisions based on real-time data, 
                  GLYTCH handles the complexity so you can focus on growth.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#ea00ea]/20 to-[#2699fe]/20 rounded-3xl blur-3xl" />
                <GlassCard className="relative p-8 md:p-12">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center shadow-2xl shadow-[#ea00ea]/30">
                    <Bot className="w-12 h-12 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-[#3c3c3c] mb-3">GLYTCH</h3>
                    <p className="text-gray-600">Online Business Butler</p>
                    <div className="mt-6 flex justify-center gap-2">
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#ea00ea]/10 text-[#ea00ea]">AI-Powered</span>
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#2699fe]/10 text-[#2699fe]">Always On</span>
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#4bce2a]/10 text-[#4bce2a]">Intelligent</span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* What GLYTCH Does */}
      <section className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-4 md:px-6">
          <SectionTitle
            subtitle="Capabilities"
            title="What GLYTCH Does"
            description="A high-level view of how GLYTCH transforms business operations."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whatGlytchDoes.map((item, index) => (
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

      {/* Why GLYTCH Matters */}
      <section className="py-24 bg-gradient-to-br from-[#3c3c3c] to-[#2a2a2a] text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-96 h-96 rounded-full bg-[#ea00ea]/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full bg-[#2699fe]/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative">
          <SectionTitle
            subtitle="The Difference"
            title="Why GLYTCH Matters"
            description="In a world of fragmented tools and overwhelming complexity, GLYTCH brings clarity."
            className="text-white [&_h2]:text-white [&_p]:text-gray-300 [&_span]:bg-white/10 [&_span]:text-white"
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyMatters.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/10 flex items-center justify-center">
                  <item.icon className="w-8 h-8 text-[#ea00ea]" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Modules */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <SectionTitle
            subtitle="Platform Modules"
            title="The GLYTCH Ecosystem"
            description="GLYTCH connects and coordinates these powerful modules to deliver a unified experience."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {platformModules.map((module, index) => (
              <Link key={module.title} to={module.href}>
                <GlassCard delay={index * 0.1} className="p-8 h-full group">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <module.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#3c3c3c] mb-3 group-hover:text-[#ea00ea] transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{module.description}</p>
                  <div className="flex items-center text-[#ea00ea] font-medium text-sm">
                    Learn more <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </GlassCard>
              </Link>
            ))}
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
            <Sparkles className="w-12 h-12 mx-auto mb-6 text-[#ea00ea]" />
            <h2 className="text-3xl md:text-4xl font-bold text-[#3c3c3c] mb-4">
              Ready to Meet Your Butler?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Explore the full SynCloud Connect platform and discover how GLYTCH can transform your operations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <GradientButton href={createPageUrl('Home')} size="lg" icon={ArrowRight}>
                See the Platform
              </GradientButton>
              <GradientButton href={createPageUrl('OmegaUI')} variant="outline" size="lg">
                About Omega UI
              </GradientButton>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}