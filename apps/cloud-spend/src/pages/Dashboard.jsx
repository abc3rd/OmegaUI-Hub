import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, Wallet, TrendingUp, Calendar, ArrowRight,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths, parseISO, isWithinInterval } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

import StatCard from '@/components/expenses/StatCard';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import ExpenseCard from '@/components/expenses/ExpenseCard';
import SpendingChart from '@/components/expenses/SpendingChart';
import CategoryChart from '@/components/expenses/CategoryChart';
import { categoryConfig } from '@/components/expenses/CategoryBadge';

export default function Dashboard() {
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list('-date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Expense.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] })
  });

  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  
  const monthExpenses = expenses.filter(e => {
    const expenseDate = parseISO(e.date);
    return isWithinInterval(expenseDate, { start: monthStart, end: monthEnd });
  });

  const prevMonthExpenses = expenses.filter(e => {
    const prevStart = startOfMonth(subMonths(selectedMonth, 1));
    const prevEnd = endOfMonth(subMonths(selectedMonth, 1));
    const expenseDate = parseISO(e.date);
    return isWithinInterval(expenseDate, { start: prevStart, end: prevEnd });
  });

  const totalThisMonth = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalLastMonth = prevMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const percentChange = totalLastMonth > 0 
    ? ((totalThisMonth - totalLastMonth) / totalLastMonth * 100).toFixed(1)
    : 0;

  const transactionCount = monthExpenses.length;
  const avgTransaction = transactionCount > 0 ? totalThisMonth / transactionCount : 0;

  const topCategory = Object.entries(
    monthExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1])[0];

  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Track your spending habits</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Expense
          </Button>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold text-slate-900 min-w-[160px] text-center">
            {format(selectedMonth, 'MMMM yyyy')}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Spending"
            value={`$${totalThisMonth.toFixed(2)}`}
            icon={Wallet}
            trend={parseFloat(percentChange)}
            trendLabel="vs last month"
          />
          <StatCard
            title="Transactions"
            value={transactionCount}
            subtitle="this month"
            icon={Calendar}
          />
          <StatCard
            title="Average"
            value={`$${avgTransaction.toFixed(2)}`}
            subtitle="per transaction"
            icon={TrendingUp}
          />
          <StatCard
            title="Top Category"
            value={topCategory ? categoryConfig[topCategory[0]]?.label || topCategory[0] : 'N/A'}
            subtitle={topCategory ? `$${topCategory[1].toFixed(2)}` : ''}
            icon={categoryConfig[topCategory?.[0]]?.icon}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-sm border-slate-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Daily Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <SpendingChart expenses={monthExpenses} selectedMonth={selectedMonth} />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">By Category</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryChart expenses={monthExpenses} />
            </CardContent>
          </Card>
        </div>

        {/* Recent Expenses */}
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Recent Expenses</CardTitle>
            <Link to={createPageUrl('Expenses')}>
              <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence>
                {recentExpenses.length > 0 ? (
                  recentExpenses.map((expense, index) => (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      index={index}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 text-slate-400"
                  >
                    <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No expenses yet. Add your first expense!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>

      <ExpenseForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={(data) => createMutation.mutateAsync(data)}
      />
    </div>
  );
}