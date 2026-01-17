import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function Terms() {
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
        <h1 className="text-4xl font-black text-gray-800 mb-8">Terms of Use</h1>
        <p className="text-gray-600 mb-4">Last Updated: November 28, 2025</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing or using the U CRASH website (ucrash.claims), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Nature of Service</h2>
            <p className="text-gray-700 mb-4">
              <strong>U CRASH IS NOT A LAW FIRM.</strong> U CRASH is an attorney advertising directory operated by Omega UI, LLC. We provide a platform for accident victims to connect with personal injury attorneys who advertise their services on our platform.
            </p>
            <p className="text-gray-700 mb-4">
              We do not provide legal advice, legal representation, or lawyer referral services. The attorneys featured on our platform are independent professionals who pay to advertise their services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">3. No Attorney-Client Relationship</h2>
            <p className="text-gray-700 mb-4">
              Using the U CRASH website, submitting information through our forms, or communicating through our platform does NOT create an attorney-client relationship with U CRASH, Omega UI, LLC, or any attorney until you have signed a formal retainer agreement with a specific attorney.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">4. No Guarantee of Results</h2>
            <p className="text-gray-700 mb-4">
              Past results displayed on this website do not guarantee similar outcomes. Every case is different, and results depend on the specific facts and circumstances of each case. We make no representations or warranties about the outcome of any legal matter.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">5. User Responsibilities</h2>
            <p className="text-gray-700 mb-4">
              You agree to provide accurate and truthful information when using our services. You are responsible for maintaining the confidentiality of any account credentials and for all activities that occur under your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Communications Consent (TCPA)</h2>
            <p className="text-gray-700 mb-4">
              By providing your phone number and submitting information through our platform, you expressly consent to receive telephone calls, text messages (SMS), and emails from U CRASH, Omega UI, LLC, and participating attorneys regarding your inquiry. This includes communications sent via automated technology.
            </p>
            <p className="text-gray-700 mb-4">
              Message and data rates may apply. You may opt out at any time by replying "STOP" to any text message or by contacting us directly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Referral Program</h2>
            <p className="text-gray-700 mb-4">
              Participants in the U CRASH Referral Partner Program agree to refer potential clients ethically and in compliance with all applicable laws. Payouts are subject to verification and approval. U CRASH reserves the right to modify or terminate the referral program at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              U CRASH and Omega UI, LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of our services. Our total liability shall not exceed the amount you paid us, if any, in the twelve months preceding the claim.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Governing Law</h2>
            <p className="text-gray-700 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the State of Florida, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of Lee County, Florida.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              For questions about these Terms, please contact us at:
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