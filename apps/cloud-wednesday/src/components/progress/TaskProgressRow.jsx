import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import StatusBadge, { StatusSelector } from "./StatusBadge";
import ProgressBar from "./ProgressBar";
import { 
  Calendar as CalendarIcon, 
  ChevronDown
} from "lucide-react";
import { format, isPast, isToday, differenceInDays } from "date-fns";

export default function TaskProgressRow({ 
  item, 
  onUpdate,
  compact = false,
  className = ""
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localProgress, setLocalProgress] = useState(item.progress || 0);
  
  const status = item.status || item.data?.status || "todo";
  const dueDate = item.due_date || item.data?.due_date;
  const progress = item.progress || 0;

  const handleStatusChange = (newStatus) => {
    const updates = { status: newStatus };
    
    // Auto-update progress based on status
    if (newStatus === 'done') {
      updates.progress = 100;
      setLocalProgress(100);
    } else if (newStatus === 'todo' && progress === 100) {
      updates.progress = 0;
      setLocalProgress(0);
    }
    
    onUpdate(item.id, updates);
  };

  const handleProgressChange = (value) => {
    const newProgress = value[0];
    setLocalProgress(newProgress);
  };

  const handleProgressCommit = () => {
    let updates = { progress: localProgress };
    
    // Auto-update status based on progress
    if (localProgress === 100 && status !== 'done') {
      updates.status = 'done';
    } else if (localProgress === 0 && status === 'done') {
      updates.status = 'todo';
    } else if (localProgress > 0 && localProgress < 100 && status === 'todo') {
      updates.status = 'in_progress';
    }
    
    onUpdate(item.id, updates);
  };

  const handleDueDateChange = (date) => {
    onUpdate(item.id, { due_date: date ? format(date, 'yyyy-MM-dd') : null });
  };

  const getDueDateStatus = () => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    if (status === 'done') return { color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Completed' };
    if (isPast(due) && !isToday(due)) return { color: 'text-red-600', bg: 'bg-red-50', label: 'Overdue' };
    if (isToday(due)) return { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Due Today' };
    const daysUntil = differenceInDays(due, new Date());
    if (daysUntil <= 3) return { color: 'text-amber-600', bg: 'bg-amber-50', label: `${daysUntil} days left` };
    return { color: 'text-gray-600', bg: 'bg-gray-50', label: format(due, 'MMM d') };
  };

  const dueDateStatus = getDueDateStatus();

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <StatusBadge status={status} size="sm" showIcon={true} />
        <div className="flex-1 min-w-0">
          <ProgressBar 
            progress={progress} 
            status={status} 
            size="xs" 
            showLabel={false}
            showPercentage={false}
          />
        </div>
        {dueDate && dueDateStatus && (
          <span className={`text-xs ${dueDateStatus.color} whitespace-nowrap`}>
            {dueDateStatus.label}
          </span>
        )}
      </div>
    );
  }

  return (
    <motion.div 
      className={`bg-white rounded-xl border border-gray-100 overflow-hidden ${className}`}
      layout
    >
      <div 
        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <StatusBadge status={status} size="md" showIcon={true} />
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-800 text-sm">{item.title}</span>
            <span className="text-xs font-semibold text-gray-500">{Math.round(progress)}%</span>
          </div>
          <ProgressBar 
            progress={progress} 
            status={status} 
            size="sm" 
            showLabel={false}
            showPercentage={false}
          />
        </div>

        {dueDate && dueDateStatus && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${dueDateStatus.bg} ${dueDateStatus.color}`}>
            <CalendarIcon className="w-3 h-3" />
            {dueDateStatus.label}
          </div>
        )}

        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
        />
      </div>

      {isExpanded && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4"
        >
          {/* Status Selection */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">Status</label>
            <StatusSelector value={status} onChange={handleStatusChange} />
          </div>

          {/* Progress Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600">Progress</label>
              <span className="text-sm font-bold text-gray-800">{localProgress}%</span>
            </div>
            <Slider
              value={[localProgress]}
              onValueChange={handleProgressChange}
              onValueCommit={handleProgressCommit}
              max={100}
              step={5}
              className="cursor-pointer"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">Due Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    dueDate ? '' : 'text-gray-400'
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(new Date(dueDate), 'PPP') : 'Set due date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate ? new Date(dueDate) : undefined}
                  onSelect={handleDueDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}