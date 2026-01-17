import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Play, Terminal, BarChart3, Check, AlertCircle } from "lucide-react";

export default function Home() {
    // Compile state
    const [packetName, setPacketName] = useState("");
    const [longInstructions, setLongInstructions] = useState("");
    const [compiling, setCompiling] = useState(false);
    const [compileResult, setCompileResult] = useState(null);
    const [compileError, setCompileError] = useState(null);

    // Execute state
    const [packets, setPackets] = useState([]);
    const [selectedPacketId, setSelectedPacketId] = useState("");
    const [userInput, setUserInput] = useState("");
    const [mode, setMode] = useState("UCP_EXEC");
    const [executing, setExecuting] = useState(false);
    const [executeResult, setExecuteResult] = useState(null);
    const [executeError, setExecuteError] = useState(null);
    const [loadingPackets, setLoadingPackets] = useState(true);

    // Load packets on mount
    useEffect(() => {
        loadPackets();
    }, []);

    const loadPackets = async () => {
        setLoadingPackets(true);
        const response = await base44.functions.invoke("listPackets", {});
        if (response.data.error) {
            console.error(response.data.error);
        } else {
            setPackets(response.data.packets || []);
        }
        setLoadingPackets(false);
    };

    const handleCompile = async () => {
        if (!packetName.trim() || !longInstructions.trim()) return;
        
        setCompiling(true);
        setCompileError(null);
        setCompileResult(null);

        const response = await base44.functions.invoke("createPacket", {
            name: packetName,
            longInstructions: longInstructions
        });

        if (response.data.error) {
            setCompileError(response.data.error);
        } else {
            setCompileResult(response.data);
            setPacketName("");
            setLongInstructions("");
            loadPackets();
        }
        setCompiling(false);
    };

    const handleExecute = async () => {
        if (!selectedPacketId || !userInput.trim()) return;

        setExecuting(true);
        setExecuteError(null);
        setExecuteResult(null);

        const response = await base44.functions.invoke("executePacket", {
            packet_id: selectedPacketId,
            userInput: userInput,
            mode: mode
        });

        if (response.data.error) {
            setExecuteError(response.data.error);
        } else {
            setExecuteResult(response.data);
        }
        setExecuting(false);
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <div className="max-w-5xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Terminal className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h1 className="text-3xl font-light tracking-tight">Reusable AI Assistant Builder</h1>
                    </div>
                    <div className="pl-12 space-y-3">
                        <p className="text-zinc-300 text-base">
                            Teach once. Reuse forever. Save compute.
                        </p>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-2">
                            <p className="text-zinc-400 text-sm font-medium">How it works:</p>
                            <ol className="text-zinc-400 text-sm space-y-1 ml-4 list-decimal">
                                <li>Create an assistant by describing what you want it to do</li>
                                <li>Save it for later use</li>
                                <li>Anytime you need it, just pick the assistant and ask your question</li>
                            </ol>
                            <p className="text-zinc-500 text-xs pt-2">
                                Example: Create a "Code Reviewer" assistant, then use it whenever you need code feedback.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Section 1: Create a reusable assistant */}
                    <Card className="bg-zinc-900/50 border-zinc-800">
                        <CardHeader className="pb-4">
                            <div className="space-y-2">
                                <CardTitle className="flex items-center gap-2 text-lg font-medium text-zinc-100">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold">
                                        1
                                    </div>
                                    Create your first assistant
                                </CardTitle>
                                <p className="text-zinc-500 text-sm">
                                    Give your assistant a name and tell it what you want it to do.
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-zinc-300 text-sm font-medium">Assistant name</Label>
                                <Input
                                    value={packetName}
                                    onChange={(e) => setPacketName(e.target.value)}
                                    placeholder="Email Writer, Resume Reviewer, Code Helper, etc."
                                    className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                                />
                                <p className="text-zinc-600 text-xs">Choose a name that describes what this assistant will help you with.</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-300 text-sm font-medium">How should this assistant behave?</Label>
                                <Textarea
                                    value={longInstructions}
                                    onChange={(e) => setLongInstructions(e.target.value)}
                                    placeholder="Type the rules and style you want this assistant to follow…"
                                    rows={8}
                                    className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 text-sm leading-relaxed"
                                />
                                <p className="text-zinc-600 text-xs">Describe the style and rules this assistant should follow. Example: 'Be concise, use bullet points, and focus on clear actions.'</p>
                            </div>
                            <Button 
                                onClick={handleCompile} 
                                disabled={compiling || !packetName.trim() || !longInstructions.trim()}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                                {compiling ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Package className="w-4 h-4 mr-2" />
                                        Save assistant
                                    </>
                                )}
                            </Button>

                            {compileError && (
                                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                    <p className="text-red-400 text-sm">{compileError}</p>
                                </div>
                            )}

                            {compileResult && (
                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-400" />
                                        <span className="text-emerald-400 text-sm font-medium">Saved. Your assistant is ready to reuse.</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Section 2: Use your saved assistant */}
                    <Card className="bg-zinc-900/50 border-zinc-800">
                        <CardHeader className="pb-4">
                            <div className="space-y-2">
                                <CardTitle className="flex items-center gap-2 text-lg font-medium text-zinc-100">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold">
                                        2
                                    </div>
                                    Use your assistant
                                </CardTitle>
                                <p className="text-zinc-500 text-sm">
                                    {packets.length === 0 
                                        ? "Create an assistant above first, then come back here to use it."
                                        : "Pick one of your saved assistants and ask it anything."}
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {packets.length === 0 ? (
                                <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-lg text-center">
                                    <p className="text-amber-400 text-sm">
                                        👆 You haven't created any assistants yet. Start by creating one in the section above!
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-zinc-300 text-sm font-medium">Choose an assistant</Label>
                                            <Select value={selectedPacketId} onValueChange={setSelectedPacketId}>
                                                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-emerald-500/50 focus:ring-emerald-500/20">
                                                    <SelectValue placeholder={loadingPackets ? "Loading assistants..." : "No assistants created yet"} />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-900 border-zinc-800">
                                                    {packets.map((p) => (
                                                        <SelectItem 
                                                            key={p.packet_id} 
                                                            value={p.packet_id}
                                                            className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100"
                                                        >
                                                            {p.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-zinc-600 text-xs">Select which assistant you want to use.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-300 text-sm font-medium">Output preference</Label>
                                            <Select value={mode} onValueChange={setMode}>
                                                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-emerald-500/50 focus:ring-emerald-500/20">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-900 border-zinc-800">
                                                    <SelectItem value="RESULT_ONLY" className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100">
                                                        Just the answer
                                                    </SelectItem>
                                                    <SelectItem value="UCP_EXEC" className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100">
                                                        Answer + efficiency stats
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-zinc-600 text-xs">Most people want "Just the answer".</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300 text-sm font-medium">What do you want help with?</Label>
                                        <Textarea
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            placeholder="Ask a question or describe your task…"
                                            rows={5}
                                            className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 text-sm leading-relaxed"
                                        />
                                        <p className="text-zinc-600 text-xs">The assistant will use its instructions to help you with whatever you type here.</p>
                                    </div>
                                </>
                            )}
                            {packets.length > 0 && (
                                <>
                                    <Button 
                                        onClick={handleExecute} 
                                        disabled={executing || !selectedPacketId || !userInput.trim()}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white w-full md:w-auto"
                                        size="lg"
                                    >
                                        {executing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Running…
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4 mr-2" />
                                                Run assistant
                                            </>
                                        )}
                                    </Button>

                                    {executeError && (
                                        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-red-400 text-sm font-medium">Something went wrong</p>
                                                <p className="text-red-400/80 text-xs mt-1">{executeError}</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Section 3: Output */}
                    {executeResult && (
                        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/0 border-emerald-500/30 shadow-lg">
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-lg font-medium text-zinc-100">
                                            <Terminal className="w-5 h-5 text-emerald-400" />
                                            Assistant response
                                        </CardTitle>
                                        <p className="text-zinc-500 text-xs mt-1">Done.</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5">
                                    <pre className="whitespace-pre-wrap text-sm text-zinc-200 leading-relaxed">
                                        {executeResult.output}
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Section 4: Efficiency Stats */}
                    {executeResult?.usage && (
                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardHeader className="pb-4">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2 text-lg font-medium text-zinc-100">
                                        <BarChart3 className="w-4 h-4 text-emerald-400" />
                                        Efficiency stats
                                    </CardTitle>
                                    <p className="text-zinc-500 text-xs">Lower numbers mean less AI compute was used.</p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-zinc-800 hover:bg-transparent">
                                            <TableHead className="text-zinc-400">Metric</TableHead>
                                            <TableHead className="text-zinc-400 text-right">Tokens</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                                            <TableCell className="text-zinc-300">Input size</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-300 font-mono">
                                                    {executeResult.usage.prompt_tokens ?? "—"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                                            <TableCell className="text-zinc-300">Response size</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-300 font-mono">
                                                    {executeResult.usage.completion_tokens ?? "—"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                                            <TableCell className="text-zinc-300 font-medium">Total compute</TableCell>
                                            <TableCell className="text-right">
                                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-mono">
                                                    {executeResult.usage.total_tokens ?? "—"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                                {(!executeResult.usage.prompt_tokens && !executeResult.usage.completion_tokens && !executeResult.usage.total_tokens) && (
                                    <p className="text-zinc-600 text-xs mt-3 text-center">
                                        If these stay blank, your Granite server may not be reporting usage. The assistant will still work normally.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Saved Assistants List */}
                    {packets.length > 0 && (
                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardHeader className="pb-4">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2 text-lg font-medium text-zinc-100">
                                        <Package className="w-4 h-4 text-zinc-500" />
                                        Your Saved Assistants
                                        <Badge variant="outline" className="ml-2 bg-zinc-800 border-zinc-700 text-zinc-400">
                                            {packets.length}
                                        </Badge>
                                    </CardTitle>
                                    <p className="text-zinc-500 text-xs">All your assistants are stored here and ready to use anytime</p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {packets.map((p) => (
                                        <div 
                                            key={p.packet_id}
                                            className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
                                        >
                                            <div>
                                                <p className="text-zinc-200 text-sm font-medium">{p.name}</p>
                                                <p className="text-zinc-600 text-xs mt-1">
                                                    Created {p.created_at ? new Date(p.created_at).toLocaleDateString() : ""}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                                                Ready
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-zinc-800">
                    <div className="bg-zinc-900/30 rounded-lg p-6 space-y-3">
                        <p className="text-zinc-400 text-sm font-medium">💡 Quick Tips:</p>
                        <ul className="text-zinc-500 text-xs space-y-2 ml-4 list-disc">
                            <li>Be specific when creating assistants - the more detail you give, the better they work</li>
                            <li>You can create multiple assistants for different tasks (writing, coding, reviewing, etc.)</li>
                            <li>Once saved, use the same assistant over and over without repeating instructions</li>
                            <li>Choose "Just the answer" mode for cleaner results without technical details</li>
                        </ul>
                    </div>
                    <p className="text-zinc-600 text-xs text-center mt-6">
                        Built with Omega UI • Powered by Granite AI • Designed for efficiency
                    </p>
                </div>
            </div>
        </div>
    );
}