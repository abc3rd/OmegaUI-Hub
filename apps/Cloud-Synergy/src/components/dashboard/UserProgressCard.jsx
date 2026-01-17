import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import SynergyGauge from './SynergyGauge';

export default function UserProgressCard({ user, score, index = 0 }) {
  const getTrendIcon = (trend) => {
    if (trend === 'improving') return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (trend === 'declining') return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-slate-400" />;
  };

  const getUserTypeColor = (type) => {
    const colors = {
      student: 'bg-blue-100 text-blue-700 border-blue-200',
      employee: 'bg-purple-100 text-purple-700 border-purple-200',
      individual: 'bg-slate-100 text-slate-700 border-slate-200'
    };
    return colors[type] || colors.individual;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 ring-2 ring-slate-100">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}`} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              {user.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-slate-800">{user.full_name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className={`text-xs ${getUserTypeColor(user.user_type)}`}>
                {user.user_type}
              </Badge>
              {score?.improvement_trend && (
                <div className="flex items-center gap-1">
                  {getTrendIcon(score.improvement_trend)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div>
            <p className="text-sm text-slate-500">Sessions</p>
            <p className="text-lg font-bold text-slate-800">{score?.total_interactions || 0}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Avg Duration</p>
            <p className="text-lg font-bold text-slate-800">{score?.avg_session_duration?.toFixed(1) || 0}m</p>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <SynergyGauge 
            score={score?.overall_score || 0} 
            size={100} 
            strokeWidth={6}
          />
        </div>
      </div>

      {score?.recommendations && score.recommendations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500 mb-2">Next Steps:</p>
          <p className="text-sm text-slate-700">{score.recommendations[0]}</p>
        </div>
      )}
    </motion.div>
  );
}