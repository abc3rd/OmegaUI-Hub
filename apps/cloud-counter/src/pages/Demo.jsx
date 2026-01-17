import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AuthGate from "../components/AuthGate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Play, Zap, Send, ExternalLink, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function Demo() {
  const [prompt, setPrompt] = useState("Explain quantum computing in simple terms.");
  const [workflowId, setWorkflowId] = useState("");
  const [model, setModel] = useState("");
  const [avgPowerW, setAvgPowerW] = useState(150);
  const [models, setModels] = useState([]);
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  
  const [baselineResult, setBaselineResult] = useState(null);
  const [ucpPacket, setUcpPacket] = useState(null);
  const [ucpResult, setUcpResult] = useState(null);
  const [cloudCounterStatus, setCloudCounterStatus] = useState(null);
  
  const [isRunningBaseline, setIsRunningBaseline] = useState(false);
  const [isCompilingPacket, setIsCompilingPacket] = useState(false);
  const [isRunningUcp, setIsRunningUcp] = useState(false);
  const [isSendingToCloud, setIsSendingToCloud] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const { data } = await base44.functions.invoke('ollamaTags', {});
      if (data.available && data.models.length > 0) {
        setModels(data.models);
        setModel(data.models[0].name);
        setOllamaAvailable(true);
      } else {
        setOllamaAvailable(false);
        toast.error("Ollama not available. Please ensure Ollama is running.");
      }
    } catch (error) {
      console.error("Error loading models:", error);
      setOllamaAvailable(false);
    }
  };

  const generateWorkflowId = () => {
    return `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const estimateTokens = (text) => {
    // Rough approximation: 1 token ~= 4 characters
    return Math.ceil(text.length / 4);
  };

  const runBaseline = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!model) {
      toast.error("Please select a model");
      return;
    }

    const wfId = workflowId.trim() || generateWorkflowId();
    setWorkflowId(wfId);

    setIsRunningBaseline(true);
    const startTime = performance.now();

    try {
      const { data } = await base44.functions.invoke('ollamaChat', {
        model,
        messages: [{ role: "user", content: prompt }],
        stream: false
      });

      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      // Extract tokens or estimate
      let promptTokens = data.prompt_eval_count;
      let completionTokens = data.eval_count;
      let estimatedTokens = false;

      if (!promptTokens || !completionTokens) {
        promptTokens = estimateTokens(prompt);
        completionTokens = estimateTokens(data.message.content);
        estimatedTokens = true;
      }

      // Calculate energy
      const timeHours = latencyMs / 1000 / 3600;
      const energyWh = avgPowerW * timeHours;

      const result = {
        response: data.message.content,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        latencyMs,
        energyWh,
        estimatedTokens,
        model,
        workflowId: wfId
      };

      // Create Session record
      await base44.entities.Session.create({
        appName: "UCP Demo Runner",
        workflowId: wfId,
        runType: "baseline",
        model,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        latencyMs,
        energyWh,
        energyMode: "estimated",
        avgPowerW,
        source: "ollama",
        notes: estimatedTokens ? "Tokens estimated (char/4)" : "Tokens from provider"
      });

      setBaselineResult(result);
      toast.success("Baseline run completed and logged!");
    } catch (error) {
      console.error("Baseline run error:", error);
      toast.error(`Baseline failed: ${error.message}`);
    }

    setIsRunningBaseline(false);
  };

  const compilePacket = async () => {
    if (!baselineResult) {
      toast.error("Please run baseline first");
      return;
    }

    setIsCompilingPacket(true);

    try {
      // Create a compact UCP packet
      const packet = {
        id: `ucp-${Date.now()}`,
        original: prompt,
        compressed: prompt.split(' ').map(w => w.substring(0, 3)).join(''),
        model,
        timestamp: new Date().toISOString()
      };

      setUcpPacket(packet);
      toast.success("UCP packet compiled!");
    } catch (error) {
      console.error("Packet compilation error:", error);
      toast.error(`Packet compilation failed: ${error.message}`);
    }

    setIsCompilingPacket(false);
  };

  const runUcp = async () => {
    if (!ucpPacket) {
      toast.error("Please compile UCP packet first");
      return;
    }

    setIsRunningUcp(true);
    const startTime = performance.now();

    try {
      // UCP wrapper: minimal prompt with packet reference
      const ucpPrompt = `[UCP:${ucpPacket.id}] ${ucpPacket.compressed}`;

      const { data } = await base44.functions.invoke('ollamaChat', {
        model,
        messages: [{ role: "user", content: ucpPrompt }],
        stream: false
      });

      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      // Extract tokens or estimate
      let promptTokens = data.prompt_eval_count;
      let completionTokens = data.eval_count;
      let estimatedTokens = false;

      if (!promptTokens || !completionTokens) {
        promptTokens = estimateTokens(ucpPrompt);
        completionTokens = estimateTokens(data.message.content);
        estimatedTokens = true;
      }

      // Calculate energy
      const timeHours = latencyMs / 1000 / 3600;
      const energyWh = avgPowerW * timeHours;

      const result = {
        response: data.message.content,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        latencyMs,
        energyWh,
        estimatedTokens,
        model,
        workflowId: baselineResult.workflowId,
        ucpPacketId: ucpPacket.id
      };

      // Create Session record
      await base44.entities.Session.create({
        appName: "UCP Demo Runner",
        workflowId: baselineResult.workflowId,
        runType: "ucp",
        model,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        latencyMs,
        energyWh,
        energyMode: "estimated",
        avgPowerW,
        ucpPacketId: ucpPacket.id,
        source: "ollama",
        notes: estimatedTokens ? "Tokens estimated (char/4)" : "Tokens from provider"
      });

      setUcpResult(result);
      toast.success("UCP run completed and logged!");
    } catch (error) {
      console.error("UCP run error:", error);
      toast.error(`UCP run failed: ${error.message}`);
    }

    setIsRunningUcp(false);
  };

  const viewResults = () => {
    if (baselineResult && ucpResult) {
      window.location.href = createPageUrl("Dashboard");
    }
  };

  const calculateSavings = () => {
    if (!baselineResult || !ucpResult) return null;

    const tokenSavings = ((baselineResult.totalTokens - ucpResult.totalTokens) / baselineResult.totalTokens * 100).toFixed(1);
    const latencySavings = ((baselineResult.latencyMs - ucpResult.latencyMs) / baselineResult.latencyMs * 100).toFixed(1);
    
    // Estimate energy (using 180W average for Ollama)
    const baselineEnergy = (180 * baselineResult.latencyMs / 1000 / 3600).toFixed(4);
    const ucpEnergy = (180 * ucpResult.latencyMs / 1000 / 3600).toFixed(4);
    const energySavings = ((parseFloat(baselineEnergy) - parseFloat(ucpEnergy)) / parseFloat(baselineEnergy) * 100).toFixed(1);

    return {
      tokenSavings,
      latencySavings,
      baselineEnergy,
      ucpEnergy,
      energySavings
    };
  };

  const savings = calculateSavings();

  return (
    <AuthGate>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">UCP Demo Runner</h1>
          <p className="text-slate-400">Run baseline vs UCP comparisons and log to Cloud Counter</p>
          {!ollamaAvailable && (
            <Badge className="mt-4 bg-red-500/20 text-red-300 border-red-500/30">
              <AlertCircle className="w-3 h-3 mr-1" />
              Ollama Not Available
            </Badge>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Configuration</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="prompt" className="text-white">Prompt</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter your prompt..."
                />
              </div>
              
              <div>
                <Label htmlFor="workflowId" className="text-white">Workflow ID (auto-generated if blank)</Label>
                <Input
                  id="workflowId"
                  value={workflowId}
                  onChange={(e) => setWorkflowId(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Leave blank to auto-generate"
                />
              </div>

              <div>
                <Label htmlFor="model" className="text-white">Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select model..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {models.map(m => (
                      <SelectItem key={m.name} value={m.name} className="text-white">
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="avgPowerW" className="text-white">Avg Power (W) for estimation</Label>
                <Input
                  id="avgPowerW"
                  type="number"
                  value={avgPowerW}
                  onChange={(e) => setAvgPowerW(parseFloat(e.target.value))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="150"
                />
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Actions</h2>
            <div className="space-y-3">
              <Button
                onClick={runBaseline}
                disabled={isRunningBaseline || !ollamaAvailable}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                {isRunningBaseline ? "Running..." : "1. Run Baseline"}
              </Button>

              <Button
                onClick={compilePacket}
                disabled={!baselineResult || isCompilingPacket}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Zap className="w-4 h-4 mr-2" />
                {isCompilingPacket ? "Compiling..." : "2. Compile UCP Packet"}
              </Button>

              <Button
                onClick={runUcp}
                disabled={!ucpPacket || isRunningUcp}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                {isRunningUcp ? "Running..." : "3. Run UCP"}
              </Button>

              <Button
                onClick={viewResults}
                disabled={!baselineResult || !ucpResult}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                4. View Results in Dashboard
              </Button>
            </div>

            {ucpPacket && (
              <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                <p className="text-slate-400 text-xs mb-1">UCP Packet ID:</p>
                <p className="text-white text-sm font-mono">{ucpPacket.id}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Results Comparison */}
        {baselineResult && ucpResult && savings && (
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Results Comparison</h2>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 p-4">
                <p className="text-slate-300 text-sm mb-1">Token Savings</p>
                <p className="text-3xl font-bold text-emerald-400">-{savings.tokenSavings}%</p>
              </Card>
              <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 p-4">
                <p className="text-slate-300 text-sm mb-1">Energy Savings</p>
                <p className="text-3xl font-bold text-cyan-400">-{savings.energySavings}%</p>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/30 p-4">
                <p className="text-slate-300 text-sm mb-1">Latency Improvement</p>
                <p className="text-3xl font-bold text-purple-400">-{savings.latencySavings}%</p>
              </Card>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Metric</TableHead>
                  <TableHead className="text-slate-300">Baseline</TableHead>
                  <TableHead className="text-slate-300">UCP</TableHead>
                  <TableHead className="text-slate-300">Savings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-slate-700">
                  <TableCell className="text-white">Total Tokens</TableCell>
                  <TableCell className="text-slate-300">
                    {baselineResult.totalTokens.toLocaleString()}
                    {baselineResult.estimatedTokens && <Badge className="ml-2 text-xs">est.</Badge>}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {ucpResult.totalTokens.toLocaleString()}
                    {ucpResult.estimatedTokens && <Badge className="ml-2 text-xs">est.</Badge>}
                  </TableCell>
                  <TableCell className="text-emerald-400 font-bold">-{savings.tokenSavings}%</TableCell>
                </TableRow>
                <TableRow className="border-slate-700">
                  <TableCell className="text-white">Latency (ms)</TableCell>
                  <TableCell className="text-slate-300">{baselineResult.latencyMs}</TableCell>
                  <TableCell className="text-slate-300">{ucpResult.latencyMs}</TableCell>
                  <TableCell className="text-purple-400 font-bold">-{savings.latencySavings}%</TableCell>
                </TableRow>
                <TableRow className="border-slate-700">
                  <TableCell className="text-white">Energy (Wh)</TableCell>
                  <TableCell className="text-slate-300">{savings.baselineEnergy}</TableCell>
                  <TableCell className="text-slate-300">{savings.ucpEnergy}</TableCell>
                  <TableCell className="text-cyan-400 font-bold">-{savings.energySavings}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="mt-6 flex gap-4">
              <Link to={createPageUrl("Dashboard")} className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300">
                <ExternalLink className="w-4 h-4" />
                View in Dashboard
              </Link>
              <Link to={`${createPageUrl("Sessions")}?workflowId=${baselineResult.workflowId}`} className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300">
                <ExternalLink className="w-4 h-4" />
                View Sessions
              </Link>
            </div>
          </Card>
        )}

        {/* Response Preview */}
        {(baselineResult || ucpResult) && (
          <div className="grid md:grid-cols-2 gap-6">
            {baselineResult && (
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-md p-6">
                <h3 className="text-lg font-bold text-white mb-3">Baseline Response</h3>
                <div className="bg-slate-900 rounded-lg p-4 text-slate-300 text-sm max-h-64 overflow-y-auto">
                  {baselineResult.response}
                </div>
              </Card>
            )}
            {ucpResult && (
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-md p-6">
                <h3 className="text-lg font-bold text-white mb-3">UCP Response</h3>
                <div className="bg-slate-900 rounded-lg p-4 text-slate-300 text-sm max-h-64 overflow-y-auto">
                  {ucpResult.response}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
    </AuthGate>
  );
}