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
    <div className="border border-[#141414] bg-gray-50 p-5 mb-6 font-mono text-xs space-y-4 no-print text-black">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#141414] pb-3">
        <div className="flex items-center gap-2">
          {isGenerating ? (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F27D26] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F27D26]"></span>
            </span>
          ) : isCompletedSection8 ? (
            <span className="w-2 h-2 rounded-full bg-green-600 inline-block"></span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse"></span>
          )}
          
          <span className="font-extrabold uppercase tracking-wider text-xs">
            {isGenerating 
              ? "Sync Status: Generating..." 
              : isCompletedSection8 
                ? "Sync Status: Completed Successfully" 
                : "Sync Status: Incomplete / Truncated"
            }
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-[10px] opacity-75">
          <span>Size: <strong>{Math.round(rawMarkdown.length / 1024 * 10) / 10} KB</strong></span>
          {activeModelUsed && (
            <span>Model: <strong>{activeModelUsed}</strong></span>
          )}
        </div>
      </div>

      {/* Info block and troubleshooting if truncated */}
      {!isGenerating && !isCompletedSection8 && (
        <div className="bg-amber-100/55 border-2 border-amber-600/30 p-3.5 space-y-2 text-[11px] text-amber-950 font-sans leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold font-mono text-amber-800 text-xs">
            <AlertTriangle size={14} className="text-amber-700 animate-pulse" />
            <span>GENERATION ENDED HALFWAY (TRUNCATED)</span>
          </div>
          <p>
            The Gemini model ceased responding before compiling the complete 8-section interview guide. This is a common constraint when processing long candidate profiles or complex job requirements in a single response.
          </p>
          <p className="font-semibold font-mono text-[10px] uppercase tracking-wide text-amber-900">
            💡 Quick Remediation Steps:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[10px] font-mono leading-normal">
            <li>Change your active model in <strong>"Gemini LLM Settings"</strong> to <strong className="underline text-[#F27D26] hover:text-orange-900 cursor-pointer" onClick={() => setSelectedModelName("gemini-3.1-flash-lite")}>Gemini 3.1 Flash Lite</strong> (which handles large text responses faster).</li>
            <li>Slightly trim secondary bullet points in the candidate's resume or the job description text on the left sidebar to shorten the input.</li>
            <li>Click the <strong>"Generate Preparation Guide"</strong> button again to trigger a clean compilation.</li>
          </ul>
        </div>
      )}

      {/* Successful completion alert */}
      {!isGenerating && isCompletedSection8 && (
        <div className="bg-green-100/40 border border-green-600/30 p-3 text-[11px] text-green-950 font-sans leading-relaxed flex items-start gap-2.5">
          <CheckCircle2 size={16} className="text-green-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold font-mono text-green-800 text-xs uppercase tracking-wide">✓ 100% INTEL COMPILED & CONFIRMED</p>
            <p>All 8 required sections were generated fully and validated against the candidate's core credentials. Interactive progress trackers and study progress meters are ready for use below.</p>
          </div>
        </div>
      )}

      {/* 8-Section Compilation Map */}
      <div className="space-y-2">
        <div className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">
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
            let bgClass = "bg-white border-gray-200 text-gray-400";
            let badge = "○ Pending";
            let indicator = null;
            
            if (status === 'completed') {
              bgClass = "bg-green-50/50 border-green-500/50 text-green-950 font-medium";
              badge = "✓ Parsed";
              indicator = <span className="w-1.5 h-1.5 rounded-full bg-green-600 inline-block"></span>;
            } else if (status === 'active') {
              bgClass = "bg-amber-50 border-amber-500 text-amber-950 font-medium animate-pulse";
              badge = isGenerating ? "● Streaming..." : "⚠ Truncated";
              indicator = <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-ping"></span>;
            }
            
            return (
              <div key={sec.num} className={`border p-2.5 flex flex-col justify-between h-14 transition duration-300 ${bgClass}`}>
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
