import React, { useEffect, useState, useCallback } from "react";
import { Dashboard as DashboardEntity, Database as DatabaseEntity } from "@/entities/all";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, Plus, BarChart3, Edit3, Globe, Lock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ShareDashboardDialog from "@/components/dashboard/ShareDashboardDialog";

export default function VisualizationsPage() {
  const [dashboards, setDashboards] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", is_public: false, database_id: "" });
  const [role, setRole] = useState("viewer");
  const [databases, setDatabases] = useState([]);
  const [sharingDashboard, setSharingDashboard] = useState(null);

  const load = useCallback(async () => {
    const data = await DashboardEntity.list("-updated_date", 100);
    setDashboards(data);
  }, []);

  const loadDatabases = useCallback(async () => {
    const dbs = await DatabaseEntity.list("-created_date", 200);
    setDatabases(dbs);
    if (dbs.length > 0) {
      setForm((f) => ({ ...f, database_id: f.database_id || dbs[0].id }));
    }
  }, []);

  useEffect(() => {
    User.me().then(me => setRole(me.role || "viewer")).catch(() => setRole("viewer"));
    load();
    loadDatabases();
  }, [load, loadDatabases]);

  const createDashboard = async (e) => {
    e.preventDefault();
    if (!form.database_id) return;
    await DashboardEntity.create({
      name: form.name.trim(),
      description: form.description,
      is_public: form.is_public,
      widgets: [],
      database_id: form.database_id,
      shared_with: []
    });
    setShowNew(false);
    setForm({ name: "", description: "", is_public: false, database_id: databases[0]?.id || "" });
    load();
  };

  const updateDashboardSharing = async (dashboardId, updates) => {
    await DashboardEntity.update(dashboardId, updates);
    load();
  };

  const getAccessInfo = (dashboard) => {
    if (dashboard.is_public) {
      return { icon: Globe, label: "Public", color: "bg-green-50 text-green-700 border-green-200" };
    }
    if (dashboard.shared_with?.length > 0) {
      return { 
        icon: Users, 
        label: `Shared (${dashboard.shared_with.length})`, 
        color: "bg-blue-50 text-blue-700 border-blue-200" 
      };
    }
    return { icon: Lock, label: "Private", color: "bg-slate-50 text-slate-700 border-slate-200" };
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboards</h1>
          <p className="text-slate-600 mt-1">Create and manage data visualizations</p>
        </div>
        {(role === "admin" || role === "editor") && (
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowNew(true)}>
            <Plus className="w-4 h-4 mr-1" /> New Dashboard
          </Button>
        )}
      </div>

      {showNew && (
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Create Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createDashboard} className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-1">
                <Select
                  value={form.database_id}
                  onValueChange={(v) => setForm({ ...form, database_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select database" />
                  </SelectTrigger>
                  <SelectContent>
                    {databases.map((db) => (
                      <SelectItem key={db.id} value={db.id}>{db.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <div className="flex items-center gap-2">
                <Switch checked={form.is_public} onCheckedChange={(v) => setForm({ ...form, is_public: v })} />
                <span className="text-sm">Make public</span>
              </div>
              <div className="md:col-span-3 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={!form.database_id}>Create</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {dashboards.map((d) => {
          const accessInfo = getAccessInfo(d);
          const AccessIcon = accessInfo.icon;
          
          return (
            <Card key={d.id} className="border-slate-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{d.name}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                      {d.description || "No description"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="secondary" className={accessInfo.color}>
                    <AccessIcon className="w-3 h-3 mr-1" />
                    {accessInfo.label}
                  </Badge>
                  {d.widgets?.length > 0 && (
                    <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                      {d.widgets.length} widgets
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Show shared users if applicable */}
                {!d.is_public && d.shared_with?.length > 0 && (
                  <div className="mb-3 pb-3 border-b border-slate-100">
                    <div className="text-xs text-slate-500 mb-2">Shared with:</div>
                    <div className="flex flex-wrap gap-1">
                      {d.shared_with.slice(0, 3).map((email) => (
                        <Badge key={email} variant="secondary" className="text-xs bg-slate-100">
                          {email.split('@')[0]}
                        </Badge>
                      ))}
                      {d.shared_with.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-slate-100">
                          +{d.shared_with.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to={createPageUrl(`DashboardBuilder?id=${d.id}&view=true`)}>
                      <BarChart3 className="w-4 h-4 mr-1" /> View
                    </Link>
                  </Button>
                  {(role === "admin" || role === "editor") && (
                    <>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={createPageUrl(`DashboardBuilder?id=${d.id}`)}>
                          <Edit3 className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSharingDashboard(d)}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {dashboards.length === 0 && (
          <div className="col-span-full text-center text-slate-500 py-12">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No dashboards yet</h3>
            <p className="text-slate-500 mb-6">Create your first dashboard to visualize your data</p>
            {(role === "admin" || role === "editor") && (
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowNew(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Dashboard
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Share Dashboard Dialog */}
      <ShareDashboardDialog
        open={!!sharingDashboard}
        onOpenChange={(open) => !open && setSharingDashboard(null)}
        dashboard={sharingDashboard}
        onUpdate={updateDashboardSharing}
      />
    </div>
  );
}