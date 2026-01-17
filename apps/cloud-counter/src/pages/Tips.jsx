
import React from "react";
import { Lightbulb, Thermometer, Droplets, Wind, Zap } from "lucide-react";
import TipCard from "../components/tips/TipCard";

const tipsData = {
  "General": [
    { title: "Unplug 'Vampire' Electronics", description: "Many electronics use power even when turned off. Unplug them or use a smart power strip.", impact: "Medium", difficulty: "Easy", icon: Zap },
    { title: "Use Smart Power Strips", description: "These automatically cut power to devices in standby mode, saving energy without extra effort.", impact: "Medium", difficulty: "Easy", icon: Zap },
    { title: "Energy-Efficient Windows", description: "Upgrade to double or triple-pane windows to improve insulation and reduce heating/cooling costs.", impact: "High", difficulty: "Hard", icon: Wind }
  ],
  "Lighting": [
    { title: "Switch to LEDs", description: "LED bulbs use up to 80% less energy and last 25 times longer than incandescent bulbs.", impact: "High", difficulty: "Easy", icon: Lightbulb },
    { title: "Use Dimmers and Sensors", description: "Install dimmers or motion sensors to use only the light you need, when you need it.", impact: "Medium", difficulty: "Medium", icon: Lightbulb }
  ],
  "HVAC": [
    { title: "Programmable Thermostat", description: "Set your thermostat to automatically adjust when you're away or asleep.", impact: "High", difficulty: "Medium", icon: Thermometer },
    { title: "Seal Air Leaks", description: "Check for and seal leaks around windows, doors, and ducts to prevent energy loss.", impact: "High", difficulty: "Medium", icon: Wind },
    { title: "Clean Filters Regularly", description: "A clean filter helps your HVAC system run more efficiently. Clean or replace it monthly.", impact: "Medium", difficulty: "Easy", icon: Thermometer }
  ],
  "Water Heating": [
    { title: "Lower Water Heater Temperature", description: "Set your water heater to 120°F (49°C) to save energy. Every 10°F reduction can save 3-5%.", impact: "Medium", difficulty: "Easy", icon: Droplets },
    { title: "Install Low-Flow Fixtures", description: "Low-flow showerheads and faucets can reduce hot water consumption significantly.", impact: "Medium", difficulty: "Medium", icon: Droplets }
  ]
};

export default function Tips() {
  return (
    <div className="p-6 space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
          <Lightbulb className="w-6 h-6 text-yellow-300" />
          <h1 className="text-3xl font-bold text-white">Energy Saving Tips</h1>
        </div>
        <p className="text-white/80 mt-4 text-lg">Discover ways to reduce your consumption and save money.</p>
      </div>
      
      {Object.entries(tipsData).map(([category, tips], index) => (
        <div key={category} className="space-y-4">
          <h2 className="text-2xl font-bold text-white/90 pl-4 border-l-4 border-blue-400">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip, tipIndex) => (
              <TipCard key={tipIndex} tip={tip} delay={(index * 0.1) + (tipIndex * 0.05)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
