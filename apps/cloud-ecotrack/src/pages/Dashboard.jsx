import React, { useState, useEffect } from "react";
import { CarbonCalculation } from "@/entities/CarbonCalculation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, TrendingDown, Target, Calculator, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

import FootprintChart from "../components/dashboard/FootprintChart";
import CategoryBreakdown from "../components/dashboard/CategoryBreakdown";
import RecentCalculations from "../components/dashboard/RecentCalculations";

export default function DashboardPage() {
  const [calculations, setCalculations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCalculations();
  }, []);

  const loadCalculations = async () => {
    setIsLoading(true);
    try {
      const data = await CarbonCalculation.list('-calculation_date', 20);
      setCalculations(data);
    } catch (error) {
      console.error("Error loading calculations:", error);
    }
    setIsLoading(false);
  };

  const latestCalculation = calculations[0];
  const avgFootprint = calculations.length > 0 
    ? calculations.reduce((sum, calc) => sum + calc.total_footprint_tons, 0) / calculations.length 
    : 0;
  
  const globalTarget = 2.3; // Paris Agreement target
  const currentFootprint = latestCalculation?.total_footprint_tons || 0;
  const progressToTarget = Math.min((globalTarget / currentFootprint) * 100, 100);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6">
            {[1,2,3,4].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-4xl font-bold text-gray-900">Carbon Dashboard</h1>
            <Link to={createPageUrl("Calculator")}>
              <Button className="bg-green-600 hover:bg-green-700">
                <Calculator className="w-4 h-4 mr-2" />
                New Calculation
              </Button>
            </Link>
          </div>
          <p className="text-gray-600 text-lg">Track your environmental impact over time</p>
        </motion.div>

        {calculations.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Card className="max-w-md mx-auto bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No calculations yet</h3>
                <p className="text-gray-600 mb-6">Start by calculating your carbon footprint to see your environmental impact.</p>
                <Link to={createPageUrl("Calculator")}>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Key Metrics */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500 rounded-xl">
                      <CalendarDays className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Latest Footprint</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {currentFootprint.toFixed(1)} <span className="text-sm">tons CO₂e</span>
                      </p>
                      {latestCalculation && (
                        <p className="text-xs text-blue-600">
                          {format(new Date(latestCalculation.calculation_date), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500 rounded-xl">
                      <TrendingDown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-medium">Average Footprint</p>
                      <p className="text-2xl font-bold text-green-900">
                        {avgFootprint.toFixed(1)} <span className="text-sm">tons CO₂e</span>
                      </p>
                      <p className="text-xs text-green-600">
                        Based on {calculations.length} calculation{calculations.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500 rounded-xl">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-orange-600 font-medium">Climate Goal Progress</p>
                      <p className="text-2xl font-bold text-orange-900">{progressToTarget.toFixed(0)}%</p>
                      <p className="text-xs text-orange-600">Target: 2.3 tons CO₂e</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Climate Goal Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">Paris Agreement Goal</h3>
                      <p className="text-emerald-100">Limit global warming to 1.5°C</p>
                    </div>
                    <Badge className="bg-white/20 text-white border-white/30">
                      {currentFootprint <= globalTarget ? 'On Track!' : 'Needs Work'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current: {currentFootprint.toFixed(1)} tons</span>
                      <span>Target: {globalTarget} tons</span>
                    </div>
                    <Progress 
                      value={Math.min(progressToTarget, 100)} 
                      className="h-2 bg-green-400"
                    />
                    <p className="text-sm text-emerald-100">
                      {currentFootprint <= globalTarget 
                        ? "Congratulations! You're within the sustainable target."
                        : `Reduce by ${(currentFootprint - globalTarget).toFixed(1)} tons to reach the goal.`
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2"
              >
                <FootprintChart calculations={calculations} />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CategoryBreakdown latestCalculation={latestCalculation} />
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <RecentCalculations calculations={calculations} />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}