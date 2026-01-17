import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Award, Users, TrendingUp, Clock, CheckCircle, AlertCircle, Phone, Mail, MapPin, ExternalLink, Briefcase, DollarSign, UserPlus, Settings, Trash2, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MembersPortal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('leads');
  
  // Data states
  const [leads, setLeads] = useState([]);
  const [attorneys, setAttorneys] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [clients, setClients] = useState([]);
  
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    totalAttorneys: 0,
    totalAffiliates: 0,
    totalClients: 0,
    qualifiedLeads: 0
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      await loadAllData(currentUser);
    } catch (error) {
      base44.auth.redirectToLogin('/MembersPortal');
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async (currentUser) => {
    try {
      // Load leads
      const allLeads = await base44.entities.VictimLead.list();
      const userLeads = currentUser.role === 'admin' 
        ? allLeads 
        : allLeads.filter(lead => lead.assigned_attorney_id === currentUser.id || lead.created_by === currentUser.email);
      setLeads(userLeads);

      // Load attorneys (admin only sees all, others see public profiles)
      const allAttorneys = await base44.entities.Attorney.list();
      setAttorneys(allAttorneys);

      // Load affiliates
      const allAffiliates = await base44.entities.ReferralPartner.list();
      const userAffiliates = currentUser.role === 'admin' 
        ? allAffiliates 
        : allAffiliates.filter(a => a.created_by === currentUser.email);
      setAffiliates(userAffiliates);

      // Load clients (admin only)
      if (currentUser.role === 'admin') {
        const allClients = await base44.entities.Client.list();
        setClients(allClients);
      }

      // Calculate stats
      setStats({
        totalLeads: userLeads.length,
        newLeads: userLeads.filter(l => l.status === 'new').length,
        totalAttorneys: allAttorneys.length,
        totalAffiliates: userAffiliates.length,
        totalClients: currentUser.role === 'admin' ? (await base44.entities.Client.list()).length : 0,
        qualifiedLeads: userLeads.filter(l => l.status === 'qualified').length
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleClaimLead = async (leadId) => {
    try {
      await base44.entities.VictimLead.update(leadId, {
        assigned_attorney_id: user.id,
        status: 'assigned'
      });
      await loadAllData(user);
    } catch (error) {
      alert('Failed to claim lead. Please try again.');
    }
  };

  const handleUpdateLeadStatus = async (leadId, newStatus) => {
    try {
      await base44.entities.VictimLead.update(leadId, { status: newStatus });
      await loadAllData(user);
    } catch (error) {
      alert('Failed to update status.');
    }
  };

  const handleUpdateAffiliateStatus = async (affiliateId, newStatus) => {
    try {
      await base44.entities.ReferralPartner.update(affiliateId, { status: newStatus });
      await loadAllData(user);
    } catch (error) {
      alert('Failed to update affiliate status.');
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await base44.entities.VictimLead.delete(leadId);
      await loadAllData(user);
    } catch (error) {
      alert('Failed to delete lead.');
    }
  };

  const handleSignOut = () => {
    base44.auth.logout('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-700 via-gray-500 to-gray-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Loading portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 via-gray-500 to-gray-600">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Header */}
      <header className="border-b-2 border-orange-500 shadow-lg" style={{ backgroundColor: '#E2E8F0' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691be92ffa93cfd887f03662/8740d5677_background-ucrash-999kb.png" 
              alt="UCRASH Logo" 
              className="h-14 w-auto cursor-pointer"
            />
          </a>
          <div className="flex items-center gap-3">
            <a
              href="https://ui.omegaui.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-[#c61c39] to-[#030101] text-white rounded-full text-sm font-bold hover:scale-105 transition-all"
            >
              🤖 MURPHY AI
            </a>
            <div className="text-right hidden md:block">
              <p className="font-bold text-gray-800">{user?.full_name}</p>
              <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome & Stats */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-white mb-2">Welcome, {user?.full_name?.split(' ')[0]}!</h1>
          <p className="text-gray-200">Manage your leads, contacts, and network</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-blue-600">
            <p className="text-gray-600 text-xs font-semibold">Total Leads</p>
            <p className="text-2xl font-black text-blue-600">{stats.totalLeads}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-orange-600">
            <p className="text-gray-600 text-xs font-semibold">New Leads</p>
            <p className="text-2xl font-black text-orange-600">{stats.newLeads}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-green-600">
            <p className="text-gray-600 text-xs font-semibold">Qualified</p>
            <p className="text-2xl font-black text-green-600">{stats.qualifiedLeads}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-purple-600">
            <p className="text-gray-600 text-xs font-semibold">Attorneys</p>
            <p className="text-2xl font-black text-purple-600">{stats.totalAttorneys}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-pink-600">
            <p className="text-gray-600 text-xs font-semibold">Affiliates</p>
            <p className="text-2xl font-black text-pink-600">{stats.totalAffiliates}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-teal-600">
            <p className="text-gray-600 text-xs font-semibold">Clients</p>
            <p className="text-2xl font-black text-teal-600">{stats.totalClients}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4 bg-white/20">
            <TabsTrigger value="leads" className="data-[state=active]:bg-white">
              <Users className="w-4 h-4 mr-2" /> Leads
            </TabsTrigger>
            <TabsTrigger value="attorneys" className="data-[state=active]:bg-white">
              <Briefcase className="w-4 h-4 mr-2" /> Attorneys
            </TabsTrigger>
            <TabsTrigger value="affiliates" className="data-[state=active]:bg-white">
              <DollarSign className="w-4 h-4 mr-2" /> Affiliates
            </TabsTrigger>
            {user?.role === 'admin' && (
              <TabsTrigger value="clients" className="data-[state=active]:bg-white">
                <UserPlus className="w-4 h-4 mr-2" /> Clients
              </TabsTrigger>
            )}
          </TabsList>

          {/* LEADS TAB */}
          <TabsContent value="leads">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Lead Management</h2>
                <a
                  href="https://links.abcdashboard.com/widget/form/Kz0XoGSPFIzyav3t7aGM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#71D6B5] text-white rounded-lg text-sm font-bold hover:bg-[#5fc4a3]"
                >
                  + Add Lead
                </a>
              </div>
              
              {leads.length === 0 ? (
                <div className="p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No leads available yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">State</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-bold text-gray-800">{lead.full_name}</p>
                            <p className="text-xs text-gray-500">{lead.phone}</p>
                            {lead.email && <p className="text-xs text-gray-500">{lead.email}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                              {lead.accident_type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">{lead.state}</td>
                          <td className="px-4 py-3">
                            <select
                              value={lead.status}
                              onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                              className="px-2 py-1 border rounded text-xs"
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="assigned">Assigned</option>
                              <option value="qualified">Qualified</option>
                              <option value="disqualified">Disqualified</option>
                              <option value="closed">Closed</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">
                            {new Date(lead.created_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              {!lead.assigned_attorney_id && (
                                <button
                                  onClick={() => handleClaimLead(lead.id)}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700"
                                >
                                  Claim
                                </button>
                              )}
                              {user?.role === 'admin' && (
                                <button
                                  onClick={() => handleDeleteLead(lead.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ATTORNEYS TAB */}
          <TabsContent value="attorneys">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Attorney Directory</h2>
                <a href="/AttorneySignup" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700">
                  + Add Attorney
                </a>
              </div>
              
              {attorneys.length === 0 ? (
                <div className="p-12 text-center">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No attorneys registered yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {attorneys.map((attorney) => (
                    <div key={attorney.id} className="border rounded-xl p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-3">
                        {attorney.profile_image_url ? (
                          <img src={attorney.profile_image_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-purple-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{attorney.law_firm_name}</h3>
                          <p className="text-sm text-gray-600">{attorney.licensing_state}</p>
                          <p className="text-xs text-gray-500">{attorney.practice_areas}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          attorney.capacity_status === 'available' ? 'bg-green-100 text-green-800' :
                          attorney.capacity_status === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {attorney.capacity_status}
                        </span>
                        {attorney.years_experience && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {attorney.years_experience}+ years
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* AFFILIATES TAB */}
          <TabsContent value="affiliates">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Affiliate Partners</h2>
                <a href="/ReferralSignup" className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-bold hover:bg-pink-700">
                  + Add Affiliate
                </a>
              </div>
              
              {affiliates.length === 0 ? (
                <div className="p-12 text-center">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No affiliates registered yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Partner</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Referrals</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Earned</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                        {user?.role === 'admin' && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {affiliates.map((affiliate) => (
                        <tr key={affiliate.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-bold text-gray-800">{affiliate.firm_name || 'Individual'}</p>
                            <p className="text-xs text-gray-500">{affiliate.created_by}</p>
                          </td>
                          <td className="px-4 py-3">
                            <code className="px-2 py-1 bg-gray-100 rounded text-sm">{affiliate.referral_code}</code>
                          </td>
                          <td className="px-4 py-3 text-sm capitalize">{affiliate.role}</td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-blue-600">{affiliate.total_referrals || 0}</span>
                            <span className="text-gray-500 text-xs ml-1">({affiliate.qualified_cases || 0} qualified)</span>
                          </td>
                          <td className="px-4 py-3 font-bold text-green-600">
                            ${(affiliate.total_earned || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            {user?.role === 'admin' ? (
                              <select
                                value={affiliate.status}
                                onChange={(e) => handleUpdateAffiliateStatus(affiliate.id, e.target.value)}
                                className="px-2 py-1 border rounded text-xs"
                              >
                                <option value="pending">Pending</option>
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                affiliate.status === 'active' ? 'bg-green-100 text-green-800' :
                                affiliate.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {affiliate.status}
                              </span>
                            )}
                          </td>
                          {user?.role === 'admin' && (
                            <td className="px-4 py-3">
                              <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* CLIENTS TAB (Admin Only) */}
          {user?.role === 'admin' && (
            <TabsContent value="clients">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Client Management</h2>
                  <a href="/ClientIntake" className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700">
                    + Add Client
                  </a>
                </div>
                
                {clients.length === 0 ? (
                  <div className="p-12 text-center">
                    <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No clients registered yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact Pref</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {clients.map((client) => (
                          <tr key={client.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <p className="font-bold text-gray-800">{client.user_id}</p>
                              {client.address && <p className="text-xs text-gray-500">{client.address}</p>}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {client.city}, {client.state} {client.zip}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-gray-100 rounded text-xs capitalize">
                                {client.preferred_contact_method}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600">
                              {new Date(client.created_date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t-4 border-[#71D6B5] mt-8" style={{ backgroundColor: '#E2E8F0' }}>
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-lg font-bold mb-3 text-orange-600">Omega UI, LLC Network</h3>
          <div className="flex flex-wrap justify-center gap-3 mb-4">
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
                className="flex items-center gap-1 text-gray-600 hover:text-orange-600 text-sm transition-colors font-medium"
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