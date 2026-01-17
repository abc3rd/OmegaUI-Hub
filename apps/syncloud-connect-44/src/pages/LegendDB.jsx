import React from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Mic, 
  BarChart3, 
  Lightbulb,
  ArrowRight,
  Sparkles,
  MessageSquare,
  TrendingUp,
  Search,
  Users
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import SEOHead from '@/components/seo/SEOHead';
import HeroSection from '@/components/ui/HeroSection';
import SectionTitle from '@/components/ui/SectionTitle';
import GlassCard from '@/components/ui/GlassCard';
import FeatureCard from '@/components/ui/FeatureCard';
import GradientButton from '@/components/ui/GradientButton';

const whatItIs = [
  {
    icon: Mic,
    title: 'Voice-First Interface',
    description: 'Interact with your business data naturally through conversation.',
    color: 'magenta'
  },
  {
    icon: BarChart3,
    title: 'Intelligent Analytics',
    description: 'Transform raw data into meaningful insights automatically.',
    color: 'blue'
  },
  {
    icon: Search,
    title: 'Smart Discovery',
    description: 'Find the information you need without knowing where to look.',
    color: 'green'
  },
  {
    icon: Users,
    title: 'Team Accessibility',
    description: 'Everyone on your team can access insights, regardless of technical skill.',
    color: 'warm'
  }
];

const whyMatters = [
  {
    title: 'Data Without Barriers',
    description: 'No more complex queries or specialized tools. Just ask questions and get answers.'
  },
  {
    title: 'Real-Time Intelligence',
    description: 'Access current information the moment you need it, not hours or days later.'
  },
  {
    title: 'Actionable Insights',
    description: 'Move from data to decision faster with AI-powered recommendations.'
  }
];

export default function LegendDB() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "LegendDatabase",
    "alternateName": "LegendDB",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Cloud",
    "description": "Voice-Driven Business Intelligence that turns conversations into actionable data.",
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
        title="LegendDatabase - Voice-Driven Business Intelligence"
        description="LegendDatabase turns conversations into actionable data. Access business intelligence through natural voice interactions."
        keywords="LegendDB, LegendDatabase, voice analytics, business intelligence, AI data, SynCloud"
        structuredData={structuredData}
      />

      {/* Hero */}
      <HeroSection
        title="LegendDatabase"
        subtitle="Voice-Driven Business Intelligence"
        description="Turn conversations into actionable intelligence. LegendDB makes your business data accessible to everyone through natural language."
        primaryCta={{ label: 'Meet GLYTCH', href: createPageUrl('Glytch') }}
        secondaryCta={{ label: 'Explore Platform', href: createPageUrl('Home') }}
      />

      {/* What It Is */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <SectionTitle
            subtitle="What It Is"
            title="Business Intelligence, Reimagined"
            description="LegendDatabase breaks down the barriers between you and your data."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whatItIs.map((item, index) => (
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

      {/* Visual Demo Section */}
      <section className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider uppercase rounded-full bg-gradient-to-r from-[#2699fe]/10 to-[#4bce2a]/10 text-[#2699fe]">
                  The Experience
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-[#3c3c3c] mb-6 leading-tight">
                  Ask Questions, Get Answers
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Imagine asking your data "How did we perform last quarter?" and getting a clear, 
                  visual answer in seconds. That's LegendDB.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  No SQL queries. No pivot tables. No waiting for reports. 
                  Just natural conversation with your business intelligence.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
                        <p className="text-gray-700">"Show me our top performing products this month"</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2699fe] to-[#4bce2a] flex items-center justify-center flex-shrink-0">
                        <Database className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gradient-to-br from-[#2699fe]/10 to-[#4bce2a]/10 rounded-2xl rounded-tr-none px-4 py-3">
                        <p className="text-gray-700 mb-3">Here's your top 5 products by revenue...</p>
                        <div className="space-y-2">
                          {[85, 72, 64, 51, 43].map((val, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-20 text-xs text-gray-500">Product {i + 1}</div>
                              <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-[#2699fe] to-[#4bce2a] rounded-full"
                                  style={{ width: `${val}%` }}
                                />
                              </div>
                              <div className="w-8 text-xs text-gray-600">{val}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-24 bg-gradient-to-br from-[#3c3c3c] to-[#2a2a2a] text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#2699fe]/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-[#4bce2a]/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative">
          <SectionTitle
            subtitle="Why It Matters"
            title="Data Should Work For You"
            description="In today's fast-paced business environment, insights shouldn't be locked behind technical barriers."
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
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2699fe] to-[#4bce2a] flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2699fe] to-[#4bce2a] flex items-center justify-center shadow-xl flex-shrink-0">
                  <Lightbulb className="w-10 h-10 text-white" />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-[#3c3c3c] mb-3">
                    Powered by GLYTCH
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    LegendDB is seamlessly integrated with GLYTCH, your Online Business Butler. 
                    This means your voice-driven insights connect directly to your workflows 
                    and automated processes.
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
            <Sparkles className="w-12 h-12 mx-auto mb-6 text-[#2699fe]" />
            <h2 className="text-3xl md:text-4xl font-bold text-[#3c3c3c] mb-4">
              Ready for Legendary Intelligence?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Discover how LegendDB fits into the complete SynCloud Connect ecosystem.
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