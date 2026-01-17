import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Target, Plus, Trash2, Loader2, Save, Home, UtensilsCrossed, Heart, Car, GraduationCap, AlertTriangle, MoreHorizontal, RefreshCw } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const categoryConfig = {
  housing: { icon: Home, label: "Housing" },
  food: { icon: UtensilsCrossed, label: "Food" },
  medical: { icon: Heart, label: "Medical" },
  transportation: { icon: Car, label: "Transportation" },
  education: { icon: GraduationCap, label: "Education" },
  emergency: { icon: AlertTriangle, label: "Emergency" },
  other: { icon: MoreHorizontal, label: "Other" }
};

function GoalForm({ goal, profileId, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: goal?.title || "",
    description: goal?.description || "",
    targetAmount: goal?.targetAmount || "",
    deadline: goal?.deadline ? goal.deadline.split('T')[0] : "",
    category: goal?.category || "other",
    isRecurring: goal?.isRecurring || false,
    recurringPeriod: goal?.recurringPeriod || "weekly"
  });

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (goal?.id) {
        return base44.entities.CustomGoal.update(goal.id, data);
      }
      return base44.entities.CustomGoal.create({ ...data, profileId, status: "active" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['customGoals']);
      toast.success(goal?.id ? "Goal updated!" : "Goal created!");
      onSave?.();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.targetAmount) {
      toast.error("Please enter a title and target amount");
      return;
    }

    saveMutation.mutate({
      title: formData.title,
      description: formData.description,
      targetAmount: parseFloat(formData.targetAmount),
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
      category: formData.category,
      isRecurring: formData.isRecurring,
      recurringPeriod: formData.isRecurring ? formData.recurringPeriod : null,
      raisedAmount: goal?.raisedAmount || 0
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Goal Title *</Label>
        <Input
          id="title"
          placeholder="e.g., Weekly Room Rental"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="What is this goal for?"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="min-h-[80px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetAmount">Target Amount ($) *</Label>
          <Input
            id="targetAmount"
            type="number"
            placeholder="0.00"
            value={formData.targetAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
            min="0"
            step="0.01"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryConfig).map(([key, { icon: Icon, label }]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline">Deadline (optional)</Label>
        <Input
          id="deadline"
          type="date"
          value={formData.deadline}
          onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-purple-600" />
          <Label htmlFor="recurring" className="cursor-pointer">Recurring Goal</Label>
        </div>
        <Switch
          id="recurring"
          checked={formData.isRecurring}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRecurring: checked }))}
        />
      </div>

      {formData.isRecurring && (
        <Select value={formData.recurringPeriod} onValueChange={(v) => setFormData(prev => ({ ...prev, recurringPeriod: v }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={saveMutation.isPending} className="flex-1">
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {goal?.id ? "Update Goal" : "Create Goal"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function GoalListItem({ goal, onEdit, onDelete }) {
  const config = categoryConfig[goal.category] || categoryConfig.other;
  const Icon = config.icon;
  const progress = goal.targetAmount > 0 ? (goal.raisedAmount / goal.targetAmount) * 100 : 0;

  return (
    <div className="p-4 border rounded-lg bg-white flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-slate-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-slate-800 truncate">{goal.title}</h4>
          {goal.isRecurring && (
            <RefreshCw className="w-3 h-3 text-purple-500" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Progress value={progress} className="h-1.5 flex-1" />
          <span className="text-xs text-slate-500">
            ${(goal.raisedAmount || 0).toFixed(0)} / ${goal.targetAmount.toFixed(0)}
          </span>
        </div>
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => onEdit(goal)}>Edit</Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(goal)} className="text-red-600 hover:text-red-700">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function CustomGoalEditor({ profileId }) {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['customGoals', profileId],
    queryFn: () => base44.entities.CustomGoal.filter({ profileId }, '-priority'),
    enabled: !!profileId
  });

  const deleteMutation = useMutation({
    mutationFn: (goalId) => base44.entities.CustomGoal.delete(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries(['customGoals']);
      toast.success("Goal deleted");
    }
  });

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleDelete = (goal) => {
    if (confirm("Delete this goal?")) {
      deleteMutation.mutate(goal.id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingGoal(null);
  };

  return (
    <Card className="border-2 border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Custom Goals</CardTitle>
              <CardDescription>Create specific fundraising goals</CardDescription>
            </div>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditingGoal(null)}>
                <Plus className="w-4 h-4 mr-1" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingGoal ? "Edit Goal" : "Create New Goal"}</DialogTitle>
              </DialogHeader>
              <GoalForm 
                goal={editingGoal} 
                profileId={profileId}
                onSave={handleFormClose}
                onCancel={handleFormClose}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : goals.length === 0 ? (
          <p className="text-center text-slate-500 py-4">
            No goals yet. Create one to show donors what you're working toward.
          </p>
        ) : (
          <div className="space-y-3">
            {goals.map(goal => (
              <GoalListItem 
                key={goal.id} 
                goal={goal} 
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}