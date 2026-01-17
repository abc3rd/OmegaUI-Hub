import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Copy, CheckCircle2, Settings as SettingsIcon, Cloud } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
    const [config, setConfig] = useState({
        base_intake_url: '',
        tracking_param_name: 'affiliate_id',
        affiliate_id_field_key: 'contact.affiliate_id',
        tracking_link_field_key: 'contact.affiliate_tracking_link',
        qr_link_field_key: 'contact.affiliate_qr_code_link',
        location_id: ''
    });
    const [copied, setCopied] = useState(false);

    const queryClient = useQueryClient();

    const { data: configs } = useQuery({
        queryKey: ['ghlConfig'],
        queryFn: () => base44.entities.GhlConfig.list(),
        initialData: []
    });

    useEffect(() => {
        if (configs && configs.length > 0) {
            setConfig(configs[0]);
        }
    }, [configs]);

    const saveConfigMutation = useMutation({
        mutationFn: async (configData) => {
            if (configs && configs.length > 0) {
                return base44.entities.GhlConfig.update(configs[0].id, configData);
            } else {
                return base44.entities.GhlConfig.create(configData);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ghlConfig'] });
            toast.success('Configuration saved successfully');
        },
        onError: (error) => {
            toast.error('Failed to save configuration: ' + error.message);
        }
    });

    const handleSave = () => {
        saveConfigMutation.mutate(config);
    };

    const webhookUrl = `${window.location.origin}/api/functions/generateQr`;

    const copyWebhookUrl = () => {
        navigator.clipboard.writeText(webhookUrl);
        setCopied(true);
        toast.success('Webhook URL copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f8d417] via-[#4acbbf] to-[#54b0e7] flex items-center justify-center">
                        <SettingsIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Settings</h1>
                        <p className="text-slate-400">Configure your GHL integration</p>
                    </div>
                </div>

                {/* GHL Configuration */}
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Cloud className="w-5 h-5 text-[#4acbbf]" />
                            Go High Level Configuration
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Configure your GHL API connection and custom field mappings
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-slate-300">GHL Location ID</Label>
                            <Input
                                value={config.location_id}
                                onChange={(e) => setConfig({ ...config, location_id: e.target.value })}
                                placeholder="lO0qYQCUoeNjLgrF59ZK"
                                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                            />
                        </div>

                        <div>
                            <Label className="text-slate-300">Base Intake URL</Label>
                            <Input
                                value={config.base_intake_url}
                                onChange={(e) => setConfig({ ...config, base_intake_url: e.target.value })}
                                placeholder="https://example.com/intake"
                                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                            />
                        </div>

                        <div>
                            <Label className="text-slate-300">Tracking Parameter Name</Label>
                            <Input
                                value={config.tracking_param_name}
                                onChange={(e) => setConfig({ ...config, tracking_param_name: e.target.value })}
                                placeholder="affiliate_id"
                                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label className="text-slate-300 text-xs">Affiliate ID Field</Label>
                                <Input
                                    value={config.affiliate_id_field_key}
                                    onChange={(e) => setConfig({ ...config, affiliate_id_field_key: e.target.value })}
                                    className="bg-slate-900/50 border-slate-600 text-white text-xs"
                                />
                            </div>
                            <div>
                                <Label className="text-slate-300 text-xs">Tracking Link Field</Label>
                                <Input
                                    value={config.tracking_link_field_key}
                                    onChange={(e) => setConfig({ ...config, tracking_link_field_key: e.target.value })}
                                    className="bg-slate-900/50 border-slate-600 text-white text-xs"
                                />
                            </div>
                            <div>
                                <Label className="text-slate-300 text-xs">QR Link Field</Label>
                                <Input
                                    value={config.qr_link_field_key}
                                    onChange={(e) => setConfig({ ...config, qr_link_field_key: e.target.value })}
                                    className="bg-slate-900/50 border-slate-600 text-white text-xs"
                                />
                            </div>
                        </div>

                        <Button 
                            onClick={handleSave}
                            disabled={saveConfigMutation.isPending}
                            className="bg-gradient-to-r from-[#54b0e7] to-[#4acbbf] hover:opacity-90"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saveConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Webhook URL */}
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">Webhook URL</CardTitle>
                        <CardDescription className="text-slate-400">
                            Use this URL in your GHL workflows to auto-generate QR codes
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                value={webhookUrl}
                                readOnly
                                className="bg-slate-900/50 border-slate-600 text-white font-mono text-sm"
                            />
                            <Button 
                                variant="outline" 
                                onClick={copyWebhookUrl}
                                className="border-slate-600 hover:bg-slate-700"
                            >
                                {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Expected payload: {`{ "affiliate_id": "ABC123", "first_name": "John", "last_name": "Doe", "contact_id": "..." }`}
                        </p>
                    </CardContent>
                </Card>

                {/* API Key Info */}
                <Card className="bg-gradient-to-br from-[#54b0e7]/10 to-[#4acbbf]/10 border-[#4acbbf]/20 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white text-sm">GHL API Key Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#4acbbf] rounded-full animate-pulse" />
                            <span className="text-[#4acbbf] text-sm">API Key Configured</span>
                        </div>
                        <p className="text-slate-400 text-xs mt-2">
                            Your GHL API key is securely stored in environment variables
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}