import React from 'react';
import { CheckCircle, AlertCircle, Code, Database, Shield, Zap, ExternalLink, Lock, Users, FileText } from 'lucide-react';

export default function GHLIntegrationGuide() {
  return (
    <div className="min-h-screen" style={{ background: '#d2d9f7' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Header */}
      <header className="border-b-2 border-orange-500 shadow-lg" style={{ backgroundColor: '#E2E8F0' }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <a href="/">
            <h1 className="text-3xl md:text-4xl font-black text-[#2d4091]">u-CRA$H</h1>
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8">
          <h1 className="text-4xl font-black text-[#2d4091] mb-4">GoHighLevel Integration Guide</h1>
          <p className="text-xl text-gray-700 mb-8">
            Complete setup instructions for connecting your GHL Members Area with u-CRA$H
          </p>

          {/* Critical Overview */}
          <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-lg mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg text-orange-800 mb-2">System Architecture Overview</h3>
                <p className="text-orange-700">
                  This integration creates a secure, HIPAA-compliant attorney-client matching system with automated lead routing, 
                  case tracking, and confidential communication channels.
                </p>
              </div>
            </div>
          </div>

          {/* Step 1: GHL Community Setup */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#2d4091] mb-6 flex items-center gap-3">
              <Users className="w-8 h-8" />
              Step 1: GHL Community/Members Area Setup
            </h2>
            
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">Create Two Separate Communities</h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-600">
                  <h4 className="font-bold text-lg mb-2">1. Attorney Members Area</h4>
                  <ul className="list-disc ml-6 space-y-2 text-gray-700">
                    <li><strong>Access Level:</strong> Attorneys Only (tag: "Attorney Member")</li>
                    <li><strong>Pages Required:</strong>
                      <ul className="list-circle ml-6 mt-2">
                        <li>Dashboard - Lead overview and statistics</li>
                        <li>My Leads - Active cases assigned to them</li>
                        <li>Lead Details - Individual case information with client contact</li>
                        <li>My Profile - Update practice areas, bio, credentials</li>
                        <li>Case Updates - Log progress notes (visible to admin only)</li>
                        <li>Billing - View subscription status</li>
                      </ul>
                    </li>
                    <li><strong>Custom Fields Needed:</strong> attorney.practice_areas, attorney.service_states, attorney.firm_name, attorney.bar_number</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border-l-4 border-green-600">
                  <h4 className="font-bold text-lg mb-2">2. Client Portal (Optional)</h4>
                  <ul className="list-disc ml-6 space-y-2 text-gray-700">
                    <li><strong>Access Level:</strong> Clients/Victims (tag: "Client")</li>
                    <li><strong>Pages Required:</strong>
                      <ul className="list-circle ml-6 mt-2">
                        <li>My Case Status - View assigned attorney and case progress</li>
                        <li>Messages - Secure messaging with their attorney</li>
                        <li>Documents - Upload medical records, police reports</li>
                        <li>Appointments - Schedule consultations</li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Step 2: AI Matching Algorithm */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#2d4091] mb-6 flex items-center gap-3">
              <Zap className="w-8 h-8" />
              Step 2: AI-Powered Attorney Matching System
            </h2>

            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">Matching Criteria & Algorithm</h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-bold mb-2">Primary Matching Factors:</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-blue-600">1. Geographic Match (40 points)</p>
                      <ul className="list-disc ml-6 text-sm text-gray-700">
                        <li>Same state: +40 points</li>
                        <li>Licensed in state: +30 points</li>
                        <li>Adjacent state with reciprocity: +20 points</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-600">2. Case Type Match (30 points)</p>
                      <ul className="list-disc ml-6 text-sm text-gray-700">
                        <li>Primary specialty match: +30 points</li>
                        <li>Secondary specialty: +20 points</li>
                        <li>General practice: +10 points</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-600">3. Case Severity (15 points)</p>
                      <ul className="list-disc ml-6 text-sm text-gray-700">
                        <li>High severity + experienced attorney: +15</li>
                        <li>Moderate case + mid-level attorney: +10</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-600">4. Attorney Capacity (15 points)</p>
                      <ul className="list-disc ml-6 text-sm text-gray-700">
                        <li>Under 10 active cases: +15 points</li>
                        <li>10-20 active cases: +10 points</li>
                        <li>Over 20 cases: +5 points</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-bold mb-2">Implementation Method:</h4>
                  <p className="text-gray-700 mb-3">Create a backend function that:</p>
                  <ol className="list-decimal ml-6 space-y-2 text-gray-700">
                    <li>Triggers when a new VictimLead is created</li>
                    <li>Fetches all attorneys with matching state and practice area</li>
                    <li>Calculates match score for each attorney</li>
                    <li>Assigns lead to top 3 highest-scoring attorneys</li>
                    <li>Sends notification to selected attorneys</li>
                    <li>First attorney to claim the lead gets the case</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* Step 3: Security & Confidentiality */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#2d4091] mb-6 flex items-center gap-3">
              <Shield className="w-8 h-8" />
              Step 3: Security & Confidentiality Measures
            </h2>

            <div className="bg-red-50 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 text-red-800">Critical Security Requirements</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Row-Level Security (RLS)</p>
                    <p className="text-sm text-gray-700">Clients can only see their own cases. Attorneys only see assigned cases. Already configured in VictimLead entity.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Encrypted Communications</p>
                    <p className="text-sm text-gray-700">All messages between clients and attorneys must use GHL's secure messaging or encrypted channels.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">HIPAA Compliance</p>
                    <p className="text-sm text-gray-700">Medical records must be stored in HIPAA-compliant storage. Use GHL's HIPAA-compliant features or integrate with a compliant document storage service.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 4: Tracking System */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#2d4091] mb-6 flex items-center gap-3">
              <FileText className="w-8 h-8" />
              Step 4: Case Tracking System
            </h2>

            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Required Tracking Entities</h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-bold text-green-700 mb-2">CaseProgress Entity</h4>
                  <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`{
  "case_id": "VictimLead ID",
  "attorney_id": "User ID",
  "status": "initial_contact | consultation_scheduled | case_signed | discovery | negotiation | settled",
  "last_update": "date",
  "next_action": "description",
  "medical_visits": [{ "date", "provider", "notes" }],
  "attorney_notes": "private notes",
  "client_responsibilities": ["get medical records", "attend deposition"],
  "documents": ["urls to uploaded docs"]
}`}
                  </pre>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-bold text-green-700 mb-2">ReferralTracking Entity</h4>
                  <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`{
  "referral_partner_id": "ReferralPartner ID",
  "lead_id": "VictimLead ID",
  "status": "pending | qualified | closed",
  "commission_amount": 1000,
  "commission_paid": false,
  "case_outcome": "settled | dismissed | ongoing"
}`}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* Step 5: Implementation Checklist */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#2d4091] mb-6">Implementation Checklist</h2>
            <div className="space-y-3">
              {[
                "Set up GHL Communities (Attorney + Client portals)",
                "Configure GHL API access and webhook endpoints",
                "Create CaseProgress and ReferralTracking entities in Base44",
                "Build attorney matching algorithm backend function",
                "Implement RLS policies for data confidentiality",
                "Create automated notification workflows in GHL",
                "Build case tracking dashboard for attorneys",
                "Set up secure document upload system",
                "Configure billing integration for attorney subscriptions",
                "Test end-to-end flow with sample cases",
                "Train attorneys on platform usage",
                "Launch with pilot group of attorneys"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 bg-white p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Next Steps */}
          <div className="bg-[#2d4091] text-white rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Build This System?</h3>
            <p className="mb-6">This is a complex integration requiring backend development, entity creation, and security configuration.</p>
            <p className="mb-4">Contact us to start implementation:</p>
            <a href="mailto:contact@omegaui.com" className="inline-block px-8 py-3 bg-white text-[#2d4091] rounded-full font-bold hover:scale-105 transition-transform">
              contact@omegaui.com
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-white py-12 px-4 border-t-4 border-orange-600" style={{ backgroundColor: '#E2E8F0' }}>
          <div className="max-w-6xl mx-auto text-center">
            <h3 className="text-xl font-bold mb-4 text-orange-600">Omega UI, LLC Network</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { name: 'Omega UI', url: 'https://www.omegaui.com' },
                { name: 'SynCloud', url: 'https://syncloud.omegaui.com' },
                { name: 'ABC Dashboard', url: 'https://www.ancdashboard.com' },
                { name: 'GLYTCH', url: 'https://glytch.cloud' },
                { name: 'GLYTCH Functions', url: 'https://glytch.cloud/functions' },
                { name: 'QR Generator', url: 'https://qr.omegaui.com' },
                { name: 'UI Tools', url: 'https://ui.omegaui.com' },
                { name: 'Cloud Convert', url: 'https://cloudconvert.omegaui.com' },
                { name: 'Chess', url: 'https://chess.omegaui.com' },
                { name: 'Echo', url: 'https://echo.omegaui.com' }
              ].map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 text-gray-600 hover:text-orange-600 text-sm transition-colors font-medium"
                >
                  {link.name}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}