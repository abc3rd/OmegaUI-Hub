import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Cloud, 
  Zap, 
  Database, 
  QrCode, 
  Terminal, 
  ArrowRight,
  Sparkles,
  Shield,
  TrendingUp,
  Layers,
  Bot
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import SEOHead from '@/components/seo/SEOHead';
import HeroSection from '@/components/ui/HeroSection';
import SectionTitle from '@/components/ui/SectionTitle';
import GlassCard from '@/components/ui/GlassCard';
import FeatureCard from '@/components/ui/FeatureCard';
import GradientButton from '@/components/ui/GradientButton';

const platformEntities = [
  {
    icon: Bot,
    title: 'GLYTCH',
    description: 'Your Online Business Butler',
    href: createPageUrl('Glytch'),
    color: 'from-[#ea00ea] to-[#2699fe]'
  },
  {
    icon: Database,
    title: 'LegendDatabase',
    description: 'Voice-Driven Business Intelligence',
    href: createPageUrl('LegendDB'),
    color: 'from-[#2699fe] to-[#4bce2a]'
  },
  {
    icon: QrCode,
    title: 'Cloud QR',
    description: 'Physical to Digital in One Scan',
    href: createPageUrl('CloudQR'),
    color: 'from-[#4bce2a] to-[#c4653a]'
  },
  {
    icon: Terminal,
    title: 'UCP',
    description: 'Universal Command Protocol',
    href: createPageUrl('UCP'),
    color: 'from-[#c4653a] to-[#ea00ea]'
  }
];

const benefits = [
  {
    icon: Zap,
    title: 'Efficiency',
    description: 'Streamline operations with unified automation that works across your entire digital ecosystem.',
    color: 'magenta'
  },
  {
    icon: TrendingUp,
    title: 'Cost Reduction',
    description: 'Reduce operational overhead by consolidating tools and automating repetitive tasks.',
    color: 'blue'
  },
  {
    icon: Layers,
    title: 'Simplicity',
    description: 'One platform, one interface, one source of truth for all your business operations.',
    color: 'green'
  },
  {
    icon: Shield,
    title: 'Scalability',
    description: 'Built to grow with your business, from startup to enterprise scale.',
    color: 'warm'
  }
];

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SynCloud Connect",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Cloud",
    "description": "SynCloud Connect unifies data, automation, and AI into a single operational layer for modern businesses.",
    "provider": {
      "@type": "Organization",
      "name": "Omega UI, LLC"
    }
  };

  return (
    <>
      <SEOHead 
        title="SynCloud Connect"
        description="SynCloud Connect unifies data, automation, and AI into a single operational layer for modern businesses. We beat the Cloud, UCP."
        keywords="SynCloud, cloud platform, business automation, AI, data unification, GLYTCH"
        structuredData={structuredData}
      />

      {/* Hero Section */}
      <HeroSection
        title="SynCloud Connect"
        subtitle="We beat the Cloud, UCP"
        description="SynCloud Connect unifies data, automation, and AI into a single operational layer for modern businesses."
        primaryCta={{ label: 'Meet GLYTCH', href: createPageUrl('Glytch') }}
        secondaryCta={{ label: 'Explore Platform', href: '#platform' }}
      />

      {/* Platform Overview */}
      <section id="platform" className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <SectionTitle
            subtitle="Platform Overview"
            title="One Platform, Infinite Possibilities"
            description="Discover the interconnected modules that power the SynCloud ecosystem."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformEntities.map((entity, index) => (
              <Link key={entity.title} to={entity.href}>
                <GlassCard delay={index * 0.1} className="p-6 h-full group cursor-pointer">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${entity.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                    <entity.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#3c3c3c] mb-2 group-hover:text-[#ea00ea] transition-colors">
                    {entity.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{entity.description}</p>
                  <div className="mt-4 flex items-center text-[#ea00ea] font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why SynCloud Exists */}
      <section className="py-24 bg-gradient-to-br from-[#3c3c3c] to-[#2a2a2a] text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#ea00ea]/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#2699fe]/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider uppercase rounded-full bg-white/10 text-[#ea00ea] border border-[#ea00ea]/30">
                Our Mission
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Why SynCloud Exists
              </h2>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8">
                Modern businesses are drowning in disconnected tools, fragmented data, and manual processes. 
                SynCloud Connect was built to solve this—creating a unified operational layer where everything 
                works together seamlessly.
              </p>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                We believe technology should simplify, not complicate. That's why we've built a platform 
                where AI, automation, and data converge to help businesses operate at their best.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Meet GLYTCH CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#ea00ea]/5 via-transparent to-[#2699fe]/5" />
        
        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="max-w-5xl mx-auto">
            <GlassCard className="p-8 md:p-12 lg:p-16">
              <div className="flex flex-col lg:flex-row items-center gap-10">
                <div className="flex-1">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center shadow-2xl shadow-[#ea00ea]/30"
                  >
                    <Bot className="w-12 h-12 md:w-16 md:h-16 text-white" />
                  </motion.div>
                </div>
                <div className="flex-[2] text-center lg:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold text-[#3c3c3c] mb-4">
                    Meet GLYTCH
                  </h2>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    GLYTCH is the central intelligence that operates your digital world. 
                    More than software—it's your online business butler, ready to handle 
                    the complexity so you can focus on what matters.
                  </p>
                  <GradientButton href={createPageUrl('Glytch')} icon={ArrowRight}>
                    Discover GLYTCH
                  </GradientButton>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-4 md:px-6">
          <SectionTitle
            subtitle="Benefits"
            title="Why Businesses Choose SynCloud"
            description="Transform your operations with a platform designed for the modern enterprise."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <FeatureCard
                key={benefit.title}
                icon={benefit.icon}
                title={benefit.title}
                description={benefit.description}
                color={benefit.color}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <Sparkles className="w-12 h-12 mx-auto mb-6 text-[#ea00ea]" />
            <h2 className="text-3xl md:text-4xl font-bold text-[#3c3c3c] mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join the growing number of businesses that have unified their operations with SynCloud Connect.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <GradientButton href={createPageUrl('Glytch')} size="lg" icon={ArrowRight}>
                Get Started
              </GradientButton>
              <GradientButton href={createPageUrl('OmegaUI')} variant="outline" size="lg">
                About Us
              </GradientButton>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}