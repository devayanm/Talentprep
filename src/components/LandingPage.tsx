import React from "react";
import { 
  Sparkles, 
  ArrowRight, 
  Briefcase, 
  FileText, 
  Mail, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Award,
  ArrowUpRight,
  Code2,
  CheckCircle2,
  HelpCircle
} from "lucide-react";

interface LandingPageProps {
  onSelectModule: (module: 'screen_prep' | 'resume' | 'cover_letter' | 'pitch') => void;
  hasApiKey: boolean | null;
}

export default function LandingPage({ onSelectModule, hasApiKey }: LandingPageProps) {
  return (
    <div className="flex-1 bg-slate-950 text-white overflow-y-auto font-sans relative">
      {/* Decorative background gradients */}
      <div className="absolute w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[140px] -top-80 -left-60 pointer-events-none"></div>
      <div className="absolute w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-[140px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[160px] -bottom-80 -right-60 pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 max-w-7xl mx-auto text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-orange-400 mb-6 animate-fade-in shadow-[0_4px_12px_rgba(242,125,38,0.05)]">
          <Sparkles size={12} className="text-orange-400" />
          <span>V2.5 Powered by Gemini Pro AI</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white font-sans max-w-4xl mx-auto leading-tight">
          Unlock Ultimate Interview Readiness with <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent">TalentPrep Pro</span>
        </h1>
        
        <p className="mt-6 text-base md:text-lg text-slate-400 font-sans max-w-2xl mx-auto leading-relaxed">
          The unified full-stack job preparation suite for staffing partners, agencies, and high-impact candidates. Instantly transform resumes and job descriptions into tailored question banks and pixel-perfect compilable LaTeX documents.
        </p>

        {hasApiKey === false && (
          <div className="mt-8 max-w-md mx-auto p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-mono text-rose-300 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Note: Configure your GEMINI_API_KEY in Settings &gt; Secrets to unlock AI compile workflows.</span>
          </div>
        )}
      </section>

      {/* Main Suite Capabilities Grid (Cards to access modules) */}
      <section className="px-6 pb-20 max-w-7xl mx-auto z-10 relative">
        <div className="text-center mb-12">
          <h2 className="text-xs font-mono font-black tracking-widest text-orange-400 uppercase">ACCESS THE CORE MODULES</h2>
          <p className="text-2xl font-extrabold text-white mt-1">Select an active workstation below</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Card 1: Screen Prep Bank */}
          <div 
            onClick={() => onSelectModule('screen_prep')}
            className="group relative bg-slate-900/40 border border-white/10 hover:border-orange-500/40 hover:bg-slate-900/60 p-8 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(242,125,38,0.1)] flex flex-col justify-between"
          >
            <div className="absolute top-4 right-4 p-2 bg-white/5 group-hover:bg-orange-500/10 text-slate-400 group-hover:text-orange-400 rounded-lg transition-colors">
              <ArrowUpRight size={16} />
            </div>
            <div>
              <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl w-fit mb-6">
                <Briefcase size={24} />
              </div>
              <h3 className="text-xl font-bold text-white font-sans group-hover:text-orange-400 transition-colors">
                Screen Prep Bank
              </h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                Generate highly customized vendor-level and client-level technical interview question banks by matching candidate resumes directly against the target job description. Includes interactive scorekeeping, status boards, and search indexing.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-400 border-t border-white/5 pt-5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-orange-400" />
                  <span>Interactive checklists with notes and progress memory</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-orange-400" />
                  <span>Staggered difficulty weights: Basic, Intermediate, Advanced</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 flex items-center gap-1.5 text-xs font-mono font-bold text-orange-400 group-hover:underline">
              <span>Open Workstation</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: ATS LaTeX Resume */}
          <div 
            onClick={() => onSelectModule('resume')}
            className="group relative bg-slate-900/40 border border-white/10 hover:border-pink-500/40 hover:bg-slate-900/60 p-8 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(236,72,153,0.1)] flex flex-col justify-between"
          >
            <div className="absolute top-4 right-4 p-2 bg-white/5 group-hover:bg-pink-500/10 text-slate-400 group-hover:text-pink-400 rounded-lg transition-colors">
              <ArrowUpRight size={16} />
            </div>
            <div>
              <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl w-fit mb-6">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-bold text-white font-sans group-hover:text-pink-400 transition-colors">
                ATS LaTeX Resume Reformatter
              </h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                Realign and optimize candidate experience for strict Job Description keyword matching. Compiles immediately into a stunning, fully-formatted LaTeX resume featuring layout page volume limits (strict 1-page, strict 2-page, or natural length controls).
              </p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-400 border-t border-white/5 pt-5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-pink-400" />
                  <span>Strict single/double page target ceiling compiler overrides</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-pink-400" />
                  <span>Real-time portrait document previewer & download exports</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 flex items-center gap-1.5 text-xs font-mono font-bold text-pink-400 group-hover:underline">
              <span>Open Workstation</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: LaTeX Cover Letter */}
          <div 
            onClick={() => onSelectModule('cover_letter')}
            className="group relative bg-slate-900/40 border border-white/10 hover:border-indigo-500/40 hover:bg-slate-900/60 p-8 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(99,102,241,0.1)] flex flex-col justify-between"
          >
            <div className="absolute top-4 right-4 p-2 bg-white/5 group-hover:bg-indigo-500/10 text-slate-400 group-hover:text-indigo-400 rounded-lg transition-colors">
              <ArrowUpRight size={16} />
            </div>
            <div>
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit mb-6">
                <Mail size={24} />
              </div>
              <h3 className="text-xl font-bold text-white font-sans group-hover:text-indigo-400 transition-colors">
                LaTeX Cover Letter Builder
              </h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                Build elegant, targeted cover letters that capture high-impact achievements from candidate experience and match them to the hiring team's explicit codebase and platform pain points.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-400 border-t border-white/5 pt-5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-indigo-400" />
                  <span>Cohesive typography & styling presets matching your resume</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-indigo-400" />
                  <span>Overleaf-friendly code outputs with one-click print download</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-400 group-hover:underline">
              <span>Open Workstation</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Pitch & Cheat-Sheet */}
          <div 
            onClick={() => onSelectModule('pitch')}
            className="group relative bg-slate-900/40 border border-white/10 hover:border-violet-500/40 hover:bg-slate-900/60 p-8 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(139,92,246,0.1)] flex flex-col justify-between"
          >
            <div className="absolute top-4 right-4 p-2 bg-white/5 group-hover:bg-violet-500/10 text-slate-400 group-hover:text-violet-400 rounded-lg transition-colors">
              <ArrowUpRight size={16} />
            </div>
            <div>
              <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl w-fit mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-white font-sans group-hover:text-violet-400 transition-colors">
                60s Elevator Pitch & STAR Briefing
              </h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                Unlock optimized spoken scripts to effortlessly master high-stakes candidate introductions. Formulates exact STAR narrative structures for key challenges matching Job Description requirements.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-400 border-t border-white/5 pt-5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-violet-400" />
                  <span>Ready-to-speak 60-second verbal elevator pitch layout</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-violet-400" />
                  <span>Structured STAR blueprints targeting conflict and performance</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 flex items-center gap-1.5 text-xs font-mono font-bold text-violet-400 group-hover:underline">
              <span>Open Workstation</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits & Value Proposition Bento Panel */}
      <section className="bg-slate-950 px-6 py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xs font-mono font-black tracking-widest text-orange-400 uppercase">PRODUCT BENEFITS</h2>
            <p className="text-2xl font-extrabold text-white mt-1">Engineered for Technical Recruitment Teams</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6.5 bg-slate-900/20 border border-white/5 rounded-xl flex flex-col gap-4">
              <div className="p-2.5 bg-white/5 text-orange-400 rounded-lg w-fit">
                <Award size={18} />
              </div>
              <h4 className="text-base font-bold text-white font-sans">ATS Match Optimization</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                By programmatically aligning descriptions with target keyword matrices and industry phrasing, resumes consistently clear agency filters and high-volume corporate screeners.
              </p>
            </div>

            <div className="p-6.5 bg-slate-900/20 border border-white/5 rounded-xl flex flex-col gap-4">
              <div className="p-2.5 bg-white/5 text-pink-400 rounded-lg w-fit">
                <Layers size={18} />
              </div>
              <h4 className="text-base font-bold text-white font-sans">Strict Page Target Overrides</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Our LaTeX rendering engine leverages volume bounds to compress or expand resume components safely, guaranteeing compliance with single or double-page formatting standards without cutting off valuable sections.
              </p>
            </div>

            <div className="p-6.5 bg-slate-900/20 border border-white/5 rounded-xl flex flex-col gap-4">
              <div className="p-2.5 bg-white/5 text-indigo-400 rounded-lg w-fit">
                <ShieldCheck size={18} />
              </div>
              <h4 className="text-base font-bold text-white font-sans">One-Click LaTeX Compilation</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Instantly copy clean LaTeX code to Overleaf or hit "Save PDF / Print" to create structured local documents. Standardized, professional-grade typography is maintained everywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="px-6 py-16 max-w-4xl mx-auto z-10 relative">
        <div className="text-center mb-12">
          <h2 className="text-xs font-mono font-black tracking-widest text-orange-400 uppercase">FAQ</h2>
          <p className="text-2xl font-extrabold text-white mt-1">Frequently Asked Questions</p>
        </div>

        <div className="space-y-4">
          <div className="p-5 bg-slate-900/35 border border-white/5 rounded-xl">
            <h4 className="text-xs font-bold text-white font-mono uppercase mb-2">Q: What is a LaTeX document, and why is it preferred over Word?</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              LaTeX is a high-quality typesetting system widely preferred in technical fields. It guarantees beautiful spacing, precise typography, and standardized layouts. It is far more robust against ATS parser rendering errors than custom-styled Word files.
            </p>
          </div>
          <div className="p-5 bg-slate-900/35 border border-white/5 rounded-xl">
            <h4 className="text-xs font-bold text-white font-mono uppercase mb-2">Q: How do the page limit constraints work?</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              When a limit is configured (e.g. Strict 1-Page), our system prompts the underlying AI engine to optimize descriptions, prioritize high-impact achievements, and use specific LaTeX micro-spacing directives to ensure the resulting code compiles strictly within your target page count.
            </p>
          </div>
          <div className="p-5 bg-slate-900/35 border border-white/5 rounded-xl">
            <h4 className="text-xs font-bold text-white font-mono uppercase mb-2">Q: Can I edit the generated LaTeX code?</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Absolutely! Every document generated features an integrated live split-screen workspace where you can directly modify the raw LaTeX source code and see your edits reflect instantly in our simulated real-time PDF preview.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
