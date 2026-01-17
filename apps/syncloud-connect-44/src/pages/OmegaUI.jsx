import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Shield, 
  Scale, 
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Globe,
  Lock,
  Award
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import SEOHead from '@/components/seo/SEOHead';
import HeroSection from '@/components/ui/HeroSection';
import SectionTitle from '@/components/ui/SectionTitle';
import GlassCard from '@/components/ui/GlassCard';
import FeatureCard from '@/components/ui/FeatureCard';
import GradientButton from '@/components/ui/GradientButton';

const governance = [
  {
    icon: Scale,
    title: 'Ethical Leadership',
    description: 'Committed to responsible AI development and transparent business practices.',
    color: 'magenta'
  },
  {
    icon: Shield,
    title: 'Security First',
    description: 'Enterprise-grade security and data protection at every level.',
    color: 'blue'
  },
  {
    icon: Users,
    title: 'User Focused',
    description: 'Every decision is made with our users and their success in mind.',
    color: 'green'
  },
  {
    icon: Globe,
    title: 'Global Vision',
    description: 'Building technology that serves businesses worldwide.',
    color: 'warm'
  }
];

const trustItems = [
  {
    icon: Lock,
    title: 'Data Protection',
    description: 'Your data is encrypted, protected, and never shared without explicit consent.'
  },
  {
    icon: CheckCircle2,
    title: 'Compliance',
    description: 'Adherence to industry standards and regulatory requirements.'
  },
  {
    icon: Award,
    title: 'Quality Assurance',
    description: 'Rigorous testing and continuous improvement across all products.'
  }
];

export default function OmegaUI() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Omega UI, LLC",
    "description": "The corporate entity behind SynCloud Connect platform.",
    "url": "https://syncloud.connect",
    "logo": "/logo.png",
    "foundingDate": "2024",
    "sameAs": [],
    "owns": {
      "@type": "SoftwareApplication",
      "name": "SynCloud Connect"
    }
  };

  return (
    <>
      <SEOHead 
        title="Omega UI, LLC - The Company Behind SynCloud Connect"
        description="Omega UI, LLC is the corporate entity behind SynCloud Connect, committed to ethical leadership, security, and innovation in business technology."
        keywords="Omega UI, SynCloud Connect, corporate, company, governance, trust"
        structuredData={structuredData}
      />

      {/* Hero */}
      <HeroSection
        title="Omega UI, LLC"
        subtitle="The Company Behind SynCloud"
        description="Omega UI, LLC is the corporate entity responsible for the vision, development, and stewardship of the SynCloud Connect platform."
        primaryCta={{ label: 'Explore Platform', href: createPageUrl('Home') }}
        secondaryCta={{ label: 'Meet GLYTCH', href: createPageUrl('Glytch') }}
      />

      {/* Governance */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <SectionTitle
            subtitle="Governance"
            title="Principled Leadership"
            description="Our commitment to ethical business practices guides everything we do."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {governance.map((item, index) => (
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

      {/* Platform Stewardship */}
      <section className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider uppercase rounded-full bg-gradient-to-r from-[#ea00ea]/10 to-[#2699fe]/10 text-[#ea00ea]">
                  Platform Stewardship
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-[#3c3c3c] mb-6 leading-tight">
                  Guardians of Innovation
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  As the steward of SynCloud Connect, Omega UI, LLC is responsible for the 
                  continuous development, security, and evolution of the platform.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  We invest in research, maintain rigorous quality standards, and ensure 
                  that our technology serves the real needs of modern businesses.
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
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center shadow-2xl">
                    <Building2 className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-[#3c3c3c] mb-3">Omega UI, LLC</h3>
                    <p className="text-gray-600 mb-6">Building the Future of Business Technology</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#ea00ea]/10 text-[#ea00ea]">Innovation</span>
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#2699fe]/10 text-[#2699fe]">Security</span>
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#4bce2a]/10 text-[#4bce2a]">Trust</span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust and Compliance */}
      <section className="py-24 bg-gradient-to-br from-[#3c3c3c] to-[#2a2a2a] text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-[#ea00ea]/10 blur-3xl" />
          <div className="absolute bottom-1/4 left-0 w-96 h-96 rounded-full bg-[#2699fe]/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative">
          <SectionTitle
            subtitle="Trust & Compliance"
            title="Your Trust is Our Foundation"
            description="We take our responsibility to protect and serve our users seriously."
            className="text-white [&_h2]:text-white [&_p]:text-gray-300 [&_span]:bg-white/10 [&_span]:text-white"
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {trustItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Patent Pending */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-8 md:p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#c4653a] to-[#ea00ea] flex items-center justify-center shadow-xl">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#3c3c3c] mb-3">
                Intellectual Property
              </h3>
              <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto mb-6">
                Omega UI, LLC holds pending patents on key innovations within the SynCloud Connect 
                platform, including the Universal Command Protocol (UCP). We are committed to 
                protecting our innovations while advancing the industry as a whole.
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
            <Sparkles className="w-12 h-12 mx-auto mb-6 text-[#ea00ea]" />
            <h2 className="text-3xl md:text-4xl font-bold text-[#3c3c3c] mb-4">
              Explore What We've Built
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Discover the SynCloud Connect platform and see how our technology can transform your business.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <GradientButton href={createPageUrl('Home')} size="lg" icon={ArrowRight}>
                Explore Platform
              </GradientButton>
              <GradientButton href={createPageUrl('Glytch')} variant="outline" size="lg">
                Meet GLYTCH
              </GradientButton>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}