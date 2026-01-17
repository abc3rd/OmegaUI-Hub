import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Sparkles, 
  LifeBuoy, 
  BookOpen,
  Plus,
  MessageCircle,
  Zap
} from "lucide-react";
import AgentChat from "@/components/agents/AgentChat";

const AGENTS = [
  {
    name: "data_guide",
    displayName: "DataGuide",
    icon: BookOpen,
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    description: "Your platform guide for navigation, features, and best practices",
    capabilities: [
      "Platform navigation guidance",
      "Feature explanations",
      "Best practices advice",
      "Step-by-step tutorials"
    ]
  },
  {
    name: "data_support",
    displayName: "DataSupport",
    icon: LifeBuoy,
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    description: "Technical support for troubleshooting and problem resolution",
    capabilities: [
      "Error troubleshooting",
      "Connection issues",
      "Performance optimization",
      "Access problem resolution"
    ]
  },
  {
    name: "dataflow_ai",
    displayName: "DataFlowAI",
    icon: Sparkles,
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    description: "Advanced AI assistant with full platform access for database operations",
    capabilities: [
      "Create & manage databases",
      "Execute SQL queries",
      "Data analysis & insights",
      "Automate workflows"
    ]
  }
];

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [conversations, setConversations] = useState({});

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const convs = {};
    for (const agent of AGENTS) {
      try {
        const agentConvs = await base44.agents.listConversations({
          agent_name: agent.name
        });
        convs[agent.name] = agentConvs;
      } catch (error) {
        console.error(`Error loading conversations for ${agent.name}:`, error);
        convs[agent.name] = [];
      }
    }
    setConversations(convs);
  };

  const startNewConversation = async (agentName) => {
    try {
      const conversation = await base44.agents.createConversation({
        agent_name: agentName,
        metadata: {
          name: `New Conversation - ${new Date().toLocaleString()}`,
          description: `Conversation with ${AGENTS.find(a => a.name === agentName)?.displayName}`
        }
      });
      
      await loadConversations();
      setSelectedAgent({ agent: AGENTS.find(a => a.name === agentName), conversation });
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const openExistingConversation = async (agentName, conversationId) => {
    try {
      const conversation = await base44.agents.getConversation(conversationId);
      setSelectedAgent({ 
        agent: AGENTS.find(a => a.name === agentName), 
        conversation 
      });
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  if (selectedAgent) {
    return (
      <AgentChat
        agent={selectedAgent.agent}
        conversation={selectedAgent.conversation}
        onBack={() => {
          setSelectedAgent(null);
          loadConversations();
        }}
      />
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Bot className="w-8 h-8 text-slate-700" />
          AI Agents
        </h1>
        <p className="text-slate-600 mt-2">
          Intelligent assistants to help you navigate, troubleshoot, and automate your database workflows
        </p>
      </div>

      {/* Agents Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {AGENTS.map((agent) => {
          const Icon = agent.icon;
          const agentConvs = conversations[agent.name] || [];
          
          return (
            <Card key={agent.name} className={`border-2 ${agent.borderColor} hover:shadow-lg transition-shadow`}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-14 h-14 ${agent.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <Badge variant="secondary" className={`${agent.bgColor} ${agent.textColor}`}>
                    <Zap className="w-3 h-3 mr-1" />
                    AI Powered
                  </Badge>
                </div>
                <CardTitle className="text-xl">{agent.displayName}</CardTitle>
                <p className="text-sm text-slate-600 mt-2">{agent.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Capabilities */}
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Capabilities
                  </div>
                  <div className="space-y-1.5">
                    {agent.capabilities.map((cap, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <Button 
                    className="w-full" 
                    onClick={() => startNewConversation(agent.name)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Start New Conversation
                  </Button>

                  {agentConvs.length > 0 && (
                    <div className="pt-2 border-t border-slate-200">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Recent Conversations ({agentConvs.length})
                      </div>
                      <div className="space-y-1">
                        {agentConvs.slice(0, 3).map((conv) => (
                          <Button
                            key={conv.id}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-left"
                            onClick={() => openExistingConversation(agent.name, conv.id)}
                          >
                            <MessageCircle className="w-3 h-3 mr-2 flex-shrink-0" />
                            <span className="truncate">
                              {conv.metadata?.name || `Conversation ${conv.id.slice(0, 8)}`}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* WhatsApp Link */}
                <div className="pt-2">
                  <a 
                    href={base44.agents.getWhatsAppConnectURL(agent.name)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      💬 Connect via WhatsApp
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}