import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Home, UtensilsCrossed, Heart, Car, GraduationCap, AlertTriangle, MoreHorizontal, Calendar, RefreshCw } from "lucide-react";
import { format } from "date-fns";

const categoryConfig = {
  housing: { icon: Home, color: "bg-blue-100 text-blue-700" },
  food: { icon: UtensilsCrossed, color: "bg-orange-100 text-orange-700" },
  medical: { icon: Heart, color: "bg-red-100 text-red-700" },
  transportation: { icon: Car, color: "bg-purple-100 text-purple-700" },
  education: { icon: GraduationCap, color: "bg-teal-100 text-teal-700" },
  emergency: { icon: AlertTriangle, color: "bg-amber-100 text-amber-700" },
  other: { icon: MoreHorizontal, color: "bg-slate-100 text-slate-700" }
};

const GoalCard = ({ goal, onDonate }) => {
  const config = categoryConfig[goal.category] || categoryConfig.other;
  const Icon = config.icon;
  const progressPercent = goal.targetAmount > 0 
    ? Math.min((goal.raisedAmount / goal.targetAmount) * 100, 100) 
    : 0;
  const remaining = Math.max(goal.targetAmount - goal.raisedAmount, 0);
  const isCompleted = goal.status === "completed" || progressPercent >= 100;

  return (
    <Card className={`border-2 transition-all hover:shadow-md ${isCompleted ? 'border-green-200 bg-green-50/50' : 'border-slate-200'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-slate-800">{goal.title}</h4>
                {goal.isRecurring && (
                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    {goal.recurringPeriod}
                  </Badge>
                )}
                {isCompleted && (
                  <Badge className="bg-green-500 text-white text-xs">Completed!</Badge>
                )}
              </div>
              {goal.description && (
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">{goal.description}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Progress value={progressPercent} className="h-2" />
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">
                  ${(goal.raisedAmount || 0).toFixed(2)} of ${goal.targetAmount.toFixed(2)}
                </span>
                <span className="font-medium text-green-600">
                  {progressPercent.toFixed(0)}%
                </span>
              </div>
            </div>

            {goal.deadline && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar className="w-3 h-3" />
                <span>Due: {format(new Date(goal.deadline), 'MMM d, yyyy')}</span>
              </div>
            )}

            {!isCompleted && onDonate && (
              <Button 
                onClick={() => onDonate(goal)} 
                size="sm" 
                className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Contribute ${remaining.toFixed(2)} needed
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CustomGoalsSection({ goals, onDonate }) {
  if (!goals || goals.length === 0) return null;

  const activeGoals = goals.filter(g => g.status === "active");
  const completedGoals = goals.filter(g => g.status === "completed");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-semibold text-slate-800">Funding Goals</h2>
      </div>

      {activeGoals.length > 0 && (
        <div className="space-y-3">
          {activeGoals.map(goal => (
            <GoalCard key={goal.id} goal={goal} onDonate={onDonate} />
          ))}
        </div>
      )}

      {completedGoals.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Recently Completed
          </h3>
          <div className="space-y-2">
            {completedGoals.slice(0, 3).map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}