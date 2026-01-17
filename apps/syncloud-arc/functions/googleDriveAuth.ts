import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, code, redirect_uri } = await req.json();

    if (action === 'get_auth_url') {
      const scopes = [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.metadata.readonly'
      ].join(' ');

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&access_type=offline` +
        `&prompt=consent`;

      return Response.json({ auth_url: authUrl });
    }

    if (action === 'exchange_code') {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri
        })
      });

      const tokens = await tokenResponse.json();

      if (tokens.error) {
        return Response.json({ error: tokens.error_description || tokens.error }, { status: 400 });
      }

      // Create connection record
      const connection = await base44.entities.CloudConnection.create({
        provider: 'google_drive',
        display_name: 'Google Drive',
        status: 'connected',
        credentials_encrypted: JSON.stringify({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: Date.now() + (tokens.expires_in * 1000)
        }),
        sync_frequency: 'realtime'
      });

      // Log the connection
      await base44.entities.ActivityLog.create({
        event_type: 'connection_added',
        severity: 'info',
        message: 'Google Drive connected successfully',
        provider: 'google_drive'
      });

      return Response.json({ success: true, connection_id: connection.id });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});