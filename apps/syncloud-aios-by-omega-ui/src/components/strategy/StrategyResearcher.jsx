import React, { useState } from 'react';
import { InvokeLLM } from "@/integrations/Core";
import { 
  Search, 
  Target, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Brain,
  Eye,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

export default function StrategyResearcher({ goal, onStrategyGenerated, loading, setLoading }) {
  const [research, setResearch] = useState(null);
  const [approved, setApproved] = useState(false);

  const generateResearch = async () => {
    setLoading(true);
    try {
      const prompt = `You are the Marketing Research Agent. Analyze this business goal and generate a comprehensive marketing strategy:

GOAL DETAILS:
- Title: ${goal.title}
- Description: ${goal.description || 'Not provided'}
- Target Metric: ${goal.target_metric}
- Target Value: ${goal.target_value}
- Budget: $${goal.budget}
- Duration: ${goal.duration_days} days
- Target Audience: ${goal.target_audience || 'To be defined'}

REQUIRED OUTPUT STRUCTURE:
1. Market Analysis & Insights
2. Channel Strategy with Budget Allocation
3. Target Personas with Behavioral Insights
4. Risk Assessment & Mitigation
5. Success Metrics & KPIs
6. Implementation Timeline

For each recommendation, include:
- Rationale based on industry data
- Confidence score (0-100)
- Risk flags and assumptions
- Expected ROI and performance metrics

Focus on data-driven insights and actionable recommendations.`;

      const response = await InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            market_analysis: {
              type: "object",
              properties: {
                market_size: { type: "string" },
                competition_level: { type: "string" },
                opportunity_score: { type: "number" },
                key_trends: { type: "array", items: { type: "string" } },
                confidence: { type: "number" }
              }
            },
            channel_strategy: {
              type: "object", 
              properties: {
                recommended_channels: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      channel: { type: "string" },
                      budget_percentage: { type: "number" },
                      rationale: { type: "string" },
                      expected_roi: { type: "string" },
                      confidence: { type: "number" }
                    }
                  }
                },
                budget_breakdown: { type: "object" }
              }
            },
            target_personas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  demographics: { type: "string" },
                  psychographics: { type: "string" },
                  pain_points: { type: "array", items: { type: "string" } },
                  preferred_channels: { type: "array", items: { type: "string" } },
                  budget_influence: { type: "number" }
                }
              }
            },
            risk_assessment: {
              type: "object",
              properties: {
                high_risks: { type: "array", items: { type: "string" } },
                medium_risks: { type: "array", items: { type: "string" } },
                mitigation_strategies: { type: "array", items: { type: "string" } },
                overall_risk_score: { type: "number" }
              }
            },
            success_metrics: {
              type: "array",
              items: {
                type: "object", 
                properties: {
                  metric: { type: "string" },
                  target: { type: "string" },
                  measurement_method: { type: "string" }
                }
              }
            },
            implementation_timeline: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phase: { type: "string" },
                  duration_weeks: { type: "number" },
                  key_activities: { type: "array", items: { type: "string" } },
                  deliverables: { type: "array", items: { type: "string" } }
                }
              }
            },
            overall_confidence: { type: "number" },
            human_review_required: { type: "boolean" },
            summary: { type: "string" }
          }
        }
      });

      setResearch(response);
    } catch (error) {
      console.error('Error generating research:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = () => {
    setApproved(true);
    onStrategyGenerated(research);
  };

  if (!research) {
    return (
      <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-400" />
            Marketing Research Agent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
              <Search className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-slate-100 text-lg font-semibold mb-2">Deep Market Research</h3>
            <p className="text-slate-400 mb-6">
              Generate data-driven insights, channel strategies, and risk assessments for your goal
            </p>
            <Button
              onClick={generateResearch}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Researching...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Start Research
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Research Summary */}
      <Card className="bg-gradient-to-br from-blue-600/15 to-cyan-600/15 border border-blue-500/40 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-400" />
              Research Summary
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={`${
                research.overall_confidence >= 80 ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                research.overall_confidence >= 60 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                'bg-red-500/20 text-red-300 border-red-500/30'
              }`}>
                Confidence: {research.overall_confidence}%
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-200 leading-relaxed">{research.summary}</p>
        </CardContent>
      </Card>

      {/* Market Analysis */}
      {research.market_analysis && (
        <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Market Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Market Size</p>
                <p className="text-slate-100 font-semibold">{research.market_analysis.market_size}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Competition</p>
                <p className="text-slate-100 font-semibold">{research.market_analysis.competition_level}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Opportunity Score</p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={research.market_analysis.opportunity_score} className="flex-1 h-2" />
                  <span className="text-slate-100 font-semibold">{research.market_analysis.opportunity_score}%</span>
                </div>
              </div>
            </div>
            
            {research.market_analysis.key_trends && (
              <div>
                <h4 className="text-slate-200 font-medium mb-2">Key Market Trends</h4>
                <div className="space-y-1">
                  {research.market_analysis.key_trends.map((trend, index) => (
                    <div key={index} className="flex items-center gap-2 text-slate-300 text-sm">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      {trend}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Channel Strategy */}
      {research.channel_strategy && (
        <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Channel Strategy & Budget Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {research.channel_strategy.recommended_channels?.map((channel, index) => (
                <div key={index} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-slate-100 font-medium capitalize">{channel.channel.replace('_', ' ')}</h4>
                    <div className="text-right">
                      <Badge variant="outline" className="border-cyan-500/50 text-cyan-300 bg-cyan-500/10">
                        {channel.budget_percentage}%
                      </Badge>
                      <p className="text-slate-400 text-xs mt-1">ROI: {channel.expected_roi}</p>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm mb-2">{channel.rationale}</p>
                  <div className="flex items-center gap-2">
                    <Progress value={channel.confidence} className="flex-1 h-2" />
                    <span className="text-slate-400 text-xs">{channel.confidence}% confidence</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Target Personas */}
      {research.target_personas && research.target_personas.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Target Personas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {research.target_personas.map((persona, index) => (
                <div key={index} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                  <h4 className="text-slate-100 font-semibold mb-2">{persona.name}</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-400">Demographics:</span>
                      <p className="text-slate-300">{persona.demographics}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Psychographics:</span>
                      <p className="text-slate-300">{persona.psychographics}</p>
                    </div>
                    {persona.pain_points && (
                      <div>
                        <span className="text-slate-400">Pain Points:</span>
                        <ul className="list-disc list-inside text-slate-300 ml-2">
                          {persona.pain_points.map((point, i) => (
                            <li key={i}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Assessment */}
      {research.risk_assessment && (
        <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {research.risk_assessment.high_risks && research.risk_assessment.high_risks.length > 0 && (
                <div>
                  <h4 className="text-red-400 font-medium mb-2">High Risks</h4>
                  <div className="space-y-1">
                    {research.risk_assessment.high_risks.map((risk, index) => (
                      <Alert key={index} className="bg-red-500/10 border-red-500/30 py-2">
                        <AlertDescription className="text-red-300 text-sm">{risk}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}
              
              {research.risk_assessment.medium_risks && research.risk_assessment.medium_risks.length > 0 && (
                <div>
                  <h4 className="text-yellow-400 font-medium mb-2">Medium Risks</h4>
                  <div className="space-y-1">
                    {research.risk_assessment.medium_risks.map((risk, index) => (
                      <Alert key={index} className="bg-yellow-500/10 border-yellow-500/30 py-2">
                        <AlertDescription className="text-yellow-300 text-sm">{risk}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {research.risk_assessment.mitigation_strategies && (
              <div>
                <h4 className="text-slate-200 font-medium mb-2">Mitigation Strategies</h4>
                <div className="space-y-1">
                  {research.risk_assessment.mitigation_strategies.map((strategy, index) => (
                    <div key={index} className="flex items-center gap-2 text-slate-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {strategy}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Implementation Timeline */}
      {research.implementation_timeline && (
        <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Implementation Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {research.implementation_timeline.map((phase, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b border-slate-600/30 last:border-b-0">
                  <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30 flex-shrink-0 mt-1">
                    <span className="text-indigo-400 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-slate-100 font-medium">{phase.phase}</h4>
                      <Badge variant="outline" className="border-slate-500/50 text-slate-300 bg-slate-600/30">
                        {phase.duration_weeks} weeks
                      </Badge>
                    </div>
                    {phase.key_activities && (
                      <div className="mb-2">
                        <p className="text-slate-400 text-sm mb-1">Key Activities:</p>
                        <ul className="list-disc list-inside text-slate-300 text-sm ml-2">
                          {phase.key_activities.map((activity, i) => (
                            <li key={i}>{activity}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Human Approval Required */}
      {!approved && (
        <Card className="bg-gradient-to-br from-amber-600/15 to-orange-600/15 border border-amber-500/40 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-400" />
              Human Approval Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-200 mb-4">
              Please review the research findings and strategy recommendations above. Your approval is required before proceeding to campaign creation.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={handleApproval}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Strategy
              </Button>
              <Button
                variant="outline"
                className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
              >
                Request Revisions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}