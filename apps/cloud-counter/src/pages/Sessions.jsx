import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AuthGate from "../components/AuthGate";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, ExternalLink, GitCompare } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    const filtered = sessions.filter(session => 
      session.workflowId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.model.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSessions(filtered);
  }, [searchTerm, sessions]);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.Session.list("-created_date", 200);
      setSessions(data);
      setFilteredSessions(data);
    } catch (error) {
      console.error("Error loading sessions:", error);
    }
    setIsLoading(false);
  };

  const exportToCSV = () => {
    const headers = ["Date", "App", "Workflow", "Run Type", "Model", "Total Tokens", "Energy (Wh)", "Latency (ms)", "Cost ($)"];
    const rows = filteredSessions.map(s => [
      format(new Date(s.created_date), 'yyyy-MM-dd HH:mm:ss'),
      s.appName,
      s.workflowId,
      s.runType,
      s.model,
      s.totalTokens,
      s.energyWh.toFixed(4),
      s.latencyMs,
      s.costUsd?.toFixed(4) || '0'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-energy-sessions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const findPairedSession = async (session) => {
    const oppositeType = session.runType === 'baseline' ? 'ucp' : 'baseline';
    const paired = await base44.entities.Session.filter({
      workflowId: session.workflowId,
      runType: oppositeType
    });
    return paired.length > 0 ? paired[0] : null;
  };

  return (
    <AuthGate>
      <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Sessions</h1>
          <p className="text-slate-400">Browse and analyze all recorded inference sessions</p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <Search className="w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search by workflow, app, or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Date</TableHead>
                <TableHead className="text-slate-300">App</TableHead>
                <TableHead className="text-slate-300">Workflow</TableHead>
                <TableHead className="text-slate-300">Run Type</TableHead>
                <TableHead className="text-slate-300">Model</TableHead>
                <TableHead className="text-slate-300 text-right">Tokens</TableHead>
                <TableHead className="text-slate-300 text-right">Energy (Wh)</TableHead>
                <TableHead className="text-slate-300 text-right">Latency</TableHead>
                <TableHead className="text-slate-300 text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading ? (
                [...Array(10)].map((_, i) => (
                  <TableRow key={i} className="border-slate-700">
                    <TableCell><Skeleton className="h-4 w-24 bg-slate-700" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 bg-slate-700" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32 bg-slate-700" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 bg-slate-700" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 bg-slate-700" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 bg-slate-700" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 bg-slate-700" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 bg-slate-700" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 bg-slate-700" /></TableCell>
                  </TableRow>
                ))
                ) : filteredSessions.map((session) => (
                <TableRow key={session.id} className="border-slate-700 hover:bg-slate-700/50">
                  <TableCell className="text-slate-300">
                    {format(new Date(session.created_date), 'MMM dd, HH:mm')}
                  </TableCell>
                  <TableCell className="text-slate-300">{session.appName}</TableCell>
                  <TableCell className="text-slate-300">{session.workflowId}</TableCell>
                  <TableCell>
                    <Badge className={session.runType === 'ucp' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}>
                      {session.runType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300">{session.model}</TableCell>
                  <TableCell className="text-right text-slate-300">{session.totalTokens.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-slate-300">
                    {session.energyWh.toFixed(4)}
                    <span className="text-xs text-slate-500 ml-1">({session.energyMode})</span>
                  </TableCell>
                  <TableCell className="text-right text-slate-300">{session.latencyMs}ms</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Link to={`${createPageUrl("SessionDetail")}?id=${session.id}`}>
                        <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-emerald-400 hover:text-emerald-300"
                        onClick={async () => {
                          const paired = await findPairedSession(session);
                          if (paired) {
                            window.location.href = `${createPageUrl("Compare")}?session1=${session.id}&session2=${paired.id}`;
                          }
                        }}
                      >
                        <GitCompare className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                ))}
                </TableBody>
          </Table>
        </div>
      </Card>
    </div>
    </AuthGate>
  );
}