import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, TrendingUp, DollarSign, Activity, Shield, ExternalLink, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCases: 0,
    totalClients: 0,
    totalAttorneys: 0,
    conversionRate: 0,
    newThisWeek: 0,
    activeNow: 0
  });
  const [cases, setCases] = useState([]);
  const [attorneys, setAttorneys] = useState([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser.role !== 'admin') {
        window.location.href = '/';
        return;
      }
      setUser(currentUser);
      await loadData();
    } catch (error) {
      base44.auth.redirectToLogin('/AdminDashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [allCases, allAttorneys, allClients] = await Promise.all([
        base44.entities.Case.list(),
        base44.entities.Attorney.list(),
        base44.entities.Client.list()
      ]);

      setCases(allCases);
      setAttorneys(allAttorneys);

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const newThisWeek = allCases.filter(c => 
        new Date(c.created_date) >= oneWeekAgo
      ).length;

      const acceptedCases = allCases.filter(c => c.status === 'accepted' || c.status === 'active').length;
      const conversionRate = allCases.length > 0 ? Math.round((acceptedCases / allCases.length) * 100) : 0;

      setStats({
        totalCases: allCases.length,
        totalClients: allClients.length,
        totalAttorneys: allAttorneys.length,
        conversionRate,
        newThisWeek,
        activeNow: allCases.filter(c => c.status === 'active').length
      });
    } catch (error) {
      console.error('Error loading data:', error);
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
            <div>
              <div className="flex items-center gap-4">
                <a href="/">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691be92ffa93cfd887f03662/ad2324a9c_background-ucrash-999kb.png" 
                    alt="UCRASH Logo" 
                    className="h-12 w-auto cursor-pointer"
                  />
                </a>
                <div className="flex items-center gap-2">
                  <Shield className="w-8 h-8 text-[#415fdf]" />
                  <div>
                    <h1 className="text-2xl font-black text-gray-800">Admin Operations</h1>
                    <p className="text-sm text-gray-600">Omega UI, LLC Control Center</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://glytch.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-bold hover:scale-105 transition-all"
              >
                🤖 GLYTCH Admin
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-[#415fdf]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Cases</p>
                <p className="text-4xl font-black text-[#415fdf]">{stats.totalCases}</p>
                <p className="text-sm text-gray-500 mt-1">+{stats.newThisWeek} this week</p>
              </div>
              <BarChart3 className="w-16 h-16 text-[#415fdf] opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-[#899499]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Active Cases</p>
                <p className="text-4xl font-black text-[#899499]">{stats.activeNow}</p>
                <p className="text-sm text-gray-500 mt-1">Currently being worked</p>
              </div>
              <Activity className="w-16 h-16 text-[#899499] opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-[#415fdf]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Conversion Rate</p>
                <p className="text-4xl font-black text-[#415fdf]">{stats.conversionRate}%</p>
                <p className="text-sm text-gray-500 mt-1">Cases accepted</p>
              </div>
              <TrendingUp className="w-16 h-16 text-[#415fdf] opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-[#071119]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Clients</p>
                <p className="text-4xl font-black text-[#071119]">{stats.totalClients}</p>
                <p className="text-sm text-gray-500 mt-1">Registered users</p>
              </div>
              <Users className="w-16 h-16 text-[#071119] opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Attorneys</p>
                <p className="text-4xl font-black text-purple-600">{stats.totalAttorneys}</p>
                <p className="text-sm text-gray-500 mt-1">In network</p>
              </div>
              <Shield className="w-16 h-16 text-purple-600 opacity-20" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#415fdf] to-[#899499] rounded-2xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-semibold">Est. Pipeline Value</p>
                <p className="text-4xl font-black">$2.4M</p>
                <p className="text-sm text-white/80 mt-1">Across all cases</p>
              </div>
              <DollarSign className="w-16 h-16 text-white opacity-20" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <a
            href="/ucrash/proposal"
            className="bg-white rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform cursor-pointer"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-2">📄 uCrash Proposal</h3>
            <p className="text-gray-600">View the full business proposal and roadmap</p>
          </a>

          <button className="bg-white rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform text-left">
            <h3 className="text-xl font-bold text-gray-800 mb-2">🔄 Reset Demo Data</h3>
            <p className="text-gray-600">Refresh all demo cases and stats</p>
          </button>

          <button className="bg-white rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform text-left">
            <h3 className="text-xl font-bold text-gray-800 mb-2">⚙️ AI Agent Settings</h3>
            <p className="text-gray-600">Configure Glytch and automation rules</p>
          </button>
        </div>

        {/* Recent Cases */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="p-6 bg-gradient-to-r from-[#415fdf] to-[#899499]">
            <h2 className="text-2xl font-bold text-white">Recent Cases</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cases.slice(0, 10).map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono">#{c.id.slice(0, 8)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        {c.accident_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        c.status === 'active' ? 'bg-green-100 text-green-800' :
                        c.status === 'new' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        c.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        c.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {c.priority || 'medium'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(c.created_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-[#415fdf] hover:text-[#899499] font-semibold text-sm">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attorney Network */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Attorney Network</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {attorneys.map((attorney) => (
              <div key={attorney.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ 
                    backgroundImage: `url(${attorney.profile_image_url || 'https://storage.googleapis.com/msgsndr/y4ABqxnk279eDc0f5DqY/media/6913e61c7757659586111f9e.png'})`,
                    backgroundColor: '#415fdf'
                  }}
                />
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 text-lg mb-1">{attorney.law_firm_name}</h3>
                  <p className="text-sm text-[#415fdf] font-semibold mb-2">{attorney.licensing_state}</p>
                  <p className="text-sm text-gray-600 mb-3">{attorney.practice_areas}</p>
                  {attorney.years_experience && (
                    <p className="text-xs text-gray-500 mb-3">
                      <span className="font-bold">{attorney.years_experience}+</span> years experience
                    </p>
                  )}
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    attorney.capacity_status === 'available' ? 'bg-green-100 text-green-800' :
                    attorney.capacity_status === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {attorney.capacity_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
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