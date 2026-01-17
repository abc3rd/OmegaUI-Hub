import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Search, Users, Shield, Smartphone, ArrowRight, Sparkles, Globe, Zap, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 opacity-60" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNkYmU4ZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzktNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMTAgMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-6">
              <Globe className="w-4 h-4 text-blue-500 animate-pulse" />
              <span className="text-sm font-medium text-slate-700">Multi-User Collaborative Platform</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Resource Connect
              </span>
              <br />
              <span className="text-slate-800">The Living Map of Community Resources</span>
            </h1>

            <p className="text-base md:text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands of community members mapping essential resources, charitable activities, and assistance services in real-time. A multidimensional, interactive platform built for collaboration at scale.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to={createPageUrl("ResourceMap")}>
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all text-lg px-8 h-14">
                  <MapPin className="w-5 h-5 mr-2" />
                  Explore Live Map
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl("AddResource")}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-slate-300 hover:border-blue-300 hover:bg-blue-50 text-slate-700 text-lg px-8 h-14">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Contribute Now
                </Button>
              </Link>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white/60 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-slate-200"
              >
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                  <Users className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <p className="text-xl md:text-2xl font-bold text-slate-800">1000+</p>
                <p className="text-xs md:text-sm text-slate-600">Active Users</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/60 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-slate-200"
              >
                <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <p className="text-xl md:text-2xl font-bold text-slate-800">5000+</p>
                <p className="text-xs md:text-sm text-slate-600">Resources</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/60 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-slate-200"
              >
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                  <Zap className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <p className="text-xl md:text-2xl font-bold text-slate-800">Real-Time</p>
                <p className="text-xs md:text-sm text-slate-600">Updates</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-800 mb-4">
              How Resource Connect Works
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
              A collaborative, multi-user platform designed for seamless resource sharing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="border-2 border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all h-full">
                <CardContent className="p-6 md:p-8">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4 md:mb-6">
                    <Search className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
                  </div>
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-3 md:mb-4">
                    Step 1
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2 md:mb-3">
                    Discover Resources
                  </h3>
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                    Browse our live, interactive map to find water, WiFi, shelter, food, charitable activities, and assistance services updated by thousands of community members.
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
                <CardContent className="p-6 md:p-8">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-4 md:mb-6">
                    <Users className="w-7 h-7 md:w-8 md:h-8 text-purple-600" />
                  </div>
                  <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-3 md:mb-4">
                    Step 2
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2 md:mb-3">
                    Join the Community
                  </h3>
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                    Create an account to add resources, update information, verify locations, and collaborate with thousands of users contributing in real-time.
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
                <CardContent className="p-6 md:p-8">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-indigo-100 to-sky-100 rounded-2xl flex items-center justify-center mb-4 md:mb-6">
                    <TrendingUp className="w-7 h-7 md:w-8 md:h-8 text-indigo-600" />
                  </div>
                  <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-3 md:mb-4">
                    Step 3
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2 md:mb-3">
                    Make an Impact
                  </h3>
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                    Watch your contributions help others in real-time. Track resource usage, see community feedback, and grow a network of assistance that scales with every user.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-800 mb-4">
              Built for Scale & Collaboration
            </h2>
            <p className="text-base md:text-lg text-slate-600">
              A multidimensional platform designed to handle thousands of concurrent users
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                icon: Globe,
                title: "Multi-User Platform",
                description: "Thousands of users can simultaneously add, update, and verify resources in real-time without conflicts.",
                color: "blue"
              },
              {
                icon: Zap,
                title: "Real-Time Updates",
                description: "See changes instantly as community members update resources. Live synchronization keeps everyone informed.",
                color: "purple"
              },
              {
                icon: MapPin,
                title: "Multidimensional Mapping",
                description: "Layer resources, charitable activities, assistance services, and community initiatives on one interactive map.",
                color: "indigo"
              },
              {
                icon: Users,
                title: "Collaborative by Design",
                description: "Community voting, verification systems, and user contributions ensure accuracy and reliability at scale.",
                color: "blue"
              },
              {
                icon: Shield,
                title: "Secure & Reliable",
                description: "Enterprise-grade infrastructure handles high traffic while protecting user data and maintaining uptime.",
                color: "purple"
              },
              {
                icon: Smartphone,
                title: "Mobile-Optimized",
                description: "Seamlessly works on any device, allowing users to contribute and access resources from anywhere, anytime.",
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
                    <CardContent className="p-5 md:p-6">
                      <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${colors[benefit.color]} rounded-xl flex items-center justify-center mb-3 md:mb-4`}>
                        <Icon className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <h3 className="text-base md:text-lg font-bold text-slate-800 mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-sm md:text-base text-slate-600 leading-relaxed">
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

      {/* Use Cases Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-800 mb-4">
              What Can You Map?
            </h2>
            <p className="text-base md:text-lg text-slate-600">
              From essential services to charitable activities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Essential Resources", items: ["Water Sources", "WiFi Hotspots", "Power Access", "Restrooms"] },
              { title: "Shelter & Housing", items: ["Emergency Shelters", "Tent Sites", "Safe Spaces", "Warming Centers"] },
              { title: "Food & Health", items: ["Food Banks", "Meal Programs", "Medical Clinics", "Mental Health"] },
              { title: "Community Support", items: ["Charitable Events", "Assistance Programs", "Support Groups", "Job Resources"] }
            ].map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-2 border-slate-200 hover:border-blue-300 transition-all h-full">
                  <CardContent className="p-5 md:p-6">
                    <h3 className="font-bold text-slate-800 mb-3 text-base md:text-lg">{category.title}</h3>
                    <ul className="space-y-2">
                      {category.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6">
              Join the Resource Connect Community
            </h2>
            <p className="text-base md:text-xl text-blue-100 mb-6 md:mb-8 max-w-2xl mx-auto">
              Be part of a growing network of thousands mapping resources and making a difference together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("ResourceMap")}>
                <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all text-base md:text-lg px-8 md:px-10 h-12 md:h-14">
                  <Globe className="w-5 h-5 mr-2" />
                  Explore Live Map
                </Button>
              </Link>
              <Link to={createPageUrl("AddResource")}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10 text-base md:text-lg px-8 md:px-10 h-12 md:h-14">
                  Start Contributing
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}