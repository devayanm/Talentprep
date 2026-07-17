import React from "react";
import { CheckCircle2, AlertTriangle, Copy, Layers, ListChecks, Terminal } from "lucide-react";
import { QuestionBank } from "../types";

interface QuestionBankViewerProps {
  parsedBank: QuestionBank | null;
  searchQuery: string;
  userProgress: Record<string, { completed: boolean; notes: string }>;
  toggleCompleted: (qId: number) => void;
  updateNotes: (qId: number, notes: string) => void;
  activeTab: 'interactive' | 'markdown';
  rawMarkdown: string;
  isGenerating: boolean;
  terminalEndRef: React.RefObject<HTMLDivElement | null>;
  triggerToast: (msg: string) => void;
  setSelectedModelName: (model: string) => void;
}

export default function QuestionBankViewer({
  parsedBank,
  searchQuery,
  userProgress,
  toggleCompleted,
  updateNotes,
  activeTab,
  rawMarkdown,
  isGenerating,
  terminalEndRef,
  triggerToast,
  setSelectedModelName,
}: QuestionBankViewerProps) {
  
  if (!rawMarkdown && !isGenerating) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-6 text-white font-sans">
        <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-pink-500 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-2xl shadow-[0_4px_20px_rgba(242,125,38,0.4)] animate-pulse">
          ?
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-mono uppercase tracking-wider font-extrabold text-white">No Interview Preparation Guides Loaded</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Specify your candidate's resume credentials and target client specs in the left sidebar, select a preferred Gemini model, and generate your custom preparation guide.
          </p>
        </div>
        <div className="glass-panel p-5 rounded-2xl font-mono text-[11px] text-left leading-relaxed space-y-3 border border-white/10">
          <p className="font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
            <ListChecks size={14} />
            <span>WHAT WILL BE GENERATED:</span>
          </p>
          <ul className="space-y-1.5 text-slate-300 pl-3 list-disc">
            <li><strong>8 Standardized Prep Modules</strong> aligned directly with client specifications</li>
            <li>Detailed <strong>Resume Checklist</strong> matching candidate background to JD gaps</li>
            <li><strong>Difficulty targets</strong> matching your exact weight distributions</li>
            <li>Direct linkable print layout &amp; printable PDF download options</li>
          </ul>
        </div>
      </div>
    );
  }

  const handleCopyMarkdown = () => {
    try {
      navigator.clipboard.writeText(rawMarkdown);
      triggerToast("Markdown content copied to clipboard!");
    } catch (err) {
      triggerToast("Clipboard blocked by browser sandbox. Please copy the text below manually.");
    }
  };

  // If we are in the interactive guide mode
  if (activeTab === 'interactive') {
    const sectionElements: React.ReactNode[] = [];
    let hasAtLeastOneMatch = false;

    if (parsedBank?.sections) {
      parsedBank.sections.forEach((section) => {
        // Filter questions based on search query
        const filteredQuestions = section.questions.filter(q => 
          q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (userProgress[q.id]?.notes || '').toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (filteredQuestions.length === 0 && searchQuery) return;

        hasAtLeastOneMatch = true;

        sectionElements.push(
          <div 
            key={section.id} 
            id={`sec-${section.id}`} 
            className="space-y-4 scroll-mt-20 glass-panel p-5 rounded-2xl border border-white/10 bg-slate-900/30 text-white shadow-xl"
          >
            <div className="border-b border-white/10 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <h2 className="font-bold text-sm uppercase tracking-wider font-mono text-orange-400 flex items-center gap-2">
                <Layers size={14} />
                <span>{section.title}</span>
              </h2>
              <span className="text-[10px] font-mono bg-white/5 px-2.5 py-0.5 border border-white/10 rounded-lg text-slate-400">
                {filteredQuestions.length} Questions {searchQuery && '(Filtered)'}
              </span>
            </div>

            <div className="divide-y divide-white/5 space-y-4">
              {filteredQuestions.map((question) => {
                const state = userProgress[question.id] || { completed: false, notes: '' };
                return (
                  <div key={question.id} className="pt-4 first:pt-0 space-y-2 group">
                    <div className="flex items-start gap-3">
                      {/* Study checkbox */}
                      <button
                        onClick={() => toggleCompleted(question.id)}
                        className="mt-0.5 shrink-0 text-slate-400 hover:text-white transition cursor-pointer"
                        aria-label={`Toggle preparation status of question ${question.id}`}
                      >
                        {state.completed ? (
                          <CheckCircle2 size={18} className="text-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.3)]" />
                        ) : (
                          <div className="w-4.5 h-4.5 border border-white/20 bg-black/30 rounded-md hover:border-orange-500 transition-colors"></div>
                        )}
                      </button>

                      <div className="flex-1 space-y-2">
                        <p className={`text-xs font-mono leading-relaxed transition-all ${state.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                          <span className="font-bold text-orange-400 mr-1">{question.id}.</span>
                          {question.text}
                        </p>

                        {/* Notes Box / Study guide area */}
                        <div className="pl-0 md:pl-1">
                          <textarea
                            value={state.notes}
                            onChange={(e) => updateNotes(question.id, e.target.value)}
                            placeholder="Add your notes, keywords, key projects to talk about, or custom response preparation here..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl focus:border-orange-500/50 text-[11px] p-2.5 font-mono h-16 resize-none focus:outline-none transition-all placeholder:text-slate-500 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      });
    }

    return (
      <div className="space-y-6">
        <div className="space-y-6">
          {sectionElements}

          {/* If searching leads to no matches */}
          {!hasAtLeastOneMatch && parsedBank && (
            <div className="text-center py-12 glass-panel rounded-2xl border border-white/10 font-mono text-xs text-slate-400">
              No interview questions matching "{searchQuery}" were found in this guide.
            </div>
          )}
        </div>

        {/* Live Streaming Log display if generating is in progress */}
        {isGenerating && rawMarkdown && (
          <div className="mt-6 border border-white/10 bg-slate-950/95 text-slate-300 p-5 rounded-2xl font-mono text-xs space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-orange-400 animate-pulse flex items-center gap-1.5 font-bold">
                <Terminal size={14} className="animate-spin" />
                <span>RAW ENGINE STREAM ACTIVE</span>
              </span>
              <span className="text-[10px] text-slate-400">{Math.round(rawMarkdown.length / 1024)} KB</span>
            </div>
            <div className="h-64 overflow-y-auto font-mono text-[10px] leading-relaxed whitespace-pre-wrap text-slate-300">
              {rawMarkdown}
              <div ref={terminalEndRef} />
            </div>
            <div className="text-[10px] text-slate-500 text-right">
              System compiling and parsing on the fly...
            </div>
          </div>
        )}
      </div>
    );
  }

  // If we are in raw markdown format mode
  return (
    <div className="space-y-4 text-white">
      <div className="flex justify-between items-center bg-slate-900/60 p-3.5 border border-white/10 rounded-xl text-xs font-mono">
        <span className="text-slate-300 font-bold">STANDARD MARKDOWN DOCUMENT FORMAT</span>
        <button
          onClick={handleCopyMarkdown}
          className="px-3 py-1.5 glass-button rounded-lg text-[10px] font-bold uppercase transition flex items-center gap-1.5 cursor-pointer"
        >
          <Copy size={11} className="text-orange-400" />
          <span>Copy Markdown</span>
        </button>
      </div>
      <textarea
        readOnly
        value={rawMarkdown}
        className="w-full bg-slate-950/40 border border-white/10 rounded-2xl p-4 text-xs font-mono h-[600px] focus:outline-none resize-none leading-relaxed text-white"
      />
    </div>
  );
}

