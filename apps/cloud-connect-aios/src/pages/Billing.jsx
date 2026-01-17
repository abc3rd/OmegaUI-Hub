
import React, { useState, useEffect } from "react";
import { User } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Free",
    price: "$0",
    price_note: "/ month",
    features: [
      "LeGenie Chatbot Demo",
      "Limited DB Query Access",
      "50,000 Tokens/Month",
      "Basic Presets"
    ],
    cta: "Your Current Plan",
    plan_id: "free"
  },
  {
    name: "Basic",
    price: "$29",
    price_note: "/ month",
    features: [
      "Full LeGenie Chatbot Access",
      "Limited DB Query/Filter Access",
      "1,000,000 Tokens/Month",
      "Image Generation (S/M)",
      "5 Exports per Day",
      "Email Support"
    ],
    cta: "Upgrade to Basic",
    plan_id: "basic"
  },
  {
    name: "Pro (Subscriber)",
    price: "$79",
    price_note: "/ month",
    features: [
      "Full DB Query/Filter/Export Access",
      "5,000,000 Tokens/Month",
      "Full Multimodal AI Tools (Image, Video, Music)",
      "Priority Access to New Features",
      "Advanced RAG & Presets",
      "API Access",
      "Priority Support"
    ],
    cta: "Upgrade to Pro",
    plan_id: "pro"
  }
];

export default function BillingPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleUpgrade = async (planId) => {
    try {
      // This would typically trigger a Stripe checkout flow.
      // For this demo, we'll just update the user's plan directly.
      
      const planDetails = {
        plan: planId,
        multimodal_allowed: planId === 'pro',
        max_exports_per_day: planId === 'pro' ? 100 : (planId === 'basic' ? 5 : 0),
        quota_monthly_tokens: planId === 'pro' ? 5000000 : (planId === 'basic' ? 1000000 : 50000)
      };
      
      await User.updateMyUserData(planDetails);
      await loadUser();
      
      toast.success(`Successfully upgraded to ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan!`);
    } catch (error) {
      console.error("Error upgrading plan:", error);
      toast.error("Failed to upgrade plan.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#B4009E] to-[#02B6CE] rounded-3xl mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#B4009E] to-[#02B6CE] bg-clip-text text-transparent mb-4">
            Plans & Billing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that's right for you and unlock powerful new features.
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <span className="font-medium">Monthly</span>
          <Switch 
            checked={billingCycle === "yearly"}
            onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
          />
          <span className="font-medium">Yearly</span>
          <Badge className="bg-green-100 text-green-800">Save 20%</Badge>
        </div>

        {/* Plans Grid */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`rounded-2xl transition-all duration-300 ${
                currentUser?.plan === plan.plan_id
                  ? "border-2 border-[#B4009E] shadow-2xl"
                  : "hover:shadow-xl hover:-translate-y-1"
              } ${plan.name === "Pro (Subscriber)" ? "bg-gray-800 text-white" : ""}`}
            >
              <CardHeader className="p-8">
                {plan.name === "Pro (Subscriber)" && (
                  <div className="flex justify-center mb-4">
                    <Badge className="bg-gradient-to-r from-[#B4009E] to-[#FFB902] text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardTitle className="text-3xl font-bold text-center">{plan.name}</CardTitle>
                <div className="text-center mt-4">
                  <span className="text-5xl font-extrabold">
                    {billingCycle === "yearly" && plan.price !== "$0"
                      ? `$${Math.round(parseInt(plan.price.slice(1)) * 12 * 0.8 / 12)}`
                      : plan.price}
                  </span>
                  <span className="text-lg text-gray-500">{plan.price_note}</span>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${plan.name === "Pro (Subscriber)" ? "bg-white/10" : "bg-green-100"}`}>
                        <Check className={`w-4 h-4 ${plan.name === "Pro (Subscriber)" ? "text-white" : "text-green-600"}`} />
                      </div>
                      <span className={`${plan.name === "Pro (Subscriber)" ? "text-gray-300" : "text-gray-700"}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleUpgrade(plan.plan_id)}
                  disabled={currentUser?.plan === plan.plan_id}
                  className={`w-full h-12 text-lg font-semibold ${
                    plan.name === "Pro (Subscriber)"
                      ? "bg-gradient-to-r from-[#B4009E] to-[#FFB902] hover:opacity-90"
                      : "bg-gradient-to-r from-[#B4009E] to-[#02B6CE] hover:opacity-90"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {currentUser?.plan === plan.plan_id ? "Your Current Plan" : plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
