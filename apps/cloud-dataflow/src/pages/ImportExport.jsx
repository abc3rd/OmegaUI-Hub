
import React, { useEffect, useState } from "react";
import { Database as DatabaseEntity, Table as TableEntity } from "@/entities/all";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Upload, Download, Info } from "lucide-react";
import Importer from "@/components/import/Importer";
import Exporter from "@/components/export/Exporter";

export default function ImportExportPage() {
  const [role, setRole] = useState("viewer");
  const [databases, setDatabases] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const me = await User.me().catch(() => null);
    setRole(me?.role || "viewer");
    const dbs = await DatabaseEntity.list("-created_date", 200);
    const tbls = await TableEntity.list("-updated_date", 500);
    setDatabases(dbs);
    setTables(tbls);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Import and Export</h1>
          <p className="text-slate-600">Move data in and out using CSV or JSON with a step-by-step flow.</p>
        </div>
        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
          Role: {role}
        </Badge>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-600" />
            Quick Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="font-semibold">Import (CSV/JSON)</div>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Choose a database and table to import into.</li>
                <li>Upload a CSV (first row headers) or a JSON array of objects.</li>
                <li>Map file columns to table columns (auto-mapped when possible).</li>
                <li>Review a preview, then Import. Admin/Editor only.</li>
              </ol>
            </div>
            <div className="space-y-1">
              <div className="font-semibold">Export (CSV/JSON)</div>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Choose a database and table to export.</li>
                <li>Pick file format (CSV or JSON).</li>
                <li>Download the exported file. Viewers are allowed to export.</li>
              </ol>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Info className="w-3.5 h-3.5" />
            <span>
              CSV tips: Use UTF-8, first row must be headers; JSON must be an array of objects like <code>{`[{"name":"Alice","age":30}]`}</code>.
            </span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="import" className="w-full">
        <TabsList className="bg-slate-100 grid grid-cols-2 w-full md:w-auto">
          <TabsTrigger value="import" className="data-[state=active]:bg-white">
            <Upload className="w-4 h-4 mr-2" /> Import
          </TabsTrigger>
          <TabsTrigger value="export" className="data-[state=active]:bg-white">
            <Download className="w-4 h-4 mr-2" /> Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="mt-6">
          {(role === "admin" || role === "editor") ? (
            <Importer
              databases={databases}
              tables={tables}
              loading={loading}
              onImported={load}
            />
          ) : (
            <Alert variant="destructive">
              <AlertDescription>Only admins and editors can import data.</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="export" className="mt-6">
          <Exporter
            databases={databases}
            tables={tables}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
