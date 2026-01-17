import React from "react";
import { DataRecord, ActivityLog } from "@/entities/all";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function Exporter({ databases, tables, loading }) {
  const [role, setRole] = React.useState("viewer");
  const [selectedDb, setSelectedDb] = React.useState("");
  const [selectedTable, setSelectedTable] = React.useState("");
  const [tableSchema, setTableSchema] = React.useState(null);
  const [records, setRecords] = React.useState([]);
  const [format, setFormat] = React.useState("csv");

  React.useEffect(() => {
    User.me().then(me => setRole(me.role || "viewer")).catch(() => setRole("viewer"));
  }, []);

  const filteredTables = React.useMemo(() => {
    return tables.filter(t => t.database_id === selectedDb);
  }, [tables, selectedDb]);

  React.useEffect(() => {
    const schema = filteredTables.find(t => t.id === selectedTable) || null;
    setTableSchema(schema);
    if (selectedTable) {
      DataRecord.filter({ table_id: selectedTable }, "-updated_date", 1000).then(setRecords);
    } else {
      setRecords([]);
    }
  }, [filteredTables, selectedTable]);

  const doExport = async () => {
    const cols = tableSchema?.columns?.map(c => c.name) || [];
    const rows = records.map(r => cols.map(c => r.data?.[c]));

    if (format === "json") {
      const json = records.map(r => r.data || {});
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tableSchema?.name || "data"}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const header = cols.join(",");
      const body = rows.map(r => r.map(cell => {
        const v = cell == null ? "" : String(cell);
        if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
        return v;
      }).join(",")).join("\n");
      const csv = `${header}\n${body}`;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tableSchema?.name || "data"}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    if (role === "admin") {
      await ActivityLog.create({
        database_id: selectedDb,
        table_id: selectedTable,
        action: "EXPORT",
        entity_type: "table",
        entity_id: selectedTable,
        details: `Exported ${records.length} records from ${tableSchema?.name}`
      });
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Export Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-4 gap-3">
          <div className="space-y-2">
            <Label>Database</Label>
            <Select value={selectedDb} onValueChange={setSelectedDb} disabled={loading}>
              <SelectTrigger><SelectValue placeholder="Choose database" /></SelectTrigger>
              <SelectContent>
                {databases.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Table</Label>
            <Select value={selectedTable} onValueChange={setSelectedTable} disabled={!selectedDb}>
              <SelectTrigger><SelectValue placeholder="Choose table" /></SelectTrigger>
              <SelectContent>
                {filteredTables.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger><SelectValue placeholder="Choose format" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button className="w-full" disabled={!selectedTable} onClick={doExport}>
              Download
            </Button>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          {records.length} records loaded.
        </div>
      </CardContent>
    </Card>
  );
}