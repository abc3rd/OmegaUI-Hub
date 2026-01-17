import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Send, MessageSquare, Bot, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import MessageBubble from "../components/agents/MessageBubble";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

const AGENT_NAME = "cloudCollectManager";

export default function AgentChat() {
    const queryClient = useQueryClient();
    const [user, setUser] = useState(null);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [editingConversation, setEditingConversation] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
    }, []);

    const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
        queryKey: ['agentConversations', AGENT_NAME],
        queryFn: () => base44.agents.listConversations({ agent_name: AGENT_NAME }),
        enabled: !!user
    });

    const { data: activeConversation } = useQuery({
        queryKey: ['agentConversation', activeConversationId],
        queryFn: () => base44.agents.getConversation(activeConversationId),
        enabled: !!activeConversationId,
        onSuccess: (data) => setMessages(data?.messages || [])
    });

    useEffect(() => {
        if (!activeConversationId) return;

        const unsubscribe = base44.agents.subscribeToConversation(activeConversationId, (data) => {
            setMessages(data.messages);
        });

        return () => unsubscribe();
    }, [activeConversationId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !activeConversation || isSending) return;
        
        setIsSending(true);
        try {
            await base44.agents.addMessage(activeConversation, {
                role: "user",
                content: newMessage.trim()
            });
            setNewMessage("");
        } catch (error) {
            toast.error("Failed to send message.");
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    const handleCreateConversation = async () => {
        const toastId = toast.loading("Creating new conversation...");
        try {
            const newConv = await base44.agents.createConversation({
                agent_name: AGENT_NAME,
                metadata: { name: `Conversation ${conversations.length + 1}` }
            });
            await queryClient.invalidateQueries(['agentConversations', AGENT_NAME]);
            setActiveConversationId(newConv.id);
            toast.success("Conversation created!", { id: toastId });
        } catch (error) {
            toast.error("Failed to create conversation.", { id: toastId });
        }
    };

    const handleUpdateConversation = async (name) => {
        if (!editingConversation) return;
        const toastId = toast.loading("Updating conversation...");
        try {
            await base44.agents.updateConversation(editingConversation.id, { metadata: { name } });
            await queryClient.invalidateQueries(['agentConversations', AGENT_NAME]);
            toast.success("Conversation updated!", { id: toastId });
            setEditingConversation(null);
        } catch (error) {
            toast.error("Failed to update conversation.", { id: toastId });
        }
    };

    const handleDeleteConversation = async (id) => {
        const toastId = toast.loading("Deleting conversation...");
        try {
            await base44.agents.deleteConversation(id);
            await queryClient.invalidateQueries(['agentConversations', AGENT_NAME]);
            if (activeConversationId === id) setActiveConversationId(null);
            toast.success("Conversation deleted!", { id: toastId });
            setDeleteConfirm(null);
        } catch (error) {
            toast.error("Failed to delete conversation.", { id: toastId });
        }
    };

    if (!user) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

    return (
        <div className="h-[calc(100vh-80px)] flex">
            {/* Sidebar */}
            <div className="w-1/4 min-w-[250px] bg-slate-50 border-r p-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-800">Conversations</h2>
                    <Button size="icon" variant="outline" onClick={handleCreateConversation}>
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2">
                    {conversationsLoading ? <Loader2 className="animate-spin mx-auto mt-8" /> : (
                        conversations.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => setActiveConversationId(conv.id)}
                                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${activeConversationId === conv.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-100'}`}
                            >
                                <span className="font-medium truncate">{conv.metadata?.name || 'Untitled'}</span>
                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setEditingConversation(conv); }}><Edit className="w-3.5 h-3.5" /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(conv); }}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-100">
                {activeConversationId ? (
                    <>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="max-w-4xl mx-auto space-y-4">
                                {messages.map((msg, index) => (
                                    (msg.role === 'user' || (msg.role === 'assistant' && (msg.content || msg.tool_calls?.length > 0))) &&
                                    <MessageBubble key={index} message={msg} />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                        <div className="p-4 bg-white border-t">
                            <div className="max-w-4xl mx-auto flex items-center gap-3">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Ask your agent anything..."
                                    className="h-12 text-base"
                                    disabled={isSending}
                                />
                                <Button size="lg" onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
                                    {isSending ? <Loader2 className="animate-spin" /> : <Send className="w-5 h-5" />}
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                            <Bot className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">Cloud Collect Agent</h2>
                        <p className="text-slate-600 max-w-md mt-2">
                            Select a conversation from the sidebar or create a new one to start chatting with your administrative assistant.
                        </p>
                        <Button className="mt-6" onClick={handleCreateConversation}>
                            <Plus className="w-4 h-4 mr-2" />
                            Start New Conversation
                        </Button>
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingConversation} onOpenChange={() => setEditingConversation(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Conversation Name</DialogTitle></DialogHeader>
                    <Input 
                        defaultValue={editingConversation?.metadata?.name} 
                        id="convName"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingConversation(null)}>Cancel</Button>
                        <Button onClick={() => handleUpdateConversation(document.getElementById('convName').value)}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete the conversation "{deleteConfirm?.metadata?.name}". This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => handleDeleteConversation(deleteConfirm.id)}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}