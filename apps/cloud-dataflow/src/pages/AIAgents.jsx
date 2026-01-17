
import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot,
  LifeBuoy,
  Zap,
  Plus,
  Loader2
} from "lucide-react";
import AgentChat from "@/components/agents/AgentChat";
import { formatDistanceToNow } from "date-fns";

const AGENTS_CONFIG = [
  {
    name: "data_guide",
    displayName: "DataGuide",
    description: "Your friendly guide to the DataFlow platform. Get help on features, best practices, and how to get started.",
    icon: Bot,
    color: "bg-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/50",
    textColor: "text-blue-700 dark:text-blue-300",
    isBuiltIn: true
  },
  {
    name: "data_support",
    displayName: "DataSupport",
    description: "Technical assistance for troubleshooting errors, connection issues, and performance problems.",
    icon: LifeBuoy,
    color: "bg-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-900/50",
    textColor: "text-orange-700 dark:text-orange-300",
    isBuiltIn: true
  },
  {
    name: "dataflow_ai",
    displayName: "DataFlowAI",
    description: "An advanced AI that can create, manage, and query your databases, and automate tasks.",
    icon: Zap,
    color: "bg-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/50",
    textColor: "text-purple-700 dark:text-purple-300",
    isBuiltIn: true
  }
];

export default function AIAgents() {
  const [conversations, setConversations] = useState({});
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allAgents, setAllAgents] = useState([]); // State to hold both built-in and custom agents

  const loadConversations = useCallback(async () => {
    setLoading(true);
    const convosByAgent = {};
    // Iterate over allAgents state to load conversations for all agents, built-in and custom
    for (const agent of allAgents) {
      try {
        const agentConvos = await base44.agents.listConversations({ agent_name: agent.name });
        convosByAgent[agent.name] = agentConvos.sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));
      } catch (error) {
        console.error(`Error loading conversations for ${agent.name}:`, error);
        convosByAgent[agent.name] = [];
      }
    }
    setConversations(convosByAgent);
    setLoading(false);
  }, [allAgents]); // Dependency on allAgents ensures this callback uses the latest list of agents

  useEffect(() => {
    // Load custom agents from localStorage
    const stored = localStorage.getItem("dataflow_custom_agents");
    let customAgents = [];
    if (stored) {
      try {
        customAgents = JSON.parse(stored).map(agent => ({
          ...agent,
          icon: Bot, // Default icon for custom agents
          color: "bg-gradient-to-br from-purple-500 to-blue-500", // Default gradient for custom agents
          bgColor: "bg-purple-50 dark:bg-purple-900/50",
          textColor: "text-purple-700 dark:text-purple-300",
          isBuiltIn: false // Mark as custom agent
        }));
      } catch (e) {
        console.error("Error parsing custom agents from localStorage:", e);
        customAgents = [];
      }
    }
    // Combine built-in and custom agents
    setAllAgents([...AGENTS_CONFIG, ...customAgents]);
    // Load conversations after allAgents has been initialized.
    // Due to `loadConversations` having `allAgents` as a dependency, and this useEffect
    // having `loadConversations` as a dependency, `loadConversations()` called here
    // will be the correct one in the subsequent render cycle, or it will be called twice.
    // The second call (after allAgents updates and loadConversations is recreated) will be correct.
    loadConversations();
  }, [loadConversations]); // Depend on loadConversations to re-run when its dependencies (allAgents) change

  const startNewConversation = async (agent) => {
    try {
      const newConversation = await base44.agents.createConversation({
        agent_name: agent.name,
        metadata: { name: `Conversation ${new Date().toLocaleString()}` }
      });
      setSelectedAgent(agent);
      setSelectedConversation(newConversation);
      loadConversations(); // Re-load conversations to include the new one
    } catch (error) {
      console.error("Error creating new conversation:", error);
    }
  };

  const selectConversation = (agent, conversation) => {
    setSelectedAgent(agent);
    setSelectedConversation(conversation);
  };

  const handleBack = () => {
    setSelectedConversation(null);
    setSelectedAgent(null);
    loadConversations(); // Re-load conversations after going back
  };

  if (selectedConversation && selectedAgent) {
    return (
      <AgentChat 
        agent={selectedAgent}
        conversation={selectedConversation}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">AI Agents</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Your intelligent assistants for guidance, support, and automation</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {allAgents.map((agent) => ( // Use allAgents for rendering
            <Card key={agent.name} className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${agent.color} rounded-lg flex items-center justify-center`}>
                    <agent.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1"> {/* Added flex-1 for better layout with badge */}
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {agent.displayName}
                      </CardTitle>
                      {!agent.isBuiltIn && ( // Conditionally render 'Custom' badge
                        <Badge variant="secondary" className="text-xs">Custom</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{agent.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Recent Conversations</h4>
                  <div className="space-y-2">
                    {(conversations[agent.name] || []).slice(0, 3).map((convo) => (
                      <button 
                        key={convo.id} 
                        onClick={() => selectConversation(agent, convo)}
                        className="w-full text-left p-3 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex justify-between items-center"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                            {convo.messages[0]?.content || 'New Conversation'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDistanceToNow(new Date(convo.updated_date), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge variant="secondary" className="flex-shrink-0 ml-2">
                          {convo.messages.length} msgs
                        </Badge>
                      </button>
                    ))}
                    {(conversations[agent.name] || []).length === 0 && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">No conversations yet.</p>
                    )}
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-slate-800 dark:bg-slate-100 hover:bg-slate-700 dark:hover:bg-slate-200 text-white dark:text-slate-900" 
                  onClick={() => startNewConversation(agent)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Chat
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
