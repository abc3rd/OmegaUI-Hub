import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Play, CheckCircle } from 'lucide-react';
import { formatDistanceToNow, format, isToday, isPast, isTomorrow } from 'date-fns';

export default function TodoItem({ task, onEdit, onDelete, onStatusChange }) {
  const getStatusIndicator = () => {
    const isCompleted = task.status === 'done';
    if (isCompleted) return 'border-l-4 border-success bg-success/10';

    const isInProgress = task.status === 'in_progress';
    if (isInProgress) return 'border-l-4 border-secondary bg-secondary/10 ring-2 ring-ring ring-offset-2 dark:ring-offset-card';
    
    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      if (isPast(dueDate) && !isToday(dueDate)) return 'border-l-4 border-danger bg-danger/10';
      if (isToday(dueDate)) return 'border-l-4 border-secondary bg-secondary/10';
      if (isTomorrow(dueDate)) return 'border-l-4 border-primary bg-primary/10';
    }
    return 'border-l-4 border-border';
  };

  const priorityBadge = {
    low: 'bg-primary/20 text-primary',
    medium: 'bg-secondary/20 text-secondary-foreground',
    high: 'bg-danger/20 text-danger',
  };

  const formattedDueDate = task.due_date ? format(new Date(task.due_date), 'MMM d') : 'No due date';
  const relativeDueDate = task.due_date ? formatDistanceToNow(new Date(task.due_date), { addSuffix: true }) : '';

  return (
    <Card className={`transition-all hover:shadow-md bg-card ${getStatusIndicator()}`}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={`font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={`border-0 ${priorityBadge[task.priority]}`}>{task.priority}</Badge>
              <Badge variant="outline" className="text-xs">{formattedDueDate}</Badge>
            </div>
            {relativeDueDate && (
              <p className="text-xs text-muted-foreground mt-1">{relativeDueDate}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => onStatusChange(task, 'in_progress')}>
                <Play className="mr-2 h-4 w-4" /> Start
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onStatusChange(task, 'done')}>
                <CheckCircle className="mr-2 h-4 w-4" /> Complete
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onEdit(task)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onDelete(task.id)} className="text-danger">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}