import React from "react";
import { QuestionBank } from "../types";

interface PrintLayoutProps {
  parsedBank: QuestionBank | null;
  vendorName: string;
  candidateName: string;
  targetClient: string;
  targetRole: string;
  domain: string;
  basicDiff: number;
  intermediateDiff: number;
  advancedDiff: number;
  userProgress: Record<string, { completed: boolean; notes: string }>;
  visible?: boolean;
}

export default function PrintLayout({
  parsedBank,
  vendorName,
  candidateName,
  targetClient,
  targetRole,
  domain,
  basicDiff,
  intermediateDiff,
  advancedDiff,
  userProgress,
  visible = false,
}: PrintLayoutProps) {
  if (!parsedBank) return null;

  return (
    <div className={`${visible ? "block" : "hidden print:block"} bg-white text-black p-4 font-sans max-w-4xl mx-auto space-y-5`}>
      {/* Top Header Information Block */}
      <div className="border border-[#141414] p-5 space-y-4 bg-gray-50/50">
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold tracking-tight uppercase leading-none text-black">
            Interview Preparation Kit
          </h1>
          <p className="text-xs font-mono text-gray-500 uppercase">
            Technical &amp; Scenario-Based Interview Question Bank
          </p>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 pt-3 text-xs font-mono border-t border-dashed border-gray-300">
          <div>
            <span className="text-[9px] text-gray-500 uppercase block font-bold">PREPARED FOR (CANDIDATE)</span>
            <strong className="text-sm uppercase block text-black">{candidateName || "Candidate Profile"}</strong>
          </div>
          <div>
            <span className="text-[9px] text-gray-500 uppercase block font-bold">TARGET ROLE &amp; DOMAIN</span>
            <strong className="text-sm uppercase block text-black">{targetRole || "Technical Role"} ({domain || "General"})</strong>
          </div>
          <div>
            <span className="text-[9px] text-gray-500 uppercase block font-bold">CLIENT</span>
            <strong className="text-sm uppercase block text-black">{targetClient || "Direct Client"}</strong>
          </div>
          <div>
            <span className="text-[9px] text-gray-500 uppercase block font-bold">VENDOR</span>
            <strong className="text-sm uppercase block text-black">{vendorName || "Staffing Partner"}</strong>
          </div>
          <div className="col-span-2">
            <span className="text-[9px] text-gray-500 uppercase block font-bold">INTERVIEW METRICS &amp; DIFFICULTY DISTRIBUTION</span>
            <strong className="text-xs uppercase block text-black">
              {basicDiff}% Basic / {intermediateDiff}% Intermediate / {advancedDiff}% Advanced (B/I/A Ratio)
            </strong>
          </div>
        </div>
      </div>

      {/* Continuous Questions Flow */}
      <div className="space-y-5">
        {parsedBank.sections.map((section) => (
          <div key={section.id} className="space-y-3 animate-fade-in">
            {/* Section Header */}
            <div className="border-b border-[#141414] pb-1 flex items-baseline justify-between mt-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider font-mono text-[#F27D26]">
                {section.title}
              </h2>
              <span className="text-[10px] font-mono text-gray-500 shrink-0 uppercase">
                Budget: {section.questions.length} Questions
              </span>
            </div>

            {/* Questions list */}
            <div className="space-y-3">
              {section.questions.map((question) => {
                const state = userProgress[question.id] || { completed: false, notes: '' };
                return (
                  <div key={question.id} className="avoid-break space-y-1">
                    <p className="text-xs font-mono font-medium text-black leading-relaxed">
                      <span className="font-extrabold mr-1.5">{question.id}.</span>
                      {question.text}
                    </p>
                    {state.notes && (
                      <div className="bg-gray-50 border-l-2 border-gray-400 p-2 text-[10px] font-mono italic text-gray-700">
                        <strong>My Notes:</strong> {state.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

