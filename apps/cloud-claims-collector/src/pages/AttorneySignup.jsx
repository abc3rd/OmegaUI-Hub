import React, { useState } from 'react';
import { CheckCircle, Award, Users, TrendingUp, Shield, DollarSign, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AttorneySignup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    firmName: '',
    state: '',
    yearsExp: '',
    specialties: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [submittedEmails, setSubmittedEmails] = useState(new Set());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check for duplicate submission in current session
    if (submittedEmails.has(formData.email.toLowerCase())) {
      setError('This email has already been submitted. Please contact us at 1-888-692-6211 if you need assistance.');
      setLoading(false);
      return;
    }

    try {
      // Create Attorney record in database
      await base44.entities.Attorney.create({
        law_firm_name: formData.firmName,
        practice_areas: formData.specialties,
        licensing_state: formData.state,
        years_experience: parseInt(formData.yearsExp) || 0,
        capacity_status: 'available',
        bio: `${formData.firstName} ${formData.lastName} - ${formData.specialties}`,
        email: formData.email,
        phone: formData.phone
      });

      // Try to create GHL contact (optional)
      try {
        await base44.functions.invoke('createGHLContact', {
          contactData: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            tags: ['Attorney Member', 'New Signup', 'u-CRA$H Directory', `State: ${formData.state}`],
            customFields: [
              { key: 'attorney.firm_name', value: formData.firmName },
              { key: 'attorney.location', value: formData.state },
              { key: 'attorney.years_exp', value: formData.yearsExp },
              { key: 'attorney.specialties', value: formData.specialties },
              { key: 'contact.source', value: 'u-CRA$H Attorney Signup' }
            ]
          }
        });
      } catch (ghlError) {
        console.warn('GHL sync failed:', ghlError);
      }

      setSubmittedEmails(prev => new Set([...prev, formData.email.toLowerCase()]));
      setSuccess(true);
    } catch (err) {
      setError('An error occurred. Please try again or call 1-888-692-6211.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen gradient-bg">
      <style>{`
        .gradient-bg {
          background: linear-gradient(135deg, 
            #00c7ad 0%, 
            #27a6ff 25%,
            #ffc600 50%, 
            #ff7b2b 75%,
            #00c7ad 100%);
          background-size: 400% 400%;
          animation: gradientShift 20s ease infinite;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Header */}
      <header className="border-b-2 border-[#71D6B5] shadow-lg" style={{ backgroundColor: '#E2E8F0' }}>
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691be92ffa93cfd887f03662/8740d5677_background-ucrash-999kb.png" 
            alt="UCRASH Logo - We Get You Cash" 
            className="h-16 w-auto"
          />
          <div className="flex items-center gap-3">
            <a
              href="https://links.abcdashboard.com/widget/form/Kz0XoGSPFIzyav3t7aGM"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#71D6B5] text-white rounded-full text-sm font-bold hover:bg-[#5fc4a3] transition-all shadow-lg animate-pulse"
            >
              🚀 Quick Form
            </a>
            <a
              href="https://links.abcdashboard.com/qr/Hz9JhDFmE-3n"
              target="_blank"
              rel="noopener noreferrer"
              title="Scan QR Code"
            >
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691be92ffa93cfd887f03662/c680ed68b_QR-ucrashcampaign1.png"
                alt="UCRASH QR Code"
                className="w-12 h-12 hover:scale-110 transition-transform"
              />
            </a>
          </div>
          </div>
          </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-600">
            Join America's Premier Attorney Directory
          </h1>
          <p className="text-2xl text-gray-700 mb-8">
            Get exclusive access to pre-qualified accident victims actively seeking legal representation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Benefits */}
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Why Join u-CRA$H?</h2>
            
            <div className="space-y-4">
              {[
                { icon: <Users className="w-8 h-8" />, title: 'Pre-Qualified Leads', desc: 'AI-powered intake screens cases before they reach you', omega: true },
                { icon: <Shield className="w-8 h-8" />, title: 'Verified Directory', desc: 'Stand out as a verified, trusted attorney', omega: true },
                { icon: <TrendingUp className="w-8 h-8" />, title: '24/7 Lead Generation', desc: 'Our platform never sleeps, capturing leads around the clock', omega: true },
                { icon: <DollarSign className="w-8 h-8" />, title: 'Transparent Pricing', desc: 'Simple monthly subscription, no hidden fees or case percentages', omega: false },
                { icon: <Award className="w-8 h-8" />, title: 'Professional Portal', desc: 'Manage leads, update your profile, track statistics', omega: true }
              ].map((benefit, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-600 hover:scale-105 transition-transform">
                  <div className="flex items-start gap-4">
                    <div className="text-orange-600">{benefit.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 text-gray-800 flex items-center gap-2">
                        {benefit.title}
                        {benefit.omega && (
                          <span className="text-xs px-2 py-1 bg-gradient-to-r from-[#00c7ad] to-[#27a6ff] text-white rounded-full">Ω Powered</span>
                        )}
                      </h3>
                      <p className="text-gray-600">{benefit.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-br from-blue-600 to-orange-600 rounded-2xl p-8 mt-8 text-white">
              <h3 className="text-3xl font-bold mb-4">Simple Pricing</h3>
              <div className="text-5xl font-black mb-2">$299<span className="text-2xl font-normal">/month</span></div>
              <p className="text-xl mb-4">or $2,999/year (save 2 months!)</p>
              <ul className="space-y-2">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Unlimited profile updates</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Dedicated lead dashboard</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> 24/7 platform access</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> No case percentage fees</li>
              </ul>
            </div>
          </div>

          {/* Signup Form */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            {success ? (
              <div className="text-center py-12">
                <CheckCircle className="w-24 h-24 text-green-600 mx-auto mb-6" />
                <h3 className="text-3xl font-bold mb-4 text-gray-800">Application Submitted!</h3>
                <p className="text-xl text-gray-600 mb-6">
                  Thank you for your interest in joining u-CRA$H. Our team will review your application and contact you within 24 hours.
                </p>
                <p className="text-gray-600">
                  Questions? Call us at <a href="tel:18886926211" className="text-blue-600 font-bold">1-888-692-6211</a>
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Apply Now</h2>
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
                    <label className="block text-sm font-bold mb-2 text-gray-700">Law Firm Name *</label>
                    <input
                      type="text"
                      name="firmName"
                      value={formData.firmName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Florida, Texas"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">Years of Experience *</label>
                    <input
                      type="text"
                      name="yearsExp"
                      value={formData.yearsExp}
                      onChange={handleChange}
                      required
                      placeholder="e.g., 15+"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">Specialties *</label>
                    <textarea
                      name="specialties"
                      value={formData.specialties}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Car Accidents, Truck Accidents, Motorcycle Accidents"
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

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
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </button>

                  <p className="text-sm text-gray-600 text-center">
                    By submitting, you agree to be contacted about your application.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-white py-16 px-4 border-t-4 border-[#71D6B5]" style={{ backgroundColor: '#E2E8F0' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 flex flex-col md:flex-row items-center justify-center gap-8">
            <a
              href="https://links.abcdashboard.com/widget/form/Kz0XoGSPFIzyav3t7aGM"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-12 py-5 bg-gradient-to-r from-[#71D6B5] to-[#155EEF] text-white rounded-full text-xl font-black hover:scale-110 transition-transform shadow-2xl"
            >
              🚀 SEND US YOUR FIRST CLIENT
            </a>
            <a
              href="https://links.abcdashboard.com/qr/Hz9JhDFmE-3n"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2"
            >
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691be92ffa93cfd887f03662/c680ed68b_QR-ucrashcampaign1.png"
                alt="UCRASH QR Code"
                className="w-32 h-32 hover:scale-105 transition-transform bg-white p-2 rounded-lg shadow-lg"
              />
              <span className="text-sm font-semibold text-gray-700">Scan for Quick Access</span>
            </a>
          </div>
          <div className="text-center mb-8">
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
          
          <div className="text-center text-sm text-gray-600">
            <p>&copy; 2025 u-CRA$H. All Rights Reserved. A Service of Omega UI, LLC</p>
          </div>
        </div>
      </footer>
    </div>
  );
}