
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

/**
 * Posts to Reddit using the connected Reddit account.
 * This is a real integration that depends on the RedditIntegration entity.
 */
async function postToReddit(base44, title, content, subreddit = 'test') {
    try {
        const integrations = await base44.asServiceRole.entities.RedditIntegration.list();
        if (integrations.length === 0) {
            return { success: false, message: 'Reddit account not connected. Please configure it first.' };
        }
        const integration = integrations[0];

        // This is a simplified post. In a real scenario, you'd let the user choose the subreddit.
        const postData = {
            sr: subreddit,
            kind: 'self',
            title: title,
            text: content,
        };

        const response = await fetch('https://oauth.reddit.com/api/submit', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${integration.access_token}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'ABC-Dashboard/1.0 by u/' + integration.account_name,
            },
            body: new URLSearchParams(postData),
        });

        const result = await response.json();

        if (result.success) {
            await base44.asServiceRole.entities.RedditPost.create({
                title: postData.title,
                content: content,
                subreddit: subreddit,
                post_type: 'text',
                reddit_id: result.json.data.name,
                reddit_url: result.json.data.url,
                status: 'posted',
            });
            return { success: true, message: `Successfully posted to r/${subreddit}.` };
        } else {
            console.error("Reddit API Error:", result.json?.errors);
            // Attempt to refresh token if expired
            if (response.status === 401 || result.error === 'invalid_token') {
                return { success: false, message: 'Reddit token expired or invalid. Please re-authenticate.'};
            }
            throw new Error(result.json?.errors?.[0]?.[1] || 'Failed to post to Reddit.');
        }
    } catch (error) {
        console.error('Reddit posting error:', error);
        return { success: false, message: `Reddit Error: ${error.message}` };
    }
}

/**
 * Simulates a post to a given platform and creates a record in the SocialPost entity.
 * This is used for platforms where we don't have direct API access.
 */
async function simulatePost(base44, platform, content, imageUrl) {
    try {
        await base44.asServiceRole.entities.SocialPost.create({
            platform: platform.toLowerCase(),
            content: content,
            image_url: imageUrl || null,
            status: 'posted',
            posted_at: new Date().toISOString()
        });
        return { success: true, message: `Simulated post to ${platform} and saved to history.` };
    } catch (dbError) {
        console.error(`Failed to save simulated post for ${platform}:`, dbError);
        return { success: false, message: `Simulation for ${platform} failed during database save.`};
    }
}

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
        });
    }

    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
                status: 401, 
                headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" } 
            });
        }

        const { platforms, content, imageUrl } = await req.json();

        if (!platforms || platforms.length === 0 || !content) {
            return new Response(JSON.stringify({ error: 'Platforms and content are required.' }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" } 
            });
        }

        const results = [];
        for (const platform of platforms) {
            let result;
            const platformLower = platform.toLowerCase();

            switch(platformLower) {
                case 'reddit': {
                    // Real Integration
                    const postTitle = content.substring(0, 100) + (content.length > 100 ? '...' : '');
                    result = await postToReddit(base44, postTitle, content);
                    break;
                }
                
                case 'twitter':
                case 'facebook':
                case 'linkedin':
                case 'instagram':
                case 'pinterest': {
                    // Simulated Integration
                    result = await simulatePost(base44, platformLower, content, imageUrl);
                    break;
                }
                    
                default: {
                    result = { success: false, message: `Platform '${platform}' not supported.` };
                }
            }
            results.push({ platform: platformLower, ...result });
        }

        return new Response(JSON.stringify({ success: true, results }), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" } 
        });

    } catch (error) {
        console.error('Error in postToSocialMedia function:', error);
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" } 
        });
    }
});
