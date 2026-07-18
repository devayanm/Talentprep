import React, { useState, useEffect } from "react";
import { AlertCircle, ShieldCheck } from "lucide-react";

interface HeaderProps {
  hasApiKey: boolean | null;
  viewPage?: 'home' | 'workspace';
  onGoHome?: () => void;
}

export default function Header({ hasApiKey, viewPage, onGoHome }: HeaderProps) {
  const [utcTime, setUtcTime] = useState("");
  const [localTime, setLocalTime] = useState("");
  const [locationLabel, setLocationLabel] = useState("LOCAL");

  useEffect(() => {
    // Compute timezone and GMT offset label once on mount
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const cityName = tz ? tz.split('/').pop()?.replace(/_/g, ' ') : 'Local';
      
      const offset = -new Date().getTimezoneOffset();
      const sign = offset >= 0 ? "+" : "-";
      const absOffset = Math.abs(offset);
      const hours = Math.floor(absOffset / 60);
      const minutes = absOffset % 60;
      const gmtString = `GMT${sign}${hours}${minutes !== 0 ? `:${minutes.toString().padStart(2, "0")}` : ""}`;
      
      setLocationLabel(`${cityName ? cityName.toUpperCase() : "LOCAL"} (${gmtString})`);
    } catch (e) {
      setLocationLabel("LOCAL");
    }

    const updateTimes = () => {
      const now = new Date();
      setUtcTime(now.toISOString().slice(11, 19));
      setLocalTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    };
    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="glass-panel border-b border-white/10 h-16 px-6 flex items-center justify-between no-print z-50 sticky top-0 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Glow indicator logo */}
        <div 
          onClick={onGoHome}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="relative flex items-center justify-center">
            <div className="w-3.5 h-3.5 bg-gradient-to-tr from-orange-500 to-pink-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(242,125,38,0.6)] group-hover:scale-110 transition-transform"></div>
            <div className="absolute w-5 h-5 border border-orange-500/30 rounded-full animate-ping opacity-70"></div>
          </div>
          <span className="font-sans font-black tracking-tight text-lg text-white group-hover:text-orange-400 transition-colors">
            TALENTPREP <span className="text-orange-500 font-extrabold">PRO</span> <span className="font-mono text-xs font-light text-slate-400 opacity-60 ml-2">/ V2.5</span>
          </span>
        </div>

        {viewPage === "workspace" && onGoHome && (
          <button
            onClick={onGoHome}
            className="hidden sm:flex items-center gap-1.5 ml-6 px-3 py-1.5 bg-white/5 border border-white/10 hover:border-orange-500/30 hover:bg-white/10 text-xs font-mono font-bold text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            ← Back to Home
          </button>
        )}
      </div>
      
      <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
        {hasApiKey === false && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-lg backdrop-blur-xs">
            <AlertCircle size={13} className="text-rose-400 animate-bounce" />
            <span>Missing API Key. Add key in Settings &gt; Secrets</span>
          </div>
        )}
        {hasApiKey === true && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-lg backdrop-blur-xs shadow-[0_0_8px_rgba(16,185,129,0.15)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse shadow-[0_0_6px_#10b981]"></span>
            <span className="font-bold flex items-center gap-1">ENGINE: ACTIVE <ShieldCheck size={12} className="text-emerald-400" /></span>
          </div>
        )}
        <span className="text-slate-400 hidden sm:inline border-l border-white/10 pl-4">MODE: SYNC</span>
        <span className="text-slate-400 hidden md:inline border-l border-white/10 pl-4">UTC: <span className="text-orange-400 font-bold">{utcTime}</span></span>
        <span className="text-slate-400 border-l border-white/10 pl-4">{locationLabel}: <span className="text-pink-400 font-bold">{localTime}</span></span>
      </div>
    </header>
  );
}

