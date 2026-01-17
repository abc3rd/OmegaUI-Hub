
import React, { useState, useEffect } from 'react';
import { Workflow } from '@/entities/Workflow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Zap, MoreVertical, Play, Trash2, Edit, CheckCircle2, Clock, TrendingUp, Settings } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import WorkflowBuilder from '@/components/workflows/WorkflowBuilder';
import { Badge } from '@/components/ui/badge'; // Assuming Badge component exists

const triggerMappings = {
  contact_created: 'New Contact Added',
  lead_created: 'New Lead Added',
  task_completed: 'Task Completed',
  project_created: 'Project Created',
  project_status_changed: 'Project Status Changed',
  habit_completed: 'Habit Completed',
  new_social_post_scheduled: 'New Social Post Scheduled',
  tag_added_to_contact: 'Tag Added to Contact',
  lead_status_changed: 'Lead Status Changed',
  manual: 'Manual Trigger',
};

export default function Automation() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null); // Replaced isBuilderOpen and editingWorkflow

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await Workflow.list('-created_date');
      setWorkflows(data);
    } catch (error) {
      console.error('Failed to load workflows:', error);
      toast.error('Failed to load your workflows.');
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkflowStatus = async (workflow) => {
    try {
      const newStatus = !workflow.is_active;
      await Workflow.update(workflow.id, { is_active: newStatus });
      toast.success(`Workflow "${workflow.name}" ${newStatus ? 'activated' : 'deactivated'}.`);
      loadWorkflows();
    } catch (error) {
      console.error('Failed to toggle workflow status:', error);
      toast.error('Failed to update workflow status.');
    }
  };

  const deleteWorkflow = async (workflowId) => {
    try {
      await Workflow.delete(workflowId);
      toast.success('Workflow deleted successfully.');
      loadWorkflows();
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      toast.error('Failed to delete workflow.');
    }
  };

  const handleEdit = (workflow) => {
    setSelectedWorkflow(workflow);
  };
  
  const handleCreateNew = () => {
    setSelectedWorkflow({}); // Use an empty object to signify new workflow creation
  };

  const handleSaveWorkflow = () => {
    setSelectedWorkflow(null);
    loadWorkflows();
  };

  return (
    <div className="h-full">
      {selectedWorkflow ? (
        <WorkflowBuilder 
          workflow={selectedWorkflow} 
          onClose={() => setSelectedWorkflow(null)}
          onSave={handleSaveWorkflow}
        />
      ) : (
        <div className="p-4 md:p-6 h-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Workflow Automation
              </h1>
              <p className="text-muted-foreground mt-1">
                Automate your repetitive tasks with powerful visual workflows.
              </p>
            </div>
            <Button onClick={() => setSelectedWorkflow({})} className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" />
              Create Workflow
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{workflows.length}</p>
                    <p className="text-sm text-muted-foreground">Total Workflows</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{workflows.filter(w => w.is_active).length}</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">247</p> {/* Placeholder data */}
                    <p className="text-sm text-muted-foreground">Executions This Month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">98.5%</p> {/* Placeholder data */}
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workflows List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Your Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-12 h-12 bg-muted rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                      <div className="w-20 h-8 bg-muted rounded" />
                    </div>
                  ))}
                </div>
              ) : workflows.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No Workflows Created Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by creating your first automated workflow.
                  </p>
                  <Button onClick={() => setSelectedWorkflow({})} className="bg-primary hover:bg-primary/90 gap-2">
                    <Plus className="w-4 h-4" />
                    Create Your First Workflow
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {workflows.map((workflow) => (
                    <div key={workflow.id} className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        workflow.is_active ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <Zap className={`w-6 h-6 ${workflow.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{workflow.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {workflow.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-muted-foreground">
                            Trigger: {triggerMappings[workflow.trigger?.type] || workflow.trigger?.type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {workflow.actions?.length || 0} actions
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                          {workflow.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(workflow)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleWorkflowStatus(workflow)} // Reusing existing function
                        >
                          {workflow.is_active ? 'Pause' : 'Activate'}
                        </Button>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(workflow)}>
                                    <Edit className="w-4 h-4 mr-2" />Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Play className="w-4 h-4 mr-2" />Run Manually
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => deleteWorkflow(workflow.id)} className="text-red-500">
                                    <Trash2 className="w-4 h-4 mr-2" />Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
