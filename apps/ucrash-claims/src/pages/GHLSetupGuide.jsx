import React from 'react';
import { CheckCircle, AlertCircle, ArrowRight, Copy, ExternalLink, Mail, Phone } from 'lucide-react';

export default function GHLSetupGuide() {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20">
          
          {/* Header */}
          <div className="text-center mb-12" style={{ backgroundColor: '#E2E8F0', padding: '2rem', borderRadius: '1.5rem', marginBottom: '3rem' }}>
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              u-CRA$H GoHighLevel Backend Setup Guide
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Complete step-by-step instructions for configuring your GHL application backend
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-6 rounded-r-xl mb-8">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-orange-500 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-orange-900 dark:text-orange-200 mb-2">CRITICAL: Business Model Reminder</h3>
                <p className="text-orange-800 dark:text-orange-300 text-sm">
                  This is an <strong>attorney advertising platform</strong>, NOT a lawyer referral service. 
                  Attorneys pay subscription fees to be listed. We do NOT take a percentage of case fees. 
                  Your GHL configuration must reflect this advertising model.
                </p>
              </div>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-indigo-900 dark:text-indigo-200">📋 Table of Contents</h2>
            <ol className="space-y-2 text-indigo-800 dark:text-indigo-300">
              <li>1. GHL Custom Fields Setup</li>
              <li>2. Membership Portal Configuration</li>
              <li>3. Forms Creation (Attorney Profile & Lead Forms)</li>
              <li>4. Opportunity Pipeline Setup</li>
              <li>5. Workflows Configuration</li>
              <li>6. Dynamic Profile Integration</li>
              <li>7. Testing & Deployment</li>
              <li>8. Required Secrets & API Keys</li>
            </ol>
          </div>

          {/* Step 1: Custom Fields */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                1
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">GHL Custom Fields Setup</h2>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-6 mb-4">
              <h3 className="text-xl font-bold mb-4 text-purple-900 dark:text-purple-200">Navigate to: Settings → Custom Fields → Contact Fields</h3>
              
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Create the following custom fields for <strong>Attorney Contact Records</strong>:
                </p>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'attorney.profile_photo_url', type: 'Text', desc: 'URL to attorney photo' },
                      { name: 'attorney.firm_name', type: 'Text', desc: 'Law firm name' },
                      { name: 'attorney.specialties', type: 'Text', desc: 'E.g., "Commercial Truck & Auto Accidents"' },
                      { name: 'attorney.rating', type: 'Text', desc: 'E.g., "★★★★★" or "5"' },
                      { name: 'attorney.years_exp', type: 'Text', desc: 'E.g., "20+"' },
                      { name: 'attorney.recovered_amt', type: 'Text', desc: 'E.g., "$50M+"' },
                      { name: 'attorney.location', type: 'Text', desc: 'E.g., "Tampa, FL"' },
                      { name: 'attorney.public_profile_url', type: 'Text', desc: 'Link to their profile page' },
                      { name: 'attorney.unique_lead_form_id', type: 'Text', desc: 'Their unique GHL form/calendar ID' }
                    ].map((field, index) => (
                      <div key={index} className="border-l-4 border-purple-500 pl-4">
                        <code className="text-sm font-mono bg-purple-100 dark:bg-purple-900/50 px-2 py-1 rounded">
                          {field.name}
                        </code>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Type: {field.type}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {field.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-start bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    <strong>Pro Tip:</strong> Use the "attorney." prefix to keep all attorney-related fields organized and easy to filter.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Step 2: Membership Portal */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                2
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Membership Portal Configuration</h2>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 text-pink-900 dark:text-pink-200">Navigate to: Sites → Membership</h3>
              
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h4 className="font-bold mb-2 text-gray-800 dark:text-white">Create New Membership Product:</h4>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start">
                      <ArrowRight className="w-5 h-5 text-rose-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span><strong>Product Name:</strong> "u-Crash Attorney Portal"</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="w-5 h-5 text-rose-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span><strong>Pricing:</strong> Set monthly/annual subscription pricing (e.g., $299/month or $2,999/year)</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="w-5 h-5 text-rose-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span><strong>Access Level:</strong> Create a new role called "Attorney Member"</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h4 className="font-bold mb-2 text-gray-800 dark:text-white">Portal Pages to Create:</h4>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span><strong>Dashboard:</strong> Overview of leads, statistics</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span><strong>My Profile:</strong> Embed the "Attorney Profile Update Form" (Step 3)</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span><strong>My Leads:</strong> View their assigned opportunities</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span><strong>Billing:</strong> Subscription management</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Step 3: Forms */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                3
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Forms Creation</h2>
            </div>

            <div className="space-y-6">
              {/* Form A */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 text-green-900 dark:text-green-200">
                  Form A: Attorney Profile Update Form
                </h3>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    Navigate to: <strong>Sites → Forms → Create New Form</strong>
                  </p>
                  
                  <h4 className="font-bold mb-2 text-gray-800 dark:text-white">Form Fields (map to custom fields):</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {[
                      'Profile Photo URL',
                      'Firm Name',
                      'Specialties',
                      'Rating (1-5 stars)',
                      'Years of Experience',
                      'Total Recovered',
                      'Location',
                      'Profile URL'
                    ].map((field, index) => (
                      <div key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        {field}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    <strong>Form Submission Action:</strong> Update the CURRENT user's contact record with submitted data. 
                    Embed this form in the "My Profile" page of the Attorney Portal.
                  </p>
                </div>
              </div>

              {/* Form B, C, D */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 text-emerald-900 dark:text-emerald-200">
                  Forms B, C, D...: Attorney-Specific Lead Capture Forms
                </h3>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    For EACH attorney, create a unique lead capture form or calendar:
                  </p>
                  
                  <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start">
                      <span className="font-bold text-teal-600 mr-2">1.</span>
                      <span>Clone the main calendar/form: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">PZcHumEAEH77AdSbkm3k</code></span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold text-teal-600 mr-2">2.</span>
                      <span>Rename it: "John Doe - Lead Intake Form"</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold text-teal-600 mr-2">3.</span>
                      <span>Get the new form/calendar ID</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold text-teal-600 mr-2">4.</span>
                      <span>Save this ID to the attorney's contact record in <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">attorney.unique_lead_form_id</code></span>
                    </li>
                  </ol>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border-l-4 border-amber-500">
                  <p className="text-sm text-amber-900 dark:text-amber-200">
                    <strong>CRITICAL:</strong> You must create a UNIQUE form/calendar for each attorney so that leads can be properly attributed and routed.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Step 4: Pipeline */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                4
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Opportunity Pipeline Setup</h2>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 text-blue-900 dark:text-blue-200">
                Navigate to: Settings → Pipelines → Create New Pipeline
              </h3>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  <strong>Pipeline Name:</strong> "Victim Leads"
                </p>
                
                <h4 className="font-bold mb-2 text-gray-800 dark:text-white">Pipeline Stages:</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { stage: 'New Lead', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200' },
                    { stage: 'Contacted', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' },
                    { stage: 'Appointment Set', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200' },
                    { stage: 'Case Signed', color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' },
                    { stage: 'Case Lost', color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' }
                  ].map((item, index) => (
                    <div key={index} className={`${item.color} rounded-lg p-3 text-center font-semibold text-sm`}>
                      {item.stage}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Step 5: Workflows */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                5
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Workflows Configuration</h2>
            </div>

            <div className="space-y-6">
              {/* Workflow 1 */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 text-orange-900 dark:text-orange-200">
                  Workflow 1: New Attorney-Specific Lead
                </h3>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-3">
                  <div className="border-l-4 border-orange-500 pl-4">
                    <p className="font-bold text-gray-800 dark:text-white">Trigger:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Form Submitted → [Attorney's Unique Lead Form]</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-bold text-gray-800 dark:text-white">Actions:</p>
                    <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      {[
                        'Create/Update Contact (victim\'s details)',
                        'Add Tag: "Lead"',
                        'Add Tag: "Attorney: [Name]" (specific to this attorney)',
                        'Create Opportunity in "Victim Leads" pipeline → Stage: "New Lead"',
                        'Assign Opportunity to [Attorney\'s GHL User Account]',
                        'Send Internal Notification (Email/SMS) to attorney with lead details',
                        'Send Confirmation Email to victim'
                      ].map((action, index) => (
                        <li key={index} className="flex items-start">
                          <span className="font-bold text-orange-600 mr-2">{index + 1}.</span>
                          {action}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg mt-4">
                  <p className="text-sm text-amber-900 dark:text-amber-200">
                    <strong>Important:</strong> Create a separate workflow for EACH attorney's unique form. You can clone this workflow and just change the trigger and attorney assignment.
                  </p>
                </div>
              </div>

              {/* Workflow 2 */}
              <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 text-red-900 dark:text-red-200">
                  Workflow 2: New General Lead (Main Calendar)
                </h3>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-3">
                  <div className="border-l-4 border-red-500 pl-4">
                    <p className="font-bold text-gray-800 dark:text-white">Trigger:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Calendar Appointment Booked → Calendar ID: 
                      <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs ml-2">
                        PZcHumEAEH77AdSbkm3k
                      </code>
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-bold text-gray-800 dark:text-white">Actions:</p>
                    <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      {[
                        'Create/Update Contact (victim\'s details)',
                        'Add Tag: "Lead"',
                        'Add Tag: "General Inquiry"',
                        'Create Opportunity in "Victim Leads" pipeline → Stage: "New Lead"',
                        'Send Internal Notification to Admin (Brad Curry) for manual review and assignment',
                        'Send Confirmation Email to victim'
                      ].map((action, index) => (
                        <li key={index} className="flex items-start">
                          <span className="font-bold text-red-600 mr-2">{index + 1}.</span>
                          {action}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>

              {/* Workflow 3 */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 text-pink-900 dark:text-pink-200">
                  Workflow 3: Attorney Profile Update
                </h3>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-3">
                  <div className="border-l-4 border-pink-500 pl-4">
                    <p className="font-bold text-gray-800 dark:text-white">Trigger:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Form Submitted → "Attorney Profile Update Form"</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-bold text-gray-800 dark:text-white">Actions:</p>
                    <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li className="flex items-start">
                        <span className="font-bold text-pink-600 mr-2">1.</span>
                        Send Internal Notification to Admin: "Attorney [Name] has updated their profile"
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold text-pink-600 mr-2">2.</span>
                        (Optional) Trigger blog post update if using GHL Blog for profiles
                      </li>
                    </ol>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    <strong>Note:</strong> The form submission itself updates the attorney's custom fields automatically. This workflow is primarily for notifications.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Step 6: Dynamic Integration */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                6
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Dynamic Profile Integration</h2>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 text-indigo-900 dark:text-indigo-200">
                Connecting GHL Data to Your Frontend
              </h3>
              
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h4 className="font-bold mb-3 text-gray-800 dark:text-white">Option 1: GHL Blog as Profile Directory (Recommended)</h4>
                  <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start">
                      <span className="font-bold text-indigo-600 mr-2">1.</span>
                      <span>Navigate to: <strong>Sites → Blog</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold text-indigo-600 mr-2">2.</span>
                      <span>For each attorney, create a Blog Post with:
                        <ul className="ml-6 mt-1 space-y-1">
                          <li>• Title: Attorney Name</li>
                          <li>• Content: Profile details pulled from custom fields</li>
                          <li>• Custom Fields: Map all attorney.* fields</li>
                          <li>• Embed their unique lead form at the bottom</li>
                        </ul>
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold text-indigo-600 mr-2">3.</span>
                      <span>Use GHL's Blog RSS feed or API to pull attorney profiles dynamically</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold text-indigo-600 mr-2">4.</span>
                      <span>Display on your frontend using the blog categories/tags</span>
                    </li>
                  </ol>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h4 className="font-bold mb-3 text-gray-800 dark:text-white">Option 2: GHL API Integration (Advanced)</h4>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>Use the GHL API to:</p>
                    <ul className="ml-6 space-y-1">
                      <li>• Fetch all contacts with tag "Attorney Member"</li>
                      <li>• Pull their custom fields (attorney.*)</li>
                      <li>• Dynamically populate the attorney cards on the frontend</li>
                      <li>• Replace the generic calendar with their unique form ID</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h4 className="font-bold mb-3 text-gray-800 dark:text-white">Option 3: Manual Update (Simple Start)</h4>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>For initial deployment:</p>
                    <ul className="ml-6 space-y-1">
                      <li>• Manually update the attorney profile cards in the Index.js file</li>
                      <li>• Replace the <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">PZcHumEAEH77AdSbkm3k</code> calendar ID with each attorney's unique form ID</li>
                      <li>• Schedule regular updates as attorneys join/update profiles</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 7: Testing */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                7
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Testing & Deployment Checklist</h2>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl p-6">
              <div className="space-y-3">
                {[
                  'Create test attorney contact with all custom fields populated',
                  'Verify attorney can log into Membership Portal',
                  'Test Attorney Profile Update Form submission',
                  'Create attorney-specific lead form and get the unique ID',
                  'Test lead form submission and verify workflow triggers',
                  'Confirm lead appears in Victim Leads pipeline',
                  'Verify lead is assigned to correct attorney',
                  'Test notification emails/SMS to attorney',
                  'Test general calendar booking workflow',
                  'Verify admin receives general lead notifications',
                  'Test frontend attorney profile display',
                  'Verify unique lead forms are properly embedded'
                ].map((item, index) => (
                  <div key={index} className="flex items-start bg-white dark:bg-gray-800 rounded-lg p-3">
                    <input 
                      type="checkbox" 
                      className="mt-1 mr-3 w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Step 8: Required Secrets */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                8
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Required Secrets & API Keys</h2>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl p-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-xl mb-6">
                <div className="flex items-start">
                  <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-yellow-900 dark:text-yellow-200 mb-2">STOP: Configure These Before Deployment</h4>
                    <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                      The following API keys and secrets are REQUIRED for full functionality. Set these up in your GHL account and Base44 environment variables.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-l-4 border-red-500">
                  <h4 className="font-bold mb-2 text-gray-800 dark:text-white flex items-center">
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-xs mr-2">REQUIRED</span>
                    GHL API Key
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Used for: Fetching attorney profiles, managing contacts, API integrations
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded text-sm font-mono">
                      GHL_API_KEY
                    </code>
                    <button 
                      onClick={() => copyToClipboard('GHL_API_KEY')}
                      className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Get from: GHL Settings → API → Create New API Key
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-l-4 border-red-500">
                  <h4 className="font-bold mb-2 text-gray-800 dark:text-white flex items-center">
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-xs mr-2">REQUIRED</span>
                    GHL Location ID
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Used for: Identifying your GHL sub-account/location
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded text-sm font-mono">
                      GHL_LOCATION_ID
                    </code>
                    <button 
                      onClick={() => copyToClipboard('GHL_LOCATION_ID')}
                      className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Get from: GHL Settings → Business Profile → Location ID
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-l-4 border-orange-500">
                  <h4 className="font-bold mb-2 text-gray-800 dark:text-white flex items-center">
                    <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs mr-2">RECOMMENDED</span>
                    Webhook Secret
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Used for: Securing webhook endpoints for real-time updates
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded text-sm font-mono">
                      GHL_WEBHOOK_SECRET
                    </code>
                    <button 
                      onClick={() => copyToClipboard('GHL_WEBHOOK_SECRET')}
                      className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Generate a random secret: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">openssl rand -hex 32</code>
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-l-4 border-blue-500">
                  <h4 className="font-bold mb-2 text-gray-800 dark:text-white flex items-center">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs mr-2">OPTIONAL</span>
                    Google Analytics ID
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Currently set to: G-W57L732G6K (update if needed)
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded text-sm font-mono">
                      GOOGLE_ANALYTICS_ID
                    </code>
                    <button 
                      onClick={() => copyToClipboard('GOOGLE_ANALYTICS_ID')}
                      className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Additional Resources */}
          <section className="mb-12">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6">
              <h3 className="text-2xl font-bold mb-4 text-purple-900 dark:text-purple-200">📚 Additional Resources</h3>
              
              <div className="space-y-3">
                <a 
                  href="https://help.gohighlevel.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-white">GoHighLevel Help Center</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Official GHL documentation and tutorials</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-indigo-600" />
                </a>

                <a 
                  href="https://www.youtube.com/c/GoHighLevel" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-white">GHL YouTube Channel</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Video tutorials and walkthroughs</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-red-600" />
                </a>

                <a 
                  href="https://developers.gohighlevel.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-white">GHL API Documentation</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">For advanced integrations</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-green-600" />
                </a>
              </div>
            </div>
          </section>

          {/* Support Contact */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-3">Need Help?</h3>
            <p className="mb-6">Contact the u-CRA$H support team for assistance with your GHL setup</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:email@glytch.cloud"
                className="px-6 py-3 bg-white text-indigo-600 rounded-full font-bold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                <Mail className="w-5 h-5 mr-2" />
                email@glytch.cloud
              </a>
              <a 
                href="tel:18886926211"
                className="px-6 py-3 bg-white text-indigo-600 rounded-full font-bold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                <Phone className="w-5 h-5 mr-2" />
                1-888-692-6211
              </a>
            </div>
          </div>
          
          {/* Omega UI Network Links */}
          <div className="mt-8 p-6 rounded-2xl" style={{ backgroundColor: '#E2E8F0' }}>
            <h3 className="text-xl font-bold mb-4 text-center text-indigo-600">Omega UI, LLC Network</h3>
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
                  className="flex items-center justify-center gap-1 text-gray-600 hover:text-indigo-600 text-sm transition-colors font-medium"
                >
                  {link.name}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}