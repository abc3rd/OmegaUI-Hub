import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify user is authenticated
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get Ollama base URL from environment or use default
        const ollamaBaseUrl = Deno.env.get('OLLAMA_BASE_URL') || 'http://localhost:11434';
        
        // Get available models from Ollama
        const ollamaResponse = await fetch(`${ollamaBaseUrl}/api/tags`);
        
        if (!ollamaResponse.ok) {
            return Response.json({ 
                error: 'Failed to fetch Ollama models',
                available: false
            }, { status: 500 });
        }
        
        const data = await ollamaResponse.json();
        
        return Response.json({ 
            models: data.models || [],
            available: true
        });
        
    } catch (error) {
        console.error('Ollama tags error:', error);
        return Response.json({ 
            error: error.message,
            available: false,
            models: []
        }, { status: 500 });
    }
});