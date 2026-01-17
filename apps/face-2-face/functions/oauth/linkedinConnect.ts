import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(req.url);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const error = url.searchParams.get('error');

        if (error) {
            return Response.json({ error: `LinkedIn OAuth error: ${error}` }, { status: 400 });
        }

        if (!code) {
            const linkedinClientId = Deno.env.get('LINKEDIN_CLIENT_ID');
            const redirectUri = `${url.origin}/functions/oauth/linkedinConnect`;
            const stateToken = crypto.randomUUID();

            await base44.auth.updateMe({ oauth_state: stateToken });

            const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
                `response_type=code&` +
                `client_id=${linkedinClientId}&` +
                `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                `state=${stateToken}&` +
                `scope=r_liteprofile%20r_emailaddress`;

            return new Response(null, {
                status: 302,
                headers: { 'Location': authUrl }
            });
        }

        const currentUser = await base44.auth.me();
        if (currentUser.oauth_state !== state) {
            return Response.json({ error: 'Invalid state token' }, { status: 403 });
        }

        const linkedinClientId = Deno.env.get('LINKEDIN_CLIENT_ID');
        const linkedinClientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');
        const redirectUri = `${url.origin}/functions/oauth/linkedinConnect`;

        const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
                client_id: linkedinClientId,
                client_secret: linkedinClientSecret
            })
        });

        if (!tokenResponse.ok) {
            throw new Error('Failed to exchange code for access token');
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!profileResponse.ok) {
            throw new Error('Failed to fetch LinkedIn profile');
        }

        const profileData = await profileResponse.json();

        const verifications = await base44.entities.FacialVerification.list();
        const userVerification = verifications.find(v => 
            v.user_email === user.email && 
            v.verification_status === 'verified'
        );

        if (!userVerification) {
            return Response.json({
                error: 'Facial verification required',
                requires_verification: true
            }, { status: 403 });
        }

        const accountData = {
            user_email: user.email,
            platform: 'linkedin',
            platform_user_id: profileData.id,
            platform_username: `${profileData.localizedFirstName} ${profileData.localizedLastName}`,
            access_token: accessToken,
            verification_status: 'verified',
            is_active: true,
            last_verified: new Date().toISOString()
        };

        const existingAccounts = await base44.entities.ConnectedAccount.list();
        const existingAccount = existingAccounts.find(a => 
            a.user_email === user.email && 
            a.platform === 'linkedin'
        );

        if (existingAccount) {
            await base44.entities.ConnectedAccount.update(existingAccount.id, accountData);
        } else {
            await base44.entities.ConnectedAccount.create(accountData);
        }

        await base44.auth.updateMe({ oauth_state: null });

        return new Response(null, {
            status: 302,
            headers: { 'Location': '/Profile?connected=linkedin' }
        });

    } catch (error) {
        console.error('LinkedIn OAuth error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});