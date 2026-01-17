import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode as QrIcon, Download, ExternalLink, Zap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function QrGenerator() {
    const [affiliateData, setAffiliateData] = useState({
        affiliate_id: '',
        first_name: '',
        last_name: '',
        contact_id: ''
    });
    const [generatedQr, setGeneratedQr] = useState(null);

    const { data: configs } = useQuery({
        queryKey: ['ghlConfig'],
        queryFn: () => base44.entities.GhlConfig.list(),
        initialData: []
    });

    const config = configs && configs.length > 0 ? configs[0] : null;

    const generateQrMutation = useMutation({
        mutationFn: async (data) => {
            if (!config || !config.base_intake_url) {
                throw new Error('Please configure your base intake URL in Settings first');
            }

            const response = await base44.functions.invoke('generateQr', {
                ...data,
                base_intake_url: config.base_intake_url,
                tracking_param_name: config.tracking_param_name || 'affiliate_id'
            });

            return response.data;
        },
        onSuccess: (data) => {
            setGeneratedQr(data);
            toast.success('QR code generated successfully!');
        },
        onError: (error) => {
            toast.error('Failed to generate QR: ' + error.message);
        }
    });

    const handleGenerate = () => {
        if (!affiliateData.affiliate_id) {
            toast.error('Please enter an Affiliate ID');
            return;
        }
        generateQrMutation.mutate(affiliateData);
    };

    const handleTestQr = () => {
        const testData = {
            affiliate_id: 'TEST' + Date.now(),
            first_name: 'Test',
            last_name: 'User',
            contact_id: ''
        };
        setAffiliateData(testData);
        generateQrMutation.mutate(testData);
    };

    const downloadQr = () => {
        if (generatedQr?.qr_code_url) {
            window.open(generatedQr.qr_code_url, '_blank');
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f8d417] via-[#4acbbf] to-[#54b0e7] flex items-center justify-center">
                            <QrIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">QR Generator</h1>
                            <p className="text-slate-400">Create affiliate tracking QR codes</p>
                        </div>
                    </div>
                    <Button 
                        variant="outline"
                        onClick={handleTestQr}
                        disabled={generateQrMutation.isPending || !config}
                        className="border-[#f8d417] text-[#f8d417] hover:bg-[#f8d417]/10"
                    >
                        <Zap className="w-4 h-4 mr-2" />
                        Test QR
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input Form */}
                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white">Affiliate Information</CardTitle>
                            <CardDescription className="text-slate-400">
                                Enter affiliate details to generate QR code
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-slate-300">Affiliate ID *</Label>
                                <Input
                                    value={affiliateData.affiliate_id}
                                    onChange={(e) => setAffiliateData({ ...affiliateData, affiliate_id: e.target.value })}
                                    placeholder="ABC123"
                                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-slate-300">First Name</Label>
                                    <Input
                                        value={affiliateData.first_name}
                                        onChange={(e) => setAffiliateData({ ...affiliateData, first_name: e.target.value })}
                                        placeholder="John"
                                        className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                                    />
                                </div>
                                <div>
                                    <Label className="text-slate-300">Last Name</Label>
                                    <Input
                                        value={affiliateData.last_name}
                                        onChange={(e) => setAffiliateData({ ...affiliateData, last_name: e.target.value })}
                                        placeholder="Doe"
                                        className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="text-slate-300">GHL Contact ID (optional)</Label>
                                <Input
                                    value={affiliateData.contact_id}
                                    onChange={(e) => setAffiliateData({ ...affiliateData, contact_id: e.target.value })}
                                    placeholder="Contact ID from GHL"
                                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    If provided, custom fields will be auto-updated in GHL
                                </p>
                            </div>

                            <Button 
                                onClick={handleGenerate}
                                disabled={generateQrMutation.isPending || !config}
                                className="w-full bg-gradient-to-r from-[#54b0e7] to-[#4acbbf] hover:opacity-90"
                            >
                                <QrIcon className="w-4 h-4 mr-2" />
                                {generateQrMutation.isPending ? 'Generating...' : 'Generate QR Code'}
                            </Button>

                            {!config && (
                                <p className="text-sm text-[#f66c25] bg-[#f66c25]/10 p-3 rounded-lg">
                                    ⚠️ Please configure your settings first
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Generated QR Display */}
                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white">Generated QR Code</CardTitle>
                            <CardDescription className="text-slate-400">
                                Your affiliate tracking QR code
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {generatedQr ? (
                                <div className="space-y-4">
                                    <div className="bg-white p-6 rounded-xl flex items-center justify-center">
                                        <img 
                                            src={generatedQr.qr_code_url} 
                                            alt="Generated QR Code"
                                            className="w-64 h-64 object-contain"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-[#4acbbf]" />
                                            <span className="text-slate-300">Tracking URL:</span>
                                        </div>
                                        <div className="bg-slate-900/50 p-3 rounded-lg break-all text-xs text-slate-400 font-mono">
                                            {generatedQr.tracking_url}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button 
                                            onClick={downloadQr}
                                            className="flex-1 bg-[#54b0e7] hover:bg-[#54b0e7]/90"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download
                                        </Button>
                                        <Button 
                                            onClick={() => window.open(generatedQr.tracking_url, '_blank')}
                                            variant="outline"
                                            className="flex-1 border-slate-600 hover:bg-slate-700"
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Test Link
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                                    <QrIcon className="w-16 h-16 mb-4 opacity-20" />
                                    <p className="text-sm">No QR code generated yet</p>
                                    <p className="text-xs">Fill in the form and click Generate</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Info Card */}
                <Card className="bg-gradient-to-br from-[#f8d417]/10 to-[#f66c25]/10 border-[#f8d417]/20 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <h3 className="text-white font-semibold mb-2">How it works</h3>
                        <ul className="space-y-2 text-sm text-slate-300">
                            <li className="flex items-start gap-2">
                                <span className="text-[#f8d417] mt-1">•</span>
                                <span>Enter affiliate information and generate a unique QR code</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[#4acbbf] mt-1">•</span>
                                <span>QR code contains tracking URL with affiliate ID parameter</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[#54b0e7] mt-1">•</span>
                                <span>If GHL contact ID provided, custom fields are automatically updated</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[#f66c25] mt-1">•</span>
                                <span>Download and share the QR code with your affiliates</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}