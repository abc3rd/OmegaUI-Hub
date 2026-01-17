import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Play, 
  Package,
  Shield,
  Zap,
  Clock,
  User,
  Hash,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Globe,
  Database,
  Bell,
  Code,
  GitBranch,
  Repeat,
  Layers,
  ChevronDown,
  ChevronRight,
  Timer,
  Shuffle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PacketRepo, ReceiptRepo, initDB } from '@/components/ucp/UCPDatabase';
import ReceiptCard from '@/components/ucp/ReceiptCard';
import TokenCostEstimator from '@/components/ucp/TokenCostEstimator';
import QRCodeGenerator from '@/components/ucp/QRCodeGenerator';

const PERMISSION_INFO = {
  network: { icon: Globe, color: 'text-blue-400', bg: 'bg-blue-500/20', description: 'Can make HTTP requests' },
  storage: { icon: Database, color: 'text-purple-400', bg: 'bg-purple-500/20', description: 'Can store local data' },
  notifications: { icon: Bell, color: 'text-amber-400', bg: 'bg-amber-500/20', description: 'Can show notifications' }
};

const DRIVER_INFO = {
  http: { icon: Globe, color: 'text-blue-400', description: 'HTTP requests' },
  local_storage: { icon: Database, color: 'text-purple-400', description: 'Key-value storage' },
  notification: { icon: Bell, color: 'text-amber-400', description: 'System notifications' },
  transform: { icon: Shuffle, color: 'text-cyan-400', description: 'Data transformation' },
  wait: { icon: Timer, color: 'text-slate-400', description: 'Delays and timing' }
};

// Recursive component to render ops including control flow
const OpItem = ({ op, index, depth = 0 }) => {
  const [expanded, setExpanded] = useState(depth < 1);
  
  const getTypeConfig = (type) => {
    switch (type) {
      case 'conditional':
      case 'if':
        return { icon: GitBranch, color: 'text-violet-400', bg: 'bg-violet-500/20', label: 'Conditional' };
      case 'loop':
      case 'foreach':
        return { icon: Repeat, color: 'text-cyan-400', bg: 'bg-cyan-500/20', label: 'Loop' };
      case 'parallel':
        return { icon: Layers, color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Parallel' };
      case 'try':
        return { icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Try/Catch' };
      default:
        return null;
    }
  };

  const typeConfig = getTypeConfig(op.type);
  const isControlFlow = !!typeConfig;
  const TypeIcon = typeConfig?.icon;

  if (isControlFlow) {
    const nestedOps = [];
    if (op.then) nestedOps.push({ label: 'then', ops: op.then });
    if (op.else) nestedOps.push({ label: 'else', ops: op.else });
    if (op.ops) nestedOps.push({ label: op.type === 'loop' ? 'body' : 'ops', ops: op.ops });
    if (op.catch) nestedOps.push({ label: 'catch', ops: op.catch });
    if (op.finally) nestedOps.push({ label: 'finally', ops: op.finally });

    return (
      <div className="rounded-lg border border-slate-700/50 overflow-hidden" style={{ marginLeft: depth * 12 }}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-3 bg-slate-800/50 hover:bg-slate-800 flex items-center gap-3 text-left transition-colors"
        >
          {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          <span className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs font-mono text-slate-400">
            {index + 1}
          </span>
          <div className={`p-1.5 rounded ${typeConfig.bg}`}>
            <TypeIcon className={`w-4 h-4 ${typeConfig.color}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`font-medium ${typeConfig.color}`}>{typeConfig.label}</span>
              {op.id && <span className="text-xs text-slate-500">({op.id})</span>}
            </div>
            {op.type === 'loop' && (
              <p className="text-xs text-slate-500">
                {op.count ? `${op.count} iterations` : op.items ? 'foreach items' : 'range loop'}
              </p>
            )}
            {op.type === 'parallel' && op.ops && (
              <p className="text-xs text-slate-500">{op.ops.length} parallel operations</p>
            )}
          </div>
        </button>
        
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 space-y-3 bg-slate-900/30">
                {nestedOps.map((group, gi) => (
                  <div key={gi}>
                    <p className="text-xs font-medium text-slate-400 mb-2 pl-2 border-l-2 border-slate-600">
                      {group.label}
                    </p>
                    <div className="space-y-2">
                      {group.ops.map((nestedOp, ni) => (
                        <OpItem key={ni} op={nestedOp} index={ni} depth={depth + 1} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Standard operation
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="p-3 bg-slate-900/50 rounded-lg"
      style={{ marginLeft: depth * 12 }}
    >
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs font-mono text-slate-400">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-cyan-400 text-sm">{op.op}</p>
          {op.id && (
            <p className="text-xs text-slate-500 mt-0.5">ID: {op.id}</p>
          )}
          {(op.runIf || op.skipIf) && (
            <p className="text-xs text-amber-400 mt-0.5">
              {op.runIf && '⚡ runIf condition'}
              {op.skipIf && '⏭️ skipIf condition'}
            </p>
          )}
        </div>
      </div>
      {op.args && (
        <pre className="mt-2 text-xs text-slate-400 bg-slate-800 rounded p-2 overflow-x-auto">
          {JSON.stringify(op.args, null, 2)}
        </pre>
      )}
    </motion.div>
  );
};

export default function PacketDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const packetId = urlParams.get('packetId');

  const [packet, setPacket] = useState(null);
  const [packetData, setPacketData] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await initDB();
      const packetRecord = await PacketRepo.get(packetId);
      if (packetRecord) {
        setPacket(packetRecord);
        setPacketData(JSON.parse(packetRecord.json));
        const packetReceipts = await ReceiptRepo.listForPacket(packetId);
        setReceipts(packetReceipts);
      }
      setLoading(false);
    };
    loadData();
  }, [packetId]);

  const handleDelete = async () => {
    await PacketRepo.delete(packetId);
    navigate(createPageUrl('Home'));
  };

  const handleRun = () => {
    navigate(createPageUrl(`Run?packetId=${packetId}`));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <Package className="w-8 h-8 text-cyan-400" />
        </motion.div>
      </div>
    );
  }

  if (!packet || !packetData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">
        <Package className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Packet Not Found</h2>
        <p className="text-slate-400 mb-6">The requested packet doesn't exist</p>
        <Link to={createPageUrl('Home')}>
          <Button className="bg-cyan-500 hover:bg-cyan-600">Go Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white truncate">
                  {packetData.meta?.name || packetData.id}
                </h1>
                <p className="text-sm text-slate-400">Packet Details</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-slate-400 hover:text-rose-400"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Packet Info Card */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Hash className="w-4 h-4" />
                <span>Packet ID</span>
              </div>
              <p className="font-mono text-white text-sm">{packetData.id}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Zap className="w-4 h-4" />
                <span>UCP Version</span>
              </div>
              <p className="text-white">{packetData.ucp_version}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>TTL</span>
              </div>
              <p className="text-white">{packetData.ttl_seconds}s</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <User className="w-4 h-4" />
                <span>Owner</span>
              </div>
              <p className="text-white">{packetData.meta?.owner || 'Unknown'}</p>
            </div>
          </div>
        </div>

        {/* Permissions Checklist */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h2 className="font-semibold text-white">Permissions & Drivers</h2>
          </div>

          <div className="space-y-3">
            {packetData.permissions?.map((perm) => {
              const info = PERMISSION_INFO[perm] || { icon: CheckCircle, color: 'text-slate-400', bg: 'bg-slate-500/20', description: perm };
              const Icon = info.icon;
              return (
                <div key={perm} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                  <div className={`p-2 rounded-lg ${info.bg}`}>
                    <Icon className={`w-4 h-4 ${info.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-white capitalize">{perm}</p>
                    <p className="text-sm text-slate-400">{info.description}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-400 ml-auto" />
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-sm text-slate-400 mb-2">Required Drivers:</p>
            <div className="flex flex-wrap gap-2">
              {packetData.required_drivers?.map((driver) => {
                const info = DRIVER_INFO[driver] || { icon: Zap, color: 'text-slate-400', description: driver };
                return (
                  <span key={driver} className="px-3 py-1 bg-slate-700/50 rounded-full text-sm text-slate-300">
                    {driver}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Operations List */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-5 h-5 text-cyan-400" />
            <h2 className="font-semibold text-white">Operations ({packetData.ops?.length || 0})</h2>
          </div>

          <div className="space-y-2">
            {packetData.ops?.map((op, index) => (
              <OpItem key={index} op={op} index={index} depth={0} />
            ))}
          </div>
        </div>

        {/* Token Cost Estimate */}
        <TokenCostEstimator packetData={packetData} />

        {/* QR Code for Sharing */}
        <QRCodeGenerator data={packetData} title={packetData.meta?.name || packetData.id} />

        {/* Run Button */}
        <Button
          onClick={handleRun}
          className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold py-6 text-lg"
        >
          <Play className="w-5 h-5 mr-2" />
          Run Packet
        </Button>

        {/* Previous Receipts */}
        {receipts.length > 0 && (
          <div>
            <h2 className="font-semibold text-white mb-3">Previous Runs</h2>
            <div className="space-y-3">
              {receipts.map((receipt, index) => (
                <ReceiptCard key={receipt.id} receipt={receipt} index={index} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Delete Packet?</h3>
            </div>
            <p className="text-slate-400 mb-6">
              This will permanently delete this packet and cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 text-slate-400"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
              >
                Delete
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}