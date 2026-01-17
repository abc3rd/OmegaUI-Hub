import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { prompt, settings } = await req.json();

        // Validate inputs
        if (!prompt || typeof prompt !== 'string') {
            return Response.json({ 
                error: 'Invalid prompt: must be a non-empty string' 
            }, { status: 400 });
        }

        if (prompt.length > 10000) {
            return Response.json({ 
                error: 'Prompt exceeds maximum length of 10000 characters' 
            }, { status: 400 });
        }

        // Calculate transmitted tokens (client to server)
        const transmitted_tokens = Math.ceil(prompt.length / 4);

        // Call LLM
        const output = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: settings?.add_context || false
        });

        // Calculate token usage
        const prompt_tokens = Math.ceil(prompt.length / 4);
        const completion_tokens = Math.ceil(output.length / 4);
        const total_tokens = prompt_tokens + completion_tokens;

        return Response.json({
            output,
            usage: {
                prompt_tokens,
                completion_tokens,
                total_tokens,
                transmitted_tokens
            },
            model: settings?.model || 'gpt-4o'
        });

    } catch (error) {
        console.error('Error running standard model:', error);
        return Response.json({ 
            error: error.message || 'Failed to run model' 
        }, { status: 500 });
    }
});