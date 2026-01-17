import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, Calendar as CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function AddTransactionModal({ open, onClose, onSave, editingTransaction }) {
  const [formData, setFormData] = useState({
    type: "revenue",
    amount: "",
    category: "",
    description: "",
    date: new Date(),
    customer_name: ""
  });

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        ...editingTransaction,
        date: new Date(editingTransaction.date)
      });
    } else {
      setFormData({
        type: "revenue",
        amount: "",
        category: "",
        description: "",
        date: new Date(),
        customer_name: ""
      });
    }
  }, [editingTransaction, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      amount: parseFloat(formData.amount),
      date: format(formData.date, "yyyy-MM-dd")
    });
  };

  const revenueCategories = ["sales", "services", "subscriptions", "other"];
  const expenseCategories = ["rent", "utilities", "payroll", "marketing", "supplies", "other"];
  const categories = formData.type === "revenue" ? revenueCategories : expenseCategories;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-semibold text-slate-800">
              {editingTransaction ? "Edit Transaction" : "Add Transaction"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "revenue", category: "" })}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all",
                  formData.type === "revenue"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <p className={cn(
                  "font-semibold",
                  formData.type === "revenue" ? "text-emerald-700" : "text-slate-600"
                )}>
                  Revenue
                </p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "expense", category: "" })}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all",
                  formData.type === "expense"
                    ? "border-rose-500 bg-rose-50"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <p className={cn(
                  "font-semibold",
                  formData.type === "expense" ? "text-rose-700" : "text-slate-600"
                )}>
                  Expense
                </p>
              </button>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="pl-9 h-11"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full h-11 justify-start font-normal"
                    >
                      <CalendarIcon className="w-4 h-4 mr-2 text-slate-400" />
                      {format(formData.date, "MMM d, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => date && setFormData({ ...formData, date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Description</Label>
              <Textarea
                placeholder="Add a description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="resize-none h-20"
              />
            </div>

            {formData.type === "revenue" && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Customer Name (optional)</Label>
                <Input
                  placeholder="Enter customer name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="h-11"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1 h-11"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className={cn(
                  "flex-1 h-11",
                  formData.type === "revenue" 
                    ? "bg-emerald-600 hover:bg-emerald-700" 
                    : "bg-rose-600 hover:bg-rose-700"
                )}
              >
                {editingTransaction ? "Update" : "Add"} Transaction
              </Button>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}