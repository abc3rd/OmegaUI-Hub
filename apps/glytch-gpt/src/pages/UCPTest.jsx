import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    Zap, 
    Play, 
    TrendingDown, 
    DollarSign,
    Clock,
    CheckCircle2,
    AlertCircle,
    Info,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Package,
    BarChart3,
    Settings as SettingsIcon,
    Server,
    LogIn,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TokenCounter } from "@/components/utils/tokenCounter";
import { UCPProcessor } from "@/components/utils/ucpProcessor";
import { SemanticSimilarity } from "@/components/utils/semanticSimilarity";
import { ProviderSettings as Settings, listLMStudioModels, isPrivateNetwork } from "@/components/providers";
import { isCorsError } from "@/components/utils/net";
import { getProviderAvailability } from "@/components/providers/state";
import { validateProvider, getSafeDefaults } from "@/components/utils/allowlist";
import ProviderSettings from "@/components/settings/ProviderSettings";
import DiagnosticsPanel from "@/components/lab/DiagnosticsPanel";

function UCPTestContent() {
    const [user, setUser] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [prompt, setPrompt] = useState("");
    const [model, setModel] = useState("gpt-4o");
    const [provider, setProvider] = useState("base44");
    const [mode, setMode] = useState("compare");
    const [selectedPacketId, setSelectedPacketId] = useState("general_assistant");
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState(null);
    const [showTransparency, setShowTransparency] = useState(false);
    const [showPacketInfo, setShowPacketInfo] = useState(false);
    const [showProviderSettings, setShowProviderSettings] = useState(false);
    const [showDiagnostics, setShowDiagnostics] = useState(false);
    const [diagnostics, setDiagnostics] = useState(null);
    const [error, setError] = useState(null);

    // Check authentication
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

    // Load available UCP packets
    const { data: availablePackets = [] } = useQuery({
        queryKey: ['ucpPackets'],
        queryFn: async () => {
            const packets = await base44.entities.UcpDictionary.filter({ is_active: true });
            return packets;
        }
    });

    // Load LM Studio models if provider is selected
    const { data: lmStudioModels = [] } = useQuery({
        queryKey: ['lmStudioModels'],
        queryFn: async () => {
            const proxyFn = async (params) => {
                const response = await base44.functions.invoke('proxyOpenAICompat', params);
                return response.data;
            };
            return await listLMStudioModels(proxyFn);
        },
        enabled: provider === 'lm_studio'
    });

    const providers = [
        { value: "base44", label: "Base44", description: "Built-in AI", icon: Sparkles },
        { value: "lm_studio", label: "LM Studio (LAN)", description: "Local models", icon: Server }
    ];

    const getAvailableModels = () => {
        if (provider === 'lm_studio') {
            if (lmStudioModels.length > 0) {
                return lmStudioModels.map(m => ({
                    value: m.id,
                    label: m.name,
                    description: m.owned_by || 'LM Studio'
                }));
            }
            return [{ value: "granite", label: "Granite", description: "Loading..." }];
        }
        return [
            { value: "gpt-4o", label: "GPT-4o", description: "Fast, powerful" },
            { value: "gpt-4", label: "GPT-4", description: "Most capable" },
            { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", description: "Efficient" }
        ];
    };

    const models = getAvailableModels();

    const modes = [
        { value: "standard", label: "Standard", icon: Sparkles },
        { value: "ucp", label: "UCP Enhanced", icon: Zap },
        { value: "compare", label: "Compare Both", icon: BarChart3 }
    ];

    const runTest = async () => {
        if (!prompt.trim()) {
            setError("Please enter a prompt");
            return;
        }

        if (prompt.length > UCPProcessor.MAX_PROMPT_LENGTH) {
            setError(`Prompt exceeds maximum length of ${UCPProcessor.MAX_PROMPT_LENGTH} characters`);
            return;
        }

        setError(null);
        setIsRunning(true);
        setResults(null);

        try {
            const startTime = Date.now();

            if (mode === "compare") {
                // Run both modes in parallel
                const [standardResult, ucpResult] = await Promise.all([
                    runStandardMode(prompt),
                    runUCPMode(prompt)
                ]);

                const endTime = Date.now();
                const totalLatency = endTime - startTime;

                // Calculate semantic similarity
                const similarity = SemanticSimilarity.calculateSimilarity(
                    standardResult.output,
                    ucpResult.output
                );

                setResults({
                    mode: "compare",
                    standard: standardResult,
                    ucp: ucpResult,
                    comparison: {
                        token_reduction: TokenCounter.calculateReduction(
                            standardResult.tokens.total_tokens,
                            ucpResult.tokens.total_tokens
                        ),
                        cost_reduction: TokenCounter.calculateReduction(
                            standardResult.cost.total_cost,
                            ucpResult.cost.total_cost
                        ),
                        similarity
                    },
                    latency: totalLatency
                });
            } else if (mode === "standard") {
                const result = await runStandardMode(prompt);
                const endTime = Date.now();
                setResults({
                    mode: "standard",
                    standard: result,
                    latency: endTime - startTime
                });
            } else {
                const result = await runUCPMode(prompt);
                const endTime = Date.now();
                setResults({
                    mode: "ucp",
                    ucp: result,
                    latency: endTime - startTime
                });
            }
        } catch (error) {
            setError(error.message || "An error occurred during testing");
            console.error("Test error:", error);
        } finally {
            setIsRunning(false);
        }
    };

    const runStandardMode = async (userPrompt) => {
        try {
            // Validate provider and model
            validateProvider(provider, model);

            // Check prompt length
            const safeDefaults = getSafeDefaults();
            if (userPrompt.length > safeDefaults.max_prompt_length) {
                throw new Error(
                    `Prompt exceeds maximum length of ${safeDefaults.max_prompt_length} characters. ` +
                    `Current: ${userPrompt.length} characters.`
                );
            }

            const settings = Settings.load();
            const baseUrl = provider === 'lm_studio' ? settings.lmStudio.baseUrl : null;
            const isPrivate = baseUrl && isPrivateNetwork(baseUrl);
            
            let responseData;
            const startTime = Date.now();
            
            if (provider === 'lm_studio' && isPrivate) {
                // Direct browser call for private IPs
                const payload = {
                    model,
                    messages: [{ role: 'user', content: userPrompt }],
                    temperature: 0.7,
                    max_tokens: 2000,
                    top_p: 1.0
                };
                
                const response = await fetch(`${baseUrl}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const result = await response.json();
                const latencyMs = Date.now() - startTime;
                
                responseData = {
                    text: result.choices?.[0]?.message?.content || '',
                    usage: result.usage || {
                        prompt_tokens: Math.ceil(JSON.stringify(payload.messages).length / 4),
                        completion_tokens: Math.ceil((result.choices?.[0]?.message?.content || '').length / 4),
                        total_tokens: 0,
                        estimated: true
                    },
                    latencyMs,
                    provider: 'lm_studio'
                };
                
                if (!responseData.usage.total_tokens) {
                    responseData.usage.total_tokens = responseData.usage.prompt_tokens + responseData.usage.completion_tokens;
                }
            } else {
                // Use server proxy for public endpoints or Base44
                const response = await base44.functions.invoke('callModel', {
                    providerId: provider,
                    baseUrl,
                    model: model,
                    messages: [{ role: 'user', content: userPrompt }],
                    settings: { 
                        temperature: 0.7,
                        max_tokens: 2000
                    }
                });
                
                responseData = response.data;
            }

            const tokens = responseData.usage;
            const cost = TokenCounter.estimateCost(tokens, model);

            // Store diagnostics
            setDiagnostics({
                provider,
                model,
                baseUrl,
                endpoint: '/v1/chat/completions',
                status: 200,
                latencyMs: responseData.latencyMs,
                privateIpDetected: isPrivate,
                proxyDisabledReason: isPrivate ? 'Private IP - direct browser call' : null,
                directFetchStatus: isPrivate ? 'success' : null,
                corsLikely: false,
                tokens: {
                    ...tokens,
                    transmitted: tokens.transmitted_tokens || tokens.total_tokens,
                    estimated: tokens.estimated || !tokens.prompt_tokens
                }
            });

            return {
                output: responseData.text,
                tokens: {
                    ...tokens,
                    transmitted_tokens: tokens.transmitted_tokens || tokens.total_tokens,
                    estimated: tokens.estimated || !tokens.prompt_tokens
                },
                cost,
                prompt_used: userPrompt,
                provider: responseData.provider
            };
        } catch (error) {
            const settings = Settings.load();
            const baseUrl = provider === 'lm_studio' ? settings.lmStudio.baseUrl : null;
            const isPrivate = baseUrl && isPrivateNetwork(baseUrl);
            const corsLikely = isCorsError(error);
            
            // Store error diagnostics
            setDiagnostics({
                provider,
                model,
                baseUrl,
                endpoint: '/v1/chat/completions',
                status: error.response?.status || 0,
                error: error.message,
                privateIpDetected: isPrivate,
                proxyDisabledReason: isPrivate ? 'Private IP - direct browser call' : null,
                directFetchStatus: isPrivate ? 'failed' : null,
                corsLikely
            });
            throw error;
        }
    };

    const runUCPMode = async (userPrompt) => {
        // Use backend UCP processing
        const response = await base44.functions.invoke('runModelUcp', {
            packet_id: selectedPacketId,
            delta_prompt: userPrompt,
            settings: { model },
            user_context: { organization: 'default' }
        });

        const tokens = response.data.usage;
        const cost = TokenCounter.estimateCost(tokens, model);

        return {
            output: response.data.output,
            tokens,
            cost,
            prompt_used: userPrompt,
            ucp_data: {
                packet: response.data.packet,
                transmitted_tokens: tokens.transmitted_tokens,
                savings: tokens.savings
            }
        };
    };

    const packetStats = UCPProcessor.getPacketStats();

    // Show loading state
    if (isLoadingAuth) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                >
                    <Loader2 className="w-12 h-12 text-[#ea00ea] animate-spin mx-auto mb-4" />
                    <p className="text-[#c3c3c3]/60">Loading...</p>
                </motion.div>
            </div>
        );
    }

    // Show login prompt if not authenticated
    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full"
                >
                    <Card className="bg-black/50 border-[#ea00ea]/30 backdrop-blur-xl p-8">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#ea00ea] to-[#c3c3c3] flex items-center justify-center shadow-[0_0_40px_rgba(234,0,234,0.5)]">
                                <Zap className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ea00ea] via-[#c3c3c3] to-[#ea00ea] bg-clip-text text-transparent mb-3">
                                UCP Protocol Access
                            </h1>
                            <p className="text-[#c3c3c3]/70 mb-6">
                                Sign in to access the UCP Efficiency Test and unlock advanced token optimization features.
                            </p>
                            <div className="space-y-3">
                                <Button
                                    onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                                    className="w-full bg-gradient-to-r from-[#ea00ea] to-[#c3c3c3] hover:shadow-[0_0_30px_rgba(234,0,234,0.6)] transition-all h-12"
                                >
                                    <LogIn className="w-5 h-5 mr-2" />
                                    Sign In to Continue
                                </Button>
                                <p className="text-xs text-[#c3c3c3]/50">
                                    UCP features require authentication for privacy and security.
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
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
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ea00ea] to-[#c3c3c3] flex items-center justify-center shadow-[0_0_30px_rgba(234,0,234,0.5)]">
                                <BarChart3 className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#ea00ea] via-[#c3c3c3] to-[#ea00ea] bg-clip-text text-transparent">
                                    UCP Efficiency Test
                                </h1>
                                <p className="text-[#c3c3c3]/70 text-sm mt-1">
                                    Compare Standard vs UCP-Enhanced token efficiency
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowProviderSettings(true)}
                            variant="outline"
                            className="border-[#ea00ea]/30 text-[#c3c3c3] hover:bg-[#ea00ea]/10"
                        >
                            <SettingsIcon className="w-5 h-5 mr-2" />
                            Provider Settings
                        </Button>
                    </div>

                    {/* Disclaimer */}
                    <Card className="bg-gradient-to-br from-[#ea00ea]/5 to-transparent border-[#ea00ea]/20 mt-4">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 text-[#ea00ea] mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-[#c3c3c3]/80">
                                    <strong className="text-[#c3c3c3]">Demo Disclaimer:</strong> This is a structural simulation of UCP behavior demonstrating efficiency principles without exposing proprietary implementation details.
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Configuration Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="bg-black/50 border-[#ea00ea]/30 backdrop-blur-xl mb-6">
                        <CardHeader>
                            <CardTitle className="text-[#c3c3c3] flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-[#ea00ea]" />
                                Test Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Prompt Input */}
                            <div>
                                <label className="text-[#c3c3c3] text-sm mb-2 block">
                                    Enter Your Prompt
                                </label>
                                <Textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Example: Write a detailed analysis of renewable energy trends in 2024, including market growth, key technologies, and future predictions. Please format as bullet points."
                                    className="bg-black/50 border-[#ea00ea]/30 text-[#c3c3c3] placeholder:text-[#c3c3c3]/30 focus:border-[#ea00ea] focus:ring-[#ea00ea]/50 min-h-32"
                                    maxLength={UCPProcessor.MAX_PROMPT_LENGTH}
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-[#c3c3c3]/50">
                                        {TokenCounter.estimateTokens(prompt)} tokens estimated
                                    </span>
                                    <span className="text-xs text-[#c3c3c3]/50">
                                        {prompt.length} / {UCPProcessor.MAX_PROMPT_LENGTH} characters
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Provider Selector */}
                                <div>
                                    <label className="text-[#c3c3c3] text-sm mb-2 block">
                                        Provider
                                    </label>
                                    <Select value={provider} onValueChange={(val) => {
                                        setProvider(val);
                                        // Reset model when provider changes
                                        if (val === 'lm_studio') {
                                            setModel('granite');
                                        } else {
                                            setModel('gpt-4o');
                                        }
                                    }}>
                                        <SelectTrigger className="bg-black/50 border-[#ea00ea]/30 text-[#c3c3c3]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {providers.map((p) => {
                                                const Icon = p.icon;
                                                return (
                                                    <SelectItem key={p.value} value={p.value}>
                                                        <div className="flex items-center gap-2">
                                                            <Icon className="w-4 h-4" />
                                                            <div>
                                                                <div className="font-medium">{p.label}</div>
                                                                <div className="text-xs text-[#c3c3c3]/60">{p.description}</div>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Model Selector */}
                                <div>
                                    <label className="text-[#c3c3c3] text-sm mb-2 block">
                                        Model
                                    </label>
                                    <Select value={model} onValueChange={setModel}>
                                        <SelectTrigger className="bg-black/50 border-[#ea00ea]/30 text-[#c3c3c3]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {models.map((m) => (
                                                <SelectItem key={m.value} value={m.value}>
                                                    <div>
                                                        <div className="font-medium">{m.label}</div>
                                                        <div className="text-xs text-[#c3c3c3]/60">{m.description}</div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* UCP Packet Selector */}
                                <div>
                                    <label className="text-[#c3c3c3] text-sm mb-2 block">
                                        UCP Packet
                                    </label>
                                    <Select value={selectedPacketId} onValueChange={setSelectedPacketId}>
                                        <SelectTrigger className="bg-black/50 border-[#ea00ea]/30 text-[#c3c3c3]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availablePackets.map((p) => (
                                                <SelectItem key={p.packet_id} value={p.packet_id}>
                                                    <div>
                                                        <div className="font-medium">{p.display_name}</div>
                                                        {p.description && (
                                                            <div className="text-xs text-[#c3c3c3]/60">{p.description}</div>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Mode Selector */}
                                <div>
                                    <label className="text-[#c3c3c3] text-sm mb-2 block">
                                        Test Mode
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {modes.map((m) => {
                                            const Icon = m.icon;
                                            return (
                                                <Button
                                                    key={m.value}
                                                    onClick={() => setMode(m.value)}
                                                    className={`${
                                                        mode === m.value
                                                            ? "bg-gradient-to-r from-[#ea00ea] to-[#c3c3c3] text-white shadow-[0_0_20px_rgba(234,0,234,0.5)]"
                                                            : "bg-black/50 text-[#c3c3c3] border border-[#ea00ea]/30"
                                                    }`}
                                                >
                                                    <Icon className="w-4 h-4 mr-1" />
                                                    <span className="text-xs">{m.label.split(' ')[0]}</span>
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Run Button */}
                            <Button
                                onClick={runTest}
                                disabled={isRunning || !prompt.trim()}
                                className="w-full bg-gradient-to-r from-[#ea00ea] to-[#c3c3c3] hover:shadow-[0_0_30px_rgba(234,0,234,0.6)] transition-all disabled:opacity-50 h-12"
                            >
                                {isRunning ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Zap className="w-5 h-5 mr-2" />
                                        </motion.div>
                                        Running Test...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5 mr-2" />
                                        Run Test
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

                {/* Results Section */}
                <AnimatePresence>
                    {results && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Comparison Results */}
                            {results.mode === "compare" && (
                                <>
                                    {/* Summary Stats */}
                                    <Card className="bg-gradient-to-br from-[#ea00ea]/10 to-transparent border-[#ea00ea]/30">
                                        <CardContent className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center gap-2 mb-2">
                                                        <TrendingDown className="w-5 h-5 text-green-400" />
                                                        <span className="text-[#c3c3c3]/70 text-sm">Token Reduction</span>
                                                    </div>
                                                    <div className="text-3xl font-bold text-green-400">
                                                        {results.comparison.token_reduction}%
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center gap-2 mb-2">
                                                        <DollarSign className="w-5 h-5 text-green-400" />
                                                        <span className="text-[#c3c3c3]/70 text-sm">Cost Savings</span>
                                                    </div>
                                                    <div className="text-3xl font-bold text-green-400">
                                                        {results.comparison.cost_reduction}%
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center gap-2 mb-2">
                                                        <CheckCircle2 className="w-5 h-5 text-[#ea00ea]" />
                                                        <span className="text-[#c3c3c3]/70 text-sm">Similarity</span>
                                                    </div>
                                                    <div className={`text-3xl font-bold ${SemanticSimilarity.getColorForRating(results.comparison.similarity.rating)}`}>
                                                        {results.comparison.similarity.similarity}%
                                                    </div>
                                                    <div className="text-xs text-[#c3c3c3]/60 mt-1">
                                                        {results.comparison.similarity.rating}
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center gap-2 mb-2">
                                                        <Clock className="w-5 h-5 text-[#c3c3c3]" />
                                                        <span className="text-[#c3c3c3]/70 text-sm">Total Time</span>
                                                    </div>
                                                    <div className="text-3xl font-bold text-[#c3c3c3]">
                                                        {(results.latency / 1000).toFixed(2)}s
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Side-by-Side Comparison */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Standard Results */}
                                        <ResultCard
                                            title="Standard Mode"
                                            icon={Sparkles}
                                            result={results.standard}
                                            highlight={false}
                                        />

                                        {/* UCP Results */}
                                        <ResultCard
                                            title="UCP Enhanced"
                                            icon={Zap}
                                            result={results.ucp}
                                            highlight={true}
                                            ucpData={results.ucp.ucp_data}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Single Mode Results */}
                            {results.mode !== "compare" && (
                                <ResultCard
                                    title={results.mode === "standard" ? "Standard Mode" : "UCP Enhanced"}
                                    icon={results.mode === "standard" ? Sparkles : Zap}
                                    result={results[results.mode]}
                                    highlight={results.mode === "ucp"}
                                    ucpData={results.mode === "ucp" ? results.ucp.ucp_data : null}
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Transparency Panel */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6"
                >
                    <Card className="bg-black/50 border-[#ea00ea]/30 backdrop-blur-xl">
                        <CardHeader 
                            className="cursor-pointer hover:bg-[#ea00ea]/5 transition-colors"
                            onClick={() => setShowTransparency(!showTransparency)}
                        >
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-[#c3c3c3] flex items-center gap-2">
                                    <Info className="w-5 h-5 text-[#ea00ea]" />
                                    How UCP Reduces Tokens
                                </CardTitle>
                                {showTransparency ? (
                                    <ChevronUp className="w-5 h-5 text-[#c3c3c3]" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-[#c3c3c3]" />
                                )}
                            </div>
                        </CardHeader>
                        <AnimatePresence>
                            {showTransparency && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                >
                                    <CardContent className="space-y-4 text-[#c3c3c3]/80 text-sm">
                                        <div>
                                            <h4 className="font-semibold text-[#c3c3c3] mb-2">One-Time Interpretation</h4>
                                            <p>UCP analyzes prompts to extract reusable instruction patterns, creating deterministic "packets" that represent common task structures.</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-[#c3c3c3] mb-2">Reuse Deterministic Instructions</h4>
                                            <p>Once a packet is created, similar future prompts reference the cached packet instead of repeating full instructions, significantly reducing token overhead.</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-[#c3c3c3] mb-2">Minimize Repeated Context</h4>
                                            <p>Common phrases, instruction patterns, and formatting directives are compressed into compact references, preserving meaning while reducing verbosity.</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-[#c3c3c3] mb-2">Avoid Re-sending Large System Prompts</h4>
                                            <p>System-level instructions are factored out and reused across conversations, eliminating redundant token usage.</p>
                                        </div>
                                        <div className="pt-4 border-t border-[#ea00ea]/20">
                                            <p className="text-xs text-[#c3c3c3]/60">
                                                <strong>Note:</strong> This demonstration shows the structural benefits of UCP without exposing proprietary compression algorithms or implementation specifics.
                                            </p>
                                        </div>
                                    </CardContent>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                </motion.div>

                {/* Packet Statistics */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6"
                >
                    <Card className="bg-black/50 border-[#ea00ea]/30 backdrop-blur-xl">
                        <CardHeader 
                            className="cursor-pointer hover:bg-[#ea00ea]/5 transition-colors"
                            onClick={() => setShowPacketInfo(!showPacketInfo)}
                        >
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-[#c3c3c3] flex items-center gap-2">
                                    <Package className="w-5 h-5 text-[#ea00ea]" />
                                    Packet Cache Statistics
                                    <Badge className="bg-[#ea00ea]/20 text-[#ea00ea] border-[#ea00ea]/50">
                                        {packetStats.total_packets} packets
                                    </Badge>
                                </CardTitle>
                                {showPacketInfo ? (
                                    <ChevronUp className="w-5 h-5 text-[#c3c3c3]" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-[#c3c3c3]" />
                                )}
                            </div>
                        </CardHeader>
                        <AnimatePresence>
                            {showPacketInfo && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                >
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-[#c3c3c3] font-semibold mb-3">Packets by Intent</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {Object.entries(packetStats.by_intent).map(([intent, count]) => (
                                                        <div key={intent} className="bg-[#ea00ea]/10 border border-[#ea00ea]/20 rounded-lg p-3">
                                                            <div className="text-2xl font-bold text-[#ea00ea]">{count}</div>
                                                            <div className="text-xs text-[#c3c3c3]/70 capitalize">{intent}</div>
                                                        </div>
                                                    ))}
                                                    {packetStats.total_packets === 0 && (
                                                        <div className="col-span-full text-center text-[#c3c3c3]/50 py-4">
                                                            No packets cached yet. Run a UCP test to create packets.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {packetStats.total_packets > 0 && (
                                                <div className="pt-4 border-t border-[#ea00ea]/20 flex justify-between items-center">
                                                    <div className="text-sm text-[#c3c3c3]/70">
                                                        Cache size: {(packetStats.cache_size / 1024).toFixed(2)} KB
                                                    </div>
                                                    <Button
                                                        onClick={() => {
                                                            if (confirm('Clear all cached packets?')) {
                                                                UCPProcessor.clearPackets();
                                                                window.location.reload();
                                                            }
                                                        }}
                                                        variant="outline"
                                                        className="border-[#ea00ea]/30 text-[#c3c3c3] hover:bg-[#ea00ea]/10"
                                                    >
                                                        Clear Cache
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                </motion.div>

                {/* Diagnostics Panel */}
                {diagnostics && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-6"
                    >
                        <DiagnosticsPanel 
                            diagnostics={diagnostics}
                            show={showDiagnostics}
                            onToggle={() => setShowDiagnostics(!showDiagnostics)}
                        />
                    </motion.div>
                )}

                {/* Provider Settings Modal */}
                <AnimatePresence>
                    {showProviderSettings && (
                        <ProviderSettings onClose={() => setShowProviderSettings(false)} />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function UCPTest() {
    return (
        <ErrorBoundary>
            <UCPTestContent />
        </ErrorBoundary>
    );
}

// Result Card Component
function ResultCard({ title, icon: Icon, result, highlight, ucpData }) {
    const [showPrompt, setShowPrompt] = useState(false);

    return (
        <Card className={`${
            highlight
                ? "bg-gradient-to-br from-[#ea00ea]/20 to-transparent border-[#ea00ea] shadow-[0_0_30px_rgba(234,0,234,0.3)]"
                : "bg-black/50 border-[#ea00ea]/30"
        }`}>
            <CardHeader>
                <CardTitle className="text-[#c3c3c3] flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${highlight ? "text-[#ea00ea]" : "text-[#c3c3c3]"}`} />
                    {title}
                    {highlight && (
                        <Badge className="bg-gradient-to-r from-[#ea00ea] to-[#c3c3c3] ml-auto">
                            Optimized
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Output */}
                <div>
                    <label className="text-[#c3c3c3]/70 text-sm mb-2 block">Output</label>
                    <div className="bg-black/50 border border-[#ea00ea]/20 rounded-lg p-4 max-h-64 overflow-y-auto">
                        <p className="text-[#c3c3c3] text-sm whitespace-pre-wrap leading-relaxed">
                            {result.output}
                        </p>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/30 border border-[#ea00ea]/20 rounded-lg p-3">
                        <div className="text-xs text-[#c3c3c3]/60 mb-1">Token Count</div>
                        <div className="text-2xl font-bold text-[#c3c3c3]">
                            {TokenCounter.formatTokenCount(result.tokens.total_tokens)}
                        </div>
                        <div className="text-xs text-[#c3c3c3]/50 mt-1">
                           {result.tokens.prompt_tokens} prompt + {result.tokens.completion_tokens} completion
                           {result.tokens.estimated && (
                               <span className="text-yellow-400 ml-1">(estimated)</span>
                           )}
                        </div>
                        {result.tokens.transmitted_tokens !== undefined && (
                           <div className="text-xs text-green-400 mt-2 flex items-center gap-1">
                               <TrendingDown className="w-3 h-3" />
                               Transmitted: {result.tokens.transmitted_tokens} tokens
                               {result.provider === 'lm_studio' && (
                                   <span className="text-[#c3c3c3]/50 ml-1">(client→server)</span>
                               )}
                           </div>
                        )}
                    </div>
                    <div className="bg-black/30 border border-[#ea00ea]/20 rounded-lg p-3">
                        <div className="text-xs text-[#c3c3c3]/60 mb-1">Est. Cost</div>
                        <div className="text-2xl font-bold text-[#c3c3c3]">
                            {TokenCounter.formatCost(result.cost.total_cost)}
                        </div>
                        <div className="text-xs text-[#c3c3c3]/50 mt-1">
                            Per execution
                        </div>
                    </div>
                </div>

                {/* UCP Packet Info */}
                {ucpData && (
                    <div className="bg-gradient-to-br from-[#ea00ea]/10 to-transparent border border-[#ea00ea]/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Package className="w-4 h-4 text-[#ea00ea]" />
                            <span className="text-sm font-semibold text-[#c3c3c3]">UCP Packet Info</span>
                        </div>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-[#c3c3c3]/60">Packet ID:</span>
                                <span className="text-[#c3c3c3] font-mono">{ucpData.packet.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#c3c3c3]/60">Intent:</span>
                                <span className="text-[#ea00ea] capitalize">{ucpData.packet.intent}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#c3c3c3]/60">Version:</span>
                                <span className="text-[#c3c3c3]">v{ucpData.packet.version}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#c3c3c3]/60">Transmitted Tokens:</span>
                                <span className="text-green-400">{ucpData.transmitted_tokens}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#c3c3c3]/60">Token Savings:</span>
                                <span className="text-green-400">{ucpData.savings} tokens saved</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Show Prompt Button */}
                <Button
                    onClick={() => setShowPrompt(!showPrompt)}
                    variant="outline"
                    className="w-full border-[#ea00ea]/30 text-[#c3c3c3] hover:bg-[#ea00ea]/10"
                >
                    {showPrompt ? "Hide" : "Show"} Prompt Used
                    {showPrompt ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                </Button>

                <AnimatePresence>
                    {showPrompt && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-black/50 border border-[#ea00ea]/20 rounded-lg p-4 max-h-48 overflow-y-auto"
                        >
                            <pre className="text-[#c3c3c3] text-xs whitespace-pre-wrap font-mono">
                                {result.prompt_used}
                            </pre>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}