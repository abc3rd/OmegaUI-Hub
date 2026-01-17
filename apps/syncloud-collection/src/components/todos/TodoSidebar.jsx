
import React, { useState, useEffect, useMemo } from 'react';
import { Todo } from '@/entities/Todo';
import { Button } from '@/components/ui/button';
import { Plus, ListChecks, X } from 'lucide-react';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import { toast } from 'sonner';
import { isToday, isPast } from 'date-fns';

export default function TodoSidebar({ isOpen, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadTasks();
    }
  }, [isOpen]);

  useEffect(() => {
    const overdueTasks = tasks.filter(task => 
      task.status !== 'done' && 
      task.due_date && 
      isPast(new Date(task.due_date)) && 
      !isToday(new Date(task.due_date))
    );
    if (overdueTasks.length > 0) {
      toast.error(`You have ${overdueTasks.length} overdue task(s).`);
    }
  }, [tasks]);

  const loadTasks = async () => {
    try {
      const fetchedTasks = await Todo.list('-created_date');
      setTasks(fetchedTasks);
    } catch (e) {
      console.error("Failed to load tasks", e);
      toast.error("Failed to load your tasks.");
    }
  };

  const handleFormSubmit = async (taskData) => {
    try {
      if (editingTask) {
        await Todo.update(editingTask.id, taskData);
        toast.success("Task updated successfully!");
      } else {
        await Todo.create(taskData);
        toast.success("Task added successfully!");
      }
      setEditingTask(null);
      setShowForm(false);
      loadTasks();
    } catch (e) {
      console.error("Failed to save task", e);
      toast.error("Could not save the task.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await Todo.delete(id);
      toast.success("Task deleted.");
      loadTasks();
    } catch (e) {
      console.error("Failed to delete task", e);
      toast.error("Could not delete the task.");
    }
  };
  
  const handleStatusChange = async (task, newStatus) => {
    try {
      const updateData = { status: newStatus };
      if (newStatus === 'done') {
        updateData.completed_date = new Date().toISOString();
      }
      await Todo.update(task.id, updateData);
      loadTasks();
    } catch (e) {
      console.error("Failed to update status", e);
      toast.error("Could not update task status.");
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };
  
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status !== 'done' && b.status === 'done') return -1;
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasks]);

  return (
    <div className={`fixed top-0 right-0 h-full w-96 bg-card text-card-foreground shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <header className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">My Tasks</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sortedTasks.map(task => (
            <TodoItem key={task.id} task={task} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
          ))}
          {tasks.length === 0 && !showForm && (
             <div className="text-center py-16 text-muted-foreground">
                <p>No tasks yet.</p>
                <p>Click "Add Task" to get started!</p>
             </div>
          )}
        </div>

        <div className="p-4 border-t border-border">
          {showForm ? (
            <TodoForm 
              task={editingTask}
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowForm(false); setEditingTask(null); }}
            />
          ) : (
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Task
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
