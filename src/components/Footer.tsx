import React from "react";

export default function Footer() {
  return (
    <footer className="no-print border-t border-white/10 h-10 px-6 flex items-center justify-between text-[10px] font-mono bg-slate-950/80 text-slate-400 z-10">
      <div>© {new Date().getFullYear()} TalentPrep Pro</div>
      <div className="hidden sm:block">SYSTEM: SECURE CONTEXT</div>
      <div>POWERED BY GEMINI AI</div>
    </footer>
  );
}

