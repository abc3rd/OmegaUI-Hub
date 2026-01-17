import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2, XCircle, Clock, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

export default function APIHealthMonitor() {
  const [endpoints, setEndpoints] = useState({
    summary: { status: 'checking', latency: null, errorCount: 0, totalRequests: 0 },
    timeseries: { status: 'checking', latency: null, errorCount: 0, totalRequests: 0 }
  });

  const checkEndpoint = async (name, url) => {
    const startTime = performance.now();
    try {
      const response = await fetch(url);
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      
      setEndpoints(prev => ({
        ...prev,
        [name]: {
          ...prev[name],
          status: response.ok ? 'online' : 'error',
          latency,
          errorCount: response.ok ? prev[name].errorCount : prev[name].errorCount + 1,
          totalRequests: prev[name].totalRequests + 1,
        }
      }));
    } catch (error) {
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      
      setEndpoints(prev => ({
        ...prev,
        [name]: {
          ...prev[name],
          status: 'offline',
          latency,
          errorCount: prev[name].errorCount + 1,
          totalRequests: prev[name].totalRequests + 1,
        }
      }));
    }
  };

  useEffect(() => {
    // Initial check
    checkEndpoint('summary', '/api/metrics/summary');
    checkEndpoint('timeseries', '/api/metrics/timeseries');

    // Poll every 10 seconds
    const interval = setInterval(() => {
      checkEndpoint('summary', '/api/metrics/summary');
      checkEndpoint('timeseries', '/api/metrics/timeseries');
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-[#4bce2a]';
      case 'offline': return 'text-[#c4653a]';
      case 'error': return 'text-[#ea00ea]';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return CheckCircle2;
      case 'offline': return WifiOff;
      case 'error': return AlertTriangle;
      default: return Activity;
    }
  };

  const getErrorRate = (endpoint) => {
    if (endpoint.totalRequests === 0) return 0;
    return ((endpoint.errorCount / endpoint.totalRequests) * 100).toFixed(1);
  };

  const getAverageLatency = (latency) => {
    if (latency === null) return '—';
    if (latency < 100) return 'Fast';
    if (latency < 300) return 'Good';
    if (latency < 1000) return 'Slow';
    return 'Very Slow';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] rounded-2xl border border-[#3c3c3c] p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#2699fe]/10 flex items-center justify-center">
          <Wifi className="w-5 h-5 text-[#2699fe]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">API Health Monitor</h3>
          <p className="text-sm text-gray-400">Real-time endpoint status & latency</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Summary Endpoint */}
        <EndpointCard
          name="Metrics Summary"
          url="/api/metrics/summary"
          endpoint={endpoints.summary}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          getErrorRate={getErrorRate}
          getAverageLatency={getAverageLatency}
        />

        {/* Timeseries Endpoint */}
        <EndpointCard
          name="Metrics Timeseries"
          url="/api/metrics/timeseries"
          endpoint={endpoints.timeseries}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          getErrorRate={getErrorRate}
          getAverageLatency={getAverageLatency}
        />
      </div>

      {/* Overall Health */}
      <div className="mt-6 pt-6 border-t border-[#3c3c3c]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Overall Health</span>
          <div className="flex items-center gap-2">
            {endpoints.summary.status === 'online' && endpoints.timeseries.status === 'online' ? (
              <>
                <div className="w-2 h-2 rounded-full bg-[#4bce2a] animate-pulse" />
                <span className="text-sm font-medium text-[#4bce2a]">All Systems Operational</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-[#c4653a] animate-pulse" />
                <span className="text-sm font-medium text-[#c4653a]">Degraded Performance</span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EndpointCard({ name, url, endpoint, getStatusColor, getStatusIcon, getErrorRate, getAverageLatency }) {
  const StatusIcon = getStatusIcon(endpoint.status);
  const statusColor = getStatusColor(endpoint.status);

  return (
    <div className="bg-[#1f1f1f] rounded-xl border border-[#3c3c3c] p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StatusIcon className={`w-4 h-4 ${statusColor}`} />
            <h4 className="text-sm font-medium text-white">{name}</h4>
          </div>
          <code className="text-xs text-gray-500">{url}</code>
        </div>
        <div className={`text-xs uppercase tracking-wider font-medium ${statusColor}`}>
          {endpoint.status}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MetricBadge
          icon={Clock}
          label="Latency"
          value={endpoint.latency !== null ? `${endpoint.latency}ms` : '—'}
          subtext={getAverageLatency(endpoint.latency)}
          color={endpoint.latency < 300 ? 'text-[#4bce2a]' : 'text-[#ea00ea]'}
        />
        <MetricBadge
          icon={Activity}
          label="Requests"
          value={endpoint.totalRequests}
          subtext="Total"
          color="text-[#2699fe]"
        />
        <MetricBadge
          icon={AlertTriangle}
          label="Error Rate"
          value={`${getErrorRate(endpoint)}%`}
          subtext={`${endpoint.errorCount} errors`}
          color={endpoint.errorCount === 0 ? 'text-[#4bce2a]' : 'text-[#c4653a]'}
        />
      </div>
    </div>
  );
}

function MetricBadge({ icon: Icon, label, value, subtext, color }) {
  return (
    <div className="text-center">
      <Icon className={`w-3 h-3 mx-auto mb-1 ${color}`} />
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className={`text-sm font-medium ${color}`}>{value}</div>
      {subtext && <div className="text-xs text-gray-600 mt-0.5">{subtext}</div>}
    </div>
  );
}