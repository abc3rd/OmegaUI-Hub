import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { prompt, systemPrompt, temperature = 0.7, maxTokens = 1024 } = await req.json();

        if (!prompt) {
            return Response.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // Get the default AI provider
        const providers = await base44.asServiceRole.entities.ApiProvider.filter({ created_by: user.email });
        const defaultProvider = providers.find(p => p.is_default) || providers[0];

        if (!defaultProvider) {
            return Response.json({ 
                error: 'No AI provider configured. Please add one in settings.' 
            }, { status: 400 });
        }

        let response;
        const startTime = performance.now();

        // Route to appropriate provider
        switch (defaultProvider.provider_name) {
            case 'OpenAI':
                response = await callOpenAI(defaultProvider, prompt, systemPrompt, temperature, maxTokens);
                break;
            
            case 'Anthropic':
                response = await callAnthropic(defaultProvider, prompt, systemPrompt, temperature, maxTokens);
                break;
            
            case 'Google Gemini':
                response = await callGemini(defaultProvider, prompt, systemPrompt, temperature, maxTokens);
                break;
            
            case 'Cohere':
                response = await callCohere(defaultProvider, prompt, systemPrompt, temperature, maxTokens);
                break;
            
            case 'Mistral AI':
                response = await callMistral(defaultProvider, prompt, systemPrompt, temperature, maxTokens);
                break;
            
            case 'Local LM Studio':
                response = await callLocalLM(defaultProvider, prompt, systemPrompt, temperature, maxTokens);
                break;
            
            default:
                return Response.json({ 
                    error: `Unsupported provider: ${defaultProvider.provider_name}` 
                }, { status: 400 });
        }

        const responseTime = Math.round(performance.now() - startTime);

        return Response.json({
            success: true,
            response: response.content,
            provider: defaultProvider.provider_name,
            model: defaultProvider.model_name,
            responseTime
        });

    } catch (error) {
        console.error('AI Invocation Error:', error);
        return Response.json({ 
            error: error.message || 'Failed to process AI request',
            details: error.toString()
        }, { status: 500 });
    }
});

// OpenAI API
async function callOpenAI(provider, prompt, systemPrompt, temperature, maxTokens) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.api_key}`
        },
        body: JSON.stringify({
            model: provider.model_name || 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            temperature,
            max_tokens: maxTokens
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return { content: data.choices[0].message.content };
}

// Anthropic API
async function callAnthropic(provider, prompt, systemPrompt, temperature, maxTokens) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': provider.api_key,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: provider.model_name || 'claude-3-5-sonnet-20241022',
            system: systemPrompt,
            messages: [
                { role: 'user', content: prompt }
            ],
            temperature,
            max_tokens: maxTokens
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Anthropic Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return { content: data.content[0].text };
}

// Google Gemini API
async function callGemini(provider, prompt, systemPrompt, temperature, maxTokens) {
    const fullPrompt = `${systemPrompt}\n\n${prompt}`;
    
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${provider.model_name || 'gemini-1.5-flash'}:generateContent?key=${provider.api_key}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: fullPrompt }]
                }],
                generationConfig: {
                    temperature,
                    maxOutputTokens: maxTokens
                }
            })
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return { content: data.candidates[0].content.parts[0].text };
}

// Cohere API
async function callCohere(provider, prompt, systemPrompt, temperature, maxTokens) {
    const fullPrompt = `${systemPrompt}\n\n${prompt}`;
    
    const response = await fetch('https://api.cohere.ai/v1/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.api_key}`
        },
        body: JSON.stringify({
            model: provider.model_name || 'command-r',
            message: fullPrompt,
            temperature,
            max_tokens: maxTokens
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Cohere Error: ${error.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return { content: data.text };
}

// Mistral AI API
async function callMistral(provider, prompt, systemPrompt, temperature, maxTokens) {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.api_key}`
        },
        body: JSON.stringify({
            model: provider.model_name || 'mistral-large-latest',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            temperature,
            max_tokens: maxTokens
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Mistral Error: ${error.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return { content: data.choices[0].message.content };
}

// Local LM Studio - OpenAI-compatible API
async function callLocalLM(provider, prompt, systemPrompt, temperature, maxTokens) {
    const endpoint = provider.api_endpoint || 'http://localhost:1234/v1/chat/completions';
    
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: provider.model_name || 'local-model',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            temperature,
            max_tokens: maxTokens
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Local LM Error: ${error || 'Cannot connect to local server. Make sure LM Studio is running.'}`);
    }

    const data = await response.json();
    return { content: data.choices[0].message.content };
}