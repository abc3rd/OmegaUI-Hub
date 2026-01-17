import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Plus, 
  Edit, 
  Trash2,
  Zap,
  MessageSquare
} from "lucide-react";
import CreateAgentDialog from "@/components/agents/CreateAgentDialog";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

export default function AgentManagement() {
  const [customAgents, setCustomAgents] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [deletingAgent, setDeletingAgent] = useState(null);
  const [role, setRole] = useState("viewer");

  useEffect(() => {
    User.me().then(me => setRole(me.role || "viewer")).catch(() => setRole("viewer"));
    loadCustomAgents();
  }, []);

  const loadCustomAgents = async () => {
    // Load custom agents from agents/ directory
    // This is a mock - in real implementation would need backend support
    // For now, we'll store them in localStorage as a demo
    const stored = localStorage.getItem("dataflow_custom_agents");
    if (stored) {
      try {
        setCustomAgents(JSON.parse(stored));
      } catch (e) {
        setCustomAgents([]);
      }
    }
  };

  const saveAgent = (agentData) => {
    const agents = [...customAgents];
    if (editingAgent) {
      const index = agents.findIndex(a => a.name === editingAgent.name);
      if (index !== -1) {
        agents[index] = agentData;
      }
    } else {
      agents.push(agentData);
    }
    localStorage.setItem("dataflow_custom_agents", JSON.stringify(agents));
    setCustomAgents(agents);
    setShowCreate(false);
    setEditingAgent(null);
  };

  const handleDelete = () => {
    if (!deletingAgent) return;
    const agents = customAgents.filter(a => a.name !== deletingAgent.name);
    localStorage.setItem("dataflow_custom_agents", JSON.stringify(agents));
    setCustomAgents(agents);
    setDeletingAgent(null);
  };

  if (role !== "admin") {
    return (
      <div className="p-6 lg:p-8">
        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-12 text-center">
            <Bot className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Admin Access Required
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Only administrators can create and manage custom AI agents.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Agent Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Create and configure custom AI agents for your workflows</p>
        </div>
        <Button 
          className="bg-slate-800 dark:bg-slate-100 hover:bg-slate-700 dark:hover:bg-slate-200 text-white dark:text-slate-900"
          onClick={() => {
            setEditingAgent(null);
            setShowCreate(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Custom Agent
        </Button>
      </div>

      {customAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {customAgents.map((agent) => (
            <Card key={agent.name} className="border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{agent.displayName || agent.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1 text-xs">Custom</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                  {agent.description}
                </p>

                {agent.tool_configs && agent.tool_configs.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Tool Access:</div>
                    <div className="flex flex-wrap gap-1">
                      {agent.tool_configs.slice(0, 3).map((tool, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          {tool.entity_name}
                        </Badge>
                      ))}
                      {agent.tool_configs.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{agent.tool_configs.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {agent.whatsapp_greeting && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <MessageSquare className="w-3 h-3" />
                    WhatsApp enabled
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setEditingAgent(agent);
                      setShowCreate(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => setDeletingAgent(agent)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-slate-200 dark:border-slate-700 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bot className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No Custom Agents Yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-center max-w-md">
              Create your first custom AI agent to assist with specialized workflows and tasks in your organization.
            </p>
            <Button
              className="bg-slate-800 dark:bg-slate-100 hover:bg-slate-700 dark:hover:bg-slate-200 text-white dark:text-slate-900"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Agent
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateAgentDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSave={saveAgent}
        editingAgent={editingAgent}
      />

      <ConfirmDialog
        open={!!deletingAgent}
        onOpenChange={(open) => !open && setDeletingAgent(null)}
        onConfirm={handleDelete}
        title="Delete Custom Agent"
        description="This will permanently delete this custom agent configuration."
        itemName={deletingAgent?.displayName || deletingAgent?.name}
        itemType="Agent"
        requireTyping={false}
        warnings={[
          "All conversation history with this agent will be lost",
          "This action cannot be undone"
        ]}
        isDeleting={true}
      />
    </div>
  );
}