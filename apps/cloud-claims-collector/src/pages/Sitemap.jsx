import React from 'react';
import { ExternalLink, FileText, Map } from 'lucide-react';

export default function Sitemap() {
  const baseUrl = 'https://ucrash.claims';
  
  const pages = [
    {
      path: '/',
      name: 'Home',
      title: 'U CRASH - Find a Car Accident Attorney Near You | America\'s Premier Attorney Directory',
      description: 'Find, compare, and connect with top-rated personal injury lawyers nationwide. Free case reviews, 24/7 support, and proven results.',
      keywords: 'car accident attorney, personal injury lawyer, accident lawyer near me, auto accident attorney, truck accident lawyer, motorcycle accident attorney, slip and fall lawyer, injury lawyer, free case review, legal help, attorney directory, find lawyer, accident victims, compensation, settlement',
      priority: '1.0',
      changefreq: 'daily'
    },
    {
      path: '/ClientIntake',
      name: 'Client Intake Form',
      title: 'Submit Your Case - Free Case Review | U CRASH',
      description: 'Complete our comprehensive intake form to get matched with a top personal injury attorney. Free, no-obligation case review.',
      keywords: 'case submission, free case review, accident intake form, injury claim, legal consultation, attorney matching, case evaluation, accident report, injury assessment',
      priority: '0.9',
      changefreq: 'weekly'
    },
    {
      path: '/AttorneySignup',
      name: 'Attorney Signup',
      title: 'Join U CRASH Attorney Directory | Get Pre-Qualified Leads',
      description: 'Join America\'s premier attorney directory. Get exclusive access to pre-qualified accident victims actively seeking legal representation.',
      keywords: 'attorney signup, lawyer directory, legal leads, attorney marketing, law firm advertising, personal injury leads, case referrals, attorney network',
      priority: '0.8',
      changefreq: 'monthly'
    },
    {
      path: '/ReferralSignup',
      name: 'Referral Partner Signup',
      title: 'Earn $1,000 Per Qualified Case | U CRASH Referral Program',
      description: 'Become a referral partner and earn $1,000 for every qualified case. Simple signup, transparent tracking, fast payouts.',
      keywords: 'referral program, earn money, case referral, legal referral, partner program, referral bonus, accident referral, injury referral',
      priority: '0.8',
      changefreq: 'monthly'
    },
    {
      path: '/MembersPortal',
      name: 'Members Portal',
      title: 'Attorney Dashboard | U CRASH Members Portal',
      description: 'Access your attorney dashboard, view leads, manage cases, and track statistics.',
      keywords: 'attorney portal, lawyer dashboard, case management, lead management, attorney login, member access',
      priority: '0.7',
      changefreq: 'weekly'
    },
    {
      path: '/AttorneyProfile',
      name: 'Attorney Profiles',
      title: 'View Attorney Profile | U CRASH Directory',
      description: 'View detailed attorney profiles including experience, case results, specialties, and contact information.',
      keywords: 'attorney profile, lawyer bio, attorney experience, case results, legal expertise, attorney reviews',
      priority: '0.7',
      changefreq: 'weekly'
    },
    {
      path: '/ClientPortal',
      name: 'Client Portal',
      title: 'Client Dashboard | Track Your Case | U CRASH',
      description: 'Access your client dashboard to track case status, view appointments, upload documents, and communicate with your attorney.',
      keywords: 'client portal, case tracking, document upload, attorney communication, case status, legal dashboard',
      priority: '0.6',
      changefreq: 'weekly'
    },
    {
      path: '/UserPortal',
      name: 'User Portal',
      title: 'User Dashboard | U CRASH',
      description: 'Access your personalized dashboard to manage case submissions and interact with attorneys.',
      keywords: 'user dashboard, case management, attorney interaction, user account',
      priority: '0.6',
      changefreq: 'weekly'
    },
    {
      path: '/Terms',
      name: 'Terms of Use',
      title: 'Terms of Use | U CRASH',
      description: 'Terms of Use for U CRASH attorney directory. Important legal information about using our services.',
      keywords: 'terms of use, legal terms, user agreement, attorney advertising',
      priority: '0.4',
      changefreq: 'monthly'
    },
    {
      path: '/Privacy',
      name: 'Privacy Policy',
      title: 'Privacy Policy | U CRASH',
      description: 'Privacy Policy for U CRASH. Learn how we collect, use, and protect your personal information.',
      keywords: 'privacy policy, data protection, personal information, TCPA compliance',
      priority: '0.4',
      changefreq: 'monthly'
    },
    {
      path: '/Sitemap',
      name: 'Sitemap',
      title: 'Sitemap | U CRASH',
      description: 'Complete sitemap of U CRASH website with all pages and SEO metadata.',
      keywords: 'sitemap, site map, website structure',
      priority: '0.3',
      changefreq: 'monthly'
    }
  ];

  const generateXMLSitemap = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    return xml;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const xmlSitemap = generateXMLSitemap();

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
          <div className="flex items-center gap-4">
            <Map className="w-6 h-6 text-[#71D6B5]" />
            <span className="text-xl font-bold text-gray-800">Sitemap</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black text-gray-800 mb-4">U CRASH Sitemap</h1>
        <p className="text-gray-600 mb-8">Complete sitemap with all pages, keywords, and metadata for SEO submission.</p>

        {/* XML Sitemap Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#71D6B5]" />
              XML Sitemap
            </h2>
            <button
              onClick={() => copyToClipboard(xmlSitemap)}
              className="px-4 py-2 bg-[#71D6B5] text-white rounded-lg font-semibold hover:bg-[#5fc4a3] transition-all"
            >
              Copy XML
            </button>
          </div>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
            {xmlSitemap}
          </pre>
        </div>

        {/* Pages Detail Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Page Details & Metadata</h2>
          
          <div className="space-y-6">
            {pages.map((page, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6 hover:border-[#71D6B5] transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#c61c39]">{page.name}</h3>
                    <a 
                      href={page.path}
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {baseUrl}{page.path}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      Priority: {page.priority}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                      {page.changefreq}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-bold text-gray-600">Title Tag:</label>
                    <p className="text-gray-800 bg-gray-50 p-2 rounded">{page.title}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-bold text-gray-600">Meta Description:</label>
                    <p className="text-gray-800 bg-gray-50 p-2 rounded">{page.description}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-bold text-gray-600">Keywords:</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {page.keywords.split(', ').map((keyword, i) => (
                        <span key={i} className="px-2 py-1 bg-[#71D6B5]/20 text-[#155EEF] rounded text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* robots.txt Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">robots.txt</h2>
            <button
              onClick={() => copyToClipboard(`User-agent: *
Allow: /

Sitemap: ${baseUrl}/Sitemap`)}
              className="px-4 py-2 bg-[#71D6B5] text-white rounded-lg font-semibold hover:bg-[#5fc4a3] transition-all"
            >
              Copy
            </button>
          </div>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm">
{`User-agent: *
Allow: /

Sitemap: ${baseUrl}/Sitemap`}
          </pre>
        </div>

        {/* Meta Tags Template */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Homepage Meta Tags (for reference)</h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`<!-- Primary Meta Tags -->
<title>U CRASH - Find a Car Accident Attorney Near You</title>
<meta name="title" content="U CRASH - Find a Car Accident Attorney Near You">
<meta name="description" content="Find, compare, and connect with top-rated personal injury lawyers nationwide. Free case reviews, 24/7 support.">
<meta name="keywords" content="car accident attorney, personal injury lawyer, accident lawyer near me, auto accident attorney, truck accident lawyer, motorcycle accident attorney, slip and fall lawyer, injury lawyer, free case review">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${baseUrl}/">
<meta property="og:title" content="U CRASH - Find a Car Accident Attorney Near You">
<meta property="og:description" content="America's Premier Attorney Directory. Find your lawyer today.">
<meta property="og:image" content="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691be92ffa93cfd887f03662/8740d5677_background-ucrash-999kb.png">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${baseUrl}/">
<meta property="twitter:title" content="U CRASH - Find a Car Accident Attorney Near You">
<meta property="twitter:description" content="America's Premier Attorney Directory. Find your lawyer today.">`}
          </pre>
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