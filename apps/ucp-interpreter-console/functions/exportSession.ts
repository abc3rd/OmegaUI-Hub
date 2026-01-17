import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// SHA-256 hash function
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify hop chain integrity
async function verifyChainIntegrity(hops) {
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  const verificationResults = [];
  
  for (const hop of hops) {
    const expectedHash = await sha256(prevHash + hop.content);
    const isValid = expectedHash === hop.sha256_hash;
    
    verificationResults.push({
      hop_index: hop.hop_index,
      hop_type: hop.hop_type,
      expected_hash: expectedHash,
      actual_hash: hop.sha256_hash,
      prev_hash_expected: prevHash,
      prev_hash_actual: hop.prev_hash,
      is_valid: isValid
    });
    
    prevHash = hop.sha256_hash;
  }
  
  return {
    is_valid: verificationResults.every(r => r.is_valid),
    results: verificationResults
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { sessionId, format = 'json' } = body;
    
    if (!sessionId) {
      return Response.json({ error: 'Session ID required' }, { status: 400 });
    }
    
    // Get session
    const sessions = await base44.entities.Session.filter({ id: sessionId });
    if (sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }
    
    const session = sessions[0];
    if (session.user_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Get all hops
    const hops = await base44.entities.Hop.filter({ session_id: sessionId });
    hops.sort((a, b) => a.hop_index - b.hop_index);
    
    // Verify chain integrity
    const chainVerification = await verifyChainIntegrity(hops);
    
    // Build export document
    const exportDoc = {
      export_metadata: {
        exported_at: new Date().toISOString(),
        exported_by: user.email,
        format_version: '1.0.0',
        ucp_version: '1.0.0'
      },
      session: {
        id: session.id,
        created_at: session.created_date,
        status: session.status,
        model_name: session.model_name,
        raw_prompt: session.raw_prompt,
        final_output: session.final_output,
        totals: {
          prompt_tokens: session.prompt_tokens,
          completion_tokens: session.completion_tokens,
          total_tokens: session.total_tokens,
          total_cost_estimate: session.total_cost_estimate,
          total_latency_ms: session.total_latency_ms,
          context_window_used: session.context_window_used,
          session_score: session.session_score
        },
        chain_hash: session.chain_hash
      },
      hop_ledger: hops.map(hop => ({
        hop_index: hop.hop_index,
        hop_type: hop.hop_type,
        content: hop.content,
        tokens: {
          in: hop.tokens_in,
          out: hop.tokens_out,
          method: hop.token_method
        },
        latency_ms: hop.latency_ms,
        score: hop.score,
        score_breakdown: hop.score_breakdown,
        timestamp: hop.timestamp,
        hashes: {
          sha256: hop.sha256_hash,
          prev_hash: hop.prev_hash
        }
      })),
      chain_verification: chainVerification,
      compliance: {
        tamper_evident: chainVerification.is_valid,
        audit_trail_complete: hops.length >= 3,
        timestamps_present: hops.every(h => h.timestamp),
        hashes_verified: chainVerification.is_valid
      }
    };
    
    // Sign the entire document
    const documentHash = await sha256(JSON.stringify(exportDoc));
    exportDoc.document_signature = {
      algorithm: 'SHA-256',
      hash: documentHash,
      signed_at: new Date().toISOString()
    };
    
    return Response.json({
      success: true,
      export: exportDoc
    });
    
  } catch (error) {
    console.error('Export session error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});