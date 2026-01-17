import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function HistoricalTrendChart({ readings, isLoading }) {
    const dataByDay = readings.reduce((acc, reading) => {
        const day = format(new Date(reading.timestamp), 'yyyy-MM-dd');
        if (!acc[day]) {
            acc[day] = { date: day, consumption: 0, cost: 0 };
        }
        acc[day].consumption += reading.consumption_kwh;
        acc[day].cost += reading.cost;
        return acc;
    }, {});

    const chartData = Object.values(dataByDay).sort((a,b) => new Date(a.date) - new Date(b.date));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
        >
            <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-5 h-5 text-green-300" />
                <h3 className="text-xl font-bold text-white">Historical Trend</h3>
            </div>
            <div className="h-80">
                {isLoading ? (
                    <Skeleton className="h-full w-full bg-white/20" />
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis 
                                dataKey="date" 
                                tickFormatter={(str) => format(new Date(str), 'MMM d')}
                                tick={{ fill: 'rgba(255,255,255,0.7)' }} 
                            />
                            <YAxis tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(255,255,255,0.8)',
                                    backdropFilter: 'blur(5px)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '0.5rem',
                                }}
                            />
                            <Area type="monotone" dataKey="consumption" stroke="#3B82F6" fillOpacity={1} fill="url(#colorConsumption)" />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </motion.div>
    );
}