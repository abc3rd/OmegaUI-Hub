import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function EnergySettings({ user, isLoading, onUpdate }) {
    const [kwhCost, setKwhCost] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user && user.kwh_cost) {
            setKwhCost(user.kwh_cost);
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const cost = parseFloat(kwhCost);
            if (!isNaN(cost)) {
                await base44.auth.updateMe({ kwh_cost: cost });
                onUpdate({ kwh_cost: cost });
            }
        } catch (error) {
            console.error("Failed to update kWh cost", error);
        }
        setIsSaving(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
        >
            <h2 className="text-xl font-bold text-white mb-4">Energy Settings</h2>
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-white/20" />
                    <Skeleton className="h-10 w-full bg-white/20" />
                </div>
            ) : (
                <div className="space-y-2">
                    <Label htmlFor="kwh_cost" className="text-white/80">Cost per kWh ($)</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="kwh_cost"
                            type="number"
                            step="0.01"
                            value={kwhCost}
                            onChange={(e) => setKwhCost(e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white"
                        />
                        <Button onClick={handleSave} disabled={isSaving} className="bg-blue-500 hover:bg-blue-600">
                            {isSaving ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}