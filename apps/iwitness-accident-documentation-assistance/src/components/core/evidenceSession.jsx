// Evidence session utilities - cryptographic chain of custody

/**
 * Generate SHA-256 hash using WebCrypto API
 */
export async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create canonical JSON for stable hashing
 * - Sort keys alphabetically
 * - Omit undefined/null values
 * - Normalize location precision (6 decimals for lat/lng)
 */
export function canonicalJSON(obj) {
  if (obj === null || obj === undefined) return null;
  
  if (typeof obj !== 'object' || obj instanceof Date) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => canonicalJSON(item));
  }
  
  // Normalize location precision
  if (obj.lat !== undefined && obj.lng !== undefined) {
    return {
      lat: Number(obj.lat.toFixed(6)),
      lng: Number(obj.lng.toFixed(6)),
      accuracy: obj.accuracy ? Math.round(obj.accuracy) : undefined,
      timestamp: obj.timestamp,
      permission_status: obj.permission_status
    };
  }
  
  // Sort keys and omit null/undefined
  const sorted = {};
  Object.keys(obj)
    .sort()
    .forEach(key => {
      const value = canonicalJSON(obj[key]);
      if (value !== null && value !== undefined) {
        sorted[key] = value;
      }
    });
  
  return sorted;
}

/**
 * Generate deterministic UCP packet ID from session
 */
export async function generateUCPPacketID(sessionId, sessionPayloadHash) {
  const combined = `${sessionId}:${sessionPayloadHash}`;
  const hash = await sha256(combined);
  return hash.substring(0, 20);
}

/**
 * Generate privacy-safe device fingerprint
 */
export async function generateDeviceFingerprint() {
  const deviceInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    viewport: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    colorDepth: window.screen.colorDepth
  };

  // Create canonical normalized string for stable hashing
  const canonical = canonicalJSON(deviceInfo);
  const fingerprintString = JSON.stringify(canonical);
  const hash = await sha256(fingerprintString);
  
  return {
    device_hash: hash,
    device_info: deviceInfo,
    device_fingerprint_raw: fingerprintString
  };
}

/**
 * Capture location snapshot
 */
export async function captureLocationSnapshot() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        permission_status: 'not_supported',
        timestamp: new Date().toISOString()
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toISOString(),
          permission_status: 'granted'
        });
      },
      (error) => {
        resolve({
          permission_status: 'denied',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      },
      {
        timeout: 10000,
        maximumAge: 0,
        enableHighAccuracy: true
      }
    );
  });
}

/**
 * Generate UUID v4
 */
export function generateUUID() {
  return crypto.randomUUID();
}

/**
 * Create evidence session with full chain of custody
 * @param {string} userId - User ID
 * @param {string} triggerSource - Source of session (siri, manual, web)
 * @param {string|null} incidentId - Associated incident ID
 * @param {Object} params - Additional params (nonce, ref, source)
 */
export async function createEvidenceSession(userId, triggerSource = 'manual', incidentId = null, params = {}) {
  const session_id = generateUUID();
  const nonce = params.nonce || generateUUID();
  const timestamp_utc = new Date().toISOString();
  
  // Normalize trigger source
  const normalized_trigger = triggerSource === 'siri' || params.trigger === 'siri' ? 'siri' : triggerSource;
  
  // Gather all session metadata
  const locationSnapshot = await captureLocationSnapshot();
  const { device_hash, device_info, device_fingerprint_raw } = await generateDeviceFingerprint();
  
  // Create canonical session start payload for hashing
  const sessionPayload = canonicalJSON({
    session_id,
    user_id: userId,
    timestamp_utc,
    trigger_source: normalized_trigger,
    location_snapshot: locationSnapshot,
    device_hash,
    nonce,
    ref: params.ref || null,
    source: params.source || null
  });
  
  const session_start_payload_hash = await sha256(JSON.stringify(sessionPayload));
  
  return {
    session_id,
    user_id: userId,
    incident_id: incidentId,
    trigger_source: normalized_trigger,
    status: 'active',
    timestamp_utc,
    location_snapshot: locationSnapshot,
    device_hash,
    device_info,
    device_fingerprint_raw,
    session_start_payload_hash,
    app_version: '1.0.0',
    nonce,
    ref: params.ref || null,
    source: params.source || null,
    completed_at: null
  };
}

/**
 * Verify session integrity
 */
export async function verifySessionIntegrity(session) {
  const sessionPayload = {
    session_id: session.session_id,
    user_id: session.user_id,
    timestamp_utc: session.timestamp_utc,
    trigger_source: session.trigger_source,
    location_snapshot: session.location_snapshot,
    device_hash: session.device_hash,
    nonce: session.nonce
  };
  
  const computed_hash = await sha256(JSON.stringify(sessionPayload));
  return computed_hash === session.integrity_hash;
}

/**
 * Get human-readable session duration
 */
export function getSessionDuration(startTime, endTime = new Date()) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end - start;
  
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}