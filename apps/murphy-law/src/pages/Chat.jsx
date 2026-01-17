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
      content: `Hello ${name}! I'm Murphy, the UCRASH AI Legal Aid Volunteer assistant. 

⚖️ IMPORTANT LEGAL DISCLAIMER: I am an AI-powered legal aid volunteer and NOT a licensed attorney. The information I provide is for educational purposes only and does not constitute legal advice. My responses are not guaranteed to be legally accurate. Always consult with a qualified attorney before making any legal decisions. Use of this service does not create an attorney-client relationship.

I'm here to help ${type === 'attorney' ? 'you with legal information and case documentation' : 'provide legal information and support'}. All conversations are documented and timestamped for your records. How can I assist you today?`,
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
    
    // Attorney-specific responses
    if (clientInfo?.type === 'attorney') {
      if (messageLower.includes('client') || messageLower.includes('case')) {
        return "As your AI assistant, I can help you manage client communications. All interactions through me are fully documented with timestamps, ensuring complete transparency. Would you like me to help you draft a client communication or review case details?";
      }
      if (messageLower.includes('document') || messageLower.includes('record')) {
        return "All conversations are automatically recorded and can be exported at any time. Each message includes a timestamp and full conversation history. You can download the complete record using the download button above. This ensures all statements and commitments are permanently documented.";
      }
      if (messageLower.includes('schedule') || messageLower.includes('appointment')) {
        return "I can help coordinate schedules. Please provide the details you'd like me to communicate, and all information will be documented in our conversation history for future reference.";
      }
    }
    
    // Client-specific responses
    if (clientInfo?.type === 'client') {
      if (messageLower.includes('attorney') || messageLower.includes('lawyer')) {
        return "I'm here to help facilitate communication with your attorney. All our conversations are recorded and timestamped, creating a permanent record of information shared and commitments made. This protects you by ensuring everything discussed is documented. What would you like to know?";
      }
      if (messageLower.includes('case') || messageLower.includes('claim')) {
        return "I can provide general information about your case. Please note that all our communications are documented and timestamped for your protection. This ensures that any information or commitments made are permanently recorded. How can I assist with your case?";
      }
      if (messageLower.includes('document') || messageLower.includes('record')) {
        return "You can download a complete record of our conversation at any time using the download button above. This gives you a timestamped record of all information shared and commitments made, which can be valuable for your records.";
      }
    }

    // General responses
    if (messageLower.includes('hello') || messageLower.includes('hi ')) {
      return `Hello! I'm Murphy, your AI Legal Aid Volunteer. 

⚖️ REMINDER: I am NOT a licensed attorney. Information provided is educational only. Always consult with a qualified attorney for legal decisions.

Our entire conversation is being documented for your protection and reference. How can I help you today?`;
    }
    
    if (messageLower.includes('help')) {
      return `I'm Murphy, here to help! I can:
- Provide legal information and guidance (NOT legal advice)
- Help with legal documentation
- Answer questions about legal processes
- Document all our interactions for future reference

⚖️ REMINDER: I am an AI legal aid volunteer, NOT a licensed attorney. Always consult with a qualified attorney for legal decisions.

All conversations are timestamped and can be exported. What would you like to know?`;
    }

    if (messageLower.includes('thank')) {
      return "You're welcome! Remember, all of our conversation is documented and available for download at any time. Is there anything else I can help you with?";
    }

    // Default response
    return `I understand you're asking about "${userMessage}". As Murphy, your AI Legal Aid Volunteer, I'm here to provide legal information (not legal advice) and ensure all our communications are properly documented.

⚖️ REMINDER: I am NOT a licensed attorney. This information is educational only. Always consult with a qualified attorney before making legal decisions.

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

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000));

    const assistantMessage = {
      role: 'assistant',
      content: generateResponse(input.trim()),
      timestamp: new Date().toISOString()
    };

    const finalMessages = [...updatedMessages, assistantMessage];
    setMessages(finalMessages);

    // Update conversation in database
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
      `UCRASH - Murphy's Law Conversation Record\n`,
      `AI Legal Aid Volunteer - NOT Legal Advice\n`,
      `Always Consult with a Licensed Attorney\n`,
      `\n`,
      `\nClient: ${clientInfo?.name}\n`,
      `Email: ${clientInfo?.email}\n`,
      `Type: ${clientInfo?.type}\n`,
      `Case Reference: ${clientInfo?.caseRef || 'N/A'}\n`,
      `Date: ${new Date().toLocaleString()}\n`,
      `\n${'='.repeat(50)}\n\n`,
      conversationText
    ], { type: 'text/plain' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Murphy_Conversation_${clientInfo?.name}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!clientInfo) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-cyan-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800/90 backdrop-blur-sm border-b border-[#fdc600]/30 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Index')}>
              <Button variant="ghost" size="icon" className="text-[#fdc600] hover:text-[#fdc600]/80">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#fdc600] drop-shadow-[0_0_10px_rgba(253,198,0,0.5)]">
                MURPHY
              </h1>
              <p className="text-xs text-gray-400">UCRASH AI Legal Aid Volunteer</p>
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
              className="border-[#fdc600]/50 text-[#fdc600] hover:bg-[#fdc600]/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Legal Disclaimer Banner */}
        <div className="container mx-auto mt-3">
          <div className="bg-[#ff0000]/10 border border-[#ff0000]/50 rounded-lg p-3">
            <p className="text-[#ff0000] text-xs font-semibold mb-1">⚖️ MURPHY'S LAW - LEGAL DISCLAIMER</p>
            <p className="text-[#ff0000]/90 text-xs">
              Murphy is an AI legal aid volunteer, NOT a licensed attorney. Information is educational only. Always consult with a qualified attorney.
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
                    ? 'bg-gradient-to-r from-[#fdc600] to-[#c4653a] text-white'
                    : 'bg-gray-800/70 backdrop-blur-sm border border-[#fdc600]/20 text-gray-100'
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
              <div className="bg-gray-800/70 backdrop-blur-sm border border-[#fdc600]/20 rounded-2xl p-4">
                <Loader2 className="w-5 h-5 text-[#fdc600] animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-gray-800/90 backdrop-blur-sm border-t border-[#fdc600]/30 p-4">
        <div className="container mx-auto max-w-4xl flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
            className="bg-gray-900/50 border-[#fdc600]/30 text-white placeholder:text-gray-500 resize-none"
            rows={3}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-gradient-to-r from-[#fdc600] to-[#c4653a] hover:from-[#fdc600]/90 hover:to-[#c4653a]/90 px-8"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          All messages are timestamped and recorded • Murphy is NOT a licensed attorney
        </p>
      </div>
    </div>
  );
}