import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

Deno.serve(async (req) => {
    // This endpoint is called by the external agent, so we authenticate with a token.
    const base44 = createClientFromRequest(req);
    const { token, devices } = await req.json();

    if (!token || !devices) {
        return Response.json({ error: 'Token and devices array are required' }, { status: 400 });
    }

    try {
        // Use service role to validate the token
        const matchingTokens = await base44.asServiceRole.entities.ScanToken.filter({ token: token });
        if (matchingTokens.length === 0) {
            return Response.json({ error: 'Invalid or expired token' }, { status: 403 });
        }
        const scanToken = matchingTokens[0];

        // Check for expiration
        if (new Date(scanToken.expires_at) < new Date()) {
            await base44.asServiceRole.entities.ScanToken.delete(scanToken.id); // Clean up expired token
            return Response.json({ error: 'Token expired' }, { status: 403 });
        }
        
        const user_email = scanToken.user_email;

        // Process discovered devices
        for (const device of devices) {
            const existingDevices = await base44.asServiceRole.entities.DiscoveredDevice.filter({
                user_email: user_email,
                ip_address: device.ip_address
            });

            const deviceData = {
                ...device,
                user_email,
                status: 'online',
                last_seen: new Date().toISOString()
            };

            if (existingDevices.length > 0) {
                // Update existing device
                await base44.asServiceRole.entities.DiscoveredDevice.update(existingDevices[0].id, deviceData);
            } else {
                // Create new device
                await base44.asServiceRole.entities.DiscoveredDevice.create(deviceData);
            }
        }
        
        // Invalidate the token after successful use
        await base44.asServiceRole.entities.ScanToken.delete(scanToken.id);

        return Response.json({ success: true, message: `Processed ${devices.length} devices.` });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});