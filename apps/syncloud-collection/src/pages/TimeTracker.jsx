import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TimeEntry } from '@/entities/TimeEntry';
import { toast } from 'sonner';

const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

export default function TimeTracker() {
    const [time, setTime] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [description, setDescription] = useState('');
    const intervalRef = useRef(null);
    const startTimeRef = useRef(null);

    useEffect(() => {
        if (isActive) {
            if (!startTimeRef.current) {
                startTimeRef.current = new Date();
            }
            intervalRef.current = setInterval(() => setTime(t => t + 1), 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isActive]);

    const handleStartPause = () => {
        setIsActive(!isActive);
    };

    const handleStop = async () => {
        if (!description.trim()) {
            toast.error("Please enter a description for the time entry.");
            return;
        }

        setIsActive(false);
        try {
            await TimeEntry.create({
                description,
                start_time: startTimeRef.current.toISOString(),
                end_time: new Date().toISOString(),
                duration_seconds: time,
            });
            toast.success("Time entry saved successfully!");
        } catch(error) {
            console.error("Failed to save time entry:", error);
            toast.error("Could not save the time entry.");
        } finally {
            setTime(0);
            setDescription('');
            startTimeRef.current = null;
        }
    };

    return (
        <div className="p-6 flex justify-center items-center h-full bg-background">
            <Card className="w-full max-w-md bg-card border-border shadow-lg">
                <CardHeader><CardTitle className="text-center text-card-foreground">Time Tracker</CardTitle></CardHeader>
                <CardContent className="text-center space-y-6">
                    <div className="text-6xl font-mono text-foreground">{formatTime(time)}</div>
                    <Input 
                        placeholder="What are you working on?" 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        className="bg-muted text-foreground"
                    />
                    <div className="flex justify-center gap-4">
                        <Button size="lg" onClick={handleStartPause} className="bg-primary hover:bg-primary-accent">
                            {isActive ? <Pause /> : <Play />}
                            <span className="ml-2">{isActive ? 'Pause' : 'Start'}</span>
                        </Button>
                        <Button size="lg" variant="destructive" onClick={handleStop} disabled={time === 0}>
                            <Square />
                            <span className="ml-2">Stop & Save</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}