
import React, { useState, useEffect } from "react";
import { Database as DatabaseEntity, ActivityLog } from "@/entities/all"; // Added ActivityLog
import { User } from "@/entities/User";
import CreateDatabaseDialog from "../components/databases/CreateDatabaseDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Plus,
  Search,
  MoreHorizontal,
  Activity,
  Settings,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import ConfirmDialog from "@/components/shared/ConfirmDialog"; // New import

// Helper function to create page URLs based on the outline's convention
const createPageUrl = (pageWithParams) => {
  if (pageWithParams.startsWith("DatabaseDetail")) {
    const parts = pageWithParams.split('?');
    const params = new URLSearchParams(parts[1]);
    const id = params.get('id');
    return `/databases/${id}`; // Example: /databases/123
  }
  if (pageWithParams.startsWith("QueryEditor")) {
    // Example: /query-editor?db=123
    return `/query-editor?${pageWithParams.split('?')[1]}`;
  }
  // Fallback or other specific cases can be added here
  return `/${pageWithParams.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
};

export default function Databases() {
  const [databases, setDatabases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [role, setRole] = useState("viewer");
  const [deletingDatabase, setDeletingDatabase] = useState(null); // New state for delete confirmation

  useEffect(() => {
    loadDatabases();
    // Fetch user role on component mount
    (async () => {
      const me = await User.me().catch(() => null);
      setRole(me?.role || "viewer");
    })();
  }, []);

  const loadDatabases = async () => {
    setIsLoading(true);
    try {
      const data = await DatabaseEntity.list('-created_date');
      setDatabases(data);
    } catch (error) {
      console.error("Error loading databases:", error);
    }
    setIsLoading(false);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "postgresql": return "🐘";
      case "mysql": return "🐬";
      case "mongodb": return "🍃";
      case "sqlite": return "💾";
      case "mssql": return "🗄️";
      default: return "📊";
    }
  };

  const getConnectionStatus = (db) => {
    if (db.type === "internal") return null;
    
    const status = db.connection_status || "disconnected";
    const config = {
      connected: { label: "Connected", color: "bg-green-50 text-green-700 border-green-200" },
      disconnected: { label: "Disconnected", color: "bg-slate-100 text-slate-600 border-slate-200" },
      error: { label: "Connection Error", color: "bg-red-50 text-red-700 border-red-200" }
    };
    
    return config[status] || config.disconnected;
  };

  const handleDelete = async () => {
    if (!deletingDatabase) return;
    try {
      await DatabaseEntity.delete(deletingDatabase.id);
      await ActivityLog.create({
        database_id: deletingDatabase.id,
        action: "DELETE",
        entity_type: "database",
        entity_id: deletingDatabase.id,
        details: `Deleted database: ${deletingDatabase.name}`
      });
      await loadDatabases();
    } catch (error) {
      console.error("Error deleting database:", error);
      // Optionally show a toast notification for error
    } finally {
      setDeletingDatabase(null);
    }
  };

  const filteredDatabases = databases.filter(db => {
    const matchesSearch = db.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (db.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || db.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Database Management</h1>
          <p className="text-slate-600 mt-2">Create, manage, and monitor your databases</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowCreate(true)}
          disabled={role !== "admin"}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Database
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search databases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-300"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
                className="border-slate-300"
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('active')}
                className="border-slate-300"
              >
                Active
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('inactive')}
                className="border-slate-300"
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i} className="border-slate-200 shadow-sm animate-pulse">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-24"></div>
                      <div className="h-3 bg-slate-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-slate-200 rounded"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                  <div className="flex justify-between items-center pt-3">
                    <div className="h-6 bg-slate-200 rounded w-16"></div>
                    <div className="h-3 bg-slate-200 rounded w-20"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredDatabases.length > 0 ? (
          filteredDatabases.map((database) => {
            const connectionStatus = getConnectionStatus(database);
            
            return (
              <Card key={database.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl">
                        {getTypeIcon(database.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                          {database.name}
                          {database.type !== "internal" && (
                            <Badge variant="outline" className="text-xs">
                              {database.type}
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className={
                              database.status === 'active'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : database.status === 'inactive'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }
                          >
                            {database.status}
                          </Badge>
                          {connectionStatus && (
                            <Badge variant="secondary" className={connectionStatus.color}>
                              {connectionStatus.label}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl(`DatabaseDetail?id=${database.id}`)} className="flex items-center">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl(`DatabaseDetail?id=${database.id}`)} className="flex items-center">
                            <Activity className="w-4 h-4 mr-2" />
                            Manage
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeletingDatabase(database)} // Changed to open confirmation dialog
                          className="text-red-600"
                          disabled={role !== "admin"}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {database.description || 'No description provided'}
                    </p>

                    {database.type !== "internal" && database.connection_config && (
                      <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
                        <div>Host: {database.connection_config.host || "Not configured"}</div>
                        <div>Database: {database.connection_config.database || "Not configured"}</div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="text-sm text-slate-500">
                        Size: {database.size_mb ? `${database.size_mb} MB` : '0 MB'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {database.created_date ? format(new Date(database.created_date), 'MMM d, yyyy') : 'Unknown'}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="flex-1 border-slate-300">
                        <Link to={createPageUrl(`DatabaseDetail?id=${database.id}`)}>
                          <Activity className="w-4 h-4 mr-1" />
                          Manage
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="flex-1 border-slate-300">
                        <Link to={createPageUrl(`QueryEditor?db=${database.id}`)}>
                          <Search className="w-4 h-4 mr-1" />
                          Query
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full">
            <Card className="border-slate-200 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Database className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {searchTerm ? 'No databases found' : 'No databases yet'}
                </h3>
                <p className="text-slate-500 mb-6 text-center">
                  {searchTerm
                    ? 'Try adjusting your search criteria'
                    : 'Create your first database to get started with data management'
                  }
                </p>
                {!searchTerm && (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowCreate(true)}
                    disabled={role !== "admin"}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Database
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Create Database Dialog */}
      <CreateDatabaseDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={loadDatabases}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingDatabase}
        onOpenChange={(open) => !open && setDeletingDatabase(null)}
        onConfirm={handleDelete}
        title="Delete Database"
        description="This will permanently delete the database and all its data."
        itemName={deletingDatabase?.name}
        itemType="Database"
        confirmText={deletingDatabase?.name}
        requireTyping={true}
        warnings={[
          "All tables in this database will be deleted",
          "All records and data will be permanently lost",
          "All queries associated with this database will be deleted",
          "This action cannot be undone"
        ]}
        isDeleting={true}
      />
    </div>
  );
}
