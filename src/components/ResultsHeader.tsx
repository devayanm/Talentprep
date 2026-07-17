import React from "react";
import { Printer, RotateCcw, Award } from "lucide-react";

interface ResultsHeaderProps {
  candidateName: string;
  targetRole: string;
  targetClient: string;
  domain: string;
  activeModelUsed: string | null;
  rawMarkdown: string;
  triggerPrint: () => void;
  resetProgress: () => void;
}

export default function ResultsHeader({
  candidateName,
  targetRole,
  targetClient,
  domain,
  activeModelUsed,
  rawMarkdown,
  triggerPrint,
  resetProgress,
}: ResultsHeaderProps) {
  return (
    <div className="bg-slate-900/40 p-6 border-b border-white/10 flex flex-col gap-4 text-white backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
            Intelligence Analysis Results
          </span>
          <h1 className="text-xl font-sans font-black tracking-tight uppercase text-white flex items-center gap-2">
            <Award size={20} className="text-orange-400" />
            {candidateName ? `${candidateName} Prep Guide` : "Candidate Interview Intel"}
          </h1>
          <p className="text-xs text-slate-300 mt-1.5 font-mono">
            Target: <span className="text-orange-300 font-bold">{targetRole || "Senior Role"}</span> at <span className="text-white font-bold">{targetClient || "Direct Client"}</span> <span className="text-slate-500 font-normal">({domain} Domain)</span>
          </p>
          {activeModelUsed && (
            <div className="inline-flex items-center gap-1.5 mt-3 bg-white/5 px-2.5 py-1 border border-white/10 rounded-lg text-[10px] font-mono uppercase tracking-wide text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block shadow-[0_0_6px_#34d399]"></span>
              <span>Processed via: <strong className="text-white">{activeModelUsed}</strong></span>
            </div>
          )}
        </div>
 
        {/* Top Controls: Print & Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {rawMarkdown && (
            <>
              <button
                onClick={triggerPrint}
                className="px-4 py-2 glass-button text-xs font-mono font-bold text-white rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={13} className="text-orange-400" />
                <span>Print / Export PDF</span>
              </button>
              <button
                onClick={resetProgress}
                title="Reset Study Progress"
                className="p-2.5 glass-button text-xs text-slate-300 rounded-lg transition flex items-center cursor-pointer hover:text-white"
              >
                <RotateCcw size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

