import React, { useState, useEffect } from 'react';

const LegendaryLeads = () => {
  const [searchCriteria, setSearchCriteria] = useState({
    industry: '',
    location: '',
    companySize: '',
    leadScore: '',
    keywords: '',
    contactType: ''
  });
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const resultsPerPage = 25;

  const stats = {
    totalLeads: '8.2M+',
    verified: '94%',
    updates: '24/7'
  };

  const industries = [
    { value: '', label: 'All Industries' },
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'retail', label: 'Retail' },
    { value: 'education', label: 'Education' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'food-beverage', label: 'Food & Beverage' }
  ];

  const companySizes = [
    { value: '', label: 'Any Size' },
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-1000', label: '201-1000 employees' },
    { value: '1000+', label: '1000+ employees' }
  ];

  const leadScores = [
    { value: '', label: 'All Scores' },
    { value: 'hot', label: 'Hot (90-100)' },
    { value: 'warm', label: 'Warm (60-89)' },
    { value: 'cold', label: 'Cold (0-59)' }
  ];

  const contactTypes = [
    { value: '', label: 'All Types' },
    { value: 'email', label: 'Email Available' },
    { value: 'instagram', label: 'Instagram Username' },
    { value: 'phone', label: 'Phone Number' },
    { value: 'linkedin', label: 'LinkedIn Profile' }
  ];

  const generateSampleLeads = (count = 100) => {
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'William', 'Jessica'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const companies = ['TechCorp', 'InnovateLLC', 'BusinessPro', 'DataSys', 'CloudTech', 'DigitalHub', 'SmartSolutions', 'FutureTech'];
    const titles = ['Marketing Manager', 'Sales Director', 'Operations Manager', 'Business Analyst', 'Project Manager', 'Account Executive'];
    const locations = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA'];
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'business.org'];

    const leads = [];
    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`;
      const instagram = `@${firstName.toLowerCase()}_${lastName.toLowerCase()}_${Math.floor(Math.random() * 999)}`;
      
      leads.push({
        id: i + 1,
        name,
        email,
        instagram,
        company: `${companies[Math.floor(Math.random() * companies.length)]} Solutions`,
        title: titles[Math.floor(Math.random() * titles.length)],
        industry: industries[Math.floor(Math.random() * (industries.length - 1)) + 1].value,
        location: locations[Math.floor(Math.random() * locations.length)],
        score: Math.floor(Math.random() * 100),
        lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
    return leads;
  };

  const handleInputChange = (field, value) => {
    setSearchCriteria(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const searchLeads = async () => {
    setLoading(true);
    setShowResults(true);
    setCurrentPage(1);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate sample results
    const sampleLeads = generateSampleLeads(Math.floor(Math.random() * 500) + 100);
    
    // Filter results based on criteria
    let filteredLeads = sampleLeads.filter(lead => {
      return (!searchCriteria.industry || lead.industry === searchCriteria.industry) &&
             (!searchCriteria.location || lead.location.toLowerCase().includes(searchCriteria.location.toLowerCase())) &&
             (!searchCriteria.keywords || 
              lead.title.toLowerCase().includes(searchCriteria.keywords.toLowerCase()) ||
              lead.company.toLowerCase().includes(searchCriteria.keywords.toLowerCase()));
    });

    setResults(filteredLeads);
    setTotalPages(Math.ceil(filteredLeads.length / resultsPerPage));
    setLoading(false);

    // Send to GHL for tracking
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'ghl-lead-search',
        criteria: searchCriteria,
        resultCount: filteredLeads.length,
        timestamp: new Date().toISOString()
      }, '*');
    }
  };

  const clearSearch = () => {
    setSearchCriteria({
      industry: '',
      location: '',
      companySize: '',
      leadScore: '',
      keywords: '',
      contactType: ''
    });
    setShowResults(false);
    setResults([]);
  };

  const exportLeads = (format) => {
    if (results.length === 0) {
      alert('No leads to export. Please run a search first.');
      return;
    }
    
    alert(`Exporting ${results.length} leads as ${format.toUpperCase()}...`);
    
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'ghl-lead-export',
        format: format,
        count: results.length,
        timestamp: new Date().toISOString()
      }, '*');
    }
  };

  const sendToCRM = () => {
    if (results.length === 0) {
      alert('No leads to send. Please run a search first.');
      return;
    }
    
    alert(`Sending ${results.length} leads to your CRM via GLYTCH automation...`);
    
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'ghl-lead-import',
        leads: results.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage),
        timestamp: new Date().toISOString()
      }, '*');
    }
  };

  const getScoreStyle = (score) => {
    if (score >= 90) return 'bg-red-500/30 text-red-400 border-red-400';
    if (score >= 60) return 'bg-yellow-500/30 text-yellow-400 border-yellow-400';
    return 'bg-gray-500/30 text-gray-400 border-gray-400';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Hot';
    if (score >= 60) return 'Warm';
    return 'Cold';
  };

  const getCurrentPageResults = () => {
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = Math.min(startIndex + resultsPerPage, results.length);
    return results.slice(startIndex, endIndex);
  };

  const renderPagination = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => setCurrentPage(currentPage - 1)}
          className="px-4 py-2 bg-white/10 border border-white/30 rounded-lg hover:bg-yellow-500 hover:text-black transition-all"
        >
          ← Previous
        </button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-4 py-2 border rounded-lg transition-all ${
            i === currentPage
              ? 'bg-yellow-500 text-black border-yellow-500'
              : 'bg-white/10 border-white/30 hover:bg-yellow-500 hover:text-black'
          }`}
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => setCurrentPage(currentPage + 1)}
          className="px-4 py-2 bg-white/10 border border-white/30 rounded-lg hover:bg-yellow-500 hover:text-black transition-all"
        >
          Next →
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white">
      <div className="max-w-7xl mx-auto px-5 py-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl flex items-center justify-center text-3xl">
              🎯
            </div>
            <h1 className="text-4xl font-bold">Legendary Leads</h1>
          </div>
          <p className="text-xl opacity-90 mb-8">Access to 8+ Million Verified Leads</p>
          
          {/* Stats */}
          <div className="flex justify-center gap-12 mb-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{stats.totalLeads}</div>
              <div className="text-sm opacity-80">Total Leads</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{stats.verified}</div>
              <div className="text-sm opacity-80">Verified</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{stats.updates}</div>
              <div className="text-sm opacity-80">Updates</div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20">
          <h2 className="text-2xl font-semibold mb-6 text-center">🔍 Advanced Lead Search</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Industry */}
            <div>
              <label className="block mb-2 font-medium">Industry</label>
              <select
                value={searchCriteria.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/30 rounded-xl text-white focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
              >
                {industries.map(industry => (
                  <option key={industry.value} value={industry.value} className="bg-gray-800">
                    {industry.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block mb-2 font-medium">Location</label>
              <input
                type="text"
                value={searchCriteria.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, State, Country"
                className="w-full p-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
              />
            </div>

            {/* Company Size */}
            <div>
              <label className="block mb-2 font-medium">Company Size</label>
              <select
                value={searchCriteria.companySize}
                onChange={(e) => handleInputChange('companySize', e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/30 rounded-xl text-white focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
              >
                {companySizes.map(size => (
                  <option key={size.value} value={size.value} className="bg-gray-800">
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Lead Score */}
            <div>
              <label className="block mb-2 font-medium">Lead Score</label>
              <select
                value={searchCriteria.leadScore}
                onChange={(e) => handleInputChange('leadScore', e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/30 rounded-xl text-white focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
              >
                {leadScores.map(score => (
                  <option key={score.value} value={score.value} className="bg-gray-800">
                    {score.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Keywords */}
            <div>
              <label className="block mb-2 font-medium">Keywords</label>
              <input
                type="text"
                value={searchCriteria.keywords}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
                placeholder="Job title, skills, interests"
                className="w-full p-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
              />
            </div>

            {/* Contact Type */}
            <div>
              <label className="block mb-2 font-medium">Contact Type</label>
              <select
                value={searchCriteria.contactType}
                onChange={(e) => handleInputChange('contactType', e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/30 rounded-xl text-white focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
              >
                {contactTypes.map(type => (
                  <option key={type.value} value={type.value} className="bg-gray-800">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Actions */}
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={searchLeads}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-semibold rounded-full transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50"
            >
              {loading ? '🔍 Searching...' : '🔍 Search Leads'}
            </button>
            <button
              onClick={clearSearch}
              className="px-6 py-3 bg-white/20 border border-white/30 rounded-full transition-all duration-300 hover:bg-white/30 hover:transform hover:-translate-y-1"
            >
              Clear Filters
            </button>
            <button
              onClick={() => alert('Search criteria saved to your dashboard!')}
              className="px-6 py-3 bg-white/20 border border-white/30 rounded-full transition-all duration-300 hover:bg-white/30 hover:transform hover:-translate-y-1"
            >
              💾 Save Search
            </button>
          </div>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div className="text-xl font-semibold">
                {loading ? 'Searching...' : `${results.length.toLocaleString()} leads found`}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => exportLeads('csv')}
                  className="px-4 py-2 bg-white/20 border border-white/30 rounded-xl transition-all hover:bg-white/30"
                >
                  📊 Export CSV
                </button>
                <button
                  onClick={() => exportLeads('excel')}
                  className="px-4 py-2 bg-white/20 border border-white/30 rounded-xl transition-all hover:bg-white/30"
                >
                  📈 Export Excel
                </button>
                <button
                  onClick={sendToCRM}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-semibold rounded-xl transition-all hover:transform hover:-translate-y-1"
                >
                  📤 Send to CRM
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="text-xl">🔍 Searching through 8.2M+ leads...</div>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-white/10">
                        <th className="p-4 text-left font-semibold uppercase text-sm tracking-wide border-b border-white/20">Name</th>
                        <th className="p-4 text-left font-semibold uppercase text-sm tracking-wide border-b border-white/20">Company</th>
                        <th className="p-4 text-left font-semibold uppercase text-sm tracking-wide border-b border-white/20">Title</th>
                        <th className="p-4 text-left font-semibold uppercase text-sm tracking-wide border-b border-white/20">Location</th>
                        <th className="p-4 text-left font-semibold uppercase text-sm tracking-wide border-b border-white/20">Contact</th>
                        <th className="p-4 text-left font-semibold uppercase text-sm tracking-wide border-b border-white/20">Score</th>
                        <th className="p-4 text-left font-semibold uppercase text-sm tracking-wide border-b border-white/20">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getCurrentPageResults().map((lead) => (
                        <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 border-b border-white/10">
                            <strong>{lead.name}</strong>
                          </td>
                          <td className="p-4 border-b border-white/10">{lead.company}</td>
                          <td className="p-4 border-b border-white/10">{lead.title}</td>
                          <td className="p-4 border-b border-white/10">{lead.location}</td>
                          <td className="p-4 border-b border-white/10">
                            <div className="text-sm">
                              {lead.email && <div>📧 {lead.email}</div>}
                              {lead.instagram && <div>📷 {lead.instagram}</div>}
                            </div>
                          </td>
                          <td className="p-4 border-b border-white/10">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getScoreStyle(lead.score)}`}>
                              {getScoreLabel(lead.score)} ({lead.score})
                            </span>
                          </td>
                          <td className="p-4 border-b border-white/10">{lead.lastUpdated}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {renderPagination()}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 opacity-70">
                <div className="text-xl">No leads found matching your criteria</div>
                <div className="text-sm mt-2">Try adjusting your search filters</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LegendaryLeads;