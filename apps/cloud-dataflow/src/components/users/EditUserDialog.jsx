import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Crown, Edit3, Eye, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ROLE_CONFIG = {
  admin: {
    label: "Administrator",
    icon: Crown,
    color: "bg-purple-100 text-purple-700",
    description: "Full access to all features including user management"
  },
  editor: {
    label: "Editor",
    icon: Edit3,
    color: "bg-blue-100 text-blue-700",
    description: "Can create and edit databases, tables, queries, and dashboards"
  },
  viewer: {
    label: "Viewer",
    icon: Eye,
    color: "bg-slate-100 text-slate-700",
    description: "Read-only access to databases and queries"
  }
};

export default function EditUserDialog({ open, onOpenChange, user, onUpdate }) {
  const [role, setRole] = useState("viewer");
  const [department, setDepartment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setRole(user.role || "viewer");
      setDepartment(user.department || "");
      setError(null);
    }
  }, [user, open]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setError(null);
    
    try {
      await User.update(user.id, {
        role,
        department: department.trim() || user.department,
        last_active: new Date().toISOString()
      });
      
      await onUpdate();
      onOpenChange(false);
    } catch (err) {
      console.error("Error updating user:", err);
      setError("Failed to update user. Please try again.");
    }
    
    setSaving(false);
  };

  const selectedRoleConfig = ROLE_CONFIG[role] || ROLE_CONFIG.viewer;
  const RoleIcon = selectedRoleConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage User</DialogTitle>
          <DialogDescription>
            Update role and information for {user?.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* User Info */}
          <div className="p-4 bg-slate-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Email</span>
              <span className="font-medium text-slate-900">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Joined</span>
              <span className="font-medium text-slate-900">
                {user?.created_date ? new Date(user.created_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">User Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_CONFIG).map(([roleKey, config]) => {
                  const Icon = config.icon;
                  return (
                    <SelectItem key={roleKey} value={roleKey}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            {/* Role Description */}
            <div className={`mt-3 p-3 rounded-lg ${selectedRoleConfig.color}`}>
              <div className="flex items-center gap-2 mb-1">
                <RoleIcon className="w-4 h-4" />
                <span className="font-semibold text-sm">{selectedRoleConfig.label}</span>
              </div>
              <p className="text-xs opacity-90">{selectedRoleConfig.description}</p>
            </div>
          </div>

          {/* Department */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Department</Label>
            <Input
              placeholder="e.g., Engineering, Sales, Marketing"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          {/* Warning for role changes */}
          {role !== user?.role && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Changing this user's role will immediately update their access permissions.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}