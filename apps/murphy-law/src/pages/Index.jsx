import React, { useState } from 'react';
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
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-[#71D6B5]/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-[#c61c39] blur-3xl opacity-20 rounded-full"></div>
                <h1 className="text-7xl font-bold text-[#c61c39] relative drop-shadow-[0_0_20px_rgba(198,28,57,0.5)]">
                  UCRASH
                </h1>
              </div>
            </div>
            <p className="text-2xl text-[#030101] mb-2">Murphy - AI Legal Aid Volunteer</p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
              Your AI assistant providing support for legal matters - Always consult with a licensed attorney
            </p>
            <div className="bg-[#c61c39]/10 border border-[#c61c39]/50 rounded-lg p-4 max-w-3xl mx-auto">
              <p className="text-[#c61c39] text-sm font-semibold mb-2">⚖️ IMPORTANT LEGAL DISCLAIMER</p>
              <p className="text-[#c61c39]/90 text-xs leading-relaxed">
                Murphy is an AI legal aid volunteer, NOT a licensed attorney. Information provided is for educational purposes only 
                and does not constitute legal advice. Always consult with a qualified attorney for legal decisions.
              </p>
            </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white backdrop-blur-sm border-2 border-[#c61c39]/30 rounded-xl p-6 hover:border-[#c61c39] hover:scale-105 transition-all shadow-lg">
            <MessageSquare className="w-12 h-12 text-[#c61c39] mb-4" />
            <h3 className="text-xl font-semibold text-[#030101] mb-2">24/7 Availability</h3>
            <p className="text-gray-600">Murphy is always available to provide legal information and guidance</p>
          </div>

          <div className="bg-white backdrop-blur-sm border-2 border-[#155EEF]/30 rounded-xl p-6 hover:border-[#155EEF] hover:scale-105 transition-all shadow-lg">
            <FileText className="w-12 h-12 text-[#155EEF] mb-4" />
            <h3 className="text-xl font-semibold text-[#030101] mb-2">Murphy's Law</h3>
            <p className="text-gray-600">Comprehensive legal documentation and form management system</p>
          </div>

          <div className="bg-white backdrop-blur-sm border-2 border-[#71D6B5]/30 rounded-xl p-6 hover:border-[#71D6B5] hover:scale-105 transition-all shadow-lg">
            <Shield className="w-12 h-12 text-[#71D6B5] mb-4" />
            <h3 className="text-xl font-semibold text-[#030101] mb-2">Legal Aid Volunteer</h3>
            <p className="text-gray-600">AI-powered assistance - not a replacement for licensed legal counsel</p>
          </div>
        </div>

        {/* Chat Start Form */}
        <div className="max-w-2xl mx-auto bg-white backdrop-blur-sm border-2 border-[#c61c39]/30 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-[#030101] mb-6 text-center">Start Session with Murphy</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#030101] mb-2">Your Name</label>
              <Input
                placeholder="Enter your full name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="bg-gray-50 border-[#155EEF]/30 text-[#030101] placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#030101] mb-2">Email Address</label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="bg-gray-50 border-[#155EEF]/30 text-[#030101] placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#030101] mb-2">I am a</label>
              <Select value={clientType} onValueChange={setClientType}>
                <SelectTrigger className="bg-gray-50 border-[#155EEF]/30 text-[#030101]">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="attorney">Attorney</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#030101] mb-2">Case Reference (Optional)</label>
              <Input
                placeholder="Enter case number or reference"
                value={caseReference}
                onChange={(e) => setCaseReference(e.target.value)}
                className="bg-gray-50 border-[#155EEF]/30 text-[#030101] placeholder:text-gray-400"
              />
            </div>

            <Button
              onClick={handleStart}
              disabled={!clientName || !clientEmail || !clientType}
              className="w-full bg-gradient-to-r from-[#c61c39] to-[#155EEF] hover:from-[#c61c39]/90 hover:to-[#155EEF]/90 text-white font-semibold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Session with Murphy
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            All conversations are recorded and timestamped for documentation purposes
          </p>
        </div>
      </div>
    </div>
  );
}