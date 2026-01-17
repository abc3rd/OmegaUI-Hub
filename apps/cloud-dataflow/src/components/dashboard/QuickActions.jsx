
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CreateDatabaseDialog from "../databases/CreateDatabaseDialog";
import { User } from "@/entities/User";

export default function QuickActions() {
  const [open, setOpen] = React.useState(false);
  const [role, setRole] = React.useState("viewer");

  React.useEffect(() => {
    User.me().then(me => setRole(me.role || "viewer")).catch(() => setRole("viewer"));
  }, []);

  return (
    <div className="flex flex-wrap gap-3">
      <Link to={createPageUrl("ImportExport")}>
        <Button variant="outline" className="border-slate-300 hover:bg-slate-50">
          <Upload className="w-4 h-4 mr-2" />
          Import Data
        </Button>
      </Link>
      <Link to={createPageUrl("ImportExport")}>
        <Button variant="outline" className="border-slate-300 hover:bg-slate-50">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </Link>
      <Link to={createPageUrl("QueryEditor")}>
        <Button variant="outline" className="border-slate-300 hover:bg-slate-50">
          <Search className="w-4 h-4 mr-2" />
          New Query
        </Button>
      </Link>
      <Button className="bg-slate-800 hover:bg-slate-700" onClick={() => setOpen(true)} disabled={role !== "admin"}>
        <Plus className="w-4 h-4 mr-2" />
        Create Database
      </Button>
      <CreateDatabaseDialog open={open} onOpenChange={setOpen} onCreated={() => {}} />
    </div>
  );
}
