import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  LayoutDashboard, Calculator, ClipboardList, Scale, Users, 
  Megaphone, TrendingUp, DollarSign, Car, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Import sub-components
import UCrashDashboard from '../components/ucrash/UCrashDashboard';
import CaseValueCalculator from '../components/ucrash/CaseValueCalculator';
import IntakeProtocol from '../components/ucrash/IntakeProtocol';
import StatuteTracker from '../components/ucrash/StatuteTracker';
import ReferralNetwork from '../components/ucrash/ReferralNetwork';
import MarketingKit from '../components/ucrash/MarketingKit';

export default function UCrashNexus() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list('-created_date', 100),
  });

  const { data: attorneys = [] } = useQuery({
    queryKey: ['attorneys'],
    queryFn: () => base44.entities.Attorney.list(),
  });

  const activeLeads = leads.filter(l => !['closed', 'rejected'].includes(l.status));
  const vettedLeads = leads.filter(l => l.status === 'vetted');
  
  const avgCaseValue = leads.length > 0 
    ? leads.reduce((sum, l) => sum + (l.estimated_value || 0), 0) / leads.filter(l => l.estimated_value).length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white border-b-4 border-pink-500">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              uCrash <span className="text-blue-400">Nexus</span>
            </h1>
            <p className="text-gray-400 text-sm">Legal Intake & Advisory Tool Kit</p>
          </div>
          <div className="text-right text-sm">
            <div className="font-bold">Omega UI, LLC</div>
            <div className="text-gray-400">Powered by Universal Command Protocol</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <nav className="bg-white rounded-xl shadow-lg p-4 h-fit lg:sticky lg:top-8">
            <div className="space-y-2">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { id: 'calculator', icon: Calculator, label: 'Case Value Estimator' },
                { id: 'intake', icon: ClipboardList, label: 'Intake Protocol' },
                { id: 'statutes', icon: Scale, label: 'Statute Tracker' },
                { id: 'referral', icon: Users, label: 'Referral Network' },
                { id: 'marketing', icon: Megaphone, label: 'Marketing Kit' },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-purple-50 hover:text-pink-600 hover:translate-x-1'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Main Content */}
          <main className="space-y-6">
            {activeTab === 'dashboard' && (
              <UCrashDashboard 
                leads={leads} 
                attorneys={attorneys}
                activeLeads={activeLeads}
                avgCaseValue={avgCaseValue}
                onNavigate={setActiveTab}
              />
            )}
            
            {activeTab === 'calculator' && <CaseValueCalculator />}
            {activeTab === 'intake' && <IntakeProtocol />}
            {activeTab === 'statutes' && <StatuteTracker />}
            {activeTab === 'referral' && <ReferralNetwork leads={leads} attorneys={attorneys} />}
            {activeTab === 'marketing' && <MarketingKit />}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-8 mt-12">
        <p className="font-bold">Omega UI, LLC</p>
        <p className="text-gray-400 text-sm">2744 Edison Avenue, Unit-7, Suite C-3, Fort Myers, FL 33916</p>
        <p className="text-gray-400 text-sm">Corporate: +1 239-247-6030 | Direct: +1 239-318-8982</p>
        <p className="text-gray-500 text-xs mt-4 max-w-3xl mx-auto px-6">
          DISCLAIMER: The uCrash Legal Advisory Nexus is a software tool for estimation and organization purposes only. 
          It does not constitute legal advice. Values generated are estimates based on user input. 
          Statutes of limitation vary by jurisdiction and case specifics. Always consult a licensed attorney.
        </p>
      </footer>
    </div>
  );
}