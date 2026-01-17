import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            });
        }

        const base44 = createClientFromRequest(req);
        const url = new URL(req.url);
        
        const platform = url.searchParams.get('platform') || (await req.json()).platform;
        const platform_user_id = url.searchParams.get('platform_user_id') || (await req.json()).platform_user_id;

        if (!platform || !platform_user_id) {
            return Response.json({
                success: false,
                error: 'Missing required parameters: platform and platform_user_id'
            }, { status: 400 });
        }

        // Find connected account
        const accounts = await base44.asServiceRole.entities.ConnectedAccount.list();
        const account = accounts.find(a => 
            a.platform === platform && 
            a.platform_user_id === platform_user_id &&
            a.is_active === true
        );

        if (!account) {
            return Response.json({
                success: true,
                is_verified: false,
                message: 'No Omega UI verification found for this account'
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Get verification level based on connections
        const connections = await base44.asServiceRole.entities.Connection.list();
        const userConnections = connections.filter(c =>
            c.status === 'accepted' &&
            (c.user_a === account.user_email || c.user_b === account.user_email)
        );

        const connectionCount = userConnections.length;
        let verificationLevel = 'bronze';
        if (connectionCount >= 20) verificationLevel = 'platinum';
        else if (connectionCount >= 10) verificationLevel = 'gold';
        else if (connectionCount >= 5) verificationLevel = 'silver';

        return Response.json({
            success: true,
            is_verified: true,
            verification_level: verificationLevel,
            verification_date: account.last_verified,
            verified_connections: connectionCount,
            platform: platform
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Check verification error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});