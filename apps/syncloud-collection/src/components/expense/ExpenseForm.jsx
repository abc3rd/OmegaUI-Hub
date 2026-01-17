import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Upload, X } from 'lucide-react';
import { UploadFile } from '@/integrations/Core';
import { toast } from 'sonner';

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'digital_wallet', label: 'Digital Wallet' },
  { value: 'check', label: 'Check' },
  { value: 'other', label: 'Other' }
];

export default function ExpenseForm({ categories, expense, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    description: expense?.description || '',
    amount: expense?.amount || '',
    category_id: expense?.category_id || '',
    expense_date: expense?.expense_date ? new Date(expense.expense_date) : new Date(),
    payment_method: expense?.payment_method || 'cash',
    vendor: expense?.vendor || '',
    location: expense?.location || '',
    receipt_url: expense?.receipt_url || '',
    tags: expense?.tags || [],
    is_recurring: expense?.is_recurring || false,
    recurring_frequency: expense?.recurring_frequency || 'monthly',
    is_business: expense?.is_business || false,
    is_reimbursable: expense?.is_reimbursable || false,
    notes: expense?.notes || ''
  });

  const [newTag, setNewTag] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleReceiptUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, receipt_url: file_url }));
      toast.success('Receipt uploaded successfully!');
    } catch (error) {
      console.error('Receipt upload failed:', error);
      toast.error('Failed to upload receipt');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    
    if (!formData.amount || formData.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!formData.category_id) {
      toast.error('Please select a category');
      return;
    }

    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
      expense_date: format(formData.expense_date, 'yyyy-MM-dd')
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="description">Description *</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="What did you spend on?"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(formData.expense_date, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.expense_date}
                onSelect={(date) => handleInputChange('expense_date', date)}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label>Payment Method</Label>
          <Select value={formData.payment_method} onValueChange={(value) => handleInputChange('payment_method', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map(method => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vendor">Vendor</Label>
          <Input
            id="vendor"
            value={formData.vendor}
            onChange={(e) => handleInputChange('vendor', e.target.value)}
            placeholder="Store or company name"
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Where was this expense?"
          />
        </div>
      </div>

      <div>
        <Label>Receipt</Label>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleReceiptUpload}
            className="hidden"
            id="receipt-upload"
          />
          <label htmlFor="receipt-upload">
            <Button variant="outline" size="sm" disabled={uploading} asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Receipt'}
              </span>
            </Button>
          </label>
          {formData.receipt_url && (
            <Badge variant="secondary">Receipt uploaded</Badge>
          )}
        </div>
      </div>

      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => handleRemoveTag(tag)}
              />
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={handleAddTag}>
            Add
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_business"
            checked={formData.is_business}
            onCheckedChange={(checked) => handleInputChange('is_business', checked)}
          />
          <Label htmlFor="is_business">Business expense</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_reimbursable"
            checked={formData.is_reimbursable}
            onCheckedChange={(checked) => handleInputChange('is_reimbursable', checked)}
          />
          <Label htmlFor="is_reimbursable">Reimbursable expense</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_recurring"
            checked={formData.is_recurring}
            onCheckedChange={(checked) => handleInputChange('is_recurring', checked)}
          />
          <Label htmlFor="is_recurring">Recurring expense</Label>
        </div>

        {formData.is_recurring && (
          <div>
            <Label>Frequency</Label>
            <Select value={formData.recurring_frequency} onValueChange={(value) => handleInputChange('recurring_frequency', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Additional notes about this expense..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {expense ? 'Update Expense' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
}