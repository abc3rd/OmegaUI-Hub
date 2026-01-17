import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { X, UserPlus, Globe, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ShareDashboardDialog({ open, onOpenChange, dashboard, onUpdate }) {
  const [users, setUsers] = useState([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [sharedWith, setSharedWith] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState("viewer");

  useEffect(() => {
    User.me().then(me => setCurrentUserRole(me.role || "viewer")).catch(() => {});
    
    // Load all users for sharing selection
    User.list().then(allUsers => {
      setUsers(allUsers.filter(u => u.email !== dashboard?.created_by));
    }).catch(() => {});
  }, [dashboard?.created_by]);

  useEffect(() => {
    if (dashboard) {
      setSharedWith(dashboard.shared_with || []);
      setIsPublic(dashboard.is_public || false);
    }
  }, [dashboard, open]);

  const addSharedUser = () => {
    if (!selectedUserEmail) return;
    if (sharedWith.includes(selectedUserEmail)) return;
    setSharedWith([...sharedWith, selectedUserEmail]);
    setSelectedUserEmail("");
  };

  const removeSharedUser = (email) => {
    setSharedWith(sharedWith.filter(e => e !== email));
  };

  const handleSave = async () => {
    if (!dashboard) return;
    setSaving(true);
    try {
      await onUpdate(dashboard.id, {
        shared_with: sharedWith,
        is_public: isPublic
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating sharing settings:", error);
    }
    setSaving(false);
  };

  const availableUsers = users.filter(u => !sharedWith.includes(u.email));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Share Dashboard</DialogTitle>
          <DialogDescription>
            Control who can access "{dashboard?.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Public Access Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Globe className="w-5 h-5 text-green-600" />
              ) : (
                <Lock className="w-5 h-5 text-slate-600" />
              )}
              <div>
                <div className="font-semibold text-slate-900">
                  {isPublic ? "Public Access" : "Private"}
                </div>
                <div className="text-sm text-slate-500">
                  {isPublic 
                    ? "Anyone with the link can view this dashboard" 
                    : "Only you and specific users can access"
                  }
                </div>
              </div>
            </div>
            <Switch 
              checked={isPublic} 
              onCheckedChange={setIsPublic}
              disabled={currentUserRole !== "admin" && dashboard?.created_by !== User.me().email}
            />
          </div>

          {/* Share with Specific Users */}
          {!isPublic && (
            <>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Share with specific users</Label>
                <div className="flex gap-2">
                  <Select 
                    value={selectedUserEmail} 
                    onValueChange={setSelectedUserEmail}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a user to share with" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.length > 0 ? (
                        availableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.email}>
                            <div className="flex items-center gap-2">
                              <span>{user.full_name}</span>
                              <span className="text-xs text-slate-500">({user.email})</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-slate-500">
                          {sharedWith.length > 0 
                            ? "All users have been added" 
                            : "No other users available"
                          }
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    onClick={addSharedUser}
                    disabled={!selectedUserEmail}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Shared Users List */}
              {sharedWith.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block">
                    Shared with ({sharedWith.length})
                  </Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {sharedWith.map((email) => {
                      const user = users.find(u => u.email === email);
                      return (
                        <div 
                          key={email} 
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-blue-700">
                                {user?.full_name?.[0] || email[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">
                                {user?.full_name || "Unknown User"}
                              </div>
                              <div className="text-xs text-slate-500">{email}</div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSharedUser(email)}
                          >
                            <X className="w-4 h-4 text-slate-400 hover:text-red-600" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {sharedWith.length === 0 && (
                <Alert>
                  <AlertDescription className="text-sm">
                    This dashboard is private. Add users above to share access with them.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {/* Creator Info */}
          <div className="pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span>Created by:</span>
              <Badge variant="secondary" className="bg-slate-100">
                {dashboard?.created_by}
              </Badge>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}