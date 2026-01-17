
import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Loader2,
  Sparkles,
  Bot
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function ChatPage() {
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [newConvTitle, setNewConvTitle] = useState("");
  const [showNewConv, setShowNewConv] = useState(false);
  const scrollRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => base44.entities.Conversation.filter({ created_by: user?.email }, "-created_date"),
    enabled: !!user,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: () => base44.entities.Message.filter({ conversation_id: selectedConversation.id }, "created_date"),
    enabled: !!selectedConversation,
  });

  const { data: trainingData = [] } = useQuery({
    queryKey: ['trainingData'],
    queryFn: () => base44.entities.TrainingData.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const createConversationMutation = useMutation({
    mutationFn: (title) => base44.entities.Conversation.create({
      title,
      participant_name: user?.full_name,
      message_count: 0
    }),
    onSuccess: (newConv) => {
      queryClient.invalidateQueries(['conversations']);
      setSelectedConversation(newConv);
      setShowNewConv(false);
      setNewConvTitle("");
      toast.success("New conversation started");
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ message }) => {
      await base44.entities.Message.create({
        conversation_id: selectedConversation.id,
        role: "user",
        content: message
      });

      const contextData = trainingData
        .filter(d => d.processing_status === 'completed')
        .map(d => `${d.title}: ${d.transcription || 'Audio content'}`)
        .join('\n\n');

      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a Legacy AI trained on personal data. Respond as if you are ${user?.full_name}, using their voice, knowledge, and personality based on the training data below.

Training Data Context:
${contextData || 'No training data available yet. Respond warmly as if you are learning about yourself.'}

User's question: ${message}

Respond in first person, authentically, as if you are ${user?.full_name} sharing your thoughts, memories, or advice.`,
      });

      return base44.entities.Message.create({
        conversation_id: selectedConversation.id,
        role: "assistant",
        content: typeof aiResponse === 'string' ? aiResponse : aiResponse.output || "I'm still learning to respond. Please add more training data."
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['messages', selectedConversation?.id]);
      queryClient.invalidateQueries(['conversations']);
      setMessageInput("");
    },
    onError: (error) => {
      toast.error("Failed to send message: " + error.message);
    }
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;
    sendMessageMutation.mutate({ message: messageInput });
  };

  if ((user?.ai_readiness_score || 0) < 25) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800 mt-12">
            <CardContent className="p-12 text-center">
              <Sparkles className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">
                Your AI Needs More Training
              </h2>
              <p className="text-slate-300 mb-8 max-w-md mx-auto">
                Upload more voice recordings and text to improve your AI's ability to respond authentically.
                Current readiness: {user?.ai_readiness_score || 0}%
              </p>
              <Link to={createPageUrl("Upload")}>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Upload Training Data
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-950/50">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-white font-semibold mb-3">Conversations</h2>
          {showNewConv ? (
            <div className="space-y-2">
              <Input
                value={newConvTitle}
                onChange={(e) => setNewConvTitle(e.target.value)}
                placeholder="Conversation title..."
                className="bg-slate-950 border-slate-700 text-white text-sm"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => createConversationMutation.mutate(newConvTitle)}
                  disabled={!newConvTitle.trim()}
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Create
                </Button>
                <Button
                  onClick={() => {
                    setShowNewConv(false);
                    setNewConvTitle("");
                  }}
                  size="sm"
                  variant="outline"
                  className="border-slate-700 text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setShowNewConv(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Conversation
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  selectedConversation?.id === conv.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-900/50 text-slate-300 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-medium text-sm truncate">{conv.title}</span>
                </div>
                {conv.last_message_preview && (
                  <p className="text-xs opacity-70 truncate">{conv.last_message_preview}</p>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {!selectedConversation ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Bot className="w-20 h-20 text-slate-700 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Chat with Your Legacy AI
              </h3>
              <p className="text-slate-400 mb-6">
                Select a conversation or start a new one
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-900 text-slate-100 border border-slate-800'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        ) : (
                          <ReactMarkdown className="text-sm prose prose-sm prose-invert max-w-none">
                            {msg.content}
                          </ReactMarkdown>
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold">
                            {user?.full_name?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {sendMessageMutation.isPending && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                    <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl px-4 py-3">
                      <p className="text-sm text-slate-400">Thinking...</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-slate-800 p-4 bg-slate-950/50 backdrop-blur-xl">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Ask your Legacy AI anything..."
                  disabled={sendMessageMutation.isPending}
                  className="flex-1 bg-slate-900 border-slate-700 text-white"
                />
                <Button
                  type="submit"
                  disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
