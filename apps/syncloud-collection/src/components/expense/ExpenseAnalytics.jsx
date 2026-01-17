import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  AlertTriangle,
  Calendar,
  CreditCard
} from 'lucide-react';

export default function ExpenseAnalytics({ expenses, categories, summary }) {
  // Prepare chart data
  const categoryChartData = summary.categoryBreakdown.map(cat => ({
    name: cat.name,
    amount: cat.amount,
    percentage: cat.percentage,
    color: cat.color
  }));

  // Monthly spending trend
  const monthlyTrend = expenses.reduce((acc, expense) => {
    const monthKey = new Date(expense.expense_date).toISOString().slice(0, 7);
    acc[monthKey] = (acc[monthKey] || 0) + expense.amount;
    return acc;
  }, {});

  const trendData = Object.entries(monthlyTrend)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, amount]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      amount: parseFloat(amount.toFixed(2))
    }));

  // Payment method breakdown
  const paymentMethodData = Object.entries(summary.paymentMethodBreakdown).map(([method, amount]) => ({
    method: method.replace('_', ' ').toUpperCase(),
    amount: parseFloat(amount.toFixed(2))
  }));

  // Weekly spending pattern
  const weeklyPattern = expenses.reduce((acc, expense) => {
    const dayOfWeek = new Date(expense.expense_date).getDay();
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    acc[dayName] = (acc[dayName] || 0) + expense.amount;
    return acc;
  }, {});

  const weeklyData = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => ({
    day,
    amount: parseFloat((weeklyPattern[day] || 0).toFixed(2))
  }));

  // Spending insights
  const insights = [];

  // Check for budget overruns
  const overBudgetCategories = summary.categoryBreakdown.filter(cat => cat.isOverBudget);
  if (overBudgetCategories.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Budget Alert',
      description: `${overBudgetCategories.length} categories are over budget`,
      icon: AlertTriangle,
      color: 'text-red-600'
    });
  }

  // Identify highest spending day
  const highestSpendingDay = weeklyData.reduce((max, day) => 
    day.amount > max.amount ? day : max, weeklyData[0]
  );
  
  if (highestSpendingDay.amount > 0) {
    insights.push({
      type: 'info',
      title: 'Spending Pattern',
      description: `You spend most on ${highestSpendingDay.day}s ($${highestSpendingDay.amount.toLocaleString()})`,
      icon: Calendar,
      color: 'text-blue-600'
    });
  }

  // Payment method preference
  const preferredPaymentMethod = paymentMethodData.reduce((max, method) => 
    method.amount > max.amount ? method : max, paymentMethodData[0] || { method: 'N/A', amount: 0 }
  );

  if (preferredPaymentMethod.amount > 0) {
    insights.push({
      type: 'info',
      title: 'Payment Preference',
      description: `Your preferred payment method is ${preferredPaymentMethod.method}`,
      icon: CreditCard,
      color: 'text-green-600'
    });
  }

  return (
    <div className="space-y-6">
      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <insight.icon className={`w-5 h-5 ${insight.color} mt-0.5`} />
                <div>
                  <h3 className="font-semibold text-sm">{insight.title}</h3>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Spending Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Pattern */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Spending Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentMethodData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="method" type="category" width={100} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                <Bar dataKey="amount" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Details */}
      <Card>
        <CardHeader>
          <CardTitle>Category Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.categoryBreakdown.map(category => (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.name}</span>
                    {category.isOverBudget && (
                      <Badge variant="destructive" className="text-xs">
                        Over Budget
                      </Badge>
                    )}
                    {category.is_essential && (
                      <Badge variant="secondary" className="text-xs">
                        Essential
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      ${category.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {category.count} transactions
                    </div>
                  </div>
                </div>
                <Progress value={category.percentage} className="h-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{category.percentage.toFixed(1)}% of total spending</span>
                  {category.monthly_budget > 0 && (
                    <span>
                      Budget: ${category.monthly_budget.toLocaleString()} 
                      ({((category.amount / category.monthly_budget) * 100).toFixed(1)}% used)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}