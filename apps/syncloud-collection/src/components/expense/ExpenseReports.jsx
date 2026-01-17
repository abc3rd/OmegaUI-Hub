import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import {
  FileText,
  Download,
  Calendar as CalendarIcon,
  TrendingUp,
  PieChart,
  BarChart3,
  Plus
} from 'lucide-react';
import { ExpenseReport } from '@/entities/ExpenseReport';
import { toast } from 'sonner';

export default function ExpenseReports({ expenses, categories, reports, onReportGenerated }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState('monthly');
  const [customStartDate, setCustomStartDate] = useState(new Date());
  const [customEndDate, setCustomEndDate] = useState(new Date());

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      let startDate, endDate, reportName;
      const now = new Date();

      switch (reportType) {
        case 'weekly':
          startDate = startOfWeek(now);
          endDate = endOfWeek(now);
          reportName = `Weekly Expenses - Week of ${format(startDate, 'MMM d, yyyy')}`;
          break;
        case 'monthly':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          reportName = `Monthly Expenses - ${format(now, 'MMMM yyyy')}`;
          break;
        case 'quarterly':
          const quarter = Math.floor(now.getMonth() / 3) + 1;
          startDate = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
          endDate = new Date(now.getFullYear(), quarter * 3, 0);
          reportName = `Quarterly Expenses - Q${quarter} ${now.getFullYear()}`;
          break;
        case 'yearly':
          startDate = startOfYear(now);
          endDate = endOfYear(now);
          reportName = `Annual Expenses - ${now.getFullYear()}`;
          break;
        case 'custom':
          startDate = customStartDate;
          endDate = customEndDate;
          reportName = `Custom Report - ${format(startDate, 'MMM d')} to ${format(endDate, 'MMM d, yyyy')}`;
          break;
        default:
          throw new Error('Invalid report type');
      }

      // Filter expenses for the period
      const periodExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.expense_date);
        return expenseDate >= startDate && expenseDate <= endDate;
      });

      // Calculate totals and breakdown
      const totalAmount = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      const categoryBreakdown = categories.map(category => {
        const categoryExpenses = periodExpenses.filter(e => e.category_id === category.id);
        const amount = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
        const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
        
        return {
          category_id: category.id,
          category_name: category.name,
          amount,
          percentage,
          expense_count: categoryExpenses.length
        };
      }).filter(cat => cat.amount > 0).sort((a, b) => b.amount - a.amount);

      // Generate insights
      const insights = [];
      
      // Top spending category
      if (categoryBreakdown.length > 0) {
        const topCategory = categoryBreakdown[0];
        insights.push({
          type: 'trend',
          title: 'Top Spending Category',
          description: `${topCategory.category_name} accounts for ${topCategory.percentage.toFixed(1)}% of expenses`,
          impact: 'neutral',
          amount: topCategory.amount
        });
      }

      // Compare with previous period
      const previousStartDate = new Date(startDate);
      const previousEndDate = new Date(endDate);
      const periodDiff = endDate.getTime() - startDate.getTime();
      previousStartDate.setTime(startDate.getTime() - periodDiff);
      previousEndDate.setTime(endDate.getTime() - periodDiff);

      const previousPeriodExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.expense_date);
        return expenseDate >= previousStartDate && expenseDate < previousEndDate;
      });

      const previousPeriodAmount = previousPeriodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const changeAmount = totalAmount - previousPeriodAmount;
      const changePercentage = previousPeriodAmount > 0 ? (changeAmount / previousPeriodAmount) * 100 : 0;

      if (previousPeriodAmount > 0) {
        insights.push({
          type: 'trend',
          title: 'Period Comparison',
          description: `${changePercentage >= 0 ? 'Increased' : 'Decreased'} by ${Math.abs(changePercentage).toFixed(1)}% from previous period`,
          impact: changePercentage > 0 ? 'negative' : 'positive',
          amount: Math.abs(changeAmount)
        });
      }

      // Average transaction size
      const avgTransaction = periodExpenses.length > 0 ? totalAmount / periodExpenses.length : 0;
      insights.push({
        type: 'recommendation',
        title: 'Average Transaction',
        description: `Your average expense is $${avgTransaction.toFixed(2)} per transaction`,
        impact: 'neutral',
        amount: avgTransaction
      });

      // Create report
      const reportData = {
        name: reportName,
        report_type: reportType,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        total_amount: totalAmount,
        category_breakdown: categoryBreakdown,
        insights,
        comparison_data: {
          previous_period_amount: previousPeriodAmount,
          change_percentage: changePercentage,
          change_amount: changeAmount
        }
      };

      await ExpenseReport.create(reportData);
      toast.success('Report generated successfully!');
      
      if (onReportGenerated) {
        onReportGenerated();
      }

    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (report) => {
    // Create a simple CSV export
    const csvData = [
      ['Expense Report:', report.name],
      ['Period:', `${report.start_date} to ${report.end_date}`],
      ['Total Amount:', `$${report.total_amount.toLocaleString()}`],
      [],
      ['Category', 'Amount', 'Percentage', 'Transactions'],
      ...report.category_breakdown.map(cat => [
        cat.category_name,
        `$${cat.amount.toLocaleString()}`,
        `${cat.percentage.toFixed(1)}%`,
        cat.expense_count
      ]),
      [],
      ['Insights:'],
      ...report.insights.map(insight => [insight.title, insight.description])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'trend': return TrendingUp;
      case 'anomaly': return PieChart;
      case 'recommendation': return BarChart3;
      default: return FileText;
    }
  };

  const getInsightColor = (impact) => {
    switch (impact) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Generate New Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="custom">Custom Period</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === 'custom' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(customStartDate, 'MMM d, yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={customStartDate}
                        onSelect={setCustomStartDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(customEndDate, 'MMM d, yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={customEndDate}
                        onSelect={setCustomEndDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>

          <Button onClick={generateReport} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700">
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generated Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map(report => (
              <div key={report.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{report.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{format(new Date(report.start_date), 'MMM d')} - {format(new Date(report.end_date), 'MMM d, yyyy')}</span>
                      <Badge variant="outline" className="capitalize">
                        {report.report_type}
                      </Badge>
                      <span className="font-medium text-foreground">
                        ${report.total_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => downloadReport(report)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>

                {/* Category Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium mb-2">Top Categories</h4>
                    <div className="space-y-2">
                      {report.category_breakdown.slice(0, 3).map(cat => (
                        <div key={cat.category_id} className="flex justify-between text-sm">
                          <span>{cat.category_name}</span>
                          <span className="font-medium">${cat.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Key Metrics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Categories</span>
                        <span>{report.category_breakdown.length}</span>
                      </div>
                      {report.comparison_data && (
                        <div className="flex justify-between">
                          <span>vs Previous Period</span>
                          <span className={report.comparison_data.change_percentage >= 0 ? 'text-red-600' : 'text-green-600'}>
                            {report.comparison_data.change_percentage >= 0 ? '+' : ''}
                            {report.comparison_data.change_percentage.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Insights */}
                {report.insights && report.insights.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Insights</h4>
                    <div className="space-y-2">
                      {report.insights.slice(0, 2).map((insight, index) => {
                        const IconComponent = getInsightIcon(insight.type);
                        return (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <IconComponent className={`w-4 h-4 ${getInsightColor(insight.impact)} mt-0.5`} />
                            <div>
                              <span className="font-medium">{insight.title}:</span>
                              <span className="text-muted-foreground ml-1">{insight.description}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {reports.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No reports generated yet</p>
                <p className="text-sm">Generate your first report to see spending insights</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}