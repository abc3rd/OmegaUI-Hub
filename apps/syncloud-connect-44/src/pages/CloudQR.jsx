import React from 'react';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Smartphone, 
  Zap, 
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Store,
  Ticket,
  MapPin,
  Package,
  Users,
  BarChart3
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import SEOHead from '@/components/seo/SEOHead';
import HeroSection from '@/components/ui/HeroSection';
import SectionTitle from '@/components/ui/SectionTitle';
import GlassCard from '@/components/ui/GlassCard';
import FeatureCard from '@/components/ui/FeatureCard';
import GradientButton from '@/components/ui/GradientButton';

const useCases = [
  {
    icon: Store,
    title: 'Retail & Products',
    description: 'Product information, reviews, and purchase options instantly accessible.',
    color: 'magenta'
  },
  {
    icon: Ticket,
    title: 'Events & Venues',
    description: 'Ticketing, schedules, and venue information at your fingertips.',
    color: 'blue'
  },
  {
    icon: MapPin,
    title: 'Locations & Spaces',
    description: 'Transform physical locations into interactive digital experiences.',
    color: 'green'
  },
  {
    icon: Package,
    title: 'Logistics & Tracking',
    description: 'Real-time tracking and status updates with a simple scan.',
    color: 'warm'
  }
];

const benefits = [
  {
    icon: Zap,
    title: 'Instant Connection',
    description: 'Bridge the physical-digital gap in milliseconds with zero friction.'
  },
  {
    icon: Users,
    title: 'Enhanced Engagement',
    description: 'Create interactive experiences that captivate and convert.'
  },
  {
    icon: BarChart3,
    title: 'Actionable Analytics',
    description: 'Understand how customers interact with your physical touchpoints.'
  }
];

export default function CloudQR() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Cloud QR",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Cloud",
    "description": "Bridge the physical and digital worlds with intelligent QR experiences.",
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
        title="Cloud QR - Physical to Digital in One Scan"
        description="Cloud QR bridges the physical and digital worlds with intelligent QR experiences. Transform any surface into an interactive touchpoint."
        keywords="Cloud QR, QR code, digital bridge, physical digital, smart QR, SynCloud"
        structuredData={structuredData}
      />

      {/* Hero */}
      <HeroSection
        title="Cloud QR"
        subtitle="Physical to Digital in One Scan"
        description="Transform any physical surface into an intelligent digital touchpoint. Cloud QR bridges worlds with a simple scan."
        primaryCta={{ label: 'Meet GLYTCH', href: createPageUrl('Glytch') }}
        secondaryCta={{ label: 'Explore Platform', href: createPageUrl('Home') }}
      />

      {/* What It Is */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider uppercase rounded-full bg-gradient-to-r from-[#4bce2a]/10 to-[#c4653a]/10 text-[#4bce2a]">
                  What It Is
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-[#3c3c3c] mb-6 leading-tight">
                  More Than Just a QR Code
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Cloud QR isn't your typical QR code generator. It's an intelligent bridge 
                  that connects physical objects and spaces to rich digital experiences.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Whether it's a product on a shelf, a sign in your store, or a ticket to an event, 
                  Cloud QR turns static items into interactive, trackable, and updatable touchpoints.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#4bce2a]/20 to-[#c4653a]/20 rounded-3xl blur-3xl" />
                <GlassCard className="relative p-8 md:p-12 text-center">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-white shadow-xl flex items-center justify-center border-4 border-gray-100">
                    <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-[#4bce2a] to-[#c4653a] flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Smartphone className="w-6 h-6 text-[#4bce2a]" />
                    <div className="h-px w-8 bg-gradient-to-r from-[#4bce2a] to-[#c4653a]" />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-[#4bce2a]"
                    />
                  </div>
                  <p className="text-gray-600 text-sm">Scan to Experience</p>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-4 md:px-6">
          <SectionTitle
            subtitle="Use Cases"
            title="Endless Possibilities"
            description="Cloud QR adapts to any industry and use case, bringing digital intelligence to physical spaces."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((item, index) => (
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

      {/* Benefits */}
      <section className="py-24 bg-gradient-to-br from-[#3c3c3c] to-[#2a2a2a] text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-[#4bce2a]/10 blur-3xl" />
          <div className="absolute bottom-1/4 left-0 w-96 h-96 rounded-full bg-[#c4653a]/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative">
          <SectionTitle
            subtitle="Benefits"
            title="Why Cloud QR?"
            description="Transform how your customers interact with your physical presence."
            className="text-white [&_h2]:text-white [&_p]:text-gray-300 [&_span]:bg-white/10 [&_span]:text-white"
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4bce2a] to-[#c4653a] flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Integrates */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#4bce2a] to-[#c4653a] flex items-center justify-center shadow-xl flex-shrink-0">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-[#3c3c3c] mb-3">
                    Connected to GLYTCH
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Every Cloud QR scan feeds data back to GLYTCH, your Online Business Butler. 
                    This means insights from physical interactions flow seamlessly into your 
                    digital operations—automating follow-ups, updating inventory, and more.
                  </p>
                </div>
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
            <Sparkles className="w-12 h-12 mx-auto mb-6 text-[#4bce2a]" />
            <h2 className="text-3xl md:text-4xl font-bold text-[#3c3c3c] mb-4">
              Ready to Bridge Worlds?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Discover how Cloud QR fits into the complete SynCloud Connect ecosystem.
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