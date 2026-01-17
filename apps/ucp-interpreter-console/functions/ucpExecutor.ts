import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Simple token estimation
function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

// SHA-256 hash function
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Calculate score for a hop
function calculateHopScore(hop, contextWindowSize = 4096) {
  let score = 100;
  const breakdown = {};
  
  const totalTokens = (hop.tokens_in || 0) + (hop.tokens_out || 0);
  const tokenEfficiency = Math.max(0, 30 - (totalTokens / 100));
  breakdown.token_efficiency = Math.round(tokenEfficiency);
  score = score - (30 - tokenEfficiency);
  
  const latencyMs = hop.latency_ms || 0;
  const latencyPenalty = Math.min(20, latencyMs / 500);
  breakdown.latency_penalty = Math.round(latencyPenalty);
  score = score - latencyPenalty;
  
  const contextPressure = totalTokens / contextWindowSize;
  const pressurePenalty = Math.min(30, contextPressure * 50);
  breakdown.context_pressure = Math.round(pressurePenalty);
  score = score - pressurePenalty;
  
  breakdown.parse_validity = 20;
  
  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    breakdown
  };
}

// Simple XOR encryption/decryption for API keys (in production, use proper encryption)
function decryptApiKey(encrypted) {
  if (!encrypted) return null;
  try {
    // For demo purposes, we're using base64 encoding
    // In production, use proper encryption with a secure key
    return atob(encrypted);
  } catch {
    return encrypted;
  }
}

// Build system prompt based on UCP packet
function buildSystemPrompt(ucpPacket) {
  const parts = [
    'You are a helpful AI assistant.',
    ''
  ];
  
  // Add intent context
  if (ucpPacket.intent) {
    parts.push(`Task Type: ${ucpPacket.intent.type}`);
  }
  
  // Add constraints
  if (ucpPacket.constraints && ucpPacket.constraints.length > 0) {
    parts.push('');
    parts.push('Constraints:');
    for (const c of ucpPacket.constraints) {
      if (c.type === 'format') {
        parts.push(`- Output format: ${c.value}`);
      } else if (c.type === 'length') {
        parts.push(`- Length: approximately ${c.value} ${c.unit}`);
      } else if (c.type === 'tone') {
        parts.push(`- Tone: ${c.value}`);
      } else if (c.type === 'language') {
        parts.push(`- Language: ${c.value}`);
      }
    }
  }
  
  // Add safety reminders
  if (ucpPacket.safety_flags && ucpPacket.safety_flags.length > 0) {
    parts.push('');
    parts.push('Note: Handle any sensitive information carefully.');
  }
  
  return parts.join('\n');
}

// Build provider request payload
function buildProviderRequest(ucpPacket, normalizedPrompt, config) {
  const systemPrompt = buildSystemPrompt(ucpPacket);
  
  return {
    model: config.default_model || 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: normalizedPrompt }
    ],
    max_tokens: ucpPacket.token_budget?.max_tokens || config.max_tokens_default || 1024,
    temperature: 0.7,
    stream: false
  };
}

// Call provider API
async function callProvider(config, requestPayload) {
  const apiKey = decryptApiKey(config.api_key_encrypted);
  
  let baseUrl = config.base_url;
  if (!baseUrl.endsWith('/')) baseUrl += '/';
  if (!baseUrl.includes('/v1/')) baseUrl += 'v1/';
  const endpoint = baseUrl + 'chat/completions';
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  
  const startTime = Date.now();
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestPayload)
  });
  
  const latencyMs = Date.now() - startTime;
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Provider API error: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  
  return {
    data,
    latency_ms: latencyMs
  };
}

// Sanitize provider response (remove any sensitive data)
function sanitizeResponse(response) {
  const sanitized = JSON.parse(JSON.stringify(response));
  
  // Remove any potential API keys or tokens from the response
  const sensitiveKeys = ['api_key', 'apiKey', 'token', 'secret', 'password'];
  
  function sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    for (const key of Object.keys(obj)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      }
    }
    return obj;
  }
  
  return sanitizeObject(sanitized);
}

// Calculate session score from all hops
function calculateSessionScore(hops) {
  if (hops.length === 0) return 0;
  
  const totalScore = hops.reduce((sum, hop) => sum + (hop.score || 0), 0);
  return Math.round(totalScore / hops.length);
}

Deno.serve(async (req) => {
  const startTime = Date.now();
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { sessionId } = body;
    
    if (!sessionId) {
      return Response.json({ error: 'Session ID required' }, { status: 400 });
    }
    
    // Get session
    const sessions = await base44.entities.Session.filter({ id: sessionId });
    if (sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }
    
    const session = sessions[0];
    if (session.user_id !== user.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Get existing hops
    const existingHops = await base44.entities.Hop.filter({ session_id: sessionId });
    existingHops.sort((a, b) => a.hop_index - b.hop_index);
    
    // Find the UCP packet hop
    const ucpHop = existingHops.find(h => h.hop_type === 'UCP_PACKET');
    if (!ucpHop) {
      return Response.json({ error: 'Session not compiled. Run compile first.' }, { status: 400 });
    }
    
    // Get provider config
    if (!session.provider_config_id) {
      return Response.json({ error: 'No provider configured for this session' }, { status: 400 });
    }
    
    const configs = await base44.entities.ProviderConfig.filter({ id: session.provider_config_id });
    if (configs.length === 0) {
      return Response.json({ error: 'Provider configuration not found' }, { status: 404 });
    }
    
    const providerConfig = configs[0];
    if (providerConfig.user_id !== user.id) {
      return Response.json({ error: 'Unauthorized provider access' }, { status: 403 });
    }
    
    const contextWindow = providerConfig.context_window || 4096;
    
    // Update session status
    await base44.entities.Session.update(session.id, { status: 'running' });
    
    // Parse UCP packet
    let ucpPacket;
    try {
      ucpPacket = typeof ucpHop.content === 'string' ? JSON.parse(ucpHop.content) : ucpHop.content_json;
    } catch {
      return Response.json({ error: 'Invalid UCP packet' }, { status: 500 });
    }
    
    // Get normalized prompt from replay data
    const normalizedPrompt = session.replay_data?.normalized_prompt || session.raw_prompt;
    
    // Build provider request
    const providerRequest = buildProviderRequest(ucpPacket, normalizedPrompt, providerConfig);
    
    // Get last hop hash
    let prevHash = existingHops[existingHops.length - 1]?.sha256_hash || '0'.repeat(64);
    
    // Hop D: Provider Request
    const requestPayloadString = JSON.stringify(providerRequest, null, 2);
    const hopDHash = await sha256(prevHash + requestPayloadString);
    const hopDTokens = estimateTokens(requestPayloadString);
    const hopDScore = calculateHopScore({
      hop_type: 'PROVIDER_REQUEST',
      tokens_in: hopDTokens,
      tokens_out: 0,
      latency_ms: Date.now() - startTime,
      content: requestPayloadString
    }, contextWindow);
    
    const hopD = await base44.entities.Hop.create({
      session_id: session.id,
      hop_index: existingHops.length,
      hop_type: 'PROVIDER_REQUEST',
      content: requestPayloadString,
      content_json: providerRequest,
      tokens_in: hopDTokens,
      tokens_out: 0,
      latency_ms: Date.now() - startTime,
      score: hopDScore.score,
      score_breakdown: hopDScore.breakdown,
      sha256_hash: hopDHash,
      prev_hash: prevHash,
      token_method: 'local-estimated',
      timestamp: new Date().toISOString()
    });
    prevHash = hopDHash;
    
    // Call provider
    let providerResult;
    try {
      providerResult = await callProvider(providerConfig, providerRequest);
    } catch (error) {
      // Update session with error
      await base44.entities.Session.update(session.id, {
        status: 'error',
        error_message: error.message,
        total_latency_ms: Date.now() - startTime
      });
      
      return Response.json({ 
        error: 'Provider call failed', 
        details: error.message,
        session_id: session.id
      }, { status: 502 });
    }
    
    // Sanitize and store provider response
    const sanitizedResponse = sanitizeResponse(providerResult.data);
    const responseString = JSON.stringify(sanitizedResponse, null, 2);
    const hopEHash = await sha256(prevHash + responseString);
    
    // Extract token usage from provider response
    const usage = providerResult.data.usage || {};
    const providerPromptTokens = usage.prompt_tokens || estimateTokens(JSON.stringify(providerRequest.messages));
    const providerCompletionTokens = usage.completion_tokens || 0;
    const tokenMethod = usage.prompt_tokens ? 'provider-reported' : 'local-estimated';
    
    const hopEScore = calculateHopScore({
      hop_type: 'PROVIDER_RESPONSE',
      tokens_in: providerPromptTokens,
      tokens_out: providerCompletionTokens,
      latency_ms: providerResult.latency_ms,
      content: responseString
    }, contextWindow);
    
    const hopE = await base44.entities.Hop.create({
      session_id: session.id,
      hop_index: existingHops.length + 1,
      hop_type: 'PROVIDER_RESPONSE',
      content: responseString,
      content_json: sanitizedResponse,
      tokens_in: providerPromptTokens,
      tokens_out: providerCompletionTokens,
      latency_ms: providerResult.latency_ms,
      score: hopEScore.score,
      score_breakdown: hopEScore.breakdown,
      sha256_hash: hopEHash,
      prev_hash: prevHash,
      token_method: tokenMethod,
      timestamp: new Date().toISOString()
    });
    prevHash = hopEHash;
    
    // Extract final output
    const finalOutput = providerResult.data.choices?.[0]?.message?.content || '';
    const hopFHash = await sha256(prevHash + finalOutput);
    const hopFTokens = estimateTokens(finalOutput);
    const hopFScore = calculateHopScore({
      hop_type: 'FINAL_OUTPUT',
      tokens_in: 0,
      tokens_out: hopFTokens,
      latency_ms: Date.now() - startTime,
      content: finalOutput
    }, contextWindow);
    
    const hopF = await base44.entities.Hop.create({
      session_id: session.id,
      hop_index: existingHops.length + 2,
      hop_type: 'FINAL_OUTPUT',
      content: finalOutput,
      tokens_in: 0,
      tokens_out: hopFTokens,
      latency_ms: Date.now() - startTime,
      score: hopFScore.score,
      score_breakdown: hopFScore.breakdown,
      sha256_hash: hopFHash,
      prev_hash: prevHash,
      token_method: tokenMethod,
      timestamp: new Date().toISOString()
    });
    
    // Get all hops for final calculation
    const allHops = [...existingHops, hopD, hopE, hopF];
    
    // Calculate totals
    const totalPromptTokens = session.prompt_tokens + providerPromptTokens;
    const totalCompletionTokens = providerCompletionTokens;
    const totalTokens = totalPromptTokens + totalCompletionTokens;
    const totalLatency = Date.now() - startTime;
    
    // Calculate cost estimate
    const costPer1kInput = providerConfig.cost_per_1k_input || 0;
    const costPer1kOutput = providerConfig.cost_per_1k_output || 0;
    const totalCost = (totalPromptTokens / 1000 * costPer1kInput) + (totalCompletionTokens / 1000 * costPer1kOutput);
    
    // Calculate context window usage
    const contextUsed = (totalPromptTokens / contextWindow) * 100;
    
    // Calculate session score
    const sessionScore = calculateSessionScore(allHops);
    
    // Update session with final results
    await base44.entities.Session.update(session.id, {
      status: 'success',
      final_output: finalOutput,
      prompt_tokens: totalPromptTokens,
      completion_tokens: totalCompletionTokens,
      total_tokens: totalTokens,
      total_cost_estimate: totalCost,
      total_latency_ms: totalLatency,
      session_score: sessionScore,
      context_window_used: contextUsed,
      chain_hash: hopFHash
    });
    
    return Response.json({
      success: true,
      session_id: session.id,
      final_output: finalOutput,
      new_hops: [
        {
          id: hopD.id,
          hop_index: hopD.hop_index,
          hop_type: hopD.hop_type,
          tokens_in: hopD.tokens_in,
          tokens_out: hopD.tokens_out,
          latency_ms: hopD.latency_ms,
          score: hopD.score,
          score_breakdown: hopD.score_breakdown,
          sha256_hash: hopD.sha256_hash,
          token_method: hopD.token_method
        },
        {
          id: hopE.id,
          hop_index: hopE.hop_index,
          hop_type: hopE.hop_type,
          tokens_in: hopE.tokens_in,
          tokens_out: hopE.tokens_out,
          latency_ms: hopE.latency_ms,
          score: hopE.score,
          score_breakdown: hopE.score_breakdown,
          sha256_hash: hopE.sha256_hash,
          token_method: hopE.token_method
        },
        {
          id: hopF.id,
          hop_index: hopF.hop_index,
          hop_type: hopF.hop_type,
          tokens_in: hopF.tokens_in,
          tokens_out: hopF.tokens_out,
          latency_ms: hopF.latency_ms,
          score: hopF.score,
          score_breakdown: hopF.score_breakdown,
          sha256_hash: hopF.sha256_hash,
          token_method: hopF.token_method
        }
      ],
      totals: {
        prompt_tokens: totalPromptTokens,
        completion_tokens: totalCompletionTokens,
        total_tokens: totalTokens,
        total_cost_estimate: totalCost,
        total_latency_ms: totalLatency,
        context_window_used: contextUsed,
        session_score: sessionScore,
        token_method: tokenMethod
      },
      chain_hash: hopFHash
    });
    
  } catch (error) {
    console.error('UCP Executor error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});