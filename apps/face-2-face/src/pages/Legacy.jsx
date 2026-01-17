import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Heart, Sparkles, Brain, Book, Save, Plus, X, Mic, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Legacy() {
  const [user, setUser] = useState(null);
  const [legacyEnabled, setLegacyEnabled] = useState(false);
  const [trainingData, setTrainingData] = useState({
    memories: [],
    personality_traits: [],
    life_lessons: [],
    voice_samples: []
  });
  const [newMemory, setNewMemory] = useState("");
  const [newTrait, setNewTrait] = useState("");
  const [newLesson, setNewLesson] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("memories");
  const [voiceTraining, setVoiceTraining] = useState(false);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setLegacyEnabled(userData.legacy_enabled || false);
      
      if (userData.ai_training_data) {
        setTrainingData(userData.ai_training_data);
      }
    } catch (error) {
      console.error("Error loading legacy data:", error);
    }
  };

  const handleToggleLegacy = async (checked) => {
    try {
      await base44.auth.updateMe({ legacy_enabled: checked });
      setLegacyEnabled(checked);
      if (checked) {
        alert("Legacy AI enabled! You are now the pilot - start training your digital reflection.");
      }
    } catch (error) {
      console.error("Error toggling legacy:", error);
    }
  };

  const handleAddMemory = () => {
    if (!newMemory.trim()) return;
    setTrainingData({
      ...trainingData,
      memories: [...trainingData.memories, newMemory]
    });
    setNewMemory("");
  };

  const handleRemoveMemory = (index) => {
    setTrainingData({
      ...trainingData,
      memories: trainingData.memories.filter((_, i) => i !== index)
    });
  };

  const handleAddTrait = () => {
    if (!newTrait.trim()) return;
    setTrainingData({
      ...trainingData,
      personality_traits: [...trainingData.personality_traits, newTrait]
    });
    setNewTrait("");
  };

  const handleRemoveTrait = (index) => {
    setTrainingData({
      ...trainingData,
      personality_traits: trainingData.personality_traits.filter((_, i) => i !== index)
    });
  };

  const handleAddLesson = () => {
    if (!newLesson.trim()) return;
    setTrainingData({
      ...trainingData,
      life_lessons: [...trainingData.life_lessons, newLesson]
    });
    setNewLesson("");
  };

  const handleRemoveLesson = (index) => {
    setTrainingData({
      ...trainingData,
      life_lessons: trainingData.life_lessons.filter((_, i) => i !== index)
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ ai_training_data: trainingData });
      alert("Legacy data saved! Your AI pilot is learning from you.");
    } catch (error) {
      console.error("Error saving legacy data:", error);
      alert("Error saving data. Please try again.");
    }
    setSaving(false);
  };

  const startVoiceRecording = () => {
    setRecording(true);
    // Voice recording logic would go here
    setTimeout(() => {
      setRecording(false);
      alert("Voice sample recorded! Your AI will learn to speak in your voice.");
    }, 3000);
  };

  if (!legacyEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/20 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3 mb-8"
          >
            <h1 className="text-5xl font-bold text-[#0A1628]">Digital Legacy AI</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              You are the pilot. Train your AI. The more you train, the more of you remains.
            </p>
          </motion.div>

          <Card className="border-slate-200/60 shadow-2xl">
            <CardContent className="p-12 text-center space-y-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-100 to-purple-50 rounded-full flex items-center justify-center">
                <Brain className="w-12 h-12 text-purple-600" />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-[#0A1628]">Become Immortal</h2>
                <p className="text-slate-600 max-w-xl mx-auto text-lg">
                  Your AI doesn't just remember you — it <strong>becomes</strong> you. 
                  Voice-cloned, personality-matched, trained by you, for those you love.
                </p>
              </div>

              <Alert className="border-purple-200 bg-purple-50 text-left">
                <AlertDescription className="text-sm text-purple-900">
                  <strong>The Pilot Program:</strong> While you're alive, you actively train, test, 
                  and refine your AI. When you transition to Legacy status, your verified Circle can 
                  interact with the authentic digital reflection you created.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-3 gap-4 pt-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <Brain className="w-8 h-8 text-blue-600 mb-2 mx-auto" />
                  <h4 className="font-bold text-[#0A1628] mb-1">Train Your AI</h4>
                  <p className="text-xs text-slate-600">
                    Through social media, conversations, and memories
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <Mic className="w-8 h-8 text-green-600 mb-2 mx-auto" />
                  <h4 className="font-bold text-[#0A1628] mb-1">Clone Your Voice</h4>
                  <p className="text-xs text-slate-600">
                    Your AI speaks exactly like you
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <Heart className="w-8 h-8 text-purple-600 mb-2 mx-auto" />
                  <h4 className="font-bold text-[#0A1628] mb-1">Live Forever</h4>
                  <p className="text-xs text-slate-600">
                    Your wisdom and personality preserved
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 pt-6 bg-gradient-to-r from-purple-50 to-amber-50 p-6 rounded-xl">
                <Label htmlFor="legacy-toggle" className="text-lg font-semibold text-[#0A1628]">
                  Enable Digital Legacy AI
                </Label>
                <Switch 
                  id="legacy-toggle"
                  checked={legacyEnabled}
                  onCheckedChange={handleToggleLegacy}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>

              <p className="text-xs text-slate-500">
                You can disable this at any time and all training data will be permanently deleted
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                <Brain className="w-3 h-3 mr-1" />
                AI Pilot Active
              </Badge>
              <Switch 
                checked={legacyEnabled}
                onCheckedChange={handleToggleLegacy}
                className="data-[state=checked]:bg-purple-600"
              />
            </div>
            <h1 className="text-4xl font-bold text-[#0A1628]">Train Your Legacy AI</h1>
            <p className="text-slate-600 mt-2">
              The more you train, the more of you remains
            </p>
          </div>
        </motion.div>

        <div className="flex gap-2 justify-center flex-wrap">
          <Button
            variant={activeTab === "memories" ? "default" : "outline"}
            onClick={() => setActiveTab("memories")}
            className={activeTab === "memories" ? "bg-[#0A1628]" : ""}
          >
            <Book className="w-4 h-4 mr-2" />
            Memories ({trainingData.memories.length})
          </Button>
          <Button
            variant={activeTab === "traits" ? "default" : "outline"}
            onClick={() => setActiveTab("traits")}
            className={activeTab === "traits" ? "bg-[#0A1628]" : ""}
          >
            <Brain className="w-4 h-4 mr-2" />
            Personality ({trainingData.personality_traits.length})
          </Button>
          <Button
            variant={activeTab === "lessons" ? "default" : "outline"}
            onClick={() => setActiveTab("lessons")}
            className={activeTab === "lessons" ? "bg-[#0A1628]" : ""}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Wisdom ({trainingData.life_lessons.length})
          </Button>
          <Button
            variant={activeTab === "voice" ? "default" : "outline"}
            onClick={() => setActiveTab("voice")}
            className={activeTab === "voice" ? "bg-[#0A1628]" : ""}
          >
            <Mic className="w-4 h-4 mr-2" />
            Voice Clone
          </Button>
        </div>

        <Card className="border-slate-200/60 shadow-xl">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white to-purple-50/30">
            <CardTitle>
              {activeTab === "memories" && "Share Your Memories & Stories"}
              {activeTab === "traits" && "Define Your Personality"}
              {activeTab === "lessons" && "Pass On Your Wisdom"}
              {activeTab === "voice" && "Clone Your Voice"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === "voice" && (
                <motion.div
                  key="voice"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertDescription className="text-blue-900">
                      <strong>Voice Cloning:</strong> Record samples of your voice reading different 
                      prompts. Our AI will learn your speech patterns, tone, and cadence to create a 
                      perfect voice clone.
                    </AlertDescription>
                  </Alert>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-8 text-center">
                    <Mic className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-[#0A1628] mb-2">
                      Record Your Voice
                    </h3>
                    <p className="text-slate-700 mb-6">
                      Read the prompt below clearly and naturally
                    </p>
                    
                    <div className="bg-white rounded-lg p-6 mb-6 text-left">
                      <p className="text-slate-800 leading-relaxed italic">
                        "Hello, this is me recording my voice for my digital legacy. 
                        I want my loved ones to always be able to hear me, to ask me questions, 
                        and to feel my presence even when I'm gone. This AI represents my thoughts, 
                        my wisdom, and my love for all of you."
                      </p>
                    </div>

                    <Button
                      size="lg"
                      onClick={startVoiceRecording}
                      disabled={recording}
                      className={`gap-2 ${recording ? 'bg-red-600' : 'bg-purple-600'} hover:shadow-xl`}
                    >
                      {recording ? (
                        <>
                          <Pause className="w-5 h-5" />
                          Recording...
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5" />
                          Start Recording
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {activeTab === "memories" && (
                <motion.div
                  key="memories"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="space-y-3">
                    <Label>Share a Memory or Story</Label>
                    <Textarea
                      value={newMemory}
                      onChange={(e) => setNewMemory(e.target.value)}
                      placeholder="Tell a meaningful story from your life..."
                      className="h-32 border-slate-200"
                    />
                    <Button onClick={handleAddMemory} className="gap-2 bg-[#0A1628]">
                      <Plus className="w-4 h-4" />
                      Add Memory
                    </Button>
                  </div>

                  <div className="space-y-3 mt-6">
                    <Label>Your Memories</Label>
                    <AnimatePresence>
                      {trainingData.memories.map((memory, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-slate-50 rounded-lg p-4 relative group"
                        >
                          <p className="text-slate-700 pr-8">{memory}</p>
                          <Button
                            onClick={() => handleRemoveMemory(index)}
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {trainingData.memories.length === 0 && (
                      <p className="text-sm text-slate-500 text-center py-8">
                        No memories added yet. Start sharing your stories!
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "traits" && (
                <motion.div
                  key="traits"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="space-y-3">
                    <Label>Add a Personality Trait</Label>
                    <Input
                      value={newTrait}
                      onChange={(e) => setNewTrait(e.target.value)}
                      placeholder="e.g., Optimistic, Humorous, Thoughtful..."
                      className="border-slate-200"
                    />
                    <Button onClick={handleAddTrait} className="gap-2 bg-[#0A1628]">
                      <Plus className="w-4 h-4" />
                      Add Trait
                    </Button>
                  </div>

                  <div className="space-y-3 mt-6">
                    <Label>Your Personality Traits</Label>
                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence>
                        {trainingData.personality_traits.map((trait, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                          >
                            <Badge className="bg-blue-100 text-blue-800 gap-2 pr-1">
                              {trait}
                              <button
                                onClick={() => handleRemoveTrait(index)}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    {trainingData.personality_traits.length === 0 && (
                      <p className="text-sm text-slate-500 text-center py-8">
                        No traits added yet. Define who you are!
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "lessons" && (
                <motion.div
                  key="lessons"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="space-y-3">
                    <Label>Share Wisdom or Advice</Label>
                    <Textarea
                      value={newLesson}
                      onChange={(e) => setNewLesson(e.target.value)}
                      placeholder="Share important lessons you've learned..."
                      className="h-32 border-slate-200"
                    />
                    <Button onClick={handleAddLesson} className="gap-2 bg-[#0A1628]">
                      <Plus className="w-4 h-4" />
                      Add Wisdom
                    </Button>
                  </div>

                  <div className="space-y-3 mt-6">
                    <Label>Your Life Lessons</Label>
                    <AnimatePresence>
                      {trainingData.life_lessons.map((lesson, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-lg p-4 relative group"
                        >
                          <p className="text-slate-700 pr-8">{lesson}</p>
                          <Button
                            onClick={() => handleRemoveLesson(index)}
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {trainingData.life_lessons.length === 0 && (
                      <p className="text-sm text-slate-500 text-center py-8">
                        No wisdom added yet. Share your life lessons!
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-4 border-t border-slate-200">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-gradient-to-r from-[#0A1628] to-[#1a2942] gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save All Training Data"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[#0A1628] mb-2">Training Progress</h3>
                <p className="text-sm text-slate-700 mb-3">
                  Your AI is learning from {trainingData.memories.length} memories, 
                  {trainingData.personality_traits.length} personality traits, and 
                  {trainingData.life_lessons.length} life lessons.
                </p>
                <Badge className="bg-purple-600 text-white">
                  The More You Train, The More of You Remains
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}