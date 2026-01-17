import { motion } from "framer-motion";
import { Calendar, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function FilterBar({ 
  dateRange, 
  setDateRange, 
  category, 
  setCategory, 
  transactionType, 
  setTransactionType,
  onExport 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <Filter className="w-4 h-4" />
        Filters
      </div>
      
      <div className="h-6 w-px bg-slate-200" />
      
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className={cn(
              "h-9 px-3 text-sm font-medium border-slate-200",
              "hover:bg-slate-50 hover:border-slate-300 transition-all"
            )}
          >
            <Calendar className="w-4 h-4 mr-2 text-slate-500" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                </>
              ) : (
                format(dateRange.from, "MMM d, yyyy")
              )
            ) : (
              "Select dates"
            )}
            <ChevronDown className="w-4 h-4 ml-2 text-slate-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-[140px] h-9 text-sm border-slate-200">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="sales">Sales</SelectItem>
          <SelectItem value="services">Services</SelectItem>
          <SelectItem value="subscriptions">Subscriptions</SelectItem>
          <SelectItem value="rent">Rent</SelectItem>
          <SelectItem value="utilities">Utilities</SelectItem>
          <SelectItem value="payroll">Payroll</SelectItem>
          <SelectItem value="marketing">Marketing</SelectItem>
          <SelectItem value="supplies">Supplies</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={transactionType} onValueChange={setTransactionType}>
        <SelectTrigger className="w-[130px] h-9 text-sm border-slate-200">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="revenue">Revenue</SelectItem>
          <SelectItem value="expense">Expense</SelectItem>
        </SelectContent>
      </Select>
      
      <div className="flex-1" />
      
      <Button 
        onClick={onExport}
        variant="outline"
        className="h-9 px-4 text-sm font-medium border-slate-200 hover:bg-slate-50"
      >
        Export Report
      </Button>
    </motion.div>
  );
}