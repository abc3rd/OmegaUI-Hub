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
        const error = url.searchParams.get('error');

        if (error) {
            return Response.json({
                success: false,
                error: `Instagram OAuth error: ${error}`
            }, { status: 400 });
        }

        if (!code) {
            const instagramClientId = Deno.env.get('INSTAGRAM_CLIENT_ID');
            const redirectUri = `${url.origin}/functions/oauth/instagramConnect`;
            
            const authUrl = `https://api.instagram.com/oauth/authorize?` +
                `client_id=${instagramClientId}&` +
                `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                `scope=user_profile,user_media&` +
                `response_type=code`;

            return new Response(null, {
                status: 302,
                headers: { 'Location': authUrl }
            });
        }

        const instagramClientId = Deno.env.get('INSTAGRAM_CLIENT_ID');
        const instagramClientSecret = Deno.env.get('INSTAGRAM_CLIENT_SECRET');
        const redirectUri = `${url.origin}/functions/oauth/instagramConnect`;

        const formData = new FormData();
        formData.append('client_id', instagramClientId);
        formData.append('client_secret', instagramClientSecret);
        formData.append('grant_type', 'authorization_code');
        formData.append('redirect_uri', redirectUri);
        formData.append('code', code);

        const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
            method: 'POST',
            body: formData
        });

        if (!tokenResponse.ok) {
            throw new Error('Failed to exchange code for access token');
        }

        const tokenData = await tokenResponse.json();

        // Verify facial verification
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
            platform: 'instagram',
            platform_user_id: tokenData.user_id,
            platform_username: tokenData.username || user.full_name,
            access_token: tokenData.access_token,
            verification_status: 'verified',
            is_active: true,
            last_verified: new Date().toISOString()
        };

        const existingAccounts = await base44.entities.ConnectedAccount.list();
        const existingAccount = existingAccounts.find(a => 
            a.user_email === user.email && 
            a.platform === 'instagram'
        );

        if (existingAccount) {
            await base44.entities.ConnectedAccount.update(existingAccount.id, accountData);
        } else {
            await base44.entities.ConnectedAccount.create(accountData);
        }

        return new Response(null, {
            status: 302,
            headers: { 'Location': '/Profile?connected=instagram' }
        });

    } catch (error) {
        console.error('Instagram OAuth error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});