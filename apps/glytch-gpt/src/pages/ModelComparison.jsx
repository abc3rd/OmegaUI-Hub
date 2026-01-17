import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
    Play, 
    Loader2, 
    BarChart3, 
    Clock,
    DollarSign,
    Zap,
    AlertCircle,
    Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TokenCounter } from "@/components/utils/tokenCounter";
import ErrorBoundary from "@/components/ErrorBoundary";

const AVAILABLE_MODELS = [
    { id: 'openai-gpt-4o', provider: 'openai', model: 'gpt-4o', label: 'GPT-4o', description: 'Fast & powerful' },
    { id: 'openai-gpt-4o-mini', provider: 'openai', model: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'Efficient' },
    { id: 'openai-gpt-4', provider: 'openai', model: 'gpt-4', label: 'GPT-4', description: 'Most capable' },
    { id: 'lm-studio-granite', provider: 'lm_studio', model: 'granite', label: 'Granite (LM Studio)', description: 'Local model' },
    { id: 'base44-default', provider: 'base44', model: 'base44-default', label: 'Base44 AI', description: 'Built-in' }
];

function ModelComparisonContent() {
    const [user, setUser] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [prompt, setPrompt] = useState("");
    const [selectedModels, setSelectedModels] = useState(['openai-gpt-4o', 'openai-gpt-4o-mini']);
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState({});
    const [error, setError] = useState(null);

    // Check authentication (optional for Model Comparison)
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoadingAuth(false);
            }
        };
        checkAuth();
    }, []);

    const toggleModel = (modelId) => {
        setSelectedModels(prev => 
            prev.includes(modelId) 
                ? prev.filter(id => id !== modelId)
                : [...prev, modelId]
        );
    };

    const runComparison = async () => {
        if (!prompt.trim()) {
            setError("Please enter a prompt");
            return;
        }

        if (selectedModels.length === 0) {
            setError("Please select at least one model");
            return;
        }

        setError(null);
        setIsRunning(true);
        setResults({});

        const selectedModelConfigs = AVAILABLE_MODELS.filter(m => selectedModels.includes(m.id));

        // Run all models in parallel
        const promises = selectedModelConfigs.map(async (modelConfig) => {
            const startTime = Date.now();
            
            try {
                const response = await base44.functions.invoke('callModel', {
                    providerId: modelConfig.provider,
                    model: modelConfig.model,
                    messages: [{ role: 'user', content: prompt }],
                    settings: {
                        temperature: 0.7,
                        max_tokens: 600
                    }
                });

                const latencyMs = Date.now() - startTime;
                const data = response.data;

                return {
                    id: modelConfig.id,
                    success: true,
                    output: data.text,
                    usage: data.usage,
                    latencyMs: data.latencyMs || latencyMs,
                    cost: TokenCounter.estimateCost(data.usage, modelConfig.model),
                    provider: data.provider,
                    model: modelConfig.label
                };
            } catch (error) {
                return {
                    id: modelConfig.id,
                    success: false,
                    error: error.message || 'Failed to call model',
                    model: modelConfig.label,
                    provider: modelConfig.provider
                };
            }
        });

        const allResults = await Promise.all(promises);

        // Convert to object keyed by model id
        const resultsMap = {};
        allResults.forEach(result => {
            resultsMap[result.id] = result;
        });

        setResults(resultsMap);
        setIsRunning(false);
    };

    const selectedCount = selectedModels.length;
    const hasResults = Object.keys(results).length > 0;

    // Show loading state
    if (isLoadingAuth) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#ea00ea] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ea00ea] to-[#c3c3c3] flex items-center justify-center shadow-[0_0_30px_rgba(234,0,234,0.5)]">
                            <BarChart3 className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#ea00ea] via-[#c3c3c3] to-[#ea00ea] bg-clip-text text-transparent">
                                Model Comparison
                            </h1>
                            <p className="text-[#c3c3c3]/70 text-sm mt-1">
                                Test multiple AI models side-by-side {!user && "(Demo Mode)"}
                            </p>
                        </div>
                    </div>

                    {!user && (
                        <Card className="bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/20 mt-4">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-[#c3c3c3]/80">
                                        You're using demo mode. Sign in to save comparison results and access full features.
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>

                {/* Configuration */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="bg-black/50 border-[#ea00ea]/30 backdrop-blur-xl mb-6">
                        <CardHeader>
                            <CardTitle className="text-[#c3c3c3]">Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Prompt Input */}
                            <div>
                                <label className="text-[#c3c3c3] text-sm mb-2 block">
                                    Prompt
                                </label>
                                <Textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Enter your prompt to test across multiple models..."
                                    className="bg-black/50 border-[#ea00ea]/30 text-[#c3c3c3] placeholder:text-[#c3c3c3]/30 focus:border-[#ea00ea] focus:ring-[#ea00ea]/50 min-h-32"
                                />
                                <div className="text-xs text-[#c3c3c3]/50 mt-2">
                                    {TokenCounter.estimateTokens(prompt)} tokens estimated
                                </div>
                            </div>

                            {/* Model Selection */}
                            <div>
                                <label className="text-[#c3c3c3] text-sm mb-3 block">
                                    Select Models ({selectedCount} selected)
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {AVAILABLE_MODELS.map((model) => (
                                        <div
                                            key={model.id}
                                            onClick={() => toggleModel(model.id)}
                                            className={`cursor-pointer p-4 rounded-lg border transition-all ${
                                                selectedModels.includes(model.id)
                                                    ? 'bg-gradient-to-br from-[#ea00ea]/20 to-transparent border-[#ea00ea] shadow-[0_0_20px_rgba(234,0,234,0.3)]'
                                                    : 'bg-black/30 border-[#ea00ea]/20 hover:border-[#ea00ea]/40'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Checkbox 
                                                    checked={selectedModels.includes(model.id)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <div className="text-[#c3c3c3] font-medium">{model.label}</div>
                                                    <div className="text-xs text-[#c3c3c3]/60 mt-1">{model.description}</div>
                                                    <Badge className="mt-2 bg-[#ea00ea]/20 text-[#ea00ea] border-[#ea00ea]/50 text-xs">
                                                        {model.provider}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Run Button */}
                            <Button
                                onClick={runComparison}
                                disabled={isRunning || !prompt.trim() || selectedCount === 0}
                                className="w-full bg-gradient-to-r from-[#ea00ea] to-[#c3c3c3] hover:shadow-[0_0_30px_rgba(234,0,234,0.6)] transition-all disabled:opacity-50 h-12"
                            >
                                {isRunning ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Loader2 className="w-5 h-5 mr-2" />
                                        </motion.div>
                                        Running Comparison...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5 mr-2" />
                                        Run Comparison ({selectedCount} {selectedCount === 1 ? 'model' : 'models'})
                                    </>
                                )}
                            </Button>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3"
                                >
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="text-sm">{error}</span>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Results */}
                <AnimatePresence>
                    {hasResults && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                        >
                            {Object.values(results).map((result, idx) => (
                                <motion.div
                                    key={result.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card className={`h-full ${
                                        result.success
                                            ? 'bg-black/50 border-[#ea00ea]/30'
                                            : 'bg-red-500/5 border-red-500/30'
                                    }`}>
                                        <CardHeader>
                                            <CardTitle className="text-[#c3c3c3] text-lg flex items-center justify-between">
                                                <span>{result.model}</span>
                                                <Badge className={`${
                                                    result.success 
                                                        ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                                        : 'bg-red-500/20 text-red-400 border-red-500/50'
                                                } text-xs`}>
                                                    {result.success ? 'Success' : 'Failed'}
                                                </Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {result.success ? (
                                                <>
                                                    {/* Output */}
                                                    <div>
                                                        <label className="text-[#c3c3c3]/70 text-xs mb-2 block">Output</label>
                                                        <div className="bg-black/50 border border-[#ea00ea]/20 rounded-lg p-3 max-h-64 overflow-y-auto">
                                                            <p className="text-[#c3c3c3] text-sm whitespace-pre-wrap leading-relaxed">
                                                                {result.output}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Metrics */}
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div className="bg-black/30 border border-[#ea00ea]/20 rounded-lg p-3">
                                                            <div className="flex items-center gap-1 text-[#c3c3c3]/60 text-xs mb-1">
                                                                <Zap className="w-3 h-3" />
                                                                Tokens
                                                            </div>
                                                            <div className="text-[#c3c3c3] font-bold">
                                                                {result.usage?.total_tokens || 0}
                                                            </div>
                                                            {result.usage?.estimated && (
                                                                <div className="text-yellow-400 text-xs mt-1">est.</div>
                                                            )}
                                                        </div>

                                                        <div className="bg-black/30 border border-[#ea00ea]/20 rounded-lg p-3">
                                                            <div className="flex items-center gap-1 text-[#c3c3c3]/60 text-xs mb-1">
                                                                <Clock className="w-3 h-3" />
                                                                Latency
                                                            </div>
                                                            <div className="text-[#c3c3c3] font-bold">
                                                                {(result.latencyMs / 1000).toFixed(2)}s
                                                            </div>
                                                        </div>

                                                        <div className="bg-black/30 border border-[#ea00ea]/20 rounded-lg p-3">
                                                            <div className="flex items-center gap-1 text-[#c3c3c3]/60 text-xs mb-1">
                                                                <DollarSign className="w-3 h-3" />
                                                                Cost
                                                            </div>
                                                            <div className="text-[#c3c3c3] font-bold text-sm">
                                                                {TokenCounter.formatCost(result.cost.total_cost)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Detailed Token Breakdown */}
                                                    <div className="text-xs text-[#c3c3c3]/60 space-y-1">
                                                        <div className="flex justify-between">
                                                            <span>Prompt tokens:</span>
                                                            <span>{result.usage?.prompt_tokens || 0}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Completion tokens:</span>
                                                            <span>{result.usage?.completion_tokens || 0}</span>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-start gap-2 text-red-400 text-sm">
                                                    <AlertCircle className="w-4 h-4 mt-0.5" />
                                                    <div>{result.error}</div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function ModelComparison() {
    return (
        <ErrorBoundary>
            <ModelComparisonContent />
        </ErrorBoundary>
    );
}