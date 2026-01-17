import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Wallet
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
import { Budget } from '@/entities/Budget';
import { BudgetCategory } from '@/entities/BudgetCategory';
import { Transaction } from '@/entities/Transaction';
import { BudgetGoal } from '@/entities/BudgetGoal';
import BudgetForm from '@/components/budget/BudgetForm';
import TransactionForm from '@/components/budget/TransactionForm';
import BudgetAnalytics from '@/components/budget/BudgetAnalytics';
import { toast } from 'sonner';

export default function BudgetPlanner() {
    const [budgets, setBudgets] = useState([]);
    const [activeBudget, setActiveBudget] = useState(null);
    const [categories, setCategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBudgetForm, setShowBudgetForm] = useState(false);
    const [showTransactionForm, setShowTransactionForm] = useState(false);

    useEffect(() => {
        loadBudgetData();
    }, []);

    const loadBudgetData = async () => {
        try {
            const [budgetData, categoryData, transactionData, goalData] = await Promise.allSettled([
                Budget.list('-created_date'),
                BudgetCategory.list(),
                Transaction.list('-transaction_date', 100),
                BudgetGoal.list()
            ]);

            setBudgets(budgetData.status === 'fulfilled' ? budgetData.value : []);
            setCategories(categoryData.status === 'fulfilled' ? categoryData.value : []);
            setTransactions(transactionData.status === 'fulfilled' ? transactionData.value : []);
            setGoals(goalData.status === 'fulfilled' ? goalData.value : []);

            // Set first active budget as default
            const activeBudgets = budgetData.status === 'fulfilled' ? budgetData.value.filter(b => b.status === 'active') : [];
            if (activeBudgets.length > 0) {
                setActiveBudget(activeBudgets[0]);
            }
        } catch (error) {
            console.error('Failed to load budget data:', error);
            toast.error('Failed to load budget data');
        } finally {
            setLoading(false);
        }
    };

    const budgetSummary = useMemo(() => {
        if (!activeBudget) return null;

        const budgetCategories = categories.filter(c => c.budget_id === activeBudget.id);
        const budgetTransactions = transactions.filter(t => t.budget_id === activeBudget.id);
        const budgetGoals = goals.filter(g => g.budget_id === activeBudget.id);

        const totalIncome = budgetTransactions
            .filter(t => t.transaction_type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = budgetTransactions
            .filter(t => t.transaction_type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const totalBudgeted = budgetCategories
            .filter(c => c.category_type === 'expense')
            .reduce((sum, c) => sum + c.allocated_amount, 0);

        const remainingBudget = totalBudgeted - totalExpenses;
        const netIncome = totalIncome - totalExpenses;

        const categoryBreakdown = budgetCategories.map(category => {
            const categoryTransactions = budgetTransactions.filter(t => t.category_id === category.id);
            const spent = categoryTransactions.reduce((sum, t) => 
                sum + (t.transaction_type === 'expense' ? Math.abs(t.amount) : 0), 0
            );
            
            const percentage = category.allocated_amount > 0 ? (spent / category.allocated_amount) * 100 : 0;
            const isOverBudget = spent > category.allocated_amount;
            const isNearLimit = percentage >= category.alert_threshold;

            return {
                ...category,
                spent,
                remaining: category.allocated_amount - spent,
                percentage: Math.min(percentage, 100),
                isOverBudget,
                isNearLimit,
                transactionCount: categoryTransactions.length
            };
        });

        return {
            totalIncome,
            totalExpenses,
            totalBudgeted,
            remainingBudget,
            netIncome,
            categoryBreakdown,
            budgetGoals,
            utilizationRate: totalBudgeted > 0 ? (totalExpenses / totalBudgeted) * 100 : 0
        };
    }, [activeBudget, categories, transactions, goals]);

    const handleCreateBudget = async (budgetData) => {
        try {
            const newBudget = await Budget.create(budgetData);
            setBudgets(prev => [newBudget, ...prev]);
            setActiveBudget(newBudget);
            setShowBudgetForm(false);
            toast.success('Budget created successfully!');
        } catch (error) {
            console.error('Failed to create budget:', error);
            toast.error('Failed to create budget');
        }
    };

    const handleAddTransaction = async (transactionData) => {
        try {
            const transaction = await Transaction.create({
                ...transactionData,
                budget_id: activeBudget.id
            });
            setTransactions(prev => [transaction, ...prev]);
            setShowTransactionForm(false);
            toast.success('Transaction added successfully!');
            
            // Update category spent amount
            await updateCategorySpentAmount(transaction.category_id);
        } catch (error) {
            console.error('Failed to add transaction:', error);
            toast.error('Failed to add transaction');
        }
    };

    const updateCategorySpentAmount = async (categoryId) => {
        const categoryTransactions = transactions.filter(t => 
            t.category_id === categoryId && t.transaction_type === 'expense'
        );
        const totalSpent = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        try {
            await BudgetCategory.update(categoryId, { spent_amount: totalSpent });
            loadBudgetData(); // Refresh data
        } catch (error) {
            console.error('Failed to update category spent amount:', error);
        }
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Array(3).fill(0).map((_, i) => (
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
                        Budget Planner
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage your personal and household budgets with intelligent insights
                    </p>
                </div>
                <div className="flex gap-3">
                    <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
                        <DialogTrigger asChild>
                            <Button 
                                variant="outline" 
                                disabled={!activeBudget}
                                className="gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Transaction
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add Transaction</DialogTitle>
                            </DialogHeader>
                            <TransactionForm
                                categories={categories.filter(c => c.budget_id === activeBudget?.id)}
                                onSubmit={handleAddTransaction}
                                onCancel={() => setShowTransactionForm(false)}
                            />
                        </DialogContent>
                    </Dialog>
                    
                    <Dialog open={showBudgetForm} onOpenChange={setShowBudgetForm}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                                <Plus className="w-4 h-4" />
                                Create Budget
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Create New Budget</DialogTitle>
                            </DialogHeader>
                            <BudgetForm
                                onSubmit={handleCreateBudget}
                                onCancel={() => setShowBudgetForm(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {!activeBudget ? (
                <div className="text-center py-12">
                    <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        No Budget Found
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Create your first budget to start tracking your finances
                    </p>
                    <Button 
                        onClick={() => setShowBudgetForm(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Budget
                    </Button>
                </div>
            ) : (
                <>
                    {/* Budget Selector */}
                    {budgets.length > 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Active Budget</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {budgets.map(budget => (
                                        <Button
                                            key={budget.id}
                                            variant={budget.id === activeBudget.id ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setActiveBudget(budget)}
                                        >
                                            {budget.name}
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Budget Summary Cards */}
                    {budgetSummary && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                        Total Income
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">
                                        ${budgetSummary.totalIncome.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        This period
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <TrendingDown className="w-4 h-4 text-red-500" />
                                        Total Expenses
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">
                                        ${budgetSummary.totalExpenses.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {budgetSummary.utilizationRate.toFixed(1)}% of budget
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <DollarSign className="w-4 h-4 text-blue-500" />
                                        Remaining Budget
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-2xl font-bold ${budgetSummary.remainingBudget >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                        ${budgetSummary.remainingBudget.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {budgetSummary.remainingBudget >= 0 ? 'Available to spend' : 'Over budget'}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Target className="w-4 h-4 text-purple-500" />
                                        Net Income
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-2xl font-bold ${budgetSummary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ${budgetSummary.netIncome.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Income - Expenses
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Main Content Tabs */}
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="categories">Categories</TabsTrigger>
                            <TabsTrigger value="transactions">Transactions</TabsTrigger>
                            <TabsTrigger value="goals">Goals</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            {budgetSummary && (
                                <BudgetAnalytics 
                                    budgetSummary={budgetSummary}
                                    activeBudget={activeBudget}
                                />
                            )}
                        </TabsContent>

                        <TabsContent value="categories" className="space-y-6">
                            <div className="grid gap-4">
                                {budgetSummary?.categoryBreakdown.map(category => (
                                    <Card key={category.id}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="flex items-center gap-2">
                                                    <div 
                                                        className="w-4 h-4 rounded-full"
                                                        style={{ backgroundColor: category.color }}
                                                    />
                                                    {category.name}
                                                </CardTitle>
                                                <div className="flex items-center gap-2">
                                                    {category.isOverBudget && (
                                                        <Badge variant="destructive">Over Budget</Badge>
                                                    )}
                                                    {category.isNearLimit && !category.isOverBudget && (
                                                        <Badge variant="secondary">Near Limit</Badge>
                                                    )}
                                                    <Badge variant="outline">
                                                        {category.transactionCount} transactions
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        ${category.spent.toLocaleString()} of ${category.allocated_amount.toLocaleString()}
                                                    </span>
                                                    <span className={category.isOverBudget ? 'text-red-600' : 'text-muted-foreground'}>
                                                        {category.percentage.toFixed(1)}%
                                                    </span>
                                                </div>
                                                <Progress 
                                                    value={category.percentage} 
                                                    className={`h-2 ${category.isOverBudget ? 'bg-red-100' : ''}`}
                                                />
                                                <div className="text-sm text-muted-foreground">
                                                    Remaining: ${Math.max(0, category.remaining).toLocaleString()}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="transactions" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Transactions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {transactions
                                            .filter(t => t.budget_id === activeBudget?.id)
                                            .slice(0, 10)
                                            .map(transaction => {
                                                const category = categories.find(c => c.id === transaction.category_id);
                                                return (
                                                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                                        <div className="flex items-center gap-3">
                                                            <div 
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: category?.color || '#6B7280' }}
                                                            />
                                                            <div>
                                                                <p className="font-medium">{transaction.description}</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {category?.name} • {new Date(transaction.transaction_date).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`font-medium ${
                                                                transaction.transaction_type === 'income' 
                                                                    ? 'text-green-600' 
                                                                    : 'text-red-600'
                                                            }`}>
                                                                {transaction.transaction_type === 'income' ? '+' : '-'}
                                                                ${Math.abs(transaction.amount).toLocaleString()}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground capitalize">
                                                                {transaction.payment_method.replace('_', ' ')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="goals" className="space-y-6">
                            <div className="grid gap-4">
                                {goals
                                    .filter(g => g.budget_id === activeBudget?.id)
                                    .map(goal => {
                                        const progress = (goal.current_amount / goal.target_amount) * 100;
                                        return (
                                            <Card key={goal.id}>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Target className="w-5 h-5 text-blue-500" />
                                                            {goal.name}
                                                        </CardTitle>
                                                        <Badge variant="outline" className="capitalize">
                                                            {goal.priority} priority
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-3">
                                                        <p className="text-sm text-muted-foreground">
                                                            {goal.description}
                                                        </p>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-muted-foreground">
                                                                ${goal.current_amount.toLocaleString()} of ${goal.target_amount.toLocaleString()}
                                                            </span>
                                                            <span className="text-muted-foreground">
                                                                {progress.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                        <Progress value={Math.min(progress, 100)} className="h-2" />
                                                        <div className="flex justify-between text-sm text-muted-foreground">
                                                            <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                                                            <span>
                                                                ${(goal.target_amount - goal.current_amount).toLocaleString()} remaining
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })
                                }
                            </div>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
}