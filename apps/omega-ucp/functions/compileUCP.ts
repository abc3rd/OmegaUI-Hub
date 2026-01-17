import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
}

function computeComplexity(text) {
    if (!text) return 0.2;
    const len = Math.min(text.length, 240);
    const verbHints = ["analyze", "generate", "email", "summarize", "export", "notify", "build", "create"];
    const hits = verbHints.reduce((acc, v) => acc + (text.toLowerCase().includes(v) ? 1 : 0), 0);
    return clamp(0.25 + len / 400 + hits * 0.12, 0.15, 1);
}

function compileIntent(inputCommand, rules) {
    const text = inputCommand.toLowerCase();
    const emitted = [];

    for (const rule of rules) {
        const mode = rule.mode || "all";
        const match = mode === "any"
            ? rule.keywords.some((k) => text.includes(k.toLowerCase()))
            : rule.keywords.every((k) => text.includes(k.toLowerCase()));
        
        if (match) {
            for (const code of rule.emit) {
                if (!emitted.includes(code)) emitted.push(code);
            }
        }
    }

    return emitted;
}

function detokenize(codes, dictionary) {
    const dictMap = new Map(dictionary.map((d) => [d.code, d]));
    const steps = [];

    for (const code of codes) {
        const entry = dictMap.get(code);
        if (!entry) {
            steps.push({ action: "noop", target: "unknown", from: code });
            continue;
        }
        // SANITIZED: only return high-level action + target, no proprietary params
        for (const s of entry.steps) {
            steps.push({ 
                action: s.action, 
                target: s.target,
                from: code 
            });
        }
    }

    return steps;
}

// Simple in-memory rate limiter (per-user)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

function checkRateLimit(userId) {
    const now = Date.now();
    const userKey = `user:${userId}`;
    
    if (!rateLimitMap.has(userKey)) {
        rateLimitMap.set(userKey, { count: 1, windowStart: now });
        return true;
    }
    
    const record = rateLimitMap.get(userKey);
    const windowElapsed = now - record.windowStart;
    
    if (windowElapsed > RATE_LIMIT_WINDOW) {
        // Reset window
        rateLimitMap.set(userKey, { count: 1, windowStart: now });
        return true;
    }
    
    if (record.count >= MAX_REQUESTS_PER_WINDOW) {
        return false;
    }
    
    record.count++;
    return true;
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // CRITICAL: Require authentication
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Authentication required' }, { status: 401 });
        }

        // Rate limiting
        if (!checkRateLimit(user.id)) {
            return Response.json({ 
                error: 'Rate limit exceeded. Max 30 requests per minute.' 
            }, { status: 429 });
        }

        const body = await req.json();
        const { inputCommand } = body;

        // Input validation
        if (!inputCommand || typeof inputCommand !== 'string') {
            return Response.json({ error: 'inputCommand is required' }, { status: 400 });
        }

        // Enforce max length and sanitize
        const sanitized = inputCommand.trim();
        if (sanitized.length === 0) {
            return Response.json({ error: 'inputCommand cannot be empty' }, { status: 400 });
        }
        if (sanitized.length > 1000) {
            return Response.json({ error: 'inputCommand max length 1000 chars' }, { status: 400 });
        }

        // Load config from server (using service role for secure access)
        const configs = await base44.asServiceRole.entities.UCPConfig.list();
        if (configs.length === 0) {
            return Response.json({ error: 'Config not initialized' }, { status: 500 });
        }

        const config = configs[0];
        const { dictionary, rules } = config;

        // Compile
        const compiledCodes = compileIntent(sanitized, rules);
        const intentPacket = `UCP::EXEC::${compiledCodes.map(c => `[${c}]`).join('::') || '[NO-MATCH]'}`;

        // Detokenize
        const detokenizedSteps = detokenize(compiledCodes, dictionary);

        // Compute metrics
        const complexity = computeComplexity(sanitized);
        const stdTokenCapBase = 650;
        const stdTokenCapScale = 550;
        const ucpTokenCapBase = 28;
        const ucpTokenCapScale = 40;

        const standardCap = Math.round(stdTokenCapBase + stdTokenCapScale * complexity);
        const ucpCap = Math.round(ucpTokenCapBase + ucpTokenCapScale * complexity);

        return Response.json({
            compiledCodes,
            intentPacket,
            detokenizedSteps,
            complexity,
            standardCap,
            ucpCap
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});