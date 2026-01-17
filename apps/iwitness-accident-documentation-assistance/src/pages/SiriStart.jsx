import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { createEvidenceSession, generateUCPPacketID, canonicalJSON, sha256 } from '../components/core/evidenceSession';
import { createAuditLog } from '../components/core/jurisdictionGate';
import QuickStartSession from '../components/evidence/QuickStartSession';
import { parseAttributionParams, createOrUpdateLead, linkLeadToSession, storeAttribution } from '../components/core/leadTracking';

export default function SiriStart() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const [incidentId, setIncidentId] = useState(null);
  const [ucpPacketId, setUcpPacketId] = useState(null);
  
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const trigger = urlParams.get('trigger') || 'web';
  const nonce = urlParams.get('nonce');
  const ref = urlParams.get('ref');
  const source = urlParams.get('source');
  const attribution = parseAttributionParams(urlParams);
  const currentUrl = window.location.href;

  // Check authentication
  useEffect(() => {
    const init = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        // Not authenticated - redirect to login with full return URL preserved
        const returnUrl = window.location.pathname + window.location.search;
        base44.auth.redirectToLogin(returnUrl);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Create session once user is loaded
  useEffect(() => {
    const createSession = async () => {
      if (!user) return;
      
      try {
        // Store attribution parameters
        storeAttribution(attribution, currentUrl);
        
        // Create or update lead
        const { lead, isNew } = await createOrUpdateLead({
          attribution,
          url: currentUrl,
          userId: user.id
        });
        
        // Create evidence session with full chain of custody
        const sessionData = await createEvidenceSession(user.id, trigger, null, {
          nonce,
          ref,
          source,
          trigger,
          ...attribution
        });
        
        // Generate UCP packet ID
        const ucpId = await generateUCPPacketID(sessionData.session_id, sessionData.session_start_payload_hash);
        setUcpPacketId(ucpId);
        
        // Store in database
        const dbSession = await base44.entities.EvidenceSession.create({
          ...sessionData,
          ucp_packet_id: ucpId
        });
        setSession(dbSession);
        
        // Create canonical audit entry
        const auditEntry = canonicalJSON({
          event_type: 'SIRI_INTENT_START',
          timestamp_utc: new Date().toISOString(),
          user_id: user.id,
          session_id: sessionData.session_id,
          trigger_source: sessionData.trigger_source,
          nonce: sessionData.nonce,
          ref: sessionData.ref,
          source: sessionData.source,
          device_fingerprint_hash: sessionData.device_hash,
          session_start_payload_hash: sessionData.session_start_payload_hash,
          ucp_packet_id: ucpId
        });
        
        const audit_entry_hash = await sha256(JSON.stringify(auditEntry));
        
        // Create audit log (append-only)
        await createAuditLog({
          actor_user_id: user.id,
          actor_email: user.email,
          actor_role: 'user',
          action: 'SIRI_INTENT_START',
          entity_type: 'EvidenceSession',
          entity_id: dbSession.id,
          details: {
            ...auditEntry,
            audit_entry_hash
          }
        });
        
        // Create a draft incident to attach evidence to
        const incident = await base44.entities.Incident.create({
          user_id: user.id,
          status: 'draft',
          occurred_at: new Date().toISOString(),
          jurisdiction_state: '',
          wizard_step: 1
        });
        
        setIncidentId(incident.id);
        
        // Update session with incident link
        await base44.entities.EvidenceSession.update(dbSession.id, {
          incident_id: incident.id
        });
        
        // Link lead to session
        await linkLeadToSession(lead.lead_id, sessionData.session_id, user.id);
        
      } catch (err) {
        console.error('Failed to create session:', err);
        setError(err.message);
      }
    };
    
    createSession();
  }, [user, trigger, nonce, ref, source, currentUrl]);

  const handleComplete = () => {
    if (incidentId) {
      window.location.href = createPageUrl('IncidentWizard') + `?id=${incidentId}`;
    }
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="p-4 rounded-full bg-white shadow-lg inline-flex mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#ea00ea]" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {trigger === 'siri' ? 'Starting Siri Session...' : 'Initializing Evidence Session...'}
          </h2>
          <p className="text-slate-500">
            Securing chain of custody and capturing context
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md border-0 shadow-lg">
          <CardContent className="pt-6 text-center">
            <div className="p-3 rounded-full bg-red-50 inline-flex mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Session Error</h2>
            <p className="text-slate-500 mb-4">{error}</p>
            <Button onClick={() => window.location.href = createPageUrl('Dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694ab548df9978830eeb95a3/9d98f704c_iwitnesslogo.jpg" 
            alt="iWitness"
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Quick Evidence Capture</h1>
          <p className="text-slate-500">
            Document what happened while the details are fresh
          </p>
        </motion.div>

        {/* Session UI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <QuickStartSession 
            session={{ ...session, incident_id: incidentId }}
            ucpPacketId={ucpPacketId}
            onComplete={handleComplete}
          />
        </motion.div>

        {/* Chain of Custody Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="border-0 shadow-sm bg-slate-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600">
                  <p className="font-medium mb-1">Chain of Custody Active</p>
                  <p className="text-slate-500">
                    This evidence session is cryptographically secured with SHA-256 integrity hashing. 
                    Session ID: {session.session_id.slice(0, 8)}... • 
                    Hash: {session.session_start_payload_hash?.slice(0, 16)}... • 
                    UCP ID: {ucpPacketId}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy Notice */}
        {trigger === 'siri' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4"
          >
            <Card className="border-0 shadow-sm bg-blue-50">
              <CardContent className="pt-4">
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">Siri Privacy Notice</p>
                  <p className="text-blue-600">
                    Siri was used only as a voice trigger to launch this app. No analysis, recognition, 
                    or data storage occurred in Siri. All evidence capture and verification happens 
                    exclusively within iWitness. For questions: omegaui@syncloudconnect.com
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}