import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MapPin, 
  X,
  Image as ImageIcon,
  Loader2,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function MessageInput({ 
  onSendMessage, 
  onSendFile, 
  onSendVoice,
  onSendLocation,
  disabled 
}) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleSend = async () => {
    if (message.trim() || selectedFile) {
      if (selectedFile) {
        setIsUploading(true);
        await onSendFile(selectedFile, message.trim());
        setSelectedFile(null);
        setIsUploading(false);
      } else {
        await onSendMessage(message.trim());
      }
      setMessage('');
      textareaRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRecordVoice = async () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        if (onSendVoice) {
          onSendVoice(null);
        }
      }, 2000);
    }
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (onSendLocation) {
            onSendLocation(
              position.coords.latitude,
              position.coords.longitude,
              'My Location'
            );
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="p-4 bg-white border-t">
      {selectedFile && (
        <div className="mb-3 p-3 bg-emerald-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-gray-700">
              {selectedFile.name}
            </span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSelectedFile(null)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex gap-1">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost"
                className="text-gray-600 hover:text-gray-900"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleShareLocation}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Share Location
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleRecordVoice}
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Voice Message
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Textarea
          ref={textareaRef}
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={disabled || isUploading}
          className="flex-1 min-h-[44px] max-h-32 resize-none"
          rows={1}
        />

        <Button
          onClick={handleSend}
          disabled={(!message.trim() && !selectedFile) || disabled || isUploading}
          className={cn(
            "omega-primary text-white",
            isRecording && "bg-red-600 hover:bg-red-700"
          )}
          style={{ background: !isRecording ? '#ea00ea' : undefined }}
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isRecording ? (
            <Mic className="w-5 h-5" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>

      <p className="text-xs omega-text-primary mt-2 flex items-center gap-1">
        <Lock className="w-3 h-3" />
        End-to-end encrypted
      </p>
    </div>
  );
}