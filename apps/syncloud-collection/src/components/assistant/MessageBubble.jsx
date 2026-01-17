
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Copy, Zap, CheckCircle2, AlertCircle, Loader2, ChevronRight, Clock, User as UserIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FunctionDisplay = ({ toolCall }) => {
    const [expanded, setExpanded] = useState(false);
    const name = toolCall?.name || 'Function';
    const status = toolCall?.status || 'pending';
    const results = toolCall?.results;
    
    const parsedResults = (() => {
        if (!results) return null;
        try {
            return typeof results === 'string' ? JSON.parse(results) : results;
        } catch {
            return results;
        }
    })();
    
    const isError = results && (
        (typeof results === 'string' && /error|failed/i.test(results)) ||
        (parsedResults?.success === false)
    );
    
    const statusConfig = {
        pending: { icon: Clock, color: 'text-slate-400', text: 'Pending' },
        running: { icon: Loader2, color: 'text-slate-500', text: 'Running...', spin: true },
        in_progress: { icon: Loader2, color: 'text-slate-500', text: 'Running...', spin: true },
        completed: isError ? 
            { icon: AlertCircle, color: 'text-red-500', text: 'Failed' } : 
            { icon: CheckCircle2, color: 'text-green-600', text: 'Success' },
        success: { icon: CheckCircle2, color: 'text-green-600', text: 'Success' },
        failed: { icon: AlertCircle, color: 'text-red-500', text: 'Failed' },
        error: { icon: AlertCircle, color: 'text-red-500', text: 'Failed' }
    }[status] || { icon: Zap, color: 'text-slate-500', text: '' };
    
    const Icon = statusConfig.icon;
    const formattedName = name.split('.').reverse()[0].replace(/([A-Z])/g, ' $1').trim();
    
    return (
        <div className="mt-2 text-xs">
            <button
                onClick={() => setExpanded(!expanded)}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all",
                    "hover:bg-accent",
                    expanded ? "bg-accent border-border" : "bg-card border-border"
                )}
            >
                <Icon className={cn("h-3 w-3", statusConfig.color, statusConfig.spin && "animate-spin")} />
                <span className="text-foreground capitalize">{formattedName}</span>
                {statusConfig.text && (
                    <span className={cn("text-muted-foreground", isError && "text-danger")}>
                        • {statusConfig.text}
                    </span>
                )}
                {!statusConfig.spin && (toolCall.arguments_string || results) && (
                    <ChevronRight className={cn("h-3 w-3 text-muted-foreground transition-transform ml-auto", 
                        expanded && "rotate-90")} />
                )}
            </button>
            
            {expanded && !statusConfig.spin && (
                <div className="mt-1.5 ml-3 pl-3 border-l-2 border-border space-y-2">
                    {toolCall.arguments_string && (
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Parameters:</div>
                            <pre className="bg-muted rounded-md p-2 text-xs text-muted-foreground whitespace-pre-wrap">
                                {(() => {
                                    try {
                                        return JSON.stringify(JSON.parse(toolCall.arguments_string), null, 2);
                                    } catch {
                                        return toolCall.arguments_string;
                                    }
                                })()}
                            </pre>
                        </div>
                    )}
                    {parsedResults && (
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Result:</div>
                            <pre className="bg-muted rounded-md p-2 text-xs text-muted-foreground whitespace-pre-wrap max-h-48 overflow-auto">
                                {typeof parsedResults === 'object' ? 
                                    JSON.stringify(parsedResults, null, 2) : parsedResults}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default function MessageBubble({ message }) {
    const isUser = message.role === 'user';
    const GLYTCH_ICON_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bdbae61875d59c7d61ef06/42f53f232_splash_with_glytch.png";
    
    return (
        <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
            {!isUser && (
                <img src={GLYTCH_ICON_URL} alt="assistant avatar" className="w-8 h-8 rounded-full flex-shrink-0 self-start" />
            )}
            <div className={cn("max-w-[85%]", isUser && "flex flex-col items-end")}>
                {message.content && (
                    <div className={cn(
                        "rounded-2xl px-4 py-2.5",
                        isUser ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                    )}>
                        <ReactMarkdown 
                            className="text-sm prose prose-sm prose-slate dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                            components={{
                                code: ({ inline, className, children, ...props }) => {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline && match ? (
                                        <div className="relative group/code">
                                            <pre className="bg-muted text-muted-foreground rounded-lg p-3 overflow-x-auto my-2">
                                                <code className={className} {...props}>{children}</code>
                                            </pre>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover/code:opacity-100 bg-background hover:bg-accent"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                                                    toast.success('Code copied');
                                                }}
                                            >
                                                <Copy className="h-3 w-3 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <code className="px-1 py-0.5 rounded bg-muted text-foreground text-xs">
                                            {children}
                                        </code>
                                    );
                                },
                                a: ({ children, ...props }) => (
                                    <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{children}</a>
                                ),
                                p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>
                )}
                
                {message.tool_calls?.length > 0 && (
                    <div className="space-y-1 mt-2 w-full">
                        {message.tool_calls.map((toolCall, idx) => (
                            <FunctionDisplay key={idx} toolCall={toolCall} />
                        ))}
                    </div>
                )}
            </div>
            {isUser && (
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0 self-start">
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                </div>
            )}
        </div>
    );
}
