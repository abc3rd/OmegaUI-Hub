import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, AlertCircle, Lock } from "lucide-react";
import { useMessages } from "./hooks/useMessages";
import { useAiChat } from "./hooks/useAiChat";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";

export default function ChatView({ conversationId }) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const { data: messages = [], isLoading } = useMessages(conversationId);
  const { sendUserMessage, isProcessing, processingStatus, error, isConfigured } = useAiChat(conversationId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    const content = input.trim();
    setInput("");
    await sendUserMessage(content, messages);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversationId) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Lock className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            AI Communication Optimizer
          </h3>
          <p className="text-slate-500 text-sm max-w-md">
            Select a conversation or create a new one. UCP optimization reduces tokens and improves AI understanding.
          </p>
        </div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            AI Provider Not Configured
          </h3>
          <p className="text-slate-500 text-sm">
            Please configure your AI provider settings to start chatting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="border-b px-6 py-3 bg-slate-50">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Lock className="w-4 h-4 text-green-600" />
          <span>UCP optimization active • Messages stored locally</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className={i % 2 === 0 ? "flex justify-end" : "flex justify-start"}>
              <Skeleton className={`h-16 ${i % 2 === 0 ? "w-2/3" : "w-3/4"}`} />
            </div>
          ))
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <Lock className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">No messages yet</p>
            <p className="text-slate-400 text-xs mt-1">Start communicating with optimized AI translation</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-900"
                }`}
              >
                {msg.role === "user" ? (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <ReactMarkdown
                    className="text-sm prose prose-sm max-w-none prose-slate prose-invert:false"
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      code: ({ inline, children }) =>
                        inline ? (
                          <code className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-xs">
                            {children}
                          </code>
                        ) : (
                          <pre className="bg-slate-800 text-slate-100 rounded p-3 overflow-x-auto my-2">
                            <code>{children}</code>
                          </pre>
                        ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
                <p className={`text-xs mt-2 ${msg.role === "user" ? "text-slate-300" : "text-slate-500"}`}>
                  {format(new Date(msg.createdAt), "h:mm a")}
                </p>
              </div>
            </div>
          ))
        )}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl px-4 py-3 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
              <span className="text-sm text-slate-600">{processingStatus}</span>
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 text-red-700 rounded-lg px-4 py-2 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4 bg-slate-50">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isProcessing}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="bg-slate-900 hover:bg-slate-800"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}