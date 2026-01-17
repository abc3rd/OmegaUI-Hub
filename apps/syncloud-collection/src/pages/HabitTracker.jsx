import React, { useState, useEffect, useMemo } from 'react';
import { Habit } from '@/entities/Habit';
import { HabitLog } from '@/entities/HabitLog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Zap, TrendingUp, Award, Flame } from 'lucide-react';
import { toast } from 'sonner';
import { differenceInCalendarDays, startOfToday, isToday, parseISO } from 'date-fns';

import HabitForm from '@/components/habits/HabitForm';
import HabitItem from '@/components/habits/HabitItem';

// Utility to calculate streak
const calculateStreak = (logs) => {
  if (!logs || logs.length === 0) return 0;

  const sortedLogs = logs
    .map(log => parseISO(log.completed_at))
    .filter(date => !isNaN(date.getTime()))
    .sort((a, b) => b - a);

  const uniqueDays = [...new Set(sortedLogs.map(date => date.toISOString().split('T')[0]))];
  
  if (uniqueDays.length === 0) return 0;
  
  const today = startOfToday();
  const mostRecentLogDate = parseISO(uniqueDays[0]);

  const diffFromToday = differenceInCalendarDays(today, mostRecentLogDate);

  if (diffFromToday > 1) return 0;

  let streak = 1;
  for (let i = 0; i < uniqueDays.length - 1; i++) {
    const current = parseISO(uniqueDays[i]);
    const previous = parseISO(uniqueDays[i+1]);
    if (differenceInCalendarDays(current, previous) === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return diffFromToday > 0 ? 0 : streak;
};

export default function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [habitsData, logsData] = await Promise.all([
        Habit.list('-created_date'),
        HabitLog.list()
      ]);
      setHabits(habitsData);
      setLogs(logsData);
    } catch (error) {
      console.error("Failed to fetch habit data:", error);
      toast.error("Could not load your habits. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const habitWithLogsAndStreak = useMemo(() => {
    return habits.map(habit => {
      const habitLogs = logs.filter(log => log.habit_id === habit.id);
      const streak = calculateStreak(habitLogs);
      const lastLog = habitLogs.sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))[0];
      const isCompletedToday = lastLog && isToday(parseISO(lastLog.completed_at));

      return { ...habit, logs: habitLogs, streak, isCompletedToday };
    });
  }, [habits, logs]);

  const stats = useMemo(() => {
    const totalStreaks = habitWithLogsAndStreak.reduce((sum, h) => sum + h.streak, 0);
    const longestStreak = Math.max(0, ...habitWithLogsAndStreak.map(h => h.streak));
    return { totalStreaks, longestStreak };
  }, [habitWithLogsAndStreak]);


  const handleFormSubmit = async (habitData) => {
    try {
      if (editingHabit) {
        await Habit.update(editingHabit.id, habitData);
        toast.success("Habit updated!");
      } else {
        await Habit.create(habitData);
        toast.success("New habit added!");
      }
      setIsFormOpen(false);
      setEditingHabit(null);
      fetchData();
    } catch (error) {
      console.error("Failed to save habit:", error);
      toast.error("Could not save habit.");
    }
  };

  const handleCompleteHabit = async (habitId) => {
    try {
      await HabitLog.create({ habit_id: habitId, completed_at: new Date().toISOString() });
      toast.success("Great job! Keep it up!");
      fetchData();
    } catch (error) {
      console.error("Failed to log habit:", error);
      toast.error("Could not log completion.");
    }
  };

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    setIsFormOpen(true);
  };

  const handleDelete = async (habitId) => {
     try {
        // Optimistically update UI
        setHabits(prev => prev.filter(h => h.id !== habitId));
        await Habit.delete(habitId);
        // Delete associated logs (optional, good for cleanup)
        const logsToDelete = logs.filter(log => log.habit_id === habitId);
        await Promise.all(logsToDelete.map(log => HabitLog.delete(log.id)));
        toast.success("Habit deleted.");
        fetchData();
     } catch (error) {
        console.error("Failed to delete habit:", error);
        toast.error("Could not delete habit.");
        fetchData(); // Re-fetch to restore state on failure
     }
  };

  return (
    <div className="p-6 bg-background text-foreground min-h-full">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Habit Tracker</h1>
          <p className="text-muted-foreground">Build positive habits and track your progress daily.</p>
        </div>
        <Button onClick={() => { setEditingHabit(null); setIsFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add New Habit
        </Button>
      </header>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
                  <Zap className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{habits.length}</div></CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Combined Streaks</CardTitle>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{stats.totalStreaks}</div></CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
                  <Award className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{stats.longestStreak}</div></CardContent>
          </Card>
           <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
                  <Flame className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{habitWithLogsAndStreak.filter(h => h.isCompletedToday).length} / {habits.length}</div></CardContent>
          </Card>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading habits...</div>
      ) : habits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habitWithLogsAndStreak.map(habit => (
            <HabitItem
              key={habit.id}
              habit={habit}
              onComplete={() => handleCompleteHabit(habit.id)}
              onEdit={() => handleEdit(habit)}
              onDelete={() => handleDelete(habit.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Start Your Journey</h2>
          <p className="text-muted-foreground mb-4">You haven't created any habits yet. Click below to add your first one!</p>
          <Button onClick={() => { setEditingHabit(null); setIsFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Your First Habit
          </Button>
        </div>
      )}

      <HabitForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        habit={editingHabit}
      />
    </div>
  );
}