import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");

async function refreshTokenIfNeeded(credentials, base44, connectionId) {
  const creds = JSON.parse(credentials);
  
  if (Date.now() >= creds.expires_at - 60000) {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: creds.refresh_token,
        grant_type: 'refresh_token'
      })
    });

    const tokens = await tokenResponse.json();
    
    if (!tokens.error) {
      creds.access_token = tokens.access_token;
      creds.expires_at = Date.now() + (tokens.expires_in * 1000);
      
      await base44.entities.CloudConnection.update(connectionId, {
        credentials_encrypted: JSON.stringify(creds)
      });
    }
  }
  
  return creds.access_token;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { connection_id } = await req.json();

    // Get connection
    const connections = await base44.entities.CloudConnection.filter({ id: connection_id });
    if (!connections.length) {
      return Response.json({ error: 'Connection not found' }, { status: 404 });
    }

    const connection = connections[0];
    
    // Update status to syncing
    await base44.entities.CloudConnection.update(connection_id, { status: 'syncing' });

    // Log sync start
    await base44.entities.ActivityLog.create({
      event_type: 'sync_start',
      severity: 'info',
      message: 'Sync initiated for Google Drive',
      provider: 'google_drive'
    });

    // Get fresh access token
    const accessToken = await refreshTokenIfNeeded(connection.credentials_encrypted, base44, connection_id);

    // Fetch files from Google Drive
    const filesResponse = await fetch(
      'https://www.googleapis.com/drive/v3/files?pageSize=100&fields=files(id,name,mimeType,size,modifiedTime,webViewLink)',
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    const filesData = await filesResponse.json();

    if (filesData.error) {
      await base44.entities.CloudConnection.update(connection_id, { status: 'error' });
      await base44.entities.ActivityLog.create({
        event_type: 'sync_error',
        severity: 'error',
        message: `Sync failed: ${filesData.error.message}`,
        provider: 'google_drive'
      });
      return Response.json({ error: filesData.error.message }, { status: 400 });
    }

    const files = filesData.files || [];
    let totalSize = 0;
    let syncedCount = 0;

    // Get existing files for this connection
    const existingFiles = await base44.entities.VaultFile.filter({ 
      connection_id: connection_id 
    });
    const existingFileMap = new Map(existingFiles.map(f => [f.file_path, f]));

    for (const file of files) {
      const fileSize = parseInt(file.size || 0) / 1024; // Convert to KB
      totalSize += fileSize;

      const existing = existingFileMap.get(file.id);
      
      if (existing) {
        // Update if modified
        if (new Date(file.modifiedTime) > new Date(existing.last_modified)) {
          await base44.entities.VaultFile.update(existing.id, {
            file_name: file.name,
            file_size_kb: fileSize,
            last_modified: file.modifiedTime,
            file_url: file.webViewLink,
            snapshot_count: (existing.snapshot_count || 1) + 1
          });
          syncedCount++;
        }
      } else {
        // Create new file record
        await base44.entities.VaultFile.create({
          file_name: file.name,
          file_path: file.id,
          file_url: file.webViewLink,
          file_size_kb: fileSize,
          file_type: file.mimeType,
          source_provider: 'google_drive',
          connection_id: connection_id,
          last_modified: file.modifiedTime,
          is_encrypted: true,
          snapshot_count: 1
        });
        syncedCount++;
      }
    }

    // Update connection stats
    await base44.entities.CloudConnection.update(connection_id, {
      status: 'connected',
      last_sync: new Date().toISOString(),
      total_files: files.length,
      total_size_mb: totalSize / 1024
    });

    // Log sync complete
    await base44.entities.ActivityLog.create({
      event_type: 'sync_complete',
      severity: 'info',
      message: `Sync complete: ${syncedCount} files processed`,
      provider: 'google_drive',
      details: `Total: ${files.length} files, ${(totalSize / 1024).toFixed(2)} MB`
    });

    return Response.json({ 
      success: true, 
      files_synced: syncedCount,
      total_files: files.length,
      total_size_mb: (totalSize / 1024).toFixed(2)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});