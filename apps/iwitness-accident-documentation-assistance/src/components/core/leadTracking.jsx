// Lead tracking and attribution system
import { base44 } from '@/api/base44Client';
import { sha256, canonicalJSON, generateDeviceFingerprint, generateUUID } from './evidenceSession';

const ATTRIBUTION_STORAGE_KEY = 'iwitness_attribution';
const LEAD_STORAGE_KEY = 'iwitness_lead_id';
const ATTRIBUTION_EXPIRY_HOURS = 24;

/**
 * Parse attribution parameters from URL
 */
export function parseAttributionParams(urlParams) {
  return {
    ref: urlParams.get('ref') || null,
    source: urlParams.get('source') || null,
    campaign: urlParams.get('campaign') || null,
    utm_source: urlParams.get('utm_source') || null,
    utm_medium: urlParams.get('utm_medium') || null,
    utm_campaign: urlParams.get('utm_campaign') || null,
    utm_content: urlParams.get('utm_content') || null,
    utm_term: urlParams.get('utm_term') || null
  };
}

/**
 * Store attribution parameters in localStorage
 */
export function storeAttribution(params, url) {
  const attribution = {
    ...params,
    first_touch_url: url,
    last_touch_url: url,
    timestamp: new Date().toISOString()
  };
  
  // Check if we already have attribution stored
  const existing = getStoredAttribution();
  if (existing) {
    // Update last touch but preserve first touch
    attribution.first_touch_url = existing.first_touch_url;
  }
  
  localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
}

/**
 * Get stored attribution parameters
 */
export function getStoredAttribution() {
  try {
    const stored = localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!stored) return null;
    
    const attribution = JSON.parse(stored);
    const timestamp = new Date(attribution.timestamp);
    const now = new Date();
    const hoursDiff = (now - timestamp) / (1000 * 60 * 60);
    
    // Expire attribution after 24 hours
    if (hoursDiff > ATTRIBUTION_EXPIRY_HOURS) {
      localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
      return null;
    }
    
    return attribution;
  } catch (e) {
    return null;
  }
}

/**
 * Store lead ID in localStorage
 */
export function storeLeadId(leadId) {
  localStorage.setItem(LEAD_STORAGE_KEY, leadId);
}

/**
 * Get stored lead ID
 */
export function getStoredLeadId() {
  return localStorage.getItem(LEAD_STORAGE_KEY);
}

/**
 * Create or update lead
 */
export async function createOrUpdateLead(params) {
  const { device_hash } = await generateDeviceFingerprint();
  const lead_id = generateUUID();
  const created_at_utc = new Date().toISOString();
  
  // Check for existing lead (same device within 24h)
  const existingLeadId = getStoredLeadId();
  if (existingLeadId) {
    try {
      const existingLeads = await base44.entities.Lead.filter({ lead_id: existingLeadId });
      if (existingLeads.length > 0) {
        const existingLead = existingLeads[0];
        const leadAge = (new Date() - new Date(existingLead.created_at_utc)) / (1000 * 60 * 60);
        
        if (leadAge < ATTRIBUTION_EXPIRY_HOURS && existingLead.device_hash === device_hash) {
          // Update last touch
          const updatedLead = {
            ...existingLead,
            last_touch_url: params.url,
            last_updated_utc: created_at_utc
          };
          
          await base44.entities.Lead.update(existingLead.id, updatedLead);
          
          // Log touch updated event
          await createLeadEvent(existingLead.lead_id, 'TOUCH_UPDATED', {
            last_touch_url: params.url,
            new_params: params.attribution
          }, params.userId);
          
          return { lead: updatedLead, isNew: false };
        }
      }
    } catch (e) {
      // If lead not found, create new one
    }
  }
  
  // Create canonical lead payload
  const leadPayload = canonicalJSON({
    lead_id,
    created_at_utc,
    device_hash,
    referral_code: params.attribution.ref,
    source: params.attribution.source,
    campaign: params.attribution.campaign,
    utm_source: params.attribution.utm_source,
    utm_medium: params.attribution.utm_medium,
    utm_campaign: params.attribution.utm_campaign,
    utm_content: params.attribution.utm_content,
    utm_term: params.attribution.utm_term,
    first_touch_url: params.url,
    last_touch_url: params.url
  });
  
  const lead_hash = await sha256(JSON.stringify(leadPayload));
  
  const lead = await base44.entities.Lead.create({
    lead_id,
    status: 'new',
    referral_code: params.attribution.ref,
    source: params.attribution.source,
    campaign: params.attribution.campaign,
    utm_source: params.attribution.utm_source,
    utm_medium: params.attribution.utm_medium,
    utm_campaign: params.attribution.utm_campaign,
    utm_content: params.attribution.utm_content,
    utm_term: params.attribution.utm_term,
    first_touch_url: params.url,
    last_touch_url: params.url,
    device_hash,
    user_id: params.userId || null,
    lead_hash,
    created_at_utc,
    last_updated_utc: created_at_utc
  });
  
  // Store lead ID
  storeLeadId(lead_id);
  
  // Log lead created event
  await createLeadEvent(lead_id, 'LEAD_CREATED', {
    attribution: params.attribution,
    url: params.url,
    device_hash
  }, params.userId);
  
  return { lead, isNew: true };
}

/**
 * Link lead to session
 */
export async function linkLeadToSession(leadId, sessionId, userId) {
  try {
    // Update lead with session ID
    const leads = await base44.entities.Lead.filter({ lead_id: leadId });
    if (leads.length > 0) {
      const lead = leads[0];
      await base44.entities.Lead.update(lead.id, {
        session_id: sessionId,
        user_id: userId,
        last_updated_utc: new Date().toISOString()
      });
      
      // Log session linked event
      await createLeadEvent(leadId, 'SESSION_LINKED', {
        session_id: sessionId,
        user_id: userId
      }, userId);
    }
  } catch (e) {
    console.error('Failed to link lead to session:', e);
  }
}

/**
 * Link lead to user
 */
export async function linkLeadToUser(leadId, userId) {
  try {
    const leads = await base44.entities.Lead.filter({ lead_id: leadId });
    if (leads.length > 0) {
      const lead = leads[0];
      await base44.entities.Lead.update(lead.id, {
        user_id: userId,
        last_updated_utc: new Date().toISOString()
      });
      
      await createLeadEvent(leadId, 'USER_LINKED', {
        user_id: userId
      }, userId);
    }
  } catch (e) {
    console.error('Failed to link lead to user:', e);
  }
}

/**
 * Create lead event (append-only)
 */
export async function createLeadEvent(leadId, eventType, payload, actorUserId = null) {
  const event_id = generateUUID();
  const timestamp_utc = new Date().toISOString();
  
  // Create canonical event payload
  const eventPayload = canonicalJSON({
    event_id,
    lead_id: leadId,
    event_type: eventType,
    timestamp_utc,
    payload,
    actor_user_id: actorUserId
  });
  
  const event_hash = await sha256(JSON.stringify(eventPayload));
  
  await base44.entities.LeadEvent.create({
    event_id,
    lead_id: leadId,
    event_type: eventType,
    timestamp_utc,
    payload,
    event_hash,
    actor_user_id: actorUserId
  });
}

/**
 * Update lead status
 */
export async function updateLeadStatus(leadId, newStatus, userId) {
  try {
    const leads = await base44.entities.Lead.filter({ lead_id: leadId });
    if (leads.length > 0) {
      const lead = leads[0];
      const oldStatus = lead.status;
      
      await base44.entities.Lead.update(lead.id, {
        status: newStatus,
        last_updated_utc: new Date().toISOString()
      });
      
      await createLeadEvent(leadId, 'STATUS_UPDATED', {
        old_status: oldStatus,
        new_status: newStatus
      }, userId);
    }
  } catch (e) {
    console.error('Failed to update lead status:', e);
  }
}

/**
 * Check if URL has attribution parameters
 */
export function hasAttributionParams(urlParams) {
  const params = parseAttributionParams(urlParams);
  return Object.values(params).some(value => value !== null);
}