import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * POST /v1/reports/{report_id}/media
 * Upload media (photo/video/audio) for a report
 * 
 * Body: multipart/form-data with file
 * Or JSON: { filename, mime_type } to get signed upload URL
 * 
 * Returns: {
 *   media_id: string
 *   file_url: string (if direct upload)
 *   upload_url: string (if signed URL requested)
 * }
 */

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json(
      { error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' },
      { status: 405 }
    );
  }

  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const reportId = pathParts[pathParts.indexOf('reports') + 1];

    if (!reportId) {
      return Response.json(
        { error: 'report_id is required in path', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Verify incident exists
    const incidents = await base44.asServiceRole.entities.Incident.filter({
      id: reportId
    });

    if (incidents.length === 0) {
      return Response.json(
        { error: 'Report not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const incident = incidents[0];
    let user_id = incident.user_id;

    // Try to get authenticated user
    try {
      const user = await base44.auth.me();
      user_id = user.id;
    } catch {
      // Anonymous allowed
    }

    // Handle multipart upload
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');
      
      if (!file) {
        return Response.json(
          { error: 'No file provided', code: 'VALIDATION_ERROR' },
          { status: 400 }
        );
      }

      // Upload file
      const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({
        file
      });

      // Determine file type
      const mimeType = file.type || 'application/octet-stream';
      let fileType = 'other';
      if (mimeType.startsWith('image/')) fileType = 'photo';
      else if (mimeType.startsWith('video/')) fileType = 'video';
      else if (mimeType.startsWith('audio/')) fileType = 'audio';

      // Create evidence file record
      const evidenceFile = await base44.asServiceRole.entities.EvidenceFile.create({
        incident_id: reportId,
        uploader_user_id: user_id,
        file_type: fileType,
        filename: file.name,
        file_url,
        file_size: file.size,
        mime_type: mimeType,
        tags: ['mobile_upload'],
        metadata: {
          uploaded_at: new Date().toISOString(),
          source: 'mobile_app'
        }
      });

      // Create audit log
      await base44.asServiceRole.entities.AuditLog.create({
        actor_user_id: user_id,
        actor_role: 'user',
        action: 'upload',
        entity_type: 'EvidenceFile',
        entity_id: evidenceFile.id,
        details: {
          incident_id: reportId,
          file_type: fileType,
          file_size: file.size
        }
      });

      return Response.json({
        media_id: evidenceFile.id,
        file_url,
        file_type: fileType,
        file_size: file.size
      }, { status: 201 });
    }

    // Handle signed URL request
    const body = await req.json();
    
    if (!body.filename || !body.mime_type) {
      return Response.json(
        { error: 'filename and mime_type required for signed URL', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // For now, return direct upload URL (Base44 doesn't have signed URLs yet)
    return Response.json({
      message: 'Use multipart/form-data upload instead',
      code: 'SIGNED_URL_NOT_SUPPORTED'
    }, { status: 501 });

  } catch (error) {
    console.error('Error uploading media:', error);
    return Response.json(
      { error: error.message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
});