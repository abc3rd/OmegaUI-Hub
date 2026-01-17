import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

Deno.serve(async (req) => {
    try {
        // Initialize the SDK and authenticate the user
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { prompt } = await req.json();
        if (!prompt) {
            return Response.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // Use the built-in InvokeLLM integration
        const { result } = await base44.integrations.Core.InvokeLLM({
            prompt: `Based on the following prompt, generate a piece of content. The response should be only the generated text, without any additional commentary or introduction.

Prompt: "${prompt}"`,
        });

        // The result from InvokeLLM is already a string
        return Response.json({ content: result });

    } catch (error) {
        console.error('Error in generateAIContent:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});