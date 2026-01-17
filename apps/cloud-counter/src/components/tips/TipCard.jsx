import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const impactColors = {
    "High": "bg-red-500/20 text-red-300 border-red-500/30",
    "Medium": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    "Low": "bg-green-500/20 text-green-300 border-green-500/30"
};

const difficultyColors = {
    "Hard": "bg-purple-500/20 text-purple-300 border-purple-500/30",
    "Medium": "bg-blue-500/20 text-blue-300 border-blue-500/30",
    "Easy": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
};

export default function TipCard({ tip, delay }) {
    const { title, description, impact, difficulty, icon: Icon } = tip;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 h-full flex flex-col"
        >
            <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-transparent rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                </div>
            </div>
            <p className="text-white/70 text-sm flex-grow">{description}</p>
            <div className="flex justify-start gap-2 mt-4">
                <Badge className={impactColors[impact]}>Impact: {impact}</Badge>
                <Badge className={difficultyColors[difficulty]}>Difficulty: {difficulty}</Badge>
            </div>
        </motion.div>
    );
}