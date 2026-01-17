import React, { useState, useEffect } from "react";
import { User } from "@/entities/all";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { GenerateImage } from "@/integrations/Core";
import { 
  Wand2, 
  Image, 
  Video, 
  Music, 
  FileText,
  Download,
  Loader2,
  Sparkles,
  Crown,
  Lock,
  Zap
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CreationType = {
  TEXT: "text",
  IMAGE: "image", 
  VIDEO: "video",
  MUSIC: "music",
  DOCS: "docs",
};

const creationConfigs = {
  [CreationType.TEXT]: {
    name: "AI Text Generation",
    icon: Wand2,
    gradient: "from-[#B4009E] to-[#FFB902]",
    isPro: false,
    description: "Generate marketing copy, emails, or creative stories."
  },
  [CreationType.IMAGE]: {
    name: "AI Image Generation", 
    icon: Image,
    gradient: "from-[#02B6CE] to-[#45CA36]",
    isPro: false,
    description: "Create stunning visuals and art from a simple prompt."
  },
  [CreationType.VIDEO]: {
    name: "AI Video Generation",
    icon: Video,
    gradient: "from-[#FF6B6B] to-[#FFB902]",
    isPro: true,
    description: "Produce short video clips for social media or presentations."
  },
  [CreationType.MUSIC]: {
    name: "AI Music Generation",
    icon: Music,
    gradient: "from-[#02B6CE] to-[#B4009E]", 
    isPro: true,
    description: "Compose unique, royalty-free background music."
  },
  [CreationType.DOCS]: {
    name: "AI Document Assistant",
    icon: FileText,
    gradient: "from-[#45CA36] to-[#02B6CE]",
    isPro: false,
    description: "Draft reports, summaries, and other documents."
  },
};

function UpgradeModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Upgrade to Pro
          </DialogTitle>
        </DialogHeader>
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-gradient-to-r from-[#B4009E] to-[#FFB902] rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Unlock Advanced AI Creation</h3>
          <p className="text-gray-600 mb-8">
            Video and Music generation are exclusive to our Pro subscribers. Upgrade your plan to create without limits.
          </p>
          <Link to={createPageUrl("Billing")}>
            <Button className="w-full bg-gradient-to-r from-[#B4009E] to-[#FFB902]">
              View Pro Plans
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CreatePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeType, setActiveType] = useState(CreationType.TEXT);
  const [jobs, setJobs] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [formData, setFormData] = useState({
    prompt: '',
    style: '',
    size: '1024x1024',
    duration: 30,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      // Sample jobs data
      const sampleJobs = [
        {
          id: "1",
          type: "image",
          prompt: "A beautiful sunset over mountains",
          status: "completed",
          result_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
          created_date: new Date().toISOString()
        },
        {
          id: "2",
          type: "text",
          prompt: "Write a marketing email for a new product",
          status: "completed",
          result_url: null,
          created_date: new Date().toISOString()
        }
      ];

      setJobs(sampleJobs);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleTypeSelect = (type) => {
    if (!canUseFeature(type)) {
      setShowUpgradeModal(true);
    } else {
      setActiveType(type);
    }
  };

  const canUseFeature = (type) => {
    const config = creationConfigs[type];
    if (!config) return false;
    return !config.isPro || (currentUser && (currentUser.plan === 'pro' || currentUser.plan === 'enterprise'));
  };

  const handleGenerate = async () => {
    if (!formData.prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!canUseFeature(activeType)) {
      setShowUpgradeModal(true);
      return;
    }

    setIsGenerating(true);
    setSelectedJob(null);

    try {
      const newJob = {
        id: Date.now().toString(),
        type: activeType,
        prompt: formData.prompt,
        status: "processing",
        created_date: new Date().toISOString()
      };

      setJobs(prev => [newJob, ...prev]);

      if (activeType === CreationType.IMAGE) {
        // Use the actual image generation integration
        try {
          const imageResult = await GenerateImage({
            prompt: formData.prompt + (formData.style ? `, ${formData.style}` : '')
          });

          newJob.status = "completed";
          newJob.result_url = imageResult.url;
        } catch (error) {
          console.error("Image generation failed:", error);
          newJob.status = "failed";
          newJob.error_message = "Image generation failed";
        }
      } else {
        // Simulate other generation types
        setTimeout(() => {
          newJob.status = "completed";
          if (activeType === CreationType.VIDEO) {
            newJob.result_url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
          } else if (activeType === CreationType.MUSIC) {
            newJob.result_url = "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav";
          }
        }, 3000);
      }

      setJobs(prev => prev.map(job => job.id === newJob.id ? newJob : job));
      setSelectedJob(newJob);
      setFormData(prev => ({ ...prev, prompt: '' }));
      toast.success("Generation started!");

    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("Download started!");
  };

  const usagePercentage = currentUser ? Math.min(100, (currentUser.tokens_used_month / (currentUser.quota_monthly_tokens || 50000000)) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">AI Creator Studio</h1>
            <p className="text-gray-600 mt-2">Create stunning content with AI-powered tools</p>
          </div>
          {currentUser && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
              <Badge variant="secondary" className="px-3 py-2 text-sm w-full sm:w-auto justify-center">
                <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
                {Math.round((currentUser.tokens_used_month || 0) / 1000000)}M / {Math.round((currentUser.quota_monthly_tokens || 50000000) / 1000000)}M Tokens
              </Badge>
              {(currentUser.plan === 'pro' || currentUser.plan === 'enterprise') && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-2 text-sm w-full sm:w-auto justify-center">
                  <Crown className="h-4 w-4 mr-2" /> Pro User
                </Badge>
              )}
            </div>
          )}
        </div>

        {currentUser && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
            <div
              className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${usagePercentage}%` }}
            ></div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Creation Types */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-xl lg:text-2xl font-bold">Choose Creation Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(creationConfigs).map(([type, config]) => {
                  const Icon = config.icon;
                  const canUse = canUseFeature(type);

                  return (
                    <button
                      key={type}
                      onClick={() => handleTypeSelect(type)}
                      className={`w-full p-3 lg:p-4 rounded-xl text-left transition-all duration-300 ${
                        activeType === type
                          ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg`
                          : canUse
                            ? 'bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-purple-200'
                            : 'bg-gray-100 text-gray-500 cursor-pointer hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className={`w-6 h-6 lg:w-8 lg:h-8 mr-3 lg:mr-4 flex-shrink-0 ${activeType === type ? 'text-white' : 'text-purple-600'}`} />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-base lg:text-lg font-semibold truncate">{config.name}</h4>
                          <p className={`text-xs lg:text-sm ${activeType === type ? 'text-gray-100' : 'text-gray-500'} line-clamp-2`}>
                            {config.description}
                          </p>
                        </div>
                        {!canUse && activeType !== type && (
                          <Lock className="w-4 h-4 lg:w-5 lg:h-5 ml-2 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Generation Form and Recent Generations */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Generation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl lg:text-2xl font-bold">Generate New Content</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="space-y-6">
                  <div>
                    <label htmlFor="prompt" className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
                      Prompt
                    </label>
                    <Textarea
                      id="prompt"
                      placeholder={`Enter your prompt for ${creationConfigs[activeType].name.toLowerCase()}...`}
                      value={formData.prompt}
                      onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                      rows={4}
                      className="resize-none text-sm lg:text-base"
                    />
                  </div>

                  {activeType === CreationType.IMAGE && (
                    <div>
                      <label htmlFor="style" className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
                        Style (Optional)
                      </label>
                      <Input
                        id="style"
                        placeholder="e.g., 'photorealistic', 'cartoon', 'abstract'"
                        value={formData.style}
                        onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                        className="text-sm lg:text-base"
                      />
                    </div>
                  )}

                  {(activeType === CreationType.VIDEO || activeType === CreationType.MUSIC) && (
                    <div>
                      <label htmlFor="duration" className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
                        Duration (seconds)
                      </label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        max="60"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                        className="w-full sm:w-24 text-sm lg:text-base"
                      />
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-sm lg:text-base py-2 lg:py-3" 
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Recent Generations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl lg:text-2xl font-bold">Recent Generations</CardTitle>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Wand2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No generations yet</h3>
                    <p className="text-gray-500">Start creating your first AI-generated content!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                    {jobs.map((job) => (
                      <JobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} onDownload={handleDownload} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <JobDetailsModal
        open={!!selectedJob}
        onOpenChange={() => setSelectedJob(null)}
        job={selectedJob}
        onDownload={handleDownload}
      />

      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </div>
  );
}

function JobCard({ job, onClick, onDownload }) {
  const Icon = creationConfigs[job.type]?.icon || Wand2;
  const gradient = creationConfigs[job.type]?.gradient || "from-gray-400 to-gray-500";

  return (
    <Card
      className={`relative p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden group ${job.status === 'processing' ? 'bg-gray-100 animate-pulse' : 'bg-white'}`}
      onClick={onClick}
    >
      {job.status === 'processing' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 z-10">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
      )}
      <div className="flex items-center mb-2">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${job.status !== 'processing' ? `bg-gradient-to-r ${gradient}` : 'bg-gray-400'}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-lg capitalize">{job.type} Generation</h3>
          <p className="text-sm text-gray-500 line-clamp-1">{job.prompt}</p>
        </div>
      </div>
      {job.status === 'completed' && job.result_url && (
        <>
          {job.type === CreationType.IMAGE && (
            <img src={job.result_url} alt="Generated" className="mt-2 rounded-md object-cover h-32 w-full" />
          )}
          {job.type === CreationType.VIDEO && (
            <video src={job.result_url} controls className="mt-2 rounded-md object-cover h-32 w-full" />
          )}
          {job.type === CreationType.MUSIC && (
            <audio src={job.result_url} controls className="mt-2 rounded-md w-full" />
          )}
        </>
      )}
      {job.status === 'failed' && (
        <div className="text-red-500 text-sm mt-2">Generation failed.</div>
      )}
      <div className="text-xs text-gray-400 mt-2">
        {new Date(job.created_date).toLocaleString()}
      </div>
    </Card>
  );
}

function JobDetailsModal({ open, onOpenChange, job, onDownload }) {
  if (!job) return null;

  const config = creationConfigs[job.type];
  const Icon = config?.icon || Wand2;
  const gradient = config?.gradient || "from-gray-400 to-gray-500";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl font-bold">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${job.status !== 'processing' ? `bg-gradient-to-r ${gradient}` : 'bg-gray-400'}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="capitalize">{job.type} Generation Details</span>
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-lg font-semibold">Prompt:</p>
          <p className="text-gray-700">{job.prompt}</p>

          <p className="text-lg font-semibold">Status:</p>
          <Badge className={`text-white text-md px-3 py-1 capitalize ${
            job.status === 'completed' ? 'bg-green-500' :
            job.status === 'processing' ? 'bg-yellow-500' :
            'bg-red-500'
          }`}>
            {job.status}
          </Badge>

          {job.status === 'completed' && job.result_url && (
            <>
              <p className="text-lg font-semibold">Result:</p>
              {job.type === CreationType.IMAGE && (
                <img src={job.result_url} alt="Generated Result" className="w-full h-auto rounded-lg shadow-md" />
              )}
              {job.type === CreationType.VIDEO && (
                <video src={job.result_url} controls className="w-full h-auto rounded-lg shadow-md" />
              )}
              {job.type === CreationType.MUSIC && (
                <audio src={job.result_url} controls className="w-full rounded-lg shadow-md" />
              )}

              <Button
                onClick={() => onDownload(job.result_url, `generated_${job.type}_${job.id}`)}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 mt-4"
              >
                <Download className="mr-2 h-4 w-4" /> Download Result
              </Button>
            </>
          )}

          {job.status === 'failed' && (
            <div className="text-red-600 font-medium">
              Generation failed. Please try again with a different prompt.
            </div>
          )}

          <p className="text-sm text-gray-500">Created: {new Date(job.created_date).toLocaleString()}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}