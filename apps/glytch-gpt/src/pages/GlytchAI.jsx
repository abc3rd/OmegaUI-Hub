import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Send, 
    Sparkles, 
    Zap, 
    Plus, 
    MessageSquare,
    TrendingDown,
    Loader2,
    Settings,
    LogIn,
    User,
    LogOut,
    Brain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProviderSettings from "@/components/settings/ProviderSettings";
import LearningPanel from "@/components/learning/LearningPanel";
import SaveInteractionButton from "@/components/learning/SaveInteractionButton";

export default function GlytchAI() {
    const [user, setUser] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [message, setMessage] = useState("");
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [mode, setMode] = useState("standard");
    const [statelessMode, setStatelessMode] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showLearning, setShowLearning] = useState(false);
    const [currentTokenStats, setCurrentTokenStats] = useState(null);
    const messagesEndRef = useRef(null);
    const queryClient = useQueryClient();

    // Load user learnings
    const { data: learnings = [] } = useQuery({
        queryKey: ['learnings', user?.id],
        queryFn: () => base44.entities.Learning.list('-created_date', 20),
        enabled: !!user,
    });

    // Check authentication
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoadingAuth(false);
            }
        };
        checkAuth();
    }, []);

    const { data: conversations = [], isLoading: isLoadingConversations } = useQuery({
        queryKey: ['conversations', user?.id],
        queryFn: () => base44.entities.Conversation.filter({ created_by: user.email }),
        enabled: !!user,
    });

    const createConversationMutation = useMutation({
        mutationFn: (data) => base44.entities.Conversation.create(data),
        onSuccess: (newConv) => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            setSelectedConversation(newConv);
        },
    });

    const updateConversationMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Conversation.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [selectedConversation?.messages]);

    const handleNewConversation = () => {
        createConversationMutation.mutate({
            title: "New Glytch Session",
            mode: mode,
            messages: [],
            total_tokens_used: 0,
            tokens_saved: 0
        });
    };

    const applyUCPProtocol = (text) => {
        // UCP (Universal Communication Protocol) compression
        // Reduces common patterns, uses abbreviations, and optimizes structure
        let compressed = text;
        
        // Common word replacements
        const replacements = {
            'please': 'pls',
            'thank you': 'thx',
            'thanks': 'thx',
            'you': 'u',
            'your': 'ur',
            'because': 'bc',
            'without': 'w/o',
            'with': 'w/',
            'about': 'abt',
            'through': 'thru',
            'between': 'btwn',
            'information': 'info',
            'application': 'app',
            'approximately': 'approx',
            'understand': 'und',
            'understand.': 'und.',
            'question': 'q',
            'answer': 'ans',
            'example': 'ex',
            'someone': 's1',
            'anyone': 'any1',
            'something': 'sth',
            'nothing': 'nth',
            'everything': 'evth'
        };

        // Apply replacements
        for (const [full, abbr] of Object.entries(replacements)) {
            const regex = new RegExp(`\\b${full}\\b`, 'gi');
            compressed = compressed.replace(regex, abbr);
        }

        // Remove extra spaces
        compressed = compressed.replace(/\s+/g, ' ').trim();
        
        // Estimate token savings (roughly 20-30% reduction)
        const originalTokens = Math.ceil(text.length / 4);
        const compressedTokens = Math.ceil(compressed.length / 4);
        const saved = originalTokens - compressedTokens;
        
        return { compressed, originalTokens, compressedTokens, saved };
    };

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedConversation || !user) return;

        setIsProcessing(true);
        const sessionId = user.id;
        
        try {
            const startTime = Date.now();
            let response, inputTokens, outputTokens, totalTokens, modelUsed;

            // Build learned context
            const learnedContext = learnings.length > 0 
                ? `\n\nUser preferences and learned facts:\n${learnings.map(l => `- ${l.fact}`).join('\n')}`
                : '';

            if (selectedConversation.mode === "ucp" && !statelessMode) {
                // UCP Compile → Execute flow with learned context
                const compileResult = await base44.functions.invoke('ucpCompile', {
                    prompt: message + learnedContext,
                    session_id: sessionId
                });

                const packetId = compileResult.data.packet_id;
                
                const executeResult = await base44.functions.invoke('ucpExecute', {
                    packet_id: packetId,
                    session_id: sessionId,
                    input: "",
                    tier: "public"
                });

                response = executeResult.data.text;
                inputTokens = executeResult.data.usage.prompt_tokens;
                outputTokens = executeResult.data.usage.completion_tokens;
                totalTokens = executeResult.data.usage.total_tokens;
                modelUsed = executeResult.data.model_used;
            } else {
                // Standard or Stateless mode with learned context
                const promptToSend = message + learnedContext;
                const result = await base44.integrations.Core.InvokeLLM({
                    prompt: promptToSend,
                    add_context_from_internet: false
                });

                response = result;
                inputTokens = Math.ceil(promptToSend.length / 4);
                outputTokens = Math.ceil(response.length / 4);
                totalTokens = inputTokens + outputTokens;
                modelUsed = "gpt-4o-mini";
            }

            const latency = Date.now() - startTime;

            // Update token stats for dashboard
            setCurrentTokenStats({
                input: inputTokens,
                output: outputTokens,
                total: totalTokens,
                latency,
                model: modelUsed
            });

            const userMessage = {
                role: "user",
                content: message,
                tokens: inputTokens,
                timestamp: new Date().toISOString()
            };

            const assistantMessage = {
                role: "assistant",
                content: response,
                tokens: outputTokens,
                timestamp: new Date().toISOString()
            };

            // Only update conversation if not in stateless mode
            if (!statelessMode) {
                const updatedMessages = [
                    ...(selectedConversation.messages || []),
                    userMessage,
                    assistantMessage
                ];

                const totalConvTokens = selectedConversation.total_tokens_used + totalTokens;

                await updateConversationMutation.mutateAsync({
                    id: selectedConversation.id,
                    data: {
                        messages: updatedMessages,
                        total_tokens_used: totalConvTokens,
                        title: selectedConversation.messages?.length === 0 
                            ? message.substring(0, 50) 
                            : selectedConversation.title
                    }
                });

                setSelectedConversation({
                    ...selectedConversation,
                    messages: updatedMessages,
                    total_tokens_used: totalConvTokens
                });
            } else {
                // In stateless mode, just show the current exchange
                setSelectedConversation({
                    ...selectedConversation,
                    messages: [userMessage, assistantMessage]
                });
            }

            setMessage("");

            // Auto-extract learnings every 5 messages
            if (!statelessMode && selectedConversation.messages?.length > 0 && 
                selectedConversation.messages.length % 5 === 0) {
                try {
                    await base44.functions.invoke('extractLearning', {
                        messages: selectedConversation.messages.slice(-5),
                        conversation_id: selectedConversation.id
                    });
                    queryClient.invalidateQueries({ queryKey: ['learnings'] });
                } catch (err) {
                    console.error('Failed to auto-extract learning:', err);
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Show loading state
    if (isLoadingAuth) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                >
                    <Loader2 className="w-12 h-12 text-[#ea00ea] animate-spin mx-auto mb-4" />
                    <p className="text-[#c3c3c3]/60">Loading...</p>
                </motion.div>
            </div>
        );
    }

    // Show login prompt if not authenticated
    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full"
                >
                    <Card className="bg-black/50 border-[#ea00ea]/30 backdrop-blur-xl p-8">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#ea00ea] to-[#c3c3c3] flex items-center justify-center shadow-[0_0_40px_rgba(234,0,234,0.5)]">
                                <LogIn className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ea00ea] via-[#c3c3c3] to-[#ea00ea] bg-clip-text text-transparent mb-3">
                                GLYTCH AI
                            </h1>
                            <p className="text-[#c3c3c3]/70 mb-6">
                                Sign in to access your personal AI workspace with chat history, UCP protocol, and custom settings.
                            </p>
                            <div className="space-y-3">
                                <Button
                                    onClick={() => base44.auth.redirectToLogin()}
                                    className="w-full bg-gradient-to-r from-[#ea00ea] to-[#c3c3c3] hover:shadow-[0_0_30px_rgba(234,0,234,0.6)] transition-all h-12"
                                >
                                    <LogIn className="w-5 h-5 mr-2" />
                                    Sign In
                                </Button>
                                <p className="text-xs text-[#c3c3c3]/50">
                                    Your conversations and settings are private and secure.
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black">
            <div className="flex h-screen">
                {/* Sidebar */}
                <motion.div 
                    initial={{ x: -300 }}
                    animate={{ x: 0 }}
                    className="w-80 border-r border-[#ea00ea]/30 bg-black/50 backdrop-blur-xl p-4 overflow-y-auto"
                >
                    <div className="mb-6">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#ea00ea] via-[#c3c3c3] to-[#ea00ea] bg-clip-text text-transparent mb-2">
                            GLYTCH AI
                        </h1>
                        <p className="text-[#c3c3c3]/70 text-sm mb-3">
                            Next-gen intelligence protocol
                        </p>
                        <div className="flex items-center justify-between bg-black/30 border border-[#ea00ea]/20 rounded-lg p-2">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-[#ea00ea]" />
                                <span className="text-[#c3c3c3] text-sm truncate">{user.email}</span>
                            </div>
                            <Button
                                onClick={() => base44.auth.logout()}
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-[#c3c3c3]/60 hover:text-red-400"
                                title="Sign out"
                            >
                                <LogOut className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>

                    {/* Mode Selector */}
                    <Card className="bg-gradient-to-br from-[#ea00ea]/10 to-transparent border-[#ea00ea]/30 p-4 mb-4">
                        <p className="text-[#c3c3c3] text-xs mb-3 uppercase tracking-wider">AI Mode</p>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                onClick={() => setMode("standard")}
                                className={`${
                                    mode === "standard"
                                        ? "bg-gradient-to-r from-[#ea00ea] to-[#c3c3c3] text-white shadow-[0_0_20px_rgba(234,0,234,0.5)]"
                                        : "bg-black/50 text-[#c3c3c3] border border-[#ea00ea]/30"
                                }`}
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Standard
                            </Button>
                            <Button
                                onClick={() => setMode("ucp")}
                                className={`${
                                    mode === "ucp"
                                        ? "bg-gradient-to-r from-[#ea00ea] to-[#c3c3c3] text-white shadow-[0_0_20px_rgba(234,0,234,0.5)]"
                                        : "bg-black/50 text-[#c3c3c3] border border-[#ea00ea]/30"
                                }`}
                            >
                                <Zap className="w-4 h-4 mr-2" />
                                UCP
                            </Button>
                        </div>
                        {mode === "ucp" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-3 pt-3 border-t border-[#ea00ea]/20"
                            >
                                <div className="flex items-center gap-2 text-xs text-[#ea00ea]">
                                    <TrendingDown className="w-3 h-3" />
                                    <span>UCP Compile → Execute flow</span>
                                </div>
                                <p className="text-[#c3c3c3]/60 text-xs mt-1">
                                    Server-side packet caching for efficiency
                                </p>
                            </motion.div>
                        )}
                    </Card>

                    {/* Stateless Mode Toggle */}
                    <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/30 p-4 mb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#c3c3c3] text-sm font-semibold">Stateless Mode</p>
                                <p className="text-[#c3c3c3]/60 text-xs mt-1">No chat history (prevents token bloat)</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={statelessMode}
                                    onChange={(e) => setStatelessMode(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-[#ea00ea] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#ea00ea] peer-checked:to-[#c3c3c3]"></div>
                            </label>
                        </div>
                    </Card>

                    <div className="space-y-2 mb-4">
                        <Button
                            onClick={handleNewConversation}
                            className="w-full bg-gradient-to-r from-[#ea00ea] to-[#c3c3c3] hover:shadow-[0_0_30px_rgba(234,0,234,0.6)] transition-all"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Session
                        </Button>
                        <Button
                            onClick={() => setShowLearning(true)}
                            variant="outline"
                            className="w-full border-[#ea00ea]/30 text-[#c3c3c3] hover:bg-[#ea00ea]/10"
                        >
                            <Brain className="w-4 h-4 mr-2" />
                            Learning ({learnings.length})
                        </Button>
                    </div>

                    {/* Conversations List */}
                    <div className="space-y-2">
                        {isLoadingConversations ? (
                            <div className="text-center py-8">
                                <Loader2 className="w-6 h-6 text-[#ea00ea] animate-spin mx-auto" />
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="text-center py-8 text-[#c3c3c3]/50 text-sm">
                                No conversations yet
                            </div>
                        ) : (
                            conversations.map((conv) => (
                            <motion.div
                                key={conv.id}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setSelectedConversation(conv)}
                                className={`p-3 rounded-lg cursor-pointer transition-all ${
                                    selectedConversation?.id === conv.id
                                        ? "bg-gradient-to-r from-[#ea00ea]/20 to-transparent border-l-4 border-[#ea00ea]"
                                        : "bg-black/30 hover:bg-[#ea00ea]/10 border-l-4 border-transparent"
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[#c3c3c3] text-sm truncate">
                                            {conv.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge className={`text-xs ${
                                                conv.mode === "ucp"
                                                    ? "bg-[#ea00ea]/20 text-[#ea00ea] border-[#ea00ea]/50"
                                                    : "bg-[#c3c3c3]/20 text-[#c3c3c3] border-[#c3c3c3]/50"
                                            }`}>
                                                {conv.mode === "ucp" ? "UCP" : "STD"}
                                            </Badge>
                                            {conv.mode === "ucp" && conv.tokens_saved > 0 && (
                                                <span className="text-[#ea00ea] text-xs flex items-center gap-1">
                                                    <TrendingDown className="w-3 h-3" />
                                                    {conv.tokens_saved}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <MessageSquare className="w-4 h-4 text-[#c3c3c3]/50" />
                                </div>
                            </motion.div>
                        ))
                        )}
                    </div>
                </motion.div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                    {selectedConversation ? (
                        <>
                            {/* Header */}
                            <div className="border-b border-[#ea00ea]/30 bg-black/50 backdrop-blur-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-[#c3c3c3] text-lg font-semibold">
                                            {selectedConversation.title}
                                        </h2>
                                        <div className="flex items-center gap-4 mt-1">
                                            <Badge className={`${
                                                selectedConversation.mode === "ucp"
                                                    ? "bg-gradient-to-r from-[#ea00ea] to-[#c3c3c3]"
                                                    : "bg-[#c3c3c3]/20 text-[#c3c3c3]"
                                            }`}>
                                                {selectedConversation.mode === "ucp" ? "UCP Enhanced" : "Standard Mode"}
                                            </Badge>
                                            {statelessMode && (
                                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                                                    Stateless
                                                </Badge>
                                            )}
                                            {!statelessMode && (
                                                <span className="text-[#c3c3c3]/60 text-sm">
                                                    {selectedConversation.total_tokens_used} tokens
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => setShowSettings(true)}
                                        variant="ghost"
                                        size="icon"
                                        className="text-[#c3c3c3] hover:text-[#ea00ea]"
                                    >
                                        <Settings className="w-5 h-5" />
                                    </Button>
                                </div>

                                {/* Token Dashboard */}
                                {currentTokenStats && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 grid grid-cols-5 gap-2"
                                    >
                                        <Card className="bg-black/50 border-[#ea00ea]/20 p-2">
                                            <p className="text-[#c3c3c3]/60 text-xs">Input</p>
                                            <p className="text-[#ea00ea] font-mono text-sm">{currentTokenStats.input}</p>
                                        </Card>
                                        <Card className="bg-black/50 border-[#ea00ea]/20 p-2">
                                            <p className="text-[#c3c3c3]/60 text-xs">Output</p>
                                            <p className="text-[#ea00ea] font-mono text-sm">{currentTokenStats.output}</p>
                                        </Card>
                                        <Card className="bg-black/50 border-[#ea00ea]/20 p-2">
                                            <p className="text-[#c3c3c3]/60 text-xs">Total</p>
                                            <p className="text-[#c3c3c3] font-mono text-sm">{currentTokenStats.total}</p>
                                        </Card>
                                        <Card className="bg-black/50 border-[#ea00ea]/20 p-2">
                                            <p className="text-[#c3c3c3]/60 text-xs">Latency</p>
                                            <p className="text-green-400 font-mono text-sm">{currentTokenStats.latency}ms</p>
                                        </Card>
                                        <Card className="bg-black/50 border-[#ea00ea]/20 p-2">
                                            <p className="text-[#c3c3c3]/60 text-xs">Model</p>
                                            <p className="text-blue-400 font-mono text-xs truncate" title={currentTokenStats.model}>
                                                {currentTokenStats.model?.replace('gpt-', '')}
                                            </p>
                                        </Card>
                                    </motion.div>
                                )}
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                <AnimatePresence>
                                    {selectedConversation.messages?.map((msg, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <Card className={`max-w-2xl p-4 ${
                                               msg.role === "user"
                                                   ? "bg-gradient-to-br from-[#ea00ea] to-[#c3c3c3] text-white shadow-[0_0_20px_rgba(234,0,234,0.3)]"
                                                   : "bg-black/50 border-[#ea00ea]/30 text-[#c3c3c3]"
                                            }`}>
                                               <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                   {msg.content}
                                               </p>
                                               {msg.tokens && (
                                                   <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                                                       <span className={`text-xs ${
                                                           msg.role === "user" ? "text-white/70" : "text-[#c3c3c3]/60"
                                                       }`}>
                                                           {msg.tokens} tokens
                                                       </span>
                                                       {msg.role === "assistant" && idx > 0 && (
                                                           <SaveInteractionButton
                                                               message={selectedConversation.messages[idx - 1]?.content || ""}
                                                               output={msg.content}
                                                           />
                                                       )}
                                                   </div>
                                               )}
                                            </Card>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="border-t border-[#ea00ea]/30 bg-black/50 backdrop-blur-xl p-4">
                                <div className="flex gap-3">
                                    <Input
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && !isProcessing && handleSendMessage()}
                                        placeholder="Message Glytch AI..."
                                        disabled={isProcessing}
                                        className="flex-1 bg-black/50 border-[#ea00ea]/30 text-[#c3c3c3] placeholder:text-[#c3c3c3]/40 focus:border-[#ea00ea] focus:ring-[#ea00ea]/50"
                                    />
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={!message.trim() || isProcessing}
                                        className="bg-gradient-to-r from-[#ea00ea] to-[#c3c3c3] hover:shadow-[0_0_30px_rgba(234,0,234,0.6)] transition-all disabled:opacity-50"
                                    >
                                        {isProcessing ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#ea00ea] to-[#c3c3c3] flex items-center justify-center shadow-[0_0_40px_rgba(234,0,234,0.5)]">
                                    <Sparkles className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#ea00ea] to-[#c3c3c3] bg-clip-text text-transparent mb-2">
                                    Welcome to Glytch AI
                                </h2>
                                <p className="text-[#c3c3c3]/60 mb-6">
                                    Select a conversation or start a new session
                                </p>
                                <Button
                                    onClick={handleNewConversation}
                                    className="bg-gradient-to-r from-[#ea00ea] to-[#c3c3c3] hover:shadow-[0_0_30px_rgba(234,0,234,0.6)] transition-all"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Session
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Settings Drawer */}
            <AnimatePresence>
                {showSettings && (
                    <ProviderSettings onClose={() => setShowSettings(false)} />
                )}
            </AnimatePresence>

            {/* Learning Panel */}
            <AnimatePresence>
                {showLearning && (
                    <LearningPanel onClose={() => setShowLearning(false)} userId={user?.id} />
                )}
            </AnimatePresence>
        </div>
    );
}