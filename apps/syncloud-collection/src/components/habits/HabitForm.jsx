
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

const iconComponents = {
  Target, BookOpen, Dumbbell, BrainCircuit, Bed, Apple, Droplets, Sunrise
};
const iconList = Object.keys(iconComponents);
const colorList = ['#69378d', '#28a745', '#fdc600', '#282361', '#ff0000', '#0ea5e9', '#f97316'];

export default function HabitForm({ isOpen, onClose, onSubmit, habit }) {
  const [formData, setFormData] = useState({ name: '', description: '', icon: 'Target', color: '#69378d' });

  useEffect(() => {
    if (habit) {
      setFormData(habit);
    } else {
      setFormData({ name: '', description: '', icon: 'Target', color: '#69378d' });
    }
  }, [habit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const IconComponent = iconComponents[formData.icon] || Target;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>{habit ? 'Edit Habit' : 'Create a New Habit'}</DialogTitle>
          <DialogDescription>
            Define your new habit. A clear goal is the first step to success.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Meditate for 10 minutes"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., To improve focus and reduce stress"
            />
          </div>
          <div className="space-y-2">
            <Label>Icon & Color</Label>
            <div className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: formData.color, color: 'white' }}>
                 <IconComponent className="w-6 h-6" />
                 <span className="font-semibold">{formData.name || 'Your New Habit'}</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                 <Label className="text-xs">Icon</Label>
                 <div className="flex flex-wrap gap-2">
                    {iconList.map(iconName => {
                        const Icon = iconComponents[iconName];
                        return (
                            <Button 
                                key={iconName} 
                                type="button" 
                                variant="outline" 
                                size="icon"
                                onClick={() => setFormData({...formData, icon: iconName})}
                                className={formData.icon === iconName ? 'ring-2 ring-primary' : ''}
                            >
                                <Icon className="w-4 h-4" />
                            </Button>
                        )
                    })}
                 </div>
              </div>
              <div className="flex-1 space-y-1">
                 <Label className="text-xs">Color</Label>
                 <div className="flex flex-wrap gap-2">
                    {colorList.map(color => (
                        <button 
                            key={color} 
                            type="button" 
                            className={`w-8 h-8 rounded-full transition-all ${formData.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                            style={{backgroundColor: color}}
                            onClick={() => setFormData({...formData, color})}
                        />
                    ))}
                 </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">{habit ? 'Save Changes' : 'Create Habit'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
