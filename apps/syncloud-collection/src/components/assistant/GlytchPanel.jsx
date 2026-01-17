
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { agentSDK } from '@/agents';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, CornerDownLeft, Twitter, Facebook, Linkedin, Send } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { toast } from 'sonner';

const GLYTCH_ICON_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bdbae61875d59c7d61ef06/42f53f232_splash_with_glytch.png";
const INTRO_MESSAGE = {
    id: 'intro-msg',
    role: 'assistant',
    content: "Hello! I'm GLYTCH, your AI assistant. I can help manage tasks, create content, or answer questions about animal nutrition. I can also find nearby resources on the Community Map. What can I do for you today?",
};

export default function GlytchPanel({ isOpen, onClose }) {
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([INTRO_MESSAGE]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [socialPlatforms, setSocialPlatforms] = useState({ twitter: false, facebook: false, linkedin: false });

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const initConversation = useCallback(async () => {
        try {
            const conv = await agentSDK.createConversation({ agent_name: 'glytch_agent' });
            setConversation(conv);
            setMessages([INTRO_MESSAGE]); // Reset with intro message
        } catch (error) {
            toast.error("Failed to start a new conversation with GLYTCH.");
            console.error(error);
        }
    }, []);
    
    useEffect(() => {
        if (isOpen) {
            initConversation();
        } else {
            setConversation(null);
            setMessages([INTRO_MESSAGE]);
        }
    }, [isOpen, initConversation]);

    useEffect(() => {
        const currentConversationId = conversation?.id;
        if (currentConversationId && agentSDK.subscribeToConversation) {
            const unsubscribe = agentSDK.subscribeToConversation(currentConversationId, (data) => {
                if (data.messages.length > 0) {
                    setMessages([INTRO_MESSAGE, ...data.messages]);
                } else {
                    setMessages([INTRO_MESSAGE]);
                }
                setIsLoading(data.status === 'running');

                // Save to local storage and notify dashboard
                if (data.messages && data.messages.length > 0) {
                    localStorage.setItem('glytch_last_conversation', JSON.stringify(data.messages));
                    window.dispatchEvent(new CustomEvent('conversationUpdated', { detail: { messages: data.messages } }));
                }
            });

            return () => {
                if (typeof unsubscribe === 'function') {
                    unsubscribe();
                } else if (agentSDK.unsubscribeFromConversation) {
                    agentSDK.unsubscribeFromConversation(currentConversationId);
                }
            };
        }
    }, [conversation]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !conversation) return;
        setIsLoading(true);

        const activePlatforms = Object.entries(socialPlatforms)
            .filter(([, isActive]) => isActive)
            .map(([platform]) => platform);
        
        let messageContent = inputMessage;
        if (activePlatforms.length > 0) {
            messageContent = `Post the following content to ${activePlatforms.join(', ')}: "${inputMessage}"`;
        }
        
        try {
            await agentSDK.addMessage(conversation, {
                role: 'user',
                content: messageContent,
            });
            setInputMessage('');
            setSocialPlatforms({ twitter: false, facebook: false, linkedin: false });
        } catch (error) {
            toast.error("Failed to send message.");
            console.error(error);
            setIsLoading(false);
        }
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    
    const toggleSocialPlatform = (platform) => {
        setSocialPlatforms(prev => ({ ...prev, [platform]: !prev[platform] }));
    };

    if (!isOpen) return null;

    return (
        <Card className="fixed bottom-4 right-4 w-[440px] h-[600px] shadow-2xl z-50 flex flex-col bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <img src={GLYTCH_ICON_URL} alt="GLYTCH" className="w-8 h-8" />
                    <CardTitle className="text-lg">GLYTCH Agent</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
            </CardHeader>
            <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <MessageBubble key={msg.id || index} message={msg} />
                ))}
                 {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <MessageBubble message={{role: 'assistant', content: null, tool_calls: [{name: 'Thinking', status: 'running'}]}} />
                 )}
                <div ref={messagesEndRef} />
            </CardContent>
            <div className="p-4 border-t border-border">
                <div className="relative">
                    <Textarea
                        value={inputMessage}
                        onChange={e => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Chat with GLYTCH or type a social media post..."
                        className="resize-none pr-10"
                        rows={3}
                    />
                    <Button 
                        size="icon" 
                        className="absolute right-2 bottom-10 h-8 w-8 bg-primary hover:bg-primary-accent"
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputMessage.trim()}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground mr-2">Post to:</span>
                        <Button size="icon" variant={socialPlatforms.twitter ? 'secondary' : 'ghost'} className="h-7 w-7" onClick={() => toggleSocialPlatform('twitter')}>
                            <Twitter className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant={socialPlatforms.facebook ? 'secondary' : 'ghost'} className="h-7 w-7" onClick={() => toggleSocialPlatform('facebook')}>
                            <Facebook className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant={socialPlatforms.linkedin ? 'secondary' : 'ghost'} className="h-7 w-7" onClick={() => toggleSocialPlatform('linkedin')}>
                            <Linkedin className="h-4 w-4" />
                        </Button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        <CornerDownLeft className="inline h-3 w-3 mr-1" /> to send
                    </span>
                </div>
            </div>
        </Card>
    );
}
