import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Home, UtensilsCrossed, Trash2, ShoppingBag, Lightbulb, Target, Leaf } from "lucide-react";
import { motion } from "framer-motion";

const ecoTips = {
  transportation: [
    {
      title: "Switch to Public Transportation",
      description: "Use buses, trains, or subways instead of driving. Can reduce emissions by 4.8 tons CO2e annually.",
      impact: "High",
      difficulty: "Easy",
      savings: "4.8 tons CO2e/year"
    },
    {
      title: "Work from Home 2 Days/Week",
      description: "Remote work reduces commuting emissions. Two days per week can save 2.4 tons CO2e annually.",
      impact: "Medium",
      difficulty: "Easy",
      savings: "2.4 tons CO2e/year"
    },
    {
      title: "Consider an Electric Vehicle",
      description: "EVs produce 60% fewer emissions than gas cars when considering the electricity grid mix.",
      impact: "High",
      difficulty: "Hard",
      savings: "3.6 tons CO2e/year"
    },
    {
      title: "Combine Errands in One Trip",
      description: "Plan your outings to reduce the number of car trips. Can reduce fuel consumption by 20%.",
      impact: "Low",
      difficulty: "Easy",
      savings: "0.8 tons CO2e/year"
    },
    {
      title: "Bike or Walk for Short Trips",
      description: "Replace car trips under 3 miles with walking or cycling. Great for health too!",
      impact: "Medium",
      difficulty: "Easy",
      savings: "1.2 tons CO2e/year"
    },
  ],
  energy: [
    {
      title: "Switch to LED Light Bulbs",
      description: "LEDs use 75% less energy and last 25 times longer than traditional incandescent bulbs.",
      impact: "Low",
      difficulty: "Easy",
      savings: "0.4 tons CO2e/year"
    },
    {
      title: "Improve Home Insulation",
      description: "Better insulation reduces heating and cooling needs by up to 30%.",
      impact: "High",
      difficulty: "Hard",
      savings: "2.1 tons CO2e/year"
    },
    {
      title: "Install a Smart Thermostat",
      description: "Smart thermostats can reduce heating/cooling energy use by 10-15%.",
      impact: "Medium",
      difficulty: "Medium",
      savings: "1.2 tons CO2e/year"
    },
    {
      title: "Switch to Renewable Energy",
      description: "Choose a renewable energy plan from your utility or install solar panels.",
      impact: "High",
      difficulty: "Medium",
      savings: "3.0 tons CO2e/year"
    },
    {
      title: "Unplug Electronics When Not in Use",
      description: "Phantom loads account for 5-10% of residential electricity use.",
      impact: "Low",
      difficulty: "Easy",
      savings: "0.3 tons CO2e/year"
    },
  ],
  food: [
    {
      title: "Reduce Meat Consumption",
      description: "Eat meat 1-2 times per week instead of daily. Beef has the highest carbon footprint.",
      impact: "High",
      difficulty: "Medium",
      savings: "1.9 tons CO2e/year"
    },
    {
      title: "Buy Local and Seasonal Produce",
      description: "Local food reduces transportation emissions and supports your community.",
      impact: "Medium",
      difficulty: "Easy",
      savings: "0.7 tons CO2e/year"
    },
    {
      title: "Reduce Food Waste",
      description: "Plan meals, use leftovers, and compost scraps. Food waste creates methane in landfills.",
      impact: "Medium",
      difficulty: "Easy",
      savings: "1.1 tons CO2e/year"
    },
    {
      title: "Grow Your Own Vegetables",
      description: "Home gardens reduce transportation emissions and packaging waste.",
      impact: "Low",
      difficulty: "Medium",
      savings: "0.5 tons CO2e/year"
    },
    {
      title: "Choose Plant-Based Proteins",
      description: "Beans, lentils, and nuts have much lower carbon footprints than meat.",
      impact: "High",
      difficulty: "Easy",
      savings: "1.4 tons CO2e/year"
    },
  ],
  waste: [
    {
      title: "Start Composting",
      description: "Compost organic waste at home or use municipal composting programs.",
      impact: "Medium",
      difficulty: "Easy",
      savings: "0.9 tons CO2e/year"
    },
    {
      title: "Recycle Properly",
      description: "Learn your local recycling guidelines and recycle everything possible.",
      impact: "Low",
      difficulty: "Easy",
      savings: "0.6 tons CO2e/year"
    },
    {
      title: "Use Reusable Items",
      description: "Replace disposable items with reusable alternatives (bags, bottles, containers).",
      impact: "Medium",
      difficulty: "Easy",
      savings: "0.7 tons CO2e/year"
    },
    {
      title: "Repair Instead of Replace",
      description: "Fix items when possible instead of throwing them away and buying new.",
      impact: "Medium",
      difficulty: "Medium",
      savings: "0.8 tons CO2e/year"
    },
    {
      title: "Donate or Sell Unwanted Items",
      description: "Give items a second life instead of sending them to landfills.",
      impact: "Low",
      difficulty: "Easy",
      savings: "0.4 tons CO2e/year"
    },
  ],
  consumption: [
    {
      title: "Buy Less, Choose Quality",
      description: "Purchase fewer, higher-quality items that last longer.",
      impact: "Medium",
      difficulty: "Medium",
      savings: "1.3 tons CO2e/year"
    },
    {
      title: "Shop Second-Hand",
      description: "Thrift stores and online marketplaces offer great alternatives to new items.",
      impact: "Medium",
      difficulty: "Easy",
      savings: "1.0 tons CO2e/year"
    },
    {
      title: "Use Electronics Longer",
      description: "Keep phones, laptops, and appliances for their full useful life.",
      impact: "Medium",
      difficulty: "Easy",
      savings: "0.9 tons CO2e/year"
    },
    {
      title: "Choose Sustainable Brands",
      description: "Support companies with strong environmental commitments and practices.",
      impact: "Low",
      difficulty: "Easy",
      savings: "0.5 tons CO2e/year"
    },
    {
      title: "Borrow or Rent Instead of Buying",
      description: "For occasional-use items, consider borrowing, renting, or sharing.",
      impact: "Low",
      difficulty: "Easy",
      savings: "0.6 tons CO2e/year"
    },
  ]
};

const categoryInfo = {
  transportation: { icon: Car, color: 'blue' },
  energy: { icon: Home, color: 'yellow' },
  food: { icon: UtensilsCrossed, color: 'green' },
  waste: { icon: Trash2, color: 'orange' },
  consumption: { icon: ShoppingBag, color: 'purple' }
};

const impactColors = {
  High: 'bg-red-100 text-red-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Low: 'bg-green-100 text-green-800'
};

const difficultyColors = {
  Easy: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Hard: 'bg-red-100 text-red-800'
};

export default function EcoTipsPage() {
  const [activeCategory, setActiveCategory] = useState('transportation');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Eco Tips & Strategies</h1>
          <p className="text-gray-600 text-lg">Actionable ways to reduce your carbon footprint</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">Your Impact Goal</h2>
                  <p className="text-green-100">Small changes can make a big difference. Each tip shows potential CO2 savings.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <TabsList className="grid grid-cols-5 w-full bg-white/60 backdrop-blur-sm">
              {Object.entries(categoryInfo).map(([category, info]) => {
                const Icon = info.icon;
                return (
                  <TabsTrigger 
                    key={category} 
                    value={category} 
                    className="flex items-center gap-2 capitalize"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{category}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </motion.div>

          {Object.entries(ecoTips).map(([category, tips]) => (
            <TabsContent key={category} value={category}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {tips.map((tip, index) => (
                  <Card 
                    key={index} 
                    className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-lg leading-tight">{tip.title}</CardTitle>
                        <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed">{tip.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex gap-2 flex-wrap">
                          <Badge className={impactColors[tip.impact]}>
                            {tip.impact} Impact
                          </Badge>
                          <Badge className={difficultyColors[tip.difficulty]}>
                            {tip.difficulty}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                          <Leaf className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-800">Saves: {tip.savings}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <Lightbulb className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Start Small, Think Big</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                You don't need to implement every tip at once. Pick 2-3 easy changes to start with, 
                then gradually add more sustainable practices to your lifestyle. Every action counts!
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="font-semibold text-green-800">Week 1-2</div>
                  <div className="text-green-600">Start with easy wins</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="font-semibold text-blue-800">Month 1-3</div>
                  <div className="text-blue-600">Add medium-difficulty changes</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="font-semibold text-purple-800">Ongoing</div>
                  <div className="text-purple-600">Consider larger investments</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}