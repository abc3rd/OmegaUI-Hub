import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Radius of Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in miles
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get all open jobs and available workers
        const [jobs, workers] = await Promise.all([
            base44.entities.JobPosting.filter({ status: 'open' }),
            base44.entities.WorkerProfile.filter({ is_available: true })
        ]);

        const matches = [];

        // Calculate matches for each job-worker combination
        for (const job of jobs) {
            for (const worker of workers) {
                // Calculate distance
                const distance = calculateDistance(
                    job.location_latitude,
                    job.location_longitude,
                    worker.location_latitude,
                    worker.location_longitude
                );

                // Skip if worker is outside travel radius
                if (distance > worker.travel_radius) {
                    continue;
                }

                // Calculate match score
                let score = 0;
                const factors = {
                    skill_match: 0,
                    location_distance: 0,
                    rate_compatibility: 0,
                    availability_match: 0,
                    experience_match: 0
                };

                // Skill match (40% of score)
                if (worker.skills.includes(job.job_type)) {
                    factors.skill_match = 40;
                    score += 40;
                } else if (worker.skills.includes('general_labor')) {
                    factors.skill_match = 20;
                    score += 20;
                }

                // Location match (15% of score) - closer is better
                const maxDistance = worker.travel_radius;
                const locationScore = Math.max(0, 15 * (1 - distance / maxDistance));
                factors.location_distance = locationScore;
                score += locationScore;

                // Rate compatibility (25% of score)
                if (job.pay_rate >= worker.hourly_rate_min && job.pay_rate <= worker.hourly_rate_max) {
                    factors.rate_compatibility = 25;
                    score += 25;
                } else if (job.pay_rate >= worker.hourly_rate_min) {
                    factors.rate_compatibility = 15;
                    score += 15;
                } else if (job.pay_rate < worker.hourly_rate_min) {
                    factors.rate_compatibility = 0; // Below minimum acceptable rate
                }

                // Experience match (15% of score)
                const experienceValue = {
                    'beginner': 1,
                    'some_experience': 2,
                    'experienced': 3,
                    'expert': 4
                };
                
                const jobRequirements = job.requirements || [];
                if (jobRequirements.includes('no_experience') || worker.experience_level === 'expert') {
                    factors.experience_match = 15;
                    score += 15;
                } else if (jobRequirements.includes('experienced') && experienceValue[worker.experience_level] >= 3) {
                    factors.experience_match = 15;
                    score += 15;
                } else if (experienceValue[worker.experience_level] >= 2) {
                    factors.experience_match = 8;
                    score += 8;
                }

                // Equipment/requirements match (5% of score)
                let equipmentScore = 5;
                if (jobRequirements.includes('own_tools') && !worker.available_equipment.includes('own_tools')) {
                    equipmentScore = 0;
                }
                if (jobRequirements.includes('own_vehicle') && !worker.available_equipment.includes('own_vehicle')) {
                    equipmentScore = Math.max(0, equipmentScore - 3);
                }
                factors.availability_match = equipmentScore;
                score += equipmentScore;

                // Only create matches with score > 50
                if (score > 50) {
                    const matchData = {
                        job_posting_id: job.id,
                        worker_profile_id: worker.id,
                        match_score: Math.min(100, Math.round(score)),
                        match_factors: factors,
                        status: 'suggested'
                    };

                    matches.push(matchData);
                }
            }
        }

        // Sort matches by score (highest first)
        matches.sort((a, b) => b.match_score - a.match_score);

        // Save top matches to database (limit to prevent spam)
        const topMatches = matches.slice(0, 100);
        
        for (const match of topMatches) {
            // Check if match already exists
            const existingMatches = await base44.entities.JobMatch.filter({
                job_posting_id: match.job_posting_id,
                worker_profile_id: match.worker_profile_id
            });

            if (existingMatches.length === 0) {
                await base44.asServiceRole.entities.JobMatch.create(match);
            }
        }

        return new Response(JSON.stringify({
            success: true,
            matches_calculated: matches.length,
            top_matches_saved: topMatches.length,
            message: 'Job matches calculated and saved successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error calculating job matches:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});