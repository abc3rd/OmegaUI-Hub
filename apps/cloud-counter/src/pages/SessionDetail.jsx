import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useSearchParams, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AuthGate from "../components/AuthGate";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, Clock, Layers, DollarSign, Leaf, GitCompare } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function SessionDetail() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('id');
  const [session, setSession] = useState(null);
  const [relatedSession, setRelatedSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    setIsLoading(true);
    try {
      const sessions = await base44.entities.Session.filter({ id: sessionId });
      if (sessions.length > 0) {
        const sess = sessions[0];
        setSession(sess);

        // Find related session (opposite runType, same workflowId)
        const oppositeRunType = sess.runType === 'baseline' ? 'ucp' : 'baseline';
        const related = await base44.entities.Session.filter({ 
          workflowId: sess.workflowId, 
          runType: oppositeRunType 
        });
        if (related.length > 0) {
          setRelatedSession(related[0]);
        }
      }
    } catch (error) {
      console.error("Error loading session:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-8">
        <Skeleton className="h-12 w-64 bg-slate-700" />
        <Skeleton className="h-96 w-full bg-slate-700" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6">
        <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
          <p className="text-slate-400">Session not found</p>
          <Link to={createPageUrl("Sessions")}>
            <Button className="mt-4">Back to Sessions</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const metrics = [
    { icon: Layers, label: "Prompt Tokens", value: session.promptTokens.toLocaleString() },
    { icon: Layers, label: "Completion Tokens", value: session.completionTokens.toLocaleString() },
    { icon: Layers, label: "Total Tokens", value: session.totalTokens.toLocaleString(), highlight: true },
    { icon: Clock, label: "Latency", value: `${session.latencyMs}ms` },
    { icon: Zap, label: "Energy", value: `${session.energyWh.toFixed(4)} Wh`, badge: session.energyMode },
    { icon: Leaf, label: "CO2 Emissions", value: session.co2g ? `${session.co2g.toFixed(2)}g` : 'N/A' },
    { icon: DollarSign, label: "Cost", value: session.costUsd ? `$${session.costUsd.toFixed(4)}` : 'N/A' },
  ];

  return (
    <AuthGate>
      <div className="p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Link to={createPageUrl("Sessions")}>
          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-bold text-white">Session Detail</h1>
          <p className="text-slate-400">{format(new Date(session.created_date), 'MMM dd, yyyy HH:mm:ss')}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-md p-6">
          <h2 className="text-xl font-bold text-white mb-4">Session Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">App Name:</span>
              <span className="text-white font-medium">{session.appName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Workflow ID:</span>
              <span className="text-white font-medium">{session.workflowId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Run Type:</span>
              <Badge className={session.runType === 'ucp' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}>
                {session.runType}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Model:</span>
              <span className="text-white font-medium">{session.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Source:</span>
              <span className="text-white font-medium">{session.source}</span>
            </div>
            {session.ucpPacketId && (
              <div className="flex justify-between">
                <span className="text-slate-400">UCP Packet ID:</span>
                <span className="text-white font-medium text-xs">{session.ucpPacketId}</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-md p-6">
          <h2 className="text-xl font-bold text-white mb-4">Metrics</h2>
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className={`p-4 rounded-lg ${metric.highlight ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-700/50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <metric.icon className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400 text-sm">{metric.label}</span>
                </div>
                <p className="text-white text-lg font-bold">{metric.value}</p>
                {metric.badge && (
                  <Badge className="mt-2 bg-slate-600 text-slate-300 text-xs">{metric.badge}</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {relatedSession && (
        <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/30 backdrop-blur-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Related {relatedSession.runType.toUpperCase()} Run Found</h2>
              <p className="text-slate-300">
                Compare this {session.runType} run with the {relatedSession.runType} run from the same workflow
              </p>
            </div>
            <Link to={`${createPageUrl("Compare")}?session1=${session.id}&session2=${relatedSession.id}`}>
              <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700">
                <GitCompare className="w-4 h-4 mr-2" />
                Compare Runs
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {session.notes && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-md p-6">
          <h2 className="text-xl font-bold text-white mb-4">Notes</h2>
          <p className="text-slate-300">{session.notes}</p>
        </Card>
      )}
    </div>
    </AuthGate>
  );
}