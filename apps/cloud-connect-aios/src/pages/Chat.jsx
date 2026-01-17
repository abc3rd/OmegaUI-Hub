
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Thread, Message, UsageLog, User, Preset } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, Sparkles, Plus, PanelLeft } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import ThreadSidebar from "../components/chat/ThreadSidebar";
import MessageBubble from "../components/chat/MessageBubble";
import ChatInput from "../components/chat/ChatInput";

export default function ChatPage() {
  const [threads, setThreads] = useState([]);
  const [currentThread, setCurrentThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isThreadSidebarOpen, setIsThreadSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const loadThreads = useCallback(async () => {
    try {
      const user = await User.me();
      const data = await Thread.filter(
        { created_by: user.email }, 
        "-updated_date"
      );
      setThreads(data);
      
      // Only set currentThread if it's null and there are threads to set
      // This prevents overriding currentThread if it was intentionally set (e.g., via selection)
      if (!currentThread && data.length > 0) {
        setCurrentThread(data[0]);
      }
    } catch (error) {
      console.error("Error loading threads:", error);
      toast.error("Failed to load threads");
    }
  }, [currentThread]); // currentThread is a dependency because we check !currentThread to set it initially

  const loadMessages = useCallback(async () => {
    if (!currentThread) return;
    
    try {
      const data = await Message.filter(
        { thread_id: currentThread.id },
        "created_date"
      );
      setMessages(data);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    }
  }, [currentThread]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (currentThread) {
      loadMessages();
    }
  }, [currentThread, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createNewThread = async () => {
    try {
      const user = await User.me();
      const newThread = await Thread.create({
        workspace_id: "default", // You might want to implement workspace selection
        title: "New Thread",
        model: "gpt-4",
        created_by: user.email
      });
      
      setThreads(prev => [newThread, ...prev]);
      setCurrentThread(newThread);
      setMessages([]);
      toast.success("New thread created");
      setIsThreadSidebarOpen(false); // Close sidebar on new thread creation
    } catch (error) {
      console.error("Error creating thread:", error);
      toast.error("Failed to create thread");
    }
  };

  const generateTitle = (content) => {
    const words = content.split(' ').slice(0, 8);
    return words.join(' ') + (content.split(' ').length > 8 ? '...' : '');
  };

  const handleSendMessage = async ({ 
    content, 
    attachments = [], 
    preset_id, 
    kb_ids = [], 
    tool_ids = [], 
    temperature = 0.7, 
    top_p = 1 
  }) => {
    if (!currentThread) {
      await createNewThread();
      // After creating a new thread, the component will re-render, and this function will be called again with the new thread.
      // So, we return here to avoid processing the message before the thread is set.
      return; 
    }

    setIsLoading(true);
    setIsGenerating(true);
    setStreamingContent("");

    try {
      // Create user message
      const userMessage = await Message.create({
        thread_id: currentThread.id,
        role: "user",
        content: content,
        file_attachments: attachments?.map(a => a.url) || []
      });

      setMessages(prev => [...prev, userMessage]);

      // Update thread title if it's still "New Thread"
      if (currentThread.title === "New Thread") {
        const title = generateTitle(content);
        await Thread.update(currentThread.id, { title });
        setCurrentThread(prev => ({ ...prev, title }));
        await loadThreads(); // Reload threads to update sidebar with new title
      }

      // Update thread parameters
      await Thread.update(currentThread.id, {
        temperature,
        top_p,
        system_prompt_id: preset_id,
        tool_ids
      });

      // Get system prompt from preset
      let systemPrompt = "";
      if (preset_id) {
        const preset = await Preset.get(preset_id);
        systemPrompt = preset.system_prompt;
      }

      // Prepare context for LLM
      const conversationHistory = [...messages, userMessage];
      const contextMessages = conversationHistory
        .filter(m => m.role !== 'system')
        .slice(-10) // Last 10 messages for context
        .map(m => `${m.role}: ${m.content}`)
        .join('\n\n');

      let prompt = content;
      if (systemPrompt) {
        prompt = `${systemPrompt}\n\nConversation Context:\n${contextMessages}\n\nUser: ${content}\n\nAssistant:`;
      }

      // Add knowledge base context if enabled
      if (kb_ids.length > 0) {
        // TODO: Implement RAG search
        prompt = `[Knowledge Base Context Available]\n\n${prompt}`;
      }

      // Generate AI response
      const llmResponse = await InvokeLLM({
        prompt,
        add_context_from_internet: false,
        file_urls: attachments?.map(a => a.url)
      });

      // Create AI message
      const aiMessage = await Message.create({
        thread_id: currentThread.id,
        role: "assistant",
        content: llmResponse,
        model: currentThread.model || "gpt-4",
        usage: {
          prompt_tokens: Math.floor(prompt.length / 4),
          completion_tokens: Math.floor(llmResponse.length / 4),
          total_tokens: Math.floor((prompt.length + llmResponse.length) / 4)
        }
      });

      setMessages(prev => [...prev, aiMessage]);

      // Log usage
      const user = await User.me();
      const totalTokens = Math.floor((prompt.length + llmResponse.length) / 4);
      
      await UsageLog.create({
        user_id: user.id,
        workspace_id: currentThread.workspace_id,
        thread_id: currentThread.id,
        model: currentThread.model || "gpt-4",
        prompt_tokens: Math.floor(prompt.length / 4),
        completion_tokens: Math.floor(llmResponse.length / 4),
        cost_usd: totalTokens * 0.00003,
        response_ms: 1500 // Rough estimate
      });

      // Update user token usage
      await User.updateMyUserData({
        tokens_used_month: (user.tokens_used_month || 0) + totalTokens
      });

      toast.success("Message sent successfully");

    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
      setStreamingContent("");
    }
  };

  const handleEditMessage = (message) => {
    // TODO: Implement message editing
    toast.info("Message editing coming soon!");
  };

  const handleRegenerateMessage = async (message) => {
    // TODO: Implement message regeneration
    toast.info("Message regeneration coming soon!");
  };

  const handleDeleteThread = async (thread) => {
    try {
      // Delete all messages in the thread
      const threadMessages = await Message.filter({ thread_id: thread.id });
      for (const message of threadMessages) {
        await Message.delete(message.id);
      }
      
      // Delete the thread
      await Thread.delete(thread.id);
      
      // Refresh threads
      await loadThreads();
      
      // If deleted thread was current, select another one
      if (currentThread?.id === thread.id) {
        const remaining = threads.filter(t => t.id !== thread.id);
        setCurrentThread(remaining[0] || null);
        if(remaining.length === 0) {
          setMessages([]); // Clear messages if no thread is selected
        }
      }
      
      toast.success("Thread deleted successfully");
    } catch (error) {
      console.error("Error deleting thread:", error);
      toast.error("Failed to delete thread");
    }
  };

  const handleThreadSelect = (thread) => {
    setCurrentThread(thread);
    setIsThreadSidebarOpen(false); // Close sidebar on thread selection for mobile
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 flex-shrink-0 border-r border-gray-200">
        <ThreadSidebar
          threads={threads}
          currentThread={currentThread}
          onThreadSelect={handleThreadSelect}
          onNewThread={createNewThread}
          onThreadUpdate={loadThreads}
          onThreadDelete={handleDeleteThread}
        />
      </div>

      <Sheet open={isThreadSidebarOpen} onOpenChange={setIsThreadSidebarOpen}>
        {/* Mobile Sidebar (Sheet) */}
        <SheetContent side="left" className="p-0 w-80">
          <ThreadSidebar
            threads={threads}
            currentThread={currentThread}
            onThreadSelect={handleThreadSelect}
            onNewThread={createNewThread}
            onThreadUpdate={loadThreads}
            onThreadDelete={handleDeleteThread}
          />
        </SheetContent>
        
        <div className="flex-1 flex flex-col">
          {currentThread ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
                      <PanelLeft className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <div>
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#B4009E]" />
                      {currentThread.title}
                    </h2>
                    <div className="hidden sm:flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>Model: {currentThread.model}</span>
                      <span>Temp: {currentThread.temperature}</span>
                      <span>Messages: {messages.length}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                  <Settings className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 bg-gray-50">
                <div className="max-w-4xl mx-auto py-4 sm:py-6">
                  {messages.map((message, index) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      onCopy={() => toast.success("Message copied")}
                      onEdit={handleEditMessage}
                      onRegenerate={handleRegenerateMessage}
                      isLast={index === messages.length - 1}
                    />
                  ))}
                  
                  {/* Streaming Message */}
                  {isGenerating && streamingContent && (
                    <MessageBubble
                      message={{
                        role: 'assistant',
                        content: streamingContent,
                        created_date: new Date().toISOString(), // Provide a mock date
                        id: 'streaming-temp' // Provide a temp ID
                      }}
                      showActions={false}
                    />
                  )}
                  
                  {/* Thinking Indicator */}
                  {isGenerating && !streamingContent && (
                    <div className="flex gap-4 p-6">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#B4009E] to-[#02B6CE] flex items-center justify-center flex-shrink-0">
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-2">GLYTCH AI</div>
                        <div className="text-gray-500">Thinking...</div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <div className="max-w-4xl mx-auto w-full p-2 sm:p-4 bg-white">
                <ChatInput
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  onStopGeneration={() => setIsGenerating(false)}
                  currentThread={currentThread}
                  placeholder="Message GLYTCH AI..."
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center max-w-md px-4">
                <div className="w-20 h-20 bg-gradient-to-r from-[#B4009E] to-[#02B6CE] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome to GLYTCH AI
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Start a new conversation to begin chatting with your AI assistant. 
                  Configure presets, knowledge bases, and tools to customize your experience.
                </p>
                <Button 
                  onClick={createNewThread}
                  className="bg-gradient-to-r from-[#B4009E] to-[#02B6CE] hover:from-[#B4009E]/90 hover:to-[#02B6CE]/90 px-8 py-3"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Start New Thread
                </Button>
              </div>
            </div>
          )}
        </div>
      </Sheet>
    </div>
  );
}
