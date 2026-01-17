import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart } from "lucide-react";
import { addDays } from "date-fns";
import AnalyticsSummaryCards from "../components/analytics/AnalyticsSummaryCards";
import ConsumptionByTypeChart from "../components/analytics/ConsumptionByTypeChart";
import HistoricalTrendChart from "../components/analytics/HistoricalTrendChart";
import UsageDistributionPieChart from "../components/analytics/UsageDistributionPieChart";
import DateRangePicker from "../components/analytics/DateRangePicker";

export default function Analytics() {
    const [readings, setReadings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [date, setDate] = useState({
        from: addDays(new Date(), -30),
        to: new Date(),
    });

    const loadReadings = useCallback(async () => {
        setIsLoading(true);
        const allReadings = await base44.entities.EnergyReading.list("-timestamp");
        const filtered = allReadings.filter(r => {
            const readingDate = new Date(r.timestamp);
            return (!date.from || readingDate >= date.from) && (!date.to || readingDate <= date.to);
        });
        setReadings(filtered);
        setIsLoading(false);
    }, [date]);

    useEffect(() => {
        loadReadings();
    }, [loadReadings]);
    
    return (
        <div className="p-6 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
                    <BarChart className="w-6 h-6 text-blue-300" />
                    <h1 className="text-3xl font-bold text-white">Usage Analytics</h1>
                </div>
                <DateRangePicker date={date} onDateChange={setDate} />
            </div>

            <AnalyticsSummaryCards readings={readings} isLoading={isLoading} />

            <div className="grid lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <HistoricalTrendChart readings={readings} isLoading={isLoading} />
                </div>
                <div className="lg:col-span-2">
                    <UsageDistributionPieChart readings={readings} isLoading={isLoading} />
                </div>
            </div>
            
            <div>
              <ConsumptionByTypeChart readings={readings} isLoading={isLoading} />
            </div>

        </div>
    );
}