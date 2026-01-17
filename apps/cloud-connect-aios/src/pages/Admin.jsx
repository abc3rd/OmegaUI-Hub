import React, { useState, useEffect } from "react";
import { User, UsageLog } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Activity, 
  DollarSign, 
  Settings,
  Shield,
  Crown,
  AlertTriangle
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [usageLogs, setUsageLogs] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTokens: 0,
    totalCost: 0,
    activeUsers: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, logsData] = await Promise.all([
        User.list("-created_date"),
        UsageLog.list("-created_date", 100)
      ]);
      
      setUsers(usersData);
      setUsageLogs(logsData);
      
      // Calculate stats
      const totalTokens = logsData.reduce((sum, log) => sum + (log.tokens_used || 0), 0);
      const totalCost = logsData.reduce((sum, log) => sum + (log.cost || 0), 0);
      const activeUsers = new Set(logsData.map(log => log.user_email)).size;
      
      setStats({
        totalUsers: usersData.length,
        totalTokens,
        totalCost,
        activeUsers
      });
    } catch (error) {
      console.error("Error loading admin data:", error);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await User.update(userId, { role: newRole });
      await loadData();
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500">System management and user administration</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Active Users"
          value={stats.activeUsers}
          icon={Activity}
          color="green"
        />
        <StatsCard
          title="Total Tokens"
          value={stats.totalTokens.toLocaleString()}
          icon={Settings}
          color="purple"
        />
        <StatsCard
          title="Total Cost"
          value={`$${stats.totalCost.toFixed(2)}`}
          icon={DollarSign}
          color="orange"
        />
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="usage">Usage Logs</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user.full_name?.charAt(0) || user.email.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium">{user.full_name || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                          {user.role === 'admin' ? (
                            <Crown className="w-3 h-3 mr-1" />
                          ) : (
                            <Users className="w-3 h-3 mr-1" />
                          )}
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateUserRole(
                            user.id, 
                            user.role === 'admin' ? 'user' : 'admin'
                          )}
                        >
                          {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Usage Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageLogs.slice(0, 20).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {log.user_email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.model_used || '-'}</TableCell>
                      <TableCell>{log.tokens_used || 0}</TableCell>
                      <TableCell>${(log.cost || 0).toFixed(4)}</TableCell>
                      <TableCell>
                        {new Date(log.created_date).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">OpenAI Integration</h4>
                      <p className="text-sm text-gray-500">API connection status</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Connected
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">File Upload Limit</h4>
                      <p className="text-sm text-gray-500">Maximum file size per upload</p>
                    </div>
                    <Badge variant="secondary">10 MB</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Rate Limiting</h4>
                      <p className="text-sm text-gray-500">API requests per minute</p>
                    </div>
                    <Badge variant="secondary">100 req/min</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Database Status</span>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>API Response Time</span>
                    <Badge variant="secondary">~250ms</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Storage Used</span>
                    <Badge variant="secondary">2.3 GB / 100 GB</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500"
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}