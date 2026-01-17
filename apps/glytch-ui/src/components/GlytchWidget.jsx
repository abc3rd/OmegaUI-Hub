import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2, Maximize2, Mic, MicOff, Volume2, VolumeX, Radio } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import MicrophoneModal from "./seth/MicrophoneModal";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function GlytchWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'ai', text: "GLYTCH online. I'm your intelligent operations butler for SynCloud Connect. How may I assist you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [showMicModal, setShowMicModal] = useState(false);
    const [micMode, setMicMode] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

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

    // Load voices for TTS
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
                // Find the most natural sounding voice
                const preferredVoices = [
                    'Google UK English Male',
                    'Google US English',
                    'Microsoft David',
                    'Daniel',
                    'Alex',
                    'Samantha'
                ];
                let bestVoice = null;
                for (const pref of preferredVoices) {
                    bestVoice = availableVoices.find(v => v.name.includes(pref));
                    if (bestVoice) break;
                }
                setSelectedVoice(bestVoice || availableVoices[0]);
            }
        };
        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, []);

    // Speak function
    const speak = (text) => {
        if (isMuted || !selectedVoice) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = selectedVoice;
        utterance.pitch = 1.0;
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
    };

    // Initialize speech recognition
    const initRecognition = (mode) => {
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported by your browser.");
            return null;
        }
        
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = mode === 'live';
        
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            setInput(transcript);
            
            if (mode === 'live' && event.results[event.results.length - 1].isFinal) {
                setTimeout(() => {
                    if (transcript.trim()) {
                        handleSendWithVoice(transcript.trim());
                    }
                }, 1500);
            }
        };
        
        recognition.onend = () => {
            if (mode === 'live' && isListening) {
                try {
                    recognition.start();
                } catch (e) {
                    setIsListening(false);
                }
            } else {
                setIsListening(false);
            }
        };
        
        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            if (event.error !== 'no-speech') {
                setIsListening(false);
            }
        };
        
        return recognition;
    };

    const handleMicClick = () => {
        if (isListening) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
            setIsListening(false);
            setMicMode(null);
        } else {
            setShowMicModal(true);
        }
    };

    const handleMicModeSelect = (mode) => {
        setShowMicModal(false);
        setMicMode(mode);
        
        const recognition = initRecognition(mode);
        if (!recognition) return;
        
        recognitionRef.current = recognition;
        setInput('');
        
        try {
            recognition.start();
            setIsListening(true);
        } catch (e) {
            console.error("Failed to start recognition:", e);
            alert("Failed to access microphone. Please check permissions.");
        }
    };

    const handleSendWithVoice = async (text) => {
        const userMessage = text || input.trim();
        if (!userMessage || isLoading) return;
        
        setInput('');
        setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
        setIsLoading(true);

        try {
            const memory = await base44.entities.Learning.list();
            const memoryContext = memory.length > 0 
                ? `### User Memory:\n${memory.map(m => `- ${m.fact}`).join('\n')}\n` 
                : "";

            const systemPrompt = `You are GLYTCH, the intelligent operations butler for SynCloud Connect by Omega UI, LLC.

${memoryContext}

**BUTLER PROTOCOL:**
1. Execute tasks quickly, intelligently, and consistently
2. Maintain precision-engineered butler voice—calm, exact, proactive, reliable
3. Provide structured actions, insights, and recommendations
4. Keep responses brief but operationally focused (this is a chat widget)
5. Default to accuracy, security, and compliance

User query: "${userMessage}"

Respond as GLYTCH, the Omega UI operations butler:`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: systemPrompt,
                add_context_from_internet: true
            });

            setMessages(prev => [...prev, { sender: 'ai', text: response }]);
            speak(response);

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
            const errorMsg = "I'm having trouble connecting right now. Please try again.";
            setMessages(prev => [...prev, { sender: 'ai', text: errorMsg }]);
            speak(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        await handleSendWithVoice();
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
            <style>{`
                @keyframes syncloud-breathe-widget {
                    0%, 100% { background: linear-gradient(135deg, #0077B6, #48CAE4); }
                    25% { background: linear-gradient(135deg, #48CAE4, #00B4D8); }
                    50% { background: linear-gradient(135deg, #F4A261, #E9C46A); }
                    75% { background: linear-gradient(135deg, #E9C46A, #0077B6); }
                }
                .animate-syncloud-widget {
                    animation: syncloud-breathe-widget 8s ease-in-out infinite;
                }
            `}</style>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className={`${widgetSize} bg-[#030101] rounded-2xl shadow-2xl border-2 border-[#48CAE4]/50 overflow-hidden flex flex-col mb-4 transition-all duration-300`}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#0077B6] via-[#48CAE4] to-[#F4A261] p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full animate-syncloud-widget"></div>
                                <div>
                                    <span className="text-white font-bold text-sm">GLYTCH</span>
                                    <p className="text-white/70 text-xs">Operations Butler</p>
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

                        {/* Info */}
                        <div className="bg-[#48CAE4]/20 px-3 py-2 border-b border-[#48CAE4]/30">
                            <p className="text-[#48CAE4] text-xs">
                                🔮 Omega UI Intelligent Operations Butler | SynCloud Connect | Patent Pending
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
                                        <Bot className="w-6 h-6 text-[#48CAE4] flex-shrink-0 mt-1" />
                                    )}
                                    <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                        msg.sender === 'user' 
                                            ? 'bg-[#F4A261]/50 text-white' 
                                            : 'bg-white/10 text-white'
                                    }`}>
                                        {msg.text}
                                    </div>
                                    {msg.sender === 'user' && (
                                        <User className="w-6 h-6 text-[#F4A261] flex-shrink-0 mt-1" />
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-2">
                                    <Bot className="w-6 h-6 text-[#48CAE4] flex-shrink-0 mt-1" />
                                    <div className="bg-white/10 rounded-lg px-3 py-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-[#48CAE4]/30 bg-white/5">
                            {isListening && (
                                <div className={`mb-2 px-2 py-1 rounded text-xs text-center ${
                                    micMode === 'live' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                    {micMode === 'live' ? '🔴 LIVE - Speaking continuously' : '🎤 Recording...'}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Button 
                                    onClick={() => setIsMuted(!isMuted)}
                                    variant="ghost"
                                    size="icon"
                                    className={`h-9 w-9 ${isMuted ? 'text-red-400' : 'text-[#48CAE4]'}`}
                                    title={isMuted ? "Unmute GLYTCH" : "Mute GLYTCH"}
                                >
                                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                </Button>
                                <Button 
                                    onClick={handleMicClick}
                                    variant="ghost"
                                    size="icon"
                                    className={`h-9 w-9 transition-all ${
                                        isListening 
                                            ? micMode === 'live' 
                                                ? 'animate-pulse text-green-500 bg-green-500/20' 
                                                : 'animate-pulse text-red-500 bg-red-500/20'
                                            : 'text-[#F4A261] hover:bg-[#F4A261]/20'
                                    }`}
                                    title="Voice input"
                                >
                                    {isListening ? (
                                        micMode === 'live' ? <Radio className="h-4 w-4" /> : <MicOff className="h-4 w-4" />
                                    ) : (
                                        <Mic className="h-4 w-4" />
                                    )}
                                </Button>
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={isListening ? "Listening..." : "Ask GLYTCH..."}
                                    className="flex-1 bg-white/10 border-[#48CAE4]/50 text-white placeholder:text-gray-500 text-sm"
                                    disabled={isLoading}
                                />
                                <Button 
                                    onClick={handleSend}
                                    disabled={isLoading || !input.trim()}
                                    className="bg-gradient-to-r from-[#0077B6] via-[#48CAE4] to-[#F4A261] hover:opacity-90"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <MicrophoneModal
                isOpen={showMicModal}
                onClose={() => setShowMicModal(false)}
                onSelectMode={handleMicModeSelect}
            />

            <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`h-16 w-16 rounded-full animate-syncloud-widget shadow-lg ${isOpen ? 'ring-2 ring-white/50' : ''}`}
                >
                    {isOpen ? <X className="h-7 w-7 text-white" /> : <MessageCircle className="h-8 w-8 text-white" />}
                </Button>
            </motion.div>
        </div>
    );
}