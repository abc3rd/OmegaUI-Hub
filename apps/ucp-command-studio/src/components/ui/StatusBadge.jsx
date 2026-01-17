import { cn } from "@/lib/utils";

const statusStyles = {
  draft: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  active: "bg-[#4bce2a]/20 text-[#4bce2a] border-[#4bce2a]/30",
  deprecated: "bg-[#c4653a]/20 text-[#c4653a] border-[#c4653a]/30",
  archived: "bg-gray-600/20 text-gray-400 border-gray-600/30",
  pending: "bg-[#2699fe]/20 text-[#2699fe] border-[#2699fe]/30",
  running: "bg-[#ea00ea]/20 text-[#ea00ea] border-[#ea00ea]/30 animate-pulse",
  completed: "bg-[#4bce2a]/20 text-[#4bce2a] border-[#4bce2a]/30",
  failed: "bg-red-500/20 text-red-300 border-red-500/30",
  verified: "bg-[#4bce2a]/20 text-[#4bce2a] border-[#4bce2a]/30",
  unverified: "bg-[#c4653a]/20 text-[#c4653a] border-[#c4653a]/30",
};

export default function StatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        statusStyles[status] || statusStyles.draft,
        className
      )}
    >
      {status}
    </span>
  );
}