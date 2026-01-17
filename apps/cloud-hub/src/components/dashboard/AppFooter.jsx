import React from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, ExternalLink, ChevronRight,
  BarChart3, MessageSquare, DollarSign, Megaphone, 
  Settings, Users, Code, Briefcase, Zap,
  FileText, Calendar, Mail, ShoppingCart, Database,
  PieChart, TrendingUp, Target, Workflow, Globe
} from 'lucide-react';

const iconMap = {
  'bar-chart': BarChart3,
  'message-square': MessageSquare,
  'dollar-sign': DollarSign,
  'megaphone': Megaphone,
  'settings': Settings,
  'users': Users,
  'code': Code,
  'briefcase': Briefcase,
  'zap': Zap,
  'file-text': FileText,
  'calendar': Calendar,
  'mail': Mail,
  'shopping-cart': ShoppingCart,
  'database': Database,
  'pie-chart': PieChart,
  'trending-up': TrendingUp,
  'target': Target,
  'workflow': Workflow,
  'globe': Globe,
};

export default function AppFooter({ apps, currentAppId }) {
  const filteredApps = apps?.filter(app => app.id !== currentAppId) || [];
  
  // Group apps by category
  const groupedApps = filteredApps.reduce((acc, app) => {
    const category = app.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(app);
    return acc;
  }, {});

  const categoryLabels = {
    productivity: 'Productivity',
    analytics: 'Analytics',
    communication: 'Communication',
    finance: 'Finance',
    marketing: 'Marketing',
    operations: 'Operations',
    hr: 'Human Resources',
    development: 'Development',
    other: 'Other Apps',
  };

  if (filteredApps.length === 0) return null;

  return (
    <footer className="mt-auto border-t border-slate-200 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Quick Links Section */}
        <div className="mb-10">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Quick Access
          </h4>
          <div className="flex flex-wrap gap-2">
            {filteredApps.slice(0, 8).map((app) => {
              const IconComponent = iconMap[app.icon] || Layers;
              return (
                <motion.a
                  key={app.id}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group"
                >
                  <IconComponent className="w-4 h-4 text-slate-500 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{app.name}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* Categorized Apps */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {Object.entries(groupedApps).map(([category, categoryApps]) => (
            <div key={category}>
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                {categoryLabels[category] || category}
              </h5>
              <ul className="space-y-2">
                {categoryApps.slice(0, 5).map((app) => (
                  <li key={app.id}>
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      <ChevronRight className="w-3 h-3 mr-1 text-slate-300 group-hover:text-blue-500 transition-colors" />
                      {app.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Enterprise App Suite</span>
          </div>
          
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Your Organization. All applications are authorized under your subscription.
          </p>
          
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>{filteredApps.length + 1} Apps Connected</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Active
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}