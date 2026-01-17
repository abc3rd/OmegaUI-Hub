import React from 'react';
import { cn } from '@/lib/utils';
import { Copy, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function OutputPanel({ 
  output = '', 
  status = 'pending',
  error = null,
  isLoading = false,
  className 
}) {
  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    toast.success('Output copied to clipboard');
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ucp-output-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Output downloaded');
  };

  if (isLoading) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-16", className)}>
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Processing...</p>
        <p className="text-sm text-slate-400 mt-1">Executing UCP pipeline</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("p-6", className)}>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 mb-2">Execution Error</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!output) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium">No output yet</p>
        <p className="text-sm text-slate-400 mt-1 max-w-xs">
          Enter a prompt and run the UCP pipeline to see the response here
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="font-semibold text-slate-700">Output</span>
          {status === 'success' && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
              Success
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyOutput} className="h-8">
            <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
          </Button>
          <Button variant="outline" size="sm" onClick={downloadOutput} className="h-8">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Download
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="prose prose-slate max-w-none prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
          <ReactMarkdown
            components={{
              code: ({ inline, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                if (!inline && match) {
                  return (
                    <pre className="relative group">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 bg-slate-800 hover:bg-slate-700 text-slate-300"
                          onClick={() => {
                            navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                            toast.success('Code copied');
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                }
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {output}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}