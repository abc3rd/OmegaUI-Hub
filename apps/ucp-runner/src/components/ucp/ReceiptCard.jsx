import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FileText, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import StatusBadge from './StatusBadge';

const ReceiptCard = ({ receipt, index = 0 }) => {
  const receiptData = receipt.json ? JSON.parse(receipt.json) : receipt;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={createPageUrl(`ReceiptDetail?receiptId=${receipt.id}`)}
        className="block bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800 hover:border-cyan-500/30 transition-all group"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2.5 bg-slate-700/50 rounded-lg group-hover:bg-slate-700 transition-colors">
              <FileText className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white truncate">
                {receipt.id.substring(0, 8)}...
              </h3>
              <p className="text-slate-400 text-sm truncate mt-0.5">
                Packet: {receipt.packetId}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(receipt.createdAt).toLocaleString()}
                </span>
                {receiptData.opResults && (
                  <span>{receiptData.opResults.length} ops</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={receipt.status} size="sm" />
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ReceiptCard;