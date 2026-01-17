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
        const match = rule.keywords.every((k) => text.includes(k.toLowerCase()));
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
            steps.push({ action: "noop", target: "dictionary", params: { missing: code } });
            continue;
        }
        for (const s of entry.steps) {
            steps.push({ ...s, from: code });
        }
    }

    return steps;
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const method = req.method;
        const url = new URL(req.url);

        // POST - create run
        if (method === 'POST') {
            const body = await req.json();
            const { inputCommand } = body;

            if (!inputCommand || typeof inputCommand !== 'string') {
                return Response.json({ error: 'inputCommand is required' }, { status: 400 });
            }

            if (inputCommand.length > 500) {
                return Response.json({ error: 'inputCommand max length 500' }, { status: 400 });
            }

            // Get config
            const configs = await base44.entities.UCPConfig.list();
            if (configs.length === 0) {
                return Response.json({ error: 'Config not initialized' }, { status: 500 });
            }

            const config = configs[0];
            const { dictionary, rules } = config;

            // Compile
            const compiledCodes = compileIntent(inputCommand, rules);
            const intentPacket = `UCP::EXEC::${compiledCodes.map(c => `[${c}]`).join('::') || '[NO-MATCH]'}`;

            // Detokenize
            const detokenizedSteps = detokenize(compiledCodes, dictionary);

            // Compute metrics
            const complexity = computeComplexity(inputCommand);
            const stdTokenCapBase = 650;
            const stdTokenCapScale = 550;
            const ucpTokenCapBase = 28;
            const ucpTokenCapScale = 40;

            const standardCap = Math.round(stdTokenCapBase + stdTokenCapScale * complexity);
            const ucpCap = Math.round(ucpTokenCapBase + ucpTokenCapScale * complexity);

            // Store run
            const run = await base44.entities.UCPRun.create({
                input_command: inputCommand,
                compiled_codes: compiledCodes,
                intent_packet: intentPacket,
                detokenized_steps: detokenizedSteps,
                standard_cap: standardCap,
                ucp_cap: ucpCap,
                complexity: complexity
            });

            return Response.json(run);
        }

        // GET - list or get by ID
        if (method === 'GET') {
            const pathParts = url.pathname.split('/');
            const runId = pathParts[pathParts.length - 1];

            // GET by ID
            if (runId && runId !== 'ucpRuns') {
                const runs = await base44.entities.UCPRun.filter({ id: runId });
                if (runs.length === 0) {
                    return Response.json({ error: 'Run not found' }, { status: 404 });
                }
                return Response.json(runs[0]);
            }

            // GET list
            const limit = parseInt(url.searchParams.get('limit') || '50');
            const runs = await base44.entities.UCPRun.list('-created_date', Math.min(limit, 100));
            return Response.json(runs);
        }

        return Response.json({ error: 'Method not allowed' }, { status: 405 });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});