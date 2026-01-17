import { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, Check, Clock, FileText, Code } from "lucide-react";
import { format } from "date-fns";

export default function ExecutionResult({ execution }) {
  const [copied, setCopied] = useState(false);

  const copyResult = () => {
    const text = typeof execution.result === "object"
      ? JSON.stringify(execution.result, null, 2)
      : execution.result;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-medium text-white">Execution Result</h3>
          <StatusBadge status={execution.status} />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="h-3 w-3" />
          {execution.duration_ms}ms
        </div>
      </div>

      {execution.status === "failed" ? (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-300">{execution.error_message || "Execution failed"}</p>
        </div>
      ) : !execution.result ? (
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-slate-400">No output returned from execution.</p>
        </div>
      ) : (
        <Tabs defaultValue="formatted" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="formatted" className="data-[state=active]:bg-white/10">
                <FileText className="mr-2 h-4 w-4" />
                Formatted
              </TabsTrigger>
              <TabsTrigger value="raw" className="data-[state=active]:bg-white/10">
                <Code className="mr-2 h-4 w-4" />
                Raw
              </TabsTrigger>
            </TabsList>
            <Button
              variant="outline"
              size="sm"
              onClick={copyResult}
              className="border-white/20 text-slate-300"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-3 w-3" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-3 w-3" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <TabsContent value="formatted" className="mt-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              {typeof execution.result === "object" && execution.result !== null ? (
                <div className="space-y-3">
                  {Object.entries(execution.result).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs text-slate-400 uppercase tracking-wide">{key}</p>
                      <p className="text-white mt-1 whitespace-pre-wrap">
                        {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white whitespace-pre-wrap">{String(execution.result)}</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="raw" className="mt-4">
            <pre className="p-4 rounded-lg bg-white/5 border border-white/10 overflow-auto max-h-[400px]">
              <code className="text-sm text-slate-300">
                {JSON.stringify(execution.result, null, 2)}
              </code>
            </pre>
          </TabsContent>
        </Tabs>
      )}

      <div className="mt-4 pt-4 border-t border-white/10 text-xs text-slate-500">
        Executed {format(new Date(execution.created_date), "MMM d, yyyy 'at' h:mm a")}
        {execution.executed_by && ` by ${execution.executed_by}`}
      </div>
    </GlassCard>
  );
}