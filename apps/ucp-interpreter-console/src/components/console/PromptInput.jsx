import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Send, Zap, Play, Square, Settings2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const MAX_PROMPT_LENGTH = 50000;

export default function PromptInput({
  onCompile,
  onRun,
  onStop,
  providers = [],
  selectedProvider,
  onProviderChange,
  maxTokens = 1024,
  onMaxTokensChange,
  isCompiling = false,
  isRunning = false,
  disabled = false,
  className
}) {
  const [prompt, setPrompt] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef(null);
  
  const charCount = prompt.length;
  const estimatedTokens = Math.ceil(charCount / 4);
  const isOverLimit = charCount > MAX_PROMPT_LENGTH;

  const handleCompile = () => {
    if (prompt.trim() && !isOverLimit) {
      onCompile(prompt.trim());
    }
  };

  const handleCompileAndRun = () => {
    if (prompt.trim() && !isOverLimit) {
      onRun(prompt.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleCompileAndRun();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 300) + 'px';
    }
  }, [prompt]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Provider & Settings Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Select value={selectedProvider || ''} onValueChange={onProviderChange}>
            <SelectTrigger className="w-[200px] h-9">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {providers.length === 0 ? (
                <SelectItem value={null} disabled>No providers configured</SelectItem>
              ) : (
                providers.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        p.is_active ? "bg-emerald-500" : "bg-slate-300"
                      )} />
                      {p.name}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <Popover open={showSettings} onOpenChange={setShowSettings}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <Settings2 className="w-4 h-4" />
                Settings
                <ChevronDown className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Max Tokens</Label>
                    <span className="text-sm font-mono text-slate-500">{maxTokens}</span>
                  </div>
                  <Slider
                    value={[maxTokens]}
                    onValueChange={([v]) => onMaxTokensChange(v)}
                    min={64}
                    max={4096}
                    step={64}
                    className="py-2"
                  />
                  <p className="text-xs text-slate-400">
                    Maximum tokens for the completion response
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="text-xs text-slate-400">
          <span className={cn(isOverLimit && "text-red-500 font-medium")}>
            {charCount.toLocaleString()}
          </span>
          <span> / {MAX_PROMPT_LENGTH.toLocaleString()} chars</span>
          <span className="mx-2 text-slate-300">•</span>
          <span>~{estimatedTokens.toLocaleString()} tokens</span>
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your prompt here... (⌘+Enter to compile and run)"
          className={cn(
            "min-h-[120px] max-h-[300px] resize-none pr-4 text-base",
            "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0",
            isOverLimit && "border-red-500 focus-visible:ring-red-500"
          )}
          disabled={disabled || isCompiling || isRunning}
        />
        
        {isOverLimit && (
          <p className="text-xs text-red-500 mt-1">
            Prompt exceeds maximum length. Please shorten your input.
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(isCompiling || isRunning) && (
            <Button
              variant="outline"
              onClick={onStop}
              className="h-10 px-4 text-red-600 border-red-200 hover:bg-red-50"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleCompile}
            disabled={!prompt.trim() || isOverLimit || disabled || isCompiling || isRunning || !selectedProvider}
            className="h-10 px-4"
          >
            <Zap className="w-4 h-4 mr-2" />
            {isCompiling ? 'Compiling...' : 'Compile Only'}
          </Button>

          <Button
            onClick={handleCompileAndRun}
            disabled={!prompt.trim() || isOverLimit || disabled || isCompiling || isRunning || !selectedProvider}
            className="h-10 px-6 bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Compile & Run
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}