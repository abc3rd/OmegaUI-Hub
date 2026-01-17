import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Zap, TrendingDown, Gauge, BarChart3, GitCompare, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Landing() {
  const features = [
    { icon: TrendingDown, title: "Token Savings", description: "Track and optimize token usage with before/after comparisons" },
    { icon: Zap, title: "Energy Monitoring", description: "Measure or estimate energy consumption for AI inference" },
    { icon: Gauge, title: "Performance Metrics", description: "Monitor latency, throughput, and model efficiency" },
    { icon: BarChart3, title: "Visual Analytics", description: "Beautiful charts and insights for your AI workflows" },
    { icon: GitCompare, title: "UCP Comparisons", description: "Compare baseline runs against UCP-optimized workflows" },
  ];

  const benefits = [
    "Reduce AI inference costs by 40-60% with UCP",
    "Lower energy consumption and carbon footprint",
    "Identify inefficient workflows and models",
    "Share comparison reports with stakeholders",
    "Track improvements over time with detailed analytics"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <a 
              href="https://ucp.omegaui.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Learn more about Universal Command Protocol (UCP)
            </a>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 pb-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/50">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-6xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              Cloud Counter
            </h1>
            <p className="text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Monitor, Report, and Optimize Energy Usage for AI Workflows
            </p>
            <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
              Powered by the Universal Command Protocol (UCP) - dramatically reduce tokens, energy, and costs while maintaining quality.
            </p>
            
            <div className="flex gap-4 justify-center">
              <Link to={createPageUrl("Dashboard")}>
                <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-lg shadow-emerald-500/50 text-lg px-8 py-6">
                  Open Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl("Methodology")}>
                <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800 text-lg px-8 py-6">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 backdrop-blur-md p-6 hover:bg-slate-800/70 transition-all">
                <feature.icon className="w-10 h-10 text-emerald-400 mb-4" />
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 backdrop-blur-md">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Why Aura Energy?</h2>
            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-300">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* UCP Link */}
          <div className="text-center mt-12">
            <a 
              href="https://ucp.omegaui.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300"
            >
              <ExternalLink className="w-5 h-5" />
              Visit the Universal Command Protocol website
            </a>
          </div>

          {/* Stats Preview */}
          <div className="grid md:grid-cols-4 gap-6 mt-16">
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-6 text-center">
              <p className="text-4xl font-bold text-emerald-400 mb-2">60%</p>
              <p className="text-slate-300">Token Reduction</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/20 rounded-xl p-6 text-center">
              <p className="text-4xl font-bold text-cyan-400 mb-2">45%</p>
              <p className="text-slate-300">Energy Saved</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20 rounded-xl p-6 text-center">
              <p className="text-4xl font-bold text-purple-400 mb-2">2.3x</p>
              <p className="text-slate-300">Faster Response</p>
            </div>
            <div className="bg-gradient-to-br from-pink-500/20 to-pink-500/5 border border-pink-500/20 rounded-xl p-6 text-center">
              <p className="text-4xl font-bold text-pink-400 mb-2">100%</p>
              <p className="text-slate-300">Quality Maintained</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}