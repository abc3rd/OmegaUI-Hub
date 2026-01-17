import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Target, Heart } from "lucide-react";
import { format, differenceInDays, differenceInHours } from "date-fns";
import { motion } from "framer-motion";

export default function UrgentNeedBanner({ profile, onDonate }) {
  if (!profile.hasUrgentNeed || !profile.urgentNeedTitle) return null;

  const raisedAmount = profile.urgentNeedRaisedAmount || 0;
  const targetAmount = profile.urgentNeedAmount || 0;
  const progressPercent = targetAmount > 0 ? Math.min((raisedAmount / targetAmount) * 100, 100) : 0;
  const remaining = Math.max(targetAmount - raisedAmount, 0);

  // Calculate time remaining
  let timeRemaining = null;
  if (profile.urgentNeedDeadline) {
    const deadline = new Date(profile.urgentNeedDeadline);
    const now = new Date();
    const daysLeft = differenceInDays(deadline, now);
    const hoursLeft = differenceInHours(deadline, now);

    if (daysLeft > 0) {
      timeRemaining = `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`;
    } else if (hoursLeft > 0) {
      timeRemaining = `${hoursLeft} hour${hoursLeft > 1 ? 's' : ''} left`;
    } else {
      timeRemaining = "Deadline passed";
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="border-2 border-red-300 bg-gradient-to-r from-red-50 to-orange-50 shadow-lg overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-100 px-2 py-0.5 rounded">
                    Urgent Need
                  </span>
                  {timeRemaining && (
                    <span className="text-xs font-medium text-orange-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeRemaining}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-800">{profile.urgentNeedTitle}</h3>
                {profile.urgentNeedDescription && (
                  <p className="text-slate-600 mt-1">{profile.urgentNeedDescription}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    ${raisedAmount.toFixed(2)} raised
                  </span>
                  <span className="font-bold text-red-600">
                    ${remaining.toFixed(2)} needed
                  </span>
                </div>
                <Progress 
                  value={progressPercent} 
                  className="h-3 bg-red-100" 
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Target className="w-4 h-4" />
                    <span>Goal: ${targetAmount.toFixed(2)}</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    {progressPercent.toFixed(0)}% funded
                  </span>
                </div>
              </div>

              <Button 
                onClick={onDonate} 
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 h-12 text-base font-semibold shadow-md"
              >
                <Heart className="w-5 h-5 mr-2" fill="white" />
                Help Now - ${remaining.toFixed(2)} Needed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}