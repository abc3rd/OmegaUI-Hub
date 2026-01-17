import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Video, Camera, Mic, FileText, Upload, Loader2,
  CheckCircle, Clock, MapPin, Shield, ExternalLink, Copy
} from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { getSessionDuration, sha256, canonicalJSON } from '../core/evidenceSession';
import { createAuditLog } from '../core/jurisdictionGate';

const UCP_BASE_URL = 'https://ucp.syncloudconnect.com';

export default function QuickStartSession({ session, ucpPacketId, onComplete }) {
  const [recording, setRecording] = useState(false);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [ucpLinksPresented, setUcpLinksPresented] = useState(false);
  const fileInputRef = useRef(null);

  const ucpPacketUrl = `${UCP_BASE_URL}/evidence/${ucpPacketId}`;
  const ucpVerifyUrl = `${UCP_BASE_URL}/verify/${ucpPacketId}`;

  // Log UCP link presentation on mount
  React.useEffect(() => {
    if (ucpPacketId && !ucpLinksPresented) {
      logAuditEvent('UCP_PACKET_LINK_PRESENTED', {
        ucp_packet_id: ucpPacketId,
        ucp_packet_url: ucpPacketUrl,
        ucp_verify_url: ucpVerifyUrl
      });
      setUcpLinksPresented(true);
    }
  }, [ucpPacketId]);

  const logAuditEvent = async (action, details = {}) => {
    try {
      const user = await base44.auth.me();
      const auditEntry = canonicalJSON({
        event_type: action,
        timestamp_utc: new Date().toISOString(),
        user_id: user.id,
        session_id: session.session_id,
        ...details
      });
      
      const audit_entry_hash = await sha256(JSON.stringify(auditEntry));
      
      await createAuditLog({
        actor_user_id: user.id,
        actor_email: user.email,
        actor_role: 'user',
        action,
        entity_type: 'EvidenceSession',
        entity_id: session.id,
        details: {
          ...auditEntry,
          audit_entry_hash
        }
      });
    } catch (err) {
      console.error('Failed to log audit event:', err);
    }
  };

  const handleFileUpload = async (files, type) => {
    setUploading(true);
    try {
      const auditAction = type === 'photo' ? 'PHOTO_ADD' : 
                         type === 'video' ? 'VIDEO_START' : 
                         type === 'audio' ? 'AUDIO_START' : 'DOCUMENT_ADD';
      
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        if (session.incident_id) {
          const evidenceFile = await base44.entities.EvidenceFile.create({
            incident_id: session.incident_id,
            uploader_user_id: session.user_id,
            file_type: type,
            filename: file.name,
            file_url,
            file_size: file.size,
            mime_type: file.type,
            tags: [`session:${session.session_id}`],
            metadata: {
              session_id: session.session_id,
              captured_at: new Date().toISOString()
            }
          });
          
          await logAuditEvent(auditAction, {
            evidence_file_id: evidenceFile.id,
            file_type: type,
            filename: file.name,
            file_size: file.size
          });
        }
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!notes.trim() || !session.incident_id) return;
    
    const blob = new Blob([notes], { type: 'text/plain' });
    const file = new File([blob], `notes-${Date.now()}.txt`, { type: 'text/plain' });
    await handleFileUpload([file], 'document');
    await logAuditEvent('NOTE_ADD', {
      note_length: notes.length,
      note_preview: notes.substring(0, 100)
    });
    setNotes('');
  };

  const handleUCPLinkClick = (linkType) => {
    logAuditEvent('UCP_PACKET_LINK_OPENED', {
      link_type: linkType,
      ucp_packet_id: ucpPacketId,
      url: linkType === 'packet' ? ucpPacketUrl : ucpVerifyUrl
    });
  };

  const handleCopyLink = async (url, linkType) => {
    await navigator.clipboard.writeText(url);
    await logAuditEvent('UCP_PACKET_SHARED', {
      link_type: linkType,
      ucp_packet_id: ucpPacketId,
      url,
      share_method: 'copy'
    });
  };

  const actionButtons = [
    {
      icon: Camera,
      label: 'Take Photos',
      description: 'Capture scene images',
      color: 'blue',
      accept: 'image/*',
      type: 'photo',
      action: () => fileInputRef.current?.click()
    },
    {
      icon: Video,
      label: 'Record Video',
      description: 'Film what happened',
      color: 'purple',
      accept: 'video/*',
      type: 'video',
      action: () => fileInputRef.current?.click()
    },
    {
      icon: Mic,
      label: 'Record Audio',
      description: 'Voice statement',
      color: 'emerald',
      accept: 'audio/*',
      type: 'audio',
      action: () => fileInputRef.current?.click()
    }
  ];

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-[#ea00ea] to-purple-700 text-white">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-semibold">Evidence Session Active</h3>
                {session.trigger_source === 'siri' && (
                  <Badge className="bg-[#ea00ea] text-white border-0">
                    Started by Siri
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-300">
                Session ID: {session.session_id.slice(0, 8)}...
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {getSessionDuration(session.timestamp_utc)}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {format(new Date(session.timestamp_utc), 'h:mm a')}
              </p>
            </div>
          </div>

          {session.location_snapshot?.permission_status === 'granted' && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <MapPin className="w-4 h-4" />
              <span>
                Location: {session.location_snapshot.lat.toFixed(4)}, {session.location_snapshot.lng.toFixed(4)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actionButtons.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              onClick={action.action}
            >
              <CardContent className="pt-6 text-center">
                <div className={`w-16 h-16 rounded-2xl bg-${action.color}-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className={`w-8 h-8 text-${action.color}-600`} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{action.label}</h3>
                <p className="text-sm text-slate-500">{action.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) {
            const type = files[0].type.startsWith('image/') ? 'photo' :
                        files[0].type.startsWith('video/') ? 'video' :
                        files[0].type.startsWith('audio/') ? 'audio' : 'document';
            handleFileUpload(files, type);
          }
          e.target.value = '';
        }}
      />

      {/* Notes Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            <CardTitle className="text-base">Quick Notes</CardTitle>
          </div>
          <CardDescription>Jot down important details while they're fresh</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What happened? Any important details to remember..."
            className="min-h-[120px] resize-none"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveNotes}
              disabled={!notes.trim() || uploading}
              className="gap-2"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Save Notes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* UCP Integration */}
      {ucpPacketId && (
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-base">Universal Chain Packet (UCP)</CardTitle>
            </div>
            <CardDescription>
              Your evidence is registered on the Universal Chain for cryptographic verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a
                href={ucpPacketUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleUCPLinkClick('packet')}
                className="block"
              >
                <Button variant="outline" className="w-full gap-2 hover:bg-blue-100">
                  <ExternalLink className="w-4 h-4" />
                  Open Evidence Packet
                </Button>
              </a>
              <a
                href={ucpVerifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleUCPLinkClick('verify')}
                className="block"
              >
                <Button variant="outline" className="w-full gap-2 hover:bg-blue-100">
                  <Shield className="w-4 h-4" />
                  Verify Integrity
                </Button>
              </a>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={ucpPacketUrl}
                readOnly
                className="flex-1 text-xs bg-white border border-slate-200 rounded px-2 py-1.5 text-slate-600"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopyLink(ucpPacketUrl, 'packet')}
                className="gap-1"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-xs text-blue-700">
              UCP Packet ID: <span className="font-mono">{ucpPacketId}</span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Complete Session */}
      <Card className="border-0 shadow-sm bg-emerald-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-emerald-900">Ready to continue?</p>
              <p className="text-sm text-emerald-700">
                You can add more details or finish your documentation
              </p>
            </div>
            <Button 
              onClick={onComplete}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Continue to Full Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {uploading && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-sm font-medium">Uploading evidence...</span>
        </div>
      )}
    </div>
  );
}