import React from 'react';
import { Clock, Code2 } from 'lucide-react';
import { format } from 'date-fns';

export default function RunHistoryPanel({ runs, onSelectRun, selectedRunId }) {
    if (!runs || runs.length === 0) {
        return (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
                <h3 className="font-bold text-white flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4" /> Run History
                </h3>
                <p className="text-sm text-gray-500">No runs yet. Execute a command to get started.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
            <h3 className="font-bold text-white flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4" /> Run History ({runs.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {runs.map((run) => (
                    <button
                        key={run.id}
                        onClick={() => onSelectRun(run)}
                        className={`w-full text-left p-3 rounded border transition-all ${
                            selectedRunId === run.id
                                ? 'bg-gray-700 border-blue-500'
                                : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                        }`}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-400 mb-1">
                                    {format(new Date(run.created_date), 'MMM d, yyyy HH:mm:ss')}
                                </p>
                                <p className="text-sm text-white truncate font-mono">
                                    {run.input_command.substring(0, 60)}
                                    {run.input_command.length > 60 ? '...' : ''}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-green-400">
                                <Code2 className="h-3 w-3" />
                                <span>{run.compiled_codes?.length || 0}</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}