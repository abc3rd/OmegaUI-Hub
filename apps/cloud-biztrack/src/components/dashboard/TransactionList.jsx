import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const categoryColors = {
  sales: "bg-emerald-50 text-emerald-700 border-emerald-200",
  services: "bg-blue-50 text-blue-700 border-blue-200",
  subscriptions: "bg-purple-50 text-purple-700 border-purple-200",
  rent: "bg-amber-50 text-amber-700 border-amber-200",
  utilities: "bg-cyan-50 text-cyan-700 border-cyan-200",
  payroll: "bg-pink-50 text-pink-700 border-pink-200",
  marketing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  supplies: "bg-orange-50 text-orange-700 border-orange-200",
  other: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function TransactionList({ transactions, onEdit, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="border-slate-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-slate-800">
            Recent Transactions
          </CardTitle>
          <p className="text-sm text-slate-500">Your latest activity</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <AnimatePresence>
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No transactions found
                </div>
              ) : (
                transactions.slice(0, 10).map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl",
                      "bg-slate-50/50 hover:bg-slate-100/80 transition-colors",
                      "group cursor-pointer"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        transaction.type === "revenue" 
                          ? "bg-emerald-100" 
                          : "bg-rose-100"
                      )}>
                        {transaction.type === "revenue" ? (
                          <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-rose-500" />
                        )}
                      </div>
                      
                      <div>
                        <p className="font-medium text-slate-800">
                          {transaction.description || "Transaction"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs font-medium",
                              categoryColors[transaction.category]
                            )}
                          >
                            {transaction.category}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {format(new Date(transaction.date), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <p className={cn(
                        "text-lg font-semibold tabular-nums",
                        transaction.type === "revenue" 
                          ? "text-emerald-600" 
                          : "text-rose-500"
                      )}>
                        {transaction.type === "revenue" ? "+" : "-"}
                        ${transaction.amount?.toLocaleString()}
                      </p>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                          >
                            <MoreHorizontal className="w-4 h-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(transaction)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete(transaction.id)}
                            className="text-rose-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}