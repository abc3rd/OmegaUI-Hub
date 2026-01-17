import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

Deno.serve(async (req) => {
    // This function can be called by authenticated users.
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const { origin } = new URL(req.url);
    const redirectUri = `${origin}/functions/googleOauthCallback`;

    if (!googleClientId) {
        return new Response('Google Client ID is not configured.', { status: 500 });
    }

    const scope = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ].join(' ');

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', googleClientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent'); // Important for getting a refresh token every time

    // Redirect the user to Google's consent screen
    return Response.redirect(authUrl.toString(), 302);
});