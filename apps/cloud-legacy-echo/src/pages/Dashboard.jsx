import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Upload,
  MessageSquare,
  Users,
  Database,
  TrendingUp,
  Clock,
  Zap,
  Play
} from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: trainingData = [] } = useQuery({
    queryKey: ['trainingData'],
    queryFn: () => base44.entities.TrainingData.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  const { data: beneficiaries = [] } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: () => base44.entities.Beneficiary.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => base44.entities.Conversation.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  const startTrainingMutation = useMutation({
    mutationFn: async () => {
      const newScore = Math.min(100, (user.ai_readiness_score || 0) + 15);
      return base44.auth.updateMe({
        training_status: 'training',
        ai_readiness_score: newScore
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
    }
  });

  const quickStats = [
    {
      title: "Training Data",
      value: trainingData.length,
      icon: Database,
      color: "from-blue-500 to-cyan-500",
      link: createPageUrl("Library")
    },
    {
      title: "Beneficiaries",
      value: beneficiaries.length,
      icon: Users,
      color: "from-purple-500 to-pink-500",
      link: createPageUrl("Beneficiaries")
    },
    {
      title: "Conversations",
      value: conversations.length,
      icon: MessageSquare,
      color: "from-green-500 to-emerald-500",
      link: createPageUrl("Chat")
    },
    {
      title: "Training Hours",
      value: `${user?.training_hours || 0}h`,
      icon: Clock,
      color: "from-orange-500 to-red-500",
      link: null
    }
  ];

  const getStatusMessage = () => {
    const score = user?.ai_readiness_score || 0;
    if (score === 0) return "Start uploading your data to begin training";
    if (score < 25) return "Keep going! More data improves your AI";
    if (score < 50) return "Making great progress on your Legacy AI";
    if (score < 75) return "Your AI is learning your unique voice";
    if (score < 100) return "Almost there! Your AI is nearly ready";
    return "Your Legacy AI is ready for conversations!";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 md:p-12"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-3xl opacity-20" />
          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Welcome back, {user?.full_name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl">
              THE LONGER YOU TRAIN, THE GREATER YOU REMAIN
            </p>

            {/* AI Readiness */}
            <div className="bg-slate-950/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">AI Readiness</h3>
                  <p className="text-sm text-slate-400 mt-1">{getStatusMessage()}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{user?.ai_readiness_score || 0}%</div>
                  <div className="text-xs text-slate-500">Complete</div>
                </div>
              </div>
              <Progress 
                value={user?.ai_readiness_score || 0} 
                className="h-3 bg-slate-800"
              />
              
              {(user?.ai_readiness_score || 0) < 100 && (
                <div className="flex gap-3 mt-6">
                  <Link to={createPageUrl("Upload")} className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload More Data
                    </Button>
                  </Link>
                  {trainingData.length > 0 && (
                    <Button 
                      onClick={() => startTrainingMutation.mutate()}
                      disabled={startTrainingMutation.isPending}
                      variant="outline"
                      className="border-slate-700 hover:bg-slate-900 text-white"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Train Now
                    </Button>
                  )}
                </div>
              )}
              
              {(user?.ai_readiness_score || 0) === 100 && (
                <Link to={createPageUrl("Chat")} className="block mt-6">
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start Conversation
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border-slate-800 hover:border-slate-700 transition-all group">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-20`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  {stat.link && (
                    <Link to={stat.link}>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white p-0 h-auto">
                        View details →
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity & Next Steps */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Next Steps */}
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trainingData.length === 0 && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <h4 className="font-semibold text-white mb-2">Upload Your First Data</h4>
                  <p className="text-sm text-slate-300 mb-3">
                    Start by uploading voice recordings or text to begin training your AI
                  </p>
                  <Link to={createPageUrl("Upload")}>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
              
              {trainingData.length > 0 && beneficiaries.length === 0 && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <h4 className="font-semibold text-white mb-2">Add Beneficiaries</h4>
                  <p className="text-sm text-slate-300 mb-3">
                    Designate who can access your Legacy AI
                  </p>
                  <Link to={createPageUrl("Beneficiaries")}>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Add People
                    </Button>
                  </Link>
                </div>
              )}
              
              {(user?.ai_readiness_score || 0) >= 50 && conversations.length === 0 && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <h4 className="font-semibold text-white mb-2">Test Your AI</h4>
                  <p className="text-sm text-slate-300 mb-3">
                    Your AI is ready for a test conversation
                  </p>
                  <Link to={createPageUrl("Chat")}>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Start Chat
                    </Button>
                  </Link>
                </div>
              )}

              <div className="p-5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2 text-base">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Training Tips
                </h4>
                <ul className="space-y-2.5 text-sm">
                  <li className="flex items-start gap-2 text-slate-200">
                    <span className="text-blue-400 font-bold mt-0.5">•</span>
                    <span>Upload at least 30 minutes of voice recordings for best results</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-200">
                    <span className="text-blue-400 font-bold mt-0.5">•</span>
                    <span>Include diverse conversations and topics</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-200">
                    <span className="text-blue-400 font-bold mt-0.5">•</span>
                    <span>Add text samples that reflect your writing style</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-200">
                    <span className="text-blue-400 font-bold mt-0.5">•</span>
                    <span>The more data you provide, the better your AI becomes</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Recent Training Data */}
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" />
                Recent Training Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trainingData.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">No training data yet</p>
                  <Link to={createPageUrl("Upload")}>
                    <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800">
                      Upload First File
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {trainingData.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          item.type === 'audio' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                        }`}>
                          {item.type === 'audio' ? (
                            <span className="text-blue-400 text-xs font-semibold">🎤</span>
                          ) : (
                            <span className="text-purple-400 text-xs font-semibold">📝</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{item.title}</p>
                          <p className="text-slate-400 text-xs">
                            {item.type === 'audio' ? `${item.duration_minutes || 0} min` : `${item.word_count || 0} words`}
                          </p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        item.processing_status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        item.processing_status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-700 text-slate-400'
                      }`}>
                        {item.processing_status}
                      </div>
                    </div>
                  ))}
                  {trainingData.length > 5 && (
                    <Link to={createPageUrl("Library")}>
                      <Button variant="ghost" className="w-full text-slate-400 hover:text-white">
                        View all {trainingData.length} items →
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}