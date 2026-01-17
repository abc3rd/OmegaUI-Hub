import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ExternalLink, 
  Lock, 
  Box,
  BarChart3,
  MessageCircle,
  DollarSign,
  Zap,
  Shield,
  Palette,
  Database,
  CheckSquare,
  Calendar,
  Users,
  FileText,
  Settings,
  Mail,
  Globe,
  Briefcase,
  Layers
} from 'lucide-react';

const iconMap = {
  Box,
  BarChart3,
  MessageCircle,
  DollarSign,
  Zap,
  Shield,
  Palette,
  Database,
  CheckSquare,
  Calendar,
  Users,
  FileText,
  Settings,
  Mail,
  Globe,
  Briefcase,
  Layers
};

const colorMap = {
  blue: 'from-blue-500 to-blue-700',
  purple: 'from-purple-500 to-purple-700',
  green: 'from-emerald-500 to-emerald-700',
  orange: 'from-orange-500 to-orange-700',
  pink: 'from-pink-500 to-pink-700',
  cyan: 'from-cyan-500 to-cyan-700',
  amber: 'from-amber-500 to-amber-700',
  red: 'from-red-500 to-red-700',
};

export default function AppCard({ app, isAuthenticated, onAppClick, index }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const IconComponent = iconMap[app.icon] || Box;
  const gradientClass = colorMap[app.color] || colorMap.blue;

  const handleClick = () => {
    if (!isAuthenticated) {
      onAppClick(app);
    } else if (app.url) {
      window.open(app.url, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      className="relative flex-shrink-0 w-[200px] md:w-[240px] cursor-pointer group"
    >
      {/* Card */}
      <motion.div
        animate={{ scale: isHovered ? 1.05 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative h-[280px] md:h-[320px] rounded-2xl overflow-hidden"
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-90`} />
        
        {/* Thumbnail overlay */}
        {app.thumbnail_url && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
            style={{ backgroundImage: `url(${app.thumbnail_url})` }}
          />
        )}

        {/* Glass overlay on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Content */}
        <div className="relative h-full p-5 flex flex-col justify-between z-10">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <IconComponent className="w-6 h-6 text-white" />
          </div>

          {/* Info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{app.name}</h3>
            <p className="text-white/70 text-sm line-clamp-2">{app.description}</p>
          </div>

          {/* Action indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            className="flex items-center gap-2"
          >
            {isAuthenticated ? (
              <>
                <span className="text-white/90 text-sm font-medium">Open App</span>
                <ExternalLink className="w-4 h-4 text-white/90" />
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-white/90" />
                <span className="text-white/90 text-sm font-medium">Sign in to access</span>
              </>
            )}
          </motion.div>
        </div>

        {/* Featured badge */}
        {app.is_featured && (
          <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm">
            <span className="text-[10px] font-semibold text-white uppercase tracking-wider">Featured</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}