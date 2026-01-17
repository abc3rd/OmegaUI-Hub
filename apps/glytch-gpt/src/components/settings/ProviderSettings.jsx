import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
    X, 
    Server, 
    CheckCircle2, 
    XCircle, 
    Loader2, 
    AlertTriangle,
    Copy,
    RefreshCw,
    ShieldAlert
} from "lucide-react";
import { motion } from "framer-motion";
import { ProviderSettings as Settings, getDiagnostics, isPrivateNetwork } from "@/components/providers";
import { getConnectivityMode, isCorsError } from "@/components/utils/net";
import { isHttpsContext, checkMixedContent } from "@/components/utils/https";
import { getProviderAvailability, PROVIDER_CONFIG } from "@/components/providers/state";
import ProviderDocumentation from "./ProviderDocumentation";
import { base44 } from "@/api/base44Client";

export default function ProviderSettings({ onClose }) {
    const [settings, setSettings] = useState(Settings.getDefaults());
    const [testing, setTesting] = useState({});
    const [healthResults, setHealthResults] = useState({});
    const [availability, setAvailability] = useState({});
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setSettings(Settings.load());
    }, []);

    // Check availability on mount and when settings change
    useEffect(() => {
        checkAvailability();
    }, [settings.lmStudio.baseUrl, settings.lmStudio.httpsBaseUrl, settings.lmStudio.allowHttpFromHttps]);

    // Auto-detect private IP and force direct mode
    useEffect(() => {
        const isPrivate = isPrivateNetwork(settings.lmStudio.baseUrl);
        if (isPrivate && settings.useServerProxy) {
            setSettings(prev => ({
                ...prev,
                useServerProxy: false
            }));
        }
    }, [settings.lmStudio.baseUrl]);

    const handleSave = () => {
        Settings.save(settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const checkAvailability = async () => {
        const lmStudioUrl = settings.lmStudio.httpsBaseUrl || settings.lmStudio.baseUrl;
        
        if (!lmStudioUrl) {
            setAvailability(prev => ({
                ...prev,
                lmStudio: { available: false, reason: 'No URL configured' }
            }));
            return;
        }

        const isHttps = isHttpsContext();
        const mixedContent = checkMixedContent(lmStudioUrl);
        const isPrivate = isPrivateNetwork(lmStudioUrl);

        // Check mixed content issue
        if (isHttps && mixedContent.hasMixedContent) {
            if (!settings.lmStudio.httpsBaseUrl && !settings.lmStudio.allowHttpFromHttps) {
                setAvailability(prev => ({
                    ...prev,
                    lmStudio: { available: false, reason: 'Mixed Content Blocked' }
                }));
                return;
            }
            
            if (!settings.lmStudio.httpsBaseUrl && settings.lmStudio.allowHttpFromHttps) {
                setAvailability(prev => ({
                    ...prev,
                    lmStudio: { available: true, reason: 'HTTP allowed (insecure)', warning: true }
                }));
                return;
            }
        }

        // Try to reach the endpoint
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const effectiveUrl = settings.lmStudio.httpsBaseUrl || settings.lmStudio.baseUrl;
            const testUrl = `${effectiveUrl.replace(/\/$/, '')}/models`;
            
            const response = await fetch(testUrl, {
                method: 'GET',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                setAvailability(prev => ({
                    ...prev,
                    lmStudio: { available: true, reason: 'Reachable' }
                }));
            } else {
                setAvailability(prev => ({
                    ...prev,
                    lmStudio: { available: false, reason: `HTTP ${response.status}` }
                }));
            }
        } catch (error) {
            const corsLikely = isCorsError(error);
            setAvailability(prev => ({
                ...prev,
                lmStudio: { 
                    available: false, 
                    reason: corsLikely ? 'CORS/Network Error' : 'Network Unreachable'
                }
            }));
        }
    };

    const testProvider = async (providerKey) => {
        setTesting(prev => ({ ...prev, [providerKey]: true }));
        
        try {
            // Create proxy function for health checks
            const proxyFn = async (params) => {
                const response = await base44.functions.invoke('proxyOpenAICompat', params);
                return response.data;
            };
            
            const diagnostics = await getDiagnostics(proxyFn);
            
            setHealthResults(prev => ({
                ...prev,
                [providerKey]: diagnostics.providers[providerKey] || { error: 'No result' }
            }));
            
            // Refresh availability after test
            await checkAvailability();
        } catch (error) {
            setHealthResults(prev => ({
                ...prev,
                [providerKey]: { error: error.message, reachable: false }
            }));
        } finally {
            setTesting(prev => ({ ...prev, [providerKey]: false }));
        }
    };

    const copyDiagnostics = async () => {
        const proxyFn = async (params) => {
            const response = await base44.functions.invoke('proxyOpenAICompat', params);
            return response.data;
        };
        
        const diagnostics = await getDiagnostics(proxyFn);
        const text = JSON.stringify(diagnostics, null, 2);
        
        await navigator.clipboard.writeText(text);
        alert('Diagnostics copied to clipboard');
    };

    const allowlist = [
        'http://100.119.81.65:1234',
        'http://100.119.81.65:1234/v1',
        'http://localhost:3000'
    ];

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
                className="bg-gradient-to-br from-black via-purple-950/20 to-black border border-[#ea00ea]/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="sticky top-0 bg-black/80 backdrop-blur-xl border-b border-[#ea00ea]/30 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ea00ea] to-[#c3c3c3] flex items-center justify-center">
                            <Server className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#ea00ea] to-[#c3c3c3] bg-clip-text text-transparent">
                                Provider Settings
                            </h2>
                            <p className="text-[#c3c3c3]/60 text-sm">Configure local and remote LLM providers</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={copyDiagnostics}
                            variant="outline"
                            size="icon"
                            className="border-[#ea00ea]/30 text-[#c3c3c3]"
                        >
                            <Copy className="w-5 h-5" />
                        </Button>
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            size="icon"
                            className="text-[#c3c3c3]"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Global Settings */}
                    <Card className="bg-black/50 border-[#ea00ea]/30">
                        <CardHeader>
                            <CardTitle className="text-[#c3c3c3]">Global Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={settings.useServerProxy}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        useServerProxy: e.target.checked
                                    })}
                                    disabled={isPrivateNetwork(settings.lmStudio.baseUrl)}
                                    className="w-4 h-4"
                                />
                                <label className="text-[#c3c3c3] text-sm">
                                    Use Server Proxy (for public endpoints only)
                                </label>
                            </div>
                            <p className="text-xs text-[#c3c3c3]/60 mt-1">
                                {isPrivateNetwork(settings.lmStudio.baseUrl) 
                                    ? "⚠️ Disabled for private networks - using direct browser mode"
                                    : "Routes requests through Base44 server to avoid CORS"}
                            </p>
                        </CardContent>
                    </Card>

                    {/* LM Studio Settings */}
                    <Card className="bg-black/50 border-[#ea00ea]/30">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CardTitle className="text-[#c3c3c3] flex items-center gap-2">
                                        LM Studio
                                        {isPrivateNetwork(settings.lmStudio.baseUrl) && (
                                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-xs">
                                                LAN/VPN Required
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    {/* Availability Indicator */}
                                    {availability.lmStudio && (
                                        <div className="flex items-center gap-2">
                                            {availability.lmStudio.available ? (
                                                <>
                                                    <CheckCircle2 className={`w-5 h-5 ${availability.lmStudio.warning ? 'text-yellow-400' : 'text-green-400'}`} />
                                                    <span className={`text-xs ${availability.lmStudio.warning ? 'text-yellow-400' : 'text-green-400'}`}>
                                                        {availability.lmStudio.reason}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-5 h-5 text-red-400" />
                                                    <span className="text-xs text-red-400">
                                                        {availability.lmStudio.reason}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <Button
                                    onClick={() => testProvider('lmStudio')}
                                    disabled={testing.lmStudio}
                                    size="sm"
                                    className="bg-gradient-to-r from-[#ea00ea] to-[#c3c3c3]"
                                >
                                    {testing.lmStudio ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="w-4 h-4" />
                                    )}
                                    <span className="ml-2">Test</span>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-[#c3c3c3] text-sm mb-2 block">
                                    HTTP Base URL
                                </label>
                                <Input
                                    value={settings.lmStudio.baseUrl}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        lmStudio: {
                                            ...settings.lmStudio,
                                            baseUrl: e.target.value
                                        }
                                    })}
                                    placeholder="http://100.119.81.65:1234/v1"
                                    className="bg-black/50 border-[#ea00ea]/30 text-[#c3c3c3]"
                                />
                                <p className="text-xs text-[#c3c3c3]/60 mt-1">
                                    Local HTTP endpoint (private network)
                                </p>
                            </div>

                            {isHttpsContext() && (
                                <>
                                    <div>
                                        <label className="text-[#c3c3c3] text-sm mb-2 block">
                                            HTTPS Base URL (optional)
                                        </label>
                                        <Input
                                            value={settings.lmStudio.httpsBaseUrl || ''}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                lmStudio: {
                                                    ...settings.lmStudio,
                                                    httpsBaseUrl: e.target.value
                                                }
                                            })}
                                            placeholder="https://granite.example.com/v1 (Cloudflare Tunnel)"
                                            className="bg-black/50 border-[#ea00ea]/30 text-[#c3c3c3]"
                                        />
                                        <p className="text-xs text-[#c3c3c3]/60 mt-1">
                                            HTTPS tunnel endpoint (e.g., Cloudflare Tunnel) for browser access
                                        </p>
                                    </div>

                                    {/* Allow HTTP from HTTPS Toggle */}
                                    {checkMixedContent(settings.lmStudio.baseUrl).hasMixedContent && !settings.lmStudio.httpsBaseUrl && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <label className="text-[#c3c3c3] text-sm font-medium flex items-center gap-2">
                                                        <ShieldAlert className="w-4 h-4 text-yellow-400" />
                                                        Allow HTTP from HTTPS site
                                                    </label>
                                                    <p className="text-xs text-[#c3c3c3]/60 mt-1">
                                                        Bypasses browser security (not recommended)
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={settings.lmStudio.allowHttpFromHttps || false}
                                                    onCheckedChange={(checked) => setSettings({
                                                        ...settings,
                                                        lmStudio: {
                                                            ...settings.lmStudio,
                                                            allowHttpFromHttps: checked
                                                        }
                                                    })}
                                                />
                                            </div>
                                            
                                            {settings.lmStudio.allowHttpFromHttps && (
                                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                                    <div className="flex items-start gap-2">
                                                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                                        <div className="text-xs text-[#c3c3c3]/80">
                                                            <strong className="text-red-400">Security Warning:</strong> Allowing HTTP requests from an HTTPS site bypasses browser mixed-content protection. Your data may be vulnerable to interception. This should only be used for local development.
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* HTTPS Context Warning - Mixed Content */}
                            {isHttpsContext() && checkMixedContent(settings.lmStudio.baseUrl).hasMixedContent && !settings.lmStudio.httpsBaseUrl && !settings.lmStudio.allowHttpFromHttps && (
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                                        <div className="text-xs text-[#c3c3c3]/80">
                                            <strong className="text-yellow-400">Mixed Content Blocked</strong>
                                            <br />
                                            This site is HTTPS, but your LM Studio URL is HTTP. Browsers block these requests for security.
                                            <br /><br />
                                            <strong>Solutions:</strong>
                                            <ul className="list-disc ml-4 mt-1 space-y-1">
                                                <li>Provide an HTTPS endpoint above (e.g., Cloudflare Tunnel)</li>
                                                <li>Enable "Allow HTTP from HTTPS site" toggle (insecure)</li>
                                                <li>Access this app over HTTP instead of HTTPS</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Private Network Banner */}
                            {isPrivateNetwork(settings.lmStudio.baseUrl) && (
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <Server className="w-4 h-4 text-blue-400 mt-0.5" />
                                        <div className="text-xs text-[#c3c3c3]/80">
                                            <strong className="text-blue-400">Local Network Mode (LAN/VPN)</strong>
                                            <br />
                                            Direct browser access only on private networks.
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                                    <div className="text-xs text-[#c3c3c3]/80">
                                        <strong>Security Notice:</strong> This provider requires LAN/VPN access. Do not expose publicly without authentication.
                                    </div>
                                </div>
                            </div>

                            {/* Health Result */}
                            {healthResults.lmStudio && (
                                <div className={`p-3 rounded-lg border ${
                                    healthResults.lmStudio.reachable
                                        ? 'bg-green-500/10 border-green-500/30'
                                        : 'bg-red-500/10 border-red-500/30'
                                }`}>
                                    <div className="flex items-start gap-2">
                                        {healthResults.lmStudio.reachable ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                                        )}
                                        <div className="flex-1 text-sm">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={healthResults.lmStudio.reachable ? 'text-green-400' : 'text-red-400'}>
                                                    {healthResults.lmStudio.reachable ? 'Reachable' : 'Unreachable'}
                                                </span>
                                                {healthResults.lmStudio.latencyMs && (
                                                    <span className="text-[#c3c3c3]/60">
                                                        {healthResults.lmStudio.latencyMs}ms
                                                    </span>
                                                )}
                                            </div>
                                            {healthResults.lmStudio.modelsCount !== undefined && (
                                                <div className="text-[#c3c3c3]/80 text-xs">
                                                    {healthResults.lmStudio.modelsCount} models available
                                                </div>
                                            )}
                                            {healthResults.lmStudio.error && (
                                                <div className="text-red-400 text-xs mt-1">
                                                    {healthResults.lmStudio.error}
                                                    {healthResults.lmStudio.corsLikely && (
                                                        <div className="text-yellow-400 mt-1">
                                                            💡 Cannot reach LM Studio from browser. Check:
                                                            <ul className="list-disc ml-4 mt-1">
                                                                <li>LM Studio is running</li>
                                                                <li>Network connectivity</li>
                                                                <li>CORS enabled in LM Studio</li>
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {healthResults.lmStudio.privateIpDetected && (
                                                <div className="text-blue-400 text-xs mt-1">
                                                    🔒 Private IP detected - using Direct Mode (proxy auto-disabled)
                                                </div>
                                            )}
                                            {healthResults.lmStudio.proxyDisabledReason && (
                                                <div className="text-[#c3c3c3]/60 text-xs mt-1">
                                                    ℹ️ {healthResults.lmStudio.proxyDisabledReason}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Open-WebUI Settings */}
                    <Card className="bg-black/50 border-[#ea00ea]/30">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-[#c3c3c3] flex items-center gap-2">
                                    Open-WebUI
                                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50 text-xs">
                                        Experimental
                                    </Badge>
                                </CardTitle>
                                <Button
                                    onClick={() => testProvider('openWebui')}
                                    disabled={testing.openWebui || !settings.openWebui.enabled}
                                    size="sm"
                                    className="bg-gradient-to-r from-[#ea00ea] to-[#c3c3c3]"
                                >
                                    {testing.openWebui ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="w-4 h-4" />
                                    )}
                                    <span className="ml-2">Test</span>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={settings.openWebui.enabled}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        openWebui: {
                                            ...settings.openWebui,
                                            enabled: e.target.checked
                                        }
                                    })}
                                    className="w-4 h-4"
                                />
                                <label className="text-[#c3c3c3] text-sm">
                                    Enable Open-WebUI Provider
                                </label>
                            </div>

                            <div>
                                <label className="text-[#c3c3c3] text-sm mb-2 block">
                                    Base URL
                                </label>
                                <Input
                                    value={settings.openWebui.baseUrl}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        openWebui: {
                                            ...settings.openWebui,
                                            baseUrl: e.target.value
                                        }
                                    })}
                                    disabled={!settings.openWebui.enabled}
                                    placeholder="http://localhost:3000"
                                    className="bg-black/50 border-[#ea00ea]/30 text-[#c3c3c3]"
                                />
                                <p className="text-xs text-[#c3c3c3]/60 mt-1">
                                    Open-WebUI API endpoint (varies by installation)
                                </p>
                            </div>

                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                                    <div className="text-xs text-[#c3c3c3]/80">
                                        <strong>Security Notice:</strong> This provider requires LAN/VPN access. Do not expose publicly without authentication.
                                    </div>
                                </div>
                            </div>

                            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5" />
                                    <div className="text-xs text-[#c3c3c3]/80">
                                        Open-WebUI API is not standardized and varies by version. Health checks are best-effort.
                                    </div>
                                </div>
                            </div>

                            {/* Health Result */}
                            {healthResults.openWebui && (
                                <div className={`p-3 rounded-lg border ${
                                    healthResults.openWebui.reachable
                                        ? 'bg-green-500/10 border-green-500/30'
                                        : 'bg-red-500/10 border-red-500/30'
                                }`}>
                                    <div className="flex items-start gap-2">
                                        {healthResults.openWebui.reachable ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                                        )}
                                        <div className="flex-1 text-sm">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={healthResults.openWebui.reachable ? 'text-green-400' : 'text-red-400'}>
                                                    {healthResults.openWebui.reachable ? 'Reachable' : 'Unreachable'}
                                                </span>
                                                {healthResults.openWebui.latencyMs && (
                                                    <span className="text-[#c3c3c3]/60">
                                                        {healthResults.openWebui.latencyMs}ms
                                                    </span>
                                                )}
                                            </div>
                                            {healthResults.openWebui.warning && (
                                                <div className="text-orange-400 text-xs mt-1">
                                                    {healthResults.openWebui.warning}
                                                </div>
                                            )}
                                            {healthResults.openWebui.error && (
                                                <div className="text-red-400 text-xs mt-1">
                                                    {healthResults.openWebui.error}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Allowlist */}
                    <Card className="bg-black/50 border-[#ea00ea]/30">
                        <CardHeader>
                            <CardTitle className="text-[#c3c3c3]">Server Proxy Allowlist</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {allowlist.map((url, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                                        <code className="text-[#c3c3c3] font-mono">{url}</code>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-[#c3c3c3]/60 mt-3">
                                Only these base URLs are permitted through the server proxy for security.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Provider Documentation */}
                    <ProviderDocumentation />

                    {/* Save Button */}
                    <Button
                        onClick={handleSave}
                        className="w-full bg-gradient-to-r from-[#ea00ea] to-[#c3c3c3] hover:shadow-[0_0_30px_rgba(234,0,234,0.6)]"
                    >
                        {saved ? (
                            <>
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                Saved!
                            </>
                        ) : (
                            'Save Settings'
                        )}
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
}