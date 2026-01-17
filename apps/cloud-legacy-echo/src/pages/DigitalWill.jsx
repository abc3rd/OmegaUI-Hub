import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Clock, Users, FileText, AlertTriangle, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function DigitalWillPage() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const [settings, setSettings] = useState({
    enableDigitalWill: false,
    activationMethod: null,
    accessControl: null,
    notifyBeneficiaries: false,
    allowDownloads: true,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings) => base44.auth.updateMe({ digital_will_settings: newSettings }),
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      toast.success("Settings updated!");
    },
  });

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    updateSettingsMutation.mutate(newSettings);
  };

  const handleSelectOption = (category, value) => {
    const newSettings = { ...settings, [category]: value };
    setSettings(newSettings);
    updateSettingsMutation.mutate(newSettings);
  };

  const activationMethods = [
    {
      id: "death_certificate",
      icon: AlertTriangle,
      title: "Death Certificate",
      description: "Verified through legal systems",
      color: "from-yellow-500 to-orange-500"
    },
    {
      id: "inactivity",
      icon: Clock,
      title: "Inactivity Timer",
      description: "After 1 year of no login",
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "trusted_contacts",
      icon: Users,
      title: "Trusted Contacts",
      description: "Multi-party verification",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "manual",
      icon: FileText,
      title: "Manual Only",
      description: "You control everything",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const accessLevels = [
    {
      id: "full",
      icon: Shield,
      title: "Full Access",
      description: "Unlimited conversations & data",
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "limited",
      icon: Clock,
      title: "Limited Access",
      description: "Time & topic restrictions",
      color: "from-yellow-500 to-orange-500"
    },
    {
      id: "view_only",
      icon: FileText,
      title: "View Only",
      description: "Read transcripts, no chat",
      color: "from-slate-500 to-slate-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Digital Will</h1>
          <p className="text-slate-400">
            Set up how your Legacy AI gets shared
          </p>
        </motion.div>

        {/* Master Toggle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-xl border-blue-800/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-lg font-semibold text-white mb-1 block">
                    Enable Digital Will
                  </Label>
                  <p className="text-sm text-slate-300">
                    Activate legacy access for beneficiaries
                  </p>
                </div>
                <Switch
                  checked={settings.enableDigitalWill}
                  onCheckedChange={() => handleToggle('enableDigitalWill')}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence>
          {settings.enableDigitalWill && (
            <>
              {/* Activation Method Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold text-white">Choose Activation Method</h2>
                <div className="grid grid-cols-1 gap-4">
                  {activationMethods.map((method, index) => (
                    <motion.button
                      key={method.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      onClick={() => handleSelectOption('activationMethod', method.id)}
                      className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
                        settings.activationMethod === method.id
                          ? 'ring-4 ring-white shadow-2xl scale-105'
                          : 'hover:scale-102'
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${method.color} ${
                        settings.activationMethod === method.id ? 'opacity-100' : 'opacity-70'
                      }`} />
                      
                      <div className="relative flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center flex-shrink-0">
                          <method.icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="text-lg font-bold text-white mb-1">{method.title}</h3>
                          <p className="text-sm text-white/80">{method.description}</p>
                        </div>
                        {settings.activationMethod === method.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-8 h-8 bg-white rounded-full flex items-center justify-center"
                          >
                            <Check className="w-5 h-5 text-green-600" />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Access Control Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold text-white">Default Access Level</h2>
                <div className="grid grid-cols-1 gap-4">
                  {accessLevels.map((level, index) => (
                    <motion.button
                      key={level.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      onClick={() => handleSelectOption('accessControl', level.id)}
                      className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
                        settings.accessControl === level.id
                          ? 'ring-4 ring-white shadow-2xl scale-105'
                          : 'hover:scale-102'
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${level.color} ${
                        settings.accessControl === level.id ? 'opacity-100' : 'opacity-70'
                      }`} />
                      
                      <div className="relative flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center flex-shrink-0">
                          <level.icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="text-lg font-bold text-white mb-1">{level.title}</h3>
                          <p className="text-sm text-white/80">{level.description}</p>
                        </div>
                        {settings.accessControl === level.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-8 h-8 bg-white rounded-full flex items-center justify-center"
                          >
                            <Check className="w-5 h-5 text-green-600" />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Additional Toggles */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white font-medium">Notify Beneficiaries</Label>
                        <p className="text-sm text-slate-400">Send email when activated</p>
                      </div>
                      <Switch
                        checked={settings.notifyBeneficiaries}
                        onCheckedChange={() => handleToggle('notifyBeneficiaries')}
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white font-medium">Allow Downloads</Label>
                        <p className="text-sm text-slate-400">Let beneficiaries save transcripts</p>
                      </div>
                      <Switch
                        checked={settings.allowDownloads}
                        onCheckedChange={() => handleToggle('allowDownloads')}
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Info Card */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-xl border-purple-800/50">
          <CardContent className="p-6 text-center">
            <p className="text-slate-300 text-sm">
              💡 You can customize individual beneficiary settings on the <strong className="text-white">Beneficiaries</strong> page
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}