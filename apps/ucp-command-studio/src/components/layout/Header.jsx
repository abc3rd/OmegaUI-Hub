import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, ChevronDown, LogOut, User, Settings } from "lucide-react";

export default function Header({ title, subtitle }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#0f0f13]/60 backdrop-blur-xl px-8">
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-slate-300 hover:text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#ea00ea] to-[#2699fe]">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm">{user?.full_name || "User"}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#16161c] border-white/10">
            <div className="px-2 py-2 border-b border-white/10">
              <p className="text-sm font-medium text-white">{user?.full_name || "User"}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
            <DropdownMenuItem 
              className="text-slate-300 focus:text-white focus:bg-white/10 cursor-pointer"
              onClick={() => navigate(createPageUrl("Profile"))}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-slate-300 focus:text-white focus:bg-white/10 cursor-pointer"
              onClick={() => navigate(createPageUrl("Settings"))}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem 
              className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
              onClick={() => base44.auth.logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}