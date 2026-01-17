import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from "sonner";
import { User } from '@/entities/User';
import AIContentAssistant from '../components/omega/AIContentAssistant';
import ConnectedServices from '../components/omega/ConnectedServices';
import { Bot, Link, Users, BarChart } from 'lucide-react';

const ServiceCard = ({ icon: Icon, title, children }) => (
  <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 shadow-lg h-full flex flex-col">
    <div className="flex items-center gap-3 mb-4">
      <Icon className="w-6 h-6 text-cyan-400" />
      <h2 className="text-xl font-semibold text-white">{title}</h2>
    </div>
    <div className="flex-grow">
      {children}
    </div>
  </div>
);

export default function OmegaDashboard() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (e) {
        console.error("User not logged in");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('success') === 'google_connected') {
      toast.success("Google account connected successfully!");
      // Clean up URL
      window.history.replaceState({}, document.title, location.pathname);
    }
    if (params.get('error')) {
      toast.error(`Connection failed: ${params.get('error')}`);
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]);

  return (
    <div className="p-6 md:p-8 space-y-8 bg-gray-950 min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Omega UI Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Welcome, {user?.full_name || 'developer'}. Here's your command center.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <ServiceCard icon={Bot} title="AI Content Assistant">
              <AIContentAssistant />
            </ServiceCard>
          </div>
          
          {/* Right Sidebar Column */}
          <div className="space-y-6">
            <ServiceCard icon={Link} title="Connected Services">
              <ConnectedServices />
            </ServiceCard>
            <ServiceCard icon={Users} title="Team Members">
              <p className="text-gray-400 text-sm">Manage your team and permissions.</p>
            </ServiceCard>
             <ServiceCard icon={BarChart} title="Analytics">
              <p className="text-gray-400 text-sm">View your usage statistics.</p>
            </ServiceCard>
          </div>
        </div>
      </div>
    </div>
  );
}