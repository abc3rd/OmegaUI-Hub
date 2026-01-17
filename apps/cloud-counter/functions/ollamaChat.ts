import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify user is authenticated
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await req.json();
        
        // Get Ollama base URL from environment or use default
        const ollamaBaseUrl = Deno.env.get('OLLAMA_BASE_URL') || 'http://localhost:11434';
        
        // Proxy request to Ollama
        const ollamaResponse = await fetch(`${ollamaBaseUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        if (!ollamaResponse.ok) {
            const errorText = await ollamaResponse.text();
            return Response.json({ 
                error: 'Ollama request failed', 
                details: errorText 
            }, { status: ollamaResponse.status });
        }
        
        const data = await ollamaResponse.json();
        
        return Response.json(data);
        
    } catch (error) {
        console.error('Ollama proxy error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});