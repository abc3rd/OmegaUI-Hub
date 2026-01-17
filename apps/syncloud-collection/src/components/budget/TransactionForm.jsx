import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function TransactionForm({ categories, transaction, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        description: transaction?.description || '',
        amount: transaction?.amount || '',
        transaction_type: transaction?.transaction_type || 'expense',
        category_id: transaction?.category_id || '',
        transaction_date: transaction?.transaction_date || new Date().toISOString().split('T')[0],
        payment_method: transaction?.payment_method || 'cash',
        vendor: transaction?.vendor || '',
        tags: transaction?.tags ? transaction.tags.join(', ') : '',
        notes: transaction?.notes || ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.description.trim()) {
            toast.error('Description is required');
            return;
        }

        if (!formData.amount || Number(formData.amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (!formData.category_id) {
            toast.error('Please select a category');
            return;
        }

        const transactionData = {
            ...formData,
            amount: Number(formData.amount),
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        };

        onSubmit(transactionData);
    };

    const filteredCategories = categories.filter(cat => {
        if (formData.transaction_type === 'income') {
            return cat.category_type === 'income' || cat.category_type === 'savings';
        }
        return cat.category_type === 'expense' || cat.category_type === 'savings';
    });

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="description">Description</Label>
                <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Coffee at Starbucks"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="25.00"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="transaction_type">Type</Label>
                    <Select
                        value={formData.transaction_type}
                        onValueChange={(value) => setFormData(prev => ({ 
                            ...prev, 
                            transaction_type: value,
                            category_id: '' // Reset category when type changes
                        }))}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="expense">Expense</SelectItem>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="transfer">Transfer</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <Label htmlFor="category_id">Category</Label>
                <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredCategories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center gap-2">
                                    <div 
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: category.color }}
                                    />
                                    {category.name}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="transaction_date">Date</Label>
                    <Input
                        id="transaction_date"
                        type="date"
                        value={formData.transaction_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, transaction_date: e.target.value }))}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="payment_method">Payment Method</Label>
                    <Select
                        value={formData.payment_method}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="credit_card">Credit Card</SelectItem>
                            <SelectItem value="debit_card">Debit Card</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="check">Check</SelectItem>
                            <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <Label htmlFor="vendor">Vendor/Merchant (Optional)</Label>
                <Input
                    id="vendor"
                    value={formData.vendor}
                    onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                    placeholder="Starbucks, Amazon, etc."
                />
            </div>

            <div>
                <Label htmlFor="tags">Tags (Optional)</Label>
                <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="work, personal, gift (comma separated)"
                />
            </div>

            <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional details..."
                    rows={3}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {transaction ? 'Update' : 'Add'} Transaction
                </Button>
            </div>
        </form>
    );
}