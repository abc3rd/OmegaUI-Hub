import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, MessageCircle, X, Minimize2, Bot, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function VictimIntakeChat({ isOpen, onClose, minimized, onToggleMinimize }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [agentTyping, setAgentTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !conversationId) {
      initializeConversation();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages || []);
      
      // Check if agent is typing (last message role is user and no assistant response yet)
      const lastMessage = data.messages?.[data.messages.length - 1];
      if (lastMessage?.role === 'user') {
        setAgentTyping(true);
      } else {
        setAgentTyping(false);
      }
    });

    return () => unsubscribe();
  }, [conversationId]);

  const initializeConversation = async () => {
    try {
      setIsLoading(true);
      const conversation = await base44.agents.createConversation({
        agent_name: 'victim_intake_agent',
        metadata: {
          name: 'Victim Intake Chat',
          source: 'website',
          timestamp: new Date().toISOString()
        }
      });
      setConversationId(conversation.id);
      
      // Load initial greeting
      if (conversation.messages) {
        setMessages(conversation.messages);
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setAgentTyping(true);

    try {
      // If no conversation yet, create one first
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        const conversation = await base44.agents.createConversation({
          agent_name: 'victim_intake_agent',
          metadata: {
            name: 'Victim Intake Chat',
            source: 'website',
            timestamp: new Date().toISOString()
          }
        });
        currentConversationId = conversation.id;
        setConversationId(conversation.id);
        if (conversation.messages) {
          setMessages(conversation.messages);
        }
      }

      const conversation = { id: currentConversationId };
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: userMessage
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setAgentTyping(false);
    }
  };

  const formatMessageContent = (content) => {
    if (!content) return null;
    
    // Convert markdown-style bold
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert line breaks
    content = content.replace(/\n/g, '<br />');
    
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  };

  if (!isOpen) return null;

  if (minimized) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={onToggleMinimize}
          className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform animate-pulse"
          style={{ boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)' }}
        >
          <Bot className="w-8 h-8" />
          {agentTyping && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-2rem)] sm:bottom-6 sm:left-6">
      <style>{`
        .chat-glass {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.15);
        }
        
        .dark .chat-glass {
          background: rgba(30, 30, 30, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .message-bubble {
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .typing-indicator span {
          animation: typing 1.4s infinite;
        }
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }
      `}</style>

      <div className="chat-glass rounded-3xl overflow-hidden flex flex-col h-full">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b-2 border-orange-500" style={{ backgroundColor: '#E2E8F0' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">UCRASH AI Assistant</h3>
              <p className="text-xs text-gray-600">We Get You Cash!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMinimize}
              className="p-2 hover:bg-orange-100 rounded-full transition-colors"
            >
              <Minimize2 className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-orange-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="text-center text-gray-500 py-8">
              <Bot className="w-12 h-12 mx-auto mb-3 text-orange-500" />
              <p className="text-sm">Starting your conversation...</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 message-bubble ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="text-sm leading-relaxed">
                  {formatMessageContent(message.content)}
                </div>
                
                {message.tool_calls && message.tool_calls.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/20">
                    <div className="text-xs opacity-75 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      Processing your information...
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {agentTyping && (
            <div className="flex gap-3 message-bubble">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700">
                <div className="typing-indicator flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full inline-block"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full inline-block"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full inline-block"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message..."
              className="flex-1 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-orange-500"
            />
            <Button
              type="submit"
              disabled={!inputMessage.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Your information is secure and confidential
          </p>
        </div>
      </div>
    </div>
  );
}