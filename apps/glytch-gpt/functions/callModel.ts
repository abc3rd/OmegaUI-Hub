import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

const ALLOWED_PROVIDERS = new Set(["openai", "lm_studio", "base44"]);
const DEFAULTS = { temperature: 0.4, max_tokens: 600, top_p: 1.0 };

// Basic anti-abuse limits (tune as needed)
const MAX_MESSAGES = 30;
const MAX_TOTAL_CHARS = 24000;

function safeJson(resp) {
  return resp.json().catch(() => ({}));
}

function countChars(messages) {
  let total = 0;
  for (const m of messages) total += String(m?.content ?? "").length;
  return total;
}

function estimateUsageFromText(promptText, completionText) {
  const prompt_tokens = Math.ceil(promptText.length / 4);
  const completion_tokens = Math.ceil(completionText.length / 4);
  return {
    prompt_tokens,
    completion_tokens,
    total_tokens: prompt_tokens + completion_tokens,
    estimated: true,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Optional auth: do not block public demo
    let userId = null;
    try {
      const me = await base44.auth.me();
      userId = me?.id ?? null;
    } catch {
      userId = null;
    }

    const body = await req.json().catch(() => ({}));
    const { providerId = "openai", model, messages, settings = {} } = body;

    if (!providerId || !model || !Array.isArray(messages)) {
      return Response.json(
        { error: "Missing required fields: providerId, model, messages[]" },
        { status: 400 },
      );
    }

    if (!ALLOWED_PROVIDERS.has(providerId)) {
      return Response.json({ error: `Provider not allowed: ${providerId}` }, { status: 400 });
    }

    if (messages.length > MAX_MESSAGES) {
      return Response.json({ error: `Too many messages (max ${MAX_MESSAGES})` }, { status: 413 });
    }

    const totalChars = countChars(messages);
    if (totalChars > MAX_TOTAL_CHARS) {
      return Response.json({ error: `Payload too large (max ${MAX_TOTAL_CHARS} chars)` }, { status: 413 });
    }

    const startTime = Date.now();

    // -------------------------
    // Provider: OPENAI (server secret)
    // -------------------------
    if (providerId === "openai") {
      const apiKey = Deno.env.get("OPENAI_API_KEY");
      if (!apiKey) {
        return Response.json({ error: "Server misconfigured: OPENAI_API_KEY missing" }, { status: 500 });
      }

      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: settings.temperature ?? DEFAULTS.temperature,
          max_tokens: settings.max_tokens ?? DEFAULTS.max_tokens,
          top_p: settings.top_p ?? DEFAULTS.top_p,
        }),
      });

      const data = await safeJson(resp);
      if (!resp.ok) {
        return Response.json(
          { error: `OpenAI request failed (${resp.status})`, details: data?.error ?? data },
          { status: 502 },
        );
      }

      const latencyMs = Date.now() - startTime;
      const text = data?.choices?.[0]?.message?.content ?? "";
      const usage = data?.usage ?? estimateUsageFromText(JSON.stringify(messages), text);

      return Response.json({
        provider: "openai",
        model,
        text,
        usage,
        latencyMs,
        meta: { userIdPresent: Boolean(userId) },
      });
    }

    // -------------------------
    // Provider: LMSTUDIO (server-reachable only)
    // IMPORTANT: This will NOT work for public investors unless YOUR DEPLOYMENT can reach LM Studio.
    // -------------------------
    if (providerId === "lm_studio") {
      const baseUrl =
        String(body?.baseUrl ?? "") ||
        String(Deno.env.get("LMSTUDIO_BASE_URL") ?? "");

      if (!baseUrl) {
        return Response.json(
          { error: "LM Studio not configured. Set LMSTUDIO_BASE_URL as a secret or pass baseUrl." },
          { status: 400 },
        );
      }

      const endpoint = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages,
          temperature: settings.temperature ?? DEFAULTS.temperature,
          max_tokens: settings.max_tokens ?? DEFAULTS.max_tokens,
          top_p: settings.top_p ?? DEFAULTS.top_p,
        }),
      });

      const data = await safeJson(resp);
      if (!resp.ok) {
        return Response.json(
          { error: `LM Studio request failed (${resp.status})`, details: data?.error ?? data },
          { status: 502 },
        );
      }

      const latencyMs = Date.now() - startTime;
      const text = data?.choices?.[0]?.message?.content ?? "";
      const usage = data?.usage ?? estimateUsageFromText(JSON.stringify(messages), text);

      return Response.json({
        provider: "lm_studio",
        model,
        text,
        usage,
        latencyMs,
        meta: { note: "LM Studio only works if deployment can reach LMSTUDIO_BASE_URL" },
      });
    }

    // -------------------------
    // Provider: BASE44 InvokeLLM (optional; not ideal for investor token-savings demo)
    // -------------------------
    if (providerId === "base44") {
      const prompt = messages.map((m) => `${m.role}: ${m.content}`).join("\n\n");
      const responseText = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: Boolean(settings.add_context_from_internet),
      });

      const latencyMs = Date.now() - startTime;
      const usage = estimateUsageFromText(prompt, responseText);

      return Response.json({
        provider: "base44",
        model: "base44-default",
        text: responseText,
        usage,
        latencyMs,
      });
    }

    return Response.json({ error: "Unhandled provider" }, { status: 500 });
  } catch (error) {
    console.error("callModel error:", error);
    return Response.json({ error: error?.message || "Failed to call model" }, { status: 500 });
  }
});