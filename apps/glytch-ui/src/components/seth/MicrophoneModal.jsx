import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Mic, Radio, MessageSquare } from "lucide-react";

export default function MicrophoneModal({ isOpen, onClose, onSelectMode }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white border-[#48CAE4]/50 text-[#030101] max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl bg-gradient-to-r from-[#0077B6] via-[#48CAE4] to-[#F4A261] bg-clip-text text-transparent flex items-center gap-2">
                        <Mic className="w-5 h-5 text-[#48CAE4]" />
                        Voice Input Mode
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Choose how you want to interact with GLYTCH
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-3 mt-4">
                    <Button
                        onClick={() => onSelectMode('live')}
                        className="w-full h-auto py-4 bg-gradient-to-r from-[#0077B6] via-[#48CAE4] to-[#F4A261] hover:opacity-90 text-white flex flex-col items-center gap-2"
                    >
                        <Radio className="w-6 h-6" />
                        <span className="font-semibold">Live Conversation Mode</span>
                        <span className="text-xs opacity-80">Continuous listening - speak naturally</span>
                    </Button>
                    
                    <Button
                        onClick={() => onSelectMode('push')}
                        variant="outline"
                        className="w-full h-auto py-4 border-[#48CAE4]/50 text-[#48CAE4] hover:bg-[#48CAE4]/10 flex flex-col items-center gap-2"
                    >
                        <MessageSquare className="w-6 h-6" />
                        <span className="font-semibold">Push-to-Talk Mode</span>
                        <span className="text-xs opacity-80">Press and hold to record message</span>
                    </Button>
                    
                    <Button
                        onClick={() => onSelectMode('single')}
                        variant="outline"
                        className="w-full h-auto py-4 border-[#F4A261]/50 text-[#F4A261] hover:bg-[#F4A261]/10 flex flex-col items-center gap-2"
                    >
                        <Mic className="w-6 h-6" />
                        <span className="font-semibold">Single Speech-to-Text</span>
                        <span className="text-xs opacity-80">Speak once, then edit before sending</span>
                    </Button>
                </div>
                
                <p className="text-xs text-gray-500 text-center mt-4">
                    Microphone access required for all voice features
                </p>
            </DialogContent>
        </Dialog>
    );
}