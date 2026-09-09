import { Sidebar } from "./Sidebar";
import { Sprout, Sun, Wind, Trees } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-emerald-50/60 via-slate-50 to-teal-50/50 relative">
      {/* Environmental Ambient Glow Elements */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-emerald-300/20 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-0 left-64 w-[650px] h-[650px] bg-teal-300/20 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed top-1/3 left-1/2 w-[450px] h-[450px] bg-green-300/15 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Subtle Environmental Watermark Icons in Background */}
      <div className="fixed top-12 right-16 text-emerald-600/5 pointer-events-none z-0">
        <Trees className="w-96 h-96" />
      </div>
      <div className="fixed bottom-12 left-80 text-teal-600/5 pointer-events-none z-0">
        <Sprout className="w-80 h-80" />
      </div>
      <div className="fixed top-1/2 right-1/3 text-amber-500/5 pointer-events-none z-0">
        <Sun className="w-72 h-72" />
      </div>

      <Sidebar />
      
      <main className="flex-1 overflow-y-auto relative z-10">
        {children}
      </main>
    </div>
  );
}
