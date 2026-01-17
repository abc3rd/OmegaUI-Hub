import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Send, 
  Paperclip, 
  Square,
  Loader2,
  X,
  Settings,
  BookOpen,
  Wrench
} from "lucide-react";
import { UploadFile } from "@/integrations/Core";
import { Badge } from "@/components/ui/badge";
import { Preset, KnowledgeBase, Tool } from "@/entities/all";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ChatInput({ 
  onSendMessage, 
  isLoading, 
  onStopGeneration,
  currentThread,
  placeholder = "Type your message..." 
}) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [presets, setPresets] = useState([]);
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [tools, setTools] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [enabledKBs, setEnabledKBs] = useState([]);
  const [enabledTools, setEnabledTools] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [temperature, setTemperature] = useState([currentThread?.temperature || 0.7]);
  const [topP, setTopP] = useState([currentThread?.top_p || 1]);
  
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadPresets();
    loadKnowledgeBases();
    loadTools();
  }, []);

  useEffect(() => {
    if (currentThread) {
      setTemperature([currentThread.temperature || 0.7]);
      setTopP([currentThread.top_p || 1]);
      setSelectedPreset(currentThread.system_prompt_id || "");
      setEnabledTools(currentThread.tool_ids || []);
    }
  }, [currentThread]);

  const loadPresets = async () => {
    try {
      const data = await Preset.list();
      setPresets(data);
    } catch (error) {
      console.error("Error loading presets:", error);
    }
  };

  const loadKnowledgeBases = async () => {
    try {
      const data = await KnowledgeBase.list();
      setKnowledgeBases(data);
      setEnabledKBs(data.filter(kb => kb.default_enabled).map(kb => kb.id));
    } catch (error) {
      console.error("Error loading knowledge bases:", error);
    }
  };

  const loadTools = async () => {
    try {
      const data = await Tool.filter({ enabled: true });
      setTools(data);
    } catch (error) {
      console.error("Error loading tools:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && attachments.length === 0) return;
    
    await onSendMessage({
      content: message,
      attachments: attachments,
      preset_id: selectedPreset,
      kb_ids: enabledKBs,
      tool_ids: enabledTools,
      temperature: temperature[0],
      top_p: topP[0]
    });
    
    setMessage("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = async (files) => {
    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const { file_url } = await UploadFile({ file });
        return {
          name: file.name,
          url: file_url,
          type: file.type,
          size: file.size
        };
      });
      
      const uploadedFiles = await Promise.all(uploadPromises);
      setAttachments(prev => [...prev, ...uploadedFiles]);
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const adjustTextareaHeight = (element) => {
    element.style.height = 'auto';
    element.style.height = Math.min(element.scrollHeight, 200) + 'px';
  };

  const toggleKB = (kbId) => {
    setEnabledKBs(prev => 
      prev.includes(kbId) 
        ? prev.filter(id => id !== kbId)
        : [...prev, kbId]
    );
  };

  const toggleTool = (toolId) => {
    setEnabledTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Configuration Bar */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#02B6CE]" />
            <Select value={selectedPreset} onValueChange={setSelectedPreset}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select preset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>No preset</SelectItem>
                {presets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {knowledgeBases.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Knowledge ({enabledKBs.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Knowledge Bases</h4>
                  <ScrollArea className="h-32">
                    {knowledgeBases.map((kb) => (
                      <div key={kb.id} className="flex items-center space-x-2 py-2">
                        <Switch
                          id={kb.id}
                          checked={enabledKBs.includes(kb.id)}
                          onCheckedChange={() => toggleKB(kb.id)}
                        />
                        <Label htmlFor={kb.id} className="text-sm">
                          {kb.name}
                        </Label>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {tools.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Wrench className="w-4 h-4" />
                  Tools ({enabledTools.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Available Tools</h4>
                  <ScrollArea className="h-32">
                    {tools.map((tool) => (
                      <div key={tool.id} className="flex items-center space-x-2 py-2">
                        <Switch
                          id={tool.id}
                          checked={enabledTools.includes(tool.id)}
                          onCheckedChange={() => toggleTool(tool.id)}
                        />
                        <Label htmlFor={tool.id} className="text-sm">
                          {tool.name}
                        </Label>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
          )}

          <Popover open={showSettings} onOpenChange={setShowSettings}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Parameters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Temperature: {temperature[0]}</Label>
                  <Slider
                    value={temperature}
                    onValueChange={setTemperature}
                    max={2}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Top P: {topP[0]}</Label>
                  <Slider
                    value={topP}
                    onValueChange={setTopP}
                    max={1}
                    min={0}
                    step={0.05}
                    className="mt-2"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="p-4">
        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-2 bg-[#02B6CE]/10 text-[#02B6CE]">
                <Paperclip className="w-3 h-3" />
                <span className="text-xs truncate max-w-24">{attachment.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0 hover:bg-red-100"
                  onClick={() => removeAttachment(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                adjustTextareaHeight(e.target);
              }}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              className="min-h-[44px] max-h-[200px] resize-none pr-20 border-gray-300 focus:border-[#02B6CE] focus:ring-[#02B6CE]"
              disabled={isLoading}
            />
            
            {/* File Upload Button */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isUploading}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Paperclip className="w-4 h-4 text-gray-500" />
                )}
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={onStopGeneration}
              className="bg-red-500 hover:bg-red-600"
            >
              <Square className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() && attachments.length === 0}
              className="bg-gradient-to-r from-[#B4009E] to-[#02B6CE] hover:from-[#B4009E]/90 hover:to-[#02B6CE]/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
        </form>

        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>Press Cmd+Enter to send</span>
          <span>Attachments: PDF, DOCX, TXT, CSV, PNG, JPG</span>
        </div>
      </div>
    </div>
  );
}