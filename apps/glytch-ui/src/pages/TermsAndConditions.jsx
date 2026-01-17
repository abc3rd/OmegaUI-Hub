import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-[#48CAE4]/10 p-6">
      <div className="container mx-auto max-w-4xl">
        <Link to={createPageUrl('Index')}>
          <Button variant="ghost" className="mb-6 text-[#0077B6]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#48CAE4]/30 p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-10 h-10 text-[#0077B6]" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#0077B6] via-[#48CAE4] to-[#F4A261] bg-clip-text text-transparent">
              Terms and Conditions
            </h1>
          </div>

          <p className="text-gray-500 mb-8">Last Updated: December 4, 2025</p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-[#030101] mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using GLYTCH services ("Services") provided by Omega UI, LLC through the SynCloud 
                Connect platform at glytch.cloud, you agree to be bound by these Terms and Conditions. If you do not 
                agree to these terms, please do not use our Services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#030101] mb-3">2. Description of Services</h2>
              <p>
                GLYTCH is an AI-powered intelligent operations butler that provides conversational AI assistance, 
                workflow automation, lead management, and multi-system orchestration services. The Services include 
                chat interactions, image generation, storyboard creation, and document processing capabilities.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#030101] mb-3">3. User Accounts and Registration</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate and complete information when creating an account or starting a session.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You agree to notify us immediately of any unauthorized use of your account.</li>
                <li>You must be at least 18 years old to use our Services.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#030101] mb-3">4. Acceptable Use Policy</h2>
              <p className="mb-2">You agree NOT to use the Services to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Transmit harmful, offensive, or illegal content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Services</li>
                <li>Use the Services for any fraudulent or deceptive purposes</li>
                <li>Reverse engineer or attempt to extract source code</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#030101] mb-3">5. Intellectual Property</h2>
              <p>
                The Services, including all content, features, and functionality, are owned by Omega UI, LLC and are 
                protected by copyright, trademark, patent (Patent Pending), and other intellectual property laws. 
                You may not copy, modify, distribute, or create derivative works without our express written consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#030101] mb-3">6. AI-Generated Content</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>AI-generated responses are provided for informational purposes only.</li>
                <li>We do not guarantee the accuracy, completeness, or reliability of AI outputs.</li>
                <li>You are responsible for reviewing and verifying any AI-generated content before use.</li>
                <li>AI responses should not be considered professional, legal, medical, or financial advice.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#030101] mb-3">7. Quality Assurance</h2>
              <p>
                All conversations and interactions with GLYTCH are recorded and timestamped for quality assurance 
                purposes, service improvement, and to maintain accurate records. By using our Services, you consent 
                to this recording and storage of your interactions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#030101] mb-3">8. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, OMEGA UI, LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE 
                OF THE SERVICES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SERVICES IN 
                THE TWELVE MONTHS PRECEDING THE CLAIM.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#030101] mb-3">9. Disclaimer of Warranties</h2>
              <p>
                THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER 
                EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS 
                FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#030101] mb-3">10. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless Omega UI, LLC and its officers, directors, employees, 
                and agents from any claims, damages, losses, or expenses arising out of your use of the Services 
                or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#030101] mb-3">11. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your access to the Services at any time, with or 
                without cause, and with or without notice. Upon termination, your right to use the Services will 
                immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#030101] mb-3">12. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of Florida, 
                United States, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#030101] mb-3">13. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of any material 
                changes by posting the updated Terms on this page. Your continued use of the Services after 
                changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#030101] mb-3">14. Contact Information</h2>
              <p>
                For questions about these Terms and Conditions, please contact Omega UI, LLC through the 
                SynCloud Connect platform.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-[#48CAE4]/30 text-center">
            <p className="text-sm text-gray-500">© 2025 Omega UI, LLC - SynCloud Connect</p>
            <p className="text-xs text-gray-400 mt-1">GLYTCH Intelligent Operations Butler | Patent Pending</p>
          </div>
        </div>
      </div>
    </div>
  );
}