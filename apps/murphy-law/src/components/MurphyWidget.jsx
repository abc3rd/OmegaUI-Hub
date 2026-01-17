import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2, Maximize2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

export default function MurphyWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'ai', text: "Hi! I'm Murphy, your UCRASH AI Legal Aid Volunteer. How can I help you today? Remember, I provide legal information but I'm not a licensed attorney." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const user = await base44.auth.me();
                setCurrentUser(user);
            } catch (e) {
                console.log("User not logged in");
            }
        };
        loadUser();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
        setIsLoading(true);

        try {
            const memory = await base44.entities.Learning.list();
            const memoryContext = memory.length > 0 
                ? `### User Memory:\n${memory.map(m => `- ${m.fact}`).join('\n')}\n` 
                : "";

            const systemPrompt = `You are Murphy, the UCRASH AI Legal Aid Volunteer. You provide legal information but are NOT a licensed attorney.

${memoryContext}

**IMPORTANT RULES:**
1. Always remind users you're an AI volunteer, NOT a licensed attorney
2. Provide helpful legal information but emphasize consulting a real attorney
3. Be friendly, professional, and concise
4. Keep responses brief but informative (this is a chat widget)

User question: "${userMessage}"

Provide a helpful, concise response:`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: systemPrompt,
                add_context_from_internet: true
            });

            setMessages(prev => [...prev, { sender: 'ai', text: response }]);

            // Learn from interaction
            try {
                const learningResult = await base44.integrations.Core.InvokeLLM({
                    prompt: `Extract ONE key fact to remember about this user from: "${userMessage}" - or respond "null" if none.`
                });
                if (learningResult && learningResult.toLowerCase().trim() !== 'null') {
                    await base44.entities.Learning.create({ fact: learningResult });
                }
            } catch (e) {
                console.log("Learning failed:", e);
            }

        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { 
                sender: 'ai', 
                text: "I'm having trouble connecting right now. Please try again or visit our full Murphy assistant for more help." 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const widgetSize = isExpanded 
        ? "w-[500px] h-[700px]" 
        : "w-[380px] h-[500px]";

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className={`${widgetSize} bg-[#030101] rounded-2xl shadow-2xl border-2 border-[#c61c39]/50 overflow-hidden flex flex-col mb-4 transition-all duration-300`}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#c61c39] to-[#155EEF] p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <a 
                                    href="https://www.ucrash.claims" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                >
                                    <img 
                                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691be92ffa93cfd887f03662/8740d5677_background-ucrash-999kb.png" 
                                        alt="UCRASH" 
                                        className="h-8 w-auto"
                                    />
                                </a>
                                <div>
                                    <span className="text-white font-bold text-sm">Murphy AI</span>
                                    <p className="text-white/70 text-xs">Legal Aid Volunteer</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="text-white hover:bg-white/20 h-8 w-8"
                                >
                                    {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => setIsOpen(false)}
                                    className="text-white hover:bg-white/20 h-8 w-8"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="bg-[#c61c39]/20 px-3 py-2 border-b border-[#c61c39]/30">
                            <p className="text-[#c61c39] text-xs">
                                ⚖️ Murphy is an AI volunteer, NOT a licensed attorney. Consult a professional for legal decisions.
                            </p>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                            {messages.map((msg, index) => (
                                <div 
                                    key={index}
                                    className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}
                                >
                                    {msg.sender === 'ai' && (
                                        <Bot className="w-6 h-6 text-[#c61c39] flex-shrink-0 mt-1" />
                                    )}
                                    <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                        msg.sender === 'user' 
                                            ? 'bg-[#155EEF]/50 text-white' 
                                            : 'bg-white/10 text-white'
                                    }`}>
                                        {msg.text}
                                    </div>
                                    {msg.sender === 'user' && (
                                        <User className="w-6 h-6 text-[#155EEF] flex-shrink-0 mt-1" />
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-2">
                                    <Bot className="w-6 h-6 text-[#c61c39] flex-shrink-0 mt-1" />
                                    <div className="bg-white/10 rounded-lg px-3 py-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-[#c61c39]/30 bg-white/5">
                            <div className="flex gap-2">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask Murphy..."
                                    className="flex-1 bg-white/10 border-[#155EEF]/50 text-white placeholder:text-gray-500 text-sm"
                                    disabled={isLoading}
                                />
                                <Button 
                                    onClick={handleSend}
                                    disabled={isLoading || !input.trim()}
                                    className="bg-gradient-to-r from-[#c61c39] to-[#155EEF] hover:opacity-90"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`h-16 w-16 rounded-full bg-gradient-to-r from-[#c61c39] to-[#155EEF] hover:from-[#c61c39]/90 hover:to-[#155EEF]/90 shadow-lg ${isOpen ? 'ring-2 ring-white/50' : ''}`}
                >
                    {isOpen ? <X className="h-7 w-7 text-white" /> : <MessageCircle className="h-8 w-8 text-white" />}
                </Button>
            </motion.div>
        </div>
    );
}