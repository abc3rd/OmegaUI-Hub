import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, longInstructions } = await req.json();

        if (!name || !longInstructions) {
            return Response.json({ error: 'Missing name or longInstructions' }, { status: 400 });
        }

        const packet_id = "packet_" + Date.now();
        const packet_header = "UCP/1 EXEC PACKET=" + packet_id;

        // Store packet server-side
        await base44.asServiceRole.entities.Packet.create({
            packet_id,
            name,
            packet_header,
            long_instructions: longInstructions
        });

        // Return only safe fields to client
        return Response.json({
            packet_id,
            name,
            packet_header
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});