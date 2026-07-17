import React, { useState, useEffect, useRef } from "react";
import { SAMPLES, SamplePreset } from "./data/samples";
import { QuestionBank, GenerationConfig } from "./types";
import { Sparkles } from "lucide-react";

// Import core utility libraries
import { parseMarkdownToQuestionBank } from "./lib/parser";
import { downloadMarkdown, downloadHtml } from "./lib/exporter";
import { RESUME_TEMPLATES, DEFAULT_COVER_LETTER_TEMPLATE, DEFAULT_PITCH_TEMPLATE } from "./lib/templates";

// Import modular sub-components
import Header from "./components/Header";
import Toast from "./components/Toast";
import ResetModal from "./components/ResetModal";
import PrintModal from "./components/PrintModal";
import ConfigurationSidebar from "./components/ConfigurationSidebar";
import StatusBoard from "./components/StatusBoard";
import QuestionBankViewer from "./components/QuestionBankViewer";
import PrintLayout from "./components/PrintLayout";
import MetricsDashboard from "./components/MetricsDashboard";
import ResultsHeader from "./components/ResultsHeader";
import NavigationTabs from "./components/NavigationTabs";
import Footer from "./components/Footer";
import LatexWorkspace from "./components/LatexWorkspace";
import LandingPage from "./components/LandingPage";

function AutoPrintTrigger() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  return null;
}

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
  
  // Custom Modules State (Dashboard + LaTeX Workspace)
  const [viewPage, setViewPage] = useState<'home' | 'workspace'>('home');
  const [selectedModule, setSelectedModule] = useState<'screen_prep' | 'resume' | 'cover_letter' | 'pitch'>('screen_prep');
  const [selectedResumeTemplateId, setSelectedResumeTemplateId] = useState<string>("default_alex_webb");
  const [resumeLatex, setResumeLatex] = useState<string>(RESUME_TEMPLATES[0].latex);
  const [coverLetterLatex, setCoverLetterLatex] = useState<string>(DEFAULT_COVER_LETTER_TEMPLATE);
  const [pitchLatex, setPitchLatex] = useState<string>(DEFAULT_PITCH_TEMPLATE);
  const [targetPages, setTargetPages] = useState<string>('flexible');
  const [isGeneratingLatex, setIsGeneratingLatex] = useState<boolean>(false);
  const [latexModelUsed, setLatexModelUsed] = useState<string | null>(null);
  
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
  
  const [isPrintRoute, setIsPrintRoute] = useState(false);

  // Parse print query parameter and load cached data
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("print") === "true") {
      setIsPrintRoute(true);
      
      const cachedCandidateName = localStorage.getItem("talent_prep_candidateName");
      if (cachedCandidateName !== null) setCandidateName(cachedCandidateName);
      
      const cachedTargetRole = localStorage.getItem("talent_prep_targetRole");
      if (cachedTargetRole !== null) setTargetRole(cachedTargetRole);
      
      const cachedTargetClient = localStorage.getItem("talent_prep_targetClient");
      if (cachedTargetClient !== null) setTargetClient(cachedTargetClient);
      
      const cachedVendorName = localStorage.getItem("talent_prep_vendorName");
      if (cachedVendorName !== null) setVendorName(cachedVendorName);
      
      const cachedDomain = localStorage.getItem("talent_prep_domain");
      if (cachedDomain !== null) setDomain(cachedDomain as any);
      
      const cachedBasicDiff = localStorage.getItem("talent_prep_basicDiff");
      if (cachedBasicDiff !== null) setBasicDiff(Number(cachedBasicDiff));
      
      const cachedIntermediateDiff = localStorage.getItem("talent_prep_intermediateDiff");
      if (cachedIntermediateDiff !== null) setIntermediateDiff(Number(cachedIntermediateDiff));
      
      const cachedAdvancedDiff = localStorage.getItem("talent_prep_advancedDiff");
      if (cachedAdvancedDiff !== null) setAdvancedDiff(Number(cachedAdvancedDiff));
      
      const cachedRawMarkdown = localStorage.getItem("talent_prep_rawMarkdown");
      if (cachedRawMarkdown !== null) setRawMarkdown(cachedRawMarkdown);
      
      const cachedUserProgress = localStorage.getItem("talent_prep_userProgress");
      if (cachedUserProgress !== null) {
        try {
          setUserProgress(JSON.parse(cachedUserProgress));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

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
      return 'completed'; 
    }
    
    if (isGenerating) {
      if (secNum === 1) return 'active';
      const prevHeaderRegex = new RegExp(`##\\s+Section\\s+${secNum - 1}\\b`, "i");
      if (prevHeaderRegex.test(rawMarkdown)) {
        return 'active'; 
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
        buffer = lines.pop() || ""; 

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
                setRawMarkdown(prev => prev + parsed.text);
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

  // Helper to trigger LaTeX compilation/generation (Resume, Cover Letter, or Pitch)
  const handleGenerateLatex = async (mode: 'resume' | 'cover_letter' | 'pitch') => {
    setIsGeneratingLatex(true);
    setApiError(null);
    setLatexModelUsed(null);
    
    let endpoint = "";
    if (mode === 'resume') {
      endpoint = "/api/generate-resume-latex";
      setResumeLatex("");
    } else if (mode === 'cover_letter') {
      endpoint = "/api/generate-cover-letter-latex";
      setCoverLetterLatex("");
    } else {
      endpoint = "/api/generate-pitch-latex";
      setPitchLatex("");
    }

    const config = {
      candidateName,
      targetRole,
      targetClient,
      vendorName,
      domain,
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          resume, 
          jobDescription, 
          config, 
          targetPages,
          templateLatex: mode === 'resume' ? (
            selectedResumeTemplateId === 'custom' 
              ? resumeLatex 
              : RESUME_TEMPLATES.find(t => t.id === selectedResumeTemplateId)?.latex
          ) : undefined,
          preferredModel: selectedModelName 
        }),
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
        buffer = lines.pop() || ""; 

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
                setLatexModelUsed(parsed.model);
              }
              if (parsed.text) {
                if (mode === 'resume') {
                  setResumeLatex(prev => prev + parsed.text);
                } else if (mode === 'cover_letter') {
                  setCoverLetterLatex(prev => prev + parsed.text);
                } else {
                  setPitchLatex(prev => prev + parsed.text);
                }
              }
            } catch (err) {
              console.warn("Error parsing chunk:", err, dataStr);
            }
          }
        }
      }
      triggerToast(`✓ LaTeX ${mode === 'resume' ? 'Resume' : mode === 'cover_letter' ? 'Cover Letter' : 'Briefing'} compiled successfully!`);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || `Failed to generate LaTeX ${mode}. Please verify your network connection.`);
      triggerToast(`Error compiling LaTeX ${mode}.`);
    } finally {
      setIsGeneratingLatex(false);
    }
  };

  // Parse Markdown into structured sections when generation finishes
  useEffect(() => {
    if (!rawMarkdown) return;
    const parsed = parseMarkdownToQuestionBank(
      rawMarkdown,
      targetRole,
      targetClient,
      vendorName,
      candidateName
    );
    setParsedBank(parsed);
  }, [rawMarkdown, targetRole, targetClient, vendorName, candidateName]);

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

  // Export handlers mapped from external libraries
  const handleDownloadMarkdown = () => {
    downloadMarkdown(rawMarkdown, candidateName);
    triggerToast("Markdown document downloaded successfully!");
  };

  const handleDownloadHtml = () => {
    downloadHtml({
      parsedBank,
      candidateName,
      targetRole,
      targetClient,
      vendorName,
      domain,
      basicDiff,
      intermediateDiff,
      advancedDiff,
      userProgress,
    });
    triggerToast("HTML printable document downloaded! Open it to print directly.");
  };

  // Print preparation document
  const triggerPrint = () => {
    localStorage.setItem("talent_prep_candidateName", candidateName);
    localStorage.setItem("talent_prep_targetRole", targetRole);
    localStorage.setItem("talent_prep_targetClient", targetClient);
    localStorage.setItem("talent_prep_vendorName", vendorName);
    localStorage.setItem("talent_prep_domain", domain);
    localStorage.setItem("talent_prep_basicDiff", String(basicDiff));
    localStorage.setItem("talent_prep_intermediateDiff", String(intermediateDiff));
    localStorage.setItem("talent_prep_advancedDiff", String(advancedDiff));
    localStorage.setItem("talent_prep_rawMarkdown", rawMarkdown);
    localStorage.setItem("talent_prep_userProgress", JSON.stringify(userProgress));

    setShowPrintModal(true);
  };

  if (isPrintRoute) {
    return (
      <div className="min-h-screen bg-slate-100 text-black py-8 px-4 font-sans select-none no-print-bg">
        <div className="max-w-4xl mx-auto mb-6 bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm no-print">
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-800">PRINT PREVIEW PORTAL</h2>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Prepare to save/print. Ensure "Background graphics" is enabled in printer settings.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-xs font-mono font-bold rounded-lg shadow-sm cursor-pointer"
            >
              Print / Save as PDF
            </button>
            <button
              onClick={() => window.close()}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold border border-slate-200 rounded-lg cursor-pointer"
            >
              Close Tab
            </button>
          </div>
        </div>

        <div className="bg-white text-black p-8 shadow-sm rounded-2xl border border-slate-200 print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto">
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
            visible={true}
          />
        </div>

        <AutoPrintTrigger />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-orange-500 selection:text-white relative overflow-hidden">
      {/* Background radial glowing light blobs */}
      <div className="absolute w-[450px] h-[450px] bg-orange-500/10 rounded-full blur-[100px] -top-20 -left-20 pointer-events-none"></div>
      <div className="absolute w-[450px] h-[450px] bg-pink-500/5 rounded-full blur-[120px] -bottom-20 -right-20 pointer-events-none"></div>

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
        onDownloadHtml={handleDownloadHtml} 
        onDownloadMarkdown={handleDownloadMarkdown} 
      />

      {/* HEADER BAR */}
      <Header 
        hasApiKey={hasApiKey} 
        viewPage={viewPage} 
        onGoHome={() => setViewPage('home')} 
      />

      {viewPage === 'home' ? (
        <LandingPage 
          onSelectModule={(module) => {
            setSelectedModule(module);
            setViewPage('workspace');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} 
          hasApiKey={hasApiKey} 
        />
      ) : (
        <div className="flex-1 flex flex-col min-h-0 no-print z-10 relative">
          
          {/* MASTER COMMAND NAVIGATION TABS BAR */}
          <div className="bg-slate-950/95 border-b border-white/10 px-6 py-4 sticky top-0 z-20 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto max-w-full">
              <button
                onClick={() => setSelectedModule('screen_prep')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedModule === 'screen_prep' 
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                📋 Screen Prep Bank
              </button>
              
              <button
                onClick={() => setSelectedModule('resume')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedModule === 'resume' 
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                📄 ATS LaTeX Resume
              </button>
              
              <button
                onClick={() => setSelectedModule('cover_letter')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedModule === 'cover_letter' 
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                ✉️ LaTeX Cover Letter
              </button>
              
              <button
                onClick={() => setSelectedModule('pitch')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedModule === 'pitch' 
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                ⚡ Pitch & Cheat-Sheet
              </button>
            </div>

            {selectedModule !== 'screen_prep' && (
              <button
                onClick={() => handleGenerateLatex(selectedModule)}
                disabled={isGeneratingLatex}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-xs font-mono font-black rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_2px_10px_rgba(242,125,38,0.25)] transition-all hover:-translate-y-0.5 text-white active:translate-y-0"
              >
                {isGeneratingLatex ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                    <span>Compiling...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} className="text-white animate-pulse" />
                    <span>Compile LaTeX</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* TWO-COLUMN LAYOUT SEGMENTS BASED ON MODULE */}
          {selectedModule === 'screen_prep' ? (
            <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
              {/* LEFT SIDEBAR: INPUT CONTROLS */}
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
                selectedModule={selectedModule}
                isGeneratingLatex={isGeneratingLatex}
                onGenerateLatex={handleGenerateLatex}
              />

              {/* RIGHT AREA: SCREEN PREP RESULTS */}
              <section className="lg:col-span-8 flex flex-col bg-slate-900/10 overflow-y-auto max-h-[calc(100vh-8rem)] relative text-white border-l border-white/5">
                {/* Header Panel for Generated Content */}
                <ResultsHeader
                  candidateName={candidateName}
                  targetRole={targetRole}
                  targetClient={targetClient}
                  domain={domain}
                  activeModelUsed={activeModelUsed}
                  rawMarkdown={rawMarkdown}
                  triggerPrint={triggerPrint}
                  resetProgress={resetProgress}
                />

                {/* Metrics Dashboard */}
                <div className="bg-slate-900/30 px-6 pb-4 pt-4 border-b border-white/5 backdrop-blur-md">
                  <MetricsDashboard
                    rawMarkdown={rawMarkdown}
                    totalQuestionsCount={totalQuestionsCount}
                    completedQuestionsCount={completedQuestionsCount}
                    completionPercentage={completionPercentage}
                    vendorName={vendorName}
                    domain={domain}
                  />
                </div>

                {/* Custom Interactive Tabs & Search bar */}
                <NavigationTabs
                  rawMarkdown={rawMarkdown}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />

                {/* Question Viewer Canvas */}
                <div className="p-6 flex-1 bg-slate-950/10 text-white">
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
          ) : selectedModule === 'resume' ? (
            <div className="flex-1 flex flex-col min-h-0">
              <LatexWorkspace
                latexCode={resumeLatex}
                setLatexCode={setResumeLatex}
                isGenerating={isGeneratingLatex}
                onGenerate={() => handleGenerateLatex('resume')}
                title="ATS LaTeX Resume Reformatter"
                subtitle="Re-aligns accomplishments with Job Description keywords and reformats to ATS standards."
                fileName={`${candidateName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_resume.tex`}
                type="resume"
                targetPages={targetPages}
                setTargetPages={setTargetPages}
                activeModelUsed={latexModelUsed}
                resumeText={resume}
                setResumeText={setResume}
                jdText={jobDescription}
                setJdText={setJobDescription}
                selectedTemplateId={selectedResumeTemplateId}
                setSelectedTemplateId={setSelectedResumeTemplateId}
              />
            </div>
          ) : selectedModule === 'cover_letter' ? (
            <div className="flex-1 flex flex-col min-h-0">
              <LatexWorkspace
                latexCode={coverLetterLatex}
                setLatexCode={setCoverLetterLatex}
                isGenerating={isGeneratingLatex}
                onGenerate={() => handleGenerateLatex('cover_letter')}
                title="LaTeX Cover Letter Builder"
                subtitle="Crafts a highly personalized executive narrative addressing target client pain points."
                fileName={`${candidateName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_cover_letter.tex`}
                type="cover_letter"
                activeModelUsed={latexModelUsed}
                resumeText={resume}
                setResumeText={setResume}
                jdText={jobDescription}
                setJdText={setJobDescription}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <LatexWorkspace
                latexCode={pitchLatex}
                setLatexCode={setPitchLatex}
                isGenerating={isGeneratingLatex}
                onGenerate={() => handleGenerateLatex('pitch')}
                title="60s Elevator Pitch & STAR Briefing"
                subtitle="Verbal elevator pitch introduction transcript plus STAR behavioral story structures."
                fileName={`${candidateName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_interview_brief.tex`}
                type="pitch"
                activeModelUsed={latexModelUsed}
                resumeText={resume}
                setResumeText={setResume}
                jdText={jobDescription}
                setJdText={setJobDescription}
              />
            </div>
          )}
        </div>
      )}

      {/* PRINT-ONLY LAYOUT */}
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
      <Footer />
    </div>
  );
}
