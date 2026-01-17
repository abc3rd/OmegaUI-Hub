import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Shield, 
    Plus, 
    Edit, 
    Save, 
    X, 
    Eye, 
    EyeOff,
    Lock,
    AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UCPAdmin() {
    const [isAdmin, setIsAdmin] = useState(null);
    const [editingPacket, setEditingPacket] = useState(null);
    const [showTemplates, setShowTemplates] = useState({});
    const queryClient = useQueryClient();

    // Check if user is admin
    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const u = await base44.auth.me();
            setIsAdmin(u?.role === 'admin');
            return u;
        }
    });

    const { data: dictionaries = [], isLoading } = useQuery({
        queryKey: ['ucpDictionaries'],
        queryFn: () => base44.entities.UcpDictionary.list('-updated_date'),
        enabled: isAdmin === true
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.UcpDictionary.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ucpDictionaries'] });
            setEditingPacket(null);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.UcpDictionary.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ucpDictionaries'] });
            setEditingPacket(null);
        }
    });

    const handleSave = () => {
        if (!editingPacket.packet_id || !editingPacket.display_name || !editingPacket.system_template) {
            alert('Please fill in all required fields (Packet ID, Display Name, System Template)');
            return;
        }

        if (editingPacket.id) {
            updateMutation.mutate({ id: editingPacket.id, data: editingPacket });
        } else {
            createMutation.mutate(editingPacket);
        }
    };

    const toggleTemplate = (id) => {
        setShowTemplates(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (isAdmin === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black flex items-center justify-center">
                <div className="text-[#c3c3c3]">Loading...</div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black flex items-center justify-center p-6">
                <Card className="bg-black/50 border-red-500/30 max-w-md">
                    <CardContent className="p-8 text-center">
                        <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-[#c3c3c3] mb-2">Admin Access Required</h2>
                        <p className="text-[#c3c3c3]/70">
                            This page is only accessible to administrators.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ea00ea] to-[#c3c3c3] flex items-center justify-center shadow-[0_0_30px_rgba(234,0,234,0.5)]">
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#ea00ea] via-[#c3c3c3] to-[#ea00ea] bg-clip-text text-transparent">
                                UCP Dictionary Admin
                            </h1>
                            <p className="text-[#c3c3c3]/70 text-sm mt-1">
                                Manage UCP packet templates and configurations
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setEditingPacket({
                            packet_id: '',
                            intent: '',
                            version: 1,
                            system_template: '',
                            developer_template: '',
                            output_contract: '',
                            display_name: '',
                            description: '',
                            is_active: true
                        })}
                        className="bg-gradient-to-r from-[#ea00ea] to-[#c3c3c3] hover:shadow-[0_0_30px_rgba(234,0,234,0.6)]"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        New Packet
                    </Button>
                </div>

                {/* Security Warning */}
                <Card className="bg-gradient-to-br from-red-500/10 to-transparent border-red-500/30 mb-6">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-[#c3c3c3]/90">
                                <strong className="text-red-400">Security Notice:</strong> Templates contain sensitive system instructions. They are never exposed to non-admin users. Only metadata and compiled prompts are accessible through the API.
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Form */}
                <AnimatePresence>
                    {editingPacket && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <Card className="bg-black/50 border-[#ea00ea]/30 backdrop-blur-xl mb-6">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-[#c3c3c3]">
                                            {editingPacket.id ? 'Edit Packet' : 'New Packet'}
                                        </CardTitle>
                                        <Button
                                            onClick={() => setEditingPacket(null)}
                                            variant="ghost"
                                            size="icon"
                                            className="text-[#c3c3c3]"
                                        >
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[#c3c3c3] text-sm mb-2 block">
                                                Packet ID *
                                            </label>
                                            <Input
                                                value={editingPacket.packet_id}
                                                onChange={(e) => setEditingPacket({
                                                    ...editingPacket,
                                                    packet_id: e.target.value
                                                })}
                                                placeholder="e.g., general_assistant_v1"
                                                className="bg-black/50 border-[#ea00ea]/30 text-[#c3c3c3]"
                                                maxLength={100}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[#c3c3c3] text-sm mb-2 block">
                                                Display Name *
                                            </label>
                                            <Input
                                                value={editingPacket.display_name}
                                                onChange={(e) => setEditingPacket({
                                                    ...editingPacket,
                                                    display_name: e.target.value
                                                })}
                                                placeholder="e.g., General Assistant"
                                                className="bg-black/50 border-[#ea00ea]/30 text-[#c3c3c3]"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[#c3c3c3] text-sm mb-2 block">
                                                Intent
                                            </label>
                                            <Input
                                                value={editingPacket.intent}
                                                onChange={(e) => setEditingPacket({
                                                    ...editingPacket,
                                                    intent: e.target.value
                                                })}
                                                placeholder="e.g., general, concise, code"
                                                className="bg-black/50 border-[#ea00ea]/30 text-[#c3c3c3]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[#c3c3c3] text-sm mb-2 block">
                                                Version
                                            </label>
                                            <Input
                                                type="number"
                                                value={editingPacket.version}
                                                onChange={(e) => setEditingPacket({
                                                    ...editingPacket,
                                                    version: parseInt(e.target.value) || 1
                                                })}
                                                className="bg-black/50 border-[#ea00ea]/30 text-[#c3c3c3]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[#c3c3c3] text-sm mb-2 block">
                                            Description
                                        </label>
                                        <Textarea
                                            value={editingPacket.description}
                                            onChange={(e) => setEditingPacket({
                                                ...editingPacket,
                                                description: e.target.value
                                            })}
                                            placeholder="What does this packet do?"
                                            className="bg-black/50 border-[#ea00ea]/30 text-[#c3c3c3]"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[#c3c3c3] text-sm mb-2 block">
                                            System Template * (PRIVATE - Admin Only)
                                        </label>
                                        <Textarea
                                            value={editingPacket.system_template}
                                            onChange={(e) => setEditingPacket({
                                                ...editingPacket,
                                                system_template: e.target.value
                                            })}
                                            placeholder="System-level instructions..."
                                            className="bg-black/50 border-[#ea00ea]/30 text-[#c3c3c3] min-h-32 font-mono text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[#c3c3c3] text-sm mb-2 block">
                                            Developer Template (PRIVATE - Admin Only)
                                        </label>
                                        <Textarea
                                            value={editingPacket.developer_template}
                                            onChange={(e) => setEditingPacket({
                                                ...editingPacket,
                                                developer_template: e.target.value
                                            })}
                                            placeholder="Developer-level instructions..."
                                            className="bg-black/50 border-[#ea00ea]/30 text-[#c3c3c3] min-h-32 font-mono text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[#c3c3c3] text-sm mb-2 block">
                                            Output Contract (JSON Schema)
                                        </label>
                                        <Textarea
                                            value={editingPacket.output_contract}
                                            onChange={(e) => setEditingPacket({
                                                ...editingPacket,
                                                output_contract: e.target.value
                                            })}
                                            placeholder='{"type": "object", "properties": {...}}'
                                            className="bg-black/50 border-[#ea00ea]/30 text-[#c3c3c3] min-h-24 font-mono text-sm"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={editingPacket.is_active}
                                            onChange={(e) => setEditingPacket({
                                                ...editingPacket,
                                                is_active: e.target.checked
                                            })}
                                            className="w-4 h-4"
                                        />
                                        <label className="text-[#c3c3c3] text-sm">
                                            Active (users can use this packet)
                                        </label>
                                    </div>

                                    <Button
                                        onClick={handleSave}
                                        disabled={createMutation.isPending || updateMutation.isPending}
                                        className="w-full bg-gradient-to-r from-[#ea00ea] to-[#c3c3c3]"
                                    >
                                        <Save className="w-5 h-5 mr-2" />
                                        Save Packet
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Dictionaries List */}
                <div className="grid grid-cols-1 gap-4">
                    {dictionaries.map((dict) => (
                        <Card key={dict.id} className="bg-black/50 border-[#ea00ea]/30">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-[#c3c3c3] flex items-center gap-2">
                                            {dict.display_name}
                                            <Badge className={`${
                                                dict.is_active
                                                    ? "bg-green-500/20 text-green-400 border-green-500/50"
                                                    : "bg-red-500/20 text-red-400 border-red-500/50"
                                            }`}>
                                                {dict.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </CardTitle>
                                        <p className="text-[#c3c3c3]/60 text-sm mt-1">
                                            {dict.description || 'No description'}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-[#c3c3c3]/50">
                                            <span>ID: {dict.packet_id}</span>
                                            <span>Intent: {dict.intent}</span>
                                            <span>v{dict.version}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => toggleTemplate(dict.id)}
                                            variant="outline"
                                            size="icon"
                                            className="border-[#ea00ea]/30 text-[#c3c3c3]"
                                        >
                                            {showTemplates[dict.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            onClick={() => setEditingPacket(dict)}
                                            variant="outline"
                                            size="icon"
                                            className="border-[#ea00ea]/30 text-[#c3c3c3]"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <AnimatePresence>
                                {showTemplates[dict.id] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                    >
                                        <CardContent className="space-y-3 border-t border-[#ea00ea]/20">
                                            <div>
                                                <div className="text-xs text-[#c3c3c3]/60 mb-1 flex items-center gap-2">
                                                    <Lock className="w-3 h-3" />
                                                    System Template
                                                </div>
                                                <pre className="bg-black/50 border border-[#ea00ea]/20 rounded p-3 text-xs text-[#c3c3c3] overflow-x-auto max-h-48">
{dict.system_template}
                                                </pre>
                                            </div>
                                            {dict.developer_template && (
                                                <div>
                                                    <div className="text-xs text-[#c3c3c3]/60 mb-1 flex items-center gap-2">
                                                        <Lock className="w-3 h-3" />
                                                        Developer Template
                                                    </div>
                                                    <pre className="bg-black/50 border border-[#ea00ea]/20 rounded p-3 text-xs text-[#c3c3c3] overflow-x-auto max-h-48">
{dict.developer_template}
                                                    </pre>
                                                </div>
                                            )}
                                        </CardContent>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    ))}
                </div>

                {dictionaries.length === 0 && !isLoading && (
                    <Card className="bg-black/50 border-[#ea00ea]/30">
                        <CardContent className="p-12 text-center">
                            <Shield className="w-16 h-16 text-[#c3c3c3]/30 mx-auto mb-4" />
                            <p className="text-[#c3c3c3]/60">
                                No UCP packets created yet. Click "New Packet" to create your first one.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}