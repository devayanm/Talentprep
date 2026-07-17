import React from "react";
import { 
  Printer, 
  X, 
  ChevronRight, 
  Download, 
  FileText,
  HelpCircle
} from "lucide-react";

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
  onDownloadHtml: () => void;
  onDownloadMarkdown: () => void;
}

export default function PrintModal({ 
  isOpen, 
  onClose, 
  appUrl, 
  onDownloadHtml, 
  onDownloadMarkdown 
}: PrintModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md no-print p-4">
      <div className="glass-panel border border-white/15 max-w-lg w-full p-6 shadow-[0_10px_50px_rgba(0,0,0,0.5)] rounded-2xl space-y-5 font-mono text-xs bg-slate-900/90 text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5 text-orange-400">
            <Printer size={18} className="animate-pulse" />
            <span className="font-sans font-black uppercase text-sm tracking-wide">PDF GENERATION & PRINT PORTAL</span>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1.5 hover:bg-white/5 rounded-lg"
          >
            <X size={16} />
          </button>
        </div>

        <p className="leading-relaxed text-slate-300 font-sans">
          When applications are running inside interactive sandboxed environments, browsers block direct print commands for security. Choose one of our optimized options to bypass this block and get a beautiful, professional PDF:
        </p>

        <div className="grid grid-cols-1 gap-3">
          {/* Option 1: Clean Native Tab (Best for printing directly) */}
          <a
            href={`${window.location.origin}/?print=true`}
            target="_blank"
            rel="noreferrer"
            className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-orange-500/30 transition-all flex items-center justify-between group decoration-none text-white cursor-pointer"
          >
            <div>
              <strong className="text-xs uppercase block text-orange-400">1. Open in Clean New Tab &amp; Save as PDF</strong>
              <span className="text-[10px] text-slate-400 group-hover:text-slate-300 block mt-1 leading-normal font-sans">
                Recommended. Opens a dedicated full-page document view and triggers your browser's print dialog to "Save as PDF" instantly.
              </span>
            </div>
            <ChevronRight size={16} className="text-orange-400 group-hover:translate-x-1 transition-transform" />
          </a>

          {/* Option 2: Standalone HTML with automatic Print trigger */}
          <button
            onClick={onDownloadHtml}
            className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-orange-500/30 transition-all text-left flex items-center justify-between group cursor-pointer"
          >
            <div className="pr-4">
              <strong className="text-xs uppercase block text-slate-200">2. Download Styled HTML Guide</strong>
              <span className="text-[10px] text-slate-400 group-hover:text-slate-300 block mt-1 leading-normal font-sans">
                Downloads a self-contained offline HTML file with complete styling. Double-click the file to open and print anywhere.
              </span>
            </div>
            <Download size={16} className="text-slate-400 shrink-0 group-hover:text-white transition-colors" />
          </button>

          {/* Option 3: Raw Markdown */}
          <button
            onClick={onDownloadMarkdown}
            className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-orange-500/30 transition-all text-left flex items-center justify-between group cursor-pointer"
          >
            <div className="pr-4">
              <strong className="text-xs uppercase block text-slate-200">3. Download Raw Markdown (.md)</strong>
              <span className="text-[10px] text-slate-400 group-hover:text-slate-300 block mt-1 leading-normal font-sans">
                Perfect to import directly into Word, Notion, Obsidian, or Confluence.
              </span>
            </div>
            <FileText size={16} className="text-slate-400 shrink-0 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Print configuration hints */}
        <div className="bg-black/35 border border-white/5 rounded-xl p-4.5 space-y-2.5">
          <h4 className="text-[10px] font-bold uppercase text-orange-400 tracking-wider flex items-center gap-1.5 font-sans">
            <HelpCircle size={14} />
            <span>HOW TO GET PERFECT PDF FORMATTING:</span>
          </h4>
          <ul className="text-[10px] space-y-1.5 text-slate-300 leading-relaxed list-decimal pl-4 font-sans">
            <li>In the printer dialog, set <strong>Destination</strong> to <strong>"Save as PDF"</strong> or <strong>"Microsoft Print to PDF"</strong>.</li>
            <li>Expand <strong>"More settings"</strong>, and make sure <strong>"Background graphics"</strong> is checked to preserve custom colors.</li>
            <li>Uncheck <strong>"Headers and footers"</strong> so default browser date/URLs don't clutter your margins.</li>
            <li>Set paper size to <strong>Letter</strong> or <strong>A4</strong> and layout to <strong>Portrait</strong>.</li>
          </ul>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold transition rounded-xl cursor-pointer text-[10px] uppercase tracking-wider"
          >
            CLOSE PORTAL
          </button>
        </div>
      </div>
    </div>
  );
}

