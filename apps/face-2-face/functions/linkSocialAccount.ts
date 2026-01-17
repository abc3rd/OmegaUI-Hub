import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
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
        const { verification_token, platform, platform_user_id, platform_username } = await req.json();

        if (!verification_token || !platform || !platform_user_id) {
            return Response.json({
                success: false,
                error: 'Missing required parameters'
            }, { status: 400 });
        }

        // Verify the token
        const tokens = await base44.asServiceRole.entities.VerificationToken.list();
        const token = tokens.find(t => 
            t.token === verification_token && 
            t.is_active === true
        );

        if (!token) {
            return Response.json({
                success: false,
                error: 'Invalid or expired verification token'
            }, { status: 401 });
        }

        // Check if account already linked
        const accounts = await base44.asServiceRole.entities.ConnectedAccount.list();
        const existingAccount = accounts.find(a => 
            a.platform === platform && 
            a.platform_user_id === platform_user_id
        );

        if (existingAccount && existingAccount.user_email !== token.user_email) {
            return Response.json({
                success: false,
                error: 'This social account is already linked to another Omega UI user'
            }, { status: 409 });
        }

        // Create or update connected account
        const accountData = {
            user_email: token.user_email,
            platform: platform,
            platform_user_id: platform_user_id,
            platform_username: platform_username || '',
            verification_status: 'verified',
            is_active: true,
            last_verified: new Date().toISOString()
        };

        if (existingAccount) {
            await base44.asServiceRole.entities.ConnectedAccount.update(existingAccount.id, accountData);
        } else {
            await base44.asServiceRole.entities.ConnectedAccount.create(accountData);
        }

        // Update token usage
        await base44.asServiceRole.entities.VerificationToken.update(token.id, {
            usage_count: (token.usage_count || 0) + 1,
            platform_permissions: token.platform_permissions?.includes(platform)
                ? token.platform_permissions
                : [...(token.platform_permissions || []), platform]
        });

        return Response.json({
            success: true,
            linked: true,
            verification_badge_url: `https://cdn.omegaui.com/badges/verified-${platform}.png`,
            message: `Successfully linked ${platform} account to Omega UI`
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Link account error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});