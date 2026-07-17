import React from "react";
import { Sparkles, AlertTriangle, Upload, User, Briefcase, Cpu, Sliders } from "lucide-react";
import { SAMPLES, SamplePreset } from "../data/samples";

interface ConfigurationSidebarProps {
  resume: string;
  setResume: (v: string) => void;
  jobDescription: string;
  setJobDescription: (v: string) => void;
  candidateName: string;
  setCandidateName: (v: string) => void;
  targetRole: string;
  setTargetRole: (v: string) => void;
  targetClient: string;
  setTargetClient: (v: string) => void;
  vendorName: string;
  setVendorName: (v: string) => void;
  domain: 'Healthcare' | 'Banking' | 'Retail' | 'Telecom' | 'Manufacturing' | 'General';
  setDomain: (v: 'Healthcare' | 'Banking' | 'Retail' | 'Telecom' | 'Manufacturing' | 'General') => void;
  basicDiff: number;
  intermediateDiff: number;
  advancedDiff: number;
  onDiffChange: (type: 'basic' | 'intermediate' | 'advanced', val: number) => void;
  selectedModelName: string;
  setSelectedModelName: (v: string) => void;
  isGenerating: boolean;
  apiError: string | null;
  onGenerate: () => void;
  onLoadPreset: (preset: SamplePreset) => void;
  
  // Module controls
  selectedModule: 'screen_prep' | 'resume' | 'cover_letter' | 'pitch';
  isGeneratingLatex: boolean;
  onGenerateLatex: (mode: 'resume' | 'cover_letter' | 'pitch') => void;
}

export default function ConfigurationSidebar({
  resume,
  setResume,
  jobDescription,
  setJobDescription,
  candidateName,
  setCandidateName,
  targetRole,
  setTargetRole,
  targetClient,
  setTargetClient,
  vendorName,
  setVendorName,
  domain,
  setDomain,
  basicDiff,
  intermediateDiff,
  advancedDiff,
  onDiffChange,
  selectedModelName,
  setSelectedModelName,
  isGenerating,
  apiError,
  onGenerate,
  onLoadPreset,
  selectedModule,
  isGeneratingLatex,
  onGenerateLatex,
}: ConfigurationSidebarProps) {
  const sumOfDiffs = basicDiff + intermediateDiff + advancedDiff;
  const isWeightValid = sumOfDiffs === 100;

  // File uploading/parsing states
  const [isExtractingResume, setIsExtractingResume] = React.useState(false);
  const [isExtractingJd, setIsExtractingJd] = React.useState(false);
  const [uploadErrorResume, setUploadErrorResume] = React.useState<string | null>(null);
  const [uploadErrorJd, setUploadErrorJd] = React.useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, target: "resume" | "jd") => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (target === "resume") {
      setIsExtractingResume(true);
      setUploadErrorResume(null);
    } else {
      setIsExtractingJd(true);
      setUploadErrorJd(null);
    }

    try {
      // Handle plain text files instantly locally
      if (file.name.toLowerCase().endsWith(".txt")) {
        const textReader = new FileReader();
        textReader.onload = (e) => {
          const text = e.target?.result as string;
          if (target === "resume") {
            setResume(text);
            setIsExtractingResume(false);
            
            // Smart heuristic to find candidate name if empty/default
            if (text.trim()) {
              const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
              if (lines.length > 0 && lines[0].length < 40 && !lines[0].toLowerCase().includes("resume") && !lines[0].toLowerCase().includes("curriculum")) {
                const currentNameClean = candidateName.trim().toLowerCase();
                if (!currentNameClean || currentNameClean === "daroor vishal" || currentNameClean === "candidate profile") {
                  setCandidateName(lines[0]);
                }
              }
            }
          } else {
            setJobDescription(text);
            setIsExtractingJd(false);
          }
        };
        textReader.onerror = () => {
          throw new Error("Failed to read text file.");
        };
        textReader.readAsText(file);
        return;
      }

      // Read binary files as Base64 for server processing
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64WithHeader = e.target?.result as string;
          if (!base64WithHeader) {
            throw new Error("Could not load file data.");
          }
          const base64String = base64WithHeader.split(",")[1];

          const response = await fetch("/api/extract-text", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fileBase64: base64String,
              fileName: file.name,
              mimeType: file.type,
            }),
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || `HTTP ${response.status} from extractor`);
          }

          const data = await response.json();
          if (data.text) {
            if (target === "resume") {
              setResume(data.text);
              
              // Smart heuristic to find candidate name if empty/default
              if (data.text.trim()) {
                const lines = data.text.split("\n").map(l => l.trim()).filter(Boolean);
                if (lines.length > 0 && lines[0].length < 40 && !lines[0].toLowerCase().includes("resume") && !lines[0].toLowerCase().includes("curriculum")) {
                  const currentNameClean = candidateName.trim().toLowerCase();
                  if (!currentNameClean || currentNameClean === "daroor vishal" || currentNameClean === "candidate profile") {
                    setCandidateName(lines[0]);
                  }
                }
              }
            } else {
              setJobDescription(data.text);
            }
          } else {
            throw new Error("No text content was returned from the document.");
          }
        } catch (err: any) {
          console.error("Extraction error:", err);
          if (target === "resume") {
            setUploadErrorResume(err.message || "Failed to process document.");
          } else {
            setUploadErrorJd(err.message || "Failed to process document.");
          }
        } finally {
          if (target === "resume") {
            setIsExtractingResume(false);
          } else {
            setIsExtractingJd(false);
          }
        }
      };
      
      reader.onerror = () => {
        if (target === "resume") {
          setUploadErrorResume("Error reading file binary.");
          setIsExtractingResume(false);
        } else {
          setUploadErrorJd("Error reading file binary.");
          setIsExtractingJd(false);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      if (target === "resume") {
        setUploadErrorResume(err.message || "Error starting file processing.");
        setIsExtractingResume(false);
      } else {
        setUploadErrorJd(err.message || "Error starting file processing.");
        setIsExtractingJd(false);
      }
    }
  };

  return (
    <section className="lg:col-span-4 border-r border-white/10 flex flex-col bg-slate-950/20 overflow-y-auto max-h-[calc(100vh-4rem)] divide-y divide-white/10 no-print">
      {/* Preset Selector */}
      <div className="p-5">
        <h2 className="text-[11px] font-mono tracking-wider text-slate-400 uppercase mb-3 flex items-center gap-1.5">
          <Sliders size={13} className="text-orange-400" />
          <span>Load Candidate Profile Preset</span>
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {SAMPLES.map((sample, i) => (
            <button
              key={i}
              onClick={() => onLoadPreset(sample)}
              className="p-3 text-left glass-card glass-card-hover rounded-xl transition flex flex-col justify-between h-20 group text-white cursor-pointer"
            >
              <span className="font-sans font-bold text-xs group-hover:text-orange-400 transition-colors line-clamp-1">{sample.name}</span>
              <span className="text-[10px] text-slate-400 font-mono mt-1">
                {sample.domain} / {sample.vendor.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Candidate Intake */}
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-mono tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
            <User size={13} className="text-orange-400" />
            <span>Candidate Intake</span>
          </h2>
          <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 border border-white/10 rounded text-slate-400">STEP 01</span>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Candidate Name</label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full glass-input px-3 py-2 rounded-lg text-xs focus:outline-none font-sans"
            />
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label className="block text-[10px] font-mono text-slate-400 uppercase">Resume Details</label>
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400 hover:text-white cursor-pointer border border-orange-500/30 hover:border-orange-500 hover:bg-orange-500/10 px-2 py-0.5 rounded-lg transition-all flex items-center gap-1">
                <Upload size={10} />
                <span>Upload PDF/DOCX</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "resume")}
                  disabled={isExtractingResume}
                />
              </label>
            </div>
            
            {isExtractingResume && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2 text-[10px] font-mono flex items-center gap-2 text-orange-300 mb-1.5 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                <span>Extracting Resume Content... Please wait</span>
              </div>
            )}
            
            {uploadErrorResume && (
              <div className="bg-rose-500/15 border border-rose-500/30 rounded-lg p-2 text-[10px] font-mono text-rose-300 flex items-center justify-between mb-1.5">
                <span>Error: {uploadErrorResume}</span>
                <button onClick={() => setUploadErrorResume(null)} className="font-bold underline ml-1 cursor-pointer">X</button>
              </div>
            )}

            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste candidate resume text here..."
              className="w-full glass-input p-3 text-xs h-40 font-mono rounded-lg focus:outline-none resize-none"
            />
            <span className="text-[10px] text-slate-500 block text-right mt-1 font-mono">
              Characters: {resume.length}
            </span>
          </div>
        </div>
      </div>

      {/* Job Description details */}
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-mono tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
            <Briefcase size={13} className="text-orange-400" />
            <span>Target Job Specs</span>
          </h2>
          <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 border border-white/10 rounded text-slate-400">STEP 02</span>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Sr. Systems Architect"
                className="w-full glass-input px-3 py-2 rounded-lg text-xs focus:outline-none font-sans"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">End Client</label>
              <input
                type="text"
                value={targetClient}
                onChange={(e) => setTargetClient(e.target.value)}
                placeholder="e.g. UnitedHealth Group"
                className="w-full glass-input px-3 py-2 rounded-lg text-xs focus:outline-none font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Vendor</label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g. Centraprise"
                className="w-full glass-input px-3 py-2 rounded-lg text-xs focus:outline-none font-sans"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Business Domain</label>
              <select
                value={domain}
                onChange={(e: any) => setDomain(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-lg text-xs focus:outline-none font-sans h-[34px] appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.6)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem', backgroundRepeat: 'no-repeat' }}
              >
                <option value="Healthcare">Healthcare</option>
                <option value="Banking">Banking</option>
                <option value="Retail">Retail</option>
                <option value="Telecom">Telecom</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="General">General/Other</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label className="block text-[10px] font-mono text-slate-400 uppercase">Job Description</label>
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400 hover:text-white cursor-pointer border border-orange-500/30 hover:border-orange-500 hover:bg-orange-500/10 px-2 py-0.5 rounded-lg transition-all flex items-center gap-1">
                <Upload size={10} />
                <span>Upload PDF/DOCX</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "jd")}
                  disabled={isExtractingJd}
                />
              </label>
            </div>

            {isExtractingJd && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2 text-[10px] font-mono flex items-center gap-2 text-orange-300 mb-1.5 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                <span>Extracting Job Specs... Please wait</span>
              </div>
            )}
            
            {uploadErrorJd && (
              <div className="bg-rose-500/15 border border-rose-500/30 rounded-lg p-2 text-[10px] font-mono text-rose-300 flex items-center justify-between mb-1.5">
                <span>Error: {uploadErrorJd}</span>
                <button onClick={() => setUploadErrorJd(null)} className="font-bold underline ml-1 cursor-pointer">X</button>
              </div>
            )}

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste Job Description..."
              className="w-full glass-input p-3 text-xs h-40 font-mono rounded-lg focus:outline-none resize-none"
            />
            <span className="text-[10px] text-slate-500 block text-right mt-1 font-mono">
              Characters: {jobDescription.length}
            </span>
          </div>
        </div>
      </div>

      {/* Difficulty Metrics & Controls */}
      {selectedModule === 'screen_prep' && (
        <div className="p-5 space-y-4">
          <h2 className="text-[11px] font-mono tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
            <Briefcase size={13} className="text-orange-400" />
            <span>Interview Difficulty Distribution</span>
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300 text-[11px]">BASIC</span>
                <span className="font-bold text-orange-400">{basicDiff}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={basicDiff}
                onChange={(e) => onDiffChange('basic', parseInt(e.target.value))}
                className="w-full accent-orange-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300 text-[11px]">INTERMEDIATE</span>
                <span className="font-bold text-orange-400">{intermediateDiff}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={intermediateDiff}
                onChange={(e) => onDiffChange('intermediate', parseInt(e.target.value))}
                className="w-full accent-orange-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300 text-[11px]">ADVANCED</span>
                <span className="font-bold text-orange-400">{advancedDiff}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={advancedDiff}
                onChange={(e) => onDiffChange('advanced', parseInt(e.target.value))}
                className="w-full accent-orange-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            <div className="p-3 bg-black/30 border border-white/5 rounded-lg text-xs font-mono flex items-center justify-between text-slate-300">
              <span>TOTAL WEIGHT RATIO:</span>
              <span className={`font-bold ${isWeightValid ? 'text-emerald-400' : 'text-rose-400 animate-pulse'}`}>
                {sumOfDiffs}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Gemini AI Engine Settings */}
      <div className="p-5 space-y-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-mono tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
            <Cpu size={13} className="text-orange-400" />
            <span>Gemini LLM Settings</span>
          </h2>
          <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 border border-white/10 rounded text-slate-400">OPTION</span>
        </div>
        
        <div className="space-y-3 font-mono text-xs">
          <div>
            <label className="block text-[10px] uppercase mb-1.5 font-bold text-slate-400">Active Engine Model</label>
            <select
              value={selectedModelName}
              onChange={(e) => setSelectedModelName(e.target.value)}
              className="w-full glass-input px-3 py-2 rounded-lg text-xs focus:outline-none appearance-none h-[34px]"
              style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.6)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem', backgroundRepeat: 'no-repeat' }}
            >
              <option value="auto">Auto-Fallback Mode (Cascading)</option>
              <option value="gemini-3.5-flash">Gemini 3.5 Flash (Newest / High Demand)</option>
              <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Fastest)</option>
              <option value="gemini-flash-latest">Gemini 1.5 Flash (Highly Stable)</option>
            </select>
            
            {/* Notice based on current selection */}
            <div className="mt-2.5 text-[10px] text-slate-400 leading-relaxed space-y-1">
              {selectedModelName === 'auto' && (
                <p>
                  • System automatically tries <strong className="text-orange-400">3.5 Flash</strong>, fallbacks to <strong className="text-orange-400">3.1 Flash Lite</strong>, and then <strong className="text-orange-400">1.5 Flash</strong> if high-demand errors occur.
                </p>
              )}
              {selectedModelName === 'gemini-3.5-flash' && (
                <p className="text-orange-300">
                  • Uses the cutting-edge 3.5 Flash model. Note: Spikes in global usage can trigger temporary 503 errors.
                </p>
              )}
              {selectedModelName === 'gemini-3.1-flash-lite' && (
                <p className="text-emerald-300">
                  • Uses the fast, highly available 3.1 Lite model. Perfect for avoiding rate limits or peak-hour congestion.
                </p>
              )}
              {selectedModelName === 'gemini-flash-latest' && (
                <p className="text-slate-400 font-sans">
                  • Uses standard 1.5 Flash. Reliable execution limits with high response coherence.
                </p>
              )}
            </div>
          </div>

          {/* High visibility alert if there's a rate-limit error */}
          {apiError && (apiError.includes("503") || apiError.includes("429") || apiError.includes("limit") || apiError.includes("demand") || apiError.includes("overloaded") || apiError.includes("Unavailable") || apiError.includes("demand")) && (
            <div className="bg-amber-500/10 border-2 border-amber-500/20 rounded-xl p-3.5 space-y-2 text-[11px] text-amber-200 leading-relaxed font-sans">
              <div className="flex items-center gap-1.5 font-bold font-mono text-amber-400 text-xs">
                <AlertTriangle size={14} className="text-amber-400 animate-bounce" />
                <span>RATE LIMIT / CONGESTION DETECTED</span>
              </div>
              <p>
                The Gemini API reported heavy traffic load or a rate limit (503/429) for the selected model.
              </p>
              <p className="font-semibold font-mono text-[10px] uppercase tracking-wide text-amber-400">
                💡 Recovery Steps:
              </p>
              <ul className="list-disc pl-4 space-y-1.5 text-[10px] leading-normal font-mono text-amber-300/95">
                <li>Switch model to <strong className="underline text-orange-400 hover:text-orange-300 cursor-pointer" onClick={() => setSelectedModelName("gemini-3.1-flash-lite")}>Gemini 3.1 Flash Lite</strong>.</li>
                <li>Or set to <strong className="underline text-orange-400 hover:text-orange-300 cursor-pointer" onClick={() => setSelectedModelName("auto")}>Auto-Fallback Mode</strong>.</li>
                <li>Then click <strong>Generate</strong> to retry!</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Generation Action */}
      <div className="p-5 bg-slate-950/80 backdrop-blur-md space-y-3 sticky bottom-0 border-t border-white/10 z-10 shadow-2xl">
        {selectedModule === 'screen_prep' ? (
          <>
            <button
              onClick={onGenerate}
              disabled={isGenerating || !isWeightValid}
              className="w-full glass-button-primary disabled:opacity-40 disabled:pointer-events-none text-white transition font-mono font-bold text-xs uppercase py-3.5 rounded-xl tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={14} className={isGenerating ? "animate-spin text-white" : "text-white"} />
              {isGenerating ? "Processing Synchronous Intel..." : "Generate Preparation Guide"}
            </button>
            <p className="text-[9px] text-center text-slate-400 leading-normal font-mono">
              Creates professional multi-page prep materials with exact question budgets. No answers included.
            </p>
          </>
        ) : (
          <>
            <button
              onClick={() => onGenerateLatex(selectedModule as any)}
              disabled={isGeneratingLatex}
              className="w-full glass-button-primary disabled:opacity-40 disabled:pointer-events-none text-white transition font-mono font-bold text-xs uppercase py-3.5 rounded-xl tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={14} className={isGeneratingLatex ? "animate-spin text-white" : "text-white"} />
              {isGeneratingLatex ? "Compiling LaTeX Live..." : `Generate LaTeX ${selectedModule === 'resume' ? 'Resume' : selectedModule === 'cover_letter' ? 'Cover Letter' : 'Briefing'}`}
            </button>
            <p className="text-[9px] text-center text-slate-400 leading-normal font-mono">
              {selectedModule === 'resume' 
                ? "Re-aligns experience with JD keywords and reformats resume to ATS standards."
                : selectedModule === 'cover_letter'
                ? "Compiles matching cover letter addressing target client challenges."
                : "Builds high-impact elevator pitch transcript and behavioral STAR cheat-sheet."}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
