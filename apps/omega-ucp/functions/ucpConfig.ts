import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const DEFAULT_CONFIG = {
    dictionary: [
        {
            code: "A72-Q3",
            label: "Analyze Q3 sales data",
            steps: [
                { action: "query", target: "sales_db", params: { range: "Q3" } },
                { action: "analyze", target: "sales_db", params: { methods: ["trend", "outliers", "segments"] } },
            ],
        },
        {
            code: "GEN-RPT",
            label: "Generate summary report",
            steps: [{ action: "format", target: "report_engine", params: { style: "exec_summary" } }],
        },
        {
            code: "SND-EXEC",
            label: "Send email to executive team",
            steps: [{ action: "notify", target: "email", params: { audience: "executive_team" } }],
        },
    ],
    rules: [
        { id: "r1", keywords: ["q3", "sales", "data", "analyze"], emit: ["A72-Q3"] },
        { id: "r2", keywords: ["summary", "report", "generate"], emit: ["GEN-RPT"] },
        { id: "r3", keywords: ["email", "send", "executive", "exec"], emit: ["SND-EXEC"] },
    ],
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const method = req.method;

        // GET - retrieve config (read-only)
        if (method === 'GET') {
            const configs = await base44.entities.UCPConfig.list();
            
            if (configs.length === 0) {
                // Return default config if none exists
                return Response.json({
                    dictionary: DEFAULT_CONFIG.dictionary,
                    rules: DEFAULT_CONFIG.rules,
                    updatedAt: new Date().toISOString()
                });
            }

            const config = configs[0];
            return Response.json({
                dictionary: config.dictionary,
                rules: config.rules,
                updatedAt: config.updated_date
            });
        }

        // PUT - config updates require admin access
        if (method === 'PUT') {
            return Response.json(
                { error: 'Config updates require admin access.' },
                { status: 403 }
            );
        }

        return Response.json({ error: 'Method not allowed' }, { status: 405 });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});