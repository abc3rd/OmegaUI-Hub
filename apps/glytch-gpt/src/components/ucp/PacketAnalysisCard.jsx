import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    TrendingDown,
    DollarSign,
    Zap,
    Target,
    Brain,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    AlertCircle,
    Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PacketAnalysisCard({ analysisData }) {
    const [showDetails, setShowDetails] = useState(false);

    if (!analysisData) return null;

    const { intent, confidence, complexity, reasoning, suggested_constraints, tokens } = analysisData;

    const confidenceColor = confidence >= 80 ? "text-green-400" : confidence >= 60 ? "text-yellow-400" : "text-orange-400";
    const complexityColor = {
        LOW: "bg-green-500/20 text-green-400 border-green-500/50",
        MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
        HIGH: "bg-red-500/20 text-red-400 border-red-500/50"
    }[complexity] || "bg-[#c3c3c3]/20 text-[#c3c3c3] border-[#c3c3c3]/50";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="bg-gradient-to-br from-[#ea00ea]/10 to-transparent border-[#ea00ea]/30">
                <CardHeader>
                    <CardTitle className="text-[#c3c3c3] flex items-center gap-2">
                        <Brain className="w-5 h-5 text-[#ea00ea]" />
                        UCP Packet Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Intent and Confidence */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/30 border border-[#ea00ea]/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-[#ea00ea]" />
                                <span className="text-xs text-[#c3c3c3]/70">Detected Intent</span>
                            </div>
                            <div className="text-xl font-bold text-[#ea00ea]">{intent}</div>
                            <div className={`text-xs mt-1 ${confidenceColor}`}>
                                {confidence}% confidence
                            </div>
                        </div>
                        <div className="bg-black/30 border border-[#ea00ea]/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-4 h-4 text-[#ea00ea]" />
                                <span className="text-xs text-[#c3c3c3]/70">Complexity</span>
                            </div>
                            <Badge className={`${complexityColor} text-sm`}>
                                {complexity}
                            </Badge>
                            {complexity === "HIGH" && (
                                <div className="text-xs text-[#c3c3c3]/60 mt-2">
                                    Enhanced optimization applied
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Token Savings */}
                    <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <TrendingDown className="w-5 h-5 text-green-400" />
                                <span className="text-[#c3c3c3] font-semibold">Token Efficiency</span>
                            </div>
                            <div className="text-2xl font-bold text-green-400">
                                {tokens.savings_pct}%
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                                <div className="text-[#c3c3c3]/60">Original</div>
                                <div className="text-[#c3c3c3] font-mono">{tokens.original_est}</div>
                            </div>
                            <div>
                                <div className="text-[#c3c3c3]/60">Compiled</div>
                                <div className="text-green-400 font-mono">{tokens.packet_est}</div>
                            </div>
                            <div>
                                <div className="text-[#c3c3c3]/60">Saved</div>
                                <div className="text-green-400 font-mono">{tokens.tokens_saved}</div>
                            </div>
                        </div>
                    </div>

                    {/* Cost Impact */}
                    <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <DollarSign className="w-5 h-5 text-blue-400" />
                            <span className="text-[#c3c3c3] font-semibold">Cost Impact</span>
                        </div>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-[#c3c3c3]/60">Per call savings:</span>
                                <span className="text-green-400 font-mono">${tokens.cost_savings_per_call}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#c3c3c3]/60">Per 1,000 calls:</span>
                                <span className="text-blue-400 font-mono">${tokens.projections.per_1000_calls.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#c3c3c3]/60">Per 10,000 calls:</span>
                                <span className="text-[#ea00ea] font-mono font-bold">${tokens.projections.per_10000_calls.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* AI Insights */}
                    {tokens.insights && tokens.insights.length > 0 && (
                        <div className="space-y-2">
                            {tokens.insights.map((insight, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-[#c3c3c3]/80 bg-[#ea00ea]/5 border border-[#ea00ea]/20 rounded p-2">
                                    <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                                    <span>{insight}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Suggested Constraints */}
                    <Button
                        onClick={() => setShowDetails(!showDetails)}
                        variant="outline"
                        className="w-full border-[#ea00ea]/30 text-[#c3c3c3] hover:bg-[#ea00ea]/10 text-sm"
                    >
                        {showDetails ? "Hide" : "Show"} AI Recommendations
                        {showDetails ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                    </Button>

                    <AnimatePresence>
                        {showDetails && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="space-y-3"
                            >
                                {/* Reasoning */}
                                <div className="bg-black/30 border border-[#ea00ea]/20 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Info className="w-4 h-4 text-[#ea00ea]" />
                                        <span className="text-xs font-semibold text-[#c3c3c3]">AI Reasoning</span>
                                    </div>
                                    <p className="text-xs text-[#c3c3c3]/80 leading-relaxed">{reasoning}</p>
                                </div>

                                {/* Suggested Constraints */}
                                <div className="bg-black/30 border border-[#ea00ea]/20 rounded-lg p-3">
                                    <div className="text-xs font-semibold text-[#c3c3c3] mb-2">Optimal Constraints</div>
                                    <div className="space-y-2">
                                        {Object.entries(suggested_constraints).map(([key, value]) => (
                                            <div key={key} className="flex justify-between items-center text-xs">
                                                <span className="text-[#c3c3c3]/60 capitalize">{key.replace(/_/g, " ")}:</span>
                                                <Badge className="bg-[#ea00ea]/20 text-[#ea00ea] border-[#ea00ea]/50 text-xs">
                                                    {typeof value === "object" ? JSON.stringify(value) : String(value)}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </motion.div>
    );
}