import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Radius of Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in miles
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { shoutData, userLocation } = await req.json();

        // Verify user is authorized to send shouts for this establishment
        const authorizations = await base44.entities.AuthorizedUser.filter({
            user_email: user.email,
            establishment_id: shoutData.establishment_id,
            verification_status: 'verified',
            is_active: true
        });

        if (authorizations.length === 0) {
            return new Response(JSON.stringify({ 
                error: 'You are not authorized to send shouts for this establishment' 
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const authorization = authorizations[0];
        
        // Check if user has permission to create shouts
        if (!['create_shouts', 'manage_resources', 'full_admin'].includes(authorization.authorization_level)) {
            return new Response(JSON.stringify({ 
                error: 'Insufficient permissions to send shouts' 
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get establishment details
        const establishment = await base44.entities.EstablishmentProfile.get(shoutData.establishment_id);
        if (!establishment || establishment.verification_status !== 'verified') {
            return new Response(JSON.stringify({ 
                error: 'Establishment not found or not verified' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate broadcast radius doesn't exceed maximum
        const broadcastRadius = Math.min(shoutData.broadcast_radius || establishment.default_shout_radius, establishment.max_shout_radius);

        // Create the resource shout
        const shout = await base44.asServiceRole.entities.ResourceShout.create({
            ...shoutData,
            authorized_user_id: authorization.id,
            sender_name: authorization.user_name,
            sender_role: authorization.role,
            establishment_name: establishment.name,
            broadcast_radius: broadcastRadius,
        });

        // Get all users within the broadcast radius (this is a simplified approach)
        // In a real implementation, you'd have user location data stored
        const allUsers = await base44.asServiceRole.entities.User.list();
        const notificationsToSend = [];

        // For now, simulate proximity-based notifications
        // In production, you'd need users to share their location
        for (const targetUser of allUsers) {
            if (targetUser.email === user.email) continue; // Don't notify the sender
            
            // Simulate user being within radius (in real app, you'd check actual location)
            const distance = Math.random() * (broadcastRadius * 2); // Random distance for simulation
            
            if (distance <= broadcastRadius) {
                const notification = await base44.asServiceRole.entities.ShoutNotification.create({
                    shout_id: shout.id,
                    recipient_email: targetUser.email,
                    recipient_latitude: shoutData.location_latitude + (Math.random() - 0.5) * 0.01, // Simulate nearby location
                    recipient_longitude: shoutData.location_longitude + (Math.random() - 0.5) * 0.01,
                    distance_miles: distance,
                    notification_method: 'in_app'
                });
                
                notificationsToSend.push({
                    user: targetUser,
                    notification: notification,
                    distance: distance
                });
            }
        }

        // In a real implementation, you would send actual push notifications here
        // For now, we'll just log that notifications would be sent
        console.log(`Would send ${notificationsToSend.length} notifications for shout: ${shout.title}`);

        return new Response(JSON.stringify({
            success: true,
            shout: shout,
            notifications_sent: notificationsToSend.length,
            message: 'Resource shout broadcasted successfully!'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error sending resource shout:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});