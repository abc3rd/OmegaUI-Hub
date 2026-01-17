import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { action, sessionId, ...data } = body;
    
    switch (action) {
      case 'list': {
        const sessions = await base44.entities.Session.filter({ user_id: user.id });
        sessions.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        
        // Limit to recent sessions
        const limit = data.limit || 50;
        const limitedSessions = sessions.slice(0, limit);
        
        return Response.json({ 
          success: true, 
          sessions: limitedSessions,
          total: sessions.length
        });
      }
      
      case 'get': {
        if (!sessionId) {
          return Response.json({ error: 'Session ID required' }, { status: 400 });
        }
        
        const sessions = await base44.entities.Session.filter({ id: sessionId });
        if (sessions.length === 0) {
          return Response.json({ error: 'Session not found' }, { status: 404 });
        }
        
        const session = sessions[0];
        if (session.user_id !== user.id && user.role !== 'admin') {
          return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }
        
        // Get all hops for this session
        const hops = await base44.entities.Hop.filter({ session_id: sessionId });
        hops.sort((a, b) => a.hop_index - b.hop_index);
        
        return Response.json({ 
          success: true, 
          session,
          hops
        });
      }
      
      case 'getHopContent': {
        if (!data.hopId) {
          return Response.json({ error: 'Hop ID required' }, { status: 400 });
        }
        
        const hops = await base44.entities.Hop.filter({ id: data.hopId });
        if (hops.length === 0) {
          return Response.json({ error: 'Hop not found' }, { status: 404 });
        }
        
        const hop = hops[0];
        
        // Verify user owns the session
        const sessions = await base44.entities.Session.filter({ id: hop.session_id });
        if (sessions.length === 0 || (sessions[0].user_id !== user.id && user.role !== 'admin')) {
          return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }
        
        return Response.json({ success: true, hop });
      }
      
      case 'delete': {
        if (!sessionId) {
          return Response.json({ error: 'Session ID required' }, { status: 400 });
        }
        
        const sessions = await base44.entities.Session.filter({ id: sessionId });
        if (sessions.length === 0) {
          return Response.json({ error: 'Session not found' }, { status: 404 });
        }
        
        if (sessions[0].user_id !== user.id && user.role !== 'admin') {
          return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }
        
        // Delete all hops first
        const hops = await base44.entities.Hop.filter({ session_id: sessionId });
        for (const hop of hops) {
          await base44.entities.Hop.delete(hop.id);
        }
        
        // Delete session
        await base44.entities.Session.delete(sessionId);
        
        return Response.json({ success: true });
      }
      
      case 'replay': {
        if (!sessionId) {
          return Response.json({ error: 'Session ID required' }, { status: 400 });
        }
        
        const sessions = await base44.entities.Session.filter({ id: sessionId });
        if (sessions.length === 0) {
          return Response.json({ error: 'Session not found' }, { status: 404 });
        }
        
        const originalSession = sessions[0];
        if (originalSession.user_id !== user.id && user.role !== 'admin') {
          return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }
        
        if (!originalSession.replay_data) {
          return Response.json({ 
            error: 'Session does not have replay data' 
          }, { status: 400 });
        }
        
        // Return replay data for the client to re-execute
        return Response.json({
          success: true,
          replay_data: {
            raw_prompt: originalSession.replay_data.raw_prompt,
            provider_config_id: originalSession.replay_data.provider_config_id,
            max_tokens: originalSession.replay_data.max_tokens,
            original_session_id: sessionId,
            original_chain_hash: originalSession.chain_hash
          }
        });
      }
      
      case 'stats': {
        const sessions = await base44.entities.Session.filter({ user_id: user.id });
        
        const stats = {
          total_sessions: sessions.length,
          successful_sessions: sessions.filter(s => s.status === 'success').length,
          error_sessions: sessions.filter(s => s.status === 'error').length,
          total_tokens: sessions.reduce((sum, s) => sum + (s.total_tokens || 0), 0),
          total_cost: sessions.reduce((sum, s) => sum + (s.total_cost_estimate || 0), 0),
          average_score: sessions.length > 0 
            ? sessions.reduce((sum, s) => sum + (s.session_score || 0), 0) / sessions.length 
            : 0,
          average_latency: sessions.length > 0
            ? sessions.reduce((sum, s) => sum + (s.total_latency_ms || 0), 0) / sessions.length
            : 0
        };
        
        return Response.json({ success: true, stats });
      }
      
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Session manager error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});