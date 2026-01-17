import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        // CORS headers for cross-platform integration
        if (req.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            });
        }

        const base44 = createClientFromRequest(req);
        
        // Parse and validate request body
        let requestData;
        try {
            requestData = await req.json();
        } catch (error) {
            return Response.json({ 
                success: false,
                error: 'Invalid JSON in request body' 
            }, { status: 400 });
        }

        const { verification_token, platform, requesting_user_id } = requestData;

        // Input validation
        if (!verification_token || typeof verification_token !== 'string') {
            return Response.json({ 
                success: false,
                error: 'Missing or invalid verification_token' 
            }, { status: 400 });
        }

        if (!platform || typeof platform !== 'string') {
            return Response.json({ 
                success: false,
                error: 'Missing or invalid platform' 
            }, { status: 400 });
        }

        const validPlatforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'external'];
        if (!validPlatforms.includes(platform)) {
            return Response.json({
                success: false,
                error: 'Invalid platform specified'
            }, { status: 400 });
        }

        // Sanitize token input
        const sanitizedToken = verification_token.trim().substring(0, 100);

        // Find the verification token using service role
        const tokens = await base44.asServiceRole.entities.VerificationToken.list();
        const token = tokens.find(t => 
            t.token === sanitizedToken && 
            t.is_active === true
        );

        if (!token) {
            return Response.json({
                success: false,
                verified: false,
                error: 'Invalid or inactive verification token'
            }, { status: 401 });
        }

        // Check if token has expired
        if (token.expires_at && new Date(token.expires_at) < new Date()) {
            await base44.asServiceRole.entities.VerificationToken.update(token.id, { 
                is_active: false 
            });
            return Response.json({
                success: false,
                verified: false,
                error: 'Token has expired'
            }, { status: 401 });
        }

        // Get the user's facial verification
        const verifications = await base44.asServiceRole.entities.FacialVerification.list();
        const userVerification = verifications.find(v => 
            v.user_email === token.user_email && 
            v.verification_status === 'verified'
        );

        if (!userVerification) {
            return Response.json({
                success: false,
                verified: false,
                error: 'No verified identity found for this token'
            }, { status: 404 });
        }

        // Check if verification is recent (within 90 days for security)
        const verificationAge = new Date() - new Date(userVerification.last_re_verification || userVerification.verification_date);
        const ninetyDaysInMs = 90 * 24 * 60 * 60 * 1000;
        
        if (verificationAge > ninetyDaysInMs) {
            return Response.json({
                success: false,
                verified: false,
                error: 'Verification is outdated. User needs to re-verify.',
                requires_re_verification: true
            }, { status: 403 });
        }

        // Get user's connection count
        const connections = await base44.asServiceRole.entities.Connection.list();
        const userConnections = connections.filter(c =>
            c.status === 'accepted' &&
            (c.user_a === token.user_email || c.user_b === token.user_email)
        );

        // Update token usage count
        await base44.asServiceRole.entities.VerificationToken.update(token.id, {
            usage_count: (token.usage_count || 0) + 1,
            platform_permissions: token.platform_permissions?.includes(platform) 
                ? token.platform_permissions 
                : [...(token.platform_permissions || []), platform]
        });

        // Get user info (safely)
        const users = await base44.asServiceRole.entities.User.list();
        const user = users.find(u => u.email === token.user_email);

        // Calculate badge level based on connections
        const connectionCount = userConnections.length;
        let badgeLevel = 'bronze';
        if (connectionCount >= 20) badgeLevel = 'platinum';
        else if (connectionCount >= 10) badgeLevel = 'gold';
        else if (connectionCount >= 5) badgeLevel = 'silver';

        // Return comprehensive verification data
        return Response.json({
            success: true,
            verified: true,
            verification_data: {
                user_id: token.user_email,
                full_name: user?.full_name || 'Verified User',
                verified_connections: connectionCount,
                verification_date: userVerification.verification_date,
                confidence_score: userVerification.confidence_score || 95,
                last_verified: userVerification.last_re_verification || userVerification.verification_date,
                platform_authorized: true,
                verification_method: 'face_to_face_biometric',
                verification_level: badgeLevel,
                is_human_verified: true,
                anti_deepfake_protected: true
            },
            badge_data: {
                badge_type: 'face_to_face_verified',
                badge_level: badgeLevel,
                badge_icon_url: `https://your-cdn.com/badges/${badgeLevel}.png`,
                verified_since: userVerification.verification_date,
                verification_protocol_version: 'F2F-v1.0'
            },
            platform_integration: {
                platform: platform,
                can_display_badge: true,
                verification_widget_url: `https://your-app.base44.io/verification-widget?token=${sanitizedToken}`,
                api_version: '1.0'
            }
        }, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'X-Verification-Protocol': 'Face-to-Face-v1.0',
                'X-F2F-Verified': 'true',
                'X-Badge-Level': badgeLevel,
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-store, no-cache, must-revalidate'
            }
        });

    } catch (error) {
        console.error('Verification error:', error);
        
        return Response.json({ 
            success: false,
            verified: false,
            error: 'Internal server error during verification',
            message: error.message
        }, { 
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
});