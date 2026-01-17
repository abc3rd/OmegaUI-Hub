import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Globe, Leaf, ArrowRight, Sparkles, Brain, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
          backgroundSize: '50px 50px',
          transform: `translateY(${scrollY * 0.5}px)`
        }} />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-transparent" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-block mb-6"
          >
            <div className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 backdrop-blur-sm">
              <span className="text-sm font-medium text-purple-300">The Future of Efficient AI</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
          >
            AI is becoming one of the{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
              largest new energy consumers
            </span>{' '}
            on Earth
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            What if we could make AI smarter by making it more efficient?
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              onClick={() => document.getElementById('concept').scrollIntoView({ behavior: 'smooth' })}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-6 text-lg rounded-full group"
            >
              Discover UCP
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <div className="w-6 h-10 border-2 border-slate-600 rounded-full p-1">
              <div className="w-1.5 h-3 bg-purple-400 rounded-full mx-auto animate-pulse" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Problem Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">The Hidden Cost</h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Most AI systems repeat the same thinking... over and over
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'Redundant Processing',
                description: 'AI models recalculate the same interpretations millions of times, wasting computational power.'
              },
              {
                icon: Zap,
                title: 'Growing Energy Use',
                description: 'Data centers running AI consume massive amounts of electricity to repeat identical work.'
              },
              {
                icon: TrendingDown,
                title: 'Diminishing Returns',
                description: 'Bigger models require exponentially more energy without proportional efficiency gains.'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-purple-500/50 transition-all"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl flex items-center justify-center mb-6">
                  <item.icon className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* UCP Concept Section */}
      <section id="concept" className="relative py-32 px-6 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-block mb-6">
              <Sparkles className="w-12 h-12 text-pink-400 mx-auto mb-4" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              Universal Compression Protocol
            </h2>
            <p className="text-2xl text-slate-300 mb-4">A smarter approach to AI efficiency</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-lg border border-purple-500/30 rounded-3xl p-12 md:p-16 mb-12"
          >
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-xl font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-4 text-pink-400">Interpret Once</h3>
                  <p className="text-xl text-slate-300 leading-relaxed">
                    Process a request or concept through the AI model a single time to extract its true meaning.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-xl font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-4 text-pink-400">Reuse the Result</h3>
                  <p className="text-xl text-slate-300 leading-relaxed">
                    Store that interpretation as compressed, reusable knowledge instead of running the model again.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-xl font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-4 text-pink-400">Save Energy</h3>
                  <p className="text-xl text-slate-300 leading-relaxed">
                    Dramatically reduce computational waste by eliminating redundant processing across the system.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-3xl md:text-4xl font-light text-slate-300 leading-relaxed">
              More useful work per watt.<br />
              <span className="text-purple-400 font-semibold">Less unnecessary energy use.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why It Matters</h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              As AI scales across the world, efficiency becomes just as important as intelligence
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {[
              {
                icon: Globe,
                title: 'Global Scale',
                description: 'Every query, every interaction, every AI response consumes resources. Multiply that by billions of users worldwide.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Leaf,
                title: 'Environmental Impact',
                description: 'Reducing AI energy consumption means fewer carbon emissions and a more sustainable technological future.',
                color: 'from-green-500 to-emerald-500'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-slate-600 transition-all"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-12 text-center"
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Technology should help us — not quietly cost the Earth
            </h3>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Efficiency isn't just about speed or cost. It's about building technology that's responsible, sustainable, and aligned with humanity's long-term wellbeing.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              Let's build{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                smarter systems
              </span>
            </h2>
            <p className="text-2xl md:text-3xl text-slate-300 mb-12">
              Not just bigger ones.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={() => document.getElementById('concept').scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-10 py-6 text-lg rounded-full"
              >
                Learn More
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Universal Compression Protocol - Efficient AI',
                      text: 'AI is becoming one of the largest energy consumers on Earth. What if we could make it more efficient? Learn about UCP.',
                      url: 'https://ucp.omegaui.com'
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText('https://ucp.omegaui.com');
                    alert('Link copied to clipboard!');
                  }
                }}
                className="border-2 border-slate-600 hover:border-purple-500 bg-transparent hover:bg-purple-600/10 text-white px-10 py-6 text-lg rounded-full"
              >
                Share This Idea
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-500">
            Universal Compression Protocol — Building efficient AI for a sustainable future
          </p>
          <p className="text-slate-600 mt-2 text-sm">
            ucp.omegaui.com
          </p>
          <div className="mt-6 flex justify-center gap-6 text-sm text-slate-600">
            <span>#SustainableTech</span>
            <span>#GreenAI</span>
            <span>#EnergyEfficiency</span>
            <span>#UCP</span>
          </div>
        </div>
      </footer>
    </div>
  );
}