import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ 
                success: false,
                error: 'Unauthorized' 
            }, { status: 401 });
        }

        const url = new URL(req.url);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const error = url.searchParams.get('error');

        if (error) {
            return Response.json({
                success: false,
                error: `Twitter OAuth error: ${error}`
            }, { status: 400 });
        }

        if (!code) {
            const twitterClientId = Deno.env.get('TWITTER_CLIENT_ID');
            const redirectUri = `${url.origin}/functions/oauth/twitterConnect`;
            const stateToken = crypto.randomUUID();

            await base44.auth.updateMe({ oauth_state: stateToken });

            const authUrl = `https://twitter.com/i/oauth2/authorize?` +
                `response_type=code&` +
                `client_id=${twitterClientId}&` +
                `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                `state=${stateToken}&` +
                `scope=tweet.read users.read offline.access&` +
                `code_challenge=challenge&` +
                `code_challenge_method=plain`;

            return new Response(null, {
                status: 302,
                headers: { 'Location': authUrl }
            });
        }

        const currentUser = await base44.auth.me();
        if (currentUser.oauth_state !== state) {
            return Response.json({ 
                success: false,
                error: 'Invalid state token' 
            }, { status: 403 });
        }

        const twitterClientId = Deno.env.get('TWITTER_CLIENT_ID');
        const twitterClientSecret = Deno.env.get('TWITTER_CLIENT_SECRET');
        const redirectUri = `${url.origin}/functions/oauth/twitterConnect`;

        const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(`${twitterClientId}:${twitterClientSecret}`)
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
                code_verifier: 'challenge'
            })
        });

        if (!tokenResponse.ok) {
            throw new Error('Failed to exchange code for access token');
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        const profileResponse = await fetch('https://api.twitter.com/2/users/me', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!profileResponse.ok) {
            throw new Error('Failed to fetch Twitter profile');
        }

        const profileData = await profileResponse.json();

        const verifications = await base44.entities.FacialVerification.list();
        const userVerification = verifications.find(v => 
            v.user_email === user.email && 
            v.verification_status === 'verified'
        );

        if (!userVerification) {
            return Response.json({
                success: false,
                error: 'Facial verification required',
                requires_verification: true
            }, { status: 403 });
        }

        const accountData = {
            user_email: user.email,
            platform: 'twitter',
            platform_user_id: profileData.data.id,
            platform_username: profileData.data.username,
            access_token: accessToken,
            verification_status: 'verified',
            is_active: true,
            last_verified: new Date().toISOString()
        };

        const existingAccounts = await base44.entities.ConnectedAccount.list();
        const existingAccount = existingAccounts.find(a => 
            a.user_email === user.email && 
            a.platform === 'twitter'
        );

        if (existingAccount) {
            await base44.entities.ConnectedAccount.update(existingAccount.id, accountData);
        } else {
            await base44.entities.ConnectedAccount.create(accountData);
        }

        await base44.auth.updateMe({ oauth_state: null });

        return new Response(null, {
            status: 302,
            headers: { 'Location': '/Profile?connected=twitter' }
        });

    } catch (error) {
        console.error('Twitter OAuth error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});