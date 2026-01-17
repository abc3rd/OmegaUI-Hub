import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Smartphone, DollarSign, Shield, Users, ArrowRight, Sparkles, Heart, Building2, MapPin, Calendar, Navigation } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 opacity-60" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNkYmU4ZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzktNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMTAgMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-6">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-slate-700">Your Digital Cup</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-500 to-[#ea00ea] bg-clip-text text-transparent">
                A Digital Connection
              </span>
              <br />
              <span className="text-slate-800">for Your Journey</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              A modern way to receive support. Replace the physical cup with a digital link to connect with your community responsibly and with dignity.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-[#ea00ea] hover:from-blue-600 hover:to-[#c000c0] text-white shadow-lg hover:shadow-xl transition-all text-lg px-8 h-14"
                onClick={() => base44.auth.redirectToLogin(createPageUrl("ChooseAccountType"))}
              >
                <QrCode className="w-5 h-5 mr-2" />
                Sign Up as Recipient
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-purple-300 hover:border-purple-400 hover:bg-purple-50 text-slate-700 text-lg px-8 h-14"
                onClick={() => base44.auth.redirectToLogin(createPageUrl("ChooseAccountType"))}
              >
                <Heart className="w-5 h-5 mr-2" />
                Sign Up as Donor
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-[#4bce2a] hover:border-[#4bce2a] hover:bg-green-50 text-slate-700 text-lg px-8 h-14"
                onClick={() => base44.auth.redirectToLogin(createPageUrl("ChooseAccountType"))}
              >
                <Building2 className="w-5 h-5 mr-2" />
                Charitable Entity
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What is Cloud QR Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
              What is Cloud QR?
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed mb-8">
              Cloud QR is a bridge for community support. It is a platform for individuals to receive 
              contributions with dignity through a "Digital Cup" and for local organizations to share 
              life-sustaining resources.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="border-2 border-blue-200 hover:shadow-lg transition-all">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <QrCode className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">The Digital Cup</h3>
                  <p className="text-sm text-slate-600">
                    Replace the physical cup with a QR code. Safer, more dignified, and honest.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-purple-200 hover:shadow-lg transition-all">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-[#ea00ea]" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Direct Support</h3>
                  <p className="text-sm text-slate-600">
                    Donors connect directly with individuals and causes they care about.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-[#4bce2a] hover:shadow-lg transition-all">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-[#4bce2a]" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Community Resources</h3>
                  <p className="text-sm text-slate-600">
                    Organizations post events and resources to help those in need.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Resource Map Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Find What You Need, When You Need It
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A real-time, community-driven map where users and organizations mark essential resources.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="border-2 border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all h-full">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mb-6">
                    <MapPin className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">
                    Locate Essentials
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Find water, electricity, safe camping spots, and more—marked by the community for the community.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="border-2 border-slate-100 hover:border-[#4bce2a] hover:shadow-lg transition-all h-full">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                    <Calendar className="w-8 h-8 text-[#4bce2a]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">
                    Organization Events
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    See live pins from local churches and centers for food drives, clothing giveaways, and support services.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="border-2 border-slate-100 hover:border-purple-200 hover:shadow-lg transition-all h-full">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-6">
                    <Navigation className="w-8 h-8 text-[#ea00ea]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">
                    Stay Informed
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Use the map to navigate to help in your immediate area. Updated in real-time by your community.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="text-center">
            <Link to={createPageUrl("ResourceMap")}>
              <Button size="lg" className="bg-gradient-to-r from-[#2699fe] to-[#ea00ea] hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all text-lg px-10 h-14">
                <MapPin className="w-5 h-5 mr-2" />
                View the Resource Map
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              How It Works for Recipients
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Three simple steps to start receiving support
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="border-2 border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all h-full">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6">
                    <Smartphone className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
                    Step 1
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">
                    Tell Your Journey
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Share who you are and what you are working toward. Dignity begins with being heard.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="border-2 border-slate-100 hover:border-purple-200 hover:shadow-lg transition-all h-full">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                    <QrCode className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
                    Step 2
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">
                    Your Digital Cup
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Download and print your personalized QR code. We provide the tools; you manage your outreach responsibly, safely, and honestly.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="border-2 border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all h-full">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-sky-100 rounded-2xl flex items-center justify-center mb-6">
                    <DollarSign className="w-8 h-8 text-indigo-600" />
                  </div>
                  <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-4">
                    Step 3
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">
                    Receive Support
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Donations go directly to your connected account. Track your progress and manage your funds responsibly.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Why Cloud Collect?
            </h2>
            <p className="text-lg text-slate-600">
              Built with safety, dignity, and convenience in mind
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Safe & Secure",
                description: "No need to handle cash. Donations are processed securely through Stripe's trusted payment platform.",
                color: "blue"
              },
              {
                icon: Users,
                title: "Maintain Dignity",
                description: "Share your story on your terms. People connect with your journey and choose to support you.",
                color: "purple"
              },
              {
                icon: QrCode,
                title: "Asynchronous Giving",
                description: "Your QR code works 24/7. People can donate even when you're not around.",
                color: "indigo"
              },
              {
                icon: Smartphone,
                title: "Mobile-First",
                description: "Designed for any smartphone with limited data. Works great on any device.",
                color: "blue"
              },
              {
                icon: DollarSign,
                title: "Direct Payouts",
                description: "Money goes straight to your connected account via Stripe. No middleman, no delays.",
                color: "purple"
              },
              {
                icon: Users,
                title: "Community Resources",
                description: "Access a map of helpful community resources, updated by other users.",
                color: "indigo"
              }
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              const colors = {
                blue: "from-blue-100 to-blue-200 text-blue-600",
                purple: "from-purple-100 to-purple-200 text-purple-600",
                indigo: "from-indigo-100 to-indigo-200 text-indigo-600"
              };

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all h-full bg-white">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 bg-gradient-to-br ${colors[benefit.color]} rounded-xl flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-[#ea00ea]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Create your Cloud QR profile in just a few minutes. It's free, simple, and can make a real difference.
            </p>
            <Link to={createPageUrl("CreateProfile")}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all text-lg px-10 h-14">
                Create Your Profile Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}