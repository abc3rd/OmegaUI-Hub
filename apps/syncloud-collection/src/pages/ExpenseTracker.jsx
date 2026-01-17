import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Plus, 
  PieChart,
  BarChart3,
  Calendar,
  Receipt,
  Download,
  MapPin,
  AlertTriangle,
  Edit
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Expense } from '@/entities/Expense';
import { ExpenseCategory } from '@/entities/ExpenseCategory';
import { ExpenseReport } from '@/entities/ExpenseReport';
import ExpenseForm from '@/components/expense/ExpenseForm';
import ExpenseAnalytics from '@/components/expense/ExpenseAnalytics';
import ExpenseReports from '@/components/expense/ExpenseReports';
import { toast } from 'sonner';

export default function ExpenseTracker() {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedPeriod, setSelectedPeriod] = useState('this_month');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');

    const createDefaultCategories = async () => {
        const defaultCategories = [
            { name: 'Food & Dining', color: '#10B981', icon: 'Utensils', is_essential: true },
            { name: 'Transportation', color: '#F59E0B', icon: 'Car', is_essential: true },
            { name: 'Shopping', color: '#8B5CF6', icon: 'ShoppingBag', is_essential: false },
            { name: 'Entertainment', color: '#EF4444', icon: 'Film', is_essential: false },
            { name: 'Bills & Utilities', color: '#3B82F6', icon: 'FileText', is_essential: true },
            { name: 'Healthcare', color: '#EC4899', icon: 'Heart', is_essential: true },
            { name: 'Travel', color: '#F97316', icon: 'Plane', is_essential: false },
            { name: 'Education', color: '#06B6D4', icon: 'BookOpen', is_essential: false },
            { name: 'Personal Care', color: '#84CC16', icon: 'Scissors', is_essential: false },
            { name: 'Other', color: '#6B7280', icon: 'HelpCircle', is_essential: false }
        ];

        try {
            const createdCategories = await Promise.all(
                defaultCategories.map(cat => ExpenseCategory.create(cat))
            );
            setCategories(createdCategories);
        } catch (error) {
            console.error('Failed to create default categories:', error);
        }
    };

    const loadExpenseData = useCallback(async () => {
        try {
            const [expenseData, categoryData, reportData] = await Promise.allSettled([
                Expense.list('-expense_date', 200),
                ExpenseCategory.list('sort_order'),
                ExpenseReport.list('-created_date', 10)
            ]);

            setExpenses(expenseData.status === 'fulfilled' ? expenseData.value : []);
            setCategories(categoryData.status === 'fulfilled' ? categoryData.value : []);
            setReports(reportData.status === 'fulfilled' ? reportData.value : []);

            // Create default categories if none exist
            if (categoryData.status === 'fulfilled' && categoryData.value.length === 0) {
                await createDefaultCategories();
            }
        } catch (error) {
            console.error('Failed to load expense data:', error);
            toast.error('Failed to load expense data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadExpenseData();
    }, [loadExpenseData]);

    const filteredExpenses = useMemo(() => {
        return expenses.filter(expense => {
            // Text search
            if (searchTerm && !expense.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }

            // Category filter
            if (selectedCategory !== 'all' && expense.category_id !== selectedCategory) {
                return false;
            }

            // Payment method filter
            if (selectedPaymentMethod !== 'all' && expense.payment_method !== selectedPaymentMethod) {
                return false;
            }

            // Period filter
            const expenseDate = new Date(expense.expense_date);
            const now = new Date();
            
            switch (selectedPeriod) {
                case 'today':
                    return expenseDate.toDateString() === now.toDateString();
                case 'this_week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return expenseDate >= weekAgo;
                case 'this_month':
                    return expenseDate.getMonth() === now.getMonth() && 
                           expenseDate.getFullYear() === now.getFullYear();
                case 'this_year':
                    return expenseDate.getFullYear() === now.getFullYear();
                case 'last_30_days':
                    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return expenseDate >= thirtyDaysAgo;
                default:
                    return true;
            }
        });
    }, [expenses, searchTerm, selectedCategory, selectedPeriod, selectedPaymentMethod]);

    const expenseSummary = useMemo(() => {
        const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const count = filteredExpenses.length;
        
        const categoryBreakdown = categories.map(category => {
            const categoryExpenses = filteredExpenses.filter(e => e.category_id === category.id);
            const amount = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
            const percentage = total > 0 ? (amount / total) * 100 : 0;
            
            return {
                ...category,
                amount,
                percentage,
                count: categoryExpenses.length,
                isOverBudget: category.monthly_budget > 0 && amount > category.monthly_budget
            };
        }).filter(cat => cat.amount > 0).sort((a, b) => b.amount - a.amount);

        const averageExpense = count > 0 ? total / count : 0;
        
        const paymentMethodBreakdown = filteredExpenses.reduce((acc, expense) => {
            acc[expense.payment_method] = (acc[expense.payment_method] || 0) + expense.amount;
            return acc;
        }, {});

        const topVendors = filteredExpenses.reduce((acc, expense) => {
            if (expense.vendor) {
                acc[expense.vendor] = (acc[expense.vendor] || 0) + expense.amount;
            }
            return acc;
        }, {});

        const sortedVendors = Object.entries(topVendors)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        return {
            total,
            count,
            averageExpense,
            categoryBreakdown,
            paymentMethodBreakdown,
            topVendors: sortedVendors
        };
    }, [filteredExpenses, categories]);

    const handleAddExpense = async (expenseData) => {
        try {
            const newExpense = await Expense.create(expenseData);
            setExpenses(prev => [newExpense, ...prev]);
            setShowExpenseForm(false);
            toast.success('Expense added successfully!');
        } catch (error) {
            console.error('Failed to add expense:', error);
            toast.error('Failed to add expense');
        }
    };

    const handleEditExpense = async (expenseData) => {
        try {
            const updatedExpense = await Expense.update(editingExpense.id, expenseData);
            setExpenses(prev => prev.map(e => e.id === editingExpense.id ? updatedExpense : e));
            setEditingExpense(null);
            setShowExpenseForm(false);
            toast.success('Expense updated successfully!');
        } catch (error) {
            console.error('Failed to update expense:', error);
            toast.error('Failed to update expense');
        }
    };

    const handleDeleteExpense = async (expenseId) => {
        try {
            await Expense.delete(expenseId);
            setExpenses(prev => prev.filter(e => e.id !== expenseId));
            toast.success('Expense deleted successfully!');
        } catch (error) {
            console.error('Failed to delete expense:', error);
            toast.error('Failed to delete expense');
        }
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {Array(4).fill(0).map((_, i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                    <div className="h-64 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Expense Tracker
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Log and analyze your spending habits with detailed insights
                    </p>
                </div>
                <div className="flex gap-3">
                    <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                                <Plus className="w-4 h-4" />
                                Add Expense
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                                </DialogTitle>
                            </DialogHeader>
                            <ExpenseForm
                                categories={categories}
                                expense={editingExpense}
                                onSubmit={editingExpense ? handleEditExpense : handleAddExpense}
                                onCancel={() => {
                                    setShowExpenseForm(false);
                                    setEditingExpense(null);
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <Input
                                placeholder="Search expenses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map(category => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="this_week">This Week</SelectItem>
                                    <SelectItem value="this_month">This Month</SelectItem>
                                    <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                                    <SelectItem value="this_year">This Year</SelectItem>
                                    <SelectItem value="all">All Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Payment Methods" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Payment Methods</SelectItem>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="credit_card">Credit Card</SelectItem>
                                    <SelectItem value="debit_card">Debit Card</SelectItem>
                                    <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Button variant="outline" className="w-full">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                            <DollarSign className="w-4 h-4 text-red-500" />
                            Total Expenses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            ${expenseSummary.total.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {expenseSummary.count} transactions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BarChart3 className="w-4 h-4 text-blue-500" />
                            Average Expense
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            ${expenseSummary.averageExpense.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Per transaction
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                            <PieChart className="w-4 h-4 text-green-500" />
                            Top Category
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold text-green-600">
                            {expenseSummary.categoryBreakdown[0]?.name || 'No expenses'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {expenseSummary.categoryBreakdown[0] ? 
                                `$${expenseSummary.categoryBreakdown[0].amount.toLocaleString()} (${expenseSummary.categoryBreakdown[0].percentage.toFixed(1)}%)` :
                                'Add some expenses'
                            }
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 text-purple-500" />
                            This Month
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            ${expenses.filter(e => {
                                const date = new Date(e.expense_date);
                                const now = new Date();
                                return date.getMonth() === now.getMonth() && 
                                       date.getFullYear() === now.getFullYear();
                            }).reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Current month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="expenses">Expenses</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Category Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChart className="w-5 h-5" />
                                    Spending by Category
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {expenseSummary.categoryBreakdown.slice(0, 8).map(category => (
                                        <div key={category.id}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: category.color }}
                                                    />
                                                    <span className="text-sm font-medium">{category.name}</span>
                                                    {category.isOverBudget && (
                                                        <AlertTriangle className="w-3 h-3 text-red-500" />
                                                    )}
                                                </div>
                                                <span className="text-sm font-bold">
                                                    ${category.amount.toLocaleString()}
                                                </span>
                                            </div>
                                            <Progress value={category.percentage} className="h-2" />
                                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                <span>{category.percentage.toFixed(1)}% of total</span>
                                                <span>{category.count} transactions</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Vendors */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Top Vendors
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {expenseSummary.topVendors.slice(0, 10).map(([vendor, amount], index) => (
                                        <div key={vendor} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground w-4">
                                                    #{index + 1}
                                                </span>
                                                <span className="text-sm font-medium">{vendor}</span>
                                            </div>
                                            <span className="text-sm font-bold">
                                                ${amount.toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                    {expenseSummary.topVendors.length === 0 && (
                                        <p className="text-center text-muted-foreground py-4">
                                            No vendor data available
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="expenses" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Expenses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {filteredExpenses.slice(0, 50).map(expense => {
                                    const category = categories.find(c => c.id === expense.category_id);
                                    return (
                                        <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: category?.color || '#6B7280' }}
                                                />
                                                <div>
                                                    <p className="font-medium">{expense.description}</p>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <span>{category?.name}</span>
                                                        {expense.vendor && (
                                                            <>
                                                                <span>•</span>
                                                                <span>{expense.vendor}</span>
                                                            </>
                                                        )}
                                                        <span>•</span>
                                                        <span>{new Date(expense.expense_date).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <p className="font-medium text-red-600">
                                                        ${expense.amount.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground capitalize">
                                                        {expense.payment_method.replace('_', ' ')}
                                                    </p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setEditingExpense(expense);
                                                            setShowExpenseForm(true);
                                                        }}
                                                    >
                                                        <Edit className="w-3 h-3" />
                                                    </Button>
                                                    {expense.receipt_url && (
                                                        <Button size="sm" variant="ghost">
                                                            <Receipt className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredExpenses.length === 0 && (
                                    <div className="text-center py-12">
                                        <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-muted-foreground">
                                            No expenses found for the selected filters
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <ExpenseAnalytics 
                        expenses={filteredExpenses}
                        categories={categories}
                        summary={expenseSummary}
                    />
                </TabsContent>

                <TabsContent value="reports" className="space-y-6">
                    <ExpenseReports 
                        expenses={expenses}
                        categories={categories}
                        reports={reports}
                        onReportGenerated={loadExpenseData}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}