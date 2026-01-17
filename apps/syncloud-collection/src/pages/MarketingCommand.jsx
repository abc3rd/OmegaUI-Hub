
import React, { useState, useEffect, useMemo } from 'react';
import { MarketingCampaign } from '@/entities/MarketingCampaign';
import { MarketingMetric } from '@/entities/MarketingMetric';
import { MarketingInsight } from '@/entities/MarketingInsight';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Lightbulb,
  Zap,
  Calendar,
  Activity,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { InvokeLLM } from '@/integrations/Core';

const performanceColors = {
  excellent: 'text-green-600 bg-green-50 border-green-200',
  good: 'text-blue-600 bg-blue-50 border-blue-200', 
  average: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  poor: 'text-red-600 bg-red-50 border-red-200'
};

const getPerformanceLevel = (score) => {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';  
  if (score >= 50) return 'average';
  return 'poor';
};

export default function MarketingCommand() {
  const [campaigns, setCampaigns] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [generatingInsights, setGeneratingInsights] = useState(false);

  useEffect(() => {
    loadMarketingData();
  }, []);

  const loadMarketingData = async () => {
    setLoading(true);
    try {
      const [campaignData, metricData, insightData] = await Promise.all([
        MarketingCampaign.list('-created_date').catch(() => []),
        MarketingMetric.list('-date').catch(() => []),
        MarketingInsight.list('-created_date').catch(() => [])
      ]);
      
      setCampaigns(campaignData || []);
      setMetrics(metricData || []);
      setInsights(insightData || []);
    } catch (error) {
      console.error('Error loading marketing data:', error);
      toast.error('Failed to load marketing data.');
    } finally {
      setLoading(false);
    }
  };

  const campaignPerformance = useMemo(() => {
    if (!campaigns || !metrics) return [];
    return campaigns.map(campaign => {
      const campaignMetrics = metrics.filter(m => m.campaign_id === campaign.id);
      
      const totals = campaignMetrics.reduce((acc, metric) => ({
        spend: acc.spend + (metric.spend || 0),
        revenue: acc.revenue + (metric.revenue || 0),
        conversions: acc.conversions + (metric.conversions || 0),
        clicks: acc.clicks + (metric.clicks || 0),
        impressions: acc.impressions + (metric.impressions || 0)
      }), { spend: 0, revenue: 0, conversions: 0, clicks: 0, impressions: 0 });

      const roas = totals.spend > 0 ? totals.revenue / totals.spend : 0;
      const cpa = totals.conversions > 0 ? totals.spend / totals.conversions : 0;
      const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
      
      // Calculate performance score
      let performanceScore = 0;
      if (campaign.success_metrics) {
        if (campaign.success_metrics.target_roas && roas >= campaign.success_metrics.target_roas) performanceScore += 30;
        if (campaign.success_metrics.target_cpa && cpa <= campaign.success_metrics.target_cpa) performanceScore += 30;
        if (campaign.success_metrics.target_conversions && totals.conversions >= campaign.success_metrics.target_conversions) performanceScore += 40;
      }
      
      return {
        ...campaign,
        ...totals,
        roas,
        cpa,
        ctr,
        performanceScore: Math.min(performanceScore, 100)
      };
    });
  }, [campaigns, metrics]);

  const overallStats = useMemo(() => {
    if (!campaignPerformance) return { totalSpend: 0, totalRevenue: 0, totalConversions: 0, activeCampaigns: 0, completedCampaigns: 0, failedCampaigns: 0, overallROAS: 0, averagePerformance: 0 };
    const totals = campaignPerformance.reduce((acc, campaign) => ({
      totalSpend: acc.totalSpend + campaign.spend,
      totalRevenue: acc.totalRevenue + campaign.revenue,
      totalConversions: acc.totalConversions + campaign.conversions,
      activeCampaigns: acc.activeCampaigns + (campaign.status === 'active' ? 1 : 0),
      completedCampaigns: acc.completedCampaigns + (campaign.status === 'completed' ? 1 : 0),
      failedCampaigns: acc.failedCampaigns + (campaign.status === 'failed' ? 1 : 0)
    }), {
      totalSpend: 0,
      totalRevenue: 0, 
      totalConversions: 0,
      activeCampaigns: 0,
      completedCampaigns: 0,
      failedCampaigns: 0
    });

    const overallROAS = totals.totalSpend > 0 ? totals.totalRevenue / totals.totalSpend : 0;
    const averagePerformance = campaignPerformance.length > 0 
      ? campaignPerformance.reduce((sum, c) => sum + c.performanceScore, 0) / campaignPerformance.length 
      : 0;

    return { ...totals, overallROAS, averagePerformance };
  }, [campaignPerformance]);

  const generateAIInsights = async () => {
    setGeneratingInsights(true);
    toast.info("Generating AI insights... This may take a moment.");
    try {
      const prompt = `Analyze this marketing performance data and provide 3-5 key insights as a JSON object.

Data Summary:
- Total Campaigns: ${campaigns.length}
- Total Spend: $${overallStats.totalSpend.toLocaleString()}
- Total Revenue: $${overallStats.totalRevenue.toLocaleString()}
- Overall ROAS: ${overallStats.overallROAS.toFixed(2)}
- Average Performance Score: ${overallStats.averagePerformance.toFixed(1)}

Top Campaigns:
${campaignPerformance.slice(0, 3).map(c => `- ${c.name}: Score ${c.performanceScore}/100, ROAS ${c.roas.toFixed(2)}, Platform: ${c.platform}`).join('\n')}

Bottom Campaigns:
${campaignPerformance.filter(c => c.status === 'failed').slice(0,2).map(c => `- ${c.name}: Score ${c.performanceScore}/100, ROAS ${c.roas.toFixed(2)}, Platform: ${c.platform}`).join('\n')}

Based on this data, provide key success factors, failure analyses, and optimization opportunities.`;

      const response = await InvokeLLM({ 
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  insight_type: { "type": "string", "enum": ["success_factor", "failure_analysis", "optimization_opportunity", "recommendation"] },
                  title: { "type": "string" },
                  description: { "type": "string" },
                  "impact_level": { "type": "string", "enum": ["low", "medium", "high", "critical"] },
                  "confidence_score": { "type": "number", "minimum": 0, "maximum": 100 }
                },
                required: ["insight_type", "title", "description", "impact_level", "confidence_score"]
              }
            }
          },
          required: ["insights"]
        }
      });
      
      const newInsights = response.insights || [];

      if (newInsights.length === 0) {
        toast.error("AI could not generate new insights at this time.");
        return;
      }
      
      // Save insights to database
      for (const insight of newInsights) {
        await MarketingInsight.create({ ...insight, data_source: 'AI Analysis', tags: ['auto-generated', 'performance-review'] });
      }
      
      toast.success(`${newInsights.length} new AI insights generated successfully!`);
      loadMarketingData(); // Reload to show new insights
      
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate AI insights. Please try again.');
    } finally {
      setGeneratingInsights(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-background text-foreground">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Marketing Command Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive marketing performance measurement and insights
          </p>
        </div>
        <Button onClick={generateAIInsights} disabled={generatingInsights} className="bg-purple-600 hover:bg-purple-700">
          {generatingInsights ? 
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> :
            <><Lightbulb className="w-4 h-4 mr-2" /> Generate AI Insights</>
          }
        </Button>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">${overallStats.totalRevenue.toLocaleString()}</div>
                <div className="text-xs opacity-80">ROAS: {overallStats.overallROAS.toFixed(2)}x</div>
              </div>
              <DollarSign className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{overallStats.activeCampaigns}</div>
                <div className="text-xs opacity-80">
                  {overallStats.completedCampaigns} completed, {overallStats.failedCampaigns} failed
                </div>
              </div>
              <Activity className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{overallStats.averagePerformance.toFixed(1)}/100</div>
                <Progress value={overallStats.averagePerformance} className="w-16 h-2 mt-1" />
              </div>
              <Target className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{overallStats.totalConversions.toLocaleString()}</div>
                <div className="text-xs opacity-80">
                  ${overallStats.totalSpend.toLocaleString()} spent
                </div>
              </div>
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Campaign Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaignPerformance.slice(0, 5).map((campaign) => {
                  const level = getPerformanceLevel(campaign.performanceScore);
                  return (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          campaign.status === 'active' ? 'bg-green-500' : 
                          campaign.status === 'failed' ? 'bg-red-500' : 'bg-gray-400'
                        }`} />
                        <div>
                          <h3 className="font-medium">{campaign.name}</h3>
                          <p className="text-sm text-gray-500">{campaign.platform} • {campaign.objective}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="text-sm font-medium">ROAS: {campaign.roas.toFixed(2)}x</div>
                          <div className="text-xs text-gray-500">
                            ${campaign.spend.toLocaleString()} spent
                          </div>
                        </div>
                        <Badge className={performanceColors[level]}>
                          {campaign.performanceScore}/100
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Detailed Campaign List */}
          <Card>
            <CardHeader>
              <CardTitle>All Marketing Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Campaign</th>
                      <th className="text-left p-2">Platform</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-right p-2">Spend</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">ROAS</th>
                      <th className="text-right p-2">Conversions</th>
                      <th className="text-right p-2">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaignPerformance.map((campaign) => (
                      <tr key={campaign.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{campaign.name}</div>
                            <div className="text-xs text-gray-500">{campaign.objective}</div>
                          </div>
                        </td>
                        <td className="p-2">{campaign.platform}</td>
                        <td className="p-2">
                          <Badge variant="outline" className={
                            campaign.status === 'active' ? 'text-green-600' :
                            campaign.status === 'failed' ? 'text-red-600' : 'text-gray-600'
                          }>
                            {campaign.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-right">${campaign.spend.toLocaleString()}</td>
                        <td className="p-2 text-right">${campaign.revenue.toLocaleString()}</td>
                        <td className="p-2 text-right">{campaign.roas.toFixed(2)}x</td>
                        <td className="p-2 text-right">{campaign.conversions}</td>
                        <td className="p-2 text-right">
                          <Badge className={performanceColors[getPerformanceLevel(campaign.performanceScore)]}>
                            {campaign.performanceScore}/100
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Marketing Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Marketing Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.length > 0 ? insights.map((insight) => (
                  <div key={insight.id} className="border rounded-lg p-4 bg-card hover:border-primary/50 transition-all">
                    <div className="flex items-start justify-between mb-2 gap-4">
                      <div className="flex items-center gap-2">
                        {insight.insight_type === 'success_factor' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                        {insight.insight_type === 'failure_analysis' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                        {insight.insight_type === 'optimization_opportunity' && <Zap className="w-4 h-4 text-yellow-600" />}
                        {insight.insight_type === 'recommendation' && <Target className="w-4 h-4 text-blue-600" />}
                        <h3 className="font-medium text-foreground">{insight.title}</h3>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className={
                          insight.impact_level === 'critical' ? 'border-red-500 text-red-500' :
                          insight.impact_level === 'high' ? 'border-orange-500 text-orange-500' :
                          insight.impact_level === 'medium' ? 'border-yellow-500 text-yellow-500' : 'border-green-500 text-green-500'
                        }>
                          {insight.impact_level} impact
                        </Badge>
                        <div className="text-xs text-muted-foreground w-28 text-right">
                          <Progress value={insight.confidence_score} className="h-1.5" />
                          <span className="mt-1 block">{insight.confidence_score}% confidence</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">{insight.description}</p>
                    {insight.tags && insight.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {insight.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="font-semibold text-lg mb-2 text-foreground">No insights yet</h3>
                    <p className="mb-4">Click "Generate AI Insights" to automatically analyze your campaigns and uncover actionable recommendations.</p>
                    <Button onClick={generateAIInsights} disabled={generatingInsights} variant="secondary">
                      {generatingInsights ? 
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> :
                        'Generate First Insight'
                      }
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          {/* Marketing Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Marketing Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:left-6 before:ml-px before:w-px before:bg-border">
                {[...campaigns].sort((a,b) => new Date(b.created_date) - new Date(a.created_date)).map((campaign) => (
                  <div key={campaign.id} className="relative">
                    <div className={`absolute -left-[35px] top-1 w-6 h-6 rounded-full flex items-center justify-center ${
                        campaign.status === 'active' ? 'bg-green-500' : 
                        campaign.status === 'completed' ? 'bg-blue-500' :
                        campaign.status === 'failed' ? 'bg-red-500' : 'bg-gray-400'
                      }`}>
                        {campaign.status === 'active' && <TrendingUp className="w-4 h-4 text-white" />}
                        {campaign.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-white" />}
                        {campaign.status === 'failed' && <AlertTriangle className="w-4 h-4 text-white" />}
                        {campaign.status !== 'active' && campaign.status !== 'completed' && campaign.status !== 'failed' && <Clock className="w-4 h-4 text-white" />}
                    </div>
                    <div className="pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-foreground">{campaign.name}</h3>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(campaign.created_date), 'MMM d, yyyy')}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {campaign.platform} • {campaign.objective}
                      </p>
                      {campaign.lessons_learned && (
                        <blockquote className="border-l-2 border-border pl-3 mt-3 text-sm text-muted-foreground">
                          <strong>Lessons Learned:</strong> {campaign.lessons_learned}
                        </blockquote>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
