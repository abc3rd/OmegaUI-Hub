import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
    BookmarkPlus, 
    Check,
    Loader2,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SaveInteractionButton({ message, output }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [learningText, setLearningText] = useState("");
    const [saved, setSaved] = useState(false);
    const queryClient = useQueryClient();

    const saveMutation = useMutation({
        mutationFn: (fact) => base44.entities.Learning.create({ fact }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['learnings'] });
            setSaved(true);
            setTimeout(() => {
                setSaved(false);
                setIsExpanded(false);
                setLearningText("");
            }, 2000);
        }
    });

    const handleQuickSave = () => {
        const fact = `When asked "${message.substring(0, 50)}...", prefer responses like: ${output.substring(0, 100)}...`;
        saveMutation.mutate(fact);
    };

    const handleCustomSave = () => {
        if (learningText.trim()) {
            saveMutation.mutate(learningText);
        }
    };

    if (saved) {
        return (
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 text-green-400 text-xs"
            >
                <Check className="w-3 h-3" />
                <span>Saved to Learning</span>
            </motion.div>
        );
    }

    return (
        <div className="relative">
            <Button
                onClick={() => isExpanded ? setIsExpanded(false) : handleQuickSave()}
                onContextMenu={(e) => {
                    e.preventDefault();
                    setIsExpanded(true);
                }}
                variant="ghost"
                size="sm"
                className="text-[#c3c3c3]/60 hover:text-[#ea00ea] h-6 px-2"
                title="Save to Learning (right-click for custom)"
                disabled={saveMutation.isPending}
            >
                {saveMutation.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                    <BookmarkPlus className="w-3 h-3" />
                )}
            </Button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute bottom-full left-0 mb-2 z-50"
                    >
                        <Card className="bg-black/95 border-[#ea00ea]/30 backdrop-blur-xl shadow-[0_0_30px_rgba(234,0,234,0.3)] w-80">
                            <CardContent className="p-3 space-y-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[#c3c3c3] text-xs font-semibold">Save as Learning</span>
                                    <Button
                                        onClick={() => setIsExpanded(false)}
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 text-[#c3c3c3]/60"
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                                <Input
                                    value={learningText}
                                    onChange={(e) => setLearningText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleCustomSave()}
                                    placeholder="What should I remember?"
                                    className="bg-black/50 border-[#ea00ea]/30 text-[#c3c3c3] text-xs h-8"
                                    autoFocus
                                />
                                <Button
                                    onClick={handleCustomSave}
                                    disabled={!learningText.trim() || saveMutation.isPending}
                                    className="w-full bg-gradient-to-r from-[#ea00ea] to-[#c3c3c3] h-7 text-xs"
                                >
                                    Save Custom Learning
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}