import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CategoryBadge from './CategoryBadge';

export default function ExpenseCard({ expense, onEdit, onDelete, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-200"
    >
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-1">
          <h4 className="font-medium text-slate-900">{expense.title}</h4>
          <div className="flex items-center gap-3">
            <CategoryBadge category={expense.category} size="sm" showLabel={false} />
            <span className="text-sm text-slate-400">
              {format(new Date(expense.date), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold text-slate-900">
          ${expense.amount.toFixed(2)}
        </span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(expense)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(expense)}
              className="text-rose-600 focus:text-rose-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}