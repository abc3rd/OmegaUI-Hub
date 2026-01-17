import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, AlertCircle, ArrowRight, ArrowLeft, ExternalLink } from 'lucide-react';

export default function ClientIntake() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [utmParams, setUtmParams] = useState({});

  // Capture referral code and UTM parameters from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref') || urlParams.get('referral') || urlParams.get('affiliate') || '';
    setReferralCode(ref);
    
    setUtmParams({
      utm_source: urlParams.get('utm_source') || '',
      utm_medium: urlParams.get('utm_medium') || '',
      utm_campaign: urlParams.get('utm_campaign') || '',
      utm_term: urlParams.get('utm_term') || '',
      utm_content: urlParams.get('utm_content') || ''
    });
  }, []);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    state: '',
    accident_type: 'car',
    accident_date: '',
    injury_occurred: null,
    already_has_attorney: false,
    accident_description: '',
    // Additional qualifying questions
    treatment_received: null,
    police_report_filed: null,
    at_fault: null,
    insurance_contacted: null,
    medical_bills_amount: '',
    lost_work: null,
    // Detailed injury assessment
    injury_types: [],
    pain_level: '',
    hospitalized: null,
    surgery_required: null,
    ongoing_treatment: null,
    disability_impact: null,
    emotional_distress: null
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Check for duplicate leads by phone number
      const existingLeads = await base44.entities.VictimLead.filter({
        phone: formData.phone
      });

      if (existingLeads && existingLeads.length > 0) {
        const existing = existingLeads[0];
        const confirm = window.confirm(
          `We found an existing case submission with this phone number from ${new Date(existing.created_date).toLocaleDateString()}.\n\n` +
          `Status: ${existing.status}\n\n` +
          `Would you like to submit a NEW case anyway?\n\n` +
          `Click OK to submit new case, or Cancel to update existing case.`
        );
        
        if (!confirm) {
          // Update existing lead instead
          await base44.entities.VictimLead.update(existing.id, {
            full_name: formData.full_name,
            email: formData.email || existing.email,
            state: formData.state,
            accident_type: formData.accident_type,
            accident_date: formData.accident_date,
            injury_occurred: formData.injury_occurred,
            already_has_attorney: formData.already_has_attorney,
            accident_description: formData.accident_description,
            notes: `UPDATED: Injuries: ${formData.injury_types.join(', ')}, Pain Level: ${formData.pain_level}/10, Hospitalized: ${formData.hospitalized}, Surgery: ${formData.surgery_required}, Ongoing Treatment: ${formData.ongoing_treatment}, Disability: ${formData.disability_impact}, Emotional Distress: ${formData.emotional_distress}, Medical Bills: ${formData.medical_bills_amount}, Lost Work: ${formData.lost_work}, Police Report: ${formData.police_report_filed}`
          });
          setSuccess(true);
          setLoading(false);
          return;
        }
      }

      await base44.entities.VictimLead.create({
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        state: formData.state,
        accident_type: formData.accident_type,
        accident_date: formData.accident_date,
        injury_occurred: formData.injury_occurred,
        already_has_attorney: formData.already_has_attorney,
        accident_description: formData.accident_description,
        status: 'new',
        source_channel: 'web',
        referral_code: referralCode,
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
        utm_term: utmParams.utm_term,
        utm_content: utmParams.utm_content,
        landing_page_url: window.location.href,
        notes: `Injuries: ${formData.injury_types.join(', ')}, Pain Level: ${formData.pain_level}/10, Hospitalized: ${formData.hospitalized}, Surgery: ${formData.surgery_required}, Ongoing Treatment: ${formData.ongoing_treatment}, Disability: ${formData.disability_impact}, Emotional Distress: ${formData.emotional_distress}, Medical Bills: ${formData.medical_bills_amount}, Lost Work: ${formData.lost_work}, Police Report: ${formData.police_report_filed}${referralCode ? ', Referral: ' + referralCode : ''}`
      });
      setSuccess(true);
    } catch (error) {
      alert('Failed to submit. Please try again or call 1-888-692-6211');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-700 via-gray-500 to-gray-600 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center">
          <CheckCircle className="w-24 h-24 text-green-600 mx-auto mb-6" />
          <h2 className="text-4xl font-black text-gray-800 mb-4">Case Submitted Successfully!</h2>
          <p className="text-xl text-gray-600 mb-6">
            Thank you for submitting your case information. An attorney from our network will review your case and contact you within 24 hours.
          </p>
          <p className="text-gray-600 mb-8">
            Need immediate assistance? Call us at <a href="tel:+18886926211" className="text-blue-600 font-bold">1-888-692-6211</a>
          </p>
          <a
            href="/"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-orange-600 text-white rounded-full text-lg font-bold hover:scale-105 transition-transform"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

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
      <header className="border-b-2 border-orange-500 shadow-lg" style={{ backgroundColor: '#E2E8F0' }}>
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <a href="/">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691be92ffa93cfd887f03662/8740d5677_background-ucrash-999kb.png" 
              alt="UCRASH Logo - We Get You Cash" 
              className="h-16 w-auto cursor-pointer"
            />
          </a>
          <div className="flex items-center gap-3">
            <a
              href="https://links.abcdashboard.com/widget/form/Kz0XoGSPFIzyav3t7aGM"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#71D6B5] text-white rounded-full text-sm font-bold hover:bg-[#5fc4a3] transition-all shadow-lg animate-pulse"
            >
              🚀 Quick Qualifying Form
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

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= num ? 'bg-orange-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {num}
                </div>
                {num < 5 && <div className={`w-16 h-1 ${step > num ? 'bg-orange-600' : 'bg-gray-300'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Personal</span>
            <span>Accident</span>
            <span>Injuries</span>
            <span>Medical</span>
            <span>Review</span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <h1 className="text-3xl font-black text-gray-800 mb-6">
            {step === 1 && "Let's Start With Your Information"}
            {step === 2 && "Tell Us About Your Accident"}
            {step === 3 && "Your Injuries & Condition"}
            {step === 4 && "Medical Treatment & Impact"}
            {step === 5 && "Review & Submit"}
          </h1>

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Full Name *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="John Smith"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    By providing your phone number, you consent to receive calls/texts from U CRASH and partner attorneys. Msg & data rates may apply. Reply STOP to opt out.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">State Where Accident Occurred *</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Florida"
                />
              </div>
            </div>
          )}

          {/* Step 2: Accident Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Type of Accident *</label>
                <select
                  value={formData.accident_type}
                  onChange={(e) => handleChange('accident_type', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="car">Car Accident</option>
                  <option value="truck">Truck Accident</option>
                  <option value="motorcycle">Motorcycle Accident</option>
                  <option value="pedestrian">Pedestrian Accident</option>
                  <option value="bicycle">Bicycle Accident</option>
                  <option value="slip_and_fall">Slip and Fall</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">When Did the Accident Occur? *</label>
                <input
                  type="date"
                  value={formData.accident_date}
                  onChange={(e) => handleChange('accident_date', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Were You Injured? *</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleChange('injury_occurred', true)}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      formData.injury_occurred === true
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('injury_occurred', false)}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      formData.injury_occurred === false
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Was a Police Report Filed? *</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleChange('police_report_filed', true)}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      formData.police_report_filed === true
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('police_report_filed', false)}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      formData.police_report_filed === false
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Brief Description of What Happened *</label>
                <textarea
                  value={formData.accident_description}
                  onChange={(e) => handleChange('accident_description', e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Please describe how the accident happened..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Injury Assessment */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-700">What Type of Injuries Did You Sustain? (Select all that apply)</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Head/Brain Injury',
                    'Neck/Whiplash',
                    'Back/Spine Injury',
                    'Broken Bones',
                    'Cuts/Lacerations',
                    'Bruises/Contusions',
                    'Internal Injuries',
                    'Burns',
                    'Soft Tissue Damage',
                    'Amputation',
                    'Scarring/Disfigurement',
                    'Other'
                  ].map((injury) => (
                    <label key={injury} className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-blue-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.injury_types.includes(injury)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...formData.injury_types, injury]
                            : formData.injury_types.filter(i => i !== injury);
                          handleChange('injury_types', updated);
                        }}
                        className="w-5 h-5"
                      />
                      <span className="text-sm font-semibold text-gray-700">{injury}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">On a scale of 1-10, what is your current pain level?</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.pain_level || 0}
                  onChange={(e) => handleChange('pain_level', e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>No Pain (0)</span>
                  <span className="text-2xl font-bold text-orange-600">{formData.pain_level || 0}</span>
                  <span>Worst Pain (10)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Were You Hospitalized?</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleChange('hospitalized', true)}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      formData.hospitalized === true
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('hospitalized', false)}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      formData.hospitalized === false
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Did You or Will You Require Surgery?</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleChange('surgery_required', 'yes')}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      formData.surgery_required === 'yes'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('surgery_required', 'planned')}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      formData.surgery_required === 'planned'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Planned
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('surgery_required', 'no')}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      formData.surgery_required === 'no'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Are You Currently Receiving Ongoing Treatment?</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleChange('ongoing_treatment', true)}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      formData.ongoing_treatment === true
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('ongoing_treatment', false)}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      formData.ongoing_treatment === false
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Has This Injury Impacted Your Ability to Work or Perform Daily Activities?</label>
                <select
                  value={formData.disability_impact || ''}
                  onChange={(e) => handleChange('disability_impact', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Select impact level...</option>
                  <option value="none">No Impact</option>
                  <option value="minimal">Minimal Impact</option>
                  <option value="moderate">Moderate Impact</option>
                  <option value="significant">Significant Impact</option>
                  <option value="total">Total Disability</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Are You Experiencing Emotional Distress (Anxiety, PTSD, Depression)?</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleChange('emotional_distress', true)}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      formData.emotional_distress === true
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('emotional_distress', false)}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      formData.emotional_distress === false
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Medical Info */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Did You Seek Medical Treatment? *</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleChange('treatment_received', true)}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      formData.treatment_received === true
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('treatment_received', false)}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      formData.treatment_received === false
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Estimated Medical Bills (if known)</label>
                <input
                  type="text"
                  value={formData.medical_bills_amount}
                  onChange={(e) => handleChange('medical_bills_amount', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="$5,000 or Unknown"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Did You Miss Work Due to Injuries? *</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleChange('lost_work', true)}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      formData.lost_work === true
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('lost_work', false)}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      formData.lost_work === false
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Do You Already Have an Attorney? *</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleChange('already_has_attorney', true)}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      formData.already_has_attorney === true
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('already_has_attorney', false)}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      formData.already_has_attorney === false
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {formData.already_has_attorney && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-800">
                    <strong>Note:</strong> If you already have an attorney, they may need to approve any new representation. We recommend consulting with your current attorney first.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Name:</strong> {formData.full_name}</div>
                  <div><strong>Phone:</strong> {formData.phone}</div>
                  <div><strong>Email:</strong> {formData.email || 'Not provided'}</div>
                  <div><strong>State:</strong> {formData.state}</div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Accident Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Type:</strong> {formData.accident_type}</div>
                  <div><strong>Date:</strong> {formData.accident_date}</div>
                  <div><strong>Injury:</strong> {formData.injury_occurred ? 'Yes' : 'No'}</div>
                  <div><strong>Police Report:</strong> {formData.police_report_filed ? 'Yes' : 'No'}</div>
                </div>
                <div className="mt-4">
                  <strong>Description:</strong>
                  <p className="text-gray-700 mt-1">{formData.accident_description}</p>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Injury Assessment</h3>
                <div className="text-sm space-y-2">
                  <div><strong>Injury Types:</strong> {formData.injury_types.join(', ') || 'None selected'}</div>
                  <div><strong>Pain Level:</strong> {formData.pain_level}/10</div>
                  <div><strong>Hospitalized:</strong> {formData.hospitalized ? 'Yes' : 'No'}</div>
                  <div><strong>Surgery:</strong> {formData.surgery_required || 'N/A'}</div>
                  <div><strong>Ongoing Treatment:</strong> {formData.ongoing_treatment ? 'Yes' : 'No'}</div>
                  <div><strong>Disability Impact:</strong> {formData.disability_impact || 'N/A'}</div>
                  <div><strong>Emotional Distress:</strong> {formData.emotional_distress ? 'Yes' : 'No'}</div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Medical Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Treatment:</strong> {formData.treatment_received ? 'Yes' : 'No'}</div>
                  <div><strong>Medical Bills:</strong> {formData.medical_bills_amount || 'Unknown'}</div>
                  <div><strong>Lost Work:</strong> {formData.lost_work ? 'Yes' : 'No'}</div>
                  <div><strong>Has Attorney:</strong> {formData.already_has_attorney ? 'Yes' : 'No'}</div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
                <p className="text-sm text-gray-700 mb-3">
                  <strong>TCPA Consent & Agreement:</strong> By submitting this form, I expressly consent to receive calls, text messages, and emails from U CRASH and its network of attorneys regarding my case at the phone number and email provided, including via automated technology. I understand message and data rates may apply. I can opt out at any time by replying STOP.
                </p>
                <p className="text-sm text-gray-700 mb-3">
                  <strong>Disclaimer:</strong> U CRASH is an attorney advertising directory and is NOT a law firm. Submitting this form does not create an attorney-client relationship. This is not legal advice. Past results do not guarantee future outcomes.
                </p>
                <p className="text-sm text-gray-700">
                  By clicking "Submit Case," I agree to the <a href="/terms" className="text-blue-600 underline" target="_blank">Terms of Use</a> and <a href="/privacy" className="text-blue-600 underline" target="_blank">Privacy Policy</a>.
                </p>
              </div>

              {referralCode && (
                <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>✓ Referral Applied:</strong> {referralCode}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Previous
              </button>
            )}
            
            {step < 5 ? (
              <button
                onClick={nextStep}
                className="ml-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-600 text-white rounded-lg font-semibold hover:scale-105 transition-transform"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="ml-auto px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Case'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-white py-16 px-4 border-t-4 border-[#71D6B5] mt-12" style={{ backgroundColor: '#E2E8F0' }}>
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-12 flex flex-col md:flex-row items-center justify-center gap-8">
            <a
              href="https://links.abcdashboard.com/widget/form/Kz0XoGSPFIzyav3t7aGM"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-12 py-5 bg-gradient-to-r from-[#71D6B5] to-[#155EEF] text-white rounded-full text-xl font-black hover:scale-110 transition-transform shadow-2xl"
            >
              🚀 START YOUR FREE CASE REVIEW
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