import React, { useState, useEffect } from 'react';
import { N8nWorkflow, N8nWorkflowLog } from '@/entities/all';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Workflow, 
  Plus, 
  Play, 
  Settings, 
  ExternalLink,
  Activity,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { n8nTrigger } from '@/functions/n8nTrigger';
import { toast } from 'sonner';

const triggerEventOptions = [
  { value: 'contact_created', label: 'New Contact Created', description: 'Triggers when a new contact is added' },
  { value: 'task_completed', label: 'Task Completed', description: 'Triggers when a task is marked as done' },
  { value: 'project_created', label: 'New Project Created', description: 'Triggers when a new project is created' },
  { value: 'lead_created', label: 'New Lead Created', description: 'Triggers when a new lead is added' },
  { value: 'manual', label: 'Manual Trigger', description: 'Only triggered manually from dashboard' }
];

export default function N8nIntegration() {
  const [workflows, setWorkflows] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    workflow_id: '',
    description: '',
    trigger_events: [],
    webhook_url: '',
    n8n_url: 'http://localhost:5678'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [workflowData, logData] = await Promise.all([
        N8nWorkflow.list('-created_date').catch(() => []),
        N8nWorkflowLog.list('-created_date', 10).catch(() => [])
      ]);
      setWorkflows(workflowData);
      setLogs(logData);
    } catch (error) {
      console.error('Error loading N8n data:', error);
      toast.error('Failed to load N8n integration data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkflow = async () => {
    if (!newWorkflow.name || !newWorkflow.workflow_id) {
      toast.error('Workflow name and ID are required');
      return;
    }

    try {
      await N8nWorkflow.create(newWorkflow);
      toast.success('N8n workflow integration added!');
      setShowAddDialog(false);
      setNewWorkflow({
        name: '',
        workflow_id: '',
        description: '',
        trigger_events: [],
        webhook_url: '',
        n8n_url: 'http://localhost:5678'
      });
      loadData();
    } catch (error) {
      console.error('Error adding workflow:', error);
      toast.error('Failed to add workflow integration');
    }
  };

  const triggerWorkflow = async (workflow, testData = {}) => {
    try {
      const response = await n8nTrigger({
        workflowId: workflow.workflow_id,
        data: {
          ...testData,
          manual_trigger: true,
          workflow_name: workflow.name
        },
        n8nUrl: workflow.n8n_url
      });

      if (response.data.success) {
        toast.success(`Workflow "${workflow.name}" triggered successfully!`);
      } else {
        toast.error(`Failed to trigger workflow: ${response.data.data}`);
      }
      
      loadData(); // Refresh logs
    } catch (error) {
      console.error('Error triggering workflow:', error);
      toast.error('Failed to trigger workflow');
    }
  };

  const toggleWorkflow = async (workflow) => {
    try {
      await N8nWorkflow.update(workflow.id, { 
        is_active: !workflow.is_active 
      });
      toast.success(`Workflow ${workflow.is_active ? 'deactivated' : 'activated'}`);
      loadData();
    } catch (error) {
      console.error('Error toggling workflow:', error);
      toast.error('Failed to update workflow status');
    }
  };

  const handleTriggerEventChange = (event, checked) => {
    if (checked) {
      setNewWorkflow({
        ...newWorkflow,
        trigger_events: [...newWorkflow.trigger_events, event]
      });
    } else {
      setNewWorkflow({
        ...newWorkflow,
        trigger_events: newWorkflow.trigger_events.filter(e => e !== event)
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            N8n Integration
          </h1>
          <p className="text-muted-foreground">
            Connect your dashboard to N8n workflows for powerful automation
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => window.open('http://localhost:5678', '_blank')}
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open N8n
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Workflow
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add N8n Workflow Integration</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Workflow Name</Label>
                  <Input
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow({...newWorkflow, name: e.target.value})}
                    placeholder="e.g., 'Send Welcome Email'"
                  />
                </div>
                
                <div>
                  <Label>N8n Workflow ID</Label>
                  <Input
                    value={newWorkflow.workflow_id}
                    onChange={(e) => setNewWorkflow({...newWorkflow, workflow_id: e.target.value})}
                    placeholder="Get this from your N8n workflow settings"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newWorkflow.description}
                    onChange={(e) => setNewWorkflow({...newWorkflow, description: e.target.value})}
                    placeholder="Describe what this workflow does..."
                    className="h-20"
                  />
                </div>

                <div>
                  <Label>N8n Instance URL</Label>
                  <Input
                    value={newWorkflow.n8n_url}
                    onChange={(e) => setNewWorkflow({...newWorkflow, n8n_url: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Webhook URL (Optional)</Label>
                  <Input
                    value={newWorkflow.webhook_url}
                    onChange={(e) => setNewWorkflow({...newWorkflow, webhook_url: e.target.value})}
                    placeholder="N8n webhook URL for responses"
                  />
                </div>

                <div>
                  <Label className="text-base">Trigger Events</Label>
                  <div className="space-y-3 mt-2">
                    {triggerEventOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-3">
                        <Switch
                          checked={newWorkflow.trigger_events.includes(option.value)}
                          onCheckedChange={(checked) => handleTriggerEventChange(option.value, checked)}
                        />
                        <div>
                          <Label className="font-medium">{option.label}</Label>
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddWorkflow}>
                  Add Integration
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Connection Status */}
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-700 dark:text-green-300 font-medium">
              Connected to N8n at http://localhost:5678
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Workflows Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Workflow className="w-5 h-5" />
            Active Workflows ({workflows.filter(w => w.is_active).length})
          </h2>
          
          {workflows.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Workflow className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No workflows yet</h3>
                <p className="text-muted-foreground mb-4">
                  Connect your first N8n workflow to start automating your dashboard
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Workflow
                </Button>
              </CardContent>
            </Card>
          ) : (
            workflows.map((workflow) => (
              <Card key={workflow.id} className={workflow.is_active ? 'border-primary/50' : 'border-muted'}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{workflow.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        ID: {workflow.workflow_id}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={workflow.is_active ? "default" : "secondary"}>
                        {workflow.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Switch
                        checked={workflow.is_active}
                        onCheckedChange={() => toggleWorkflow(workflow)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {workflow.description && (
                    <p className="text-sm text-muted-foreground">{workflow.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {workflow.trigger_events?.map((event) => (
                      <Badge key={event} variant="outline" className="text-xs">
                        {triggerEventOptions.find(opt => opt.value === event)?.label || event}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => triggerWorkflow(workflow, { test: true })}
                      className="gap-1"
                    >
                      <Play className="w-3 h-3" />
                      Test
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Settings className="w-3 h-3" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </h2>
          
          <Card>
            <CardContent className="p-0">
              {logs.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No workflow activity yet</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {logs.map((log, index) => (
                    <div key={log.id} className={`p-4 ${index !== logs.length - 1 ? 'border-b border-border' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {log.status === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : log.status === 'failed' ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Workflow {log.workflow_id} triggered
                          </p>
                          <p className="text-xs text-muted-foreground">
                            by {log.triggered_by} • {new Date(log.created_date).toLocaleString()}
                          </p>
                          {log.status === 'failed' && log.response_data && (
                            <p className="text-xs text-red-600 mt-1">
                              Error: {log.response_data}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}