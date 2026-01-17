import React, { useState, useEffect } from "react";
import { AIInteraction, User } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Save, ArrowLeft, Brain, Clock, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

export default function AddInteraction() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    interaction_type: "",
    task_description: "",
    ai_tool_used: "",
    duration_minutes: 30,
    user_effort_level: 3,
    task_complexity: 3,
    outcome_quality: 3,
    learning_gained: 3,
    efficiency_rating: 3,
    follow_up_actions: "",
    session_notes: ""
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const usersData = await User.list("-created_date");
    setUsers(usersData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSliderChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await AIInteraction.create(formData);
      toast.success("AI interaction logged successfully!");
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Error logging interaction:", error);
      toast.error("Failed to log interaction. Please try again.");
    }

    setIsSubmitting(false);
  };

  const getSliderColor = (value) => {
    if (value >= 4) return "text-green-600";
    if (value >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const getSliderLabel = (field, value) => {
    const labels = {
      user_effort_level: ['Minimal', 'Low', 'Moderate', 'High', 'Maximum'],
      task_complexity: ['Very Simple', 'Simple', 'Moderate', 'Complex', 'Very Complex'],
      outcome_quality: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
      learning_gained: ['None', 'Little', 'Some', 'Significant', 'Extensive'],
      efficiency_rating: ['Very Slow', 'Slow', 'Moderate', 'Fast', 'Very Fast']
    };
    return labels[field]?.[value - 1] || value.toString();
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Log AI Interaction
            </h1>
            <p className="text-slate-600 mt-1">Record a new human-AI collaboration session</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="user_id">User</Label>
                  <Select value={formData.user_id} onValueChange={(value) => handleInputChange('user_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name} ({user.user_type || 'individual'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interaction_type">Interaction Type</Label>
                  <Select value={formData.interaction_type} onValueChange={(value) => handleInputChange('interaction_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="code_generation">Code Generation</SelectItem>
                      <SelectItem value="problem_solving">Problem Solving</SelectItem>
                      <SelectItem value="creative_writing">Creative Writing</SelectItem>
                      <SelectItem value="data_analysis">Data Analysis</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="conversation">Conversation</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task_description">Task Description</Label>
                <Textarea
                  id="task_description"
                  value={formData.task_description}
                  onChange={(e) => handleInputChange('task_description', e.target.value)}
                  placeholder="Describe what the user was trying to accomplish..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ai_tool_used">AI Tool Used</Label>
                  <Input
                    id="ai_tool_used"
                    value={formData.ai_tool_used}
                    onChange={(e) => handleInputChange('ai_tool_used', e.target.value)}
                    placeholder="e.g., ChatGPT, Claude, GitHub Copilot"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    min="1"
                    value={formData.duration_minutes}
                    onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rating Scales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Performance Ratings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {[
                { field: 'user_effort_level', label: 'User Effort Level', description: 'How much effort did the user put in?' },
                { field: 'task_complexity', label: 'Task Complexity', description: 'How complex was the task?' },
                { field: 'outcome_quality', label: 'Outcome Quality', description: 'How good was the final result?' },
                { field: 'learning_gained', label: 'Learning Gained', description: 'How much did the user learn?' },
                { field: 'efficiency_rating', label: 'Efficiency Rating', description: 'How efficiently was the task completed?' }
              ].map((rating) => (
                <div key={rating.field} className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">{rating.label}</Label>
                    <p className="text-sm text-slate-500 mt-1">{rating.description}</p>
                  </div>
                  <div className="px-4">
                    <Slider
                      value={[formData[rating.field]]}
                      onValueChange={(value) => handleSliderChange(rating.field, value)}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                      <span>5</span>
                    </div>
                    <div className="text-center mt-2">
                      <span className={`text-sm font-medium ${getSliderColor(formData[rating.field])}`}>
                        {getSliderLabel(rating.field, formData[rating.field])} ({formData[rating.field]}/5)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="follow_up_actions">Follow-up Actions</Label>
                <Textarea
                  id="follow_up_actions"
                  value={formData.follow_up_actions}
                  onChange={(e) => handleInputChange('follow_up_actions', e.target.value)}
                  placeholder="What actions were taken after the AI interaction?"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session_notes">Session Notes</Label>
                <Textarea
                  id="session_notes"
                  value={formData.session_notes}
                  onChange={(e) => handleInputChange('session_notes', e.target.value)}
                  placeholder="Any additional observations or notes about this session..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(createPageUrl("Dashboard"))}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.user_id || !formData.interaction_type || !formData.task_description || !formData.ai_tool_used}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Log Interaction
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}