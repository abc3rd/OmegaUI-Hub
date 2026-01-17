
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, ArrowRight, Plus, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CreateDatabaseDialog from "../databases/CreateDatabaseDialog";
import { User } from "@/entities/User";

export default function DatabaseOverview({ databases, isLoading }) {
  const [showCreate, setShowCreate] = React.useState(false);
  const [role, setRole] = React.useState("viewer");

  React.useEffect(() => {
    (async () => {
      const me = await User.me().catch(() => null);
      setRole(me?.role || "viewer");
    })();
  }, []);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-slate-600" />
            Your Databases
          </CardTitle>
          <div className="flex gap-2">
            <Link to={createPageUrl("Databases")}>
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            {(role === "admin") && (
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowCreate(true)}>
                <Plus className="w-4 h-4 mr-1" /> New Database
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse p-4 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))
          ) : databases.length > 0 ? (
            databases.map((database) => (
              <div 
                key={database.id} 
                className="p-4 border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{database.name}</h3>
                      <p className="text-sm text-slate-500">
                        {database.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="secondary"
                      className={
                        database.status === 'active' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }
                    >
                      {database.status}
                    </Badge>
                    <div className="text-xs text-slate-400">
                      {database.size_mb ? `${database.size_mb} MB` : '0 MB'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    Last accessed: {database.last_accessed 
                      ? format(new Date(database.last_accessed), 'MMM d, yyyy')
                      : 'Never'
                    }
                  </div>
                  <Button variant="ghost" size="sm" className="text-slate-600" asChild>
                    <Link to={createPageUrl(`DatabaseDetail?id=${database.id}`)}>
                      <Activity className="w-4 h-4 mr-1" />
                      Manage
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No databases yet</h3>
              <p className="text-slate-500 mb-6">Create your first database to get started</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Database
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      <CreateDatabaseDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={() => {}}
      />
    </Card>
  );
}
