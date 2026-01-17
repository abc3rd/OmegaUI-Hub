import React from 'react';
import { cn } from '@/lib/utils';
import { 
  BookOpen, 
  Settings, 
  Trash2, 
  History,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CATEGORY_COLORS = {
  intent: 'bg-blue-100 text-blue-700',
  constraint: 'bg-purple-100 text-purple-700',
  safety: 'bg-red-100 text-red-700',
  tool: 'bg-amber-100 text-amber-700',
  execution: 'bg-emerald-100 text-emerald-700',
  fallback: 'bg-slate-100 text-slate-700'
};

export default function DictionaryEntryCard({
  entry,
  onEdit,
  onDelete,
  onViewHistory,
  className
}) {
  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      !entry.is_active && "opacity-60",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-base font-mono">{entry.command_name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={cn("text-xs", CATEGORY_COLORS[entry.category])}>
                  {entry.category}
                </Badge>
                <span className="text-xs text-slate-400">v{entry.version || 1}</span>
                {entry.is_active ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {entry.description && (
          <p className="text-sm text-slate-600 line-clamp-2">{entry.description}</p>
        )}

        {entry.examples && entry.examples.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-1">Examples:</p>
            <div className="flex flex-wrap gap-1">
              {entry.examples.slice(0, 3).map((ex, i) => (
                <Badge key={i} variant="outline" className="text-xs font-normal">
                  {ex.length > 30 ? ex.substring(0, 30) + '...' : ex}
                </Badge>
              ))}
              {entry.examples.length > 3 && (
                <Badge variant="outline" className="text-xs font-normal">
                  +{entry.examples.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewHistory(entry)}
            className="flex-1"
          >
            <History className="w-3.5 h-3.5 mr-1.5" />
            History
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(entry)}
            className="flex-1"
          >
            <Settings className="w-3.5 h-3.5 mr-1.5" />
            Edit
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Dictionary Entry</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{entry.command_name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(entry)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}