import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TicketForm({ ticket, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    client_info: {
      name: '',
      email: '',
      company: ''
    }
  });

  useEffect(() => {
    if (ticket) {
      setFormData({
        title: ticket.title || '',
        description: ticket.description || '',
        priority: ticket.priority || 'medium',
        category: ticket.category || 'general',
        client_info: ticket.client_info || {
          name: '',
          email: '',
          company: ''
        }
      });
    }
  }, [ticket]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('client_')) {
      const clientField = name.replace('client_', '');
      setFormData(prev => ({
        ...prev,
        client_info: {
          ...prev.client_info,
          [clientField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Priority</Label>
          <Select value={formData.priority} onValueChange={(v) => handleSelectChange('priority', v)}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Category</Label>
          <Select value={formData.category} onValueChange={(v) => handleSelectChange('category', v)}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="network">Network</SelectItem>
              <SelectItem value="api">API</SelectItem>
              <SelectItem value="ai_support">AI Support</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Client Information</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            placeholder="Client Name"
            name="client_name"
            value={formData.client_info.name}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white"
          />
          <Input
            placeholder="Client Email"
            name="client_email"
            type="email"
            value={formData.client_info.email}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <Input
          placeholder="Company Name"
          name="client_company"
          value={formData.client_info.company}
          onChange={handleChange}
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="text-gray-300 border-gray-700 hover:bg-gray-800">
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
          {ticket ? 'Update' : 'Create'} Ticket
        </Button>
      </div>
    </form>
  );
}