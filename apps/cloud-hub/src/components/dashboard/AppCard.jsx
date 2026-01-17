import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, ExternalLink, Clock, 
  BarChart3, MessageSquare, DollarSign, Megaphone, 
  Settings, Users, Code, Briefcase, Layers, Zap,
  FileText, Calendar, Mail, ShoppingCart, Database,
  PieChart, TrendingUp, Target, Workflow, Globe
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const iconMap = {
  'bar-chart': BarChart3,
  'message-square': MessageSquare,
  'dollar-sign': DollarSign,
  'megaphone': Megaphone,
  'settings': Settings,
  'users': Users,
  'code': Code,
  'briefcase': Briefcase,
  'layers': Layers,
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

const categoryColors = {
  productivity: 'bg-blue-500/10 text-blue-600',
  analytics: 'bg-violet-500/10 text-violet-600',
  communication: 'bg-emerald-500/10 text-emerald-600',
  finance: 'bg-amber-500/10 text-amber-600',
  marketing: 'bg-pink-500/10 text-pink-600',
  operations: 'bg-slate-500/10 text-slate-600',
  hr: 'bg-orange-500/10 text-orange-600',
  development: 'bg-cyan-500/10 text-cyan-600',
  other: 'bg-gray-500/10 text-gray-600',
};

const accentColors = {
  productivity: 'from-blue-500 to-blue-600',
  analytics: 'from-violet-500 to-violet-600',
  communication: 'from-emerald-500 to-emerald-600',
  finance: 'from-amber-500 to-amber-600',
  marketing: 'from-pink-500 to-pink-600',
  operations: 'from-slate-500 to-slate-600',
  hr: 'from-orange-500 to-orange-600',
  development: 'from-cyan-500 to-cyan-600',
  other: 'from-gray-500 to-gray-600',
};

export default function AppCard({ app, onFavoriteToggle, onLaunch }) {
  const IconComponent = iconMap[app.icon] || Layers;
  const accent = accentColors[app.category] || accentColors.other;

  const handleLaunch = () => {
    if (onLaunch) onLaunch(app);
    window.open(app.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={handleLaunch}
    >
      {/* Gradient accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accent}`} />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${accent} shadow-lg`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle?.(app);
            }}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Star 
              className={`w-5 h-5 transition-colors ${
                app.is_favorite 
                  ? 'fill-amber-400 text-amber-400' 
                  : 'text-slate-300 group-hover:text-slate-400'
              }`} 
            />
          </button>
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">
          {app.name}
        </h3>
        
        <p className="text-sm text-slate-500 mb-4 line-clamp-2 min-h-[40px]">
          {app.description || 'No description available'}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Badge variant="secondary" className={`${categoryColors[app.category] || categoryColors.other} border-0 font-medium`}>
            {app.category?.replace(/_/g, ' ') || 'App'}
          </Badge>
          
          <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-500 transition-colors">
            <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Launch
            </span>
            <ExternalLink className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Hover overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}