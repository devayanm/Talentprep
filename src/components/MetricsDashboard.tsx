import React from "react";
import { CheckSquare, HelpCircle, Building2, Globe } from "lucide-react";

interface MetricsDashboardProps {
  rawMarkdown: string;
  totalQuestionsCount: number;
  completedQuestionsCount: number;
  completionPercentage: number;
  vendorName: string;
  domain: string;
}

export default function MetricsDashboard({
  rawMarkdown,
  totalQuestionsCount,
  completedQuestionsCount,
  completionPercentage,
  vendorName,
  domain,
}: MetricsDashboardProps) {
  if (!rawMarkdown) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-white">
      <div className="glass-card p-4 rounded-xl flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white/5 text-orange-400">
          <HelpCircle size={16} />
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wide text-slate-400">Total Questions</div>
          <div className="text-lg font-black font-mono mt-0.5 text-white">
            {totalQuestionsCount || "Counting..."}
          </div>
        </div>
      </div>
      
      <div className="glass-card p-4 rounded-xl flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white/5 text-emerald-400">
          <CheckSquare size={16} />
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wide text-slate-400">Study Progress</div>
          <div className="text-sm font-black font-mono text-emerald-400 mt-0.5">
            {completedQuestionsCount}/{totalQuestionsCount} ({completionPercentage}%)
          </div>
        </div>
      </div>

      <div className="glass-card p-4 rounded-xl flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white/5 text-pink-400">
          <Building2 size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-mono uppercase tracking-wide text-slate-400">Vendor Partner</div>
          <div className="text-xs font-bold font-mono truncate mt-1 text-white">
            {vendorName || "Centraprise"}
          </div>
        </div>
      </div>

      <div className="glass-card p-4 rounded-xl flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white/5 text-cyan-400">
          <Globe size={16} />
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wide text-slate-400">Compliance</div>
          <div className="text-xs font-bold font-mono mt-1 text-white">
            {domain} Domain
          </div>
        </div>
      </div>
    </div>
  );
}

