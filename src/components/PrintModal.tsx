import React from "react";
import { 
  Printer, 
  X, 
  ChevronRight, 
  Download, 
  FileText 
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs no-print p-4">
      <div className="bg-[#E4E3E0] border-2 border-[#141414] max-w-lg w-full p-6 shadow-2xl space-y-5 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[#141414] pb-2">
          <div className="flex items-center gap-2.5 text-[#F27D26]">
            <Printer size={18} />
            <span className="font-extrabold uppercase text-sm">PDF GENERATION & PRINT PORTAL</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-black font-bold cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <p className="leading-relaxed">
          When applications are running inside an interactive iframe (like this workspace preview), browsers block direct print commands for security. Choose one of our optimized options to bypass this block and get a beautiful multi-page PDF document:
        </p>

        <div className="grid grid-cols-1 gap-3">
          {/* Option 1: Clean Native Tab (Best for printing directly) */}
          <a
            href={appUrl || window.location.href}
            target="_blank"
            rel="noreferrer"
            className="p-3 border border-[#141414] bg-white hover:bg-[#141414] hover:text-[#E4E3E0] transition flex items-center justify-between group decoration-none text-black"
          >
            <div>
              <strong className="text-xs uppercase block">1. Open in Clean New Tab & Print</strong>
              <span className="text-[10px] opacity-60 group-hover:opacity-80 block mt-0.5">
                Bypasses sandboxes. Recommended for native browser "Save as PDF".
              </span>
            </div>
            <ChevronRight size={16} />
          </a>

          {/* Option 2: Standalone HTML with automatic Print trigger */}
          <button
            onClick={onDownloadHtml}
            className="p-3 border border-[#141414] bg-white hover:bg-[#141414] hover:text-[#E4E3E0] transition text-left flex items-center justify-between group cursor-pointer"
          >
            <div>
              <strong className="text-xs uppercase block">2. Download Portable Styled HTML Guide</strong>
              <span className="text-[10px] opacity-60 group-hover:opacity-80 block mt-0.5">
                Includes full design styles. Double-click the file to print anywhere.
              </span>
            </div>
            <Download size={14} />
          </button>

          {/* Option 3: Raw Markdown */}
          <button
            onClick={onDownloadMarkdown}
            className="p-3 border border-[#141414] bg-white hover:bg-[#141414] hover:text-[#E4E3E0] transition text-left flex items-center justify-between group cursor-pointer"
          >
            <div>
              <strong className="text-xs uppercase block">3. Download Raw Markdown (.md)</strong>
              <span className="text-[10px] opacity-60 group-hover:opacity-80 block mt-0.5">
                Perfect to import directly into Word, Notion, Obsidian, or Confluence.
              </span>
            </div>
            <FileText size={14} />
          </button>
        </div>

        {/* Print configuration hints */}
        <div className="bg-white border border-[#141414] p-3 space-y-2">
          <h4 className="text-[10px] font-extrabold uppercase text-[#F27D26] tracking-wider">
            PRO-TIPS FOR PERFECT PDF FORMATTING:
          </h4>
          <ul className="text-[10px] space-y-1 opacity-85 leading-normal list-decimal pl-4">
            <li>Under <strong>Destination</strong>, select <strong>"Save as PDF"</strong> or <strong>"Microsoft Print to PDF"</strong>.</li>
            <li>Expand <strong>"More settings"</strong>, and make sure <strong>"Background graphics"</strong> is checked to preserve the colored highlights.</li>
            <li>Uncheck <strong>"Headers and footers"</strong> so the page URLs and dates don't clutter page margins.</li>
            <li>Set paper size to <strong>Letter</strong> or <strong>A4</strong> and layout to <strong>Portrait</strong>.</li>
          </ul>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#141414] text-[#E4E3E0] hover:bg-opacity-90 font-bold transition cursor-pointer text-[11px] uppercase tracking-wider"
          >
            CLOSE PORTAL
          </button>
        </div>
      </div>
    </div>
  );
}
