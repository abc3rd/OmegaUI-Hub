import React from "react";
import { DataRecord, ActivityLog } from "@/entities/all";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import FileDropzone from "./FileDropzone";
import { UploadFile, ExtractDataFromUploadedFile } from "@/integrations/Core";

export default function Importer({ databases, tables, loading, onImported }) {
  const [role, setRole] = React.useState("viewer");
  const [selectedDb, setSelectedDb] = React.useState("");
  const [selectedTable, setSelectedTable] = React.useState("");
  const [tableSchema, setTableSchema] = React.useState(null);

  const [fileUrl, setFileUrl] = React.useState("");
  const [rawRows, setRawRows] = React.useState([]); // array of objects
  const [mapping, setMapping] = React.useState({}); // {tableColName: fileKey}
  const [importing, setImporting] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    User.me().then(me => setRole(me.role || "viewer")).catch(() => setRole("viewer"));
  }, []);

  const filteredTables = React.useMemo(() => {
    return tables.filter(t => t.database_id === selectedDb);
  }, [tables, selectedDb]);

  React.useEffect(() => {
    setSelectedTable("");
    setTableSchema(null);
    setMapping({});
    setRawRows([]);
    setFileUrl("");
  }, [selectedDb]);

  React.useEffect(() => {
    const schema = filteredTables.find(t => t.id === selectedTable) || null;
    setTableSchema(schema);
    if (schema?.columns) {
      const initial = {};
      schema.columns.forEach(c => { initial[c.name] = ""; });
      setMapping(initial);
    } else {
      setMapping({});
    }
  }, [filteredTables, selectedTable]);

  const onFiles = async (files) => {
    setError("");
    if (!files?.length) return;
    const file = files[0];
    const { file_url } = await UploadFile({ file });
    setFileUrl(file_url);

    const schema = {
      type: "object",
      properties: {
        rows: {
          type: "array",
          items: { type: "object", additionalProperties: true }
        }
      },
      required: ["rows"]
    };

    const res = await ExtractDataFromUploadedFile({
      file_url,
      json_schema: schema
    });
    if (res.status !== "success" || !res.output) {
      setError("Could not extract data from file. Please ensure CSV/JSON format is valid.");
      return;
    }
    const output = Array.isArray(res.output) ? res.output : (res.output.rows || []);
    setRawRows(output);
    // Auto-map headers if possible
    if (tableSchema?.columns?.length) {
      const auto = {};
      tableSchema.columns.forEach(c => {
        const hit = Object.keys(output[0] || {}).find(k => k.toLowerCase() === c.name.toLowerCase());
        auto[c.name] = hit || "";
      });
      setMapping(auto);
    }
  };

  const buildRecords = React.useCallback(() => {
    return rawRows.map((row) => {
      const data = {};
      (tableSchema?.columns || []).forEach(col => {
        const key = mapping[col.name];
        if (key) {
          let val = row[key];
          if (col.type === "number") {
            const n = Number(val);
            val = isNaN(n) ? null : n;
          } else if (col.type === "boolean") {
            val = String(val).toLowerCase() === "true" || String(val) === "1";
          }
          data[col.name] = val;
        }
      });
      return { table_id: selectedTable, data };
    });
  }, [rawRows, tableSchema, mapping, selectedTable]);

  const chunk = (arr, size) => {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  const doImport = React.useCallback(async () => {
    setError("");
    if (!selectedDb || !selectedTable || !tableSchema) {
      setError("Please select a database and table.");
      return;
    }
    if (rawRows.length === 0) {
      setError("No data to import. Upload a CSV or JSON file first.");
      return;
    }
    setImporting(true);
    const records = buildRecords();
    const parts = chunk(records, 100);
    for (let i = 0; i < parts.length; i++) {
      await DataRecord.bulkCreate(parts[i]);
      setProgress(Math.round(((i + 1) / parts.length) * 100));
    }
    // Log only if admin due to RLS
    if (role === "admin") {
      await ActivityLog.create({
        database_id: selectedDb,
        table_id: selectedTable,
        action: "IMPORT",
        entity_type: "table",
        entity_id: selectedTable,
        details: `Imported ${records.length} records into ${tableSchema.name}`
      });
    }
    setImporting(false);
    setProgress(0);
    onImported?.();
  }, [selectedDb, selectedTable, tableSchema, rawRows, buildRecords, role, onImported]);

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Import Wizard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-3">
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
            <Label>Upload File</Label>
            <FileDropzone onFiles={onFiles} />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {rawRows.length > 0 && tableSchema && (
          <div className="space-y-3">
            <div className="font-semibold text-slate-900">Column Mapping</div>
            <div className="grid md:grid-cols-3 gap-3">
              {(tableSchema.columns || []).map((c) => (
                <div key={c.name} className="space-y-1">
                  <Label>{c.name} <span className="text-xs text-slate-400">({c.type})</span></Label>
                  <Select
                    value={mapping[c.name] || ""}
                    onValueChange={(v) => setMapping(m => ({ ...m, [c.name]: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select from file columns" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(rawRows[0] || {}).map((k) => (
                        <SelectItem key={k} value={k}>{k}</SelectItem>
                      ))}
                      <SelectItem value={null}>— Ignore —</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="text-sm text-slate-600">Preview (first 5 rows)</div>
              <div className="overflow-auto border rounded">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {Object.keys(rawRows[0] || {}).map((k) => (
                        <th key={k} className="px-3 py-2 text-left font-semibold text-slate-700">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rawRows.slice(0, 5).map((r, i) => (
                      <tr key={i} className="border-t">
                        {Object.keys(rawRows[0] || {}).map((k) => (
                          <td key={k} className="px-3 py-2">{String(r[k] ?? "")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {importing && (
              <div className="space-y-2">
                <Progress value={progress} />
                <div className="text-xs text-slate-500">{progress}%</div>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={doImport} disabled={importing || !selectedTable || rawRows.length === 0}>
                Import {rawRows.length > 0 ? `(${rawRows.length})` : ""}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}