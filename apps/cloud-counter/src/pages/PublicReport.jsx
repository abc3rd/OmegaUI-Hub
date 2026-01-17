import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingDown, Zap, Clock, AlertCircle, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicReport() {
  const { slug } = useParams();
  const [report, setReport] = useState(null);
  const [session1, setSession1] = useState(null);
  const [session2, setSession2] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReport();
  }, [slug]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const reports = await base44.entities.ShareReport.filter({ publicSlug: slug });
      if (reports.length === 0) {
        setError("Report not found");
        setIsLoading(false);
        return;
      }

      const reportData = reports[0];
      setReport(reportData);

      const filters = JSON.parse(reportData.filtersJson);
      
      if (filters.session1Id && filters.session2Id) {
        const [s1Data, s2Data] = await Promise.all([
          base44.entities.Session.filter({ id: filters.session1Id }),
          base44.entities.Session.filter({ id: filters.session2Id })
        ]);
        
        if (s1Data.length > 0) setSession1(s1Data[0]);
        if (s2Data.length > 0) setSession2(s2Data[0]);
      }
    } catch (error) {
      console.error("Error loading report:", error);
      setError("Failed to load report");
    }
    setIsLoading(false);
  };

  const calculateSavings = (baseline, optimized, field) => {
    if (!baseline || !optimized) return 0;
    const diff = baseline[field] - optimized[field];
    return (diff / baseline[field] * 100).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-24 w-full bg-slate-700" />
          <Skeleton className="h-96 w-full bg-slate-700" />
        </div>
      </div>
    );
  }

  if (error || !session1 || !session2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700 p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Report Not Found</h2>
          <p className="text-slate-400 mb-6">{error || "This report does not exist or has been removed."}</p>
          <Link to="/">
            <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600">
              Go to Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const baseline = session1.runType === 'baseline' ? session1 : session2;
  const ucp = session1.runType === 'ucp' ? session1 : session2;

  const chartData = [
    {
      metric: 'Tokens',
      baseline: baseline.totalTokens,
      ucp: ucp.totalTokens
    },
    {
      metric: 'Energy (Wh)',
      baseline: parseFloat(baseline.energyWh.toFixed(4)),
      ucp: parseFloat(ucp.energyWh.toFixed(4))
    },
    {
      metric: 'Latency (ms)',
      baseline: baseline.latencyMs,
      ucp: ucp.latencyMs
    }
  ];

  const tokenSavings = calculateSavings(baseline, ucp, 'totalTokens');
  const energySavings = calculateSavings(baseline, ucp, 'energyWh');
  const latencySavings = calculateSavings(baseline, ucp, 'latencyMs');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* UCP Link Top */}
        <div className="text-center">
          <a 
            href="https://ucp.omegaui.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Learn more about Universal Command Protocol (UCP)
          </a>
        </div>

        {/* Header */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-md p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{report.title}</h1>
              <p className="text-slate-400">{report.description}</p>
              <div className="flex gap-2 mt-3">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                  Workflow: {baseline.workflowId}
                </Badge>
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                  Model: {baseline.model}
                </Badge>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Cloud Counter
              </Button>
            </Link>
          </div>
        </Card>

        {/* Savings Summary */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 backdrop-blur-md p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-emerald-400" />
              <p className="text-slate-300 text-sm">Token Savings</p>
            </div>
            <p className="text-4xl font-bold text-emerald-400">-{tokenSavings}%</p>
            <p className="text-slate-400 text-xs mt-2">
              {baseline.totalTokens.toLocaleString()} → {ucp.totalTokens.toLocaleString()} tokens
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 backdrop-blur-md p-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <p className="text-slate-300 text-sm">Energy Savings</p>
            </div>
            <p className="text-4xl font-bold text-cyan-400">-{energySavings}%</p>
            <p className="text-slate-400 text-xs mt-2">
              {baseline.energyWh.toFixed(4)} → {ucp.energyWh.toFixed(4)} Wh ({baseline.energyMode})
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/30 backdrop-blur-md p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <p className="text-slate-300 text-sm">Latency Improvement</p>
            </div>
            <p className="text-4xl font-bold text-purple-400">-{latencySavings}%</p>
            <p className="text-slate-400 text-xs mt-2">
              {baseline.latencyMs} → {ucp.latencyMs} ms
            </p>
          </Card>
        </div>

        {/* Chart */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-md p-6">
          <h3 className="text-xl font-bold text-white mb-6">Comparison Chart</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="metric" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Legend />
              <Bar dataKey="baseline" fill="#ef4444" name="Baseline" />
              <Bar dataKey="ucp" fill="#10b981" name="UCP" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Disclaimer */}
        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 backdrop-blur-md p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-slate-300 text-sm">
              <p className="font-semibold text-white mb-1">Important Note</p>
              <p>
                Energy values are {baseline.energyMode === 'estimated' ? 'estimated' : 'measured'}.
                {baseline.energyMode === 'estimated' && ' Estimates are based on average power consumption and may vary from actual values.'}
              </p>
            </div>
          </div>
        </Card>

        {/* UCP Link Bottom */}
        <div className="text-center pt-6">
          <a 
            href="https://ucp.omegaui.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300"
          >
            <ExternalLink className="w-5 h-5" />
            Visit the Universal Command Protocol website
          </a>
        </div>
      </div>
    </div>
  );
}