import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';

export default function TodoForm({ task, onSubmit, onCancel }) {
  const [currentTask, setCurrentTask] = useState(task || {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    assigned_to: [],
  });

  useEffect(() => {
    if (task) {
      setCurrentTask({
        ...task,
        assigned_to: task.assigned_to || [],
      });
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(currentTask);
  };

  const handleDateSelect = (date) => {
    setCurrentTask({ ...currentTask, due_date: date ? date.toISOString() : null });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-4">
      <Input
        placeholder="Task title"
        value={currentTask.title}
        onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
        required
      />
      <Textarea
        placeholder="Add a description..."
        value={currentTask.description}
        onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
        rows={3}
      />
      <div className="grid grid-cols-2 gap-4">
        <Select value={currentTask.priority} onValueChange={(v) => setCurrentTask({ ...currentTask, priority: v })}>
          <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {currentTask.due_date ? format(new Date(currentTask.due_date), 'PPP') : 'Set due date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={currentTask.due_date ? new Date(currentTask.due_date) : null} onSelect={handleDateSelect} /></PopoverContent>
        </Popover>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit"><Save className="w-4 h-4 mr-2" /> {task ? 'Save Changes' : 'Add Task'}</Button>
      </div>
    </form>
  );
}