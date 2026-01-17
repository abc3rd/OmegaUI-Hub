import React from 'react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

const notifications = [
    { id: "high_usage", label: "High Usage Alerts" },
    { id: "weekly_summary", label: "Weekly Summary Reports" },
    { id: "savings_tips", label: "New Savings Tips" }
];

export default function NotificationSettings({ isLoading }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
        >
            <h2 className="text-xl font-bold text-white mb-4">Notifications</h2>
            <div className="space-y-4">
                {isLoading ? Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-5 w-32 bg-white/20" />
                        <Skeleton className="h-6 w-12 bg-white/20 rounded-full" />
                    </div>
                )) : notifications.map(notification => (
                    <div key={notification.id} className="flex items-center justify-between">
                        <Label htmlFor={notification.id} className="text-white/90">{notification.label}</Label>
                        <Switch id={notification.id} />
                    </div>
                ))}
            </div>
        </motion.div>
    );
}