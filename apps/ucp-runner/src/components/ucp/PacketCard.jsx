import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Package, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import StatusBadge from './StatusBadge';

const PacketCard = ({ packet, index = 0 }) => {
  const packetData = packet.json ? JSON.parse(packet.json) : packet;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={createPageUrl(`PacketDetail?packetId=${packet.id}`)}
        className="block bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800 hover:border-cyan-500/30 transition-all group"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2.5 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
              <Package className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">
                {packet.name || packetData.meta?.name || packet.id}
              </h3>
              <p className="text-slate-400 text-sm truncate mt-0.5">
                {packet.id}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(packet.createdAt).toLocaleDateString()}
                </span>
                {packetData.ops && (
                  <span>{packetData.ops.length} ops</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {packet.lastStatus && (
              <StatusBadge status={packet.lastStatus} size="sm" />
            )}
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PacketCard;