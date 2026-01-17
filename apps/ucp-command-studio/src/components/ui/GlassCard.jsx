import { cn } from "@/lib/utils";

export default function GlassCard({ children, className, hover = true, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-[#16161c]/80 backdrop-blur-xl",
        "shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
        hover && "transition-all duration-300 hover:border-[#2699fe]/30 hover:shadow-[#2699fe]/5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}