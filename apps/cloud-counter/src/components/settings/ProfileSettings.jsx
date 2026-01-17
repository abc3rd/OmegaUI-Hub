import React from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileSettings({ user, isLoading }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
        >
            <h2 className="text-xl font-bold text-white mb-4">User Profile</h2>
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <UserIcon className="w-5 h-5 text-white/70" />
                    <div className="flex-1">
                        <p className="text-sm text-white/60">Full Name</p>
                        {isLoading ? <Skeleton className="h-5 w-40 bg-white/20 mt-1" /> : <p className="text-white font-medium">{user?.full_name}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Mail className="w-5 h-5 text-white/70" />
                    <div className="flex-1">
                        <p className="text-sm text-white/60">Email Address</p>
                        {isLoading ? <Skeleton className="h-5 w-48 bg-white/20 mt-1" /> : <p className="text-white font-medium">{user?.email}</p>}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}