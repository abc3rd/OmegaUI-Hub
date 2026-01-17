import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Zap, Shield, Cpu } from "lucide-react";

export default function Home() {
  useEffect(() => {
    document.title = "Omega UI - Universal Command Protocol Platform";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#EA00EA]/10 to-[#9D00FF]/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 relative">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-100">
              <Sparkles className="w-4 h-4 text-[#EA00EA]" />
              <span className="text-sm font-medium text-gray-700">Powered by Universal Command Protocol</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-bold text-gray-900 leading-tight">
              Stop Prompting.
              <br />
              <span className="bg-gradient-to-r from-[#EA00EA] to-[#9D00FF] bg-clip-text text-transparent">
                Start Commanding AI.
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Universal Command Protocol (UCP) gives you deterministic control over AI execution. 
              Save tokens, reduce costs, and achieve repeatable, energy-efficient AI performance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link to="/hub">
                <Button className="bg-gradient-to-r from-[#EA00EA] to-[#9D00FF] hover:from-[#9D00FF] hover:to-[#EA00EA] text-white px-8 py-6 text-lg">
                  Explore Apps
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/ucp">
                <Button variant="outline" className="px-8 py-6 text-lg border-2">
                  Learn About UCP
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-r from-[#EA00EA] to-[#9D00FF] rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Deterministic Execution</h3>
            <p className="text-gray-600">
              UCP ensures consistent, repeatable AI outputs through structured command protocols.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-r from-[#4bce2a] to-[#2a9d0f] rounded-lg flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Token Efficiency</h3>
            <p className="text-gray-600">
              Reduce token consumption by up to 70% with optimized command packets.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-r from-[#2962FF] to-[#1e40af] rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Enterprise Ready</h3>
            <p className="text-gray-600">
              Built for scale with secure, reliable infrastructure for mission-critical applications.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="bg-gradient-to-r from-[#EA00EA] to-[#9D00FF] rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your AI Workflow?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of developers leveraging UCP for efficient AI operations.
          </p>
          <Link to="/hub">
            <Button className="bg-white text-[#EA00EA] hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}