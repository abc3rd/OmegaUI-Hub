import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Play,
  Share2,
  ScrollText,
  Settings,
  Zap,
  Home,
  FolderOpen,
  FileText,
  Key,
  X,
} from "lucide-react";

const navigation = [
  { name: "Landing Page", href: "Landing", icon: Home },
  { name: "Dashboard", href: "Dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "Projects", icon: FolderOpen },
  { name: "Templates", href: "Templates", icon: FileText },
  { name: "Create Packet", href: "CreatePacket", icon: PlusCircle },
  { name: "Packet Library", href: "PacketLibrary", icon: Package },
  { name: "Execute", href: "ExecutePacket", icon: Play },
  { name: "Share & Verify", href: "ShareVerify", icon: Share2 },
  { name: "Keys", href: "KeyManagement", icon: Key },
  { name: "Audit Logs", href: "AuditLogs", icon: ScrollText },
  { name: "Settings", href: "Settings", icon: Settings },
];

export default function Sidebar({ currentPage, isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen w-64 border-r border-white/10 bg-[#0f0f13]/95 backdrop-blur-xl transition-transform duration-300",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#ea00ea] to-[#2699fe]">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">UCP Command</h1>
              <p className="text-[10px] text-slate-400">Studio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = currentPage === item.href;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.href)}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-[#ea00ea]/20 to-[#2699fe]/20 text-[#2699fe] border border-[#2699fe]/30"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive && "text-[#ea00ea]")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          <p className="text-[10px] text-gray-500 text-center">
            Omega UI, LLC © 2025
          </p>
        </div>
      </div>
    </aside>
    </>
  );
}