import React, { useState, useEffect } from "react";
import { 
  Copy, 
  Download, 
  Printer, 
  Sparkles, 
  Edit3, 
  Eye, 
  Check, 
  HelpCircle,
  FileText,
  Clock,
  ExternalLink
} from "lucide-react";

interface LatexWorkspaceProps {
  latexCode: string;
  setLatexCode: (code: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  title: string;
  subtitle: string;
  fileName: string;
  type: "resume" | "cover_letter" | "pitch";
  targetPages?: string;
  setTargetPages?: (pages: string) => void;
  activeModelUsed: string | null;
}

// Simple LaTeX to HTML Parser for live simulation preview
function parseLatexToHtml(latex: string, type: "resume" | "cover_letter" | "pitch") {
  if (!latex) return "";

  // Strip code block markers if any (e.g. ```latex ... ```)
  let clean = latex.trim();
  if (clean.startsWith("```")) {
    const lines = clean.split("\n");
    if (lines[0].includes("latex") || lines[0] === "```") {
      lines.shift();
    }
    if (lines[lines.length - 1] === "```") {
      lines.pop();
    }
    clean = lines.join("\n");
  }

  // Extract content between \begin{document} and \end{document} if present
  const docBeginIndex = clean.indexOf("\\begin{document}");
  const docEndIndex = clean.indexOf("\\end{document}");
  let bodyContent = clean;
  if (docBeginIndex !== -1) {
    bodyContent = clean.slice(docBeginIndex + 16, docEndIndex !== -1 ? docEndIndex : undefined);
  }

  // Helper to escape LaTeX special characters for HTML rendering
  const unescapeLatexChars = (text: string) => {
    return text
      .replace(/\\%/g, "%")
      .replace(/\\&/g, "&")
      .replace(/\\_/g, "_")
      .replace(/\\\$/g, "$")
      .replace(/\\{/g, "{")
      .replace(/\\}/g, "}")
      .replace(/\\\|/g, "|")
      .replace(/\\textbullet\s*/g, "• ")
      .replace(/~/g, " ");
  };

  // Convert center environment
  bodyContent = bodyContent.replace(/\\begin{center}([\s\S]*?)\\end{center}/g, (_, inner) => {
    // Parse name and details inside center
    let centerHtml = inner.trim();
    // Huge bold name
    centerHtml = centerHtml.replace(/\\textbf{\\Huge\s*([^}]+)}/g, '<h1 class="text-3xl font-extrabold tracking-tight text-slate-900 leading-normal">$1</h1>');
    centerHtml = centerHtml.replace(/\\textbf{\\Huge\s*([^}]+)}/g, '<h1 class="text-3xl font-extrabold tracking-tight text-slate-900 leading-normal">$1</h1>'); // Double pass
    // Large bold name
    centerHtml = centerHtml.replace(/\\textbf{\\Large\s*([^}]+)}/g, '<h2 class="text-xl font-bold tracking-tight text-slate-800">$1</h2>');
    // Normal size details
    centerHtml = centerHtml.replace(/\\small\s*([\s\S]+)/g, '<div class="text-xs text-slate-600 font-sans mt-2 tracking-wide font-medium">$1</div>');
    return `<div class="text-center pb-4 border-b border-slate-100">${centerHtml}</div>`;
  });

  // Convert href
  bodyContent = bodyContent.replace(/\\href{([^}]+)}{([^}]+)}/g, (_, url, text) => {
    return `<a href="${url}" class="text-orange-600 hover:underline inline-flex items-center gap-0.5" target="_blank">${unescapeLatexChars(text)}</a>`;
  });

  // Convert section headings
  bodyContent = bodyContent.replace(/\\section\*?{([^}]+)}/g, (_, title) => {
    const heading = unescapeLatexChars(title).toUpperCase();
    return `<div class="mt-5 mb-3"><h2 class="text-xs font-black uppercase tracking-wider text-orange-600 font-mono mb-1">${heading}</h2><hr class="border-t border-slate-800"></div>`;
  });

  // Convert custom resumeSubheading{Company}{Dates}{Role}{Location}
  // Standard command: \resumeSubheading{Company}{Dates}{Role}{Location}
  bodyContent = bodyContent.replace(/\\resumeSubheading\s*{([^}]+)}\s*{([^}]+)}\s*{([^}]+)}\s*{([^}]+)}/g, (_, comp, dates, role, loc) => {
    return `
      <div class="mt-3">
        <div class="flex justify-between items-baseline font-sans">
          <strong class="text-sm text-slate-900 font-bold">${unescapeLatexChars(comp)}</strong>
          <span class="text-xs text-slate-700 font-mono font-medium">${unescapeLatexChars(dates)}</span>
        </div>
        <div class="flex justify-between items-baseline font-sans mt-0.5">
          <em class="text-xs text-slate-700 font-semibold italic">${unescapeLatexChars(role)}</em>
          <span class="text-xs text-slate-500 font-sans">${unescapeLatexChars(loc)}</span>
        </div>
      </div>
    `;
  });

  // Convert itemizes and description items
  bodyContent = bodyContent.replace(/\\resumeItem\s*{([^}]+)}/g, (_, text) => {
    return `<li class="text-xs text-slate-700 font-sans leading-relaxed mb-1 list-disc pl-1 ml-5">${unescapeLatexChars(text)}</li>`;
  });

  bodyContent = bodyContent.replace(/\\item\s*\[\\textbf{([^}]+)}\]\s*/g, (_, heading) => {
    return `<div class="mt-2 text-xs font-mono text-slate-800"><strong class="text-slate-950">${unescapeLatexChars(heading)}</strong> `;
  });

  // Handle generic latex commands & structures
  bodyContent = bodyContent.replace(/\\begin{itemize}(\[[^\]]*\])?/g, '<ul class="space-y-0.5 my-2">');
  bodyContent = bodyContent.replace(/\\end{itemize}/g, '</ul>');
  bodyContent = bodyContent.replace(/\\begin{description}/g, '<div class="space-y-3 my-2">');
  bodyContent = bodyContent.replace(/\\end{description}/g, '</div>');
  bodyContent = bodyContent.replace(/\\resumeSubHeadingList/g, '<div class="space-y-2">');
  bodyContent = bodyContent.replace(/\\resumeSubHeadingListEnd/g, '</div>');

  // Convert double backslashes to line breaks
  bodyContent = bodyContent.replace(/\\\\/g, '<br/>');

  // Convert today tag
  bodyContent = bodyContent.replace(/\\today/g, new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));

  // Wrap lone paragraphs or handle plain vertical whitespace
  let paragraphs = bodyContent.split("\n\n");
  paragraphs = paragraphs.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return "";
    // If it contains html tags already, return as is
    if (trimmed.startsWith("<div") || trimmed.startsWith("<h") || trimmed.startsWith("<ul") || trimmed.startsWith("<li")) {
      return trimmed;
    }
    return `<p class="text-xs text-slate-700 font-sans leading-relaxed mb-2.5">${unescapeLatexChars(trimmed)}</p>`;
  });

  return paragraphs.join("\n");
}

export default function LatexWorkspace({
  latexCode,
  setLatexCode,
  isGenerating,
  onGenerate,
  title,
  subtitle,
  fileName,
  type,
  targetPages = "flexible",
  setTargetPages,
  activeModelUsed,
}: LatexWorkspaceProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "editor" | "preview">("split");
  const [editCode, setEditCode] = useState(latexCode);

  useEffect(() => {
    setEditCode(latexCode);
  }, [latexCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTex = () => {
    const blob = new Blob([editCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    // Generate styled print-only output using a temporary hidden element
    const printContent = document.getElementById("latex-preview-container")?.innerHTML;
    if (!printContent) return;

    // Cache content to local storage so print portal can load it
    localStorage.setItem("latex_print_title", title);
    localStorage.setItem("latex_print_content", printContent);

    // Open clean print window
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${title} - Print</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400&family=JetBrains+Mono:wght@400;500;700&display=swap');
            body {
              font-family: 'Roboto', sans-serif;
              color: #1a1a1a;
              background: #white;
              margin: 0;
              padding: 0.5in;
              font-size: 10pt;
              line-height: 1.4;
            }
            h1, h2, h3, h4 {
              margin: 0;
            }
            p {
              margin: 0 0 8px 0;
            }
            a {
              color: #1a1a1a;
              text-decoration: none;
            }
            ul, li {
              margin: 0;
              padding: 0;
            }
            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div style="max-width: 8.5in; margin: 0 auto;">
            ${printContent}
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleLocalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setEditCode(val);
    setLatexCode(val);
  };

  const htmlPreview = parseLatexToHtml(editCode, type);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-fade-in relative z-10">
      {/* Control Header */}
      <div className="bg-slate-950 px-5 py-4 border-b border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-orange-500/10 rounded-lg text-orange-400">
              <FileText size={18} />
            </span>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white font-mono">{title}</h2>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* View mode buttons & actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Model Indicator */}
          {activeModelUsed && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono text-slate-400">
              <Clock size={11} className="text-orange-400" />
              <span>Model: <b className="text-white uppercase">{activeModelUsed.replace('models/', '')}</b></span>
            </div>
          )}

          {/* Page target controller for Resume */}
          {type === "resume" && setTargetPages && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded-xl">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase pl-1">Page Limit:</span>
              <select
                value={targetPages}
                onChange={(e) => setTargetPages(e.target.value)}
                disabled={isGenerating}
                className="bg-transparent text-white text-xs font-bold font-mono focus:outline-none cursor-pointer pr-1"
              >
                <option value="flexible" className="bg-slate-900 text-white">Flexible</option>
                <option value="1" className="bg-slate-900 text-white">Strict 1-Page</option>
                <option value="2" className="bg-slate-900 text-white">Strict 2-Pages</option>
              </select>
            </div>
          )}

          {/* Split / Editor / Preview Selector */}
          <div className="flex items-center bg-slate-900 border border-white/10 p-0.5 rounded-xl">
            <button
              onClick={() => setViewMode("split")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all ${
                viewMode === "split" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <Eye size={12} />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => setViewMode("editor")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all ${
                viewMode === "editor" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <Edit3 size={12} />
              <span className="hidden sm:inline">LaTeX Code</span>
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all ${
                viewMode === "preview" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <Printer size={12} />
              <span className="hidden sm:inline">PDF Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor & Preview Workspace Canvas */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
        {/* LEFT COMPILER PANEL (LaTeX Source Code) */}
        {(viewMode === "split" || viewMode === "editor") && (
          <div className={`${
            viewMode === "editor" ? "lg:col-span-12" : "lg:col-span-6"
          } flex flex-col border-r border-white/5 bg-[#0e1116] relative group`}>
            
            {/* Header info bar */}
            <div className="bg-[#161b22] px-4 py-2 border-b border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span> EDITABLE LATEX CODE</span>
              <span>UTF-8</span>
            </div>

            {/* Code Text Area */}
            <div className="flex-1 relative flex">
              {/* Monospace Line Number gutter simulation */}
              <div className="hidden sm:flex flex-col text-right pr-3 pl-4 py-4 select-none font-mono text-xs text-slate-600 bg-[#0c0d10] border-r border-white/5 text-[11px] leading-relaxed">
                {Array.from({ length: Math.max(1, editCode.split("\n").length) }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              <textarea
                value={editCode}
                onChange={handleLocalChange}
                disabled={isGenerating}
                spellCheck="false"
                className="flex-1 bg-transparent text-slate-100 font-mono text-xs p-4 focus:outline-none focus:ring-0 leading-relaxed resize-none h-full overflow-y-auto"
                placeholder="% LaTeX code will stream in here..."
              />
            </div>
          </div>
        )}

        {/* RIGHT INTERPRETATION PANEL (Simulated Compiled PDF Document) */}
        {(viewMode === "split" || viewMode === "preview") && (
          <div className={`${
            viewMode === "preview" ? "lg:col-span-12" : "lg:col-span-6"
          } flex flex-col bg-slate-900/60 p-6 overflow-y-auto max-h-[85vh]`}>
            
            {/* Real-time PDF simulator wrapper */}
            <div className="flex justify-between items-center mb-4 no-print">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Check size={12} className="text-green-400" /> SIMULATED REAL-TIME PDF PREVIEW
              </span>
              
              <span className="text-[10px] font-sans text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                Layout: <b>Roboto Portrait</b>
              </span>
            </div>

            {/* Simulated Paper A4 page */}
            <div className="flex-1 bg-white text-slate-950 p-8 shadow-2xl rounded-xl border border-slate-300 max-w-[8.5in] w-full mx-auto font-sans text-left transition-all relative overflow-hidden">
              
              {/* Paper Watermark grid lines (subtle elegant hint) */}
              <div className="absolute inset-x-0 top-0 h-1 bg-orange-500"></div>

              <div id="latex-preview-container" className="prose max-w-none">
                {htmlPreview ? (
                  <div dangerouslySetInnerHTML={{ __html: htmlPreview }} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3 font-mono text-xs text-center">
                    <div className="w-10 h-10 border border-dashed border-slate-400 rounded-full flex items-center justify-center animate-spin">
                      <Sparkles size={16} className="text-orange-400" />
                    </div>
                    <div>
                      <p className="font-bold uppercase tracking-wider text-slate-600">Waiting for compiler...</p>
                      <p className="text-[10px] mt-1 text-slate-500">Click "Generate" on the left panel to begin.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer for LaTeX workspace */}
      <div className="bg-slate-950 border-t border-white/15 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-[10px] text-slate-400 font-sans flex items-center gap-2">
          <HelpCircle size={14} className="text-orange-400" />
          <span>Double-click printed PDF downloads or copy to <b>Overleaf</b> to compile instantly.</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={handleCopy}
            className="flex-1 sm:flex-none px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-mono font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-orange-400" />}
            <span>{copied ? "Copied!" : "Copy LaTeX"}</span>
          </button>

          <button
            onClick={handleDownloadTex}
            className="flex-1 sm:flex-none px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-mono font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download size={14} className="text-orange-400" />
            <span>Download .tex</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none px-4.5 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-xs font-mono font-black rounded-xl flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(242,125,38,0.3)] transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <Printer size={14} />
            <span>Save PDF / Print</span>
          </button>
        </div>
      </div>
    </div>
  );
}
