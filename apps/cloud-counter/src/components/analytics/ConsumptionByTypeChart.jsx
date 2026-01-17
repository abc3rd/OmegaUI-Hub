import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap } from 'lucide-react';

export default function ConsumptionByTypeChart({ readings, isLoading }) {
    const dataByType = readings.reduce((acc, reading) => {
        const type = reading.device_type;
        if (!acc[type]) {
            acc[type] = { name: type, consumption: 0 };
        }
        acc[type].consumption += reading.consumption_kwh;
        return acc;
    }, {});

    const chartData = Object.values(dataByType).sort((a, b) => b.consumption - a.consumption);
    const colors = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#EC4899"];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
        >
            <div className="flex items-center gap-3 mb-6">
                <Zap className="w-5 h-5 text-yellow-300" />
                <h3 className="text-xl font-bold text-white">Consumption by Type</h3>
            </div>
            <div className="h-80">
                {isLoading ? (
                    <Skeleton className="h-full w-full bg-white/20" />
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                                contentStyle={{
                                    background: 'rgba(255,255,255,0.9)',
                                    backdropFilter: 'blur(5px)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '0.5rem',
                                }}
                            />
                            <Bar dataKey="consumption" radius={[0, 4, 4, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </motion.div>
    );
}