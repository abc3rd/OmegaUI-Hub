import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AuthGate from "../components/AuthGate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Admin() {
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    model: '',
    avgPowerW: '',
    costPer1kPrompt: '',
    costPer1kCompletion: '',
    notes: ''
  });

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    if (editingProfile) {
      setFormData({
        model: editingProfile.model,
        avgPowerW: editingProfile.avgPowerW,
        costPer1kPrompt: editingProfile.costPer1kPrompt || '',
        costPer1kCompletion: editingProfile.costPer1kCompletion || '',
        notes: editingProfile.notes || ''
      });
    } else {
      setFormData({ model: '', avgPowerW: '', costPer1kPrompt: '', costPer1kCompletion: '', notes: '' });
    }
  }, [editingProfile]);

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.ModelProfile.list();
      setProfiles(data);
    } catch (error) {
      console.error("Error loading profiles:", error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        model: formData.model,
        avgPowerW: parseFloat(formData.avgPowerW),
        costPer1kPrompt: formData.costPer1kPrompt ? parseFloat(formData.costPer1kPrompt) : null,
        costPer1kCompletion: formData.costPer1kCompletion ? parseFloat(formData.costPer1kCompletion) : null,
        notes: formData.notes || null
      };

      if (editingProfile) {
        await base44.entities.ModelProfile.update(editingProfile.id, data);
        toast.success("Model profile updated");
      } else {
        await base44.entities.ModelProfile.create(data);
        toast.success("Model profile created");
      }
      
      setIsFormOpen(false);
      setEditingProfile(null);
      loadProfiles();
    } catch (error) {
      toast.error("Failed to save profile");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this profile?")) {
      await base44.entities.ModelProfile.delete(id);
      toast.success("Profile deleted");
      loadProfiles();
    }
  };

  return (
    <AuthGate>
      <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Admin</h1>
          </div>
          <p className="text-slate-400">Manage model profiles and system settings</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProfile(null)} className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Model Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingProfile ? "Edit Model Profile" : "Add Model Profile"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="model" className="text-white">Model Name</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="e.g., llama3.2, gpt-4"
                />
              </div>
              <div>
                <Label htmlFor="avgPowerW" className="text-white">Average Power (W)</Label>
                <Input
                  id="avgPowerW"
                  type="number"
                  step="0.1"
                  value={formData.avgPowerW}
                  onChange={(e) => setFormData({...formData, avgPowerW: e.target.value})}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="150"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="costPer1kPrompt" className="text-white">Cost / 1K Prompt ($)</Label>
                  <Input
                    id="costPer1kPrompt"
                    type="number"
                    step="0.0001"
                    value={formData.costPer1kPrompt}
                    onChange={(e) => setFormData({...formData, costPer1kPrompt: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="costPer1kCompletion" className="text-white">Cost / 1K Completion ($)</Label>
                  <Input
                    id="costPer1kCompletion"
                    type="number"
                    step="0.0001"
                    value={formData.costPer1kCompletion}
                    onChange={(e) => setFormData({...formData, costPer1kCompletion: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="0.03"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes" className="text-white">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Additional information..."
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600">
                {editingProfile ? "Update Profile" : "Create Profile"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-md p-6">
        <h2 className="text-xl font-bold text-white mb-4">Model Profiles</h2>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">Model</TableHead>
              <TableHead className="text-slate-300">Avg Power (W)</TableHead>
              <TableHead className="text-slate-300">Cost / 1K Prompt</TableHead>
              <TableHead className="text-slate-300">Cost / 1K Completion</TableHead>
              <TableHead className="text-slate-300">Notes</TableHead>
              <TableHead className="text-slate-300 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((profile) => (
              <TableRow key={profile.id} className="border-slate-700">
                <TableCell className="text-white font-medium">{profile.model}</TableCell>
                <TableCell className="text-slate-300">{profile.avgPowerW}</TableCell>
                <TableCell className="text-slate-300">
                  {profile.costPer1kPrompt ? `$${profile.costPer1kPrompt.toFixed(4)}` : '-'}
                </TableCell>
                <TableCell className="text-slate-300">
                  {profile.costPer1kCompletion ? `$${profile.costPer1kCompletion.toFixed(4)}` : '-'}
                </TableCell>
                <TableCell className="text-slate-300 text-sm">{profile.notes || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingProfile(profile);
                        setIsFormOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4 text-cyan-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(profile.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
    </AuthGate>
  );
}