import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-slate-950 text-white">
      {/* 100% Crisp & High-Definition Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/land2biz_hd_hero.jpg"
          alt="LAND2BIZ Green Farmland & Solar Cold Storage"
          fill
          priority
          quality={100}
          className="object-cover object-center"
        />
        {/* Dark gradient overlay for text readability without pixel distortion */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/60" />
      </div>

      {/* Top Header Logo */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">LAND2BIZ</span>
        </div>
      </header>

      {/* Main Hero Content ON TOP of Sharp Background */}
      <main className="relative z-10 max-w-4xl w-full mx-auto px-6 py-16 flex flex-col items-center text-center space-y-6 my-auto">
        <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-emerald-400/30 text-xs font-black text-emerald-300 shadow-sm">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Simple Guide for Everyone • Zero Business Background Needed</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight text-white drop-shadow-md">
          Turn Your Land Into A <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">High-Profit Business</span>
        </h1>

        <p className="max-w-2xl text-slate-200 text-base sm:text-xl leading-relaxed font-medium drop-shadow-sm">
          Find out what business fits your land best, get 35% government money back, and get your bank loan approved easily.
        </p>

        <div className="pt-4">
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg sm:text-xl px-10 py-4.5 rounded-2xl transition-all shadow-2xl shadow-emerald-500/40 hover:scale-[1.03] active:scale-[0.99]"
          >
            <span>Let&apos;s Start</span>
            <ArrowRight className="w-6 h-6 stroke-[3]" />
          </Link>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-400 font-medium">
        <p>LAND2BIZ • Simple Pre-Investment Decision Platform for Landowners</p>
      </footer>
    </div>
  );
}
