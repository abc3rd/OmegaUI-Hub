import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { X, Brain, AlertTriangle, Volume2, MessageSquare, Sparkles, Eye } from "lucide-react";

export default function SettingsPanel({ settings, onSettingsChange, onClose, voices }) {
    const handleSliderChange = (key, value) => {
        onSettingsChange(prev => ({ ...prev, [key]: value[0] }));
    };
    
    const handleSelectChange = (key, value) => {
        onSettingsChange(prev => ({ ...prev, [key]: value }));
    };

    const handleSwitchChange = (key, checked) => {
        onSettingsChange(prev => ({ ...prev, [key]: checked }));
    };

    return (
        <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-gradient-to-br from-gray-900 via-black to-gray-900 border-l border-cyan-500/50 shadow-2xl shadow-cyan-500/20 p-6 z-50 text-white overflow-y-auto"
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Murphy Settings
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">Configure your AI experience</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-cyan-500/20">
                    <X className="h-6 w-6 text-cyan-400" />
                </Button>
            </div>

            <Tabs defaultValue="intelligence" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 mb-6">
                    <TabsTrigger value="intelligence" className="data-[state=active]:bg-cyan-500/20">
                        <Brain className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="voice" className="data-[state=active]:bg-cyan-500/20">
                        <Volume2 className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="response" className="data-[state=active]:bg-cyan-500/20">
                        <MessageSquare className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="visual" className="data-[state=active]:bg-cyan-500/20">
                        <Eye className="w-4 h-4" />
                    </TabsTrigger>
                </TabsList>

                {/* Intelligence Tab */}
                <TabsContent value="intelligence" className="space-y-6">
                    <div className="bg-gray-800/30 rounded-xl p-5 border border-cyan-500/20">
                        <Label className="text-lg text-cyan-400 flex items-center gap-2 mb-4">
                            <Brain className="w-5 h-5" />
                            Cognitive Intelligence
                        </Label>
                        <p className="text-sm text-gray-400 mb-4">
                            Control the AI's reasoning depth and analytical capabilities.
                        </p>
                        
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-baseline mb-2">
                                    <Label htmlFor="intelligence" className="text-sm">Cognitive Level</Label>
                                    <span className="text-cyan-300 font-mono text-sm px-2 py-1 bg-cyan-500/20 rounded">
                                        {settings.intelligence < 30 ? '⚡ Basic' : 
                                         settings.intelligence < 70 ? '🧠 Advanced' : '🚀 Genius'}
                                    </span>
                                </div>
                                <Slider
                                    id="intelligence"
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={[settings.intelligence]}
                                    onValueChange={(val) => handleSliderChange('intelligence', val)}
                                    className="mb-2"
                                />
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Basic</span>
                                    <span>Advanced</span>
                                    <span>Genius</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-3 p-2 bg-gray-900/50 rounded">
                                    💡 Higher levels enable complex reasoning, sophisticated vocabulary, and deeper contextual analysis.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-cyan-500/20" />

                    {/* Content Protocol */}
                    <div className="bg-red-900/20 rounded-xl p-5 border border-red-500/30">
                        <Label className="text-lg text-red-400 flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-5 h-5" />
                            Content Protocol
                        </Label>
                        <p className="text-sm text-gray-400 mb-4">
                            Control content generation boundaries and restrictions.
                        </p>
                        <div className="flex items-center justify-between p-3 bg-red-900/30 rounded-lg border border-red-500/50">
                            <div className="flex-1">
                                <Label htmlFor="unrestrictedMode" className="font-semibold text-red-300">
                                    Unrestricted Mode
                                </Label>
                                <p className="text-xs text-red-300/80 mt-1">
                                    Removes content filters and safety guidelines
                                </p>
                            </div>
                            <Switch
                                id="unrestrictedMode"
                                checked={settings.unrestrictedMode}
                                onCheckedChange={(checked) => handleSwitchChange('unrestrictedMode', checked)}
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* Voice Tab */}
                <TabsContent value="voice" className="space-y-6">
                    <div className="bg-gray-800/30 rounded-xl p-5 border border-cyan-500/20">
                        <Label className="text-lg text-cyan-400 flex items-center gap-2 mb-4">
                            <Volume2 className="w-5 h-5" />
                            Voice Configuration
                        </Label>
                        
                        <div className="space-y-5">
                            <div>
                                <Label className="text-sm mb-2 block">Voice Selection</Label>
                                <Select
                                    value={settings.voice || ''}
                                    onValueChange={(value) => handleSelectChange('voice', value)}
                                >
                                    <SelectTrigger className="bg-gray-900/50 border-cyan-500/50 text-white">
                                        <SelectValue placeholder="Select a voice" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900 border-cyan-500/50 text-white max-h-[300px]">
                                        {voices.map(voice => (
                                            <SelectItem 
                                                key={voice.name} 
                                                value={voice.name} 
                                                className="focus:bg-cyan-500/20 cursor-pointer"
                                            >
                                                🗣️ {voice.name} ({voice.lang})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator className="bg-cyan-500/20" />

                            <div className="flex items-center justify-between p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                                <div>
                                    <Label htmlFor="autoSpeak" className="font-semibold">Auto-speak Responses</Label>
                                    <p className="text-xs text-gray-400 mt-1">Automatically read AI responses aloud</p>
                                </div>
                                <Switch
                                    id="autoSpeak"
                                    checked={settings.autoSpeak}
                                    onCheckedChange={(checked) => handleSwitchChange('autoSpeak', checked)}
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-baseline mb-2">
                                    <Label htmlFor="voiceSpeed" className="text-sm">Voice Speed</Label>
                                    <span className="text-cyan-300 font-mono text-sm">{settings.voiceSpeed}%</span>
                                </div>
                                <Slider
                                    id="voiceSpeed"
                                    min={0}
                                    max={100}
                                    step={5}
                                    value={[settings.voiceSpeed]}
                                    onValueChange={(val) => handleSliderChange('voiceSpeed', val)}
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>Slow</span>
                                    <span>Fast</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-baseline mb-2">
                                    <Label htmlFor="voicePitch" className="text-sm">Voice Pitch</Label>
                                    <span className="text-cyan-300 font-mono text-sm">{settings.voicePitch}%</span>
                                </div>
                                <Slider
                                    id="voicePitch"
                                    min={0}
                                    max={100}
                                    step={5}
                                    value={[settings.voicePitch]}
                                    onValueChange={(val) => handleSliderChange('voicePitch', val)}
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>Low</span>
                                    <span>High</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Response Tab */}
                <TabsContent value="response" className="space-y-6">
                    <div className="bg-gray-800/30 rounded-xl p-5 border border-cyan-500/20">
                        <Label className="text-lg text-cyan-400 flex items-center gap-2 mb-4">
                            <MessageSquare className="w-5 h-5" />
                            Response Configuration
                        </Label>
                        <p className="text-sm text-gray-400 mb-4">
                            Control the verbosity and detail level of AI responses.
                        </p>
                        
                        <div>
                            <div className="flex justify-between items-baseline mb-2">
                                <Label htmlFor="answerLength" className="text-sm">Answer Length</Label>
                                <span className="text-cyan-300 font-mono text-sm px-2 py-1 bg-cyan-500/20 rounded">
                                    {settings.answerLength < 30 ? '📝 Brief' : 
                                     settings.answerLength < 70 ? '📄 Moderate' : '📚 Detailed'}
                                </span>
                            </div>
                            <Slider
                                id="answerLength"
                                min={0}
                                max={100}
                                step={1}
                                value={[settings.answerLength]}
                                onValueChange={(val) => handleSliderChange('answerLength', val)}
                                className="mb-2"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Brief</span>
                                <span>Moderate</span>
                                <span>Detailed</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-3 p-2 bg-gray-900/50 rounded">
                                💡 Controls response verbosity - brief for quick answers, detailed for comprehensive explanations.
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-900/20 rounded-xl p-5 border border-blue-500/30">
                        <Label className="text-sm text-blue-400 mb-2 block">Response Characteristics</Label>
                        <div className="space-y-2 text-xs text-gray-400">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                                <span>Adaptive to context and question complexity</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                                <span>Maintains conversation coherence</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                                <span>Includes examples when appropriate</span>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Visual Tab */}
                <TabsContent value="visual" className="space-y-6">
                    <div className="bg-gray-800/30 rounded-xl p-5 border border-cyan-500/20">
                        <Label className="text-lg text-cyan-400 flex items-center gap-2 mb-4">
                            <Eye className="w-5 h-5" />
                            Visual Consciousness
                        </Label>
                        <p className="text-sm text-gray-400 mb-4">
                            Calibrate the visual representation of Murphy's consciousness core.
                        </p>
                        
                        <div>
                            <div className="flex justify-between items-baseline mb-2">
                                <Label htmlFor="consciousness" className="text-sm">Intensity Level</Label>
                                <span className="text-cyan-300 font-mono text-sm">{settings.consciousness}%</span>
                            </div>
                            <Slider
                                id="consciousness"
                                min={0}
                                max={100}
                                step={1}
                                value={[settings.consciousness]}
                                onValueChange={(val) => handleSliderChange('consciousness', val)}
                                className="mb-2"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Dim</span>
                                <span>Moderate</span>
                                <span>Intense</span>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/30">
                            <div className="flex items-center justify-center mb-3">
                                <div 
                                    className="w-20 h-20 rounded-full bg-cyan-400 transition-all duration-500"
                                    style={{
                                        boxShadow: `0 0 ${settings.consciousness / 5}px #fff, 0 0 ${settings.consciousness / 2.5}px #0ff, 0 0 ${settings.consciousness / 1.5}px #0ff, 0 0 ${settings.consciousness / 1}px #0ff`,
                                        opacity: settings.consciousness / 100,
                                    }}
                                ></div>
                            </div>
                            <p className="text-center text-xs text-gray-400">Live Preview</p>
                        </div>

                        <p className="text-xs text-gray-500 mt-4 p-2 bg-gray-900/50 rounded">
                            💡 Adjust the glow intensity of the consciousness indicator in the header.
                        </p>
                    </div>
                </TabsContent>
            </Tabs>

            <Separator className="my-6 bg-cyan-500/20" />

            <div className="text-center text-xs text-gray-500">
                <p>Murphy Advanced Settings v2.0</p>
                <p className="mt-1">All settings are saved automatically</p>
            </div>
        </motion.div>
    );
}