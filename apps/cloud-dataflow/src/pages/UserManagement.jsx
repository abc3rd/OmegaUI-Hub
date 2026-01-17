
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/entities/User";
import { ActivityLog } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Search, 
  Shield, 
  Edit3, 
  Activity,
  Calendar,
  Mail,
  Briefcase,
  Crown,
  UserCog,
  Eye,
  Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import EditUserDialog from "@/components/users/EditUserDialog";
import UserActivityDialog from "@/components/users/UserActivityDialog";

const ROLE_CONFIG = {
  admin: {
    label: "Admin",
    icon: Crown,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    description: "Full access to all features"
  },
  editor: {
    label: "Editor",
    icon: Edit3,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    description: "Can create and edit databases, tables, and queries"
  },
  viewer: {
    label: "Viewer",
    icon: Eye,
    color: "bg-slate-100 text-slate-700 border-slate-200",
    description: "Read-only access to databases and queries"
  }
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUserActivity, setViewingUserActivity] = useState(null);
  const [userStats, setUserStats] = useState({});

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const me = await User.me();
      setCurrentUser(me);
      
      if (me.role !== "admin") {
        setLoading(false);
        return;
      }

      const allUsers = await User.list("-created_date", 500);
      setUsers(allUsers);

      // Load statistics for each user
      const stats = {};
      for (const user of allUsers) {
        try {
          const activities = await ActivityLog.filter(
            { created_by: user.email },
            "-created_date",
            100
          );
          stats[user.email] = {
            activityCount: activities.length,
            lastActivity: activities[0]?.created_date || null
          };
        } catch (error) {
          stats[user.email] = { activityCount: 0, lastActivity: null };
        }
      }
      setUserStats(stats);
    } catch (error) {
      console.error("Error loading users:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const roleStats = {
    total: users.length,
    admin: users.filter(u => u.role === "admin").length,
    editor: users.filter(u => u.role === "editor").length,
    viewer: users.filter(u => u.role === "viewer").length
  };

  if (!currentUser) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  if (currentUser.role !== "admin") {
    return (
      <div className="p-6 lg:p-8">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access user management. Only administrators can manage users.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600 mt-2">Manage team members and their access levels</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-sm px-3 py-1.5">
            <Users className="w-4 h-4 mr-1" />
            {users.length} Total Users
          </Badge>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Users</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{roleStats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Administrators</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{roleStats.admin}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-100">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Editors</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{roleStats.editor}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100">
                <Edit3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Viewers</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{roleStats.viewer}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-100">
                <Eye className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-300"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full lg:w-48 border-slate-300">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Administrators</SelectItem>
                <SelectItem value="editor">Editors</SelectItem>
                <SelectItem value="viewer">Viewers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Team Members ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
                  <div className="h-12 w-12 bg-slate-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="space-y-3">
              {filteredUsers.map((user) => {
                const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.viewer;
                const RoleIcon = roleConfig.icon;
                const stats = userStats[user.email] || { activityCount: 0, lastActivity: null };
                const isCurrentUser = user.email === currentUser.email;

                return (
                  <div
                    key={user.id}
                    className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 truncate">
                            {user.full_name}
                          </h3>
                          {isCurrentUser && (
                            <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs">
                              You
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {user.email}
                          </div>
                          {user.department && (
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5" />
                              {user.department}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Joined {format(new Date(user.created_date), 'MMM d, yyyy')}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className={roleConfig.color}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {roleConfig.label}
                          </Badge>
                          
                          {stats.activityCount > 0 && (
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                              <Activity className="w-3 h-3 mr-1" />
                              {stats.activityCount} actions
                            </Badge>
                          )}

                          {user.last_active && (
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs">
                              Last active: {format(new Date(user.last_active), 'MMM d, h:mm a')}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingUserActivity(user)}
                        >
                          <Activity className="w-4 h-4 mr-1" />
                          Activity
                        </Button>
                        {!isCurrentUser && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            <UserCog className="w-4 h-4 mr-1" />
                            Manage
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No users found</h3>
              <p className="text-slate-500">
                {searchTerm || roleFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "No users available"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Descriptions */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-600" />
            Role Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(ROLE_CONFIG).map(([role, config]) => {
              const Icon = config.icon;
              return (
                <div key={role} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="font-semibold text-slate-900">{config.label}</h4>
                  </div>
                  <p className="text-sm text-slate-600">{config.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <EditUserDialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        user={editingUser}
        onUpdate={loadUsers}
      />

      {/* User Activity Dialog */}
      <UserActivityDialog
        open={!!viewingUserActivity}
        onOpenChange={(open) => !open && setViewingUserActivity(null)}
        user={viewingUserActivity}
      />
    </div>
  );
}
