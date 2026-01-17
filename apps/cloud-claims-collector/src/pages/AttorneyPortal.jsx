import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, TrendingUp, Clock, CheckCircle, AlertCircle, FileText, Calendar, MessageSquare, ExternalLink, Download } from 'lucide-react';

export default function AttorneyPortal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseDocuments, setCaseDocuments] = useState([]);
  const [stats, setStats] = useState({
    new: 0,
    under_review: 0,
    active: 0,
    total: 0
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      await loadCases(currentUser);
    } catch (error) {
      base44.auth.redirectToLogin('/AttorneyPortal');
    } finally {
      setLoading(false);
    }
  };

  const loadCases = async (currentUser) => {
    try {
      const allCases = await base44.entities.Case.list();
      setCases(allCases);
      
      setStats({
        new: allCases.filter(c => c.status === 'new').length,
        under_review: allCases.filter(c => c.status === 'under_review').length,
        active: allCases.filter(c => c.status === 'active' || c.status === 'accepted').length,
        total: allCases.length
      });
    } catch (error) {
      console.error('Error loading cases:', error);
    }
  };

  const handleAcceptCase = async (caseId) => {
    try {
      await base44.entities.Case.update(caseId, {
        status: 'accepted',
        attorney_id: user.id
      });
      await loadCases(user);
    } catch (error) {
      alert('Failed to accept case');
    }
  };

  const handleDeclineCase = async (caseId) => {
    try {
      await base44.entities.Case.update(caseId, {
        status: 'declined'
      });
      await loadCases(user);
    } catch (error) {
      alert('Failed to decline case');
    }
  };

  const handleViewCase = async (caseItem) => {
    setSelectedCase(caseItem);
    const allDocuments = await base44.entities.Document.list();
    const docs = allDocuments.filter(d => d.case_id === caseItem.id);
    setCaseDocuments(docs);
  };

  const handleRequestDocument = async (docType) => {
    try {
      await base44.entities.Document.create({
        case_id: selectedCase.id,
        document_type: docType,
        file_name: 'Requested',
        status: 'requested',
        uploaded_by: 'attorney',
        is_required: true,
        notes: `Attorney requested ${docType.replace('_', ' ')}`
      });
      const allDocuments = await base44.entities.Document.list();
      const docs = allDocuments.filter(d => d.case_id === selectedCase.id);
      setCaseDocuments(docs);
    } catch (error) {
      alert('Failed to request document');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00c7ad]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <style>{`
        .gradient-bg {
          background: linear-gradient(135deg, #415fdf 0%, #d2d9f7 25%, #899499 50%, #415fdf 75%, #d2d9f7 100%);
          background-size: 400% 400%;
          animation: gradientShift 20s ease infinite;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-lg shadow-lg border-b-2 border-[#415fdf]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <a href="/">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691be92ffa93cfd887f03662/ad2324a9c_background-ucrash-999kb.png" 
                  alt="UCRASH Logo" 
                  className="h-12 w-auto cursor-pointer"
                />
              </a>
              <div>
                <h1 className="text-2xl font-black text-gray-800">Attorney Portal</h1>
                <p className="text-sm text-gray-600">Welcome, {user?.full_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://glytch.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-bold hover:scale-105 transition-all"
              >
                🤖 GLYTCH AI
              </a>
              <button
                onClick={() => base44.auth.logout('/')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-[#415fdf]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">New Leads</p>
                <p className="text-3xl font-black text-[#415fdf]">{stats.new}</p>
              </div>
              <Clock className="w-12 h-12 text-[#415fdf] opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-[#899499]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Under Review</p>
                <p className="text-3xl font-black text-[#899499]">{stats.under_review}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-[#899499] opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-[#415fdf]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Active Cases</p>
                <p className="text-3xl font-black text-[#415fdf]">{stats.active}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-[#415fdf] opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-[#071119]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Cases</p>
                <p className="text-3xl font-black text-[#071119]">{stats.total}</p>
              </div>
              <Users className="w-12 h-12 text-[#071119] opacity-50" />
            </div>
          </div>
        </div>

        {/* Cases Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#415fdf] to-[#899499]">
            <h2 className="text-2xl font-bold text-white">Case Pipeline</h2>
          </div>
          
          {cases.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No cases available yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Case Info</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">AI Score</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cases.map((caseItem) => (
                    <tr key={caseItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <span className="font-semibold text-gray-800">Case #{caseItem.id.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                          {caseItem.accident_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(caseItem.accident_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          caseItem.status === 'new' ? 'bg-yellow-100 text-yellow-800' :
                          caseItem.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          caseItem.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {caseItem.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {caseItem.ai_match_score ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#415fdf] to-[#899499]"
                                style={{ width: `${caseItem.ai_match_score}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-gray-700">{caseItem.ai_match_score}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {caseItem.status === 'new' && (
                            <>
                              <button
                                onClick={() => handleAcceptCase(caseItem.id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleDeclineCase(caseItem.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => handleViewCase(caseItem)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                          >
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Case Details Modal */}
        {selectedCase && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCase(null)}>
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#415fdf] to-[#899499]">
                <h2 className="text-2xl font-bold text-white">Case Details</h2>
                <p className="text-white/80">#{selectedCase.id.slice(0, 8)}</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">Accident Information</h3>
                    <p className="text-sm text-gray-600">Type: <span className="font-semibold">{selectedCase.accident_type}</span></p>
                    <p className="text-sm text-gray-600">Date: <span className="font-semibold">{new Date(selectedCase.accident_date).toLocaleDateString()}</span></p>
                    <p className="text-sm text-gray-600">Priority: <span className="font-semibold capitalize">{selectedCase.priority || 'medium'}</span></p>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">Case Status</h3>
                    <p className="text-sm text-gray-600">Status: <span className="font-semibold capitalize">{selectedCase.status}</span></p>
                    {selectedCase.ai_match_score && (
                      <p className="text-sm text-gray-600">AI Match Score: <span className="font-semibold">{selectedCase.ai_match_score}%</span></p>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-bold text-gray-800 mb-3">Documents</h3>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Request Document:</p>
                    <div className="flex flex-wrap gap-2">
                      {['police_report', 'medical_records', 'insurance_claim', 'photos', 'witness_statement'].map((type) => (
                        <button
                          key={type}
                          onClick={() => handleRequestDocument(type)}
                          className="px-3 py-1 bg-[#415fdf] text-white rounded-lg text-xs font-semibold hover:bg-[#899499]"
                        >
                          + {type.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {caseDocuments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No documents yet</p>
                  ) : (
                    <div className="space-y-2">
                      {caseDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-[#415fdf]" />
                            <div>
                              <p className="font-semibold text-sm text-gray-800">{doc.file_name}</p>
                              <p className="text-xs text-gray-500 capitalize">{doc.document_type.replace('_', ' ')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                              doc.status === 'requested' ? 'bg-orange-100 text-orange-800' :
                              doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {doc.status}
                            </span>
                            {doc.file_url && doc.file_url !== 'Requested' && (
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#415fdf] hover:text-[#899499]"
                              >
                                <Download className="w-5 h-5" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedCase(null)}
                  className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white/95 backdrop-blur-lg border-t-2 border-[#415fdf] mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Omega UI Network</h3>
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
                  className="flex items-center justify-center gap-1 text-gray-600 hover:text-[#415fdf] text-sm font-medium transition-colors"
                >
                  {link.name}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
          <p className="text-center text-sm text-gray-600">
            &copy; 2025 Powered by Omega UI, LLC
          </p>
        </div>
      </footer>
    </div>
  );
}