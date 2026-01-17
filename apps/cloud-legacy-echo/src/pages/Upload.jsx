import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Mic, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function UploadPage() {
  const queryClient = useQueryClient();
  const [uploadType, setUploadType] = useState("audio");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [textContent, setTextContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const uploadMutation = useMutation({
    mutationFn: async (data) => {
      let fileUrl = null;
      
      if (data.file) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: data.file });
        fileUrl = file_url;
      }

      const trainingData = await base44.entities.TrainingData.create({
        title: data.title,
        type: data.type,
        file_url: fileUrl,
        duration_minutes: data.duration_minutes,
        word_count: data.word_count,
        transcription: data.transcription,
        processing_status: "processing",
        tags: data.tags.split(',').map(t => t.trim()).filter(Boolean)
      });

      // Update user stats
      const currentVoice = user.voice_samples_count || 0;
      const currentText = user.text_samples_count || 0;
      const currentScore = user.ai_readiness_score || 0;
      
      await base44.auth.updateMe({
        voice_samples_count: data.type === 'audio' ? currentVoice + 1 : currentVoice,
        text_samples_count: data.type !== 'audio' ? currentText + 1 : currentText,
        ai_readiness_score: Math.min(100, currentScore + 5),
        training_status: currentScore === 0 ? 'collecting_data' : user.training_status
      });

      // Simulate processing completion
      setTimeout(async () => {
        await base44.entities.TrainingData.update(trainingData.id, {
          processing_status: "completed"
        });
        queryClient.invalidateQueries(['trainingData']);
      }, 3000);

      return trainingData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['trainingData']);
      queryClient.invalidateQueries(['currentUser']);
      toast.success("Training data uploaded successfully!");
      setTitle("");
      setTags("");
      setTextContent("");
      setAudioBlob(null);
    },
    onError: (error) => {
      toast.error("Upload failed: " + error.message);
    }
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("Recording stopped");
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.type.startsWith('audio/') ? 'audio' : 'document';
    const duration = fileType === 'audio' ? Math.round(Math.random() * 10 + 5) : null;
    const wordCount = fileType === 'document' ? Math.round(Math.random() * 1000 + 500) : null;

    uploadMutation.mutate({
      title: title || file.name,
      type: fileType,
      file: file,
      duration_minutes: duration,
      word_count: wordCount,
      tags: tags
    });
  };

  const handleRecordingUpload = () => {
    if (!audioBlob || !title) {
      toast.error("Please provide a title");
      return;
    }

    const file = new File([audioBlob], `${title}.webm`, { type: 'audio/webm' });
    uploadMutation.mutate({
      title: title,
      type: 'audio',
      file: file,
      duration_minutes: Math.round(Math.random() * 10 + 3),
      tags: tags
    });
  };

  const handleTextUpload = () => {
    if (!title || !textContent) {
      toast.error("Please provide title and content");
      return;
    }

    const blob = new Blob([textContent], { type: 'text/plain' });
    const file = new File([blob], `${title}.txt`, { type: 'text/plain' });

    uploadMutation.mutate({
      title: title,
      type: 'text',
      file: file,
      word_count: textContent.split(/\s+/).length,
      transcription: textContent,
      tags: tags
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Upload Training Data</h1>
          <p className="text-slate-400">
            Add voice recordings, text, or documents to train your Legacy AI
          </p>
        </motion.div>

        {/* Upload Type Selector */}
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Choose Upload Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={() => setUploadType("audio")}
                className={`p-6 rounded-xl border-2 transition-all ${
                  uploadType === "audio"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-700 hover:border-slate-600"
                }`}
              >
                <Upload className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Upload Audio</h3>
                <p className="text-slate-400 text-sm">Upload audio files</p>
              </button>

              <button
                onClick={() => setUploadType("record")}
                className={`p-6 rounded-xl border-2 transition-all ${
                  uploadType === "record"
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-slate-700 hover:border-slate-600"
                }`}
              >
                <Mic className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Record Audio</h3>
                <p className="text-slate-400 text-sm">Record directly</p>
              </button>

              <button
                onClick={() => setUploadType("text")}
                className={`p-6 rounded-xl border-2 transition-all ${
                  uploadType === "text"
                    ? "border-green-500 bg-green-500/10"
                    : "border-slate-700 hover:border-slate-600"
                }`}
              >
                <FileText className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Add Text</h3>
                <p className="text-slate-400 text-sm">Type or paste text</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Upload Forms */}
        <AnimatePresence mode="wait">
          {uploadType === "audio" && (
            <motion.div
              key="audio"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Upload Audio File</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Family Stories, Life Lessons"
                      className="bg-slate-950 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Tags (comma-separated)</Label>
                    <Input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g., memories, advice, stories"
                      className="bg-slate-950 border-slate-700 text-white"
                    />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadMutation.isPending}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Select Audio File
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {uploadType === "record" && (
            <motion.div
              key="record"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Record Audio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Recording Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="What will you talk about?"
                      className="bg-slate-950 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Tags</Label>
                    <Input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g., personal, wisdom, anecdotes"
                      className="bg-slate-950 border-slate-700 text-white"
                    />
                  </div>
                  
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    {!isRecording && !audioBlob && (
                      <Button
                        onClick={startRecording}
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-6 text-lg"
                      >
                        <Mic className="w-6 h-6 mr-3" />
                        Start Recording
                      </Button>
                    )}
                    
                    {isRecording && (
                      <div className="text-center">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="w-20 h-20 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center"
                        >
                          <Mic className="w-10 h-10 text-white" />
                        </motion.div>
                        <p className="text-white font-semibold mb-2">Recording...</p>
                        <Button
                          onClick={stopRecording}
                          variant="outline"
                          className="border-slate-700"
                        >
                          Stop Recording
                        </Button>
                      </div>
                    )}
                    
                    {audioBlob && !isRecording && (
                      <div className="text-center space-y-4">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                        <p className="text-white font-semibold">Recording Complete</p>
                        <div className="flex gap-3">
                          <Button
                            onClick={() => setAudioBlob(null)}
                            variant="outline"
                            className="border-slate-700"
                          >
                            Record Again
                          </Button>
                          <Button
                            onClick={handleRecordingUpload}
                            disabled={uploadMutation.isPending}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          >
                            {uploadMutation.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Recording
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {uploadType === "text" && (
            <motion.div
              key="text"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Add Text Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., My Life Philosophy, Career Advice"
                      className="bg-slate-950 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Tags</Label>
                    <Input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g., philosophy, career, values"
                      className="bg-slate-950 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Content</Label>
                    <Textarea
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Write or paste your text here. This could be journal entries, letters, advice, or anything that reflects your thoughts and personality..."
                      className="bg-slate-950 border-slate-700 text-white min-h-[300px]"
                    />
                    <p className="text-slate-500 text-sm mt-2">
                      {textContent.split(/\s+/).filter(Boolean).length} words
                    </p>
                  </div>
                  <Button
                    onClick={handleTextUpload}
                    disabled={uploadMutation.isPending}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Text
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips */}
        <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-xl border-blue-800/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">💡 Training Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li>• Record in a quiet environment for best audio quality</li>
              <li>• Speak naturally and vary your topics to capture your personality</li>
              <li>• Include stories, opinions, and emotions for a richer AI</li>
              <li>• Aim for at least 30 minutes of total audio for good results</li>
              <li>• Add text content that reflects your writing style and thoughts</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}