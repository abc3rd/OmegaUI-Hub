import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Copy, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DiagnosticsPanel({ diagnostics, show, onToggle }) {
    const [copied, setCopied] = React.useState(false);

    const copyDiagnostics = () => {
        const text = JSON.stringify(diagnostics, null, 2);
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!diagnostics) return null;

    return (
        <Card className="bg-black/50 border-[#ea00ea]/30 backdrop-blur-xl">
            <CardHeader 
                className="cursor-pointer hover:bg-[#ea00ea]/5 transition-colors"
                onClick={onToggle}
            >
                <div className="flex items-center justify-between">
                    <CardTitle className="text-[#c3c3c3] text-base">
                        Diagnostics
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                copyDiagnostics();
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-[#c3c3c3]"
                        >
                            {copied ? (
                                <CheckCircle2 className="w-4 h-4" />
                            ) : (
                                <Copy className="w-4 h-4" />
                            )}
                        </Button>
                        {show ? (
                            <ChevronUp className="w-5 h-5 text-[#c3c3c3]" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-[#c3c3c3]" />
                        )}
                    </div>
                </div>
            </CardHeader>
            <AnimatePresence>
                {show && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <CardContent className="space-y-3 text-sm">
                            {/* Request Info */}
                            <div>
                                <div className="text-[#c3c3c3] font-semibold mb-2">Request</div>
                                <div className="bg-black/50 border border-[#ea00ea]/20 rounded p-3 space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-[#c3c3c3]/60">Provider:</span>
                                        <span className="text-[#c3c3c3] font-mono text-xs">
                                            {diagnostics.provider || 'Unknown'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#c3c3c3]/60">Model:</span>
                                        <span className="text-[#c3c3c3] font-mono text-xs">
                                            {diagnostics.model || 'Unknown'}
                                        </span>
                                    </div>
                                    {diagnostics.baseUrl && (
                                        <div className="flex justify-between">
                                            <span className="text-[#c3c3c3]/60">Base URL:</span>
                                            <span className="text-[#c3c3c3] font-mono text-xs">
                                                {diagnostics.baseUrl}
                                            </span>
                                        </div>
                                    )}
                                    {diagnostics.endpoint && (
                                        <div className="flex justify-between">
                                            <span className="text-[#c3c3c3]/60">Endpoint:</span>
                                            <span className="text-[#c3c3c3] font-mono text-xs">
                                                {diagnostics.endpoint}
                                            </span>
                                        </div>
                                    )}
                                    {diagnostics.privateIpDetected !== undefined && (
                                        <div className="flex justify-between">
                                            <span className="text-[#c3c3c3]/60">Private IP:</span>
                                            <span className={`font-mono text-xs ${
                                                diagnostics.privateIpDetected ? 'text-blue-400' : 'text-[#c3c3c3]'
                                            }`}>
                                                {diagnostics.privateIpDetected ? 'Yes (LAN)' : 'No (Public)'}
                                            </span>
                                        </div>
                                    )}
                                    {diagnostics.proxyDisabledReason && (
                                        <div className="col-span-2 bg-blue-500/10 border border-blue-500/30 rounded p-2 mt-2">
                                            <div className="text-xs text-blue-400">
                                                {diagnostics.proxyDisabledReason}
                                            </div>
                                        </div>
                                    )}
                                    {diagnostics.directFetchStatus && (
                                        <div className="flex justify-between">
                                            <span className="text-[#c3c3c3]/60">Direct Fetch:</span>
                                            <span className={`font-mono text-xs ${
                                                diagnostics.directFetchStatus === 'success' ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                                {diagnostics.directFetchStatus}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Response Info */}
                            {diagnostics.status !== undefined && (
                                <div>
                                    <div className="text-[#c3c3c3] font-semibold mb-2">Response</div>
                                    <div className="bg-black/50 border border-[#ea00ea]/20 rounded p-3 space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#c3c3c3]/60">HTTP Status:</span>
                                            <span className="flex items-center gap-2">
                                                {diagnostics.status === 200 ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-red-400" />
                                                )}
                                                <span className={`font-mono text-xs ${
                                                    diagnostics.status === 200 ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                    {diagnostics.status}
                                                </span>
                                            </span>
                                        </div>
                                        {diagnostics.latencyMs !== undefined && (
                                            <div className="flex justify-between">
                                                <span className="text-[#c3c3c3]/60">Latency:</span>
                                                <span className="text-[#c3c3c3] font-mono text-xs">
                                                    {diagnostics.latencyMs}ms
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Error Info */}
                            {diagnostics.error && (
                                <div>
                                    <div className="text-red-400 font-semibold mb-2">Error</div>
                                    <div className="bg-red-500/10 border border-red-500/30 rounded p-3 space-y-2">
                                        <code className="text-xs text-red-400 whitespace-pre-wrap">
                                            {diagnostics.error}
                                        </code>
                                        {diagnostics.corsLikely && (
                                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2 mt-2">
                                                <div className="text-xs text-yellow-400">
                                                    <strong>CORS Detected:</strong> Cannot reach LM Studio from browser.
                                                    <ul className="list-disc ml-4 mt-1">
                                                        <li>Enable CORS in LM Studio settings</li>
                                                        <li>Check network connectivity</li>
                                                        <li>Verify LM Studio is running</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Token Info */}
                            {diagnostics.tokens && (
                                <div>
                                    <div className="text-[#c3c3c3] font-semibold mb-2">Tokens</div>
                                    <div className="bg-black/50 border border-[#ea00ea]/20 rounded p-3 space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-[#c3c3c3]/60">Transmitted:</span>
                                            <span className="text-green-400 font-mono text-xs">
                                                {diagnostics.tokens.transmitted || diagnostics.tokens.total_tokens}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#c3c3c3]/60">Prompt:</span>
                                            <span className="text-[#c3c3c3] font-mono text-xs">
                                                {diagnostics.tokens.prompt_tokens}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#c3c3c3]/60">Completion:</span>
                                            <span className="text-[#c3c3c3] font-mono text-xs">
                                                {diagnostics.tokens.completion_tokens}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#c3c3c3]/60">Total (Model):</span>
                                            <span className="text-[#c3c3c3] font-mono text-xs">
                                                {diagnostics.tokens.total_tokens}
                                                {diagnostics.tokens.estimated && (
                                                    <span className="text-[#c3c3c3]/50 ml-1">(est)</span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}