import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
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
            <Shield className="w-10 h-10 text-[#0077B6]" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#0077B6] via-[#48CAE4] to-[#F4A261] bg-clip-text text-transparent">
              Privacy Policy
            </h1>
          </div>

          <p className="text-gray-500 mb-8">Last Updated: December 4, 2025</p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-[#030101] mb-3">1. Introduction</h2>
              <p>
                Welcome to GLYTCH ("we," "our," or "us"), operated by Omega UI, LLC under the SynCloud Connect platform. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use 
                our AI-powered services at glytch.cloud and related applications.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#030101] mb-3">2. Information We Collect</h2>
              <p className="mb-2">We may collect the following types of information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Personal Information:</strong> Name, email address, and user type when you create an account or start a session.</li>
                <li><strong>Conversation Data:</strong> Messages, queries, and interactions with GLYTCH for quality assurance and service improvement.</li>
                <li><strong>Usage Data:</strong> Information about how you interact with our services, including timestamps and session data.</li>
                <li><strong>Uploaded Files:</strong> Documents you choose to upload for AI processing.</li>
                <li><strong>Technical Data:</strong> Browser type, device information, and IP address for security purposes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#030101] mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide and maintain our AI assistant services</li>
                <li>To improve and personalize your experience</li>
                <li>For quality assurance and service optimization</li>
                <li>To respond to your inquiries and provide support</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent misuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#030101] mb-3">4. Data Retention</h2>
              <p>
                Conversation data and session information are retained for quality assurance purposes and to improve 
                our services. You may request deletion of your data by contacting us at the information provided below.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#030101] mb-3">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
                over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#030101] mb-3">6. Third-Party Services</h2>
              <p>
                Our services may integrate with third-party AI providers and services. These third parties have their 
                own privacy policies, and we encourage you to review them.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#030101] mb-3">7. Your Rights</h2>
              <p className="mb-2">Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to or restrict processing</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#030101] mb-3">8. Children's Privacy</h2>
              <p>
                Our services are not intended for individuals under the age of 18. We do not knowingly collect 
                personal information from children.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#030101] mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#030101] mb-3">10. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact Omega UI, LLC through the 
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