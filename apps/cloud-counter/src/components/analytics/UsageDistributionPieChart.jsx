import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from 'lucide-react';

export default function UsageDistributionPieChart({ readings, isLoading }) {
    const dataByDevice = readings.reduce((acc, reading) => {
        const name = reading.device_name;
        if (!acc[name]) {
            acc[name] = { name: name, value: 0 };
        }
        acc[name].value += reading.consumption_kwh;
        return acc;
    }, {});
    
    const chartData = Object.values(dataByDevice).sort((a, b) => b.value - a.value).slice(0, 5);
    const colors = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 h-full"
        >
            <div className="flex items-center gap-3 mb-6">
                <Activity className="w-5 h-5 text-purple-300" />
                <h3 className="text-xl font-bold text-white">Top 5 Devices</h3>
            </div>
            <div className="h-80">
                {isLoading ? (
                    <Skeleton className="h-full w-full bg-white/20 rounded-full" />
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(255,255,255,0.8)',
                                    backdropFilter: 'blur(5px)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '0.5rem',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </motion.div>
    );
}