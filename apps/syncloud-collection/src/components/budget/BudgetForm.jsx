import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_CATEGORIES = [
    { name: 'Housing', color: '#3B82F6', icon: 'Home', type: 'expense', essential: true },
    { name: 'Food & Groceries', color: '#10B981', icon: 'ShoppingCart', type: 'expense', essential: true },
    { name: 'Transportation', color: '#F59E0B', icon: 'Car', type: 'expense', essential: true },
    { name: 'Utilities', color: '#8B5CF6', icon: 'Zap', type: 'expense', essential: true },
    { name: 'Healthcare', color: '#EF4444', icon: 'Heart', type: 'expense', essential: true },
    { name: 'Entertainment', color: '#F97316', icon: 'Film', type: 'expense', essential: false },
    { name: 'Shopping', color: '#06B6D4', icon: 'ShoppingBag', type: 'expense', essential: false },
    { name: 'Savings', color: '#84CC16', icon: 'PiggyBank', type: 'savings', essential: true },
    { name: 'Salary', color: '#22C55E', icon: 'DollarSign', type: 'income', essential: true },
    { name: 'Freelance', color: '#A3A3A3', icon: 'Briefcase', type: 'income', essential: false }
];

export default function BudgetForm({ budget, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: budget?.name || '',
        description: budget?.description || '',
        budget_type: budget?.budget_type || 'personal',
        period_type: budget?.period_type || 'monthly',
        start_date: budget?.start_date || new Date().toISOString().split('T')[0],
        end_date: budget?.end_date || '',
        total_income_target: budget?.total_income_target || 0,
        total_expense_limit: budget?.total_expense_limit || 0,
        savings_goal: budget?.savings_goal || 0,
        currency: budget?.currency || 'USD'
    });

    const [categories, setCategories] = useState(
        budget?.categories || DEFAULT_CATEGORIES.map(cat => ({
            ...cat,
            allocated_amount: 0
        }))
    );

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Budget name is required');
            return;
        }

        if (!formData.end_date) {
            toast.error('End date is required');
            return;
        }

        if (new Date(formData.start_date) >= new Date(formData.end_date)) {
            toast.error('End date must be after start date');
            return;
        }

        const totalCategoryBudget = categories
            .filter(c => c.type === 'expense')
            .reduce((sum, c) => sum + (c.allocated_amount || 0), 0);

        if (formData.total_expense_limit > 0 && totalCategoryBudget > formData.total_expense_limit) {
            toast.error('Total category budgets exceed the expense limit');
            return;
        }

        onSubmit({
            ...formData,
            categories
        });
    };

    const addCategory = () => {
        setCategories([
            ...categories,
            {
                name: '',
                color: '#6B7280',
                icon: 'DollarSign',
                type: 'expense',
                essential: false,
                allocated_amount: 0
            }
        ]);
    };

    const removeCategory = (index) => {
        setCategories(categories.filter((_, i) => i !== index));
    };

    const updateCategory = (index, field, value) => {
        const updated = [...categories];
        updated[index][field] = value;
        setCategories(updated);
    };

    const calculateEndDate = (startDate, periodType) => {
        const start = new Date(startDate);
        const end = new Date(start);
        
        switch (periodType) {
            case 'weekly':
                end.setDate(start.getDate() + 7);
                break;
            case 'monthly':
                end.setMonth(start.getMonth() + 1);
                break;
            case 'quarterly':
                end.setMonth(start.getMonth() + 3);
                break;
            case 'yearly':
                end.setFullYear(start.getFullYear() + 1);
                break;
        }
        
        return end.toISOString().split('T')[0];
    };

    const handlePeriodChange = (periodType) => {
        setFormData(prev => ({
            ...prev,
            period_type: periodType,
            end_date: calculateEndDate(prev.start_date, periodType)
        }));
    };

    const totalBudgeted = categories
        .filter(c => c.type === 'expense')
        .reduce((sum, c) => sum + (Number(c.allocated_amount) || 0), 0);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Budget Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="name">Budget Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="My Monthly Budget"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="budget_type">Budget Type</Label>
                            <Select
                                value={formData.budget_type}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, budget_type: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="personal">Personal</SelectItem>
                                    <SelectItem value="household">Household</SelectItem>
                                    <SelectItem value="business">Business</SelectItem>
                                    <SelectItem value="project">Project</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe your budget goals..."
                            rows={2}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="period_type">Period</Label>
                            <Select
                                value={formData.period_type}
                                onValueChange={handlePeriodChange}
                            >
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
                        <div>
                            <Label htmlFor="start_date">Start Date</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => {
                                    const startDate = e.target.value;
                                    setFormData(prev => ({
                                        ...prev,
                                        start_date: startDate,
                                        end_date: calculateEndDate(startDate, prev.period_type)
                                    }));
                                }}
                            />
                        </div>
                        <div>
                            <Label htmlFor="end_date">End Date</Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Budget Targets */}
            <Card>
                <CardHeader>
                    <CardTitle>Budget Targets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="income_target">Income Target</Label>
                            <Input
                                id="income_target"
                                type="number"
                                value={formData.total_income_target}
                                onChange={(e) => setFormData(prev => ({ 
                                    ...prev, 
                                    total_income_target: Number(e.target.value) 
                                }))}
                                placeholder="5000"
                            />
                        </div>
                        <div>
                            <Label htmlFor="expense_limit">Expense Limit</Label>
                            <Input
                                id="expense_limit"
                                type="number"
                                value={formData.total_expense_limit}
                                onChange={(e) => setFormData(prev => ({ 
                                    ...prev, 
                                    total_expense_limit: Number(e.target.value) 
                                }))}
                                placeholder="4000"
                            />
                        </div>
                        <div>
                            <Label htmlFor="savings_goal">Savings Goal</Label>
                            <Input
                                id="savings_goal"
                                type="number"
                                value={formData.savings_goal}
                                onChange={(e) => setFormData(prev => ({ 
                                    ...prev, 
                                    savings_goal: Number(e.target.value) 
                                }))}
                                placeholder="1000"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Categories */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Budget Categories</CardTitle>
                        <Button type="button" onClick={addCategory} size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Category
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Total budgeted: ${totalBudgeted.toLocaleString()}
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {categories.map((category, index) => (
                            <div key={index} className="grid grid-cols-6 gap-3 items-center p-3 border rounded-lg">
                                <div>
                                    <Input
                                        value={category.name}
                                        onChange={(e) => updateCategory(index, 'name', e.target.value)}
                                        placeholder="Category name"
                                        className="text-sm"
                                    />
                                </div>
                                <div>
                                    <Select
                                        value={category.type}
                                        onValueChange={(value) => updateCategory(index, 'type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="income">Income</SelectItem>
                                            <SelectItem value="expense">Expense</SelectItem>
                                            <SelectItem value="savings">Savings</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Input
                                        type="number"
                                        value={category.allocated_amount || ''}
                                        onChange={(e) => updateCategory(index, 'allocated_amount', Number(e.target.value))}
                                        placeholder="Amount"
                                        className="text-sm"
                                    />
                                </div>
                                <div>
                                    <Input
                                        type="color"
                                        value={category.color}
                                        onChange={(e) => updateCategory(index, 'color', e.target.value)}
                                        className="w-full h-9"
                                    />
                                </div>
                                <div className="flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        checked={category.essential}
                                        onChange={(e) => updateCategory(index, 'essential', e.target.checked)}
                                        className="rounded"
                                    />
                                </div>
                                <div className="flex justify-center">
                                    <Button
                                        type="button"
                                        onClick={() => removeCategory(index)}
                                        size="sm"
                                        variant="ghost"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {budget ? 'Update Budget' : 'Create Budget'}
                </Button>
            </div>
        </form>
    );
}