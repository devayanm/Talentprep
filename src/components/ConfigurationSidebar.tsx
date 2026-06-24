import React from "react";
import { Sparkles, AlertTriangle, Upload } from "lucide-react";
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
    <section className="lg:col-span-4 border-r border-[#141414] flex flex-col bg-[#E4E3E0] overflow-y-auto max-h-[calc(100vh-3.5rem)] divide-y divide-[#141414] no-print">
      {/* Preset Selector */}
      <div className="p-5">
        <h2 className="font-serif italic text-xs uppercase tracking-wider opacity-60 mb-3">Load Candidate Profile Preset</h2>
        <div className="grid grid-cols-2 gap-2">
          {SAMPLES.map((sample, i) => (
            <button
              key={i}
              onClick={() => onLoadPreset(sample)}
              className="p-3 text-left border border-[#141414] bg-white hover:bg-[#141414] hover:text-[#E4E3E0] transition text-xs flex flex-col justify-between h-20 group text-black cursor-pointer"
            >
              <span className="font-bold line-clamp-1">{sample.name}</span>
              <span className="text-[10px] opacity-60 group-hover:opacity-80 font-mono mt-1">
                {sample.domain} / {sample.vendor.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Candidate Intake */}
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif italic text-xs uppercase tracking-wider opacity-60">Candidate Intake</h2>
          <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 border border-[#141414] rounded">STEP 01</span>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-mono uppercase mb-1">Candidate Name</label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full bg-white border border-[#141414] px-3 py-2 text-xs focus:ring-1 focus:ring-[#F27D26] focus:outline-none font-mono text-black"
            />
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="block text-[11px] font-mono uppercase">Resume Details</label>
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F27D26] hover:text-[#141414] cursor-pointer border border-[#F27D26] hover:border-[#141414] px-1.5 py-0.5 rounded bg-white transition flex items-center gap-1">
                <Upload size={10} />
                <span>Upload PDF / DOCX</span>
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
              <div className="bg-white border border-[#141414] p-2 text-[10px] font-mono flex items-center gap-2 text-black mb-1 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-[#F27D26] animate-ping" />
                <span>Extracting Resume Content... Please wait</span>
              </div>
            )}
            
            {uploadErrorResume && (
              <div className="bg-red-50 border border-red-500 p-2 text-[10px] font-mono text-red-700 flex items-center justify-between mb-1">
                <span>Error: {uploadErrorResume}</span>
                <button onClick={() => setUploadErrorResume(null)} className="font-bold underline ml-1 cursor-pointer">X</button>
              </div>
            )}

            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste candidate resume text here..."
              className="w-full bg-white border border-[#141414] p-3 text-xs h-48 font-mono focus:outline-none resize-none text-black"
            />
            <span className="text-[10px] opacity-50 block text-right mt-1 font-mono">
              Characters: {resume.length}
            </span>
          </div>
        </div>
      </div>

      {/* Job Description details */}
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif italic text-xs uppercase tracking-wider opacity-60">Target Job Specs</h2>
          <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 border border-[#141414] rounded">STEP 02</span>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-mono uppercase mb-1">Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Sr. Systems Architect"
                className="w-full bg-white border border-[#141414] px-2.5 py-2 text-xs focus:outline-none font-mono text-black"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase mb-1">End Client</label>
              <input
                type="text"
                value={targetClient}
                onChange={(e) => setTargetClient(e.target.value)}
                placeholder="e.g. UnitedHealth Group"
                className="w-full bg-white border border-[#141414] px-2.5 py-2 text-xs focus:outline-none font-mono text-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-mono uppercase mb-1">Vendor</label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g. Centraprise"
                className="w-full bg-white border border-[#141414] px-2.5 py-2 text-xs focus:outline-none font-mono text-black"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase mb-1">Business Domain</label>
              <select
                value={domain}
                onChange={(e: any) => setDomain(e.target.value)}
                className="w-full bg-white border border-[#141414] px-2.5 py-2 text-xs focus:outline-none font-mono h-[34px] text-black"
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
            <div className="flex justify-between items-baseline mb-1">
              <label className="block text-[11px] font-mono uppercase">Job Description</label>
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F27D26] hover:text-[#141414] cursor-pointer border border-[#F27D26] hover:border-[#141414] px-1.5 py-0.5 rounded bg-white transition flex items-center gap-1">
                <Upload size={10} />
                <span>Upload PDF / DOCX</span>
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
              <div className="bg-white border border-[#141414] p-2 text-[10px] font-mono flex items-center gap-2 text-black mb-1 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-[#F27D26] animate-ping" />
                <span>Extracting Job Specs... Please wait</span>
              </div>
            )}
            
            {uploadErrorJd && (
              <div className="bg-red-50 border border-red-500 p-2 text-[10px] font-mono text-red-700 flex items-center justify-between mb-1">
                <span>Error: {uploadErrorJd}</span>
                <button onClick={() => setUploadErrorJd(null)} className="font-bold underline ml-1 cursor-pointer">X</button>
              </div>
            )}

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste Job Description..."
              className="w-full bg-white border border-[#141414] p-3 text-xs h-48 font-mono focus:outline-none resize-none text-black"
            />
            <span className="text-[10px] opacity-50 block text-right mt-1 font-mono">
              Characters: {jobDescription.length}
            </span>
          </div>
        </div>
      </div>

      {/* Difficulty Metrics & Controls */}
      <div className="p-5 space-y-4">
        <h2 className="font-serif italic text-xs uppercase tracking-wider opacity-60">Interview Difficulty Distribution</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span>BASIC (20% Target)</span>
              <span className="font-bold text-[#F27D26]">{basicDiff}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={basicDiff}
              onChange={(e) => onDiffChange('basic', parseInt(e.target.value))}
              className="w-full accent-[#141414]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span>INTERMEDIATE (50% Target)</span>
              <span className="font-bold text-[#F27D26]">{intermediateDiff}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={intermediateDiff}
              onChange={(e) => onDiffChange('intermediate', parseInt(e.target.value))}
              className="w-full accent-[#141414]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span>ADVANCED (30% Target)</span>
              <span className="font-bold text-[#F27D26]">{advancedDiff}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={advancedDiff}
              onChange={(e) => onDiffChange('advanced', parseInt(e.target.value))}
              className="w-full accent-[#141414]"
            />
          </div>

          <div className="p-3 bg-white border border-[#141414] text-[11px] font-mono flex items-center justify-between text-black">
            <span>TOTAL WEIGHT RATIO:</span>
            <span className={`font-bold ${isWeightValid ? 'text-green-600' : 'text-red-500'}`}>
              {sumOfDiffs}%
            </span>
          </div>
        </div>
      </div>

      {/* Gemini AI Engine Settings */}
      <div className="p-5 space-y-4 border-t border-[#141414]">
        <div className="flex items-center justify-between">
          <h2 className="font-serif italic text-xs uppercase tracking-wider opacity-60">Gemini LLM Settings</h2>
          <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 border border-[#141414] rounded text-black">OPTION</span>
        </div>
        
        <div className="space-y-3 font-mono text-xs">
          <div>
            <label className="block text-[11px] uppercase mb-1 font-bold text-gray-700">Active Engine Model</label>
            <select
              value={selectedModelName}
              onChange={(e) => setSelectedModelName(e.target.value)}
              className="w-full bg-white border border-[#141414] px-2.5 py-2 text-xs focus:ring-1 focus:ring-[#F27D26] focus:outline-none font-mono text-black"
            >
              <option value="auto">Auto-Fallback Mode (Cascading)</option>
              <option value="gemini-3.5-flash">Gemini 3.5 Flash (Newest / High Demand)</option>
              <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Fastest)</option>
              <option value="gemini-flash-latest">Gemini 1.5 Flash (Highly Stable)</option>
            </select>
            
            {/* Notice based on current selection */}
            <div className="mt-2 text-[10px] opacity-75 leading-normal space-y-1">
              {selectedModelName === 'auto' && (
                <p className="text-gray-600">
                  • System automatically tries <strong>3.5 Flash</strong>, fallbacks to <strong>3.1 Flash Lite</strong>, and then <strong>1.5 Flash</strong> if high-demand errors occur.
                </p>
              )}
              {selectedModelName === 'gemini-3.5-flash' && (
                <p className="text-amber-700">
                  • Uses the cutting-edge 3.5 Flash model. Note: Spikes in global usage can trigger temporary 503 errors.
                </p>
              )}
              {selectedModelName === 'gemini-3.1-flash-lite' && (
                <p className="text-green-700">
                  • Uses the fast, highly available 3.1 Lite model. Perfect for avoiding rate limits or peak-hour congestion.
                </p>
              )}
              {selectedModelName === 'gemini-flash-latest' && (
                <p className="text-gray-600">
                  • Uses standard 1.5 Flash. Reliable execution limits with high response coherence.
                </p>
              )}
            </div>
          </div>

          {/* High visibility alert if there's a rate-limit error */}
          {apiError && (apiError.includes("503") || apiError.includes("429") || apiError.includes("limit") || apiError.includes("demand") || apiError.includes("overloaded") || apiError.includes("Unavailable") || apiError.includes("demand")) && (
            <div className="bg-amber-100 border-2 border-amber-600 p-3 space-y-1.5 text-[11px] text-amber-950 leading-relaxed font-sans">
              <div className="flex items-center gap-1.5 font-bold font-mono text-amber-800 text-xs">
                <AlertTriangle size={14} className="text-amber-700 animate-bounce" />
                <span>RATE LIMIT / CONGESTION DETECTED</span>
              </div>
              <p>
                The Gemini API reported heavy traffic load or a rate limit (503/429) for the selected model.
              </p>
              <p className="font-semibold font-mono text-[10px] uppercase tracking-wide text-amber-800">
                💡 Recovery Steps:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[10px] leading-normal font-mono">
                <li>Switch model to <strong className="underline text-[#F27D26] hover:text-orange-800 cursor-pointer" onClick={() => setSelectedModelName("gemini-3.1-flash-lite")}>Gemini 3.1 Flash Lite</strong> (Highly Recommended).</li>
                <li>Or set to <strong className="underline text-[#F27D26] hover:text-orange-800 cursor-pointer" onClick={() => setSelectedModelName("auto")}>Auto-Fallback Mode</strong>.</li>
                <li>Then click <strong>Generate</strong> to retry!</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Generation Action */}
      <div className="p-5 bg-white space-y-3 sticky bottom-0 border-t border-[#141414] z-10 shadow-lg">
        <button
          onClick={onGenerate}
          disabled={isGenerating || !isWeightValid}
          className="w-full bg-[#141414] hover:bg-[#F27D26] disabled:bg-gray-400 disabled:hover:bg-gray-400 text-[#E4E3E0] disabled:text-gray-200 transition font-mono font-bold text-xs uppercase py-3 tracking-wider border border-[#141414] flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles size={14} className={isGenerating ? "animate-spin" : ""} />
          {isGenerating ? "Processing Synchronous Intel..." : "Generate Preparation Guide"}
        </button>
        <p className="text-[9px] text-center opacity-60 leading-normal font-mono text-gray-500">
          Creates professional multi-page prep materials with exact question budgets. No answers included.
        </p>
      </div>
    </section>
  );
}
