
import React, { useState, useEffect } from "react";
import { Goal, Campaign, Creative } from "@/entities/all";
import { motion } from "framer-motion";
import { 
  Rocket, 
  Target, 
  CheckCircle, 
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  Play,
  Pause,
  Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

function CampaignCard({ campaign, goal, creatives, onStatusChange }) {
  const [loading, setLoading] = useState(false);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-300';
      case 'review': return 'bg-yellow-500/20 text-yellow-300';
      case 'approved': return 'bg-blue-500/20 text-blue-300';
      case 'live': return 'bg-green-500/20 text-green-300';
      case 'paused': return 'bg-orange-500/20 text-orange-300';
      case 'completed': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    await Campaign.update(campaign.id, { status: newStatus });
    onStatusChange(campaign, newStatus);
    setLoading(false);
  };

  const campaignCreatives = creatives.filter(c => c.campaign_id === campaign.id);
  const approvedCreatives = campaignCreatives.filter(c => c.status === 'approved');

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-xl shadow-lg hover:border-slate-500/50 transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-100 text-lg">{campaign.name}</CardTitle>
              <p className="text-slate-400 text-sm mt-1 capitalize">
                {campaign.channel.replace('_', ' ')} • {goal?.title}
              </p>
            </div>
            <Badge className={getStatusColor(campaign.status)}>
              {campaign.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Campaign Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">Budget</span>
              </div>
              <p className="text-slate-100 font-semibold">
                ${campaign.budget_allocation?.toLocaleString() || 'TBD'}
              </p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
              <div className="flex items-center gap-2 text-green-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Audience</span>
              </div>
              <p className="text-slate-100 font-semibold text-sm">
                {campaign.target_audience || goal?.target_audience || 'Not set'}
              </p>
            </div>
          </div>

          {/* Creative Status */}
          <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 text-sm">Creative Assets</span>
              <span className="text-slate-100 font-medium">
                {approvedCreatives.length}/{campaignCreatives.length} approved
              </span>
            </div>
            <Progress 
              value={campaignCreatives.length > 0 ? (approvedCreatives.length / campaignCreatives.length) * 100 : 0} 
              className="h-2 bg-slate-600/50"
            />
          </div>

          {/* Performance Metrics (Mock Data) */}
          {campaign.status === 'live' && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-700/30 rounded-lg p-3 text-center border border-slate-600/30">
                <p className="text-slate-400 text-xs">Impressions</p>
                <p className="text-slate-100 font-semibold text-lg">12.4K</p>
                <p className="text-green-400 text-xs">+15%</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3 text-center border border-slate-600/30">
                <p className="text-slate-400 text-xs">CTR</p>
                <p className="text-slate-100 font-semibold text-lg">2.3%</p>
                <p className="text-green-400 text-xs">+0.2%</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3 text-center border border-slate-600/30">
                <p className="text-slate-400 text-xs">CPC</p>
                <p className="text-slate-100 font-semibold text-lg">$1.24</p>
                <p className="text-red-400 text-xs">+$0.08</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {campaign.status === 'draft' && (
              <Button
                onClick={() => handleStatusChange('review')}
                disabled={loading || approvedCreatives.length === 0}
                size="sm"
                className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40"
              >
                Submit for Review
              </Button>
            )}
            
            {campaign.status === 'review' && (
              <Button
                onClick={() => handleStatusChange('approved')}
                disabled={loading}
                size="sm"
                className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/40"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
            )}

            {campaign.status === 'approved' && (
              <Button
                onClick={() => handleStatusChange('live')}
                disabled={loading}
                size="sm"
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                <Play className="w-4 h-4 mr-1" />
                Launch Campaign
              </Button>
            )}

            {campaign.status === 'live' && (
              <Button
                onClick={() => handleStatusChange('paused')}
                disabled={loading}
                size="sm"
                variant="outline"
                className="flex-1 border-orange-500/40 text-orange-300 hover:bg-orange-500/20"
              >
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </Button>
            )}

            {campaign.status === 'paused' && (
              <Button
                onClick={() => handleStatusChange('live')}
                disabled={loading}
                size="sm"
                className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/40"
              >
                <Play className="w-4 h-4 mr-1" />
                Resume
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LaunchOverview({ goals, campaigns }) {
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget_allocation || 0), 0);
  const liveCampaigns = campaigns.filter(c => c.status === 'live').length;
  const pendingApproval = campaigns.filter(c => c.status === 'review').length;
  const completionRate = campaigns.length > 0 ? 
    (campaigns.filter(c => c.status === 'live' || c.status === 'completed').length / campaigns.length) * 100 : 0;

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-blue-400" />
            Launch Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-700/30 rounded-lg p-4 text-center border border-slate-600/30">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 border border-blue-500/30">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-slate-100">{goals.length}</p>
              <p className="text-slate-300 text-sm">Active Goals</p>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 text-center border border-slate-600/30">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 border border-green-500/30">
                <Rocket className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-slate-100">{liveCampaigns}</p>
              <p className="text-slate-300 text-sm">Live Campaigns</p>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 text-center border border-slate-600/30">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 border border-yellow-500/30">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-slate-100">{pendingApproval}</p>
              <p className="text-slate-300 text-sm">Pending Approval</p>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 text-center border border-slate-600/30">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 border border-purple-500/30">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-slate-100">${totalBudget.toLocaleString()}</p>
              <p className="text-slate-300 text-sm">Total Budget</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-600/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300">Launch Readiness</span>
              <span className="text-slate-100 font-semibold">{Math.round(completionRate)}%</span>
            </div>
            <Progress value={completionRate} className="h-3 bg-slate-600/50" />
            <p className="text-slate-400 text-sm mt-2">
              {campaigns.filter(c => c.status === 'live').length} of {campaigns.length} campaigns launched
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Launch() {
  const [goals, setGoals] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [goalsData, campaignsData, creativesData] = await Promise.all([
        Goal.list('-created_date'),
        Campaign.list('-created_date'),
        Creative.list('-created_date')
      ]);
      
      setGoals(goalsData);
      setCampaigns(campaignsData);
      setCreatives(creativesData);
    } catch (error) {
      console.error('Error loading launch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignStatusChange = async (campaign, newStatus) => {
    // Refresh data after status change
    await loadData();
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-100 to-blue-200 bg-clip-text text-transparent mb-2">
              Launch Center
            </h1>
            <p className="text-slate-400 text-lg">
              Deploy and manage your campaigns across all channels
            </p>
          </div>
        </motion.div>

        {/* Launch Overview */}
        <LaunchOverview goals={goals} campaigns={campaigns} />

        {/* Integration Notice */}
        <motion.div variants={itemVariants}>
          <Alert className="bg-yellow-500/10 border-yellow-500/30 backdrop-blur-sm">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-yellow-200">
              <strong>Demo Mode:</strong> Campaign launches are simulated. In production, this would deploy to actual ad platforms (Google Ads, Meta, LinkedIn, etc.) with real budget allocation and targeting.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Campaigns Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              Campaign Status ({campaigns.length})
            </h2>
          </div>

          {campaigns.length === 0 ? (
            <motion.div variants={itemVariants}>
              <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-xl shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                    <Rocket className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-slate-100 text-lg font-semibold mb-2">No Campaigns Yet</h3>
                  <p className="text-slate-400 mb-4">
                    Create goals and generate creatives to start launching campaigns
                  </p>
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                    Create First Campaign
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {campaigns.map((campaign) => {
                const goal = goals.find(g => g.id === campaign.goal_id);
                return (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    goal={goal}
                    creatives={creatives}
                    onStatusChange={handleCampaignStatusChange}
                  />
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
