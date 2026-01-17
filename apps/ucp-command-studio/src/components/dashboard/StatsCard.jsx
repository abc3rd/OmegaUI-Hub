import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import GlassCard from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, trendUp, href }) {
  const content = (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        )}
        {trend && (
          <p className={cn(
            "mt-2 text-sm font-medium",
            trendUp ? "text-emerald-400" : "text-red-400"
          )}>
            {trendUp ? "↑" : "↓"} {trend}
          </p>
        )}
      </div>
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#ea00ea]/20 to-[#2699fe]/20 border border-[#ea00ea]/20">
          <Icon className="h-6 w-6 text-[#2699fe]" />
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link to={createPageUrl(href)}>
        <GlassCard className="p-6 cursor-pointer hover:border-[#2699fe]/50 transition-colors">
          {content}
        </GlassCard>
      </Link>
    );
  }

  return (
    <GlassCard className="p-6">
      {content}
    </GlassCard>
  );
}