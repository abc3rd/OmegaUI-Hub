import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  PieChart, 
  TrendingUp, 
  AlertTriangle,
  Target
} from 'lucide-react';

export default function BudgetAnalytics({ budgetSummary, activeBudget }) {
    if (!budgetSummary) return null;

    const spendingByCategory = budgetSummary.categoryBreakdown
        .filter(c => c.category_type === 'expense' && c.spent > 0)
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 5);

    const budgetHealth = () => {
        const { utilizationRate, netIncome } = budgetSummary;
        
        if (utilizationRate > 100) return { status: 'critical', message: 'Over budget', color: 'text-red-600' };
        if (utilizationRate > 90) return { status: 'warning', message: 'Near budget limit', color: 'text-yellow-600' };
        if (utilizationRate > 70) return { status: 'good', message: 'On track', color: 'text-blue-600' };
        return { status: 'excellent', message: 'Well managed', color: 'text-green-600' };
    };

    const health = budgetHealth();

    const daysInPeriod = Math.ceil((new Date(activeBudget.end_date) - new Date(activeBudget.start_date)) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((new Date() - new Date(activeBudget.start_date)) / (1000 * 60 * 60 * 24));
    const periodProgress = Math.min((daysElapsed / daysInPeriod) * 100, 100);

    const averageDailySpending = budgetSummary.totalExpenses / Math.max(daysElapsed, 1);
    const projectedMonthlySpending = averageDailySpending * daysInPeriod;

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            {/* Budget Health */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Budget Health
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        <div className={`text-2xl font-bold ${health.color}`}>
                            {budgetSummary.utilizationRate.toFixed(1)}%
                        </div>
                        <p className="text-sm text-muted-foreground">Budget Utilized</p>
                        <Badge 
                            variant={health.status === 'critical' ? 'destructive' : 'secondary'}
                            className="mt-2"
                        >
                            {health.message}
                        </Badge>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Period Progress</span>
                            <span>{periodProgress.toFixed(1)}%</span>
                        </div>
                        <Progress value={periodProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                            Day {daysElapsed} of {daysInPeriod}
                        </p>
                    </div>

                    <div className="pt-4 border-t">
                        <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Daily Average:</span>
                                <span className="font-medium">${averageDailySpending.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Projected Total:</span>
                                <span className={`font-medium ${
                                    projectedMonthlySpending > budgetSummary.totalBudgeted 
                                        ? 'text-red-600' 
                                        : 'text-green-600'
                                }`}>
                                    ${projectedMonthlySpending.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Top Spending Categories */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PieChart className="w-5 h-5" />
                        Top Spending
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {spendingByCategory.map((category, index) => (
                            <div key={category.id}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: category.color }}
                                        />
                                        <span className="text-sm font-medium">{category.name}</span>
                                    </div>
                                    <span className="text-sm font-bold">
                                        ${category.spent.toLocaleString()}
                                    </span>
                                </div>
                                <Progress 
                                    value={category.percentage} 
                                    className="h-2"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>{category.percentage.toFixed(1)}% of budget</span>
                                    <span>
                                        {category.isOverBudget ? 'Over budget' : `$${category.remaining.toLocaleString()} left`}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Budget Alerts */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Alerts & Recommendations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Over Budget Categories */}
                        {budgetSummary.categoryBreakdown
                            .filter(c => c.isOverBudget)
                            .map(category => (
                                <div key={category.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-red-700">
                                            {category.name} is over budget
                                        </p>
                                        <p className="text-xs text-red-600">
                                            ${Math.abs(category.remaining).toLocaleString()} over limit
                                        </p>
                                    </div>
                                </div>
                            ))
                        }

                        {/* Near Limit Categories */}
                        {budgetSummary.categoryBreakdown
                            .filter(c => c.isNearLimit && !c.isOverBudget)
                            .slice(0, 2)
                            .map(category => (
                                <div key={category.id} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-yellow-700">
                                            {category.name} is near budget limit
                                        </p>
                                        <p className="text-xs text-yellow-600">
                                            {category.percentage.toFixed(1)}% used
                                        </p>
                                    </div>
                                </div>
                            ))
                        }

                        {/* Positive Net Income */}
                        {budgetSummary.netIncome > 0 && (
                            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-green-700">
                                        Positive cash flow
                                    </p>
                                    <p className="text-xs text-green-600">
                                        Consider increasing savings goals
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Spending Projection Warning */}
                        {projectedMonthlySpending > budgetSummary.totalBudgeted && (
                            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                                <TrendingUp className="w-4 h-4 text-orange-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-orange-700">
                                        Projected overspending
                                    </p>
                                    <p className="text-xs text-orange-600">
                                        On track to exceed budget by ${(projectedMonthlySpending - budgetSummary.totalBudgeted).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* No alerts */}
                        {budgetSummary.categoryBreakdown.filter(c => c.isOverBudget || c.isNearLimit).length === 0 &&
                         budgetSummary.netIncome <= 0 && 
                         projectedMonthlySpending <= budgetSummary.totalBudgeted && (
                            <div className="text-center py-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Target className="w-6 h-6 text-green-600" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    No alerts - your budget is on track!
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}