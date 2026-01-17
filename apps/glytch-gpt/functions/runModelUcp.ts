import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { packet_id, delta_prompt, settings, user_context } = await req.json();

        // Validate inputs
        if (!packet_id || packet_id.length > 100) {
            return Response.json({ 
                error: 'Invalid packet_id: must be non-empty and max 100 characters' 
            }, { status: 400 });
        }

        if (!delta_prompt || typeof delta_prompt !== 'string') {
            return Response.json({ 
                error: 'Invalid delta_prompt: must be a non-empty string' 
            }, { status: 400 });
        }

        if (delta_prompt.length > 2000) {
            return Response.json({ 
                error: 'Delta prompt exceeds maximum length of 2000 characters' 
            }, { status: 400 });
        }

        // Calculate transmitted tokens (only delta is sent from client to server)
        const transmitted_tokens = Math.ceil(delta_prompt.length / 4) + Math.ceil(packet_id.length / 4);

        // Resolve packet
        const packetResponse = await base44.functions.invoke('resolveUcpPacket', {
            packet_id,
            user_context: user_context || { organization: 'default' }
        });

        if (packetResponse.status !== 200) {
            return Response.json({ 
                error: 'Failed to resolve packet' 
            }, { status: 400 });
        }

        const packet = packetResponse.data;

        // Build final message payload
        const systemPrompt = packet.system_prompt;
        const developerPrompt = packet.developer_prompt;
        
        // Combine prompts for the LLM
        let finalPrompt = '';
        if (systemPrompt) {
            finalPrompt += `[SYSTEM]: ${systemPrompt}\n\n`;
        }
        if (developerPrompt) {
            finalPrompt += `[DEVELOPER]: ${developerPrompt}\n\n`;
        }
        finalPrompt += `[USER]: ${delta_prompt}`;

        // Call LLM
        const output = await base44.integrations.Core.InvokeLLM({
            prompt: finalPrompt,
            add_context_from_internet: settings?.add_context || false,
            response_json_schema: packet.output_contract || undefined
        });

        // Calculate token usage
        // Note: The actual prompt sent to LLM includes system + developer + user
        const full_prompt_tokens = Math.ceil(finalPrompt.length / 4);
        const completion_tokens = Math.ceil(
            (typeof output === 'string' ? output : JSON.stringify(output)).length / 4
        );
        const total_tokens = full_prompt_tokens + completion_tokens;

        return Response.json({
            output,
            usage: {
                prompt_tokens: full_prompt_tokens,
                completion_tokens,
                total_tokens,
                transmitted_tokens, // Much smaller - only delta + packet_id
                savings: full_prompt_tokens - transmitted_tokens
            },
            packet: {
                id: packet_id,
                intent: packet.intent,
                version: packet.version
            },
            model: settings?.model || 'gpt-4o'
        });

    } catch (error) {
        console.error('Error running UCP model:', error);
        return Response.json({ 
            error: error.message || 'Failed to run model' 
        }, { status: 500 });
    }
});