import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert"; // New import
import {
  Brain, Heart, Database, Users,
  DollarSign, Shield, Lock, TrendingUp, Award, Zap,
  BookOpen, Mic, Scale, RefreshCw, CheckCircle,
  AlertCircle, Gift, Baby, GraduationCap, Home
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function LegacyInfo() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false); // Kept as per outline, though functionality mirrors isAuthenticated

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authed = await base44.auth.isAuthenticated();
      setIsAuthenticated(authed);
      setShowFullContent(authed);
    } catch (error) {
      console.error("Authentication check failed:", error);
      setIsAuthenticated(false);
      setShowFullContent(false);
    }
  };

  const handleLogin = () => {
    // Redirects to the login page, then back to LegacyAI page after successful login.
    base44.auth.redirectToLogin(createPageUrl("LegacyAI"));
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const emotionalBenefits = [
    {
      icon: Heart,
      title: "Grandchildren Meet Their Grandparents",
      description: "Kids born after you're gone can still hear your voice, your stories, your wisdom. They know who you were.",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Family Traditions Live Forever",
      description: "Your recipes, your jokes, your advice, your values - all preserved and accessible to future generations.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: BookOpen,
      title: "Your Life Story Never Dies",
      description: "Every memory, every lesson, every experience becomes part of your family's permanent archive.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Gift,
      title: "The Ultimate Inheritance",
      description: "More valuable than money - you leave behind your knowledge, personality, and presence.",
      color: "from-amber-500 to-orange-500"
    }
  ];

  const dataOwnershipProblems = [
    {
      icon: AlertCircle,
      title: "Big Tech Steals Your Life",
      problem: "Google, Facebook, Amazon collect every search, every post, every purchase. They train AI on YOUR data. They profit billions. You get nothing.",
      solution: "Legacy AI gives YOU ownership. Your data trains YOUR AI. You decide who accesses it. You get paid when it's used."
    },
    {
      icon: DollarSign,
      title: "Your Data = Their Fortune",
      problem: "Every time you use Google, post on Facebook, or shop on Amazon, they're monetizing YOUR behavior. You signed away the rights in Terms & Conditions you never read.",
      solution: "The ARC stores your data encrypted by YOUR biometrics. Companies want access? They pay YOU, not Mark Zuckerberg."
    },
    {
      icon: Scale,
      title: "The Most Unfair Deal in History",
      problem: "You create the data. They own it. They sell it. They train AI on it. You get 'free' service that tracks your every move.",
      solution: "Legacy AI flips the script. Your AI. Your data. Your monetization. You're the product? Then you should get paid like one."
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Set It and Forget It",
      description: "Connect your social media, emails, photos, messages, voice recordings, videos. Legacy AI starts learning immediately.",
      icon: Zap,
      details: [
        "Zero manual work required",
        "Automatic data collection from all sources",
        "Continuous learning 24/7",
        "Privacy-protected sandbox environment"
      ]
    },
    {
      step: 2,
      title: "Automated Training",
      description: "Your AI analyzes everything you say, write, create, and share. It learns your vocabulary, humor, opinions, and personality.",
      icon: Brain,
      details: [
        "Natural language processing",
        "Voice pattern recognition",
        "Personality mapping",
        "Belief system modeling"
      ]
    },
    {
      step: 3,
      title: "Voice Cloning",
      description: "Using your voice recordings, Legacy AI creates a perfect digital replica of how you speak - tone, accent, mannerisms.",
      icon: Mic,
      details: [
        "Exact voice replication",
        "Speech pattern matching",
        "Emotional inflection",
        "Natural conversation flow"
      ]
    },
    {
      step: 4,
      title: "The Transitional Period (You're Alive)",
      description: "Test your AI. Correct it when wrong. Refine it. Add memories. This is YOUR chance to make sure it represents you accurately.",
      icon: RefreshCw,
      details: [
        "Interactive feedback loop",
        "Manual memory addition",
        "Personality refinement",
        "Quality control by YOU"
      ]
    },
    {
      step: 5,
      title: "Legacy Mode (After You're Gone)",
      description: "Your verified Circle can interact with your AI. It answers questions, tells stories, gives advice - as if you're still there.",
      icon: Users,
      details: [
        "Only your Circle has access",
        "No public exposure",
        "Verified human interactions only",
        "Your wisdom lives on"
      ]
    },
    {
      step: 6,
      title: "Data Monetization",
      description: "Companies want insights from your data? Your Circle approves or denies. If approved, they pay. Revenue goes to your estate/family.",
      icon: DollarSign,
      details: [
        "You (or your estate) set the price",
        "Your Circle controls access",
        "Transparent revenue sharing",
        "Passive income forever"
      ]
    }
  ];

  const realWorldScenarios = [
    {
      icon: Baby,
      title: "Grandchild Born After You Die",
      scenario: "Your grandchild is born 5 years after you pass away. They'll never meet you in person.",
      legacySolution: "At age 10, they open Legacy AI and ask 'Grandpa, what was your life like?' Your AI responds in YOUR voice, tells YOUR stories, shares YOUR wisdom. They get to know you."
    },
    {
      icon: GraduationCap,
      title: "Life Advice for Future Generations",
      scenario: "Your great-great-grandchild faces a difficult decision in 2090. They need guidance from someone who lived through similar challenges.",
      legacySolution: "They ask your AI for advice. It draws from your life experiences and gives them perspective from someone who actually lived through their time."
    },
    {
      icon: Home,
      title: "Family Recipe Preservation",
      scenario: "Your famous holiday recipes die with you. No one wrote them down. The tradition is lost forever.",
      legacySolution: "Your AI has every recipe, every cooking tip, every family tradition documented. It can walk your descendants through making your signature dish step-by-step."
    },
    {
      icon: Heart,
      title: "Grief Support",
      scenario: "Your spouse is grieving and wishes they could talk to you one more time.",
      legacySolution: "They can. Your AI provides comfort, reminds them of shared memories, and helps them heal by keeping your presence alive."
    }
  ];

  const monetizationBreakdown = [
    {
      icon: Database,
      title: "Your Data = Your Asset",
      value: "$1,000 - $10,000/year",
      description: "Average value of one person's data to advertising/AI companies. Currently, they take it all. With Legacy AI, you keep it."
    },
    {
      icon: TrendingUp,
      title: "Lifetime Value",
      value: "$50,000 - $500,000",
      description: "Your complete digital footprint over a lifetime. Big Tech profits from this. You should too."
    },
    {
      icon: Users,
      title: "Circle Economics",
      value: "Exponential Growth",
      description: "If everyone in your Circle monetizes their data together, the collective value increases. Shared insights = premium pricing."
    },
    {
      icon: Award,
      title: "Legacy Inheritance",
      value: "Passive Income Forever",
      description: "After you're gone, your data continues generating value. Your family inherits the revenue stream. Your wisdom pays your great-grandchildren's college."
    }
  ];

  const whyThisMatters = [
    {
      title: "Big Tech's Business Model is Theft",
      points: [
        "They collect YOUR data without meaningful compensation",
        "They train AI on YOUR life experiences",
        "They profit billions while you get ads",
        "You signed away rights in unreadable Terms & Conditions"
      ]
    },
    {
      title: "Death Shouldn't Erase You",
      points: [
        "Your knowledge has value beyond your lifetime",
        "Your personality can comfort future generations",
        "Your wisdom can guide descendants you'll never meet",
        "Your voice should never be forgotten"
      ]
    },
    {
      title: "Data is the New Oil - You Should Own Yours",
      points: [
        "AI companies need data to train models",
        "Your data is unique and irreplaceable",
        "You created it, you should profit from it",
        "Fair compensation for your digital footprint"
      ]
    }
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Hero */}
        <motion.div {...fadeIn} className="text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/50">
            <Brain className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black metallic-text">
            Legacy AI
          </h1>
          <p className="text-2xl font-bold cyan-metallic">
            Your Digital Immortality
          </p>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed font-medium">
            Set it. Forget it. Live forever. Train an AI on your entire life so future generations can know you, learn from you, and carry on your legacy.
          </p>
        </motion.div>

        {/* The Vision */}
        <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/95 border-purple-500/40 shadow-2xl">
            <CardContent className="p-10">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-4xl font-black metallic-text mb-6">Why Legacy AI Exists</h2>
                  <div className="space-y-6 text-gray-100 leading-relaxed text-lg font-medium">
                    <p>
                      <strong className="text-white text-xl">Death is permanent. But your wisdom doesn't have to be.</strong>
                    </p>
                    <p>
                      Every day, millions of people die and take their knowledge, stories, and personalities with them. 
                      Grandchildren never meet grandparents. Family recipes are lost. Life lessons disappear. 
                      <strong className="text-purple-300"> What if that didn't have to happen?</strong>
                    </p>
                    <p>
                      Meanwhile, Google, Facebook, and Amazon are already collecting every piece of your digital life. 
                      They're training AI on YOUR data. They're profiting billions from YOUR experiences. 
                      <strong className="text-pink-300"> And you get nothing.</strong>
                    </p>
                    <p className="text-2xl font-black text-purple-300 pt-4">
                      Legacy AI changes everything.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Emotional Benefits */}
        <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
          <h2 className="text-4xl font-black metallic-text text-center mb-8">
            The Ultimate Gift to Your Family
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {emotionalBenefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <Card key={idx} className="bg-slate-900/80 border-purple-500/20 hover:border-purple-500/40 transition-all">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center mb-6 shadow-xl`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-4">{benefit.title}</h3>
                    <p className="text-gray-200 text-lg leading-relaxed font-medium">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Show preview content for non-authenticated users */}
        {!isAuthenticated && (
          <motion.div {...fadeIn} transition={{ delay: 0.25 }}>
            <Alert className="border-amber-500/30 bg-amber-500/10">
              <AlertCircle className="w-4 h-4 text-amber-300" />
              <AlertDescription className="text-amber-100 font-medium flex items-center justify-between flex-wrap gap-2">
                <span>
                  <strong>Members Only:</strong> Sign up to access full Legacy AI features and documentation.
                </span>
                <Button 
                  onClick={handleLogin}
                  size="sm"
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                >
                  Sign Up Free
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Conditional rendering for restricted content */}
        {!isAuthenticated ? (
          // Restricted content with blur overlay
          <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-cyan-500/30 shadow-2xl relative">
              <CardContent className="p-16 text-center">
                <div className="absolute inset-0 backdrop-blur-sm bg-slate-900/50 flex items-center justify-center z-10 p-4">
                  <div className="max-w-md">
                    <Lock className="w-20 h-20 text-cyan-400 mx-auto mb-6" />
                    <h3 className="text-3xl font-black text-white mb-4">Members Only Content</h3>
                    <p className="text-gray-300 mb-8 text-lg">
                      Sign up to access detailed implementation guides, technical specifications, 
                      and monetization strategies.
                    </p>
                    <Button 
                      onClick={handleLogin}
                      size="lg"
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 h-14 px-12 text-lg font-bold"
                    >
                      Get Full Access - Free
                    </Button>
                  </div>
                </div>
                {/* Blurred content (a preview of what's behind the gate) */}
                <div className="blur-sm opacity-30 pointer-events-none">
                  <h2 className="text-4xl font-black metallic-text text-center mb-12">
                    How Legacy AI Works (Preview)
                  </h2>
                  <div className="space-y-8">
                    {/* Display a snippet of the "How It Works" section */}
                    {howItWorks.slice(0, 2).map((step, idx) => {
                      const Icon = step.icon;
                      return (
                        <div key={idx} className="flex gap-6 items-start">
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-xl">
                              {step.step}
                            </div>
                          </div>
                          <div className="flex-1 text-left"> {/* Added text-left for better readability in preview */}
                            <div className="flex items-center gap-3 mb-3">
                              <Icon className="w-8 h-8 text-cyan-400" />
                              <h3 className="text-2xl font-black text-white">{step.title}</h3>
                            </div>
                            <p className="text-gray-200 text-lg mb-4 font-medium leading-relaxed">{step.description}</p>
                            <div className="grid md:grid-cols-2 gap-3">
                                <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Preview feature detail 1</span>
                                </div>
                                <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Preview feature detail 2</span>
                                </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          // Full content for authenticated users
          <>
            {/* How It Works - Step by Step */}
            <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
              <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-cyan-500/30 shadow-2xl">
                <CardContent className="p-10">
                  <h2 className="text-4xl font-black metallic-text text-center mb-12">
                    How Legacy AI Works
                  </h2>
                  <div className="space-y-8">
                    {howItWorks.map((step, idx) => {
                      const Icon = step.icon;
                      return (
                        <div key={idx} className="flex gap-6 items-start">
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-xl">
                              {step.step}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Icon className="w-8 h-8 text-cyan-400" />
                              <h3 className="text-2xl font-black text-white">{step.title}</h3>
                            </div>
                            <p className="text-gray-200 text-lg mb-4 font-medium leading-relaxed">{step.description}</p>
                            <div className="grid md:grid-cols-2 gap-3">
                              {step.details.map((detail, i) => (
                                <div key={i} className="flex items-center gap-2 text-cyan-300 font-semibold">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>{detail}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Real World Scenarios */}
            <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
              <h2 className="text-4xl font-black metallic-text text-center mb-8">
                Real-Life Legacy AI Scenarios
              </h2>
              <div className="grid gap-6">
                {realWorldScenarios.map((scenario, idx) => {
                  const Icon = scenario.icon;
                  return (
                    <Card key={idx} className="bg-gradient-to-br from-purple-900/20 to-slate-900/90 border-purple-500/30">
                      <CardContent className="p-8">
                        <div className="flex items-start gap-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Icon className="w-10 h-10 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-black text-white mb-4">{scenario.title}</h3>
                            <div className="space-y-4">
                              <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                                <p className="text-red-200 font-bold mb-2">Without Legacy AI:</p>
                                <p className="text-gray-200 font-medium">{scenario.scenario}</p>
                              </div>
                              <div className="bg-green-900/20 border-l-4 border-green-500 p-4 rounded">
                                <p className="text-green-200 font-bold mb-2">With Legacy AI:</p>
                                <p className="text-gray-200 font-medium">{scenario.legacySolution}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>

            {/* Data Ownership Problem */}
            <motion.div {...fadeIn} transition={{ delay: 0.5 }}>
              <Card className="bg-gradient-to-br from-red-900/30 to-slate-900/95 border-red-500/40 shadow-2xl">
                <CardContent className="p-10">
                  <div className="text-center mb-10">
                    <h2 className="text-4xl font-black metallic-text mb-4">
                      The Data Ownership Crisis
                    </h2>
                    <p className="text-xl text-gray-200 font-bold">
                      Big Tech is mining YOUR life for profit. It's time to take it back.
                    </p>
                  </div>
                  <div className="space-y-8">
                    {dataOwnershipProblems.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div key={idx} className="bg-slate-950/70 rounded-xl p-8 border-2 border-red-500/30">
                          <div className="flex items-center gap-4 mb-6">
                            <Icon className="w-10 h-10 text-red-400" />
                            <h3 className="text-2xl font-black text-white">{item.title}</h3>
                          </div>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <Badge className="bg-red-500/20 text-red-300 border-red-500/40 mb-3 font-bold">THE PROBLEM</Badge>
                              <p className="text-gray-200 leading-relaxed font-medium">{item.problem}</p>
                            </div>
                            <div>
                              <Badge className="bg-green-500/20 text-green-300 border-green-500/40 mb-3 font-bold">THE SOLUTION</Badge>
                              <p className="text-gray-200 leading-relaxed font-medium">{item.solution}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Data Monetization */}
            <motion.div {...fadeIn} transition={{ delay: 0.6 }}>
              <Card className="bg-gradient-to-br from-green-900/30 to-slate-900/95 border-green-500/40 shadow-2xl">
                <CardContent className="p-10">
                  <h2 className="text-4xl font-black metallic-text text-center mb-12">
                    Your Data = Your Income
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {monetizationBreakdown.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <Card key={idx} className="bg-slate-950/70 border-green-500/30">
                          <CardContent className="p-8 text-center">
                            <Icon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-black text-white mb-2">{item.title}</h3>
                            <div className="text-3xl font-black text-green-400 mb-4">{item.value}</div>
                            <p className="text-gray-200 leading-relaxed font-medium">{item.description}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Why This Matters */}
            <motion.div {...fadeIn} transition={{ delay: 0.7 }}>
              <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-purple-500/40 shadow-2xl">
                <CardContent className="p-10">
                  <h2 className="text-4xl font-black metallic-text text-center mb-12">
                    Why This Matters
                  </h2>
                  <div className="space-y-8">
                    {whyThisMatters.map((section, idx) => (
                      <div key={idx} className="bg-slate-950/70 rounded-xl p-8 border-2 border-purple-500/30">
                        <h3 className="text-2xl font-black text-white mb-6">{section.title}</h3>
                        <div className="space-y-3">
                          {section.points.map((point, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <CheckCircle className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                              <p className="text-gray-200 text-lg font-medium leading-relaxed">{point}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        {/* Call to Action */}
        <motion.div {...fadeIn} transition={{ delay: 0.8 }} className="text-center">
          <Card className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-purple-500/20 border-purple-500/50 shadow-2xl">
            <CardContent className="p-12">
              <h2 className="text-4xl font-black metallic-text mb-4">
                Start Your Legacy Today
              </h2>
              <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
                Set it. Forget it. Live forever. Train your AI now so your wisdom outlives you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={createPageUrl("LegacyAI")}>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-2xl">
                    <Brain className="w-6 h-6 mr-3" />
                    Enable Legacy AI
                  </Button>
                </Link>
                <Link to={createPageUrl("FaceToFaceInfo")}>
                  <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 font-bold text-lg px-8 py-6 rounded-xl">
                    <Shield className="w-6 h-6 mr-3" />
                    Learn About Security
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}