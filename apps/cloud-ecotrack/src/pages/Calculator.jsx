import React, { useState } from "react";
import { CarbonCalculation } from "@/entities/CarbonCalculation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Car, Home, UtensilsCrossed, Trash2, ShoppingBag, Calculator, Save, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import TransportationForm from "../components/calculator/TransportationForm";
import EnergyForm from "../components/calculator/EnergyForm";
import FoodForm from "../components/calculator/FoodForm";
import WasteForm from "../components/calculator/WasteForm";
import ConsumptionForm from "../components/calculator/ConsumptionForm";
import ResultsSummary from "../components/calculator/ResultsSummary";

const categories = [
  { id: 'transportation', title: 'Transportation', icon: Car, color: 'blue' },
  { id: 'energy', title: 'Home Energy', icon: Home, color: 'yellow' },
  { id: 'food', title: 'Food & Diet', icon: UtensilsCrossed, color: 'green' },
  { id: 'waste', title: 'Waste & Recycling', icon: Trash2, color: 'orange' },
  { id: 'consumption', title: 'Consumption', icon: ShoppingBag, color: 'purple' }
];

export default function CalculatorPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [calculationName, setCalculationName] = useState('');
  const [householdSize, setHouseholdSize] = useState(1);
  const [formData, setFormData] = useState({
    transportation: {},
    energy: {},
    food: {},
    waste: {},
    consumption: {}
  });
  const [results, setResults] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const updateFormData = (category, data) => {
    setFormData(prev => ({
      ...prev,
      [category]: { ...prev[category], ...data }
    }));
  };

  const calculateFootprint = () => {
    const calculations = {
      transportation: calculateTransportation(formData.transportation),
      energy: calculateEnergy(formData.energy),
      food: calculateFood(formData.food),
      waste: calculateWaste(formData.waste),
      consumption: calculateConsumption(formData.consumption)
    };

    const total = Object.values(calculations).reduce((sum, value) => sum + value, 0);
    
    setResults({
      total: total / householdSize, // Per person
      breakdown: calculations
    });
  };

  const calculateTransportation = (data) => {
    let total = 0;
    // Car emissions: miles * (1 / fuel_efficiency) * 19.6 lbs CO2 per gallon / 2000 lbs per ton
    total += (data.car_miles_per_year || 0) * (1 / (data.car_fuel_efficiency || 25)) * 19.6 / 2000;
    // Flights: short (500 miles avg), medium (1500 miles), long (3000 miles) * 0.53 lbs CO2 per mile / 2000
    total += (data.flights_short || 0) * 500 * 0.53 / 2000;
    total += (data.flights_medium || 0) * 1500 * 0.53 / 2000;
    total += (data.flights_long || 0) * 3000 * 0.53 / 2000;
    // Public transport: hours * 50 miles avg * 0.31 lbs CO2 per mile / 2000
    total += (data.public_transport_hours || 0) * 50 * 0.31 / 2000;
    return total;
  };

  const calculateEnergy = (data) => {
    let total = 0;
    // Electricity: kWh * 0.92 lbs CO2 / 2000 * 12 months
    const renewableFactor = 1 - ((data.renewable_percentage || 0) / 100);
    total += (data.electricity_kwh_month || 0) * 0.92 * renewableFactor / 2000 * 12;
    // Natural gas: therms * 11.7 lbs CO2 / 2000 * 12 months
    total += (data.natural_gas_therms_month || 0) * 11.7 / 2000 * 12;
    // Heating oil: gallons * 22.4 lbs CO2 / 2000
    total += (data.heating_oil_gallons_year || 0) * 22.4 / 2000;
    return total;
  };

  const calculateFood = (data) => {
    let total = 0;
    // Meat meals: per week * 52 weeks * 6.6 lbs CO2 per meal / 2000
    total += (data.meat_meals_per_week || 0) * 52 * 6.6 / 2000;
    // Dairy: servings per day * 365 * 2.5 lbs CO2 per serving / 2000
    total += (data.dairy_servings_per_day || 0) * 365 * 2.5 / 2000;
    // Local food reduces emissions by up to 20%
    const localFactor = 1 - ((data.local_food_percentage || 0) / 100 * 0.2);
    total *= localFactor;
    // Food waste multiplier
    const wasteFactor = {low: 1.1, medium: 1.25, high: 1.4}[data.food_waste_level] || 1.25;
    total *= wasteFactor;
    return total;
  };

  const calculateWaste = (data) => {
    let baseWaste = 4.5; // tons CO2e per person per year from average waste
    const recyclingReduction = {none: 0, some: 0.2, most: 0.4, all: 0.6}[data.recycling_level] || 0.2;
    const compostReduction = data.composting ? 0.3 : 0;
    const singleUseIncrease = {rarely: 0, sometimes: 0.5, often: 1.0}[data.single_use_items] || 0.5;
    
    return baseWaste * (1 - recyclingReduction - compostReduction) + singleUseIncrease;
  };

  const calculateConsumption = (data) => {
    let total = 0;
    // Clothing: purchases per month * 12 * 30 lbs CO2 per item / 2000
    total += (data.clothing_purchases_per_month || 0) * 12 * 30 / 2000;
    // Electronics: purchases per year * 300 lbs CO2 per item / 2000
    total += (data.electronics_purchases_per_year || 0) * 300 / 2000;
    // Second-hand reduces emissions by 80%
    const secondHandFactor = 1 - ((data.second_hand_percentage || 0) / 100 * 0.8);
    total *= secondHandFactor;
    return total;
  };

  const handleSave = async () => {
    if (!calculationName.trim() || !results) return;
    
    setIsSaving(true);
    try {
      await CarbonCalculation.create({
        calculation_name: calculationName,
        calculation_date: new Date().toISOString().split('T')[0],
        household_size: householdSize,
        transportation: formData.transportation,
        energy: formData.energy,
        food: formData.food,
        waste: formData.waste,
        consumption: formData.consumption,
        total_footprint_tons: results.total,
        category_breakdown: results.breakdown
      });
      
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Error saving calculation:", error);
    }
    setIsSaving(false);
  };

  const progress = ((currentStep + (results ? 1 : 0)) / (categories.length + 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Carbon Footprint Calculator</h1>
          <p className="text-gray-600 text-lg">Discover your environmental impact and learn how to reduce it</p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </motion.div>

        <AnimatePresence mode="wait">
          {currentStep < categories.length && (
            <motion.div
              key={`step-${currentStep}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                <CardHeader className="text-center pb-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    {React.createElement(categories[currentStep].icon, {
                      className: "w-8 h-8 text-green-600"
                    })}
                    <CardTitle className="text-2xl text-gray-900">
                      {categories[currentStep].title}
                    </CardTitle>
                  </div>
                  <p className="text-gray-600">
                    Step {currentStep + 1} of {categories.length}
                  </p>
                </CardHeader>
                <CardContent>
                  {currentStep === 0 && (
                    <TransportationForm 
                      data={formData.transportation}
                      onChange={(data) => updateFormData('transportation', data)}
                    />
                  )}
                  {currentStep === 1 && (
                    <EnergyForm 
                      data={formData.energy}
                      onChange={(data) => updateFormData('energy', data)}
                    />
                  )}
                  {currentStep === 2 && (
                    <FoodForm 
                      data={formData.food}
                      onChange={(data) => updateFormData('food', data)}
                    />
                  )}
                  {currentStep === 3 && (
                    <WasteForm 
                      data={formData.waste}
                      onChange={(data) => updateFormData('waste', data)}
                    />
                  )}
                  {currentStep === 4 && (
                    <ConsumptionForm 
                      data={formData.consumption}
                      onChange={(data) => updateFormData('consumption', data)}
                    />
                  )}

                  <div className="flex justify-between mt-8">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      disabled={currentStep === 0}
                    >
                      Previous
                    </Button>
                    <Button 
                      onClick={() => {
                        if (currentStep === categories.length - 1) {
                          calculateFootprint();
                        } else {
                          setCurrentStep(currentStep + 1);
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {currentStep === categories.length - 1 ? (
                        <>
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate Impact
                        </>
                      ) : (
                        'Next Step'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {results && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="space-y-6">
                <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0">
                  <CardHeader className="text-center">
                    <CardTitle className="text-3xl text-gray-900 mb-2">Your Carbon Footprint</CardTitle>
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <Label htmlFor="calc-name">Calculation Name:</Label>
                      <Input
                        id="calc-name"
                        value={calculationName}
                        onChange={(e) => setCalculationName(e.target.value)}
                        placeholder="e.g., 2024 Annual Assessment"
                        className="max-w-xs"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <Label htmlFor="household">Household Size:</Label>
                      <Select value={householdSize.toString()} onValueChange={(v) => setHouseholdSize(Number(v))}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8].map(n => (
                            <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResultsSummary results={results} />
                    
                    <div className="flex justify-center gap-4 mt-8">
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentStep(0)}
                      >
                        Recalculate
                      </Button>
                      <Button 
                        onClick={handleSave}
                        disabled={!calculationName.trim() || isSaving}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isSaving ? (
                          <>
                            <Zap className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Results
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}