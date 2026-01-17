
import React, { useState, useEffect } from "react";
import { Goal, Campaign, Creative as CreativeEntity } from "@/entities/all";
import { InvokeLLM, GenerateImage } from "@/integrations/Core";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Copy,
  Image as ImageIcon,
  RefreshCw,
  Check,
  X,
  Eye,
  Wand2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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

function CreativeCard({ creative, onApprove, onReject }) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    await CreativeEntity.update(creative.id, { status: 'approved' });
    onApprove(creative);
    setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    await CreativeEntity.update(creative.id, { status: 'rejected' });
    onReject(creative);
    setLoading(false);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'headline': return Copy;
      case 'description': return Copy;
      case 'cta': return Copy;
      case 'image_concept': return ImageIcon;
      case 'video_concept': return ImageIcon;
      default: return Sparkles;
    }
  };

  const TypeIcon = getTypeIcon(creative.type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group"
    >
      <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-xl hover:shadow-lg transition-all duration-300 hover:border-slate-500/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                <TypeIcon className="w-4 h-4 text-blue-400" />
              </div>
              <Badge variant="outline" className="border-slate-500/50 text-slate-300 capitalize bg-slate-700/30">
                {creative.type.replace('_', ' ')}
              </Badge>
            </div>
            {creative.brand_score && (
              <Badge
                className={`${
                  creative.brand_score >= 80 ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                  creative.brand_score >= 60 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                  'bg-red-500/20 text-red-300 border-red-300'
                }`}
              >
                Brand: {creative.brand_score}%
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Generated Image Display */}
          {creative.generated_image_url && (
            <div className="mb-4">
              <img
                src={creative.generated_image_url}
                alt="Generated creative"
                className="w-full h-48 object-cover rounded-lg border border-slate-600/30"
                onError={(e) => {
                  e.target.style.display = 'none'; // Hide broken image icon
                }}
              />
            </div>
          )}

          <div className="mb-4">
            <p className="text-slate-100 text-sm leading-relaxed">
              {creative.content}
            </p>
          </div>

          {creative.ai_prompt && (
            <div className="mb-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-slate-400 text-xs">
                <span className="font-medium">AI Prompt:</span> {creative.ai_prompt}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleApprove}
              disabled={loading}
              size="sm"
              className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/40 hover:border-green-400/50"
            >
              <Check className="w-4 h-4 mr-1" />
              Approve
            </Button>
            <Button
              onClick={handleReject}
              disabled={loading}
              size="sm"
              variant="outline"
              className="flex-1 border-red-500/40 text-red-300 hover:bg-red-500/20 hover:border-red-400/50 bg-red-500/10"
            >
              <X className="w-4 h-4 mr-1" />
              Reject
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CreativeGenerator() {
  const [goals, setGoals] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [creatives, setCreatives] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [creativeType, setCreativeType] = useState('headline');
  const [customBrief, setCustomBrief] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [goalsData, campaignsData, creativesData] = await Promise.all([
        Goal.list('-created_date'),
        Campaign.list('-created_date'),
        CreativeEntity.list('-created_date')
      ]);

      setGoals(goalsData);
      setCampaigns(campaignsData);
      setCreatives(creativesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const generateCreatives = async () => {
    if (!selectedGoal && !customBrief) return;

    setLoading(true);
    try {
      const goal = goals.find(g => g.id === selectedGoal);
      const campaign = campaigns.find(c => c.id === selectedCampaign);

      const context = goal ? `
        Goal: ${goal.title}
        Target Metric: ${goal.target_metric}
        Target Audience: ${goal.target_audience}
        Budget: $${goal.budget}
        ${goal.description ? `Description: ${goal.description}` : ''}
      ` : customBrief;

      const prompts = {
        headline: `Create 5 compelling, attention-grabbing headlines for this marketing campaign. Make them punchy, benefit-focused, and under 60 characters. Context: ${context}`,
        description: `Write 3 engaging ad descriptions that explain the value proposition clearly. Keep them between 90-150 characters and include a call to action. Context: ${context}`,
        cta: `Generate 5 different call-to-action phrases that drive conversions. Make them action-oriented and urgent. Context: ${context}`,
        image_concept: `Generate 3 distinct visual concepts for images/graphics that would work well for this marketing campaign. For each concept, provide a 'content' (a detailed description of the visual concept, including composition, colors, mood, and key visual elements) and an 'image_prompt' (a concise, effective prompt suitable for an image generation AI, derived from the concept). Context: ${context}`,
        video_concept: `Outline 3 video concepts with scene descriptions, key messages, and visual style that align with the campaign goals. Context: ${context}`
      };

      const response = await InvokeLLM({
        prompt: prompts[creativeType],
        response_json_schema: {
          type: "object",
          properties: {
            creatives: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  content: { type: "string" },
                  brand_score: { type: "number" },
                  rationale: { type: "string" },
                  image_prompt: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Create creative records and generate images if needed
      const campaignId = selectedCampaign || 'standalone';
      const newCreatives = [];
      for (const creative of response.creatives) {
        let generatedImageUrl = null;

        // Generate actual images for image concepts using Gemini
        if (creativeType === 'image_concept') {
          try {
            const imagePrompt = creative.image_prompt || creative.content;
            const imageResponse = await GenerateImage({
              prompt: `Professional marketing creative: ${imagePrompt}. High quality, modern design, clean composition, marketing-focused aesthetic.`
            });
            generatedImageUrl = imageResponse.url;
          } catch (imageError) {
            console.error('Failed to generate image:', imageError);
            // Continue without image if generation fails
          }
        }

        const createdCreative = await CreativeEntity.create({
          campaign_id: campaignId,
          type: creativeType,
          content: creative.content,
          brand_score: creative.brand_score,
          ai_prompt: prompts[creativeType].substring(0, 200) + '...',
          status: 'generated',
          generated_image_url: generatedImageUrl
        });
        newCreatives.push(createdCreative);
      }

      // Refresh creatives list with the newly created ones and existing ones
      // Instead of re-fetching all, we can prepend the new ones for immediate display
      setCreatives(prevCreatives => [...newCreatives, ...prevCreatives]);


    } catch (error) {
      console.error('Error generating creatives:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreativeAction = async (creative, action) => {
    // Refresh the creatives list
    const updatedCreatives = await CreativeEntity.list('-created_date');
    setCreatives(updatedCreatives);
  };

  const filteredCreatives = creatives.filter(c =>
    !selectedCampaign || c.campaign_id === selectedCampaign
  );

  return (
    <div className="space-y-8">
      {/* Generator Form */}
      <motion.div variants={itemVariants}>
        <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-blue-400" />
              AI Creative Generator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <Label className="text-slate-200 font-medium">Source Goal</Label>
                <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-slate-100">
                    <SelectValue placeholder="Select goal" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {goals.map(goal => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200 font-medium">Campaign (Optional)</Label>
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-slate-100">
                    <SelectValue placeholder="Select campaign" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {campaigns.map(campaign => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200 font-medium">Creative Type</Label>
                <Select value={creativeType} onValueChange={setCreativeType}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="headline">Headlines</SelectItem>
                    <SelectItem value="description">Descriptions</SelectItem>
                    <SelectItem value="cta">Call-to-Actions</SelectItem>
                    <SelectItem value="image_concept">Image Concepts</SelectItem>
                    <SelectItem value="video_concept">Video Concepts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={generateCreatives}
                  disabled={loading || (!selectedGoal && !customBrief)}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Generate
                    </div>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200 font-medium">Custom Brief (Optional)</Label>
              <Textarea
                value={customBrief}
                onChange={(e) => setCustomBrief(e.target.value)}
                placeholder="Describe your creative requirements in detail..."
                className="bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 h-20 focus:border-blue-400/50 focus:ring-blue-400/20"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Generated Creatives */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
            <Eye className="w-6 h-6 text-blue-400" />
            Generated Creatives ({filteredCreatives.length})
          </h2>
          {filteredCreatives.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-slate-100"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          )}
        </div>

        {filteredCreatives.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-xl shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-slate-100 text-lg font-semibold mb-2">No Creatives Yet</h3>
              <p className="text-slate-400">
                Select a goal and creative type, then generate your first AI-powered content
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredCreatives.map((creative) => (
                <CreativeCard
                  key={creative.id}
                  creative={creative}
                  onApprove={handleCreativeAction}
                  onReject={handleCreativeAction}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function Creative() {
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
              Creative Studio
            </h1>
            <p className="text-slate-400 text-lg">
              Generate high-converting copy and creative concepts with AI
            </p>
          </div>
        </motion.div>

        <CreativeGenerator />
      </motion.div>
    </div>
  );
}
