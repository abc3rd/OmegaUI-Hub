import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Mic, Radio, MessageSquare } from "lucide-react";

export default function MicrophoneModal({ isOpen, onClose, onSelectMode }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white border-[#c61c39]/50 text-[#030101] max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl text-[#c61c39] flex items-center gap-2">
                        <Mic className="w-5 h-5" />
                        Voice Input Mode
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Choose how you want to interact with Murphy
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-3 mt-4">
                    <Button
                        onClick={() => onSelectMode('live')}
                        className="w-full h-auto py-4 bg-gradient-to-r from-[#c61c39] to-[#155EEF] hover:from-[#c61c39]/90 hover:to-[#155EEF]/90 text-white flex flex-col items-center gap-2"
                    >
                        <Radio className="w-6 h-6" />
                        <span className="font-semibold">Live Conversation Mode</span>
                        <span className="text-xs opacity-80">Continuous listening - speak naturally</span>
                    </Button>
                    
                    <Button
                        onClick={() => onSelectMode('push')}
                        variant="outline"
                        className="w-full h-auto py-4 border-[#155EEF]/50 text-[#155EEF] hover:bg-[#155EEF]/10 flex flex-col items-center gap-2"
                    >
                        <MessageSquare className="w-6 h-6" />
                        <span className="font-semibold">Push-to-Talk Mode</span>
                        <span className="text-xs opacity-80">Press and hold to record message</span>
                    </Button>
                    
                    <Button
                        onClick={() => onSelectMode('single')}
                        variant="outline"
                        className="w-full h-auto py-4 border-[#71D6B5]/50 text-[#71D6B5] hover:bg-[#71D6B5]/10 flex flex-col items-center gap-2"
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