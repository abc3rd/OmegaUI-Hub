import React, { useEffect, useState } from "react";
import { ActivityLog } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Activity, Search } from "lucide-react";
import { format } from "date-fns";

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const data = await ActivityLog.list("-created_date", 200);
      setLogs(data);
    })();
  }, []);

  const filtered = logs.filter(l => {
    const act = actionFilter === "all" || l.action === actionFilter;
    const text = q.trim()
      ? (l.details || "").toLowerCase().includes(q.toLowerCase()) ||
        (l.entity_type || "").toLowerCase().includes(q.toLowerCase())
      : true;
    return act && text;
  });

  const color = (action) => ({
    CREATE: "bg-green-50 text-green-700 border-green-200",
    UPDATE: "bg-yellow-50 text-yellow-700 border-yellow-200",
    DELETE: "bg-red-50 text-red-700 border-red-200",
    QUERY: "bg-blue-50 text-blue-700 border-blue-200",
    IMPORT: "bg-purple-50 text-purple-700 border-purple-200",
    EXPORT: "bg-amber-50 text-amber-700 border-amber-200"
  }[action] || "bg-slate-50 text-slate-700 border-slate-200");

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold">Activity Logs</h1>

      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9" placeholder="Search details or type..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="CREATE">CREATE</SelectItem>
              <SelectItem value="UPDATE">UPDATE</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="QUERY">QUERY</SelectItem>
              <SelectItem value="IMPORT">IMPORT</SelectItem>
              <SelectItem value="EXPORT">EXPORT</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {filtered.map((log) => (
          <Card key={log.id} className="border-slate-200">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-9 h-9 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                <Activity className="w-4 h-4 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={color(log.action)}>{log.action}</Badge>
                  <span className="text-xs text-slate-500">{log.entity_type}</span>
                </div>
                <div className="font-medium text-slate-900 truncate mt-1">{log.details || `${log.action} ${log.entity_type}`}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {format(new Date(log.created_date), "PPpp")} • {log.created_by}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-slate-500 py-12">
            No logs found.
          </div>
        )}
      </div>
    </div>
  );
}