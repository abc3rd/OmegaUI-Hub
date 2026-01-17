import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, ExternalLink, 
  BarChart3, MessageSquare, DollarSign, Megaphone, 
  Settings, Users, Code, Briefcase, Layers, Zap,
  FileText, Calendar, Mail, ShoppingCart, Database,
  PieChart, TrendingUp, Target, Workflow, Globe
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function AppListView({ apps, isLoading, onFavoriteToggle, onLaunch }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-9 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!apps || apps.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      {apps.map((app, index) => {
        const IconComponent = iconMap[app.icon] || Layers;
        
        return (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 group"
          >
            <div className="p-2.5 rounded-lg bg-slate-100 group-hover:bg-slate-200 transition-colors">
              <IconComponent className="w-5 h-5 text-slate-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-slate-900 truncate">{app.name}</h3>
              <p className="text-sm text-slate-500 truncate">{app.description || 'No description'}</p>
            </div>
            
            <Badge 
              variant="secondary" 
              className={`${categoryColors[app.category] || categoryColors.other} border-0 hidden sm:flex`}
            >
              {app.category?.replace(/_/g, ' ') || 'App'}
            </Badge>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteToggle?.(app);
              }}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Star 
                className={`w-4 h-4 ${
                  app.is_favorite 
                    ? 'fill-amber-400 text-amber-400' 
                    : 'text-slate-300 hover:text-slate-400'
                }`} 
              />
            </button>
            
            <Button
              size="sm"
              onClick={() => {
                if (onLaunch) onLaunch(app);
                window.open(app.url, '_blank', 'noopener,noreferrer');
              }}
              className="bg-slate-900 hover:bg-slate-800"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Launch
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}