import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VOICE_LANGUAGES = {
  en: { code: 'en-US', name: 'English (US)', voice: 'en-US' },
  es: { code: 'es-ES', name: 'Español', voice: 'es-ES' },
  fr: { code: 'fr-FR', name: 'Français', voice: 'fr-FR' },
  de: { code: 'de-DE', name: 'Deutsch', voice: 'de-DE' },
  it: { code: 'it-IT', name: 'Italiano', voice: 'it-IT' },
  pt: { code: 'pt-PT', name: 'Português', voice: 'pt-PT' },
  ja: { code: 'ja-JP', name: '日本語', voice: 'ja-JP' },
  ko: { code: 'ko-KR', name: '한국어', voice: 'ko-KR' },
  zh: { code: 'zh-CN', name: '中文', voice: 'zh-CN' }
};

export default function VoiceControls({ text, language }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(language);
  const [voices, setVoices] = useState([]);
  const [currentUtterance, setCurrentUtterance] = useState(null);

  React.useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const handleSpeak = () => {
    if (isMuted) return;

    if (isPlaying && currentUtterance) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const voiceLang = VOICE_LANGUAGES[selectedVoice] || VOICE_LANGUAGES.en;
      
      // Find a voice that matches the selected language
      const voice = voices.find(v => v.lang.includes(voiceLang.code)) || voices[0];
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.lang = voiceLang.code;
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentUtterance(null);
      };
      utterance.onerror = () => {
        setIsPlaying(false);
        setCurrentUtterance(null);
      };

      setCurrentUtterance(utterance);
      speechSynthesis.speak(utterance);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted && isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-indigo-500" />
          Voice Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Voice Language
          </label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(VOICE_LANGUAGES).map(([code, lang]) => (
                <SelectItem key={code} value={code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleSpeak}
            disabled={isMuted || !text}
          >
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.div
                  key="pause"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Stop
                </motion.div>
              ) : (
                <motion.div
                  key="play"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Speak
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="icon"
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
        </div>

        {!('speechSynthesis' in window) && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            Voice synthesis is not supported in your browser.
          </div>
        )}
      </CardContent>
    </Card>
  );
}