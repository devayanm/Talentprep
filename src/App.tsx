import React, { useState, useEffect, useRef } from "react";
import { Printer, RotateCcw, Search, X, AlertCircle } from "lucide-react";
import { SAMPLES, SamplePreset } from "./data/samples";
import { QuestionBank, GenerationConfig, QuestionSection, Question } from "./types";

// Import restructured modular components
import Header from "./components/Header";
import Toast from "./components/Toast";
import ResetModal from "./components/ResetModal";
import PrintModal from "./components/PrintModal";
import ConfigurationSidebar from "./components/ConfigurationSidebar";
import StatusBoard from "./components/StatusBoard";
import QuestionBankViewer from "./components/QuestionBankViewer";
import PrintLayout from "./components/PrintLayout";

export default function App() {
  // Input states
  const [resume, setResume] = useState(SAMPLES[0].resume);
  const [jobDescription, setJobDescription] = useState(SAMPLES[0].jobDescription);
  
  // Configuration states
  const [candidateName, setCandidateName] = useState(SAMPLES[0].candidateName);
  const [targetRole, setTargetRole] = useState(SAMPLES[0].role);
  const [targetClient, setTargetClient] = useState(SAMPLES[0].client);
  const [vendorName, setVendorName] = useState(SAMPLES[0].vendor);
  const [domain, setDomain] = useState<'Healthcare' | 'Banking' | 'Retail' | 'Telecom' | 'Manufacturing' | 'General'>(SAMPLES[0].domain);
  
  const [basicDiff, setBasicDiff] = useState(20);
  const [intermediateDiff, setIntermediateDiff] = useState(50);
  const [advancedDiff, setAdvancedDiff] = useState(30);

  // Status/Control States
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [appUrl, setAppUrl] = useState<string>('');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'interactive' | 'markdown'>('interactive');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  
  // Model state selections
  const [selectedModelName, setSelectedModelName] = useState<string>('auto');
  const [activeModelUsed, setActiveModelUsed] = useState<string | null>(null);
  
  // Custom toast trigger helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };
  
  // Generated content states
  const [rawMarkdown, setRawMarkdown] = useState<string>('');
  const [parsedBank, setParsedBank] = useState<QuestionBank | null>(null);
  const [userProgress, setUserProgress] = useState<Record<string, { completed: boolean; notes: string }>>({});
  
  // Refs for tracking and scrolling
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const prevIsGenerating = useRef(false);

  // Trigger toast confirmations on generation completion or failure
  useEffect(() => {
    if (prevIsGenerating.current && !isGenerating) {
      if (apiError) {
        triggerToast("Generation failed due to an API error.");
      } else if (rawMarkdown) {
        const hasSection8 = rawMarkdown.toLowerCase().includes("section 8:");
        if (hasSection8) {
          triggerToast("✓ Generation completed successfully! All 8 sections compiled.");
        } else {
          triggerToast("⚠ Generation ended halfway or was truncated before Section 8.");
        }
      }
    }
    prevIsGenerating.current = isGenerating;
  }, [isGenerating, apiError, rawMarkdown]);

  // Helper to dynamically calculate compilation state of sections
  const getSectionStatus = (secNum: number) => {
    const currentHeaderRegex = new RegExp(`##\\s+Section\\s+${secNum}\\b`, "i");
    const nextHeaderRegex = new RegExp(`##\\s+Section\\s+${secNum + 1}\\b`, "i");
    
    const hasCurrent = currentHeaderRegex.test(rawMarkdown);
    const hasNext = nextHeaderRegex.test(rawMarkdown);
    
    if (hasCurrent) {
      if (hasNext) {
        return 'completed';
      }
      if (isGenerating) {
        return 'active';
      }
      return 'completed'; // Generation stopped and this is either section 8 or the last parsed section
    }
    
    if (isGenerating) {
      if (secNum === 1) return 'active';
      const prevHeaderRegex = new RegExp(`##\\s+Section\\s+${secNum - 1}\\b`, "i");
      if (prevHeaderRegex.test(rawMarkdown)) {
        return 'active'; // previous section exists, so this is up next or being actively parsed
      }
    }
    return 'pending';
  };

  // Check server status (API Key presence)
  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        setHasApiKey(data.hasApiKey);
        if (data.appUrl) {
          setAppUrl(data.appUrl);
        }
      })
      .catch(() => {
        setHasApiKey(false);
      });
  }, []);

  // Set preset
  const handleLoadPreset = (preset: SamplePreset) => {
    setResume(preset.resume);
    setJobDescription(preset.jobDescription);
    setCandidateName(preset.candidateName);
    setTargetRole(preset.role);
    setTargetClient(preset.client);
    setVendorName(preset.vendor);
    setDomain(preset.domain);
  };

  // Keep difficulty summing to 100
  const handleDiffChange = (type: 'basic' | 'intermediate' | 'advanced', val: number) => {
    const value = Math.max(0, Math.min(100, val));
    if (type === 'basic') {
      setBasicDiff(value);
      // Adjust intermediate & advanced proportionately
      const remaining = 100 - value;
      const currentSum = intermediateDiff + advancedDiff;
      if (currentSum > 0) {
        setIntermediateDiff(Math.round((intermediateDiff / currentSum) * remaining));
        setAdvancedDiff(100 - value - Math.round((intermediateDiff / currentSum) * remaining));
      } else {
        setIntermediateDiff(Math.round(remaining / 2));
        setAdvancedDiff(remaining - Math.round(remaining / 2));
      }
    } else if (type === 'intermediate') {
      setIntermediateDiff(value);
      const remaining = 100 - value;
      const currentSum = basicDiff + advancedDiff;
      if (currentSum > 0) {
        setBasicDiff(Math.round((basicDiff / currentSum) * remaining));
        setAdvancedDiff(100 - value - Math.round((basicDiff / currentSum) * remaining));
      } else {
        setBasicDiff(Math.round(remaining / 2));
        setAdvancedDiff(remaining - Math.round(remaining / 2));
      }
    } else {
      setAdvancedDiff(value);
      const remaining = 100 - value;
      const currentSum = basicDiff + intermediateDiff;
      if (currentSum > 0) {
        setBasicDiff(Math.round((basicDiff / currentSum) * remaining));
        setIntermediateDiff(100 - value - Math.round((basicDiff / currentSum) * remaining));
      } else {
        setBasicDiff(Math.round(remaining / 2));
        setIntermediateDiff(remaining - Math.round(remaining / 2));
      }
    }
  };

  // Helper to trigger generation
  const handleGenerate = async () => {
    setIsGenerating(true);
    setApiError(null);
    setRawMarkdown('');
    setParsedBank(null);
    setActiveModelUsed(null);

    const config: GenerationConfig = {
      candidateName,
      targetRole,
      targetClient,
      vendorName,
      domain,
      difficultyDistribution: {
        basic: basicDiff,
        intermediate: intermediateDiff,
        advanced: advancedDiff
      }
    };

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription, config, preferredModel: selectedModelName }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body reader available.");

      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep the last partial line in buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") {
              continue;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.model) {
                setActiveModelUsed(parsed.model);
              }
              if (parsed.text) {
                setRawMarkdown(prev => {
                  const updated = prev + parsed.text;
                  return updated;
                });
              }
            } catch (err) {
              console.warn("Error parsing chunk:", err, dataStr);
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Failed to generate question bank. Please check your network connection and server console.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Parse Markdown into structured sections when generation finishes
  useEffect(() => {
    if (!rawMarkdown) return;

    // Quick regexes to extract metadata if specified at the top
    const roleMatch = rawMarkdown.match(/ROLE:\s*(.*)/i);
    const clientMatch = rawMarkdown.match(/CLIENT:\s*(.*)/i);
    const vendorMatch = rawMarkdown.match(/VENDOR:\s*(.*)/i);
    const prepForMatch = rawMarkdown.match(/PREPARED_FOR:\s*(.*)/i);

    const sections: QuestionSection[] = [];
    
    // Split the markdown by standard headings like "## Section" or "### Section"
    // We search for line starting with ## Section
    const sectionBlocks = rawMarkdown.split(/(?=^##\s+Section\s+\d+)/mi);

    let secIdCounter = 1;
    let questionIdCounter = 1;

    sectionBlocks.forEach((block) => {
      const headerLineMatch = block.match(/^##\s+(Section\s+\d+:\s*.*)$/m);
      if (!headerLineMatch) return;

      const title = headerLineMatch[1].trim();
      const questions: Question[] = [];

      // Extract lines that look like: 1. Question text or 1) Question text
      // But avoid capturing other normal markdown sentences if possible.
      // We look for list elements.
      const lines = block.split("\n");
      lines.forEach((line) => {
        const qMatch = line.match(/^\s*(\d+)[\.\)]\s*(.*)$/);
        if (qMatch) {
          questions.push({
            id: questionIdCounter++,
            text: qMatch[2].trim(),
          });
        }
      });

      if (title || questions.length > 0) {
        sections.push({
          id: secIdCounter++,
          title: title,
          questions: questions,
        });
      }
    });

    setParsedBank({
      role: roleMatch ? roleMatch[1].trim() : targetRole,
      client: clientMatch ? clientMatch[1].trim() : targetClient,
      vendor: vendorMatch ? vendorMatch[1].trim() : vendorName,
      preparedFor: prepForMatch ? prepForMatch[1].trim() : candidateName,
      sections,
      rawMarkdown,
    });
  }, [rawMarkdown]);

  // Track progress calculations
  const totalQuestionsCount = parsedBank?.sections.reduce((acc, s) => acc + s.questions.length, 0) || 0;
  const completedQuestionsCount = Object.values(userProgress).filter((p: any) => p.completed).length;
  const completionPercentage = totalQuestionsCount > 0 ? Math.round((completedQuestionsCount / totalQuestionsCount) * 100) : 0;

  // Toggle single question completion
  const toggleCompleted = (qId: number) => {
    setUserProgress(prev => {
      const current = prev[qId] || { completed: false, notes: '' };
      return {
        ...prev,
        [qId]: { ...current, completed: !current.completed }
      };
    });
  };

  // Update single question notes
  const updateNotes = (qId: number, notes: string) => {
    setUserProgress(prev => {
      const current = prev[qId] || { completed: false, notes: '' };
      return {
        ...prev,
        [qId]: { ...current, notes }
      };
    });
  };

  // Reset progress
  const resetProgress = () => {
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    setUserProgress({});
    setShowResetModal(false);
    triggerToast("Study progress and preparation notes successfully reset.");
  };

  // Download clean Markdown
  const downloadMarkdown = () => {
    const element = document.createElement("a");
    const file = new Blob([rawMarkdown], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${candidateName.replace(/\s+/g, '_')}_interview_prep_guide.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    triggerToast("Markdown document downloaded successfully!");
  };

  // Download high-density styled HTML file that launches standard browser print on open!
  const downloadHtml = () => {
    const htmlStyles = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
      
      body {
        font-family: "Inter", sans-serif;
        background-color: white;
        color: #141414;
        margin: 2rem;
        line-height: 1.5;
        font-size: 10.5pt;
      }
      
      .info-card {
        border: 1px solid #141414;
        padding: 1.5rem;
        background-color: #faf9f8;
        margin-bottom: 2rem;
      }
      
      .info-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-b: 1px solid #141414;
        padding-bottom: 0.5rem;
        margin-bottom: 1rem;
        font-family: "JetBrains Mono", monospace;
        font-size: 0.75rem;
        color: #555;
        text-transform: uppercase;
        border-bottom: 1px solid #141414;
      }
      
      .title-main {
        font-size: 1.8rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: -0.03em;
        margin: 0;
        line-height: 1.1;
      }
      
      .subtitle-main {
        font-size: 0.9rem;
        margin-top: 0.4rem;
        margin-bottom: 0;
        color: #666;
        text-transform: uppercase;
        font-family: "JetBrains Mono", monospace;
      }
      
      .metadata-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        font-family: "JetBrains Mono", monospace;
        font-size: 0.8rem;
        border-top: 1px dashed #ccc;
        padding-top: 1rem;
        margin-top: 1rem;
      }

      .metadata-item {
        display: flex;
        flex-direction: column;
      }

      .metadata-label {
        font-size: 0.65rem;
        color: #777;
        font-weight: bold;
        text-transform: uppercase;
        margin-bottom: 0.15rem;
      }

      .metadata-value {
        font-weight: bold;
        font-size: 0.85rem;
      }

      .metadata-full {
        grid-column: span 2;
      }
      
      .section-header {
        border-bottom: 1px solid #141414;
        padding-bottom: 0.25rem;
        margin-top: 2rem;
        margin-bottom: 1rem;
        font-size: 1.1rem;
        font-weight: 800;
        text-transform: uppercase;
        color: #F27D26;
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }
      
      .section-header-title {
        font-family: "Inter", sans-serif;
      }

      .section-header-budget {
        font-size: 0.75rem;
        font-family: "JetBrains Mono", monospace;
        color: #666;
        font-weight: normal;
        text-transform: uppercase;
      }
      
      .question-block {
        margin-bottom: 1rem;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      .question-text {
        font-weight: 500;
        margin-bottom: 0.35rem;
        font-family: "JetBrains Mono", monospace;
        font-size: 0.85rem;
        line-height: 1.4;
      }
      
      .notes-block {
        background-color: #f7f6f5;
        border-left: 2px solid #777;
        padding: 0.5rem 1rem;
        margin-top: 0.35rem;
        font-size: 0.8rem;
        font-style: italic;
        color: #555;
        font-family: "JetBrains Mono", monospace;
      }
    `;

    const sectionsHtml = parsedBank?.sections.map(sec => `
      <div class="section-header">
        <div class="section-header-title">${sec.title}</div>
        <span class="section-header-budget">Budget: ${sec.questions.length} Questions</span>
      </div>
      <div>
        ${sec.questions.map(q => {
          const state = userProgress[q.id] || { completed: false, notes: '' };
          return `
            <div class="question-block">
              <div class="question-text"><strong>${q.id}.</strong> ${q.text}</div>
              ${state.notes ? `<div class="notes-block"><strong>My Notes:</strong> ${state.notes}</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `).join('') || '';

    const fullHtml = `
      <!doctype html>
      <html>
        <head>
          <title>${candidateName} - Interview Preparation Guide</title>
          <style>${htmlStyles}</style>
        </head>
        <body>
          <div class="info-card">
            <h1 class="title-main">
              Interview Preparation Kit
            </h1>
            <p class="subtitle-main">
              Technical & Scenario-Based Interview Question Bank
            </p>
            
            <div class="metadata-grid">
              <div class="metadata-item">
                <span class="metadata-label">PREPARED FOR (CANDIDATE)</span>
                <span class="metadata-value">${candidateName}</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">TARGET ROLE & DOMAIN</span>
                <span class="metadata-value">${targetRole} (${domain} Domain)</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">CLIENT</span>
                <span class="metadata-value">${targetClient || "Direct Client"}</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">VENDOR</span>
                <span class="metadata-value">${vendorName || "Vendor Partner"}</span>
              </div>
              <div class="metadata-item metadata-full">
                <span class="metadata-label">INTERVIEW METRICS & DIFFICULTY DISTRIBUTION</span>
                <span class="metadata-value">${basicDiff}% Basic / ${intermediateDiff}% Intermediate / ${advancedDiff}% Advanced (B/I/A Ratio)</span>
              </div>
            </div>
          </div>
          
          ${sectionsHtml}
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `;

    const element = document.createElement("a");
    const file = new Blob([fullHtml], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `${candidateName.replace(/\s+/g, '_')}_interview_prep_guide.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    triggerToast("HTML printable document downloaded! Open it to print directly.");
  };

  // Print preparation document
  const triggerPrint = () => {
    setShowPrintModal(true);
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans flex flex-col selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Reset Confirmation Modal */}
      <ResetModal 
        isOpen={showResetModal} 
        onClose={() => setShowResetModal(false)} 
        onConfirm={handleConfirmReset} 
      />
      
      {/* Custom PDF Generation & Printing Portal Modal */}
      <PrintModal 
        isOpen={showPrintModal} 
        onClose={() => setShowPrintModal(false)} 
        appUrl={appUrl} 
        onDownloadHtml={downloadHtml} 
        onDownloadMarkdown={downloadMarkdown} 
      />

      {/* HEADER BAR (Theme styled) */}
      <Header hasApiKey={hasApiKey} />

      {/* MAIN CONTAINER */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 no-print">
        {/* LEFT SIDEBAR: INPUT CONTROLS (Col-span-4) */}
        <ConfigurationSidebar
          resume={resume}
          setResume={setResume}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          candidateName={candidateName}
          setCandidateName={setCandidateName}
          targetRole={targetRole}
          setTargetRole={setTargetRole}
          targetClient={targetClient}
          setTargetClient={setTargetClient}
          vendorName={vendorName}
          setVendorName={setVendorName}
          domain={domain}
          setDomain={setDomain}
          basicDiff={basicDiff}
          intermediateDiff={intermediateDiff}
          advancedDiff={advancedDiff}
          onDiffChange={handleDiffChange}
          selectedModelName={selectedModelName}
          setSelectedModelName={setSelectedModelName}
          isGenerating={isGenerating}
          apiError={apiError}
          onGenerate={handleGenerate}
          onLoadPreset={handleLoadPreset}
        />

        {/* RIGHT AREA: RESULTS VIEWER (Col-span-8) */}
        <section className="lg:col-span-8 flex flex-col bg-white overflow-y-auto max-h-[calc(100vh-3.5rem)] relative text-black">
          
          {/* Header Panel for Generated Content */}
          <div className="bg-[#E4E3E0] p-6 border-b border-[#141414] flex flex-col gap-4 text-black">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="font-serif italic text-xs uppercase tracking-wider opacity-50 block text-black">Intelligence Analysis Results</span>
                <h1 className="text-xl font-extrabold tracking-tight uppercase text-black">
                  {candidateName ? `${candidateName} Prep Bank` : "Candidate Interview Intel"}
                </h1>
                <p className="text-xs opacity-70 mt-1 font-mono text-black">
                  Target: {targetRole || "Senior Role"} at {targetClient || "Direct Client"} ({domain} Domain)
                </p>
                {activeModelUsed && (
                  <div className="inline-flex items-center gap-1.5 mt-2 bg-white px-2 py-1 border border-[#141414] text-[10px] font-mono uppercase tracking-wide text-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block"></span>
                    <span>Processed via: <strong>{activeModelUsed}</strong></span>
                  </div>
                )}
              </div>

              {/* Top Controls: Print & Toggle */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {rawMarkdown && (
                  <>
                    <button
                      onClick={triggerPrint}
                      className="px-3.5 py-2 border border-[#141414] bg-white text-xs font-mono font-bold hover:bg-[#141414] hover:text-[#E4E3E0] transition flex items-center gap-1.5 cursor-pointer text-black"
                    >
                      <Printer size={13} />
                      Print / PDF
                    </button>
                    <button
                      onClick={resetProgress}
                      title="Reset Study Progress"
                      className="p-2 border border-[#141414] bg-white text-xs hover:bg-[#141414] hover:text-[#E4E3E0] transition flex items-center cursor-pointer text-black"
                    >
                      <RotateCcw size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Metrics Dashboard */}
            {rawMarkdown && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 border border-[#141414] text-black">
                <div>
                  <div className="text-xs font-serif italic opacity-50 text-black">Total Questions</div>
                  <div className="text-xl font-extrabold font-mono mt-0.5 text-black">
                    {totalQuestionsCount || "Counting..."}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-serif italic opacity-50 text-black">Study Progress</div>
                  <div className="text-xl font-extrabold font-mono text-[#F27D26] mt-0.5">
                    {completedQuestionsCount} / {totalQuestionsCount} ({completionPercentage}%)
                  </div>
                </div>
                <div>
                  <div className="text-xs font-serif italic opacity-50 text-black">Assumed Agency</div>
                  <div className="text-xs font-bold font-mono truncate mt-1 text-black">
                    {vendorName || "Centraprise"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-serif italic opacity-50 text-black">Assigned Domain</div>
                  <div className="text-xs font-bold font-mono mt-1 text-black">
                    {domain} Compliance
                  </div>
                </div>
              </div>
            )}

            {/* Custom Interactive Tabs & Search */}
            {rawMarkdown && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 text-black">
                <div className="flex border border-[#141414] overflow-hidden bg-white text-xs font-mono self-start text-black">
                  <button
                    onClick={() => setActiveTab('interactive')}
                    className={`px-4 py-1.5 border-r border-[#141414] transition cursor-pointer font-bold ${activeTab === 'interactive' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-gray-100 text-black'}`}
                  >
                    Interactive Guide & Tracker
                  </button>
                  <button
                    onClick={() => setActiveTab('markdown')}
                    className={`px-4 py-1.5 transition cursor-pointer font-bold ${activeTab === 'markdown' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-gray-100 text-black'}`}
                  >
                    Raw Document (Markdown)
                  </button>
                </div>

                {activeTab === 'interactive' && (
                  <div className="relative flex-1 max-w-xs self-stretch sm:self-auto text-black">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50 text-black" />
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-[#141414] pl-8 pr-7 py-1 text-xs focus:outline-none font-mono text-black"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 text-black"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Question Viewer Canvas */}
          <div className="p-6 flex-1 bg-white text-black">
            {/* If there is API Error */}
            {apiError && (
              <div className="border border-red-500 bg-red-50 p-4 mb-6">
                <div className="flex items-center gap-2 text-red-700 font-bold text-sm mb-1">
                  <AlertCircle size={16} />
                  <span>Intelligence Generation Failure</span>
                </div>
                <p className="text-xs text-red-600 font-mono leading-relaxed">
                  {apiError}
                </p>
                <p className="text-[11px] text-red-500 font-mono mt-2">
                  Tip: Ensure your server is active and the Google Gemini API key is correctly configured. You can modify keys in the "Settings" tab in AI Studio.
                </p>
              </div>
            )}

            {/* Realtime Synchronizer Status Board */}
            <StatusBoard
              rawMarkdown={rawMarkdown}
              isGenerating={isGenerating}
              activeModelUsed={activeModelUsed}
              getSectionStatus={getSectionStatus}
              setSelectedModelName={setSelectedModelName}
            />

            {/* QuestionBankViewer */}
            <QuestionBankViewer
              parsedBank={parsedBank}
              searchQuery={searchQuery}
              userProgress={userProgress}
              toggleCompleted={toggleCompleted}
              updateNotes={updateNotes}
              activeTab={activeTab}
              rawMarkdown={rawMarkdown}
              isGenerating={isGenerating}
              terminalEndRef={terminalEndRef}
              triggerToast={triggerToast}
              setSelectedModelName={setSelectedModelName}
            />
          </div>
        </section>
      </main>

      {/* PRINT-ONLY CONTAINER (Specifically structured with clean page-breaks, no UI, title page) */}
      <PrintLayout
        parsedBank={parsedBank}
        vendorName={vendorName}
        candidateName={candidateName}
        targetClient={targetClient}
        targetRole={targetRole}
        domain={domain}
        basicDiff={basicDiff}
        intermediateDiff={intermediateDiff}
        advancedDiff={advancedDiff}
        userProgress={userProgress}
      />

      {/* FOOTER BAR */}
      <footer className="no-print border-t border-[#141414] h-10 px-6 flex items-center justify-between text-[11px] font-mono bg-[#E4E3E0] z-10 text-black">
        <div>© {new Date().getFullYear()} VENDOR INTELLIGENCE UNIT</div>
        <div className="hidden sm:block">STATUS: SECURE_SYNC // PORT_3000_ACTIVE</div>
        <div>LATENCY: 0.38s | GEMINI-3.5-FLASH</div>
      </footer>
    </div>
  );
}
