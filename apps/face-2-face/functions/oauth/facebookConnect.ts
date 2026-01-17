import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ 
                success: false,
                error: 'Unauthorized - user must be logged in' 
            }, { status: 401 });
        }

        const url = new URL(req.url);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const error = url.searchParams.get('error');

        // Handle OAuth errors
        if (error) {
            return Response.json({
                success: false,
                error: `Facebook OAuth error: ${error}`
            }, { status: 400 });
        }

        // If no code, initiate OAuth flow
        if (!code) {
            const facebookAppId = Deno.env.get('FACEBOOK_APP_ID');
            const redirectUri = `${url.origin}/functions/oauth/facebookConnect`;
            const stateToken = crypto.randomUUID();

            // Store state in user data for verification
            await base44.auth.updateMe({
                oauth_state: stateToken
            });

            const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
                `client_id=${facebookAppId}&` +
                `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                `state=${stateToken}&` +
                `scope=public_profile,email`;

            return new Response(null, {
                status: 302,
                headers: {
                    'Location': authUrl
                }
            });
        }

        // Verify state token
        const currentUser = await base44.auth.me();
        if (currentUser.oauth_state !== state) {
            return Response.json({
                success: false,
                error: 'Invalid state token - possible CSRF attack'
            }, { status: 403 });
        }

        // Exchange code for access token
        const facebookAppId = Deno.env.get('FACEBOOK_APP_ID');
        const facebookAppSecret = Deno.env.get('FACEBOOK_APP_SECRET');
        const redirectUri = `${url.origin}/functions/oauth/facebookConnect`;

        const tokenResponse = await fetch(
            `https://graph.facebook.com/v18.0/oauth/access_token?` +
            `client_id=${facebookAppId}&` +
            `client_secret=${facebookAppSecret}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `code=${code}`
        );

        if (!tokenResponse.ok) {
            throw new Error('Failed to exchange code for access token');
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Get user's Facebook profile
        const profileResponse = await fetch(
            `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${accessToken}`
        );

        if (!profileResponse.ok) {
            throw new Error('Failed to fetch Facebook profile');
        }

        const profileData = await profileResponse.json();

        // Verify user has completed facial verification
        const verifications = await base44.entities.FacialVerification.list();
        const userVerification = verifications.find(v => 
            v.user_email === user.email && 
            v.verification_status === 'verified'
        );

        if (!userVerification) {
            return Response.json({
                success: false,
                error: 'Facial verification required before connecting social media',
                requires_verification: true
            }, { status: 403 });
        }

        // Create or update connected account
        const existingAccounts = await base44.entities.ConnectedAccount.list();
        const existingAccount = existingAccounts.find(a => 
            a.user_email === user.email && 
            a.platform === 'facebook'
        );

        const accountData = {
            user_email: user.email,
            platform: 'facebook',
            platform_user_id: profileData.id,
            platform_username: profileData.name,
            access_token: accessToken, // In production, encrypt this
            verification_status: 'verified',
            is_active: true,
            last_verified: new Date().toISOString()
        };

        if (existingAccount) {
            await base44.entities.ConnectedAccount.update(existingAccount.id, accountData);
        } else {
            await base44.entities.ConnectedAccount.create(accountData);
        }

        // Clear oauth_state
        await base44.auth.updateMe({ oauth_state: null });

        // Redirect to profile page with success message
        return new Response(null, {
            status: 302,
            headers: {
                'Location': '/Profile?connected=facebook'
            }
        });

    } catch (error) {
        console.error('Facebook OAuth error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});