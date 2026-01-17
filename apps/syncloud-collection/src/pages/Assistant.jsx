import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, CornerDownLeft, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import MessageBubble from '@/components/assistant/MessageBubble';
import { toast } from 'sonner';

const GLYTCH_ICON_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bdbae61875d59c7d61ef06/42f53f232_splash_with_glytch.png";

export default function AssistantPage() {
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [initError, setInitError] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const messagesEndRef = useRef(null);
    const unsubscribeRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const initConversation = async () => {
        setIsInitializing(true);
        setInitError(null);
        
        try {
            console.log("Checking base44.agents availability...");
            
            if (!base44 || !base44.agents) {
                throw new Error("GLYTCH Agent SDK is not available. Please ensure the platform is properly configured.");
            }
            
            if (!base44.agents.createConversation) {
                throw new Error("Agent creation function is not available. Please contact support.");
            }
            
            console.log("Creating conversation with glytch_agent...");
            const conv = await base44.agents.createConversation({ 
                agent_name: 'glytch_agent',
                metadata: {
                    source: 'assistant_page',
                    timestamp: new Date().toISOString()
                }
            });
            
            console.log("Conversation response:", conv);
            
            if (!conv) {
                throw new Error("The GLYTCH agent did not return a conversation. The agent may not be configured yet.");
            }
            
            if (!conv.id) {
                throw new Error("Invalid conversation response - no conversation ID. Please check agent configuration.");
            }
            
            console.log("Conversation created successfully:", conv.id);
            setConversation(conv);
            setInitError(null);
        } catch (error) {
            console.error("Failed to initialize conversation:", error);
            const errorMessage = error.message || "Unable to connect to GLYTCH Assistant";
            setInitError(errorMessage);
            toast.error("Failed to initialize GLYTCH Assistant");
        } finally {
            setIsInitializing(false);
        }
    };

    useEffect(() => {
        initConversation();
        
        return () => {
            if (unsubscribeRef.current && typeof unsubscribeRef.current === 'function') {
                console.log("Cleaning up conversation subscription");
                unsubscribeRef.current();
            }
        };
    }, []);

    useEffect(() => {
        if (!conversation?.id) {
            return;
        }
        
        try {
            console.log("Subscribing to conversation:", conversation.id);
            
            if (!base44.agents || !base44.agents.subscribeToConversation) {
                console.error("subscribeToConversation not available");
                return;
            }
            
            const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
                console.log("Conversation update:", data);
                setMessages(data.messages || []);
                setIsLoading(data.status === 'running');
                setIsSending(false);
                
                // Save to local storage and notify dashboard
                if (data.messages && data.messages.length > 0) {
                    localStorage.setItem('glytch_last_conversation', JSON.stringify(data.messages));
                    window.dispatchEvent(new CustomEvent('conversationUpdated', { detail: { messages: data.messages } }));
                }
            });
            
            unsubscribeRef.current = unsubscribe;
            
            return () => {
                if (unsubscribe && typeof unsubscribe === 'function') {
                    unsubscribe();
                }
            };
        } catch (error) {
            console.error("Error subscribing to conversation:", error);
            setInitError("Failed to subscribe to conversation updates");
        }
    }, [conversation]);

    const handleSendMessage = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (!inputMessage.trim()) {
            toast.error("Please enter a message.");
            return;
        }
        
        if (!conversation) {
            toast.error("Not connected to GLYTCH. Please refresh the page.");
            return;
        }
        
        if (isSending || isLoading) {
            return;
        }
        
        if (!base44.agents || !base44.agents.addMessage) {
            toast.error("Agent SDK not available. Please refresh the page.");
            return;
        }
        
        setIsSending(true);
        const currentInput = inputMessage.trim();
        setInputMessage('');

        try {
            console.log("Sending message:", currentInput);
            await base44.agents.addMessage(conversation, {
                role: 'user',
                content: currentInput,
            });
            console.log("Message sent successfully");
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error(`Failed to send message: ${error.message || 'Unknown error'}`);
            setInputMessage(currentInput);
            setIsSending(false);
        }
    };
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const canSend = inputMessage.trim() && conversation && !isSending && !isLoading && !initError;

    if (isInitializing) {
        return (
            <div className="flex items-center justify-center h-full p-6">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Connecting to GLYTCH Assistant...</p>
                </div>
            </div>
        );
    }

    if (initError) {
        return (
            <div className="flex items-center justify-center h-full p-6">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <p className="font-semibold mb-2">Unable to connect to GLYTCH Assistant</p>
                        <p className="text-sm mb-4">{initError}</p>
                        <div className="flex gap-2">
                            <Button onClick={initConversation} variant="outline" size="sm" className="gap-2">
                                <RefreshCw className="w-4 h-4" />
                                Retry Connection
                            </Button>
                            <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                                Refresh Page
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-full">
            <div className="flex-1 overflow-y-auto p-4 pb-32">
                <div className="space-y-6 max-w-4xl mx-auto w-full">
                    {messages.length === 0 && !isLoading && (
                        <div className="text-center text-muted-foreground pt-20">
                            <img src={GLYTCH_ICON_URL} alt="GLYTCH" className="mx-auto h-16 w-16 mb-4" />
                            <h2 className="text-2xl font-semibold text-foreground">GLYTCH Assistant</h2>
                            <p className="mt-2">Your AI-powered partner for productivity. How can I help you today?</p>
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <MessageBubble key={msg.id || `msg-${index}`} message={msg} />
                    ))}
                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                        <MessageBubble message={{role: 'assistant', content: null, tool_calls: [{name: 'Thinking', status: 'running'}]}} />
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border pb-20 md:pb-0">
                <div className="w-full p-4">
                    <div className="relative max-w-4xl mx-auto">
                        <Textarea
                            value={inputMessage}
                            onChange={e => setInputMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Chat with GLYTCH..."
                            className="resize-none p-4 pr-20 min-h-[52px] max-h-[200px] rounded-2xl border-2 border-border focus:border-primary"
                            disabled={isSending || !conversation || !!initError}
                            rows={1}
                        />
                        <div className="absolute right-3 bottom-3 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground hidden md:inline">
                                <CornerDownLeft className="inline h-3 w-3 mr-1" /> to send
                            </span>
                            <Button 
                                size="icon" 
                                className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 transition-colors"
                                onClick={handleSendMessage}
                                disabled={!canSend}
                                type="button"
                            >
                                {isSending ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}