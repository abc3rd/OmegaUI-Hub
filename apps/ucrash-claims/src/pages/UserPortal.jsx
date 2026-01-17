import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LogIn, UserPlus, FileText, Clock, CheckCircle, ExternalLink } from 'lucide-react';

export default function UserPortal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      if (currentUser) {
        loadLeads();
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadLeads = async () => {
    try {
      const userLeads = await base44.entities.VictimLead.filter({
        created_by: user?.email
      });
      setLeads(userLeads);
    } catch (error) {
      console.error('Error loading leads:', error);
    }
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  const handleSignup = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-800">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
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
              alt="u-CRA$H Logo" 
              className="h-16 w-auto cursor-pointer"
            />
          </a>
          {!user && (
            <div className="flex gap-3">
              <button
                onClick={handleLogin}
                className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {!user ? (
          // Not Logged In - Referral Landing
          <div>
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-600">
                Welcome to u-CRA$H
              </h1>
              <p className="text-2xl text-gray-700 mb-8">
                Your Personal Case Management Portal
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-blue-600">
                <UserPlus className="w-16 h-16 text-blue-600 mb-4" />
                <h2 className="text-3xl font-bold mb-4 text-gray-800">New User?</h2>
                <p className="text-gray-600 mb-6">
                  Create your free account to submit your case information and track your attorney consultations.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    Free case submission
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    Track your consultations
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    Secure & confidential
                  </li>
                </ul>
                <button
                  onClick={handleSignup}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-orange-600 text-white rounded-full text-lg font-bold hover:scale-105 transition-transform"
                >
                  Create Free Account
                </button>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-orange-600">
                <LogIn className="w-16 h-16 text-orange-600 mb-4" />
                <h2 className="text-3xl font-bold mb-4 text-gray-800">Returning User?</h2>
                <p className="text-gray-600 mb-6">
                  Sign in to access your case dashboard and view updates from attorneys.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    View case status
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    Message attorneys
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    Update information
                  </li>
                </ul>
                <button
                  onClick={handleLogin}
                  className="w-full px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full text-lg font-bold hover:scale-105 transition-transform"
                >
                  Sign In to Dashboard
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Don't Need an Account?</h3>
              <p className="text-gray-600 mb-6">
                You can submit a case directly without creating an account. An attorney will contact you shortly.
              </p>
              <a
                href="/"
                className="inline-block px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-bold hover:bg-blue-700 transition-all"
              >
                Submit Case Without Account
              </a>
            </div>
          </div>
        ) : (
          // Logged In - User Dashboard
          <div>
            <div className="mb-8">
              <h1 className="text-4xl font-black mb-2 text-gray-800">
                Welcome back, {user.full_name || 'User'}
              </h1>
              <p className="text-gray-600">Manage your case submissions and attorney consultations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-600">
                <FileText className="w-12 h-12 text-blue-600 mb-3" />
                <h3 className="text-2xl font-bold mb-1 text-gray-800">{leads.length}</h3>
                <p className="text-gray-600">Total Submissions</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-600">
                <Clock className="w-12 h-12 text-orange-600 mb-3" />
                <h3 className="text-2xl font-bold mb-1 text-gray-800">
                  {leads.filter(l => l.status === 'new').length}
                </h3>
                <p className="text-gray-600">Pending Review</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-600">
                <CheckCircle className="w-12 h-12 text-green-600 mb-3" />
                <h3 className="text-2xl font-bold mb-1 text-gray-800">
                  {leads.filter(l => l.status === 'contacted').length}
                </h3>
                <p className="text-gray-600">Attorney Contacted</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">Your Case Submissions</h2>
              
              {leads.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-600 mb-6">You haven't submitted any cases yet</p>
                  <a
                    href="/"
                    className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-orange-600 text-white rounded-full text-lg font-bold hover:scale-105 transition-transform"
                  >
                    Submit Your First Case
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <div key={lead.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-1">{lead.accident_type} Accident</h3>
                          <p className="text-sm text-gray-600">
                            Submitted: {new Date(lead.created_date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                          lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          lead.status === 'contacted' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <strong>Location:</strong> {lead.state}
                        </div>
                        <div>
                          <strong>Injury:</strong> {lead.injury_occurred ? 'Yes' : 'No'}
                        </div>
                      </div>
                      {lead.notes && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{lead.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => base44.auth.logout()}
                className="px-6 py-3 bg-gray-600 text-white rounded-full font-bold hover:bg-gray-700 transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-white py-16 px-4 border-t-4 border-orange-600 mt-12" style={{ backgroundColor: '#E2E8F0' }}>
        <div className="max-w-6xl mx-auto text-center">
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
          <div className="mt-8 text-sm text-gray-600">
            <p>&copy; 2025 u-CRA$H. All Rights Reserved. A Service of Omega UI, LLC</p>
          </div>
        </div>
      </footer>
    </div>
  );
}