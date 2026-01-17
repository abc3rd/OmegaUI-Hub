import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function BackendIndicator({ isOnline }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            {isOnline ? (
                <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-500 font-mono">SERVER ONLINE</span>
                </>
            ) : (
                <>
                    <WifiOff className="h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-500 font-mono">LOCAL MODE</span>
                </>
            )}
        </div>
    );
}