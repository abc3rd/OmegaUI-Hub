import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Shield, FileText, Zap } from 'lucide-react';

export default function Index() {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientType, setClientType] = useState('');
  const [caseReference, setCaseReference] = useState('');

  const handleStart = () => {
    if (clientName && clientEmail && clientType) {
      const params = new URLSearchParams({
        name: clientName,
        email: clientEmail,
        type: clientType,
        case: caseReference || ''
      });
      window.location.href = createPageUrl(`Chat?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-[#48CAE4]/10">
      <style>{`
        @keyframes syncloud-breathe {
            0%, 100% { background: linear-gradient(135deg, #0077B6, #48CAE4); }
            25% { background: linear-gradient(135deg, #48CAE4, #00B4D8); }
            50% { background: linear-gradient(135deg, #F4A261, #E9C46A); }
            75% { background: linear-gradient(135deg, #E9C46A, #0077B6); }
        }
        @keyframes syncloud-text {
            0%, 100% { background-position: 0% center; }
            50% { background-position: 100% center; }
        }
        .animate-syncloud-breathe {
            animation: syncloud-breathe 8s ease-in-out infinite;
        }
        .animate-syncloud-text {
            animation: syncloud-text 4s ease-in-out infinite;
        }
      `}</style>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0077B6] via-[#48CAE4] to-[#F4A261] blur-3xl opacity-30 rounded-full"></div>
                <h1 className="text-7xl font-bold bg-gradient-to-r from-[#0077B6] via-[#48CAE4] via-[#F4A261] to-[#E9C46A] bg-clip-text text-transparent bg-[length:200%_auto] animate-syncloud-text relative">
                  GLYTCH
                </h1>
              </div>
            </div>
            <p className="text-2xl text-[#030101] mb-2">Syncloud AI Assistant</p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
              Your AI assistant for various tasks - creative, productive, and helpful
            </p>
            <div className="bg-gradient-to-r from-[#0077B6]/10 via-[#48CAE4]/10 to-[#F4A261]/10 border border-[#48CAE4]/50 rounded-lg p-4 max-w-3xl mx-auto">
              <p className="text-[#48CAE4] text-sm font-semibold mb-2">🔮 AI ASSISTANT</p>
              <p className="text-[#48CAE4]/90 text-xs leading-relaxed">
                GLYTCH is your Syncloud AI assistant. I can help with various tasks including chat, 
                image generation, storyboards, and more. Let's create something amazing together!
              </p>
            </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white backdrop-blur-sm border-2 border-[#0077B6]/30 rounded-xl p-6 hover:border-[#0077B6] hover:scale-105 transition-all shadow-lg">
            <MessageSquare className="w-12 h-12 text-[#0077B6] mb-4" />
            <h3 className="text-xl font-semibold text-[#030101] mb-2">24/7 Availability</h3>
            <p className="text-gray-600">GLYTCH is always available to provide assistance and guidance</p>
          </div>

          <div className="bg-white backdrop-blur-sm border-2 border-[#48CAE4]/30 rounded-xl p-6 hover:border-[#48CAE4] hover:scale-105 transition-all shadow-lg">
            <FileText className="w-12 h-12 text-[#48CAE4] mb-4" />
            <h3 className="text-xl font-semibold text-[#030101] mb-2">Multi-Mode</h3>
            <p className="text-gray-600">Chat, image generation, storyboards, and video concepts</p>
          </div>

          <div className="bg-white backdrop-blur-sm border-2 border-[#F4A261]/30 rounded-xl p-6 hover:border-[#F4A261] hover:scale-105 transition-all shadow-lg">
            <Shield className="w-12 h-12 text-[#F4A261] mb-4" />
            <h3 className="text-xl font-semibold text-[#030101] mb-2">Smart Memory</h3>
            <p className="text-gray-600">GLYTCH learns and remembers to provide personalized assistance</p>
          </div>
        </div>

        {/* Chat Start Form */}
        <div className="max-w-2xl mx-auto bg-white backdrop-blur-sm border-2 border-[#48CAE4]/30 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-[#030101] mb-6 text-center">Start Session with GLYTCH</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#030101] mb-2">Your Name</label>
              <Input
                placeholder="Enter your full name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="bg-gray-50 border-[#48CAE4]/30 text-[#030101] placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#030101] mb-2">Email Address</label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="bg-gray-50 border-[#48CAE4]/30 text-[#030101] placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#030101] mb-2">I am a</label>
              <Select value={clientType} onValueChange={setClientType}>
                <SelectTrigger className="bg-gray-50 border-[#48CAE4]/30 text-[#030101]">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">User</SelectItem>
                  <SelectItem value="attorney">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#030101] mb-2">Project Reference (Optional)</label>
              <Input
                placeholder="Enter project name or reference"
                value={caseReference}
                onChange={(e) => setCaseReference(e.target.value)}
                className="bg-gray-50 border-[#48CAE4]/30 text-[#030101] placeholder:text-gray-400"
              />
            </div>

            <Button
              onClick={handleStart}
              disabled={!clientName || !clientEmail || !clientType}
              className="w-full bg-gradient-to-r from-[#0077B6] via-[#48CAE4] to-[#F4A261] hover:opacity-90 text-white font-semibold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Session with GLYTCH
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
                            All sessions recorded for quality assurance. By continuing, you agree to our{' '}
                            <Link to={createPageUrl('PrivacyPolicy')} className="text-[#48CAE4] hover:underline">Privacy Policy</Link>
                            {' '}and{' '}
                            <Link to={createPageUrl('TermsAndConditions')} className="text-[#48CAE4] hover:underline">Terms and Conditions</Link>.
                          </p>
                          <p className="text-xs text-gray-400 text-center mt-2">
                            Patent Pending
                          </p>
        </div>
      </div>
    </div>
  );
}