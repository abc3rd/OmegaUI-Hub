import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Clock, 
  Activity,
  MoreVertical,
  Settings,
  Crown
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Team() {
  const [currentUser, setCurrentUser] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      // Load all users if current user is admin
      if (user.role === 'admin') {
        const allUsers = await User.list("-created_date");
        setTeamMembers(allUsers);
      } else {
        // Non-admin users can only see themselves
        setTeamMembers([user]);
      }
    } catch (error) {
      console.error("Failed to load team data:", error);
      toast.error("Failed to load team information.");
    }
    setIsLoading(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await User.update(userId, { role: newRole });
      toast.success("User role updated successfully.");
      loadTeamData();
    } catch (error) {
      toast.error("Failed to update user role.");
    }
  };

  const getRoleColor = (role) => {
    return role === 'admin' 
      ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
      : "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Team Management</h1>
            <p className="text-gray-400 mt-2">Manage your team members and permissions</p>
          </div>
          {currentUser?.role === 'admin' && (
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          )}
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Total Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{teamMembers.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Crown className="w-4 h-4 text-purple-400" />
                Administrators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {teamMembers.filter(m => m.role === 'admin').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-400" />
                Active Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {teamMembers.filter(m => {
                  const today = new Date().toDateString();
                  return new Date(m.updated_date).toDateString() === today;
                }).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {teamMembers.filter(m => {
                  const thisMonth = new Date().getMonth();
                  return new Date(m.created_date).getMonth() === thisMonth;
                }).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Members List */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse text-gray-400">Loading team members...</div>
                </div>
              ) : teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium">
                        {getInitials(member.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-white">
                        {member.full_name || 'No Name'}
                        {member.id === currentUser?.id && (
                          <span className="text-sm text-gray-400 ml-2">(You)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Mail className="w-4 h-4" />
                        {member.email}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Joined {format(new Date(member.created_date), "MMM d, yyyy")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={getRoleColor(member.role)}>
                      <Shield className="w-3 h-3 mr-1" />
                      {member.role}
                    </Badge>
                    
                    {currentUser?.role === 'admin' && member.id !== currentUser.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:bg-gray-700">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                          <DropdownMenuItem 
                            onClick={() => handleRoleChange(member.id, member.role === 'admin' ? 'user' : 'admin')}
                            className="hover:bg-gray-700"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            {member.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {teamMembers.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>No team members found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Information */}
        {currentUser?.role !== 'admin' && (
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-blue-400">
                <Shield className="w-5 h-5" />
                <div>
                  <h3 className="font-medium">Limited Access</h3>
                  <p className="text-sm text-blue-300">
                    You are viewing limited team information. Contact an administrator for full team management access.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}