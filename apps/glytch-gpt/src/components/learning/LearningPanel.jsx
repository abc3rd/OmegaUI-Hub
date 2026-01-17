import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
    Brain, 
    X, 
    Plus, 
    Trash2, 
    Sparkles,
    Search,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LearningPanel({ onClose, userId }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [newFact, setNewFact] = useState("");
    const queryClient = useQueryClient();

    const { data: learnings = [], isLoading } = useQuery({
        queryKey: ['learnings', userId],
        queryFn: () => base44.entities.Learning.list('-created_date'),
        enabled: !!userId
    });

    const createMutation = useMutation({
        mutationFn: (fact) => base44.entities.Learning.create({ fact }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['learnings'] });
            setNewFact("");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.Learning.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['learnings'] });
        }
    });

    const filteredLearnings = learnings.filter(l => 
        l.fact.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-black via-purple-950/20 to-black border border-[#ea00ea]/30 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="bg-black/80 backdrop-blur-xl border-b border-[#ea00ea]/30 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ea00ea] to-[#c3c3c3] flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#ea00ea] to-[#c3c3c3] bg-clip-text text-transparent">
                                Learning Assistant
                            </h2>
                            <p className="text-[#c3c3c3]/60 text-sm">
                                {learnings.length} learned facts
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        size="icon"
                        className="text-[#c3c3c3]"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Add New Learning */}
                    <Card className="bg-gradient-to-br from-[#ea00ea]/10 to-transparent border-[#ea00ea]/30">
                        <CardContent className="p-4">
                            <div className="flex gap-2">
                                <Input
                                    value={newFact}
                                    onChange={(e) => setNewFact(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && newFact.trim() && createMutation.mutate(newFact)}
                                    placeholder="Teach me something... (e.g., I prefer concise responses)"
                                    className="bg-black/50 border-[#ea00ea]/30 text-[#c3c3c3] placeholder:text-[#c3c3c3]/40"
                                />
                                <Button
                                    onClick={() => createMutation.mutate(newFact)}
                                    disabled={!newFact.trim() || createMutation.isPending}
                                    className="bg-gradient-to-r from-[#ea00ea] to-[#c3c3c3]"
                                >
                                    {createMutation.isPending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Plus className="w-5 h-5" />
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Search */}
                    {learnings.length > 0 && (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#c3c3c3]/50" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search learnings..."
                                className="bg-black/50 border-[#ea00ea]/30 text-[#c3c3c3] pl-10"
                            />
                        </div>
                    )}

                    {/* Learnings List */}
                    {isLoading ? (
                        <div className="text-center py-8">
                            <Loader2 className="w-8 h-8 text-[#ea00ea] animate-spin mx-auto" />
                        </div>
                    ) : filteredLearnings.length === 0 ? (
                        <Card className="bg-black/30 border-[#ea00ea]/20">
                            <CardContent className="p-8 text-center">
                                <Brain className="w-12 h-12 text-[#c3c3c3]/30 mx-auto mb-3" />
                                <p className="text-[#c3c3c3]/60">
                                    {searchQuery ? 'No matching learnings found' : 'No learnings yet. Teach me something!'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-2">
                            <AnimatePresence>
                                {filteredLearnings.map((learning, idx) => (
                                    <motion.div
                                        key={learning.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <Card className="bg-black/50 border-[#ea00ea]/30 hover:border-[#ea00ea]/50 transition-all">
                                            <CardContent className="p-4 flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <Sparkles className="w-4 h-4 text-[#ea00ea] mt-1 flex-shrink-0" />
                                                    <p className="text-[#c3c3c3] text-sm flex-1">
                                                        {learning.fact}
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={() => deleteMutation.mutate(learning.id)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-[#c3c3c3]/50 hover:text-red-400 h-8 w-8 flex-shrink-0"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-black/80 backdrop-blur-xl border-t border-[#ea00ea]/30 p-4">
                    <div className="flex items-center gap-2 text-xs text-[#c3c3c3]/60">
                        <Brain className="w-3 h-3" />
                        <span>These learnings personalize all AI responses and UCP packet generation</span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}