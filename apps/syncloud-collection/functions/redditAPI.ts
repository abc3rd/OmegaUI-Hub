import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

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

        const { action, data } = await req.json();

        switch (action) {
            case 'authenticate':
                return await handleRedditAuth(data, base44);
            
            case 'post':
                return await createRedditPost(data, base44);
            
            case 'get_subreddits':
                return await getUserSubreddits(data, base44);
            
            case 'monitor_mentions':
                return await monitorMentions(data, base44);
            
            case 'get_post_stats':
                return await getPostStats(data, base44);
            
            default:
                return new Response(JSON.stringify({ error: 'Unknown action' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
        }

    } catch (error) {
        console.error('Reddit API Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

async function handleRedditAuth(data, base44) {
    const { clientId, clientSecret, username, password } = data;
    
    try {
        // Reddit OAuth flow
        const authResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa(clientId + ':' + clientSecret)}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'ABC-Dashboard/1.0'
            },
            body: new URLSearchParams({
                grant_type: 'password',
                username: username,
                password: password
            })
        });

        const authData = await authResponse.json();
        
        if (authData.access_token) {
            // Store integration
            await base44.entities.RedditIntegration.create({
                account_name: username,
                client_id: clientId,
                access_token: authData.access_token,
                refresh_token: authData.refresh_token || '',
                token_expires: new Date(Date.now() + (authData.expires_in * 1000)).toISOString()
            });

            return new Response(JSON.stringify({ 
                success: true, 
                message: 'Reddit account connected successfully' 
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            throw new Error('Failed to authenticate with Reddit');
        }

    } catch (error) {
        return new Response(JSON.stringify({ 
            success: false, 
            error: 'Reddit authentication failed: ' + error.message 
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function createRedditPost(data, base44) {
    const { title, content, subreddit, postType = 'text', flair } = data;
    
    try {
        // Get Reddit integration
        const integrations = await base44.entities.RedditIntegration.list();
        if (integrations.length === 0) {
            throw new Error('No Reddit account connected');
        }
        
        const integration = integrations[0];
        
        // Post to Reddit
        const postData = {
            sr: subreddit,
            kind: postType,
            title: title,
            text: postType === 'text' ? content : undefined,
            url: postType === 'link' ? content : undefined,
            flair_id: flair || undefined
        };

        const response = await fetch('https://oauth.reddit.com/api/submit', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${integration.access_token}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'ABC-Dashboard/1.0'
            },
            body: new URLSearchParams(postData)
        });

        const result = await response.json();
        
        if (result.success) {
            const redditUrl = result.json.data.url;
            const redditId = result.json.data.name;
            
            // Save post to database
            await base44.entities.RedditPost.create({
                title,
                content,
                subreddit,
                post_type: postType,
                reddit_id: redditId,
                reddit_url: redditUrl,
                status: 'posted',
                flair
            });

            return new Response(JSON.stringify({
                success: true,
                reddit_url: redditUrl,
                reddit_id: redditId
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            throw new Error(result.json?.errors?.[0]?.[1] || 'Failed to post to Reddit');
        }

    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function getUserSubreddits(data, base44) {
    try {
        const integrations = await base44.entities.RedditIntegration.list();
        if (integrations.length === 0) {
            throw new Error('No Reddit account connected');
        }
        
        const integration = integrations[0];

        const response = await fetch('https://oauth.reddit.com/subreddits/mine/subscriber', {
            headers: {
                'Authorization': `Bearer ${integration.access_token}`,
                'User-Agent': 'ABC-Dashboard/1.0'
            }
        });

        const data_result = await response.json();
        const subreddits = data_result.data.children.map(sub => ({
            name: sub.data.display_name,
            title: sub.data.title,
            subscribers: sub.data.subscribers,
            description: sub.data.public_description
        }));

        return new Response(JSON.stringify({ subreddits }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            error: error.message
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function monitorMentions(data, base44) {
    const { keywords } = data;
    
    try {
        const integrations = await base44.entities.RedditIntegration.list();
        if (integrations.length === 0) {
            throw new Error('No Reddit account connected');
        }
        
        const integration = integrations[0];
        const mentions = [];

        for (const keyword of keywords) {
            const response = await fetch(`https://oauth.reddit.com/search?q=${encodeURIComponent(keyword)}&sort=new&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${integration.access_token}`,
                    'User-Agent': 'ABC-Dashboard/1.0'
                }
            });

            const result = await response.json();
            const posts = result.data.children.map(post => ({
                title: post.data.title,
                subreddit: post.data.subreddit,
                url: `https://reddit.com${post.data.permalink}`,
                score: post.data.score,
                created: new Date(post.data.created_utc * 1000).toISOString(),
                keyword: keyword
            }));

            mentions.push(...posts);
        }

        return new Response(JSON.stringify({ mentions }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            error: error.message
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function getPostStats(data, base44) {
    const { redditId } = data;
    
    try {
        const integrations = await base44.entities.RedditIntegration.list();
        if (integrations.length === 0) {
            throw new Error('No Reddit account connected');
        }
        
        const integration = integrations[0];

        const response = await fetch(`https://oauth.reddit.com/by_id/${redditId}`, {
            headers: {
                'Authorization': `Bearer ${integration.access_token}`,
                'User-Agent': 'ABC-Dashboard/1.0'
            }
        });

        const result = await response.json();
        const post = result.data.children[0]?.data;

        if (post) {
            return new Response(JSON.stringify({
                upvotes: post.score,
                comments: post.num_comments,
                upvote_ratio: post.upvote_ratio
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            throw new Error('Post not found');
        }

    } catch (error) {
        return new Response(JSON.stringify({
            error: error.message
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}