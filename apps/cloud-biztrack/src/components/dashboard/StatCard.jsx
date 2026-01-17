import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function StatCard({ title, value, change, changeType, icon: Icon, gradient }) {
  const isPositive = changeType === "positive";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-6",
        "bg-white border border-slate-100",
        "shadow-sm hover:shadow-lg transition-all duration-300"
      )}
    >
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10",
        gradient
      )} />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500 tracking-wide uppercase">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">
            {value}
          </p>
          {change && (
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "text-sm font-semibold",
                isPositive ? "text-emerald-600" : "text-rose-500"
              )}>
                {isPositive ? "+" : ""}{change}%
              </span>
              <span className="text-xs text-slate-400">vs last period</span>
            </div>
          )}
        </div>
        
        <div className={cn(
          "p-3 rounded-xl",
          gradient,
          "bg-opacity-10"
        )}>
          <Icon className={cn(
            "w-6 h-6",
            gradient.includes("emerald") ? "text-emerald-600" :
            gradient.includes("rose") ? "text-rose-500" :
            gradient.includes("blue") ? "text-blue-600" :
            "text-amber-500"
          )} />
        </div>
      </div>
    </motion.div>
  );
}