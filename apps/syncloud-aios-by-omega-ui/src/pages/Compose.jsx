
import React, { useState } from "react";
import { Goal } from "@/entities/all";
import { motion } from "framer-motion";
import { 
  Target, 
  Calendar, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Search // Added Search icon for "How It Works" section
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

import StrategyResearcher from "../components/strategy/StrategyResearcher"; // New import

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
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

function GoalForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_metric: '',
    target_value: '',
    budget: '',
    duration_days: '',
    target_audience: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      target_value: Number(formData.target_value),
      budget: Number(formData.budget),
      duration_days: Number(formData.duration_days)
    });
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Define Your Marketing Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-200 font-medium">Goal Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Increase demo signups for Q1"
                  className="bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200 font-medium">Target Metric</Label>
                <Select 
                  value={formData.target_metric} 
                  onValueChange={(value) => setFormData({...formData, target_metric: value})}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-slate-100">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="leads">Leads Generated</SelectItem>
                    <SelectItem value="signups">Demo Signups</SelectItem>
                    <SelectItem value="sales">Sales Closed</SelectItem>
                    <SelectItem value="traffic">Website Traffic</SelectItem>
                    <SelectItem value="awareness">Brand Awareness</SelectItem>
                    <SelectItem value="engagement">Engagement Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200 font-medium">Target Value</Label>
                <Input
                  type="number"
                  value={formData.target_value}
                  onChange={(e) => setFormData({...formData, target_value: e.target.value})}
                  placeholder="200"
                  className="bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200 font-medium">Budget ($)</Label>
                <Input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  placeholder="5000"
                  className="bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200 font-medium">Duration (Days)</Label>
                <Input
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({...formData, duration_days: e.target.value})}
                  placeholder="30"
                  className="bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200 font-medium">Target Audience</Label>
                <Input
                  value={formData.target_audience}
                  onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                  placeholder="SaaS founders, 25-45, looking for growth tools"
                  className="bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200 font-medium">Detailed Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe your goal in more detail, including context, constraints, and success criteria..."
                className="bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 h-24 focus:border-blue-400/50 focus:ring-blue-400/20"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading || !formData.title || !formData.target_metric || !formData.budget}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Strategy...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Generate AI Strategy
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StrategyResults({ strategy }) {
  return (
    <motion.div 
      variants={itemVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="bg-gradient-to-br from-blue-600/15 to-cyan-600/15 border border-blue-500/40 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            AI-Generated Marketing Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Channel Mix */}
          {strategy.channel_mix && (
            <div>
              <h3 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Recommended Channel Mix
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(strategy.channel_mix).map(([channel, allocation]) => (
                  <div key={channel} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-200 capitalize font-medium">{channel.replace('_', ' ')}</span>
                      <Badge variant="outline" className="border-blue-500/50 text-blue-300 bg-blue-500/10">
                        {allocation}%
                      </Badge>
                    </div>
                    <div className="w-full bg-slate-600/30 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${allocation}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator className="bg-slate-600/50" />

          {/* Key Insights */}
          {strategy.key_insights && (
            <div>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">Key Strategic Insights</h3>
              <div className="space-y-3">
                {strategy.key_insights.map((insight, index) => (
                  <Alert key={index} className="bg-slate-700/30 border-slate-600/50 backdrop-blur-sm">
                    <AlertDescription className="text-slate-200">
                      {insight}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {strategy.timeline && (
            <div>
              <h3 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Execution Timeline
              </h3>
              <div className="space-y-3">
                {strategy.timeline.map((phase, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                      <span className="text-blue-400 font-semibold text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-100 font-medium">{phase.phase}</p>
                      <p className="text-slate-400 text-sm">{phase.description}</p>
                    </div>
                    <Badge variant="outline" className="border-slate-500/50 text-slate-300 bg-slate-600/30">
                      {phase.duration}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Metrics */}
          {strategy.success_metrics && (
            <div>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">Success Metrics to Track</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strategy.success_metrics.map((metric, index) => (
                  <div key={index} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                    <p className="text-slate-100 font-medium">{metric.metric}</p>
                    <p className="text-slate-400 text-sm mt-1">{metric.target}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Compose() {
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState(null);
  const [error, setError] = useState(null);
  const [currentGoal, setCurrentGoal] = useState(null); // New state for the current goal
  const [showResearcher, setShowResearcher] = useState(false); // New state to control researcher visibility

  const generateStrategy = async (goalData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Save the goal first before initiating research
      const savedGoal = await Goal.create({
        ...goalData,
        status: 'planning' // Initial status
      });
      
      setCurrentGoal(savedGoal); // Set the goal to be passed to researcher
      setShowResearcher(true); // Show the researcher component

    } catch (error) {
      console.error('Error creating goal:', error);
      setError('Failed to create goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStrategyGenerated = (researchData) => {
    setStrategy(researchData); // Set the strategy once generated by the researcher
    setShowResearcher(false); // Hide the researcher
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
              Goal Composer
            </h1>
            <p className="text-slate-400 text-lg">
              Transform your business objectives into AI-powered marketing strategies
            </p>
          </div>
        </motion.div>

        {/* Goal Form */}
        {!showResearcher && !strategy && ( // Only show form if researcher is not active and no strategy generated yet
          <GoalForm onSubmit={generateStrategy} loading={loading} />
        )}

        {/* Marketing Researcher */}
        {showResearcher && currentGoal && ( // Show researcher if active and goal is set
          <StrategyResearcher 
            goal={currentGoal}
            onStrategyGenerated={handleStrategyGenerated}
            loading={loading}
            setLoading={setLoading} // Allow researcher to control global loading
          />
        )}

        {/* Error State */}
        {error && (
          <motion.div variants={itemVariants}>
            <Alert className="bg-red-500/10 border-red-500/30 backdrop-blur-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Strategy Results */}
        {strategy && <StrategyResults strategy={strategy} />}

        {/* Process Steps */}
        <motion.div variants={itemVariants}>
          <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-slate-100">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  {
                    icon: Target,
                    title: "Define Goal",
                    description: "Set clear objectives and constraints"
                  },
                  {
                    icon: Search, // Updated icon
                    title: "AI Research", // Updated title
                    description: "Deep market analysis and insights" // Updated description
                  },
                  {
                    icon: TrendingUp,
                    title: "Strategy Generation",
                    description: "Get data-driven recommendations"
                  },
                  {
                    icon: ArrowRight, // Icon remains ArrowRight as per outline
                    title: "Human Approval", // Updated title
                    description: "Review and approve before execution" // Updated description
                  }
                ].map((step, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 border border-blue-500/30">
                      <step.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-slate-100 font-semibold mb-2">{step.title}</h3>
                    <p className="text-slate-400 text-sm">{step.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
