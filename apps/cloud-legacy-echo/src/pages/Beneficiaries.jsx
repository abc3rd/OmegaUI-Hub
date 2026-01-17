import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Plus, Mail, Trash2, Shield, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function BeneficiariesPage() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    relationship: "friend",
    access_level: "limited",
    access_conditions: ""
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: beneficiaries = [], isLoading } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: () => base44.entities.Beneficiary.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Beneficiary.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['beneficiaries']);
      setShowDialog(false);
      setFormData({
        name: "",
        email: "",
        relationship: "friend",
        access_level: "limited",
        access_conditions: ""
      });
      toast.success("Beneficiary added successfully!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Beneficiary.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['beneficiaries']);
      toast.success("Beneficiary removed");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Beneficiary.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['beneficiaries']);
      toast.success("Status updated");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const relationshipColors = {
    spouse: "bg-pink-500/20 text-pink-400",
    child: "bg-blue-500/20 text-blue-400",
    parent: "bg-purple-500/20 text-purple-400",
    sibling: "bg-green-500/20 text-green-400",
    friend: "bg-yellow-500/20 text-yellow-400",
    other: "bg-slate-500/20 text-slate-400"
  };

  const accessLevelColors = {
    full: "bg-green-500/20 text-green-400",
    limited: "bg-yellow-500/20 text-yellow-400",
    view_only: "bg-slate-500/20 text-slate-400"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Beneficiaries</h1>
            <p className="text-slate-400">
              Designate who can access your Legacy AI
            </p>
          </div>
          
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Beneficiary
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Beneficiary</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Designate someone who can access your Legacy AI
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label className="text-slate-300">Full Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                    required
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                    required
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Relationship</Label>
                  <Select
                    value={formData.relationship}
                    onValueChange={(value) => setFormData({...formData, relationship: value})}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">Access Level</Label>
                  <Select
                    value={formData.access_level}
                    onValueChange={(value) => setFormData({...formData, access_level: value})}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      <SelectItem value="full">Full Access</SelectItem>
                      <SelectItem value="limited">Limited Access</SelectItem>
                      <SelectItem value="view_only">View Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">Access Conditions (Optional)</Label>
                  <Textarea
                    value={formData.access_conditions}
                    onChange={(e) => setFormData({...formData, access_conditions: e.target.value})}
                    placeholder="e.g., 'Access granted after my passing' or 'Can access on special occasions'"
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Adding..." : "Add Beneficiary"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          </div>
        ) : beneficiaries.length === 0 ? (
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">No beneficiaries yet</h3>
              <p className="text-slate-400 mb-6">
                Add people who should have access to your Legacy AI
              </p>
              <Button 
                onClick={() => setShowDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Beneficiary
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {beneficiaries.map((beneficiary, index) => (
              <motion.div
                key={beneficiary.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800 hover:border-slate-700 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {beneficiary.name[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{beneficiary.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <span className="text-sm text-slate-400">{beneficiary.email}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(beneficiary.id)}
                        className="hover:bg-red-500/20 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Badge className={relationshipColors[beneficiary.relationship]}>
                        {beneficiary.relationship}
                      </Badge>
                      <Badge className={accessLevelColors[beneficiary.access_level]}>
                        <Shield className="w-3 h-3 mr-1" />
                        {beneficiary.access_level.replace('_', ' ')}
                      </Badge>
                    </div>

                    {beneficiary.access_conditions && (
                      <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                        <p className="text-xs text-slate-500 mb-1">Access Conditions:</p>
                        <p className="text-sm text-slate-300">{beneficiary.access_conditions}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                      <Badge className={
                        beneficiary.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        beneficiary.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }>
                        {beneficiary.status}
                      </Badge>
                      {beneficiary.notification_sent && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <CheckCircle2 className="w-3 h-3" />
                          Notified
                        </div>
                      )}
                    </div>

                    {beneficiary.status === 'pending' && (
                      <Button
                        onClick={() => updateStatusMutation.mutate({ id: beneficiary.id, status: 'active' })}
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Activate Access
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}