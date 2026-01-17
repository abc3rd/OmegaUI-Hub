// Core jurisdiction gate logic - reusable across web and mobile
import { base44 } from "@/api/base44Client";

/**
 * Check if an incident has passed the cooling-off period
 * @param {Object} incident - The incident object
 * @param {Array} jurisdictionRules - Available jurisdiction rules
 * @returns {Object} { passed: boolean, daysRemaining: number, rule: Object }
 */
export function checkCoolingOffPeriod(incident, jurisdictionRules) {
  if (!incident?.occurred_at) {
    return { passed: false, daysRemaining: 30, rule: null, reason: "No incident date" };
  }

  // Find applicable rule (most specific first: county > state > default)
  let rule = jurisdictionRules.find(
    r => r.state === incident.jurisdiction_state && 
         r.county === incident.jurisdiction_county &&
         r.is_active
  );
  
  if (!rule) {
    rule = jurisdictionRules.find(
      r => r.state === incident.jurisdiction_state && 
           !r.county &&
           r.is_active
    );
  }
  
  // Default rule if no jurisdiction-specific rule exists
  const waitingPeriodDays = rule?.waiting_period_days ?? 30;
  
  const occurredDate = new Date(incident.occurred_at);
  const now = new Date();
  const daysPassed = Math.floor((now - occurredDate) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, waitingPeriodDays - daysPassed);
  
  return {
    passed: daysPassed >= waitingPeriodDays,
    daysRemaining,
    daysPassed,
    waitingPeriodDays,
    rule,
    allowMarketplace: rule?.allow_marketplace_after_wait ?? true,
    requireExplicitRequest: rule?.require_explicit_request_help ?? true
  };
}

/**
 * Check if user can request help for an incident
 * @param {Object} incident - The incident object
 * @param {Object} gateStatus - Result from checkCoolingOffPeriod
 * @returns {Object} { canRequest: boolean, reason: string }
 */
export function canRequestHelp(incident, gateStatus) {
  if (!gateStatus.passed) {
    return { 
      canRequest: false, 
      reason: `Please wait ${gateStatus.daysRemaining} more day(s) before requesting professional assistance.` 
    };
  }
  
  if (!gateStatus.allowMarketplace) {
    return { 
      canRequest: false, 
      reason: "Professional matching is not available in this jurisdiction." 
    };
  }
  
  if (incident.help_requested_at) {
    return { 
      canRequest: true, 
      reason: "Help already requested",
      alreadyRequested: true
    };
  }
  
  return { canRequest: true, reason: null };
}

/**
 * Create an audit log entry
 * @param {Object} params - Audit log parameters
 */
export async function createAuditLog({
  actor_user_id,
  actor_email,
  actor_role = 'user',
  action,
  entity_type,
  entity_id,
  details = {},
  blocked = false,
  block_reason = null
}) {
  try {
    await base44.entities.AuditLog.create({
      actor_user_id,
      actor_email,
      actor_role,
      action,
      entity_type,
      entity_id,
      details,
      blocked,
      block_reason,
      ip_address: null, // Would be captured server-side
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Validate consent requirements before actions
 * @param {string} userId - User ID
 * @param {string} incidentId - Incident ID (optional)
 * @param {Array} requiredTypes - Required consent types
 * @returns {Object} { valid: boolean, missing: Array }
 */
export async function validateConsents(userId, incidentId, requiredTypes = ['terms_privacy']) {
  try {
    const consents = await base44.entities.ConsentRecord.filter({
      user_id: userId,
      accepted: true
    });
    
    const acceptedTypes = consents.map(c => c.consent_type);
    const missing = requiredTypes.filter(type => !acceptedTypes.includes(type));
    
    return {
      valid: missing.length === 0,
      missing,
      consents
    };
  } catch (error) {
    return { valid: false, missing: requiredTypes, error };
  }
}

/**
 * Record user consent
 * @param {Object} params - Consent parameters
 */
export async function recordConsent({
  user_id,
  incident_id = null,
  consent_type,
  accepted,
  consent_version = '1.0'
}) {
  return await base44.entities.ConsentRecord.create({
    user_id,
    incident_id,
    consent_type,
    accepted,
    accepted_at: new Date().toISOString(),
    consent_version,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
  });
}

// US States for jurisdiction selection
export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' }
];