import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function QRForm({ qrCode, onChange, onSubmit, onCancel, isEdit = false }) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <Label htmlFor="label">QR Code Label *</Label>
        <Input
          id="label"
          value={qrCode.label || ''}
          onChange={(e) => onChange({ ...qrCode, label: e.target.value })}
          placeholder="e.g., Product Demo Link"
          required
        />
      </div>

      <div>
        <Label htmlFor="command_payload">UCP Command Payload *</Label>
        <Textarea
          id="command_payload"
          value={qrCode.command_payload || ''}
          onChange={(e) => onChange({ ...qrCode, command_payload: e.target.value })}
          placeholder="UCP::COMMAND EXECUTE ID=..."
          rows={4}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter a valid UCP command string or instruction
        </p>
      </div>

      <div>
        <Label htmlFor="redirect_url">Redirect URL (Optional)</Label>
        <Input
          id="redirect_url"
          type="url"
          value={qrCode.redirect_url || ''}
          onChange={(e) => onChange({ ...qrCode, redirect_url: e.target.value })}
          placeholder="https://example.com"
        />
        <p className="text-xs text-gray-500 mt-1">
          Fallback destination if command execution is not available
        </p>
      </div>

      {isEdit && (
        <div>
          <Label htmlFor="status">Status</Label>
          <Select 
            value={qrCode.status || 'active'}
            onValueChange={(value) => onChange({ ...qrCode, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          className="bg-gradient-to-r from-[#ea00ea] to-[#2699fe]"
        >
          {isEdit ? 'Update QR Code' : 'Create QR Code'}
        </Button>
      </div>
    </form>
  );
}