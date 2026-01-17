import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Monitor, Save, Circle, Square } from 'lucide-react';
import { toast } from 'sonner';
import { Recording } from '@/entities/Recording';
import { UploadPrivateFile } from '@/integrations/Core';

export default function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [recordedBlobs, setRecordedBlobs] = useState([]);
  const [options, setOptions] = useState({
    webcam: true,
    microphone: true,
    systemAudio: true,
  });
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [mediaStream]);

  const handleStartRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        toast.error("Screen recording is not supported by your browser.");
        return;
      }
      
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: options.systemAudio,
      });

      let audioStream = null;
      if (options.microphone) {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      }
      
      const combinedStream = new MediaStream([
        ...displayStream.getVideoTracks(),
        ...(audioStream ? audioStream.getAudioTracks() : []),
        ...displayStream.getAudioTracks()
      ]);

      setMediaStream(combinedStream);
      videoRef.current.srcObject = combinedStream;

      mediaRecorderRef.current = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          setRecordedBlobs((prev) => [...prev, event.data]);
        }
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success("Recording started!");

    } catch (err) {
      console.error('Error starting recording:', err);
      toast.error(err.name === 'NotAllowedError' ? 'Permission to record screen was denied.' : 'Failed to start recording. Please check permissions.');
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      setMediaStream(null);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
    setRecordingTime(0);
    setMediaStream(null);
    toast.info("Recording stopped. Ready to save.");
  };

  const handleSaveRecording = async () => {
    if (recordedBlobs.length === 0) {
      toast.error("No recording data to save.");
      return;
    }
    setIsSaving(true);
    try {
      const blob = new Blob(recordedBlobs, { type: 'video/webm' });
      const fileName = `recording-${Date.now()}.webm`;
      const file = new File([blob], fileName, { type: 'video/webm' });

      // 1. Upload the file
      const { file_uri } = await UploadPrivateFile({ file });

      // 2. Save the entity record
      const recordingTitle = `Screen Recording - ${new Date().toLocaleString()}`;
      await Recording.create({
        title: recordingTitle,
        description: 'A new screen recording from the ABC Dashboard.',
        file_uri: file_uri,
        duration_seconds: Math.round(blob.size / 100000), // Rough estimate
      });

      setRecordedBlobs([]);
      toast.success("Recording saved successfully!");
    } catch (error) {
      console.error("Error saving recording:", error);
      toast.error("Failed to save recording.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="p-6 grid lg:grid-cols-2 gap-6 h-full">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Instructional Screen Recorder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 flex-grow flex flex-col justify-center">
          <div className="space-y-4 p-4 border rounded-lg bg-muted">
            <h3 className="font-semibold">Recording Settings</h3>
            <div className="flex items-center space-x-2">
              <Checkbox id="webcam" checked={options.webcam} onCheckedChange={(c) => setOptions(o => ({...o, webcam: c}))} disabled={true} />
              <Label htmlFor="webcam" className="text-muted-foreground">Include Webcam (Coming Soon)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="microphone" checked={options.microphone} onCheckedChange={(c) => setOptions(o => ({...o, microphone: c}))} />
              <Label htmlFor="microphone">Record Microphone</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="systemAudio" checked={options.systemAudio} onCheckedChange={(c) => setOptions(o => ({...o, systemAudio: c}))} />
              <Label htmlFor="systemAudio">Record System Audio</Label>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            {!isRecording ? (
              <Button onClick={handleStartRecording} className="bg-primary hover:bg-primary-accent w-full" size="lg">
                <Circle className="w-4 h-4 mr-2" /> Start Recording
              </Button>
            ) : (
              <Button onClick={handleStopRecording} variant="destructive" className="w-full" size="lg">
                <Square className="w-4 h-4 mr-2" /> Stop Recording
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Preview</CardTitle>
          {isRecording && <Badge variant="destructive" className="animate-pulse"><Circle className="w-2 h-2 mr-1.5 fill-current" />REC {formatTime(recordingTime)}</Badge>}
        </CardHeader>
        <CardContent className="flex-grow bg-muted/50 rounded-b-lg flex items-center justify-center">
          <video ref={videoRef} autoPlay muted className="w-full h-full object-contain rounded-md" />
          {!mediaStream && recordedBlobs.length === 0 && (
            <div className="text-center text-muted-foreground">
              <Monitor className="w-12 h-12 mx-auto mb-4" />
              <p>Your recording preview will appear here.</p>
            </div>
          )}
          {recordedBlobs.length > 0 && !isRecording && (
             <div className="text-center">
                <p className="mb-4">Recording complete. Save it to your library.</p>
                <Button onClick={handleSaveRecording} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Recording'}
                </Button>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}