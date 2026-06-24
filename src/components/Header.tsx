import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

interface HeaderProps {
  hasApiKey: boolean | null;
}

export default function Header({ hasApiKey }: HeaderProps) {
  const [utcTime, setUtcTime] = useState("");

  useEffect(() => {
    const updateUtcTime = () => {
      setUtcTime(new Date().toISOString().slice(11, 19));
    };
    updateUtcTime();
    const interval = setInterval(updateUtcTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-[#141414] h-14 px-6 flex items-center justify-between no-print bg-[#E4E3E0] z-10 sticky top-0">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 bg-[#F27D26] border border-[#141414]"></div>
        <span className="font-extrabold tracking-tight text-lg">
          TALENTPREP PRO <span className="font-light opacity-60">/ V.2.4</span>
        </span>
      </div>
      
      <div className="flex items-center gap-4 text-xs font-mono">
        {hasApiKey === false && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded">
            <AlertCircle size={13} />
            <span>Missing API Key. Add key in Settings &gt; Secrets</span>
          </div>
        )}
        {hasApiKey === true && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-700 border border-[#141414]">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
            <span>ENGINE: ONLINE</span>
          </div>
        )}
        <span className="opacity-50 hidden sm:inline">MODE: RESUME_JD_SYNC</span>
        <span className="opacity-50">UTC: {utcTime}</span>
      </div>
    </header>
  );
}
