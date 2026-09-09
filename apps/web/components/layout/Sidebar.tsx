'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, Map, MapPin, TrendingUp, Briefcase, 
  IndianRupee, CheckSquare, FileText, Sparkles 
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/onboarding", label: "1. Land Details", icon: MapPin },
  { href: "/site", label: "2. Check Site", icon: Map },
  { href: "/market-analysis", label: "3. Business Ideas", icon: TrendingUp },
  { href: "/opportunities", label: "4. Best Choice", icon: Briefcase },
  { href: "/finance", label: "5. Money & Subsidy", icon: IndianRupee },
  { href: "/plan", label: "6. Business Plan", icon: FileText },
  { href: "/final", label: "7. Final Certificate", icon: CheckSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  if (pathname === "/") return null; // Don't show sidebar on landing page

  return (
    <div className="flex h-full w-64 flex-col border-r border-emerald-100 bg-white shadow-xs">
      <div className="flex h-16 items-center border-b border-emerald-100/80 px-5 bg-gradient-to-r from-emerald-50/50 to-white">
        <span className="text-xl font-black text-emerald-950 tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" /> LAND2BIZ
        </span>
      </div>
      <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
        {NAV_ITEMS.slice(1).map((item) => {
          const isActive = pathname.startsWith(item.href) && item.href !== "/";
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all",
                isActive 
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20 font-extrabold" 
                  : "text-slate-700 hover:bg-emerald-50/60 hover:text-emerald-900"
              )}
            >
              <Icon className={cn("mr-3 h-4 w-4", isActive ? "text-white" : "text-emerald-600/70")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-emerald-100/80 p-4 text-[11px] font-bold text-emerald-800/60 bg-emerald-50/30">
        <p>Simple Land Business Guide</p>
      </div>
    </div>
  );
}
