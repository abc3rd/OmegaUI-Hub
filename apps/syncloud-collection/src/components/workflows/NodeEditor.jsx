import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Settings } from 'lucide-react';

const triggers = {
  manual: { name: 'Manual Trigger', config: [] },
  contact_created: { name: 'New Contact Created', config: [] },
  lead_created: { name: 'New Lead Created', config: [] },
  task_completed: { name: 'Task Completed', config: [] },
  project_created: { name: 'New Project Created', config: [] },
  project_status_changed: { 
    name: 'Project Status Changed', 
    config: [{ key: 'to_status', label: 'To Status', type: 'select', options: ['draft', 'active', 'completed', 'archived'] }] 
  },
  tag_added_to_contact: { 
    name: 'Tag Added to Contact', 
    config: [{ key: 'tag', label: 'Tag Name', type: 'text' }] 
  },
  lead_status_changed: { 
    name: 'Lead Status Changed', 
    config: [{ key: 'to_status', label: 'To Status', type: 'select', options: ['new', 'contacted', 'qualified', 'lost'] }] 
  }
};

const actions = {
  send_email: { 
    name: 'Send Email', 
    config: [
      { key: 'to', label: 'To Email', type: 'text', placeholder: 'e.g., {{trigger.data.email}}' },
      { key: 'subject', label: 'Subject', type: 'text', placeholder: 'Email subject' },
      { key: 'body', label: 'Body', type: 'textarea', placeholder: 'Email content...' }
    ] 
  },
  create_task: { 
    name: 'Create Task', 
    config: [
      { key: 'title', label: 'Task Title', type: 'text', placeholder: 'What needs to be done?' },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Task details...' },
      { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high'] },
      { key: 'due_date', label: 'Due Date', type: 'date' }
    ] 
  },
  create_lead: { 
    name: 'Create Lead', 
    config: [
      { key: 'full_name', label: 'Full Name', type: 'text', placeholder: 'Lead name' },
      { key: 'email', label: 'Email', type: 'email', placeholder: 'lead@example.com' },
      { key: 'company', label: 'Company', type: 'text', placeholder: 'Company name' },
      { key: 'source', label: 'Source', type: 'text', placeholder: 'Where did this lead come from?' }
    ] 
  },
  add_contact_tags: { 
    name: 'Add Tags to Contact', 
    config: [
      { key: 'contact_id', label: 'Contact ID', type: 'text', placeholder: 'e.g., {{trigger.id}}' },
      { key: 'tags', label: 'Tags', type: 'text', placeholder: 'tag1, tag2, tag3' }
    ] 
  },
  update_lead_status: { 
    name: 'Update Lead Status', 
    config: [
      { key: 'lead_id', label: 'Lead ID', type: 'text', placeholder: 'e.g., {{trigger.id}}' },
      { key: 'status', label: 'New Status', type: 'select', options: ['new', 'contacted', 'qualified', 'lost'] }
    ] 
  },
  create_project: { 
    name: 'Create Project', 
    config: [
      { key: 'name', label: 'Project Name', type: 'text', placeholder: 'Project title' },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'What is this project about?' },
      { key: 'status', label: 'Initial Status', type: 'select', options: ['draft', 'active'] }
    ] 
  },
  post_to_social_media: { 
    name: 'Post to Social Media', 
    config: [
      { key: 'platforms', label: 'Platforms', type: 'text', placeholder: 'twitter, facebook, linkedin' },
      { key: 'content', label: 'Content', type: 'textarea', placeholder: 'What do you want to post?' },
      { key: 'image_url', label: 'Image URL (optional)', type: 'text', placeholder: 'https://...' }
    ] 
  },
  wait_delay: { 
    name: 'Wait / Delay', 
    config: [
      { key: 'duration', label: 'Duration', type: 'number', placeholder: '30' },
      { key: 'unit', label: 'Unit', type: 'select', options: ['minutes', 'hours', 'days'] }
    ] 
  },
  trigger_n8n: { 
    name: 'Trigger N8n Workflow', 
    config: [
      { key: 'workflow_id', label: 'N8n Workflow ID', type: 'text', placeholder: 'Your N8n workflow ID' },
      { key: 'data', label: 'Data to Send (JSON)', type: 'textarea', placeholder: '{"key": "value"}' }
    ] 
  }
};

export default function NodeEditor({ node, onUpdate, onDelete }) {
  if (!node) return null;

  const isAction = node.type === 'action';
  const nodeTypes = isAction ? actions : triggers;
  const currentType = nodeTypes[node.data?.type] || nodeTypes[Object.keys(nodeTypes)[0]];

  const handleTypeChange = (newType) => {
    onUpdate({
      type: newType,
      config: {}
    });
  };

  const handleConfigChange = (key, value) => {
    onUpdate({
      ...node.data,
      config: {
        ...node.data.config,
        [key]: value
      }
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {isAction ? 'Action Settings' : 'Trigger Settings'}
          </CardTitle>
          {node.id !== 'trigger' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(node.id)}
              className="w-6 h-6 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm">
            {isAction ? 'Action Type' : 'Trigger Type'}
          </Label>
          <Select value={node.data?.type} onValueChange={handleTypeChange}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(nodeTypes).map(([key, meta]) => (
                <SelectItem key={key} value={key}>
                  {meta.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentType?.config?.map((field) => (
          <div key={field.key}>
            <Label className="text-sm">{field.label}</Label>
            {field.type === 'textarea' ? (
              <Textarea
                value={node.data?.config?.[field.key] || ''}
                onChange={(e) => handleConfigChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="mt-1 h-20"
              />
            ) : field.type === 'select' ? (
              <Select
                value={node.data?.config?.[field.key] || ''}
                onValueChange={(value) => handleConfigChange(field.key, value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={field.type}
                value={node.data?.config?.[field.key] || ''}
                onChange={(e) => handleConfigChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="mt-1"
              />
            )}
          </div>
        ))}

        {currentType?.config?.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No configuration needed for this {isAction ? 'action' : 'trigger'}.
          </div>
        )}
      </CardContent>
    </Card>
  );
}