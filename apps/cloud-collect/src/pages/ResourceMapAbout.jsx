import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Droplet, Wifi, Plug, Home, ShowerHead, UtensilsCrossed, 
  Battery, Package, Heart, BookOpen, Building2, MapPin,
  Users, Shield, RefreshCw, AlertTriangle, Navigation, Edit
} from "lucide-react";
import { motion } from "framer-motion";

export default function ResourceMapAbout() {
  const resourceTypes = [
    { icon: Droplet, color: "bg-blue-500", label: "Water", description: "Potable Water Sources" },
    { icon: Wifi, color: "bg-purple-500", label: "WiFi", description: "Public WiFi Hotspots" },
    { icon: Plug, color: "bg-yellow-500", label: "Power", description: "Electrical Outlets" },
    { icon: Battery, color: "bg-amber-500", label: "Charging", description: "Charging Stations" },
    { icon: Home, color: "bg-green-500", label: "Tent Spot", description: "Safe Camping/Rest Areas" },
    { icon: ShowerHead, color: "bg-cyan-500", label: "Shower", description: "Shower Facilities" },
    { icon: Building2, color: "bg-slate-500", label: "Restroom", description: "Public Restrooms" },
    { icon: UtensilsCrossed, color: "bg-orange-500", label: "Food", description: "Food Resources" },
    { icon: Heart, color: "bg-red-500", label: "Medical", description: "Medical Services" },
    { icon: BookOpen, color: "bg-teal-500", label: "Library", description: "Public Libraries" },
    { icon: Building2, color: "bg-rose-500", label: "Shelter", description: "Support Organizations" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#2699fe] to-[#ea00ea] text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzktNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMTAgMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Community Resource Map</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              More Than a Map—<br />A Community Lifeline
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Together, we mark, share, and update essential resources to help each other survive and thrive.
            </p>
            
            <Link to={createPageUrl("ResourceMap")}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 h-14">
                <Navigation className="w-5 h-5 mr-2" />
                Open Resource Map
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* The Concept */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              A Collaborative Tool for Essential Resources
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              The Resource Map is a living, community-driven utility where users mark and share essential survival 
              resources like potable water, accessible electricity, safe camping zones, and support organizations.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 border-blue-200 hover:shadow-lg transition-all">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Community Driven</h3>
                <p className="text-slate-600">
                  Every pin is added by real people helping others. You provide the data; we provide the map.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#4bce2a] hover:shadow-lg transition-all">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="w-8 h-8 text-[#4bce2a]" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Always Updated</h3>
                <p className="text-slate-600">
                  Resources change. Update or remove pins when locations are no longer available.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#ea00ea] hover:shadow-lg transition-all">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-[#ea00ea]" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Looking Out for Each Other</h3>
                <p className="text-slate-600">
                  Accuracy helps the next person. We're all in this together.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* User Guidelines */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-8 text-center">
            How to Use the Resource Map
          </h2>

          <div className="space-y-6">
            {/* Marking a Resource */}
            <Card className="border-2 border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Marking a Resource</h3>
                    <p className="text-slate-700 mb-3">
                      When you find an essential resource, drop a pin on the map:
                    </p>
                    <ol className="list-decimal ml-5 space-y-2 text-slate-700">
                      <li>Tap the <strong>"Drop Pin"</strong> button on the Resource Map</li>
                      <li>Tap the exact location on the map where the resource exists</li>
                      <li>Choose the resource type (water, power, shelter, etc.)</li>
                      <li>Add a clear name and description</li>
                      <li>Include hours, access notes, and photos if possible</li>
                    </ol>
                    <p className="text-blue-600 font-semibold mt-3">
                      💡 Accuracy helps the next person. Be as specific as possible!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Responsibility */}
            <Card className="border-2 border-amber-200 bg-amber-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Your Responsibility</h3>
                    <p className="text-slate-700 mb-3">
                      As a community member, you are responsible for:
                    </p>
                    <ul className="list-disc ml-5 space-y-2 text-slate-700">
                      <li><strong>Legal Access:</strong> Only mark resources that are legally accessible to the public</li>
                      <li><strong>Respect Property:</strong> Do not trespass or mark private property without permission</li>
                      <li><strong>Honest Information:</strong> Provide accurate, truthful information about resources</li>
                      <li><strong>Safety First:</strong> Do not mark resources in dangerous or unsafe locations</li>
                      <li><strong>Follow Local Laws:</strong> Ensure your use complies with all local ordinances and regulations</li>
                    </ul>
                    <div className="mt-4 p-3 bg-amber-100 border border-amber-300 rounded-lg">
                      <p className="text-sm text-amber-900">
                        <AlertTriangle className="w-4 h-4 inline mr-1" />
                        <strong>Remember:</strong> Omega UI, LLC provides the mapping tool. Users are solely responsible 
                        for the accuracy, legality, and safety of the information they contribute.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Updates */}
            <Card className="border-2 border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Edit className="w-6 h-6 text-[#4bce2a]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Keeping Information Current</h3>
                    <p className="text-slate-700 mb-3">
                      Resources change over time. Help keep the map accurate:
                    </p>
                    <ul className="list-disc ml-5 space-y-2 text-slate-700">
                      <li>If a water tap is shut off or broken, use the <strong>"Report Resource"</strong> button</li>
                      <li>Update hours if they change (e.g., a shelter changes operating hours)</li>
                      <li>Add community tips based on your experience</li>
                      <li>Vote resources up or down based on their current status</li>
                      <li>Remove pins you created if the resource is no longer available</li>
                    </ul>
                    <p className="text-[#4bce2a] font-semibold mt-3">
                      🔄 Real-time updates ensure everyone has the most current information
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Resource Legend */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-8 text-center">
            Resource Map Legend
          </h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Each icon represents a different type of essential resource. Use these categories when marking locations.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {resourceTypes.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Card className="border-2 border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all">
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 ${resource.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-slate-800 mb-1">{resource.label}</h3>
                      <p className="text-xs text-slate-600">{resource.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community Values */}
      <section className="py-16 bg-gradient-to-r from-[#2699fe] to-[#ea00ea] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              We're All in This Together
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto">
              The Resource Map works because people like you take the time to help others. 
              Every pin you drop, every update you make, and every honest piece of information you share 
              helps someone who needs it most.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("ResourceMap")}>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 h-14">
                  <Navigation className="w-5 h-5 mr-2" />
                  Explore the Map
                </Button>
              </Link>
              <Link to={createPageUrl("AddResource")}>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 h-14">
                  <MapPin className="w-5 h-5 mr-2" />
                  Add a Resource
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Disclaimer Footer */}
      <section className="py-12 bg-[#3c3c3c] text-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="border-t border-slate-700 pt-8">
            <h3 className="text-lg font-bold mb-4 text-[#ea00ea]">⚠️ Important Legal Disclaimer</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              <strong>Resource Map User Responsibility:</strong> The Resource Map is a community-driven platform. 
              Omega UI, LLC and Cloud QR provide the mapping technology but do not verify, endorse, or guarantee 
              the accuracy, safety, legality, or availability of any resource marked by third-party users.
            </p>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Users who contribute resource information are solely responsible for ensuring that:
            </p>
            <ul className="text-sm text-slate-300 list-disc ml-6 space-y-1 mb-4">
              <li>The resources marked are legally accessible to the public</li>
              <li>No trespassing or violation of property rights occurs</li>
              <li>All information provided is accurate and honest</li>
              <li>The use of marked resources complies with all applicable local, state, and federal laws</li>
            </ul>
            <p className="text-sm text-slate-300 leading-relaxed">
              Omega UI, LLC assumes no liability for user actions, the accuracy of user-contributed data, 
              or any consequences resulting from the use of resources found on this map. 
              Use at your own risk and discretion. Always verify information independently and follow all applicable laws.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}