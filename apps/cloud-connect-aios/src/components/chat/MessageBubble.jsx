import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Copy, Bot, User, Download, Eye, Edit, RotateCcw, Check } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

export default function MessageBubble({ 
  message, 
  onCopy, 
  onEdit, 
  onRegenerate, 
  isLast = false,
  showActions = true 
}) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const [copied, setCopied] = useState(false);
  
  if (isSystem) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Message copied to clipboard");
    onCopy?.();
  };

  const handleEdit = () => {
    onEdit?.(message);
  };

  const handleRegenerate = () => {
    onRegenerate?.(message);
  };

  return (
    <div className={cn("group flex gap-4 p-6 transition-colors hover:bg-gray-50/50", isUser ? "bg-white" : "bg-gray-50/30")}>
      <div className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
        isUser 
          ? "bg-gradient-to-r from-[#45CA36] to-[#0B81FF]" 
          : "bg-gradient-to-r from-[#B4009E] to-[#02B6CE]"
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-semibold text-gray-900">
            {isUser ? 'You' : 'GLYTCH AI'}
          </span>
          {message.model && (
            <Badge variant="secondary" className="text-xs bg-[#02B6CE]/10 text-[#02B6CE]">
              {message.model}
            </Badge>
          )}
          <span className="text-xs text-gray-500">
            {format(new Date(message.created_date), "h:mm a")}
          </span>
        </div>
        
        <div className="prose prose-gray max-w-none">
          {isUser ? (
            <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <ReactMarkdown 
              className="text-gray-900 leading-relaxed"
              components={{
                code: ({ inline, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="relative group/code my-4">
                      <pre className="bg-[#0A0F11] text-gray-100 rounded-xl p-4 overflow-x-auto border">
                        <code className={className} {...props}>{children}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 bg-gray-800 hover:bg-gray-700 text-gray-300 h-8 px-2"
                        onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <code className="px-2 py-1 rounded-md bg-[#FFB902]/20 text-[#FFB902] text-sm font-mono">
                      {children}
                    </code>
                  );
                },
                a: ({ children, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" className="text-[#02B6CE] hover:text-[#02B6CE]/80 underline">
                    {children}
                  </a>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-[#B4009E] pl-4 my-4 text-gray-600 italic bg-gray-50 py-2 rounded-r-lg">
                    {children}
                  </blockquote>
                ),
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900 border-b border-gray-200 pb-2">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold mt-5 mb-3 text-gray-900">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-900">
                    {children}
                  </h3>
                ),
                ul: ({ children }) => (
                  <ul className="my-3 ml-6 list-disc space-y-1">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-3 ml-6 list-decimal space-y-1">
                    {children}
                  </ol>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-gray-50">{children}</thead>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 border-t border-gray-200">
                    {children}
                  </td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* File Attachments */}
        {message.file_attachments && message.file_attachments.length > 0 && (
          <div className="mt-4 space-y-2">
            {message.file_attachments.map((fileUrl, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg border">
                <Eye className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 flex-1">Attachment {index + 1}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2"
                  onClick={() => window.open(fileUrl, '_blank')}
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Message Actions */}
        {showActions && (
          <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleCopy}
              className="h-8 px-2 text-gray-500 hover:text-gray-700"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
            
            {isUser && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleEdit}
                className="h-8 px-2 text-gray-500 hover:text-gray-700"
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
            )}
            
            {!isUser && isLast && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleRegenerate}
                className="h-8 px-2 text-gray-500 hover:text-gray-700"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Regenerate
              </Button>
            )}
            
            {message.usage?.total_tokens && (
              <span className="text-xs text-gray-400 ml-auto">
                {message.usage.total_tokens} tokens
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}