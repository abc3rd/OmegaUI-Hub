import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch all packets
        const packets = await base44.asServiceRole.entities.Packet.list();

        // Return only safe fields - never expose long_instructions
        const safePackets = packets.map(p => ({
            packet_id: p.packet_id,
            name: p.name,
            created_at: p.created_date
        }));

        return Response.json({ packets: safePackets });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});