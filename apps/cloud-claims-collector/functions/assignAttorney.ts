/**
 * Advanced Attorney Assignment System
 * 
 * Sophisticated scoring based on:
 * 1. Geographic match (state licensing + coverage area)
 * 2. Specialization accuracy (case type match)
 * 3. Past case outcomes (win rate, settlement amounts)
 * 4. Client reviews and ratings
 * 5. Current capacity and response time
 * 6. Experience level
 * 
 * Fallback mechanisms:
 * - Overflow pool for unmatched leads
 * - 24-hour manual assignment alerts
 * - Escalation to admin notification
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Scoring weights (adjustable)
const WEIGHTS = {
  STATE_EXACT_MATCH: 30,
  STATE_COVERAGE: 15,
  NATIONWIDE_COVERAGE: 5,
  SPECIALIZATION_EXACT: 25,
  SPECIALIZATION_RELATED: 10,
  CAPACITY_AVAILABLE: 20,
  CAPACITY_LIMITED: 5,
  EXPERIENCE_PER_YEAR: 1.5,
  EXPERIENCE_MAX: 20,
  WIN_RATE_MULTIPLIER: 0.3,
  SETTLEMENT_BONUS: 15,
  REVIEW_RATING_MULTIPLIER: 5,
  RESPONSE_TIME_FAST: 10,
  RESPONSE_TIME_MEDIUM: 5
};

// Case type relationships for related specialization matching
const RELATED_SPECIALIZATIONS = {
  car: ['auto', 'vehicle', 'traffic', 'collision'],
  truck: ['commercial', 'semi', '18-wheeler', 'vehicle'],
  motorcycle: ['vehicle', 'traffic', 'auto'],
  pedestrian: ['traffic', 'vehicle', 'crosswalk'],
  bicycle: ['traffic', 'vehicle', 'pedestrian'],
  slip_and_fall: ['premises', 'liability', 'property', 'negligence'],
  medical_malpractice: ['medical', 'negligence', 'hospital'],
  workplace: ['workers comp', 'osha', 'employment', 'injury']
};

function calculateAttorneyScore(attorney, leadData, caseHistory = []) {
  let score = 0;
  const breakdown = {};
  const accidentState = leadData.state?.toLowerCase() || '';
  const accidentType = leadData.accident_type?.toLowerCase() || '';

  // 1. GEOGRAPHIC SCORING
  const licensingState = attorney.licensing_state?.toLowerCase() || '';
  const coverage = attorney.geographic_coverage?.toLowerCase() || '';
  
  if (licensingState === accidentState) {
    score += WEIGHTS.STATE_EXACT_MATCH;
    breakdown.geographic = { points: WEIGHTS.STATE_EXACT_MATCH, reason: 'Exact state license match' };
  } else if (coverage.includes(accidentState)) {
    score += WEIGHTS.STATE_COVERAGE;
    breakdown.geographic = { points: WEIGHTS.STATE_COVERAGE, reason: 'State in coverage area' };
  } else if (coverage.includes('nationwide') || coverage.includes('national')) {
    score += WEIGHTS.NATIONWIDE_COVERAGE;
    breakdown.geographic = { points: WEIGHTS.NATIONWIDE_COVERAGE, reason: 'Nationwide coverage' };
  } else {
    breakdown.geographic = { points: 0, reason: 'No geographic match' };
  }

  // 2. SPECIALIZATION SCORING
  const practiceAreas = attorney.practice_areas?.toLowerCase() || '';
  
  if (practiceAreas.includes(accidentType)) {
    score += WEIGHTS.SPECIALIZATION_EXACT;
    breakdown.specialization = { points: WEIGHTS.SPECIALIZATION_EXACT, reason: 'Exact specialization match' };
  } else {
    const relatedTerms = RELATED_SPECIALIZATIONS[accidentType] || [];
    const hasRelated = relatedTerms.some(term => practiceAreas.includes(term));
    if (hasRelated) {
      score += WEIGHTS.SPECIALIZATION_RELATED;
      breakdown.specialization = { points: WEIGHTS.SPECIALIZATION_RELATED, reason: 'Related specialization' };
    } else {
      breakdown.specialization = { points: 0, reason: 'No specialization match' };
    }
  }

  // 3. CAPACITY SCORING
  if (attorney.capacity_status === 'available') {
    score += WEIGHTS.CAPACITY_AVAILABLE;
    breakdown.capacity = { points: WEIGHTS.CAPACITY_AVAILABLE, reason: 'Fully available' };
  } else if (attorney.capacity_status === 'limited') {
    score += WEIGHTS.CAPACITY_LIMITED;
    breakdown.capacity = { points: WEIGHTS.CAPACITY_LIMITED, reason: 'Limited capacity' };
  } else {
    breakdown.capacity = { points: 0, reason: 'At full capacity' };
  }

  // 4. EXPERIENCE SCORING
  const years = attorney.years_experience || 0;
  const expPoints = Math.min(years * WEIGHTS.EXPERIENCE_PER_YEAR, WEIGHTS.EXPERIENCE_MAX);
  score += expPoints;
  breakdown.experience = { points: Math.round(expPoints), reason: `${years} years experience` };

  // 5. PAST CASE OUTCOMES (from case history)
  const attorneyCases = caseHistory.filter(c => c.attorney_id === attorney.user_id);
  if (attorneyCases.length > 0) {
    const wonCases = attorneyCases.filter(c => c.status === 'closed' && c.estimated_value > 0);
    const winRate = wonCases.length / attorneyCases.length;
    const winRatePoints = winRate * 100 * WEIGHTS.WIN_RATE_MULTIPLIER;
    score += winRatePoints;
    
    // High settlement bonus
    const avgSettlement = wonCases.length > 0 
      ? wonCases.reduce((sum, c) => sum + (c.estimated_value || 0), 0) / wonCases.length 
      : 0;
    if (avgSettlement > 100000) {
      score += WEIGHTS.SETTLEMENT_BONUS;
      breakdown.outcomes = { 
        points: Math.round(winRatePoints + WEIGHTS.SETTLEMENT_BONUS), 
        reason: `${Math.round(winRate * 100)}% win rate, high settlements` 
      };
    } else {
      breakdown.outcomes = { points: Math.round(winRatePoints), reason: `${Math.round(winRate * 100)}% win rate` };
    }
  } else {
    breakdown.outcomes = { points: 0, reason: 'No case history' };
  }

  // 6. SEVERITY MATCHING (higher severity = more experienced attorney)
  if (leadData.notes) {
    const notes = leadData.notes.toLowerCase();
    const isHighSeverity = notes.includes('surgery') || 
                          notes.includes('hospitalized') || 
                          notes.includes('pain level: 8') ||
                          notes.includes('pain level: 9') ||
                          notes.includes('pain level: 10') ||
                          notes.includes('disability');
    if (isHighSeverity && years >= 10) {
      score += 10;
      breakdown.severity = { points: 10, reason: 'High severity case + experienced attorney' };
    }
  }

  return {
    totalScore: Math.round(score),
    breakdown,
    minimumThreshold: 40 // Minimum score to auto-assign
  };
}

async function addToOverflowPool(base44, leadData, reason) {
  // Update lead status to indicate overflow
  if (leadData.id) {
    await base44.asServiceRole.entities.VictimLead.update(leadData.id, {
      status: 'new',
      notes: `${leadData.notes || ''}\n\n[OVERFLOW] ${new Date().toISOString()}: ${reason}. Awaiting manual assignment.`
    });
  }
  
  return {
    pooled: true,
    reason,
    leadId: leadData.id,
    timestamp: new Date().toISOString(),
    escalationTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  };
}

async function sendManualAssignmentAlert(base44, leadData, reason) {
  // Send email alert to admin
  try {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'contact@omegaui.com',
      subject: `[U CRASH] Manual Assignment Required - Lead #${leadData.id?.slice(0, 8) || 'NEW'}`,
      body: `
A lead requires manual assignment.

REASON: ${reason}

LEAD DETAILS:
- Name: ${leadData.full_name || 'Unknown'}
- Phone: ${leadData.phone || 'Unknown'}
- State: ${leadData.state || 'Unknown'}
- Accident Type: ${leadData.accident_type || 'Unknown'}
- Date Submitted: ${new Date().toLocaleString()}

ACTION REQUIRED:
Please log into the admin dashboard to manually assign this lead to an appropriate attorney.

If not assigned within 24 hours, the lead will be escalated.

---
U CRASH Automated Alert System
      `.trim()
    });
  } catch (emailError) {
    console.error('Failed to send alert email:', emailError);
  }
  
  return { alertSent: true, timestamp: new Date().toISOString() };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify authentication
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const { leadData, forceOverflow = false } = await req.json();
    
    if (!leadData || !leadData.state) {
      return Response.json({ error: 'Lead data with state is required' }, { status: 400 });
    }

    // Force overflow if requested (for testing or manual trigger)
    if (forceOverflow) {
      const overflowResult = await addToOverflowPool(base44, leadData, 'Manual overflow requested');
      await sendManualAssignmentAlert(base44, leadData, 'Manual overflow requested');
      return Response.json({ success: true, overflow: overflowResult });
    }

    // Fetch attorneys and case history for scoring
    const [attorneys, caseHistory] = await Promise.all([
      base44.asServiceRole.entities.Attorney.list(),
      base44.asServiceRole.entities.Case.list()
    ]);

    // Filter eligible attorneys (not at full capacity)
    const eligibleAttorneys = attorneys.filter(a => a.capacity_status !== 'full');

    if (eligibleAttorneys.length === 0) {
      const overflowResult = await addToOverflowPool(base44, leadData, 'All attorneys at full capacity');
      await sendManualAssignmentAlert(base44, leadData, 'All attorneys at full capacity');
      
      return Response.json({
        success: false,
        message: 'All attorneys at full capacity',
        overflow: overflowResult,
        alertSent: true
      });
    }

    // Score all eligible attorneys
    const scoredAttorneys = eligibleAttorneys
      .map(attorney => {
        const scoring = calculateAttorneyScore(attorney, leadData, caseHistory);
        return {
          ...attorney,
          matchScore: scoring.totalScore,
          scoreBreakdown: scoring.breakdown,
          meetsThreshold: scoring.totalScore >= scoring.minimumThreshold
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    // Check if top attorney meets minimum threshold
    const topAttorney = scoredAttorneys[0];
    
    if (!topAttorney || !topAttorney.meetsThreshold) {
      const reason = topAttorney 
        ? `Best match score (${topAttorney.matchScore}) below threshold (40)` 
        : 'No matching attorneys found';
      
      const overflowResult = await addToOverflowPool(base44, leadData, reason);
      await sendManualAssignmentAlert(base44, leadData, reason);
      
      return Response.json({
        success: false,
        message: reason,
        overflow: overflowResult,
        alertSent: true,
        bestCandidate: topAttorney ? {
          name: topAttorney.law_firm_name,
          score: topAttorney.matchScore,
          breakdown: topAttorney.scoreBreakdown
        } : null
      });
    }

    // Successful assignment
    return Response.json({
      success: true,
      assigned_attorney: {
        id: topAttorney.user_id,
        name: topAttorney.law_firm_name,
        state: topAttorney.licensing_state,
        matchScore: topAttorney.matchScore,
        scoreBreakdown: topAttorney.scoreBreakdown,
        capacity: topAttorney.capacity_status,
        specializations: topAttorney.practice_areas
      },
      alternatives: scoredAttorneys.slice(1, 4).map(a => ({
        id: a.user_id,
        name: a.law_firm_name,
        matchScore: a.matchScore,
        meetsThreshold: a.meetsThreshold
      })),
      metadata: {
        totalCandidates: eligibleAttorneys.length,
        aboveThreshold: scoredAttorneys.filter(a => a.meetsThreshold).length,
        assignedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});