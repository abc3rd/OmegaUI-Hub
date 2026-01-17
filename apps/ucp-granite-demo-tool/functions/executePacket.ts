import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { packet_id, userInput, mode } = await req.json();

        if (!packet_id || !userInput || !mode) {
            return Response.json({ error: 'Missing packet_id, userInput, or mode' }, { status: 400 });
        }

        if (mode !== 'UCP_EXEC' && mode !== 'RESULT_ONLY') {
            return Response.json({ error: 'Invalid mode. Must be UCP_EXEC or RESULT_ONLY' }, { status: 400 });
        }

        // Look up packet server-side
        const packets = await base44.asServiceRole.entities.Packet.filter({ packet_id });
        
        if (!packets || packets.length === 0) {
            return Response.json({ error: 'Packet not found' }, { status: 404 });
        }

        const packet = packets[0];

        // Build the prompt
        const prompt = 
            "MODE=" + mode + "\n" +
            packet.packet_header + "\n" +
            "PACKET_INSTRUCTIONS_BEGIN\n" +
            packet.long_instructions + "\n" +
            "PACKET_INSTRUCTIONS_END\n" +
            "INPUT_BEGIN\n" +
            userInput + "\n" +
            "INPUT_END\n";

        // Call LM Studio
        const lmResponse = await fetch("http://100.119.81.65:1234/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "granite",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 600
            })
        });

        if (!lmResponse.ok) {
            const errorText = await lmResponse.text();
            return Response.json({ 
                error: `LM Studio error: ${lmResponse.status} - ${errorText}` 
            }, { status: 502 });
        }

        const response = await lmResponse.json();

        return Response.json({
            output: response.choices?.[0]?.message?.content || "No output received",
            usage: response.usage || null
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});