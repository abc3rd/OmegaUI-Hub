import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, X } from "lucide-react";

export default function PluginForm({ plugin, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    name: plugin?.name || "",
    description: plugin?.description || "",
    category: plugin?.category || "automation",
    version: plugin?.version || "v1.0",
    status: plugin?.status || "draft",
    source_subaccount_id: plugin?.source_subaccount_id || "",
    bundle_data: plugin?.bundle_data || {
      workflow_ids: [],
      custom_field_ids: [],
      email_template_ids: [],
      funnel_ids: [],
      form_ids: []
    }
  });

  const addAssetId = (type) => {
    setFormData({
      ...formData,
      bundle_data: {
        ...formData.bundle_data,
        [type]: [...formData.bundle_data[type], ""]
      }
    });
  };

  const updateAssetId = (type, index, value) => {
    const newIds = [...formData.bundle_data[type]];
    newIds[index] = value;
    setFormData({
      ...formData,
      bundle_data: {
        ...formData.bundle_data,
        [type]: newIds
      }
    });
  };

  const removeAssetId = (type, index) => {
    setFormData({
      ...formData,
      bundle_data: {
        ...formData.bundle_data,
        [type]: formData.bundle_data[type].filter((_, i) => i !== index)
      }
    });
  };

  const assetTypes = [
    { key: 'workflow_ids', label: 'Workflow IDs', placeholder: 'Enter workflow ID' },
    { key: 'custom_field_ids', label: 'Custom Field IDs', placeholder: 'Enter custom field ID' },
    { key: 'email_template_ids', label: 'Email Template IDs', placeholder: 'Enter email template ID' },
    { key: 'funnel_ids', label: 'Funnel IDs', placeholder: 'Enter funnel ID' },
    { key: 'form_ids', label: 'Form IDs', placeholder: 'Enter form ID' },
  ];

  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader>
        <CardTitle>{plugin ? 'Edit Plugin Bundle' : 'New Plugin Bundle'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Plugin Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Pest Control SMS Reactivation"
            />
          </div>
          <div className="space-y-2">
            <Label>Version</Label>
            <Input
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              placeholder="e.g., v1.0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what this plug-in does..."
            rows={3}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="automation">Automation</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Source Sub-Account ID</Label>
          <Input
            value={formData.source_subaccount_id}
            onChange={(e) => setFormData({ ...formData, source_subaccount_id: e.target.value })}
            placeholder="Golden account ID where assets originate"
          />
        </div>

        <div className="border-t pt-6 space-y-6">
          <h3 className="font-semibold text-lg">Asset References</h3>
          
          {assetTypes.map((assetType) => (
            <div key={assetType.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{assetType.label}</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addAssetId(assetType.key)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
              {formData.bundle_data[assetType.key].map((id, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={id}
                    onChange={(e) => updateAssetId(assetType.key, idx, e.target.value)}
                    placeholder={assetType.placeholder}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAssetId(assetType.key, idx)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)} disabled={isLoading} className="bg-[#ea00ea] hover:bg-[#c900c9]">
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Plugin'}
        </Button>
      </CardFooter>
    </Card>
  );
}