import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Send, 
  Loader2,
  Paperclip,
  X
} from "lucide-react";
import MessageBubble from "./MessageBubble";

export default function AgentChat({ agent, conversation, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const Icon = agent.icon;

  useEffect(() => {
    if (conversation?.messages) {
      setMessages(conversation.messages);
    }

    // Subscribe to real-time updates
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages);
      scrollToBottom();
    });

    return () => {
      unsubscribe();
    };
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return;

    setSending(true);
    try {
      const messageData = {
        role: "user",
        content: input.trim()
      };

      if (uploadedFiles.length > 0) {
        messageData.file_urls = uploadedFiles;
      }

      await base44.agents.addMessage(conversation, messageData);
      
      setInput("");
      setUploadedFiles([]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setSending(false);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const fileUrls = results.map(r => r.file_url);
      setUploadedFiles([...uploadedFiles, ...fileUrls]);
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const removeFile = (url) => {
    setUploadedFiles(uploadedFiles.filter(f => f !== url));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-6 lg:p-8 h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" className="dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${agent.color} rounded-lg flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{agent.displayName}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{agent.description}</p>
            </div>
          </div>
        </div>
        <Badge variant="secondary" className={`dark:text-slate-300 dark:bg-slate-800`}>
          {messages.length} messages
        </Badge>
      </div>

      {/* Messages */}
      <Card className="flex-1 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden bg-white dark:bg-slate-950">
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className={`w-20 h-20 ${agent.bgColor} rounded-full flex items-center justify-center mb-4`}>
                <Icon className={`w-10 h-10 ${agent.textColor}`} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Start a conversation with {agent.displayName}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md">
                {agent.description}
              </p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <MessageBubble key={index} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </CardContent>

        {/* Input Area */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900">
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {uploadedFiles.map((url, idx) => (
                <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 pr-1">
                  <Paperclip className="w-3 h-3 mr-1" />
                  File {idx + 1}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 hover:bg-blue-200 dark:hover:bg-blue-800/50"
                    onClick={() => removeFile(url)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              size="icon"
              className="dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Shift+Enter for new line)"
              className="flex-1 min-h-[60px] max-h-[200px] resize-none bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
              disabled={sending}
            />
            <Button
              onClick={handleSend}
              disabled={sending || (!input.trim() && uploadedFiles.length === 0)}
              className="self-end bg-slate-800 dark:bg-slate-100 hover:bg-slate-700 dark:hover:bg-slate-200 text-white dark:text-slate-900"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}