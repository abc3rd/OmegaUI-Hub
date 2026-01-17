import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

function uid(prefix = "PKT") {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 18).toUpperCase()}`;
}

// Conservative token estimator for UI dashboards (use OpenAI usage when available)
function estimateTokens(text) {
  const words = text.match(/\b\w+\b|\S+/g) || [];
  const punctuation = text.match(/[.,!?;:\-—()[\]{}"']/g) || [];
  const newlines = text.match(/\n/g) || [];
  const rough = Math.ceil((words.length + Math.ceil(punctuation.length / 2) + newlines.length) * 1.3);
  return Math.max(rough, 1);
}

async function inferIntentWithAI(base44, prompt) {
  try {
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this user prompt and return a JSON object with:
1. "intent": primary intent category (SUMMARIZE, TRANSLATE, REWRITE, GENCODE, ANALYZE, EXPLAIN, QUESTION, CREATE, EDIT, or CUSTOM)
2. "confidence": confidence score 0-100
3. "secondary_intents": array of other possible intents
4. "complexity": LOW, MEDIUM, or HIGH
5. "suggested_constraints": object with recommended constraints like max_output_tokens, output_format, tone
6. "reasoning": brief explanation

User prompt: "${prompt.replace(/"/g, '\\"')}"`,
      response_json_schema: {
        type: "object",
        properties: {
          intent: { type: "string" },
          confidence: { type: "number" },
          secondary_intents: { type: "array", items: { type: "string" } },
          complexity: { type: "string" },
          suggested_constraints: { type: "object" },
          reasoning: { type: "string" }
        }
      }
    });

    return analysis;
  } catch (error) {
    console.error("AI intent inference failed, falling back to rule-based:", error);
    // Fallback to simple rule-based
    const p = prompt.toLowerCase();
    let intent = "CUSTOM";
    if (p.includes("summar")) intent = "SUMMARIZE";
    else if (p.includes("translate") || p.includes("convert to")) intent = "TRANSLATE";
    else if (p.includes("rewrite") || p.includes("rephrase")) intent = "REWRITE";
    else if (p.includes("code") || p.includes("script") || p.includes("build")) intent = "GENCODE";
    else if (p.includes("analy") || p.includes("evaluate")) intent = "ANALYZE";
    else if (p.includes("explain") || p.includes("break down")) intent = "EXPLAIN";

    return {
      intent,
      confidence: 60,
      secondary_intents: [],
      complexity: "MEDIUM",
      suggested_constraints: { max_output_tokens: 500, output_format: "text" },
      reasoning: "Rule-based fallback analysis"
    };
  }
}

/**
 * DEMO SAFE packet format:
 * - shows the concept (intent packetization) without exposing proprietary routing logic
 * - You can evolve this server-side later without changing the UI
 */
function buildDemoPacket(prompt, analysisResult) {
  const { intent, suggested_constraints, complexity } = analysisResult;
  
  const constraints = [];
  if (suggested_constraints.max_output_tokens) {
    constraints.push(`MAX_TOKENS=${suggested_constraints.max_output_tokens}`);
  }
  if (suggested_constraints.output_format) {
    constraints.push(`FORMAT=${suggested_constraints.output_format.toUpperCase()}`);
  }
  if (suggested_constraints.tone) {
    constraints.push(`TONE=${suggested_constraints.tone.toUpperCase()}`);
  }
  constraints.push("NO_INTERNALS=TRUE");

  const packet = [
    `UCP::VERSION 1`,
    `UCP::MODE DEMO_SAFE`,
    `UCP::INTENT ${intent}`,
    `UCP::COMPLEXITY ${complexity}`,
    `UCP::CONSTRAINTS ${constraints.join(" ")}`,
    `UCP::PAYLOAD_START`,
    prompt.trim(),
    `UCP::PAYLOAD_END`,
  ].join("\n");

  const preview = packet.length > 280 ? `${packet.slice(0, 280)}…` : packet;
  return { packet, preview };
}

function calculateDetailedSavings(tokensOriginal, tokensCompiled, intent, complexity) {
  const savingsPct = tokensOriginal > 0
    ? Math.max(0, ((tokensOriginal - tokensCompiled) / tokensOriginal) * 100)
    : 0;

  // Cost per 1M tokens (approximate OpenAI pricing)
  const costPer1MInput = 2.50; // $2.50 per 1M input tokens (gpt-4o-mini)
  const costPer1MOutput = 10.00; // $10 per 1M output tokens

  const costOriginal = (tokensOriginal / 1000000) * costPer1MInput;
  const costCompiled = (tokensCompiled / 1000000) * costPer1MInput;
  const costSavings = costOriginal - costCompiled;

  // Projected savings over time
  const projections = {
    per_100_calls: costSavings * 100,
    per_1000_calls: costSavings * 1000,
    per_10000_calls: costSavings * 10000,
  };

  // Intent-specific insights
  const insights = [];
  if (savingsPct > 30) {
    insights.push("Excellent token efficiency for this intent type");
  }
  if (complexity === "HIGH" && savingsPct > 20) {
    insights.push("High complexity prompt with significant optimization");
  }
  if (intent === "SUMMARIZE" || intent === "EXPLAIN") {
    insights.push("Ideal for UCP - repetitive instruction patterns detected");
  }

  return {
    tokens_saved: tokensOriginal - tokensCompiled,
    savings_pct: Number(savingsPct.toFixed(1)),
    cost_original: Number(costOriginal.toFixed(6)),
    cost_compiled: Number(costCompiled.toFixed(6)),
    cost_savings_per_call: Number(costSavings.toFixed(6)),
    projections,
    insights,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json().catch(() => ({}));
    const prompt = String(body?.prompt ?? "").trim();
    const sessionId = String(body?.session_id ?? "").trim();

    if (!prompt) return Response.json({ error: "prompt is required" }, { status: 400 });
    if (!sessionId) return Response.json({ error: "session_id is required" }, { status: 400 });
    if (prompt.length > 8000) return Response.json({ error: "prompt too large" }, { status: 413 });

    // AI-powered intent analysis
    const analysisResult = await inferIntentWithAI(base44, prompt);
    const { packet, preview } = buildDemoPacket(prompt, analysisResult);

    const packetId = uid("UCP");

    // Store packet server-side (keeps UCP logic off the client)
    await base44.asServiceRole.entities.UcpPacket.create({
      id: packetId,
      session_id: sessionId,
      intent: analysisResult.intent,
      packet_text: packet,
      packet_preview: preview,
      status: "active",
      use_count: 0,
    });

    // Token stats for dashboard with detailed analysis
    const tokensOriginal = estimateTokens(prompt);
    const tokensCompiled = estimateTokens(packet);
    const detailedSavings = calculateDetailedSavings(
      tokensOriginal, 
      tokensCompiled, 
      analysisResult.intent, 
      analysisResult.complexity
    );

    return Response.json({
      packet_id: packetId,
      intent: analysisResult.intent,
      confidence: analysisResult.confidence,
      secondary_intents: analysisResult.secondary_intents,
      complexity: analysisResult.complexity,
      reasoning: analysisResult.reasoning,
      suggested_constraints: analysisResult.suggested_constraints,
      packet_preview: preview,
      tokens: {
        original_est: tokensOriginal,
        packet_est: tokensCompiled,
        ...detailedSavings,
      },
    });
  } catch (e) {
    console.error("ucpCompile error:", e);
    return Response.json({ error: e?.message ?? "compile failed" }, { status: 500 });
  }
});