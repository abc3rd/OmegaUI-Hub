import React, { useState, useEffect } from 'react';
import { Plant } from '@/entities/Plant';
import { YardTask } from '@/entities/YardTask';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Droplets, Shovel, Calendar, AlertTriangle } from 'lucide-react';
import { format, addDays, differenceInDays, isPast } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function YardCare() {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReminders();
    }, []);

    const loadReminders = async () => {
        try {
            const [plants, tasks] = await Promise.all([
                Plant.list(),
                YardTask.list()
            ]);

            const plantReminders = plants.flatMap(plant => {
                const reminders = [];
                if (plant.last_watered) {
                    const nextWatering = addDays(new Date(plant.last_watered), plant.watering_frequency);
                    reminders.push({ id: `water-${plant.id}`, type: 'water', item: plant, dueDate: nextWatering, name: `Water ${plant.name}` });
                }
                if (plant.last_fertilized && plant.fertilizing_frequency) {
                    const nextFertilizing = addDays(new Date(plant.last_fertilized), plant.fertilizing_frequency);
                    reminders.push({ id: `fertilize-${plant.id}`, type: 'fertilize', item: plant, dueDate: nextFertilizing, name: `Fertilize ${plant.name}` });
                }
                return reminders;
            });

            const taskReminders = tasks.map(task => ({
                id: `task-${task.id}`,
                type: 'task',
                item: task,
                dueDate: addDays(new Date(task.last_completed), task.frequency_days),
                name: task.name
            }));
            
            const allReminders = [...plantReminders, ...taskReminders];
            allReminders.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            setReminders(allReminders);

        } catch (error) {
            console.error("Failed to load reminders:", error);
            toast.error("Could not load care reminders.");
        } finally {
            setLoading(false);
        }
    };
    
    const getDaysUntilDue = (dueDate) => differenceInDays(new Date(dueDate), new Date());
    
    const getBadgeStyle = (days) => {
        if (days < 0) return 'bg-red-500 text-white';
        if (days <= 3) return 'bg-yellow-500 text-white';
        return 'bg-green-500 text-white';
    };

    const getIcon = (type) => {
        switch(type) {
            case 'water': return <Droplets className="w-5 h-5 text-blue-500" />;
            case 'fertilize': return <Leaf className="w-5 h-5 text-green-700" />;
            case 'task': return <Shovel className="w-5 h-5 text-gray-600" />;
            default: return <Calendar className="w-5 h-5" />;
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Yard & Garden Care Hub</h1>
                    <p className="text-muted-foreground">Your central dashboard for all plant and yard tasks.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to={createPageUrl('MyPlants')} className="block">
                    <Card className="hover:shadow-lg transition-shadow h-full">
                        <CardHeader>
                            <CardTitle>My Plants</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Manage your indoor and outdoor plants.</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link to={createPageUrl('YardDesigner')} className="block">
                     <Card className="hover:shadow-lg transition-shadow h-full">
                        <CardHeader>
                            <CardTitle>Yard Designer</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Plan your landscape with a 3D visualizer.</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link to={createPageUrl('SodCalculator')} className="block">
                     <Card className="hover:shadow-lg transition-shadow h-full">
                        <CardHeader>
                            <CardTitle>Sod Calculator</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Estimate materials for your landscaping project.</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Upcoming Reminders
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading reminders...</p>
                    ) : reminders.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No upcoming reminders. Add some plants or tasks to get started!</p>
                    ) : (
                        <div className="space-y-3">
                            {reminders.map(reminder => {
                                const daysUntil = getDaysUntilDue(reminder.dueDate);
                                const isOverdue = isPast(reminder.dueDate);
                                return (
                                    <div key={reminder.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
                                        {getIcon(reminder.type)}
                                        <div className="flex-1">
                                            <p className="font-medium text-foreground">{reminder.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Due: {format(new Date(reminder.dueDate), 'EEE, MMM d')}
                                            </p>
                                        </div>
                                        <Badge className={getBadgeStyle(daysUntil)}>
                                            {isOverdue ? `Overdue by ${Math.abs(daysUntil)}d` : `In ${daysUntil}d`}
                                        </Badge>
                                        {isOverdue && <AlertTriangle className="w-5 h-5 text-red-500" />}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}