import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const timeframe = url.searchParams.get('timeframe') || 'week'; // day, week, month

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    if (timeframe === 'day') {
      startDate.setDate(now.getDate() - 1);
    } else if (timeframe === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setDate(now.getDate() - 30);
    }

    // Fetch user activity data
    const activities = await base44.asServiceRole.entities.UserActivity.list();
    const recentActivities = activities.filter(a => 
      new Date(a.activity_date) >= startDate
    );

    // Calculate daily active users
    const uniqueUsers = new Set(recentActivities.map(a => a.user_id));
    const dailyActiveUsers = uniqueUsers.size;

    // Fetch subscription data
    const subscriptions = await base44.asServiceRole.entities.Subscription.list();
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    
    const totalMRR = activeSubscriptions.reduce((sum, sub) => sum + (sub.mrr || 0), 0);
    
    // Calculate churn rate (cancelled in last 30 days / total active)
    const last30Days = new Date();
    last30Days.setDate(now.getDate() - 30);
    const recentCancellations = subscriptions.filter(s => 
      s.cancelled_date && new Date(s.cancelled_date) >= last30Days
    ).length;
    const churnRate = activeSubscriptions.length > 0 
      ? ((recentCancellations / (activeSubscriptions.length + recentCancellations)) * 100).toFixed(2)
      : 0;

    // Fetch system metrics
    const systemMetrics = await base44.asServiceRole.entities.SystemMetric.list();
    const recentMetrics = systemMetrics.filter(m => 
      new Date(m.timestamp) >= startDate
    );

    // n8n workflow statistics
    const n8nMetrics = recentMetrics.filter(m => m.metric_type === 'n8n_workflow');
    const n8nSuccess = n8nMetrics.filter(m => m.status === 'success').length;
    const n8nFailure = n8nMetrics.filter(m => m.status === 'failure').length;
    const n8nTotal = n8nMetrics.length;
    const n8nSuccessRate = n8nTotal > 0 ? ((n8nSuccess / n8nTotal) * 100).toFixed(2) : 100;

    // API call volume
    const apiMetrics = recentMetrics.filter(m => m.metric_type === 'api_call');
    const apiCallVolume = apiMetrics.length;

    // Activity trend (daily breakdown)
    const activityTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayActivities = recentActivities.filter(a => 
        a.activity_date === dateStr
      );
      const dayUsers = new Set(dayActivities.map(a => a.user_id)).size;
      
      activityTrend.push({
        date: dateStr,
        activeUsers: dayUsers,
        activities: dayActivities.length
      });
    }

    return Response.json({
      timeframe,
      userActivity: {
        dailyActiveUsers,
        weeklyActiveUsers: dailyActiveUsers, // Same for selected timeframe
        totalActivities: recentActivities.length,
        trend: activityTrend
      },
      subscriptions: {
        activeSubscriptions: activeSubscriptions.length,
        totalMRR: parseFloat(totalMRR.toFixed(2)),
        churnRate: parseFloat(churnRate),
        byPlan: {
          free: activeSubscriptions.filter(s => s.plan_type === 'free').length,
          pro: activeSubscriptions.filter(s => s.plan_type === 'pro').length,
          enterprise: activeSubscriptions.filter(s => s.plan_type === 'enterprise').length
        }
      },
      systemUsage: {
        n8nWorkflows: {
          total: n8nTotal,
          success: n8nSuccess,
          failure: n8nFailure,
          successRate: parseFloat(n8nSuccessRate)
        },
        apiCalls: {
          total: apiCallVolume,
          average: Math.round(apiCallVolume / 7) // Daily average
        }
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});