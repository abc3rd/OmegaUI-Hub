import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Download, ArrowLeft, Loader2 } from 'lucide-react';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [clientInfo, setClientInfo] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    const email = params.get('email');
    const type = params.get('type');
    const caseRef = params.get('case');

    if (name && email && type) {
      setClientInfo({ name, email, type, caseRef });
      initializeConversation(name, email, type, caseRef);
    } else {
      window.location.href = createPageUrl('Index');
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeConversation = async (name, email, type, caseRef) => {
    const welcomeMessage = {
      role: 'assistant',
      content: `Hello ${name}! I'm GLYTCH, your Syncloud AI assistant. 

🔮 I'm here to help ${type === 'attorney' ? 'you with professional tasks and documentation' : 'provide assistance and support'}. All conversations are documented and timestamped for your records. How can I assist you today?`,
      timestamp: new Date().toISOString()
    };

    setMessages([welcomeMessage]);

    const conversation = await base44.entities.Conversation.create({
      client_name: name,
      client_email: email,
      client_type: type,
      case_reference: caseRef || '',
      messages: [welcomeMessage],
      status: 'active',
      tags: [type, 'new']
    });

    setConversationId(conversation.id);
  };

  const generateResponse = (userMessage) => {
    const messageLower = userMessage.toLowerCase();
    
    if (clientInfo?.type === 'attorney') {
      if (messageLower.includes('client') || messageLower.includes('case')) {
        return "As your AI assistant, I can help you manage communications. All interactions through me are fully documented with timestamps, ensuring complete transparency. Would you like me to help you draft a communication or review details?";
      }
      if (messageLower.includes('document') || messageLower.includes('record')) {
        return "All conversations are automatically recorded and can be exported at any time. Each message includes a timestamp and full conversation history. You can download the complete record using the download button above.";
      }
    }
    
    if (clientInfo?.type === 'client') {
      if (messageLower.includes('help')) {
        return "I'm here to help! All our conversations are recorded and timestamped, creating a permanent record of information shared. What would you like to know?";
      }
    }

    if (messageLower.includes('hello') || messageLower.includes('hi ')) {
      return `Hello! I'm GLYTCH, your Syncloud AI assistant. Our entire conversation is being documented for your reference. How can I help you today?`;
    }
    
    if (messageLower.includes('help')) {
      return `I'm GLYTCH, here to help! I can:
- Provide assistance and guidance
- Help with documentation
- Answer questions
- Document all our interactions for future reference

All conversations are timestamped and can be exported. What would you like to know?`;
    }

    if (messageLower.includes('thank')) {
      return "You're welcome! Remember, all of our conversation is documented and available for download at any time. Is there anything else I can help you with?";
    }

    return `I understand you're asking about "${userMessage}". As GLYTCH, your Syncloud AI assistant, I'm here to provide help and ensure all our communications are properly documented.

Could you provide more details so I can better assist you?`;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const assistantMessage = {
      role: 'assistant',
      content: generateResponse(input.trim()),
      timestamp: new Date().toISOString()
    };

    const finalMessages = [...updatedMessages, assistantMessage];
    setMessages(finalMessages);

    if (conversationId) {
      await base44.entities.Conversation.update(conversationId, {
        messages: finalMessages
      });
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const downloadConversation = () => {
    const conversationText = messages.map(msg => {
      const date = new Date(msg.timestamp).toLocaleString();
      return `[${date}] ${msg.role.toUpperCase()}: ${msg.content}`;
    }).join('\n\n');

    const blob = new Blob([
      `Syncloud - GLYTCH Conversation Record\n`,
      `\n`,
      `\nUser: ${clientInfo?.name}\n`,
      `Email: ${clientInfo?.email}\n`,
      `Type: ${clientInfo?.type}\n`,
      `Project Reference: ${clientInfo?.caseRef || 'N/A'}\n`,
      `Date: ${new Date().toLocaleString()}\n`,
      `\n${'='.repeat(50)}\n\n`,
      conversationText
    ], { type: 'text/plain' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GLYTCH_Conversation_${clientInfo?.name}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!clientInfo) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-[#0077B6]/30 flex flex-col">
      <style>{`
        @keyframes syncloud-breathe {
            0%, 100% { background: linear-gradient(135deg, #0077B6, #48CAE4); }
            25% { background: linear-gradient(135deg, #48CAE4, #00B4D8); }
            50% { background: linear-gradient(135deg, #F4A261, #E9C46A); }
            75% { background: linear-gradient(135deg, #E9C46A, #0077B6); }
        }
        .animate-syncloud-breathe {
            animation: syncloud-breathe 8s ease-in-out infinite;
        }
      `}</style>
      {/* Header */}
      <div className="bg-gray-800/90 backdrop-blur-sm border-b border-[#48CAE4]/30 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Index')}>
              <Button variant="ghost" size="icon" className="text-[#48CAE4] hover:text-[#48CAE4]/80">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full animate-syncloud-breathe"></div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#0077B6] via-[#48CAE4] to-[#F4A261] bg-clip-text text-transparent">
                  GLYTCH
                </h1>
                <p className="text-xs text-gray-400">Syncloud AI Assistant</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm text-white">{clientInfo.name}</p>
              <p className="text-xs text-gray-400 capitalize">{clientInfo.type}</p>
            </div>
            <Button
              onClick={downloadConversation}
              variant="outline"
              className="border-[#48CAE4]/50 text-[#48CAE4] hover:bg-[#48CAE4]/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Info Banner */}
        <div className="container mx-auto mt-3">
          <div className="bg-[#48CAE4]/10 border border-[#48CAE4]/50 rounded-lg p-3">
            <p className="text-[#48CAE4] text-xs font-semibold mb-1">🔮 GLYTCH - AI ASSISTANT</p>
            <p className="text-[#48CAE4]/90 text-xs">
              Your Syncloud AI assistant. All conversations are documented and timestamped.
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 container mx-auto max-w-4xl">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-[#F4A261] to-[#E9C46A] text-white'
                    : 'bg-gray-800/70 backdrop-blur-sm border border-[#48CAE4]/20 text-gray-100'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs mt-2 opacity-60">
                  {new Date(message.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800/70 backdrop-blur-sm border border-[#48CAE4]/20 rounded-2xl p-4">
                <Loader2 className="w-5 h-5 text-[#48CAE4] animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-gray-800/90 backdrop-blur-sm border-t border-[#48CAE4]/30 p-4">
        <div className="container mx-auto max-w-4xl flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
            className="bg-gray-900/50 border-[#48CAE4]/30 text-white placeholder:text-gray-500 resize-none"
            rows={3}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-gradient-to-r from-[#0077B6] via-[#48CAE4] to-[#F4A261] hover:opacity-90 px-8"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
                        All sessions recorded for quality assurance | Patent Pending
                      </p>
      </div>
    </div>
  );
}