import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Monitor, 
  Video, 
  Phone, 
  PhoneOff,
  Copy,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function RemoteSupport({ ticket, tenantId, onClose }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const createSessionMutation = useMutation({
    mutationFn: async (type) => {
      const sessionToken = Math.random().toString(36).substring(2, 15);
      const sessionUrl = `${window.location.origin}${window.location.pathname}?session=${sessionToken}`;
      
      return await base44.entities.RemoteSession.create({
        tenant_id: tenantId,
        ticket_id: ticket.id,
        session_type: type,
        status: 'pending',
        initiated_by: (await base44.auth.me()).email,
        contact_id: ticket.contact_id,
        session_url: sessionUrl,
        session_token: sessionToken,
        started_at: new Date().toISOString()
      });
    },
    onSuccess: (newSession) => {
      setSession(newSession);
      toast.success('Remote session created');
    }
  });

  const endSessionMutation = useMutation({
    mutationFn: async () => {
      const duration = Math.round((new Date() - new Date(session.started_at)) / 60000);
      
      await base44.entities.RemoteSession.update(session.id, {
        status: 'ended',
        ended_at: new Date().toISOString(),
        duration_minutes: duration,
        notes: sessionNotes
      });

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsSharing(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticket.id] });
      toast.success('Session ended and saved');
      setSession(null);
      setSessionNotes('');
      if (onClose) onClose();
    }
  });

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' },
        audio: true
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsSharing(true);
      
      if (session && session.status === 'pending') {
        await base44.entities.RemoteSession.update(session.id, {
          status: 'active'
        });
      }

      stream.getVideoTracks()[0].onended = () => {
        setIsSharing(false);
      };

      toast.success('Screen sharing started');
    } catch (error) {
      console.error('Screen share error:', error);
      toast.error('Failed to start screen sharing');
    }
  };

  const copySessionLink = () => {
    if (session?.session_url) {
      navigator.clipboard.writeText(session.session_url);
      setCopied(true);
      toast.success('Session link copied');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Remote Support
          </span>
          {session && (
            <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
              {session.status}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!session ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Start a remote support session to assist the customer
            </p>
            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={() => createSessionMutation.mutate('screen_share')}
                disabled={createSessionMutation.isPending}
                className="justify-start"
              >
                <Monitor className="h-4 w-4 mr-2" />
                Screen Share
              </Button>
              <Button
                onClick={() => createSessionMutation.mutate('video_call')}
                disabled={createSessionMutation.isPending}
                variant="outline"
                className="justify-start"
              >
                <Video className="h-4 w-4 mr-2" />
                Video Call
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Session Link */}
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm font-medium text-slate-700 mb-2">
                Share this link with the customer:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={session.session_url}
                  className="flex-1 px-3 py-2 bg-white border rounded text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copySessionLink}
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Screen Share Controls */}
            {session.session_type === 'screen_share' && (
              <div className="space-y-3">
                {!isSharing ? (
                  <Button
                    onClick={startScreenShare}
                    className="w-full"
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Start Screen Sharing
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-sm font-medium text-green-700">
                        Screen sharing active
                      </span>
                    </div>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full rounded-lg bg-slate-900"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Session Notes */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Session Notes
              </label>
              <Textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Add notes about this session..."
                rows={3}
              />
            </div>

            {/* End Session */}
            <Button
              onClick={() => endSessionMutation.mutate()}
              disabled={endSessionMutation.isPending}
              variant="destructive"
              className="w-full"
            >
              {endSessionMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ending Session...
                </>
              ) : (
                <>
                  <PhoneOff className="h-4 w-4 mr-2" />
                  End Session
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}