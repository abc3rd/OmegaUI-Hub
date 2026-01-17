import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b-2 border-[#71D6B5] shadow-lg" style={{ backgroundColor: '#E2E8F0' }}>
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <a href="/">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691be92ffa93cfd887f03662/8740d5677_background-ucrash-999kb.png" 
              alt="UCRASH Logo" 
              className="h-16 w-auto cursor-pointer"
            />
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black text-gray-800 mb-8">Privacy Policy</h1>
        <p className="text-gray-600 mb-4">Last Updated: November 28, 2025</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              U CRASH, operated by Omega UI, LLC ("we," "us," or "our"), is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website ucrash.claims.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Personal Information</h3>
            <p className="text-gray-700 mb-4">
              When you submit a case review request or sign up as a partner, we collect:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Full name</li>
              <li>Phone number</li>
              <li>Email address</li>
              <li>State/Location</li>
              <li>Accident details and injury information</li>
              <li>Insurance information (if provided)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">Automatically Collected Information</h3>
            <p className="text-gray-700 mb-4">
              We automatically collect certain information when you visit our website:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device type</li>
              <li>Pages visited and time spent</li>
              <li>Referring website</li>
              <li>UTM parameters and tracking data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Connect you with attorneys who may be able to assist with your case</li>
              <li>Communicate with you about your inquiry</li>
              <li>Process referral partner applications and payouts</li>
              <li>Improve our website and services</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Information Sharing</h2>
            <p className="text-gray-700 mb-4">
              We may share your information with:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li><strong>Participating Attorneys:</strong> Your case information is shared with attorneys in our network who may be able to assist you</li>
              <li><strong>Service Providers:</strong> Third-party companies that help us operate our business (hosting, analytics, CRM)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
            <p className="text-gray-700 mb-4">
              We do NOT sell your personal information to third parties for their marketing purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Your Rights</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt out of marketing communications</li>
              <li>Withdraw consent for data processing</li>
            </ul>
            <p className="text-gray-700 mb-4">
              To exercise these rights, contact us at contact@omegaui.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Cookies and Tracking</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar tracking technologies to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Remember your preferences</li>
              <li>Analyze website traffic (Google Analytics)</li>
              <li>Track referral sources and campaign performance</li>
              <li>Improve user experience</li>
            </ul>
            <p className="text-gray-700 mb-4">
              You can control cookies through your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Third-Party Links</h2>
            <p className="text-gray-700 mb-4">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to read their privacy policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-700 mb-4">
              Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated "Last Updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              For questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-gray-700">
              <strong>Omega UI, LLC</strong><br />
              2744 Edison Avenue, Unit-7, Suite C-3<br />
              Fort Myers, FL 33916<br />
              Email: contact@omegaui.com<br />
              Phone: 1-888-692-6211
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-4 border-t-4 border-[#71D6B5]" style={{ backgroundColor: '#E2E8F0' }}>
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-xl font-bold mb-4 text-orange-600">Omega UI, LLC Network</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
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
          <p className="text-sm text-gray-600">&copy; 2025 U CRASH. All Rights Reserved. A Service of Omega UI, LLC</p>
        </div>
      </footer>
    </div>
  );
}