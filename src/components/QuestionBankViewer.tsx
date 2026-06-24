import React from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
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
      <div className="max-w-xl mx-auto py-12 text-center space-y-6 text-black font-sans">
        <div className="w-12 h-12 bg-[#F27D26] border border-[#141414] mx-auto flex items-center justify-center text-white font-mono font-bold text-lg shadow-md">
          ?
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-mono uppercase tracking-wider font-extrabold">No Interview Preparation Guides Loaded</h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            Specify your candidate's resume credentials and target client specs in the left sidebar, select a preferred Gemini model, and generate your custom preparation guide.
          </p>
        </div>
        <div className="border border-[#141414] p-4 bg-[#E4E3E0] font-mono text-[11px] text-left leading-normal space-y-2">
          <p className="font-bold text-gray-700 uppercase tracking-wider">🎯 WHAT WILL BE GENERATED:</p>
          <ul className="space-y-1 opacity-90 pl-3 list-disc">
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
            className="space-y-4 scroll-mt-20 border border-[#141414] p-4 bg-white text-black"
          >
            <div className="border-b border-[#141414] pb-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <h2 className="font-bold text-sm uppercase tracking-wider font-mono text-[#F27D26]">
                {section.title}
              </h2>
              <span className="text-[11px] font-mono bg-gray-100 px-2 py-0.5 border border-[#141414]">
                {filteredQuestions.length} Questions {searchQuery && '(Filtered)'}
              </span>
            </div>

            <div className="divide-y divide-gray-100 space-y-4">
              {filteredQuestions.map((question) => {
                const state = userProgress[question.id] || { completed: false, notes: '' };
                return (
                  <div key={question.id} className="pt-4 first:pt-0 space-y-2 group">
                    <div className="flex items-start gap-3">
                      {/* Study checkbox */}
                      <button
                        onClick={() => toggleCompleted(question.id)}
                        className="mt-0.5 shrink-0 text-gray-500 hover:text-[#141414] transition cursor-pointer"
                        aria-label={`Toggle preparation status of question ${question.id}`}
                      >
                        {state.completed ? (
                          <CheckCircle2 size={16} className="text-green-600" />
                        ) : (
                          <div className="w-4 h-4 border border-[#141414] bg-white rounded-none hover:bg-gray-50"></div>
                        )}
                      </button>

                      <div className="flex-1 space-y-2">
                        <p className={`text-xs font-mono leading-relaxed ${state.completed ? 'line-through text-gray-400' : 'text-[#141414]'}`}>
                          <span className="font-bold mr-1">{question.id}.</span>
                          {question.text}
                        </p>

                        {/* Notes Box / Study guide area */}
                        <div className="pl-0 md:pl-2">
                          <textarea
                            value={state.notes}
                            onChange={(e) => updateNotes(question.id, e.target.value)}
                            placeholder="Add your notes, keywords, key projects to talk about, or custom response preparation here..."
                            className="w-full bg-gray-50 border border-gray-200 focus:border-[#141414] text-[11px] p-2 font-mono h-14 resize-none focus:outline-none transition placeholder:opacity-50 text-black"
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
            <div className="text-center py-12 border border-[#141414] bg-gray-50 font-mono text-xs text-gray-500">
              No interview questions matching "{searchQuery}" were found in this guide.
            </div>
          )}
        </div>

        {/* Live Streaming Log display if generating is in progress */}
        {isGenerating && rawMarkdown && (
          <div className="mt-6 border border-[#141414] bg-[#141414] text-[#E4E3E0] p-4 rounded-none font-mono text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-gray-700 pb-2">
              <span className="text-[#F27D26] animate-pulse">● RAW ENGINE STREAM ACTIVE</span>
              <span>{Math.round(rawMarkdown.length / 1024)} KB</span>
            </div>
            <div className="h-64 overflow-y-auto font-mono text-[10px] leading-relaxed whitespace-pre-wrap">
              {rawMarkdown}
              <div ref={terminalEndRef} />
            </div>
            <div className="text-[10px] opacity-50 text-right">
              System compiling and parsing on the fly...
            </div>
          </div>
        )}
      </div>
    );
  }

  // If we are in raw markdown format mode
  return (
    <div className="space-y-4 text-black">
      <div className="flex justify-between items-center bg-gray-50 p-2 border border-[#141414] text-xs font-mono">
        <span>STANDARD MARKDOWN DOCUMENT FORMAT</span>
        <button
          onClick={handleCopyMarkdown}
          className="px-2 py-1 bg-white hover:bg-[#141414] hover:text-[#E4E3E0] border border-[#141414] text-[10px] font-bold uppercase transition cursor-pointer"
        >
          Copy Markdown
        </button>
      </div>
      <textarea
        readOnly
        value={rawMarkdown}
        className="w-full bg-white border border-[#141414] p-4 text-xs font-mono h-[600px] focus:outline-none resize-none leading-relaxed text-black"
      />
    </div>
  );
}
