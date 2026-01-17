import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Call LM Studio directly (client-side routing)
 * This function stores settings client-side and returns them for direct browser calls
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { baseUrl, model, messages, settings = {} } = await req.json();

        // Validate inputs
        if (!baseUrl || !model || !messages) {
            return Response.json({ 
                error: 'Missing required fields: baseUrl, model, messages' 
            }, { status: 400 });
        }

        // Return configuration for client-side direct call
        return Response.json({
            callDirect: true,
            baseUrl,
            model,
            messages,
            settings: {
                temperature: settings.temperature || 0.7,
                max_tokens: settings.max_tokens || 2000,
                top_p: settings.top_p || 1.0
            }
        });

    } catch (error) {
        console.error('Call model direct config error:', error);
        return Response.json({ 
            error: error.message || 'Failed to prepare direct call' 
        }, { status: 500 });
    }
});