import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, TrendingDown, Users, Plus, Download } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import ExpenseBreakdown from "@/components/dashboard/ExpenseBreakdown";
import CustomerGrowth from "@/components/dashboard/CustomerGrowth";
import FilterBar from "@/components/dashboard/FilterBar";
import TransactionList from "@/components/dashboard/TransactionList";
import AddTransactionModal from "@/components/dashboard/AddTransactionModal";
import AddCustomerModal from "@/components/dashboard/AddCustomerModal";

export default function Dashboard() {
  const queryClient = useQueryClient();
  
  // State
  const [dateRange, setDateRange] = useState({
    from: subMonths(new Date(), 6),
    to: new Date()
  });
  const [category, setCategory] = useState("all");
  const [transactionType, setTransactionType] = useState("all");
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Queries
  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-date')
  });

  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list('-created_date')
  });

  // Mutations
  const createTransaction = useMutation({
    mutationFn: (data) => base44.entities.Transaction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowTransactionModal(false);
      setEditingTransaction(null);
    }
  });

  const updateTransaction = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Transaction.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowTransactionModal(false);
      setEditingTransaction(null);
    }
  });

  const deleteTransaction = useMutation({
    mutationFn: (id) => base44.entities.Transaction.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] })
  });

  const createCustomer = useMutation({
    mutationFn: (data) => base44.entities.Customer.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setShowCustomerModal(false);
      setEditingCustomer(null);
    }
  });

  const updateCustomer = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Customer.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setShowCustomerModal(false);
      setEditingCustomer(null);
    }
  });

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const transactionDate = parseISO(t.date);
      const inDateRange = dateRange?.from && dateRange?.to 
        ? isWithinInterval(transactionDate, { start: dateRange.from, end: dateRange.to })
        : true;
      const matchesCategory = category === "all" || t.category === category;
      const matchesType = transactionType === "all" || t.type === transactionType;
      return inDateRange && matchesCategory && matchesType;
    });
  }, [transactions, dateRange, category, transactionType]);

  // Calculations
  const stats = useMemo(() => {
    const revenue = filteredTransactions
      .filter(t => t.type === "revenue")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const profit = revenue - expenses;
    const activeCustomers = customers.filter(c => c.status === "active").length;

    return { revenue, expenses, profit, activeCustomers };
  }, [filteredTransactions, customers]);

  // Chart data
  const chartData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthTransactions = transactions.filter(t => {
        const tDate = parseISO(t.date);
        return isWithinInterval(tDate, { start: monthStart, end: monthEnd });
      });

      months.push({
        month: format(date, "MMM"),
        revenue: monthTransactions
          .filter(t => t.type === "revenue")
          .reduce((sum, t) => sum + (t.amount || 0), 0),
        expenses: monthTransactions
          .filter(t => t.type === "expense")
          .reduce((sum, t) => sum + (t.amount || 0), 0)
      });
    }
    return months;
  }, [transactions]);

  const expenseData = useMemo(() => {
    const categoryTotals = {};
    filteredTransactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + (t.amount || 0);
      });
    
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  const customerGrowthData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const newCustomers = customers.filter(c => {
        const cDate = parseISO(c.created_date);
        return isWithinInterval(cDate, { start: monthStart, end: monthEnd });
      }).length;

      months.push({
        month: format(date, "MMM"),
        customers: newCustomers
      });
    }
    return months;
  }, [customers]);

  // Handlers
  const handleSaveTransaction = (data) => {
    if (editingTransaction) {
      updateTransaction.mutate({ id: editingTransaction.id, data });
    } else {
      createTransaction.mutate(data);
    }
  };

  const handleSaveCustomer = (data) => {
    if (editingCustomer) {
      updateCustomer.mutate({ id: editingCustomer.id, data });
    } else {
      createCustomer.mutate(data);
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleExport = () => {
    const csvContent = [
      ["Date", "Type", "Category", "Amount", "Description", "Customer"].join(","),
      ...filteredTransactions.map(t => [
        t.date,
        t.type,
        t.category,
        t.amount,
        `"${t.description || ""}"`,
        `"${t.customer_name || ""}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Business Dashboard
            </h1>
            <p className="text-slate-500 mt-1">
              Track your business performance at a glance
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => { setEditingCustomer(null); setShowCustomerModal(true); }}
              variant="outline"
              className="h-10 px-4"
            >
              <Users className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
            <Button
              onClick={() => { setEditingTransaction(null); setShowTransactionModal(true); }}
              className="h-10 px-4 bg-slate-900 hover:bg-slate-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg px-6">Overview</TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-lg px-6">Transactions</TabsTrigger>
            <TabsTrigger value="customers" className="rounded-lg px-6">Customers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Revenue"
                value={`$${stats.revenue.toLocaleString()}`}
                change="12.5"
                changeType="positive"
                icon={DollarSign}
                gradient="bg-emerald-500"
              />
              <StatCard
                title="Total Expenses"
                value={`$${stats.expenses.toLocaleString()}`}
                change="3.2"
                changeType="negative"
                icon={TrendingDown}
                gradient="bg-rose-500"
              />
              <StatCard
                title="Net Profit"
                value={`$${stats.profit.toLocaleString()}`}
                change="8.1"
                changeType={stats.profit >= 0 ? "positive" : "negative"}
                icon={TrendingUp}
                gradient="bg-blue-500"
              />
              <StatCard
                title="Active Customers"
                value={stats.activeCustomers.toString()}
                change="15"
                changeType="positive"
                icon={Users}
                gradient="bg-amber-500"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RevenueChart data={chartData} />
              </div>
              <ExpenseBreakdown data={expenseData} />
            </div>

            <CustomerGrowth data={customerGrowthData} />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <FilterBar
              dateRange={dateRange}
              setDateRange={setDateRange}
              category={category}
              setCategory={setCategory}
              transactionType={transactionType}
              setTransactionType={setTransactionType}
              onExport={handleExport}
            />
            <TransactionList
              transactions={filteredTransactions}
              onEdit={handleEditTransaction}
              onDelete={(id) => deleteTransaction.mutate(id)}
            />
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">All Customers</h2>
                <p className="text-sm text-slate-500">Manage your customer relationships</p>
              </div>
              <div className="divide-y divide-slate-100">
                {customers.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    No customers yet. Add your first customer!
                  </div>
                ) : (
                  customers.map((customer) => (
                    <div 
                      key={customer.id} 
                      className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {customer.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{customer.name}</p>
                          <p className="text-sm text-slate-500">{customer.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {customer.company && (
                          <span className="text-sm text-slate-500">{customer.company}</span>
                        )}
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          customer.status === "active" 
                            ? "bg-emerald-50 text-emerald-700" 
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {customer.status}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditingCustomer(customer); setShowCustomerModal(true); }}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <AddTransactionModal
        open={showTransactionModal}
        onClose={() => { setShowTransactionModal(false); setEditingTransaction(null); }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
      />

      <AddCustomerModal
        open={showCustomerModal}
        onClose={() => { setShowCustomerModal(false); setEditingCustomer(null); }}
        onSave={handleSaveCustomer}
        editingCustomer={editingCustomer}
      />
    </div>
  );
}