import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TopWorkflows({ sessions, isLoading }) {
  // Calculate savings by workflow
  const workflowData = sessions.reduce((acc, session) => {
    const wfId = session.workflowId;
    if (!acc[wfId]) {
      acc[wfId] = { workflowId: wfId, baseline: [], ucp: [] };
    }
    if (session.runType === 'baseline') {
      acc[wfId].baseline.push(session);
    } else {
      acc[wfId].ucp.push(session);
    }
    return acc;
  }, {});

  const workflowSavings = Object.values(workflowData)
    .filter(wf => wf.baseline.length > 0 && wf.ucp.length > 0)
    .map(wf => {
      const avgBaselineTokens = wf.baseline.reduce((sum, s) => sum + s.totalTokens, 0) / wf.baseline.length;
      const avgUcpTokens = wf.ucp.reduce((sum, s) => sum + s.totalTokens, 0) / wf.ucp.length;
      const savings = ((avgBaselineTokens - avgUcpTokens) / avgBaselineTokens * 100);
      
      return {
        workflowId: wf.workflowId,
        savings,
        runs: wf.baseline.length + wf.ucp.length
      };
    })
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 5);

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-md p-6">
      <h3 className="text-xl font-bold text-white mb-6">Top Workflows by Savings</h3>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full bg-slate-700" />
          ))}
        </div>
      ) : workflowSavings.length === 0 ? (
        <p className="text-slate-400 text-center py-8">No workflow comparisons available</p>
      ) : (
        <div className="space-y-3">
          {workflowSavings.map((wf, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="text-white font-medium">{wf.workflowId}</p>
                  <p className="text-slate-400 text-sm">{wf.runs} runs</p>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                <TrendingDown className="w-3 h-3 mr-1" />
                {wf.savings.toFixed(1)}%
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}