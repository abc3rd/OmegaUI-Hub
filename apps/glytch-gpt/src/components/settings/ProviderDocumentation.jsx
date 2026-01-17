import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProviderDocumentation() {
    const [expandedSection, setExpandedSection] = useState(null);

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const sections = [
        {
            id: 'granite_https',
            title: 'Enable Granite (LM Studio) on HTTPS Site',
            content: (
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-semibold text-[#c3c3c3] mb-2">Option A: Cloudflare Tunnel (Recommended)</h4>
                        <ol className="text-xs text-[#c3c3c3]/70 space-y-2 list-decimal list-inside">
                            <li>Install Cloudflare Tunnel on your LAN machine</li>
                            <li>Create a tunnel pointing to <code className="bg-black/50 px-1">http://100.119.81.65:1234</code></li>
                            <li>Get the HTTPS public URL</li>
                            <li>Paste the URL in "HTTPS Base URL" field in Provider Settings</li>
                            <li>Enable "Allow HTTPS from HTTPS site" toggle</li>
                        </ol>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-[#c3c3c3] mb-2">Option B: Local Testing (HTTP only)</h4>
                        <ol className="text-xs text-[#c3c3c3]/70 space-y-2 list-decimal list-inside">
                            <li>Deploy this app locally: <code className="bg-black/50 px-1">http://localhost:5173</code></li>
                            <li>Both app and LM Studio will be HTTP</li>
                            <li>No mixed-content issues</li>
                        </ol>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-[#c3c3c3] mb-2">Option C: Use Cloud Providers</h4>
                        <p className="text-xs text-[#c3c3c3]/70">
                            Configure OpenAI or OpenRouter API keys instead. These work on any public HTTPS site.
                        </p>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 mt-4">
                        <p className="text-xs text-blue-400">
                            <strong>Note:</strong> LM Studio on private IPs (10.*, 192.168.*, 172.16-31.*) cannot be accessed directly from HTTPS sites due to browser security.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'openai_key',
            title: 'Set Up OpenAI API Key',
            content: (
                <div className="space-y-4">
                    <ol className="text-xs text-[#c3c3c3]/70 space-y-2 list-decimal list-inside">
                        <li>Go to <a href="https://platform.openai.com/api/keys" target="_blank" rel="noopener" className="text-[#ea00ea] underline">OpenAI API Keys</a></li>
                        <li>Create a new API key</li>
                        <li>Copy the key (you'll only see it once)</li>
                        <li>Paste it in Provider Settings → OpenAI → API Key</li>
                        <li>Click "Test" to verify connectivity</li>
                    </ol>

                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 mt-4">
                        <p className="text-xs text-yellow-400">
                            <strong>Security:</strong> Never commit API keys to version control. Use environment variables in production.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'provider_switching',
            title: 'Switching Between Providers',
            content: (
                <div className="space-y-3">
                    <p className="text-xs text-[#c3c3c3]/70">
                        When you switch providers in the UCP Lab:
                    </p>
                    <ul className="text-xs text-[#c3c3c3]/70 space-y-2 list-disc list-inside">
                        <li><strong>Available providers</strong> (green) can be used immediately</li>
                        <li><strong>Unavailable providers</strong> (red) will be skipped with a reason</li>
                        <li>In "Compare Both" mode, results will show which providers were used</li>
                        <li>Failed comparisons will display clear error messages</li>
                    </ul>
                </div>
            )
        }
    ];

    return (
        <Card className="bg-black/50 border-[#ea00ea]/30">
            <CardHeader>
                <CardTitle className="text-[#c3c3c3] text-sm">
                    Provider Documentation
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {sections.map((section) => (
                    <div key={section.id} className="border border-[#ea00ea]/20 rounded">
                        <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full flex items-center justify-between p-3 hover:bg-[#ea00ea]/5 transition-colors"
                        >
                            <span className="text-xs font-semibold text-[#c3c3c3]">
                                {section.title}
                            </span>
                            {expandedSection === section.id ? (
                                <ChevronUp className="w-4 h-4 text-[#c3c3c3]/60" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-[#c3c3c3]/60" />
                            )}
                        </button>

                        <AnimatePresence>
                            {expandedSection === section.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-[#ea00ea]/20 p-3 bg-[#ea00ea]/5"
                                >
                                    {section.content}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}