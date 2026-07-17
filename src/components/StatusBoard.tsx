import React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface StatusBoardProps {
  rawMarkdown: string;
  isGenerating: boolean;
  activeModelUsed: string | null;
  getSectionStatus: (secNum: number) => 'completed' | 'active' | 'pending';
  setSelectedModelName: (model: string) => void;
}

export default function StatusBoard({
  rawMarkdown,
  isGenerating,
  activeModelUsed,
  getSectionStatus,
  setSelectedModelName,
}: StatusBoardProps) {
  if (!rawMarkdown && !isGenerating) return null;

  const isCompletedSection8 = rawMarkdown.toLowerCase().includes("section 8:");

  return (
    <div className="glass-panel rounded-2xl p-5 mb-6 font-mono text-xs space-y-4 no-print text-white bg-slate-900/30 border border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          {isGenerating ? (
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500 shadow-[0_0_8px_#f97316]"></span>
            </span>
          ) : isCompletedSection8 ? (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_6px_#10b981]"></span>
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block animate-pulse shadow-[0_0_6px_#f59e0b]"></span>
          )}
          
          <span className="font-sans font-black uppercase tracking-wider text-xs">
            {isGenerating 
              ? "Sync Status: Generating Prep Guide..." 
              : isCompletedSection8 
                ? "Sync Status: Intel Verified & Complete" 
                : "Sync Status: Partial Sync (Truncated)"
            }
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span>Size: <strong className="text-white">{Math.round(rawMarkdown.length / 1024 * 10) / 10} KB</strong></span>
          {activeModelUsed && (
            <span>Model: <strong className="text-white">{activeModelUsed}</strong></span>
          )}
        </div>
      </div>

      {/* Info block and troubleshooting if truncated */}
      {!isGenerating && !isCompletedSection8 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 space-y-2 text-[11px] text-amber-200 font-sans leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold font-mono text-amber-400 text-xs">
            <AlertTriangle size={14} className="text-amber-400 animate-pulse" />
            <span>GENERATION ENDED HALFWAY (TRUNCATED)</span>
          </div>
          <p>
            The Gemini model ceased responding before compiling the complete 8-section interview guide. This is a common constraint when processing long candidate profiles or complex job requirements in a single response.
          </p>
          <p className="font-semibold font-mono text-[10px] uppercase tracking-wide text-amber-400">
            💡 Quick Remediation Steps:
          </p>
          <ul className="list-disc pl-4 space-y-1.5 text-[10px] font-mono leading-normal text-amber-200/90">
            <li>Change your active model in <strong>"Gemini LLM Settings"</strong> to <strong className="underline text-orange-400 hover:text-orange-300 cursor-pointer" onClick={() => setSelectedModelName("gemini-3.1-flash-lite")}>Gemini 3.1 Flash Lite</strong> (which handles large text responses faster).</li>
            <li>Slightly trim secondary bullet points in the candidate's resume or the job description text on the left sidebar to shorten the input.</li>
            <li>Click the <strong>"Generate Preparation Guide"</strong> button again to trigger a clean compilation.</li>
          </ul>
        </div>
      )}

      {/* Successful completion alert */}
      {!isGenerating && isCompletedSection8 && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 text-[11px] text-emerald-200 font-sans leading-relaxed flex items-start gap-2.5">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold font-mono text-emerald-400 text-xs uppercase tracking-wide">✓ 100% INTEL COMPILED & CONFIRMED</p>
            <p className="text-slate-300">All 8 required sections were generated fully and validated against the candidate's core credentials. Interactive progress trackers and study progress meters are ready for use below.</p>
          </div>
        </div>
      )}

      {/* 8-Section Compilation Map */}
      <div className="space-y-3">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          8-Section Preparation Checklist Map
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { num: 1, label: "Resume Check" },
            { num: 2, label: "Core Technical" },
            { num: 3, label: "Infrastructure" },
            { num: 4, label: "Database" },
            { num: 5, label: "Architecture" },
            { num: 6, label: "Scenario Core" },
            { num: 7, label: "Behavioral" },
            { num: 8, label: "Interviewer Ask" },
          ].map(sec => {
            const status = getSectionStatus(sec.num);
            let bgClass = "bg-white/3 border-white/5 text-slate-500";
            let badge = "○ Pending";
            let indicator = null;
            
            if (status === 'completed') {
              bgClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-200 font-medium";
              badge = "✓ Parsed";
              indicator = <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_4px_#34d399]"></span>;
            } else if (status === 'active') {
              bgClass = "bg-orange-500/10 border-orange-500/30 text-orange-200 font-medium animate-pulse";
              badge = isGenerating ? "● Streaming..." : "⚠ Truncated";
              indicator = <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block animate-ping"></span>;
            }
            
            return (
              <div key={sec.num} className={`border p-2.5 rounded-xl flex flex-col justify-between h-14 transition-all duration-300 ${bgClass}`}>
                <div className="font-bold text-[10px] truncate leading-tight">
                  Sec {sec.num}: {sec.label}
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono opacity-80 mt-1">
                  {indicator}
                  <span>{badge}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

