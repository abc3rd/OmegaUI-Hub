import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useSearchParams } from "react-router-dom";
import AuthGate from "../components/AuthGate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingDown, TrendingUp, Share2, Copy } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

export default function Compare() {
  const [searchParams] = useSearchParams();
  const [sessions, setSessions] = useState([]);
  const [session1Id, setSession1Id] = useState(searchParams.get('session1') || '');
  const [session2Id, setSession2Id] = useState(searchParams.get('session2') || '');
  const [session1, setSession1] = useState(null);
  const [session2, setSession2] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (session1Id) loadSession1();
  }, [session1Id]);

  useEffect(() => {
    if (session2Id) loadSession2();
  }, [session2Id]);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.Session.list("-created_date", 200);
      setSessions(data);
    } catch (error) {
      console.error("Error loading sessions:", error);
    }
    setIsLoading(false);
  };

  const loadSession1 = async () => {
    const data = await base44.entities.Session.filter({ id: session1Id });
    if (data.length > 0) setSession1(data[0]);
  };

  const loadSession2 = async () => {
    const data = await base44.entities.Session.filter({ id: session2Id });
    if (data.length > 0) setSession2(data[0]);
  };

  const generateShareLink = async () => {
    if (!session1 || !session2) {
      toast.error("Please select two sessions to compare");
      return;
    }

    const slug = `compare-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const filters = {
      session1Id: session1.id,
      session2Id: session2.id
    };

    await base44.entities.ShareReport.create({
      title: `${session1.workflowId} Comparison`,
      description: `Comparing ${session1.runType} vs ${session2.runType}`,
      filtersJson: JSON.stringify(filters),
      publicSlug: slug,
      isPublic: true
    });

    const shareUrl = `${window.location.origin}/r/${slug}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard!");
  };

  const calculateSavings = (baseline, optimized, field) => {
    if (!baseline || !optimized) return 0;
    const diff = baseline[field] - optimized[field];
    return (diff / baseline[field] * 100).toFixed(1);
  };

  const chartData = session1 && session2 ? [
    {
      metric: 'Tokens',
      [session1.runType]: session1.totalTokens,
      [session2.runType]: session2.totalTokens
    },
    {
      metric: 'Energy (Wh)',
      [session1.runType]: parseFloat(session1.energyWh.toFixed(2)),
      [session2.runType]: parseFloat(session2.energyWh.toFixed(2))
    },
    {
      metric: 'Latency (ms)',
      [session1.runType]: session1.latencyMs,
      [session2.runType]: session2.latencyMs
    },
    {
      metric: 'CO2 (g)',
      [session1.runType]: session1.co2g,
      [session2.runType]: session2.co2g
    }
  ] : [];

  return (
    <AuthGate>
      <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Compare Sessions</h1>
          <p className="text-slate-400">Side-by-side comparison of AI inference runs</p>
        </div>
        <Button onClick={generateShareLink} className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700">
          <Share2 className="w-4 h-4 mr-2" />
          Generate Share Link
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-md p-6">
          <h3 className="text-lg font-bold text-white mb-4">Session 1</h3>
          <Select value={session1Id} onValueChange={setSession1Id}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Select session..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {sessions.map(s => (
                <SelectItem key={s.id} value={s.id} className="text-white">
                  {s.workflowId} - {s.runType} - {s.model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {session1 && (
            <div className="mt-4 space-y-2">
              <Badge className={session1.runType === 'ucp' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}>
                {session1.runType}
              </Badge>
              <p className="text-slate-300 text-sm">{session1.appName}</p>
            </div>
          )}
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-md p-6">
          <h3 className="text-lg font-bold text-white mb-4">Session 2</h3>
          <Select value={session2Id} onValueChange={setSession2Id}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Select session..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {sessions.map(s => (
                <SelectItem key={s.id} value={s.id} className="text-white">
                  {s.workflowId} - {s.runType} - {s.model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {session2 && (
            <div className="mt-4 space-y-2">
              <Badge className={session2.runType === 'ucp' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}>
                {session2.runType}
              </Badge>
              <p className="text-slate-300 text-sm">{session2.appName}</p>
            </div>
          )}
        </Card>
      </div>

      {session1 && session2 && (
        <>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: 'Token Savings', field: 'totalTokens', unit: '%' },
              { label: 'Energy Savings', field: 'energyWh', unit: '%' },
              { label: 'Latency Improvement', field: 'latencyMs', unit: '%' },
              { label: 'CO2 Reduction', field: 'co2g', unit: '%' }
            ].map((metric, index) => {
              const baseline = session1.runType === 'baseline' ? session1 : session2;
              const optimized = session1.runType === 'ucp' ? session1 : session2;
              const savings = calculateSavings(baseline, optimized, metric.field);
              const isPositive = savings > 0;

              return (
                <Card key={index} className={`bg-gradient-to-br ${isPositive ? 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30' : 'from-red-500/20 to-red-500/5 border-red-500/30'} backdrop-blur-md p-6`}>
                  <div className="flex items-center gap-2 mb-2">
                    {isPositive ? <TrendingDown className="w-5 h-5 text-emerald-400" /> : <TrendingUp className="w-5 h-5 text-red-400" />}
                    <p className="text-slate-300 text-sm">{metric.label}</p>
                  </div>
                  <p className={`text-4xl font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? '-' : '+'}{Math.abs(savings)}{metric.unit}
                  </p>
                </Card>
              );
            })}
          </div>

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
        </>
      )}
      </div>
    </AuthGate>
  );
}