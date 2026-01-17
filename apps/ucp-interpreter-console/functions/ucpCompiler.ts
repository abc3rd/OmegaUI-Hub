import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Simple token estimation (GPT-style: ~4 chars per token)
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
  
  // Token efficiency (0-30 points)
  const totalTokens = (hop.tokens_in || 0) + (hop.tokens_out || 0);
  const tokenEfficiency = Math.max(0, 30 - (totalTokens / 100));
  breakdown.token_efficiency = Math.round(tokenEfficiency);
  score = score - (30 - tokenEfficiency);
  
  // Latency penalty (0-20 points)
  const latencyMs = hop.latency_ms || 0;
  const latencyPenalty = Math.min(20, latencyMs / 500);
  breakdown.latency_penalty = Math.round(latencyPenalty);
  score = score - latencyPenalty;
  
  // Context window pressure (0-30 points)
  const contextPressure = totalTokens / contextWindowSize;
  const pressurePenalty = Math.min(30, contextPressure * 50);
  breakdown.context_pressure = Math.round(pressurePenalty);
  score = score - pressurePenalty;
  
  // Parse validity for UCP packets (0-20 points)
  if (hop.hop_type === 'UCP_PACKET') {
    try {
      const parsed = typeof hop.content === 'string' ? JSON.parse(hop.content) : hop.content;
      if (parsed.intent && parsed.execution_plan) {
        breakdown.parse_validity = 20;
      } else {
        breakdown.parse_validity = 10;
        score -= 10;
      }
    } catch {
      breakdown.parse_validity = 0;
      score -= 20;
    }
  } else {
    breakdown.parse_validity = 20;
  }
  
  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    breakdown
  };
}

// Intent classification based on prompt analysis
function classifyIntent(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('code') || lowerPrompt.includes('program') || lowerPrompt.includes('function') || lowerPrompt.includes('script')) {
    return { type: 'code_generation', confidence: 0.85 };
  }
  if (lowerPrompt.includes('explain') || lowerPrompt.includes('what is') || lowerPrompt.includes('how does')) {
    return { type: 'explanation', confidence: 0.9 };
  }
  if (lowerPrompt.includes('analyze') || lowerPrompt.includes('review') || lowerPrompt.includes('evaluate')) {
    return { type: 'analysis', confidence: 0.85 };
  }
  if (lowerPrompt.includes('write') || lowerPrompt.includes('create') || lowerPrompt.includes('generate')) {
    return { type: 'content_generation', confidence: 0.8 };
  }
  if (lowerPrompt.includes('translate') || lowerPrompt.includes('convert')) {
    return { type: 'transformation', confidence: 0.9 };
  }
  if (lowerPrompt.includes('summarize') || lowerPrompt.includes('summary')) {
    return { type: 'summarization', confidence: 0.95 };
  }
  if (lowerPrompt.includes('?') || lowerPrompt.includes('why') || lowerPrompt.includes('when') || lowerPrompt.includes('where')) {
    return { type: 'question_answering', confidence: 0.75 };
  }
  
  return { type: 'general', confidence: 0.6 };
}

// Extract constraints from prompt
function extractConstraints(prompt) {
  const constraints = [];
  const lowerPrompt = prompt.toLowerCase();
  
  // Length constraints
  const lengthMatch = prompt.match(/(\d+)\s*(words?|characters?|sentences?|paragraphs?)/i);
  if (lengthMatch) {
    constraints.push({
      type: 'length',
      value: parseInt(lengthMatch[1]),
      unit: lengthMatch[2].toLowerCase()
    });
  }
  
  // Format constraints
  if (lowerPrompt.includes('json')) constraints.push({ type: 'format', value: 'json' });
  if (lowerPrompt.includes('markdown')) constraints.push({ type: 'format', value: 'markdown' });
  if (lowerPrompt.includes('bullet') || lowerPrompt.includes('list')) constraints.push({ type: 'format', value: 'list' });
  if (lowerPrompt.includes('table')) constraints.push({ type: 'format', value: 'table' });
  
  // Tone constraints
  if (lowerPrompt.includes('formal')) constraints.push({ type: 'tone', value: 'formal' });
  if (lowerPrompt.includes('casual') || lowerPrompt.includes('informal')) constraints.push({ type: 'tone', value: 'casual' });
  if (lowerPrompt.includes('professional')) constraints.push({ type: 'tone', value: 'professional' });
  
  // Language constraints
  const langMatch = prompt.match(/in\s+(english|spanish|french|german|chinese|japanese|korean|portuguese|italian|russian)/i);
  if (langMatch) {
    constraints.push({ type: 'language', value: langMatch[1].toLowerCase() });
  }
  
  return constraints;
}

// Detect safety flags
function detectSafetyFlags(prompt) {
  const flags = [];
  const lowerPrompt = prompt.toLowerCase();
  
  // Check for potentially sensitive content requests
  const sensitiveKeywords = ['password', 'hack', 'exploit', 'weapon', 'illegal', 'confidential', 'private', 'secret'];
  for (const keyword of sensitiveKeywords) {
    if (lowerPrompt.includes(keyword)) {
      flags.push({ type: 'sensitive_content', keyword, severity: 'medium' });
    }
  }
  
  // Check for PII patterns
  if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(prompt)) {
    flags.push({ type: 'pii_detected', subtype: 'email', severity: 'low' });
  }
  if (/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(prompt)) {
    flags.push({ type: 'pii_detected', subtype: 'phone', severity: 'low' });
  }
  if (/\b\d{3}[-]?\d{2}[-]?\d{4}\b/.test(prompt)) {
    flags.push({ type: 'pii_detected', subtype: 'ssn', severity: 'high' });
  }
  
  return flags;
}

// Identify required tools based on intent
function identifyRequiredTools(prompt, intent) {
  const tools = [];
  const lowerPrompt = prompt.toLowerCase();
  
  if (intent.type === 'code_generation') {
    tools.push({ name: 'code_interpreter', required: false });
  }
  if (lowerPrompt.includes('search') || lowerPrompt.includes('find') || lowerPrompt.includes('lookup')) {
    tools.push({ name: 'web_search', required: false });
  }
  if (lowerPrompt.includes('image') || lowerPrompt.includes('picture') || lowerPrompt.includes('photo')) {
    tools.push({ name: 'image_generation', required: false });
  }
  if (lowerPrompt.includes('file') || lowerPrompt.includes('document') || lowerPrompt.includes('pdf')) {
    tools.push({ name: 'file_handler', required: false });
  }
  if (lowerPrompt.includes('calculate') || lowerPrompt.includes('math') || lowerPrompt.includes('compute')) {
    tools.push({ name: 'calculator', required: false });
  }
  
  return tools;
}

// Build execution plan
function buildExecutionPlan(intent, constraints, tools) {
  const steps = [];
  
  // Step 1: Context preparation
  steps.push({
    step: 1,
    action: 'prepare_context',
    description: 'Prepare and validate input context'
  });
  
  // Step 2: Apply constraints
  if (constraints.length > 0) {
    steps.push({
      step: 2,
      action: 'apply_constraints',
      description: 'Apply extracted constraints to prompt',
      constraints: constraints
    });
  }
  
  // Step 3: Tool invocation if needed
  if (tools.length > 0) {
    steps.push({
      step: steps.length + 1,
      action: 'invoke_tools',
      description: 'Invoke required tools',
      tools: tools.map(t => t.name)
    });
  }
  
  // Step 4: Generate response
  steps.push({
    step: steps.length + 1,
    action: 'generate_response',
    description: `Generate ${intent.type} response`
  });
  
  // Step 5: Format output
  const formatConstraint = constraints.find(c => c.type === 'format');
  if (formatConstraint) {
    steps.push({
      step: steps.length + 1,
      action: 'format_output',
      description: `Format output as ${formatConstraint.value}`
    });
  }
  
  // Step 6: Validate output
  steps.push({
    step: steps.length + 1,
    action: 'validate_output',
    description: 'Validate output against constraints and safety rules'
  });
  
  return steps;
}

// Build fallback plan
function buildFallbackPlan(intent) {
  return {
    on_error: 'retry_with_simplified_prompt',
    max_retries: 2,
    fallback_actions: [
      { condition: 'timeout', action: 'reduce_max_tokens' },
      { condition: 'rate_limit', action: 'queue_and_retry' },
      { condition: 'content_filter', action: 'sanitize_and_retry' },
      { condition: 'parse_error', action: 'request_structured_output' }
    ]
  };
}

// Main UCP compiler function
function compileToUCP(rawPrompt, config = {}) {
  const intent = classifyIntent(rawPrompt);
  const constraints = extractConstraints(rawPrompt);
  const safetyFlags = detectSafetyFlags(rawPrompt);
  const requiredTools = identifyRequiredTools(rawPrompt, intent);
  const executionPlan = buildExecutionPlan(intent, constraints, requiredTools);
  const fallbackPlan = buildFallbackPlan(intent);
  
  // Calculate token budget
  const contextWindow = config.contextWindow || 4096;
  const estimatedPromptTokens = estimateTokens(rawPrompt);
  const systemPromptTokens = 200; // Reserved for system prompt
  const availableTokens = contextWindow - estimatedPromptTokens - systemPromptTokens;
  const maxTokensBudget = Math.min(config.maxTokens || 1024, Math.floor(availableTokens * 0.8));
  
  return {
    ucp_version: '1.0.0',
    compiled_at: new Date().toISOString(),
    intent: {
      type: intent.type,
      confidence: intent.confidence,
      raw_prompt_hash: null // Will be set after hashing
    },
    constraints: constraints,
    safety_flags: safetyFlags,
    required_tools: requiredTools,
    execution_plan: executionPlan,
    fallback_plan: fallbackPlan,
    target_models: config.targetModels || ['default'],
    token_budget: {
      max_tokens: maxTokensBudget,
      context_window: contextWindow,
      estimated_prompt_tokens: estimatedPromptTokens,
      reserved_system_tokens: systemPromptTokens
    },
    metadata: {
      prompt_length: rawPrompt.length,
      constraint_count: constraints.length,
      safety_flag_count: safetyFlags.length,
      tool_count: requiredTools.length
    }
  };
}

// Normalize prompt based on UCP rules
async function normalizePrompt(rawPrompt, rules) {
  let normalized = rawPrompt.trim();
  
  // Apply normalization rules in priority order
  const normRules = rules
    .filter(r => r.rule_type === 'normalization' && r.is_active)
    .sort((a, b) => a.priority - b.priority);
  
  for (const rule of normRules) {
    if (rule.action && rule.action.type === 'replace') {
      const regex = new RegExp(rule.condition.pattern, 'gi');
      normalized = normalized.replace(regex, rule.action.replacement || '');
    }
    if (rule.action && rule.action.type === 'trim_whitespace') {
      normalized = normalized.replace(/\s+/g, ' ').trim();
    }
    if (rule.action && rule.action.type === 'lowercase_keywords') {
      // Keep original case for most text but normalize specific keywords
    }
  }
  
  // Default normalizations
  normalized = normalized.replace(/\s+/g, ' '); // Normalize whitespace
  
  return normalized;
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
    const { sessionId, rawPrompt, providerConfigId, maxTokens } = body;
    
    // Validate input
    if (!rawPrompt || typeof rawPrompt !== 'string') {
      return Response.json({ error: 'Invalid prompt' }, { status: 400 });
    }
    
    if (rawPrompt.length > 50000) {
      return Response.json({ error: 'Prompt exceeds maximum length (50000 characters)' }, { status: 400 });
    }
    
    // Get provider config if specified
    let providerConfig = null;
    let contextWindow = 4096;
    
    if (providerConfigId) {
      const configs = await base44.entities.ProviderConfig.filter({ id: providerConfigId });
      if (configs.length > 0 && configs[0].user_id === user.id) {
        providerConfig = configs[0];
        contextWindow = providerConfig.context_window || 4096;
      }
    }
    
    // Get UCP rules
    const rules = await base44.entities.UCPRule.filter({ is_active: true });
    
    // Create or update session
    let session;
    if (sessionId) {
      const sessions = await base44.entities.Session.filter({ id: sessionId });
      if (sessions.length > 0 && sessions[0].user_id === user.id) {
        session = sessions[0];
      }
    }
    
    if (!session) {
      session = await base44.entities.Session.create({
        user_id: user.id,
        provider_config_id: providerConfigId || null,
        model_name: providerConfig?.default_model || 'default',
        status: 'compiling',
        raw_prompt: rawPrompt,
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
        total_cost_estimate: 0,
        total_latency_ms: 0
      });
    } else {
      await base44.entities.Session.update(session.id, {
        status: 'compiling',
        raw_prompt: rawPrompt
      });
    }
    
    const hops = [];
    let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
    
    // Hop A: Raw prompt
    const hopAContent = rawPrompt;
    const hopAHash = await sha256(prevHash + hopAContent);
    const hopATokens = estimateTokens(hopAContent);
    const hopAScore = calculateHopScore({
      hop_type: 'RAW_PROMPT',
      tokens_in: hopATokens,
      tokens_out: 0,
      latency_ms: 0,
      content: hopAContent
    }, contextWindow);
    
    const hopA = await base44.entities.Hop.create({
      session_id: session.id,
      hop_index: 0,
      hop_type: 'RAW_PROMPT',
      content: hopAContent,
      tokens_in: hopATokens,
      tokens_out: 0,
      latency_ms: 0,
      score: hopAScore.score,
      score_breakdown: hopAScore.breakdown,
      sha256_hash: hopAHash,
      prev_hash: prevHash,
      token_method: 'local-estimated',
      timestamp: new Date().toISOString()
    });
    hops.push(hopA);
    prevHash = hopAHash;
    
    // Hop B: Normalized prompt
    const normalizedPrompt = await normalizePrompt(rawPrompt, rules);
    const hopBHash = await sha256(prevHash + normalizedPrompt);
    const hopBTokens = estimateTokens(normalizedPrompt);
    const hopBScore = calculateHopScore({
      hop_type: 'NORMALIZED_PROMPT',
      tokens_in: hopBTokens,
      tokens_out: 0,
      latency_ms: Date.now() - startTime,
      content: normalizedPrompt
    }, contextWindow);
    
    const hopB = await base44.entities.Hop.create({
      session_id: session.id,
      hop_index: 1,
      hop_type: 'NORMALIZED_PROMPT',
      content: normalizedPrompt,
      tokens_in: hopBTokens,
      tokens_out: 0,
      latency_ms: Date.now() - startTime,
      score: hopBScore.score,
      score_breakdown: hopBScore.breakdown,
      sha256_hash: hopBHash,
      prev_hash: prevHash,
      token_method: 'local-estimated',
      timestamp: new Date().toISOString()
    });
    hops.push(hopB);
    prevHash = hopBHash;
    
    // Hop C: UCP Packet
    const ucpPacket = compileToUCP(normalizedPrompt, {
      contextWindow,
      maxTokens: maxTokens || providerConfig?.max_tokens_default || 1024,
      targetModels: providerConfig ? [providerConfig.default_model] : ['default']
    });
    
    // Set the hash in the UCP packet
    ucpPacket.intent.raw_prompt_hash = hopAHash;
    
    const ucpPacketString = JSON.stringify(ucpPacket, null, 2);
    const hopCHash = await sha256(prevHash + ucpPacketString);
    const hopCTokens = estimateTokens(ucpPacketString);
    const hopCScore = calculateHopScore({
      hop_type: 'UCP_PACKET',
      tokens_in: hopCTokens,
      tokens_out: 0,
      latency_ms: Date.now() - startTime,
      content: ucpPacketString
    }, contextWindow);
    
    const hopC = await base44.entities.Hop.create({
      session_id: session.id,
      hop_index: 2,
      hop_type: 'UCP_PACKET',
      content: ucpPacketString,
      content_json: ucpPacket,
      tokens_in: hopCTokens,
      tokens_out: 0,
      latency_ms: Date.now() - startTime,
      score: hopCScore.score,
      score_breakdown: hopCScore.breakdown,
      sha256_hash: hopCHash,
      prev_hash: prevHash,
      token_method: 'local-estimated',
      timestamp: new Date().toISOString()
    });
    hops.push(hopC);
    
    // Calculate total tokens so far
    const totalPromptTokens = hopATokens + hopBTokens + hopCTokens;
    const contextUsed = (totalPromptTokens / contextWindow) * 100;
    
    // Update session with compilation results
    await base44.entities.Session.update(session.id, {
      status: 'compiling',
      prompt_tokens: totalPromptTokens,
      total_tokens: totalPromptTokens,
      total_latency_ms: Date.now() - startTime,
      context_window_used: contextUsed,
      chain_hash: hopCHash,
      replay_data: {
        raw_prompt: rawPrompt,
        normalized_prompt: normalizedPrompt,
        ucp_packet: ucpPacket,
        provider_config_id: providerConfigId,
        max_tokens: maxTokens
      }
    });
    
    return Response.json({
      success: true,
      session_id: session.id,
      ucp_packet: ucpPacket,
      hops: hops.map(h => ({
        id: h.id,
        hop_index: h.hop_index,
        hop_type: h.hop_type,
        tokens_in: h.tokens_in,
        tokens_out: h.tokens_out,
        latency_ms: h.latency_ms,
        score: h.score,
        score_breakdown: h.score_breakdown,
        sha256_hash: h.sha256_hash,
        token_method: h.token_method
      })),
      totals: {
        prompt_tokens: totalPromptTokens,
        context_window_used: contextUsed,
        compilation_latency_ms: Date.now() - startTime
      },
      chain_hash: hopCHash
    });
    
  } catch (error) {
    console.error('UCP Compiler error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});