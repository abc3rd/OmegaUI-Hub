
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Flame, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  Target,
  BookOpen,
  Dumbbell,
  BrainCircuit,
  Bed,
  Apple,
  Droplets,
  Sunrise
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const iconComponents = {
  Target, BookOpen, Dumbbell, BrainCircuit, Bed, Apple, Droplets, Sunrise
};

export default function HabitItem({ habit, onComplete, onEdit, onDelete }) {
  const Icon = iconComponents[habit.icon] || Target;
  const isCompleted = habit.isCompletedToday;

  return (
    <Card className="flex flex-col justify-between" style={{ borderLeft: `4px solid ${habit.color}`}}>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${habit.color}20` }}>
            <Icon className="w-5 h-5" style={{ color: habit.color }} />
          </div>
          <div>
            <CardTitle className="text-base">{habit.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{habit.description}</p>
          </div>
        </div>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Flame className={`w-5 h-5 transition-colors ${habit.streak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`}/>
            <span className="font-bold text-lg">{habit.streak}</span>
            <span className="text-sm text-muted-foreground">day streak</span>
        </div>
        <Button
          size="lg"
          onClick={onComplete}
          disabled={isCompleted}
          className={`transition-all ${isCompleted ? 'bg-green-500 hover:bg-green-600' : 'bg-primary'}`}
        >
          <Check className="w-5 h-5 mr-2" />
          {isCompleted ? 'Done!' : 'Complete'}
        </Button>
      </CardContent>
    </Card>
  );
}
