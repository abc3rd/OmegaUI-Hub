import React, { useEffect, useState } from "react";
import { Database as DatabaseEntity, Table as TableEntity } from "@/entities/all";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Database, Plus, Settings, ArrowLeft } from "lucide-react";
import CreateTableDialog from "@/components/databases/CreateTableDialog";
import TableList from "@/components/databases/TableList";

export default function DatabaseDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const dbId = urlParams.get("id");
  const [db, setDb] = useState(null);
  const [tables, setTables] = useState([]);
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [role, setRole] = useState("viewer");

  useEffect(() => {
    (async () => {
      const me = await User.me().catch(() => null);
      setRole(me?.role || "viewer");
      if (dbId) {
        const list = await DatabaseEntity.list();
        setDb(list.find(d => d.id === dbId) || null);
        const ts = await TableEntity.filter({ database_id: dbId }, "-last_modified", 100);
        setTables(ts);
      }
    })();
  }, [dbId]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("Databases")}>
            <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
          </Link>
          <h1 className="text-2xl font-bold">Database Details</h1>
        </div>
        <Button variant="outline" className="border-slate-300">
          <Settings className="w-4 h-4 mr-1" /> Settings
        </Button>
      </div>

      {db ? (
        <>
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-slate-600" />
                {db.name}
                <Badge variant="secondary" className="ml-2">
                  {db.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">{db.description || "No description"}</p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Tables</h2>
            {(role === "admin" || role === "editor") && (
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowCreateTable(true)}>
                <Plus className="w-4 h-4 mr-1" /> New Table
              </Button>
            )}
          </div>

          <TableList
            tables={tables}
            canEdit={role === "admin" || role === "editor"}
            onDeleted={() => {
              TableEntity.filter({ database_id: dbId }).then(setTables);
            }}
          />

          <CreateTableDialog
            open={showCreateTable}
            onOpenChange={setShowCreateTable}
            databaseId={dbId}
            onCreated={() => TableEntity.filter({ database_id: dbId }).then(setTables)}
          />
        </>
      ) : (
        <div className="text-slate-500">Database not found.</div>
      )}
    </div>
  );
}