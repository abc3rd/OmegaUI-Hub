import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { packet_id, user_context } = await req.json();

        // Validate inputs
        if (!packet_id || packet_id.length > 100) {
            return Response.json({ 
                error: 'Invalid packet_id: must be non-empty and max 100 characters' 
            }, { status: 400 });
        }

        // Load UcpDictionary entry (using service role as this contains sensitive data)
        const dictionaries = await base44.asServiceRole.entities.UcpDictionary.filter({ 
            packet_id,
            is_active: true 
        });

        if (!dictionaries || dictionaries.length === 0) {
            return Response.json({ 
                error: 'Packet not found or inactive' 
            }, { status: 404 });
        }

        const dictionary = dictionaries[0];

        // Record packet usage for this user
        const existingPackets = await base44.entities.UcpPacket.filter({ 
            packet_id,
            created_by: user.email 
        });

        if (existingPackets && existingPackets.length > 0) {
            // Update existing packet
            await base44.entities.UcpPacket.update(existingPackets[0].id, {
                last_used_date: new Date().toISOString(),
                usage_count: (existingPackets[0].usage_count || 0) + 1
            });
        } else {
            // Create new packet record
            await base44.entities.UcpPacket.create({
                packet_id,
                intent: dictionary.intent,
                version: dictionary.version,
                organization: user_context?.organization || 'default',
                last_used_date: new Date().toISOString(),
                usage_count: 1
            });
        }

        // Return ONLY the compiled prompt capsule (no raw templates)
        return Response.json({
            system_prompt: dictionary.system_template,
            developer_prompt: dictionary.developer_template || '',
            output_contract: dictionary.output_contract ? JSON.parse(dictionary.output_contract) : null,
            intent: dictionary.intent,
            version: dictionary.version
        });

    } catch (error) {
        console.error('Error resolving UCP packet:', error);
        return Response.json({ 
            error: error.message || 'Failed to resolve packet' 
        }, { status: 500 });
    }
});