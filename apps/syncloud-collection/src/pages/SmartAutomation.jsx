import React, { useState, useEffect } from 'react';
import { AutomationRule, SmartDevice } from '@/entities/all';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus,
  Clock,
  Zap,
  Home,
  Settings,
  Play,
  Trash2,
  Edit,
  Sun
} from 'lucide-react';
import { toast } from 'sonner';

const triggerTypes = {
  time: { name: 'Time-based', icon: Clock, description: 'Trigger at specific times' },
  device_state: { name: 'Device State', icon: Zap, description: 'When device changes state' },
  manual: { name: 'Manual', icon: Play, description: 'Manually triggered' },
  location: { name: 'Location', icon: Home, description: 'When entering/leaving area' },
  weather: { name: 'Weather', icon: Sun, description: 'Based on weather conditions' }
};

const deviceActions = {
  turn_on: 'Turn On',
  turn_off: 'Turn Off',
  set_brightness: 'Set Brightness',
  set_temperature: 'Set Temperature',
  set_volume: 'Set Volume',
  set_color: 'Set Color'
};

export default function SmartAutomation() {
  const [rules, setRules] = useState([]);
  const [devices, setDevices] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [loading, setLoading] = useState(true);

  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    is_active: true,
    trigger_type: 'time',
    trigger_condition: {},
    actions: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesData, devicesData] = await Promise.all([
        AutomationRule.list('-created_date').catch(() => []),
        SmartDevice.list().catch(() => [])
      ]);
      setRules(rulesData);
      setDevices(devicesData);
    } catch (error) {
      console.error('Error loading automation data:', error);
      toast.error('Failed to load automation rules');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRule = async () => {
    try {
      if (!newRule.name.trim()) {
        toast.error('Please enter a rule name');
        return;
      }

      if (newRule.actions.length === 0) {
        toast.error('Please add at least one action');
        return;
      }

      if (editingRule) {
        await AutomationRule.update(editingRule.id, newRule);
        toast.success('Rule updated successfully!');
      } else {
        await AutomationRule.create(newRule);
        toast.success('Rule created successfully!');
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error('Failed to save rule');
      console.error(error);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      await AutomationRule.delete(ruleId);
      toast.success('Rule deleted successfully!');
      loadData();
    } catch (error) {
      toast.error('Failed to delete rule');
      console.error(error);
    }
  };

  const handleToggleRule = async (rule) => {
    try {
      await AutomationRule.update(rule.id, { ...rule, is_active: !rule.is_active });
      toast.success(`Rule ${rule.is_active ? 'disabled' : 'enabled'}`);
      loadData();
    } catch (error) {
      toast.error('Failed to toggle rule');
      console.error(error);
    }
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setNewRule({ ...rule });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setNewRule({
      name: '',
      description: '',
      is_active: true,
      trigger_type: 'time',
      trigger_condition: {},
      actions: []
    });
    setEditingRule(null);
  };

  const addAction = () => {
    setNewRule(prev => ({
      ...prev,
      actions: [...prev.actions, { device_id: '', action: 'turn_on', value: '' }]
    }));
  };

  const updateAction = (index, field, value) => {
    setNewRule(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? { ...action, [field]: value } : action
      )
    }));
  };

  const removeAction = (index) => {
    setNewRule(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const getTriggerIcon = (triggerType) => {
    const TriggerIcon = triggerTypes[triggerType]?.icon || Clock;
    return <TriggerIcon className="w-4 h-4" />;
  };

  const getDeviceName = (deviceId) => {
    const device = devices.find(d => d.id === deviceId);
    return device ? device.name : 'Unknown Device';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Smart Home Automation Rules
          </h1>
          <p className="text-muted-foreground">
            Create and manage automated workflows for your smart home devices
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-accent gap-2" onClick={resetForm}>
              <Plus className="w-4 h-4" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card text-card-foreground">
            <DialogHeader>
              <DialogTitle>{editingRule ? 'Edit' : 'Create'} Automation Rule</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rule-name">Rule Name *</Label>
                  <Input
                    id="rule-name"
                    value={newRule.name}
                    onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                    placeholder="Good Night Routine"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="rule-active"
                    checked={newRule.is_active}
                    onCheckedChange={(checked) => setNewRule({...newRule, is_active: checked})}
                  />
                  <Label htmlFor="rule-active">Active</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="rule-description">Description</Label>
                <Textarea
                  id="rule-description"
                  value={newRule.description}
                  onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                  placeholder="Turn off all lights and lock doors at bedtime"
                  className="h-20"
                />
              </div>

              {/* Trigger Configuration */}
              <div>
                <Label>Trigger Type</Label>
                <Select 
                  value={newRule.trigger_type} 
                  onValueChange={(value) => setNewRule({...newRule, trigger_type: value, trigger_condition: {}})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(triggerTypes).map(([key, trigger]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <trigger.icon className="w-4 h-4" />
                          {trigger.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Trigger Conditions */}
              {newRule.trigger_type === 'time' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trigger-time">Time</Label>
                    <Input
                      id="trigger-time"
                      type="time"
                      value={newRule.trigger_condition.time || ''}
                      onChange={(e) => setNewRule({
                        ...newRule, 
                        trigger_condition: {...newRule.trigger_condition, time: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="trigger-days">Days</Label>
                    <Select 
                      value={newRule.trigger_condition.repeat || 'daily'}
                      onValueChange={(value) => setNewRule({
                        ...newRule,
                        trigger_condition: {...newRule.trigger_condition, repeat: value}
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekdays">Weekdays</SelectItem>
                        <SelectItem value="weekends">Weekends</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {newRule.trigger_type === 'device_state' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Device</Label>
                    <Select
                      value={newRule.trigger_condition.device_id || ''}
                      onValueChange={(value) => setNewRule({
                        ...newRule,
                        trigger_condition: {...newRule.trigger_condition, device_id: value}
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select device" />
                      </SelectTrigger>
                      <SelectContent>
                        {devices.map(device => (
                          <SelectItem key={device.id} value={device.id}>
                            {device.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>State</Label>
                    <Select
                      value={newRule.trigger_condition.state || ''}
                      onValueChange={(value) => setNewRule({
                        ...newRule,
                        trigger_condition: {...newRule.trigger_condition, state: value}
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on">Turn On</SelectItem>
                        <SelectItem value="off">Turn Off</SelectItem>
                        <SelectItem value="motion_detected">Motion Detected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Actions</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addAction}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Action
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {newRule.actions.map((action, index) => (
                    <Card key={index} className="p-3">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <Label className="text-xs">Device</Label>
                          <Select
                            value={action.device_id}
                            onValueChange={(value) => updateAction(index, 'device_id', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Device" />
                            </SelectTrigger>
                            <SelectContent>
                              {devices.map(device => (
                                <SelectItem key={device.id} value={device.id}>
                                  {device.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-xs">Action</Label>
                          <Select
                            value={action.action}
                            onValueChange={(value) => updateAction(index, 'action', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(deviceActions).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-xs">Value</Label>
                          <Input
                            value={action.value}
                            onChange={(e) => updateAction(index, 'value', e.target.value)}
                            placeholder="Optional value"
                          />
                        </div>
                        
                        <div className="flex items-end">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon"
                            onClick={() => removeAction(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveRule}>
                {editingRule ? 'Update Rule' : 'Create Rule'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Total Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {rules.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Automation rules created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Play className="w-4 h-4" />
              Active Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {rules.filter(rule => rule.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Connected Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {devices.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Available for automation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rules List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Automation Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-muted rounded-lg" />
                </div>
              ))}
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No automation rules yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Create your first automation rule to get started with smart home workflows
              </p>
              <Button onClick={resetForm} className="bg-primary hover:bg-primary-accent">
                <Plus className="w-4 h-4 mr-2" />
                Create First Rule
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <Card key={rule.id} className="border border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                          {getTriggerIcon(rule.trigger_type)}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{rule.name}</h3>
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                              {rule.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">
                              {triggerTypes[rule.trigger_type]?.name || rule.trigger_type}
                            </Badge>
                            <Badge variant="outline">
                              {rule.actions?.length || 0} actions
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={() => handleToggleRule(rule)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditRule(rule)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="text-danger hover:text-danger"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}