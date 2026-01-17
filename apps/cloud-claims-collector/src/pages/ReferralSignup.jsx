import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield, DollarSign, Users, TrendingUp, CheckCircle, ExternalLink } from 'lucide-react';

export default function ReferralSignup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'client',
    firmName: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const generateReferralCode = (name, role) => {
    const prefix = role.substring(0, 3).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check for existing partner by email
      const existingByEmail = await base44.entities.ReferralPartner.filter({
        created_by: formData.email
      });

      if (existingByEmail && existingByEmail.length > 0) {
        setError('An account with this email already exists. Please contact us at 1-888-692-6211 if you need assistance.');
        setLoading(false);
        return;
      }

      const referralCode = generateReferralCode(formData.lastName, formData.role);
      const referralLink = `${window.location.origin}/?ref=${referralCode}`;

      // Create ReferralPartner record first (primary action)
      await base44.entities.ReferralPartner.create({
        role: formData.role,
        firm_name: formData.firmName,
        referral_code: referralCode,
        referral_link: referralLink,
        status: 'pending',
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone
      });

      // Try to create GHL contact (optional - don't block on failure)
      try {
        await base44.functions.invoke('createGHLContact', {
          contactData: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            tags: ['Referral Partner', `Role: ${formData.role}`, 'u-CRA$H Partner Program'],
            customFields: [
              { key: 'partner.role', value: formData.role },
              { key: 'partner.firm_name', value: formData.firmName },
              { key: 'partner.referral_code', value: referralCode },
              { key: 'partner.referral_link', value: referralLink },
              { key: 'contact.source', value: 'u-CRA$H Referral Signup' }
            ]
          }
        });
      } catch (ghlError) {
        // GHL sync failed but partner was created - log but don't block
        console.warn('GHL sync failed:', ghlError);
      }

      setSuccess(true);
    } catch (err) {
      setError('Failed to submit application. Please try again or call 1-888-692-6211.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const roles = [
    { value: 'client', label: 'Client / Friend / Past Victim', icon: '👤' },
    { value: 'lawyer', label: 'Lawyer / Law Firm', icon: '⚖️' },
    { value: 'doctor', label: 'Doctor / Medical Provider', icon: '🏥' },
    { value: 'insurance', label: 'Insurance Agency', icon: '🛡️' },
    { value: 'expert', label: 'Expert Witness / Specialist', icon: '🎓' },
    { value: 'marketer', label: 'Marketing Partner / Lead Generator', icon: '📊' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 via-gray-500 to-gray-600">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .metallic-gradient {
          background: linear-gradient(135deg, #2d4091 0%, #4a5fb5 50%, #2d4091 100%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 8px rgba(0,0,0,0.3);
        }
      `}</style>

      {/* Header */}
      <header className="border-b-2 border-orange-500 shadow-lg" style={{ backgroundColor: '#E2E8F0' }}>
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <a href="/">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691be92ffa93cfd887f03662/8740d5677_background-ucrash-999kb.png" 
              alt="u-CRA$H Logo" 
              className="h-16 w-auto cursor-pointer"
            />
          </a>
          <a
            href="https://links.abcdashboard.com/widget/form/Kz0XoGSPFIzyav3t7aGM"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#71D6B5] text-white rounded-full text-sm font-bold hover:bg-[#5fc4a3] transition-all shadow-lg animate-pulse"
          >
            🚀 Quick Qualifying Form
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6 px-8 py-4 metallic-gradient rounded-full">
            <h1 className="text-5xl md:text-6xl font-black text-white flex items-center gap-3">
              <DollarSign className="w-12 h-12" />
              Earn $1,000 Per Qualified Case
            </h1>
          </div>
          <p className="text-2xl text-gray-700 mb-4">
            Join the u-CRA$H Referral Partner Program
          </p>
          <p className="text-xl text-gray-600">
            Help accident victims find justice and earn generous bonuses for every qualified referral
          </p>
        </div>

        {!success ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Benefits Section */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-800">How It Works</h2>
              
              <div className="space-y-6">
                {[
                  {
                    step: '1',
                    icon: <Users className="w-8 h-8" />,
                    title: 'Sign Up as a Partner',
                    desc: 'Choose your role and create your free account. Get approved within 24 hours.'
                  },
                  {
                    step: '2',
                    icon: <Shield className="w-8 h-8" />,
                    title: 'Share Your Unique Link',
                    desc: 'Receive your personal referral code and tracking link. Share via social, email, or in person.'
                  },
                  {
                    step: '3',
                    icon: <TrendingUp className="w-8 h-8" />,
                    title: 'Track Your Referrals',
                    desc: 'Watch leads come in through your dashboard. See real-time status updates.'
                  },
                  {
                    step: '4',
                    icon: <DollarSign className="w-8 h-8" />,
                    title: 'Get Paid',
                    desc: 'Earn $1,000 when a case is qualified. Monthly payouts via direct deposit or check.'
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-600">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 metallic-gradient rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {item.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-orange-600">{item.icon}</div>
                          <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
                        </div>
                        <p className="text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-gradient-to-br from-blue-600 to-orange-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Partner Benefits</h3>
                <ul className="space-y-3">
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Unlimited earning potential</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Real-time dashboard tracking</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Monthly direct deposits</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Marketing materials provided</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Dedicated partner support</li>
                </ul>
              </div>
            </div>

            {/* Signup Form */}
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">Become a Partner</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">I am a... *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.icon} {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                {(formData.role === 'lawyer' || formData.role === 'doctor' || formData.role === 'insurance') && (
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">
                      {formData.role === 'lawyer' ? 'Law Firm Name' : 
                       formData.role === 'doctor' ? 'Clinic/Practice Name' : 
                       'Agency Name'}
                    </label>
                    <input
                      type="text"
                      name="firmName"
                      value={formData.firmName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-800">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-orange-600 text-white rounded-full text-lg font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Join Partner Program'}
                </button>

                <p className="text-sm text-gray-600 text-center">
                  By submitting, you agree to our <a href="/terms" className="text-blue-600 underline" target="_blank">Partner Terms</a> and <a href="/privacy" className="text-blue-600 underline" target="_blank">Privacy Policy</a>. You consent to receive calls/texts regarding your partner application. Reply STOP to opt out.
                </p>
              </form>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-12 shadow-2xl text-center">
            <CheckCircle className="w-24 h-24 text-green-600 mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-4 text-gray-800">Application Submitted!</h3>
            <p className="text-xl text-gray-600 mb-6">
              Thank you for joining the u-CRA$H Referral Partner Program. Our team will review your application and contact you within 24 hours with your unique referral code and tracking link.
            </p>
            <p className="text-gray-600 mb-8">
              Questions? Call us at <a href="tel:18886926211" className="text-blue-600 font-bold">1-888-692-6211</a>
            </p>
            <a
              href="/"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-orange-600 text-white rounded-full text-lg font-bold hover:scale-105 transition-transform"
            >
              Return to Home
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-white py-16 px-4 border-t-4 border-orange-600 mt-12" style={{ backgroundColor: '#E2E8F0' }}>
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-12">
            <a
              href="https://links.abcdashboard.com/qr/Hz9JhDFmE-3n"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691be92ffa93cfd887f03662/c680ed68b_QR-ucrashcampaign1.png"
                alt="UCRASH QR Code"
                className="w-40 h-40 mx-auto hover:scale-105 transition-transform bg-white p-3 rounded-lg shadow-2xl"
              />
            </a>
            <p className="text-gray-700 font-semibold mt-4">Scan QR Code for Quick Access</p>
          </div>
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
          <p className="text-sm text-gray-600">&copy; 2025 u-CRA$H. All Rights Reserved. A Service of Omega UI, LLC</p>
        </div>
      </footer>
    </div>
  );
}