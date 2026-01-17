import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function ApiForm({ api, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    service_provider: '',
    endpoint_url: '',
    auth_type: 'api_key',
    status: 'inactive',
    config: '{}'
  });

  useEffect(() => {
    if (api) {
      setFormData({
        name: api.name || '',
        service_provider: api.service_provider || '',
        endpoint_url: api.endpoint_url || '',
        auth_type: api.auth_type || 'api_key',
        status: api.status || 'inactive',
        config: api.config ? JSON.stringify(api.config, null, 2) : '{}'
      });
    }
  }, [api]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const configObject = JSON.parse(formData.config);
      onSubmit({ ...formData, config: configObject });
    } catch (error) {
      alert("Invalid JSON in configuration.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Integration Name</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="bg-gray-800 border-gray-700"/>
        </div>
        <div>
          <Label htmlFor="service_provider">Service Provider</Label>
          <Input id="service_provider" name="service_provider" value={formData.service_provider} onChange={handleChange} required className="bg-gray-800 border-gray-700"/>
        </div>
      </div>
      <div>
        <Label htmlFor="endpoint_url">Endpoint URL</Label>
        <Input id="endpoint_url" name="endpoint_url" value={formData.endpoint_url} onChange={handleChange} required className="bg-gray-800 border-gray-700"/>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="auth_type">Auth Type</Label>
          <Select name="auth_type" value={formData.auth_type} onValueChange={(v) => handleSelectChange('auth_type', v)}>
            <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="api_key">API Key</SelectItem>
              <SelectItem value="oauth">OAuth</SelectItem>
              <SelectItem value="bearer_token">Bearer Token</SelectItem>
              <SelectItem value="basic_auth">Basic Auth</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select name="status" value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
            <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="config">Configuration (JSON)</Label>
        <Textarea id="config" name="config" value={formData.config} onChange={handleChange} rows={5} className="bg-gray-800 border-gray-700 font-mono text-sm"/>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="text-gray-300 border-gray-700 hover:bg-gray-800">Cancel</Button>
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">Save Integration</Button>
      </div>
    </form>
  );
}