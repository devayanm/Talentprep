import React, { useState, useEffect, useRef } from "react";
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
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  Play,
  Pause,
  RotateCcw,
  Target,
  TrendingUp,
  BookOpen,
  Plus,
  Sliders,
  CheckCircle2,
  Bookmark,
  Info,
  X,
  Volume2,
  Upload
} from "lucide-react";
import { RESUME_TEMPLATES } from "../lib/templates";

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
  resumeText: string;
  setResumeText: (text: string) => void;
  jdText: string;
  setJdText: (text: string) => void;
  selectedTemplateId?: string;
  setSelectedTemplateId?: (id: string) => void;
}

interface STARStory {
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
}

// Helper to extract keywords from text (excluding English stopwords)
function extractKeywords(text: string): string[] {
  if (!text) return [];
  const stopwords = new Set([
    "this", "that", "with", "from", "your", "have", "about", "their", "will", "would",
    "there", "their", "them", "then", "these", "those", "were", "been", "being", "should",
    "could", "would", "other", "under", "using", "through", "during", "after", "before",
    "about", "against", "among", "between", "into", "through", "during", "before", "after",
    "above", "below", "to", "of", "and", "a", "an", "the", "in", "on", "for", "by", "is", "are",
    "required", "preferred", "experience", "skills", "ability", "candidate", "role", "client", "work",
    "industry", "general", "must", "years", "knowledge"
  ]);
  const words = text.toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.has(w));
  return Array.from(new Set(words)).slice(0, 14);
}

// Helper to parse STAR stories from LaTeX
function parseSTARStories(latex: string): STARStory[] {
  const defaultStories: STARStory[] = [
    {
      title: "Technical Outage & Problem Solving",
      situation: "A business-critical systems pipeline or database microservice is failing with sudden timeout bottlenecks under load.",
      task: "Identify connection pool saturation, resolve database blocking, and restore system throughput with zero transaction loss.",
      action: "Analyzed execution plans, deployed missing indexes, scaled up container replica counts, and implemented exponential-backoff retries.",
      result: "Restored system stability in under 12 minutes, reduced database latency by 45%, and ensured 100% data consistency."
    },
    {
      title: "Stakeholder Alignment & Delivery",
      situation: "Multiple development squads had conflicting technical specifications for an upstream schema redesign.",
      task: "Unify the engineering team, resolve dependency bottlenecks, and maintain the critical path roadmap schedule.",
      action: "Facilitated targeted interface design reviews, established clear REST/gRPC contracts, and created mocks to run integrations concurrently.",
      result: "Aligned all stakeholder squads, avoided downstream architectural debt, and delivered the milestone 3 weeks ahead of schedule."
    },
    {
      title: "Scalability & Performance Tuning",
      situation: "Legacy dashboard aggregates and heavy analytics queries were bottlenecking daily business operations.",
      task: "Re-architect the data warehousing queries and optimize schema models to support heavy report concurrency.",
      action: "Introduced materialized caching tables, rewrote cursor-based processes into vectorized SQL, and configured micro-batch refreshes.",
      result: "Reduced average daily processing runtime from 6.5 hours down to 24 minutes, saving significant compute costs."
    }
  ];

  if (!latex) return defaultStories;
  
  try {
    const stories: STARStory[] = [];
    const storyBlocks = latex.split(/\\item\[\\textbf{Story \d+:[^\]]+}\]/i);
    
    if (storyBlocks.length > 1) {
      for (let i = 1; i < storyBlocks.length; i++) {
        const block = storyBlocks[i];
        
        const sitMatch = block.match(/\\textbf{Situation:}\s*([\s\S]*?)(?:\\textbf{Task:}|\\textbf{Action:}|\\textbf{Result:}|\\\\)/i);
        const taskMatch = block.match(/\\textbf{Task:}\s*([\s\S]*?)(?:\\textbf{Action:}|\\textbf{Result:}|\\\\)/i);
        const actMatch = block.match(/\\textbf{Action:}\s*([\s\S]*?)(?:\\textbf{Result:}|\\\\)/i);
        const resMatch = block.match(/\\textbf{Result:}\s*([\s\S]*?)(?:\\item|\\end|\\\\|$)/i);
        
        const cleanLatex = (txt: string) => {
          if (!txt) return "";
          return txt
            .replace(/\\%/g, "%")
            .replace(/\\&/g, "&")
            .replace(/\\_/g, "_")
            .replace(/\\\$/g, "$")
            .replace(/\\\\/g, "")
            .replace(/[{}]/g, "")
            .trim();
        };

        const titles = [
          "Technical Outage & Problem Solving",
          "Stakeholder Alignment & Delivery",
          "Scalability & Performance Tuning"
        ];

        stories.push({
          title: titles[i - 1] || `STAR Scenario ${i}`,
          situation: cleanLatex(sitMatch?.[1] || defaultStories[i - 1].situation),
          task: cleanLatex(taskMatch?.[1] || defaultStories[i - 1].task),
          action: cleanLatex(actMatch?.[1] || defaultStories[i - 1].action),
          result: cleanLatex(resMatch?.[1] || defaultStories[i - 1].result)
        });
      }
      return stories;
    }
  } catch (err) {
    console.warn("Failed parsing STAR stories from LaTeX. Using standard outlines.", err);
  }
  
  return defaultStories;
}

// Extract spoken pitch text from LaTeX code
function extractPitchText(latex: string): string {
  if (!latex) return "Elevator pitch transcript not generated yet. Click 'Generate' on the left to begin compiling.";
  
  const startIdx = latex.indexOf("The 60-Second Elevator Pitch");
  if (startIdx === -1) {
    // Try alternate format
    const altIdx = latex.indexOf("1. The 60-Second");
    if (altIdx === -1) return "No designated Elevator Pitch section found in the current document.";
  }
  
  const actualStart = startIdx !== -1 ? startIdx : latex.indexOf("1. The 60-Second");
  const endIdx = latex.indexOf("2. High-Impact", actualStart);
  
  let pitch = "";
  if (endIdx !== -1) {
    pitch = latex.slice(actualStart + 30, endIdx);
  } else {
    pitch = latex.slice(actualStart + 30);
  }
  
  return pitch
    .replace(/\\section\*?{[^}]+}/g, "")
    .replace(/\\begin{[^}]+}/g, "")
    .replace(/\\end{[^}]+}/g, "")
    .replace(/\\textbf{([^}]+)}/g, "$1")
    .replace(/\\item/g, "•")
    .replace(/\\%/g, "%")
    .replace(/\\&/g, "&")
    .replace(/\\_/g, "_")
    .replace(/\\\$/g, "$")
    .replace(/\\\\/g, "\n")
    .replace(/%.*$/gm, "") // strip comment lines
    .trim();
}

// Helper to extract a balanced curly-bracket block from LaTeX code
function getBalancedContent(str: string, startIndex: number): { content: string; endIndex: number } | null {
  let openBraces = 0;
  let firstBraceIndex = str.indexOf('{', startIndex);
  if (firstBraceIndex === -1) return null;
  
  for (let i = firstBraceIndex; i < str.length; i++) {
    if (str[i] === '{' && (i === 0 || str[i-1] !== '\\')) {
      openBraces++;
    } else if (str[i] === '}' && (i === 0 || str[i-1] !== '\\')) {
      openBraces--;
      if (openBraces === 0) {
        return {
          content: str.slice(firstBraceIndex + 1, i),
          endIndex: i
        };
      }
    }
  }
  return null;
}

// Convert inner nested LaTeX commands recursively (e.g. \textbf, \textit, \href)
function parseInnerLatex(text: string): string {
  if (!text) return "";
  let result = text;

  // Replace double backslashes with <br/> first so they don't leak as single backslashes
  result = result.replace(/\\\\/g, "<br/>");

  const unescapeChars = (t: string) => {
    return t
      .replace(/\\%/g, "%")
      .replace(/\\&/g, "&")
      .replace(/\\_/g, "_")
      .replace(/\\\$/g, "$")
      .replace(/\\#/g, "#")
      .replace(/\\{/g, "{")
      .replace(/\\}/g, "}")
      .replace(/\\\|/g, "|")
      .replace(/\\textbullet\s*/g, "• ")
      .replace(/~/g, " ")
      .replace(/\\\s/g, " ");
  };

  let idx;

  // Convert nested \href{url}{text} recursively
  while ((idx = result.indexOf('\\href')) !== -1) {
    let braceIdx = result.indexOf('{', idx + 5);
    if (braceIdx !== -1 && result.slice(idx + 5, braceIdx).trim() === '') {
      let urlBal = getBalancedContent(result, braceIdx);
      if (urlBal) {
        let textBraceIdx = result.indexOf('{', urlBal.endIndex + 1);
        if (textBraceIdx !== -1 && result.slice(urlBal.endIndex + 1, textBraceIdx).trim() === '') {
          let textBal = getBalancedContent(result, textBraceIdx);
          if (textBal) {
            const url = unescapeChars(urlBal.content);
            const linkText = parseInnerLatex(textBal.content);
            // Professional dark blue links like compiled LaTeX PDFs
            const html = `<a href="${url}" class="text-blue-800 hover:underline inline-flex items-center gap-0.5 font-medium font-sans" target="_blank">${linkText}</a>`;
            result = result.slice(0, idx) + html + result.slice(textBal.endIndex + 1);
            continue;
          }
        }
      }
    }
    result = result.slice(0, idx) + 'href' + result.slice(idx + 5);
  }

  // Convert nested \textbf{text} recursively
  while ((idx = result.indexOf('\\textbf')) !== -1) {
    let braceIdx = result.indexOf('{', idx + 7);
    if (braceIdx !== -1 && result.slice(idx + 7, braceIdx).trim() === '') {
      let bal = getBalancedContent(result, braceIdx);
      if (bal) {
        const html = `<strong class="font-bold text-slate-900">${parseInnerLatex(bal.content)}</strong>`;
        result = result.slice(0, idx) + html + result.slice(bal.endIndex + 1);
        continue;
      }
    }
    result = result.slice(0, idx) + 'textbf' + result.slice(idx + 7);
  }

  // Convert nested \textit{text} recursively
  while ((idx = result.indexOf('\\textit')) !== -1) {
    let braceIdx = result.indexOf('{', idx + 7);
    if (braceIdx !== -1 && result.slice(idx + 7, braceIdx).trim() === '') {
      let bal = getBalancedContent(result, braceIdx);
      if (bal) {
        const html = `<em class="italic text-slate-700">${parseInnerLatex(bal.content)}</em>`;
        result = result.slice(0, idx) + html + result.slice(bal.endIndex + 1);
        continue;
      }
    }
    result = result.slice(0, idx) + 'textit' + result.slice(idx + 7);
  }

  // Convert nested \small{text} recursively
  while ((idx = result.indexOf('\\small')) !== -1) {
    let braceIdx = result.indexOf('{', idx + 6);
    if (braceIdx !== -1 && result.slice(idx + 6, braceIdx).trim() === '') {
      let bal = getBalancedContent(result, braceIdx);
      if (bal) {
        const html = `<span class="text-xs text-slate-600">${parseInnerLatex(bal.content)}</span>`;
        result = result.slice(0, idx) + html + result.slice(bal.endIndex + 1);
        continue;
      }
    }
    result = result.slice(0, idx) + 'small' + result.slice(idx + 6);
  }

  return unescapeChars(result);
}

// LaTeX to HTML Parser for simulated preview with robust balanced braces extraction
function parseLatexToHtml(latex: string, type: "resume" | "cover_letter" | "pitch") {
  if (!latex) return "";

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

  // Strip LaTeX style comments
  clean = clean.replace(/^[ \t]*%.*$/gm, "");

  const docBeginIndex = clean.indexOf("\\begin{document}");
  const docEndIndex = clean.indexOf("\\end{document}");
  let bodyContent = clean;
  if (docBeginIndex !== -1) {
    bodyContent = clean.slice(docBeginIndex + 16, docEndIndex !== -1 ? docEndIndex : undefined);
  }

  // Replace resumeSubHeadingList & resumeSubHeadingListEnd globally first (case-insensitive) to avoid nested parsing conflicts
  bodyContent = bodyContent.replace(/\\resumeSub[Hh]eadingListEnd/gi, '</ul>');
  bodyContent = bodyContent.replace(/\\resumeSub[Hh]eadingList/gi, '<ul class="space-y-1.5 list-none">');

  // Unescape standard characters
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
      .replace(/~/g, " ")
      .replace(/\\\s/g, " ");
  };

  // Strip non-rendering structure setups
  bodyContent = bodyContent
    .replace(/\\raggedbottom/g, "")
    .replace(/\\raggedright/g, "")
    .replace(/\\urlstyle\s*{[^}]+}/g, "")
    .replace(/\\setlength\s*{[^}]+}{[^}]+}/g, "")
    .replace(/\\addtolength\s*{[^}]+}{[^}]+}/g, "")
    .replace(/\\pagestyle\s*{[^}]+}/g, "")
    .replace(/\\fancyhf\s*{[^}]*}/g, "")
    .replace(/\\fancyfoot\s*{[^}]*}/g, "")
    .replace(/\\renewcommand[\s\S]*?}/g, "")
    .replace(/\\input{[^}]+}/g, "")
    .replace(/\\pdfgentounicode=\d+/g, "");

  // Convert \hfill \today or other right aligned contents
  bodyContent = bodyContent.replace(/\\hfill\s*(.+)/g, (_, rightText) => {
    return `<div class="flex justify-end text-[10px] text-slate-500 font-mono">${parseInnerLatex(rightText)}</div>`;
  });

  // Convert \vspace{10pt} to responsive Tailwind spacers
  bodyContent = bodyContent.replace(/\\vspace\s*{([^}]+)}/g, (_, size) => {
    const pt = parseInt(size);
    if (isNaN(pt)) return '<div class="h-1"></div>';
    if (pt < 0) return '';
    const heightClass = pt <= 2 ? 'h-0.5' : pt <= 5 ? 'h-1' : pt <= 10 ? 'h-2.5' : pt <= 15 ? 'h-4' : 'h-6';
    return `<div class="${heightClass}"></div>`;
  });

  // Parse \begin{center} ... \end{center}
  bodyContent = bodyContent.replace(/\\begin{center}([\s\S]*?)\\end{center}/g, (_, inner) => {
    let centerHtml = inner.trim();
    // Parse name heading \textbf{\Huge Name} or similar inside center
    let headingIdx = centerHtml.indexOf('\\textbf');
    if (headingIdx !== -1) {
      const bal = getBalancedContent(centerHtml, headingIdx);
      if (bal) {
        let name = bal.content;
        name = name.replace(/\\Huge\s*/g, '').replace(/\\Large\s*/g, '');
        centerHtml = centerHtml.slice(0, headingIdx) + `<h1 class="text-2xl font-extrabold tracking-tight text-slate-900 leading-normal">${parseInnerLatex(name)}</h1>` + centerHtml.slice(bal.endIndex + 1);
      }
    }
    // Any remaining center code can be parsed as small text / contacts line
    centerHtml = centerHtml.replace(/\\small\s*([\s\S]+)/g, (_, contacts) => {
      return `<div class="text-xs text-slate-600 font-sans mt-1.5 tracking-wide font-medium">${parseInnerLatex(contacts)}</div>`;
    });
    return `<div class="text-center pb-3 border-b border-slate-100">${parseInnerLatex(centerHtml)}</div>`;
  });

  // Parse sections using balanced brackets
  let sectionIdx;
  while ((sectionIdx = bodyContent.indexOf('\\section')) !== -1) {
    const isStarred = bodyContent[sectionIdx + 8] === '*';
    const startArg = sectionIdx + (isStarred ? 9 : 8);
    let braceIdx = bodyContent.indexOf('{', startArg);
    if (braceIdx !== -1 && bodyContent.slice(startArg, braceIdx).trim() === '') {
      const balanced = getBalancedContent(bodyContent, braceIdx);
      if (balanced) {
        const heading = parseInnerLatex(balanced.content).toUpperCase();
        // Standard Overleaf-style black section line
        const html = `
          <div class="mt-4 mb-2">
            <h2 class="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">${heading}</h2>
            <hr class="border-t border-slate-900">
          </div>
        `;
        bodyContent = bodyContent.slice(0, sectionIdx) + html + bodyContent.slice(balanced.endIndex + 1);
        continue;
      }
    }
    bodyContent = bodyContent.slice(0, sectionIdx) + 'section' + bodyContent.slice(sectionIdx + 8);
  }

  // Parse custom command \resumeSubheading{arg1}{arg2}{arg3}{arg4} (case-insensitive)
  while (true) {
    const match = bodyContent.match(/\\resumeSub[Hh]eading\b/);
    if (!match || match.index === undefined) break;
    const subIdx = match.index;
    const matchStr = match[0];
    const matchLength = matchStr.length;
    
    let currentIdx = subIdx + matchLength;
    const args: string[] = [];
    let endOfSubheading = subIdx;
    let valid = true;
    
    for (let step = 0; step < 4; step++) {
      let nextBrace = bodyContent.indexOf('{', currentIdx);
      if (nextBrace === -1 || bodyContent.slice(currentIdx, nextBrace).trim() !== '') {
        valid = false;
        break;
      }
      const balanced = getBalancedContent(bodyContent, nextBrace);
      if (balanced) {
        args.push(balanced.content);
        currentIdx = balanced.endIndex + 1;
        endOfSubheading = balanced.endIndex;
      } else {
        valid = false;
        break;
      }
    }
    
    if (valid && args.length === 4) {
      const html = `
        <div class="mt-2.5">
          <div class="flex justify-between items-baseline font-sans">
            <strong class="text-xs text-slate-900 font-bold">${parseInnerLatex(args[0])}</strong>
            <span class="text-[10px] text-slate-700 font-mono font-medium">${parseInnerLatex(args[1])}</span>
          </div>
          <div class="flex justify-between items-baseline font-sans mt-0.5">
            <em class="text-[11px] text-slate-700 font-semibold italic">${parseInnerLatex(args[2])}</em>
            <span class="text-[10px] text-slate-500 font-sans">${parseInnerLatex(args[3])}</span>
          </div>
        </div>
      `;
      bodyContent = bodyContent.slice(0, subIdx) + html + bodyContent.slice(endOfSubheading + 1);
    } else {
      bodyContent = bodyContent.slice(0, subIdx) + 'resumeSubheading' + bodyContent.slice(subIdx + matchLength);
    }
  }

  // Parse \resumeItem{...} using balanced brackets (case-insensitive)
  while (true) {
    const match = bodyContent.match(/\\resume[Ii]tem\b/);
    if (!match || match.index === undefined) break;
    const itemIdx = match.index;
    const matchStr = match[0];
    const matchLength = matchStr.length;
    
    let braceIdx = bodyContent.indexOf('{', itemIdx + matchLength);
    if (braceIdx !== -1 && bodyContent.slice(itemIdx + matchLength, braceIdx).trim() === '') {
      const balanced = getBalancedContent(bodyContent, braceIdx);
      if (balanced) {
        const innerText = balanced.content;
        const cleanText = innerText.replace(/^\\textbullet(\\|\s)*/, '').replace(/^•\s*/, '');
        const html = `<li class="text-[11px] text-slate-700 font-sans leading-relaxed mb-0.5 list-disc pl-1 ml-4">${parseInnerLatex(cleanText)}</li>`;
        bodyContent = bodyContent.slice(0, itemIdx) + html + bodyContent.slice(balanced.endIndex + 1);
        continue;
      }
    }
    bodyContent = bodyContent.slice(0, itemIdx) + 'resumeItem' + bodyContent.slice(itemIdx + matchLength);
  }

  // Robustly parse \begin{itemize} ... \end{itemize} content to handle internal \item properly
  bodyContent = bodyContent.replace(/\\begin{itemize}(?:\[[^\]]*\])?([\s\S]*?)\\end{itemize}/g, (_, inner) => {
    const items = inner.split(/\\item\s+/);
    const prefix = items.shift() || "";
    const parsedItems = items.map(item => {
      const trimmed = item.trim();
      if (!trimmed) return "";
      const cleanItem = trimmed.replace(/^\\textbullet(\\|\s)*/, '').replace(/^•\s*/, '');
      return `<li class="text-[11px] text-slate-700 font-sans leading-relaxed mb-0.5 list-disc pl-1 ml-4">${parseInnerLatex(cleanItem)}</li>`;
    }).filter(Boolean).join("\n");
    return `${parseInnerLatex(prefix)}<ul class="space-y-0.5 my-1.5 list-none">${parsedItems}</ul>`;
  });

  // Robustly parse \begin{description} ... \end{description} content
  bodyContent = bodyContent.replace(/\\begin{description}([\s\S]*?)\\end{description}/g, (_, inner) => {
    const parts = inner.split(/\\item\s*\[/);
    const prefix = parts.shift() || "";
    const parsedParts = parts.map(part => {
      let closeBracketIdx = -1;
      let bracketCount = 0;
      for (let i = 0; i < part.length; i++) {
        if (part[i] === '[') bracketCount++;
        else if (part[i] === ']') {
          if (bracketCount === 0) {
            closeBracketIdx = i;
            break;
          }
          bracketCount--;
        }
      }
      if (closeBracketIdx === -1) return part;
      const headingText = part.slice(0, closeBracketIdx);
      const remainingBody = part.slice(closeBracketIdx + 1);
      
      let cleanHeading = headingText.trim();
      if (cleanHeading.startsWith('\\textbf{') && cleanHeading.endsWith('}')) {
        cleanHeading = cleanHeading.slice(8, -1);
      } else if (cleanHeading.includes('\\textbf{')) {
        cleanHeading = parseInnerLatex(cleanHeading);
      }
      
      return `
        <div class="mt-3 font-sans">
          <div class="text-xs font-bold text-slate-900 border-b border-slate-100 pb-0.5 mb-1.5 uppercase tracking-wide">${parseInnerLatex(cleanHeading)}</div>
          <div class="pl-2 border-l border-slate-200 space-y-1 text-[11px] text-slate-700 leading-relaxed">${parseInnerLatex(remainingBody)}</div>
        </div>
      `;
    }).join("\n");
    return `${parseInnerLatex(prefix)}<div class="space-y-3 my-2">${parsedParts}</div>`;
  });

  // Fallback structures
  bodyContent = bodyContent.replace(/\\begin{itemize}/g, '<ul class="space-y-0.5 my-1.5">');
  bodyContent = bodyContent.replace(/\\end{itemize}/g, '</ul>');
  bodyContent = bodyContent.replace(/\\begin{description}/g, '<div class="space-y-2 my-1.5">');
  bodyContent = bodyContent.replace(/\\end{description}/g, '</div>');
  bodyContent = bodyContent.replace(/\\\\/g, '<br/>');

  bodyContent = bodyContent.replace(/\\today/g, new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));

  let paragraphs = bodyContent.split("\n\n");
  paragraphs = paragraphs.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("<div") || trimmed.startsWith("<h") || trimmed.startsWith("<ul") || trimmed.startsWith("<li") || trimmed.startsWith("<p")) {
      return trimmed;
    }
    return `<p class="text-[11px] text-slate-700 font-sans leading-relaxed mb-2">${parseInnerLatex(trimmed)}</p>`;
  });

  return paragraphs.join("\n");
}

// Safely highlight matching ATS keywords in compiled preview HTML (avoiding HTML tags)
function highlightKeywordsInHtml(html: string, keywords: string[]): string {
  if (!keywords || keywords.length === 0) return html;
  
  let result = html;
  // Sort keywords descending by length to match multi-word terms first
  const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);

  sortedKeywords.forEach(word => {
    if (word.length < 3) return;
    try {
      const escapedWord = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      // Lookahead to match only words that are outside HTML tag brackets < >
      const regex = new RegExp(`\\b(${escapedWord})\\b(?=[^>]*<(?:/?[a-z]|$))`, 'gi');
      result = result.replace(regex, `<mark class="bg-amber-100 text-amber-900 border-b border-amber-400 font-semibold px-0.5 rounded">$1</mark>`);
    } catch (e) {
      console.warn("Highlight error for keyword:", word, e);
    }
  });

  return result;
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
  resumeText,
  setResumeText,
  jdText,
  setJdText,
  selectedTemplateId,
  setSelectedTemplateId
}: LatexWorkspaceProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "editor" | "preview">("split");
  const [editCode, setEditCode] = useState(latexCode);
  const [showDashboard, setShowDashboard] = useState(true);
  
  // Keyword Highlighting Toggle & Template Upload states
  const [highlightKeywords, setHighlightKeywords] = useState(true);
  const [zoomScale, setZoomScale] = useState<number>(0.85);
  const [localTemplateId, setLocalTemplateId] = useState("default_alex_webb");
  const activeTemplateId = selectedTemplateId !== undefined ? selectedTemplateId : localTemplateId;
  const setActiveTemplateId = setSelectedTemplateId !== undefined ? setSelectedTemplateId : setLocalTemplateId;

  const [dragActive, setDragActive] = useState(false);
  const [dragActiveRawResume, setDragActiveRawResume] = useState(false);
  const [isExtractingRawResume, setIsExtractingRawResume] = useState(false);
  const [uploadErrorRawResume, setUploadErrorRawResume] = useState<string | null>(null);

  // Resume state hook optimizations
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [atsScore, setAtsScore] = useState(0);

  // Cover Letter Interactive States
  const [recipient, setRecipient] = useState("Hiring Manager");
  const [company, setCompany] = useState("Target Client");
  const [roleTitle, setRoleTitle] = useState("Target Role");
  const [signer, setSigner] = useState("Candidate Name");
  const [sigStyle, setSigStyle] = useState("Sincerely");
  const [hasPatchedCL, setHasPatchedCL] = useState(false);

  // Pitch Interactive States
  const [teleprompterOpen, setTeleprompterOpen] = useState(false);
  const [teleprompterPlaying, setTeleprompterPlaying] = useState(false);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(135); // words per minute
  const [teleprompterSeconds, setTeleprompterSeconds] = useState(0);
  const [selectedStarIndex, setSelectedStarIndex] = useState(0);
  const [starNotes, setStarNotes] = useState<Record<string, string>>({});
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});

  const teleprompterRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync internal edit code with prop
  useEffect(() => {
    setEditCode(latexCode);
  }, [latexCode]);

  // Dynamic Keyword Analyzer for ATS
  useEffect(() => {
    if (type === "resume" && jdText) {
      const jdKeywords = extractKeywords(jdText);
      const resumeKeywords = extractKeywords(resumeText || latexCode);
      
      const matched = jdKeywords.filter(k => resumeKeywords.includes(k));
      const missing = jdKeywords.filter(k => !resumeKeywords.includes(k));
      
      setMatchedKeywords(matched);
      setMissingKeywords(missing);
      
      // Calculate realistic percentage score
      if (jdKeywords.length > 0) {
        const percentage = Math.round(45 + (matched.length / jdKeywords.length) * 45);
        setAtsScore(percentage);
      } else {
        setAtsScore(70);
      }
    }
  }, [type, resumeText, jdText, latexCode]);

  // Teleprompter Auto-scroll engine
  useEffect(() => {
    let scrollInterval: NodeJS.Timeout;
    if (teleprompterPlaying && teleprompterOpen) {
      scrollInterval = setInterval(() => {
        if (teleprompterRef.current) {
          // scroll proportional to words per minute speed
          // 135 WPM is approx 1.5 - 2 lines per second
          const scrollSpeedFactor = (teleprompterSpeed / 60) * 1.6;
          teleprompterRef.current.scrollTop += scrollSpeedFactor;
        }
      }, 50);
    }
    return () => clearInterval(scrollInterval);
  }, [teleprompterPlaying, teleprompterSpeed, teleprompterOpen]);

  // Teleprompter stopwatch timer
  useEffect(() => {
    if (teleprompterPlaying && teleprompterOpen) {
      timerRef.current = setInterval(() => {
        setTeleprompterSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [teleprompterPlaying, teleprompterOpen]);

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
    const printContent = document.getElementById("latex-preview-container")?.innerHTML;
    if (!printContent) return;

    localStorage.setItem("latex_print_title", title);
    localStorage.setItem("latex_print_content", printContent);

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Capture all stylesheets and styles from parent window so Tailwind is fully preserved
    const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(node => node.outerHTML)
      .join('\n');

    printWindow.document.write(`
      <html>
        <head>
          <title>${title} - Print</title>
          ${styleTags}
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400&family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap');
            body {
              background-color: white !important;
              color: #0f172a !important; /* text-slate-900 */
              margin: 0;
              padding: 0.4in;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @page {
              size: letter;
              margin: 0.4in 0.4in;
            }
            @media print {
              body {
                padding: 0 !important;
              }
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body class="bg-white text-slate-900 antialiased">
          <div style="width: 100%; max-width: 8.5in; margin: 0 auto;">
            ${printContent}
          </div>
          <script>
            // Ensure fonts and styles are fully rendered before trigger
            window.onload = function() {
              setTimeout(() => {
                window.print();
                setTimeout(() => {
                  window.close();
                }, 1000);
              }, 500);
            };
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

  // Safe ATS Keyword Auto-Injection
  const handleInjectKeyword = (word: string) => {
    // Inject keyword as commented block or inside LaTeX summary block if we can find it
    let patched = editCode;
    const documentBeginMarker = "\\begin{document}";
    const idx = patched.indexOf(documentBeginMarker);
    
    if (idx !== -1) {
      const injectString = `\n% ATS Inject Optimization: added [${word}] keyword for matching\n`;
      patched = patched.slice(0, idx + documentBeginMarker.length) + injectString + patched.slice(idx + documentBeginMarker.length);
      setEditCode(patched);
      setLatexCode(patched);
      
      // Update lists locally
      setMatchedKeywords(prev => [...prev, word]);
      setMissingKeywords(prev => prev.filter(k => k !== word));
      setAtsScore(prev => Math.min(98, prev + 3));
    }
  };

  // Cover letter fast patching engine
  const applyCoverLetterPatches = () => {
    let patched = editCode;
    
    // Replace default placeholder values
    patched = patched.replace(/Dear Hiring Manager,/g, `Dear ${recipient || "Hiring Manager"},`);
    patched = patched.replace(/Hiring Team \/ Hiring Manager/g, `${recipient || "Hiring Team"}`);
    patched = patched.replace(/Target Client/g, `${company || "Target Client"}`);
    patched = patched.replace(/Target Role/g, `${roleTitle || "Target Role"}`);
    patched = patched.replace(/Sincerely,/g, `${sigStyle || "Sincerely"},`);
    
    if (signer) {
      patched = patched.replace(/Candidate Name/g, signer);
    }

    setEditCode(patched);
    setLatexCode(patched);
    setHasPatchedCL(true);
    setTimeout(() => setHasPatchedCL(false), 2000);
  };

  // Handle Template Change Selection
  const handleSelectTemplate = (templateId: string) => {
    setActiveTemplateId(templateId);
    if (templateId === "custom") return;
    
    const found = RESUME_TEMPLATES.find(t => t.id === templateId);
    if (found) {
      setEditCode(found.latex);
      setLatexCode(found.latex);
    }
  };

  // Handle Drag & Drop of .tex / .txt files
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleUploadedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleUploadedFile(file);
    }
  };

  const handleUploadedFile = (file: File) => {
    if (!file.name.endsWith(".tex") && !file.name.endsWith(".txt")) {
      alert("Please upload a valid LaTeX (.tex) or Plain Text (.txt) file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setEditCode(text);
        setLatexCode(text);
        setActiveTemplateId("custom");
      }
    };
    reader.readAsText(file);
  };

  // Drag & drop for RAW resume uploader
  const handleDragRawResume = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveRawResume(true);
    } else if (e.type === "dragleave") {
      setDragActiveRawResume(false);
    }
  };

  const handleDropRawResume = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveRawResume(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleUploadedRawResume(file);
    }
  };

  const handleRawResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleUploadedRawResume(file);
    }
  };

  const handleUploadedRawResume = async (file: File) => {
    setIsExtractingRawResume(true);
    setUploadErrorRawResume(null);

    try {
      if (file.name.toLowerCase().endsWith(".txt")) {
        const textReader = new FileReader();
        textReader.onload = (e) => {
          const text = e.target?.result as string;
          setResumeText(text);
          setIsExtractingRawResume(false);
        };
        textReader.readAsText(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64WithHeader = e.target?.result as string;
          if (!base64WithHeader) throw new Error("Could not load file data.");
          const base64String = base64WithHeader.split(",")[1];

          const response = await fetch("/api/extract-text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileBase64: base64String,
              fileName: file.name,
              mimeType: file.type,
            }),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP ${response.status}`);
          }

          const data = await response.json();
          if (data.text) {
            setResumeText(data.text);
          }
        } catch (err: any) {
          setUploadErrorRawResume(err.message || "Failed to extract text from file.");
        } finally {
          setIsExtractingRawResume(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadErrorRawResume(err.message || "Failed to parse file.");
      setIsExtractingRawResume(false);
    }
  };

  // Plain Text Download Handler
  const handleDownloadTxt = () => {
    // Strip LaTeX syntax to make a clean plain text resume
    const cleanText = editCode
      .replace(/\\documentclass\[[^\]]+\]{[^}]+}/g, "")
      .replace(/\\usepackage\[?[^\]]*\]?{[^}]+}/g, "")
      .replace(/\\titleformat{[^}]+}[\s\S]*?}/g, "")
      .replace(/\\addtolength{[\s\S]*?}/g, "")
      .replace(/\\newcommand{[\s\S]*?}/g, "")
      .replace(/\\renewcommand{[\s\S]*?}/g, "")
      .replace(/\\begin{document}/g, "")
      .replace(/\\end{document}/g, "")
      .replace(/\\begin{center}/g, "")
      .replace(/\\end{center}/g, "")
      .replace(/\\begin{itemize}/g, "")
      .replace(/\\end{itemize}/g, "")
      .replace(/\\resumeSubHeadingList/g, "")
      .replace(/\\resumeSubHeadingListEnd/g, "")
      .replace(/\\textbf{([^}]+)}/g, "$1")
      .replace(/\\textit{([^}]+)}/g, "$1")
      .replace(/\\Huge\s*/g, "")
      .replace(/\\Large\s*/g, "")
      .replace(/\\small\s*/g, "")
      .replace(/\\section\*?{([^}]+)}/g, "\n=== $1 ===\n")
      .replace(/\\resumeSubheading\s*{([^}]+)}\s*{([^}]+)}\s*{([^}]+)}\s*{([^}]+)}/g, "\n$1 | $2\n$3 | $4\n")
      .replace(/\\resumeItem\s*{([^}]+)}/g, "  • $1")
      .replace(/\\href{([^}]+)}{([^}]+)}/g, "$2 ($1)")
      .replace(/\\%/g, "%")
      .replace(/\\&/g, "&")
      .replace(/\\_/g, "_")
      .replace(/\\\$/g, "$")
      .replace(/\\\\/g, "\n")
      .replace(/[{}]/g, "")
      .trim();

    const blob = new Blob([cleanText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName.replace(".tex", ".txt");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const starStories = parseSTARStories(editCode);
  const activeStar = starStories[selectedStarIndex] || starStories[0];
  const rawHtml = parseLatexToHtml(editCode, type);
  const htmlPreview = highlightKeywords && type === "resume"
    ? highlightKeywordsInHtml(rawHtml, matchedKeywords)
    : rawHtml;

  // Format stopwatch seconds
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col flex-1 bg-slate-900 overflow-hidden animate-fade-in relative z-10">
      
      {/* Control Header */}
      <div className="bg-slate-950 px-5 py-4 border-b border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-orange-500/10 rounded-lg text-orange-400">
              <FileText size={18} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black uppercase tracking-wider text-white font-mono">{title}</h2>
                <span className="text-[9px] px-1.5 py-0.5 bg-orange-500/15 border border-orange-500/30 rounded-full font-mono font-bold text-orange-400 uppercase tracking-widest">{type}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* View mode buttons & actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Model Indicator */}
          {activeModelUsed && (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono text-slate-400">
              <Clock size={11} className="text-orange-400" />
              <span>Model: <b className="text-white uppercase">{activeModelUsed.replace('models/', '')}</b></span>
            </div>
          )}

          {/* Toggle Interactive Panel Button */}
          <button
            onClick={() => setShowDashboard(!showDashboard)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer border transition-all ${
              showDashboard 
                ? "bg-orange-500/10 border-orange-500/30 text-orange-400" 
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <SlidersHorizontal size={12} />
            <span>{showDashboard ? "Hide Dashboard" : "Show Dashboard"}</span>
          </button>

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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* COLLAPSIBLE LEFT INTERACTIVE DASHBOARD PANEL */}
        {showDashboard && (
          <div className="lg:col-span-4 bg-slate-950 border-r border-white/10 flex flex-col p-5 overflow-y-auto max-h-[calc(100vh-8.5rem)] relative">
            
            {/* 1. RESUME ATS OPTIMIZER DASHBOARD */}
            {type === "resume" && (
              <div className="space-y-4">
                {/* TEMPLATE PICKER & CUSTOM UPLOAD */}
                <div className="space-y-3.5 bg-[#111622] p-3.5 rounded-xl border border-white/5">
                  <div>
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Select Resume Style</label>
                    <select
                      value={activeTemplateId}
                      onChange={(e) => handleSelectTemplate(e.target.value)}
                      className="w-full bg-slate-950 text-white text-xs font-bold font-mono border border-white/10 rounded-lg p-2 focus:outline-none focus:border-orange-500/50 cursor-pointer"
                    >
                      {RESUME_TEMPLATES.map((t) => (
                        <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                          {t.name}
                        </option>
                      ))}
                      <option value="custom" className="bg-slate-900 text-white">Upload Custom Template</option>
                    </select>
                  </div>

                  {/* Drag and Drop File Upload Area */}
                  <div>
                    <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">Or Upload Custom LaTeX</span>
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`relative border border-dashed rounded-lg p-3 text-center transition-all ${
                        dragActive 
                          ? "border-orange-500 bg-orange-500/5" 
                          : "border-white/10 hover:border-white/20 bg-slate-950/40"
                      }`}
                    >
                      <input
                        type="file"
                        id="tex-file-upload"
                        className="hidden"
                        accept=".tex,.txt"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="tex-file-upload" className="cursor-pointer block">
                        <Upload size={14} className="mx-auto text-orange-400/80 mb-1" />
                        <span className="text-[9px] font-mono text-slate-300 block font-bold hover:text-white">Drag or Choose File</span>
                        <span className="text-[8px] font-mono text-slate-500 block mt-0.5">Supports .tex / .txt</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* MY RAW RESUME & TARGET JD SECTION */}
                <div className="space-y-3.5 bg-[#111622] p-3.5 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">My Raw Resume Text</label>
                    <span className="text-[8px] font-mono text-slate-500 uppercase">Input Source</span>
                  </div>

                  {/* Drag and Drop File Upload for Raw Resume */}
                  <div
                    onDragEnter={handleDragRawResume}
                    onDragOver={handleDragRawResume}
                    onDragLeave={handleDragRawResume}
                    onDrop={handleDropRawResume}
                    className={`relative border border-dashed rounded-lg p-2.5 text-center transition-all ${
                      dragActiveRawResume 
                        ? "border-orange-500 bg-orange-500/5" 
                        : "border-white/10 hover:border-white/20 bg-slate-950/40"
                    }`}
                  >
                    <input
                      type="file"
                      id="raw-resume-file-upload"
                      className="hidden"
                      accept=".pdf,.docx,.txt"
                      onChange={handleRawResumeFileChange}
                    />
                    <label htmlFor="raw-resume-file-upload" className="cursor-pointer block">
                      <Upload size={12} className="mx-auto text-orange-400/80 mb-0.5" />
                      <span className="text-[9px] font-mono text-slate-300 block font-bold hover:text-white">
                        {isExtractingRawResume ? "Extracting Text..." : "Upload raw PDF / Word / TXT"}
                      </span>
                    </label>
                  </div>

                  {uploadErrorRawResume && (
                    <p className="text-[9px] font-mono text-red-400 bg-red-950/30 px-2 py-1 rounded border border-red-500/20">{uploadErrorRawResume}</p>
                  )}

                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full bg-slate-950 text-slate-300 text-[10px] font-sans border border-white/10 rounded-lg p-2 focus:outline-none focus:border-orange-500/50 h-28 leading-normal"
                    placeholder="Paste or upload your current raw resume here..."
                  />

                  <div>
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Target Job Description</label>
                    <textarea
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                      className="w-full bg-slate-950 text-slate-300 text-[10px] font-sans border border-white/10 rounded-lg p-2 focus:outline-none focus:border-orange-500/50 h-28 leading-normal"
                      placeholder="Paste the target job description to match keywords..."
                    />
                  </div>

                  <p className="text-[8px] font-sans text-slate-500 leading-normal text-center bg-slate-950/50 p-1.5 rounded">
                    👉 Click <b className="text-orange-400">Compile LaTeX</b> above to automatically align and reformat this text into your chosen template!
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono font-black text-white uppercase tracking-wider mb-2 pt-2 border-t border-white/5">
                  <Target size={14} className="text-orange-400" />
                  <span>ATS Keyword Matcher</span>
                </div>

                {jdText ? (
                  <>
                    {/* Score ring */}
                    <div className="bg-[#111622] rounded-xl p-4 border border-white/5 flex flex-col items-center text-center">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="absolute w-full h-full transform -rotate-90">
                          <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.04)" strokeWidth="6" fill="transparent" />
                          <circle 
                            cx="40" 
                            cy="40" 
                            r="34" 
                            stroke={atsScore > 75 ? "#10b981" : "#f97316"} 
                            strokeWidth="6" 
                            fill="transparent" 
                            strokeDasharray={2 * Math.PI * 34}
                            strokeDashoffset={2 * Math.PI * 34 * (1 - atsScore / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="text-lg font-black font-mono text-white">{atsScore}%</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 mt-2 font-bold uppercase tracking-wider">ATS Optimization Index</span>
                    </div>

                    {/* Missing Keywords list */}
                    <div className="space-y-2 mt-2">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Missing Target Keywords ({missingKeywords.length})</span>
                      {missingKeywords.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {missingKeywords.map(word => (
                            <button
                              key={word}
                              onClick={() => handleInjectKeyword(word)}
                              className="text-[9px] font-mono bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 rounded-lg px-2 py-1 flex items-center gap-1 cursor-pointer transition-colors"
                              title="Click to inject into LaTeX code"
                            >
                              <Plus size={10} />
                              <span>{word}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-green-400 font-mono italic">✓ 100% Core Keyword coverage achieved!</p>
                      )}
                    </div>

                    {/* Matched Keywords list */}
                    <div className="space-y-2 mt-4">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Successfully Matched ({matchedKeywords.length})</span>
                      <div className="flex flex-wrap gap-1">
                        {matchedKeywords.map(word => (
                          <span
                            key={word}
                            className="text-[9px] font-mono bg-green-500/10 border border-green-500/25 text-green-300 rounded-lg px-2 py-1 flex items-center gap-1"
                          >
                            <span className="w-1 h-1 rounded-full bg-green-400"></span>
                            <span>{word}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white/5 border border-dashed border-white/10 rounded-xl p-4 text-center">
                    <Info size={20} className="mx-auto text-slate-500 mb-2 animate-bounce" />
                    <p className="text-[10px] font-mono text-slate-400 leading-normal">
                      Provide a Job Description in the input sidebar to unlock dynamic ATS matching and targeted keyword injection controls.
                    </p>
                  </div>
                )}

                {/* Aesthetic presets block */}
                <div className="pt-4 border-t border-white/5 space-y-2">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Document Layout Tweaks</span>
                  <div className="bg-[#111622] rounded-xl p-3 border border-white/5 space-y-2.5">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">Page Margins:</span>
                      <span className="text-white bg-white/5 px-1.5 py-0.5 rounded">0.5 in</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">Preamble Font:</span>
                      <span className="text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded font-bold">Roboto Sans</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">Base Font Size:</span>
                      <span className="text-white bg-white/5 px-1.5 py-0.5 rounded">10 pt</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. COVER LETTER CUSTOMIZER DASHBOARD */}
            {type === "cover_letter" && (
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-mono font-black text-white uppercase tracking-wider mb-2">
                  <Sliders size={14} className="text-orange-400" />
                  <span>Document Editor</span>
                </div>

                <div className="space-y-3 bg-[#111622] rounded-xl p-4 border border-white/5">
                  <div>
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">To Recipient</label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-sans focus:outline-none focus:border-orange-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Target Client</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-sans focus:outline-none focus:border-orange-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Target Role</label>
                    <input
                      type="text"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-sans focus:outline-none focus:border-orange-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Sign-off Name</label>
                    <input
                      type="text"
                      value={signer}
                      onChange={(e) => setSigner(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-sans focus:outline-none focus:border-orange-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Sign-off Greeting</label>
                    <select
                      value={sigStyle}
                      onChange={(e) => setSigStyle(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-sans focus:outline-none focus:border-orange-500/50 cursor-pointer"
                    >
                      <option value="Sincerely">Sincerely</option>
                      <option value="Best Regards">Best Regards</option>
                      <option value="Respectfully yours">Respectfully yours</option>
                      <option value="Cordially">Cordially</option>
                    </select>
                  </div>

                  <button
                    onClick={applyCoverLetterPatches}
                    className="w-full px-3 py-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-xs font-mono font-black rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    {hasPatchedCL ? <Check size={12} /> : <Plus size={12} />}
                    <span>{hasPatchedCL ? "Details Synced!" : "Patch LaTeX Code"}</span>
                  </button>
                </div>

                {/* Cover letter structures */}
                <div className="pt-2">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">Narrative Audit Check</span>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[10px] font-sans text-slate-300">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                      <span>Targeted Client Interest</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-sans text-slate-300">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                      <span>Quantitative Achievement Match</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-sans text-slate-300">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                      <span>Staffing Vendor Reference</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ELEVATOR PITCH & STAR STORY BOARD COACHING PANEL */}
            {type === "pitch" && (
              <div className="space-y-4">
                
                {/* Spoken Practice Trigger */}
                <div>
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">Spoken Practice Coach</span>
                  <button
                    onClick={() => {
                      setTeleprompterOpen(true);
                      setTeleprompterSeconds(0);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-mono font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    <Volume2 size={16} className="animate-pulse" />
                    <span>Launch Teleprompter</span>
                  </button>
                </div>

                {/* Behavioral Stories card switcher */}
                <div className="pt-2 border-t border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">STAR Story Simulator</span>
                    <span className="text-[8px] font-mono text-indigo-400 bg-indigo-400/10 px-1 rounded">Active Practice</span>
                  </div>

                  <div className="flex gap-1.5 bg-slate-900 p-1 rounded-lg">
                    {[1, 2, 3].map((num, i) => (
                      <button
                        key={num}
                        onClick={() => setSelectedStarIndex(i)}
                        className={`flex-1 py-1 text-center text-[10px] font-mono font-bold rounded cursor-pointer transition-all ${
                          selectedStarIndex === i ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        S{num}
                      </button>
                    ))}
                  </div>

                  {/* Active STAR story card rendering */}
                  <div className="bg-[#111622] rounded-xl p-3 border border-white/5 space-y-2">
                    <h4 className="text-[11px] font-bold text-white font-sans leading-tight border-b border-white/5 pb-1.5">{activeStar.title}</h4>
                    
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      <div>
                        <span className="text-[8px] font-mono font-bold text-orange-400 uppercase tracking-widest block mb-0.5">SITUATION</span>
                        <p className="text-[10px] text-slate-300 font-sans leading-relaxed">{activeStar.situation}</p>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono font-bold text-pink-400 uppercase tracking-widest block mb-0.5">TASK</span>
                        <p className="text-[10px] text-slate-300 font-sans leading-relaxed">{activeStar.task}</p>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono font-bold text-indigo-400 uppercase tracking-widest block mb-0.5">ACTION</span>
                        <p className="text-[10px] text-slate-300 font-sans leading-relaxed">{activeStar.action}</p>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono font-bold text-green-400 uppercase tracking-widest block mb-0.5">RESULT</span>
                        <p className="text-[10px] text-slate-300 font-sans leading-relaxed">{activeStar.result}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic checklist & notes block for practice */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Practice Milestones</span>
                    <div className="space-y-1.5">
                      {["Hook intro stated", "Situation set clearly", "Actions emphasized", "Result quantified"].map((label) => {
                        const milestoneId = `${selectedStarIndex}_${label.replace(/\s+/g, '_')}`;
                        const isDone = completedMilestones[milestoneId] || false;
                        return (
                          <label key={label} className="flex items-center gap-2 cursor-pointer group text-[10px] font-sans text-slate-300 select-none">
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => setCompletedMilestones(prev => ({ ...prev, [milestoneId]: !isDone }))}
                              className="rounded border-white/10 bg-slate-900 text-orange-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className={isDone ? "line-through text-slate-500" : "group-hover:text-white"}>{label}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="pt-2">
                      <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">My Practice Notes</label>
                      <textarea
                        value={starNotes[`story_${selectedStarIndex}`] || ""}
                        onChange={(e) => setStarNotes(prev => ({ ...prev, [`story_${selectedStarIndex}`]: e.target.value }))}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-300 font-sans focus:outline-none focus:border-indigo-500/50 resize-none h-16"
                        placeholder="Add metrics or vocal adjustments..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CENTER COMPILER PANEL (LaTeX Source Code) */}
        {(viewMode === "split" || viewMode === "editor") && (
          <div className={`${
            viewMode === "editor" ? (showDashboard ? "lg:col-span-8" : "lg:col-span-12") : (showDashboard ? "lg:col-span-4" : "lg:col-span-6")
          } flex flex-col border-r border-white/5 bg-[#0e1116] relative group transition-all`}>
            
            {/* Header info bar */}
            <div className="bg-[#161b22] px-4 py-2 border-b border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span> 
                EDITABLE LATEX SOURCE
              </span>
              <span>COMPILING UTF-8</span>
            </div>

            {/* Code Text Area */}
            <div className="flex-1 relative flex overflow-hidden">
              {/* Monospace Line Number gutter simulation */}
              <div className="hidden sm:flex flex-col text-right pr-3 pl-4 py-4 select-none font-mono text-xs text-slate-600 bg-[#0c0d10] border-r border-white/5 text-[11px] leading-relaxed h-[calc(100vh-11rem)] overflow-hidden">
                {Array.from({ length: Math.max(1, editCode.split("\n").length) }).map((_, i) => (
                  <div key={i} className="h-[1.625rem]">{i + 1}</div>
                ))}
              </div>

              <textarea
                value={editCode}
                onChange={handleLocalChange}
                disabled={isGenerating}
                spellCheck="false"
                className="flex-1 bg-transparent text-slate-100 font-mono text-xs p-4 focus:outline-none focus:ring-0 leading-loose resize-none h-[calc(100vh-11rem)] overflow-y-auto"
                placeholder="% LaTeX code will stream in here..."
              />
            </div>
          </div>
        )}

        {/* RIGHT INTERPRETATION PANEL (Simulated Compiled PDF Document) */}
        {(viewMode === "split" || viewMode === "preview") && (
          <div className={`${
            viewMode === "preview" ? (showDashboard ? "lg:col-span-8" : "lg:col-span-12") : (showDashboard ? "lg:col-span-4" : "lg:col-span-6")
          } flex flex-col bg-slate-900/60 p-5 overflow-y-auto max-h-[calc(100vh-8.5rem)] transition-all`}>
            
            {/* Real-time PDF simulator wrapper */}
            <div className="flex flex-wrap justify-between items-center gap-2 mb-3 no-print">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Check size={12} className="text-green-400" /> SIMULATED PORTRAIT PDF
              </span>
              
              <div className="flex items-center gap-2">
                {/* Zoom Controller */}
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2 py-1 text-[10px] font-mono text-slate-400">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Zoom:</span>
                  <button
                    onClick={() => setZoomScale(prev => Math.max(0.4, prev - 0.1))}
                    className="hover:text-white px-1.5 font-bold text-xs"
                    title="Zoom Out"
                  >
                    -
                  </button>
                  <span className="text-white font-bold w-10 text-center">{Math.round(zoomScale * 100)}%</span>
                  <button
                    onClick={() => setZoomScale(prev => Math.min(1.5, prev + 0.1))}
                    className="hover:text-white px-1.5 font-bold text-xs"
                    title="Zoom In"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setZoomScale(0.85)}
                    className="hover:text-white pl-1.5 border-l border-white/10 text-[9px] text-orange-400 font-bold uppercase"
                    title="Reset Zoom"
                  >
                    Reset
                  </button>
                </div>

                {type === "resume" && (
                  <button
                    onClick={() => setHighlightKeywords(!highlightKeywords)}
                    className={`px-2.5 py-1.5 rounded-lg text-[9px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                      highlightKeywords 
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>Highlight Match: {highlightKeywords ? "ON" : "OFF"}</span>
                  </button>
                )}
                
                <span className="text-[10px] font-sans text-slate-400 bg-white/5 px-2 py-1 rounded border border-white/5">
                  Layout: <b>{editCode.includes("a4paper") ? "A4 Paper" : "Letter Paper"}</b>
                </span>
              </div>
            </div>

            {/* Simulated Paper page */}
            <div 
              style={{
                zoom: zoomScale,
                maxWidth: editCode.includes("a4paper") ? "210mm" : "8.5in",
                minHeight: editCode.includes("a4paper") ? "297mm" : "11in",
                padding: "0.4in"
              }}
              className="bg-white text-slate-950 shadow-2xl rounded-sm border border-slate-300 w-full mx-auto font-sans text-left transition-all relative pb-12"
            >
              
              {/* Note: Top color accent bar removed to keep page strictly black and white as per compiled LaTeX guidelines */}

              <div id="latex-preview-container" className="w-full h-full text-slate-900">
                {htmlPreview ? (
                  <div dangerouslySetInnerHTML={{ __html: htmlPreview }} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3 font-mono text-xs text-center">
                    <div className="w-10 h-10 border border-dashed border-slate-400 rounded-full flex items-center justify-center animate-spin">
                      <Sparkles size={16} className="text-orange-400" />
                    </div>
                    <div>
                      <p className="font-bold uppercase tracking-wider text-slate-600">Waiting for latex generator...</p>
                      <p className="text-[10px] mt-1 text-slate-500">Click "Generate Document" on the left panel to begin.</p>
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
          <span>Double-click printed PDF downloads or copy code to <b>Overleaf</b> to compile instantly.</span>
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
            <span>Download LaTeX (.tex)</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="flex-1 sm:flex-none px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-mono font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText size={14} className="text-orange-400" />
            <span>Download Plain Text (.txt)</span>
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

      {/* SPOKEN PITCH PRESENTATION PLAYBACK MODAL (TELEPROMPTER SIMULATOR) */}
      {teleprompterOpen && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-fade-in no-print">
          <div className="bg-slate-900 border border-white/10 max-w-4xl w-full h-[85vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
                  <Volume2 size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-black text-white font-mono uppercase tracking-wider">Practice Pitch Teleprompter</h3>
                  <p className="text-[10px] text-slate-400 font-sans">Practice your speaking cadence and vocal timing under real interview conditions.</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setTeleprompterOpen(false);
                  setTeleprompterPlaying(false);
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Dashboard details & timing statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-4 bg-[#111622] border-b border-white/5 font-mono text-xs">
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Elapsed Time</span>
                <span className="text-white text-base font-black mt-0.5">{formatTime(teleprompterSeconds)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Speaking Speed</span>
                <div className="flex items-center gap-1 text-white text-base font-black mt-0.5">
                  <span>{teleprompterSpeed}</span>
                  <span className="text-[10px] text-slate-400 uppercase">WPM</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Estimated Length</span>
                <span className="text-orange-400 text-base font-black mt-0.5">~ 65 Seconds</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Pace Assessment</span>
                <span className={`text-xs font-black mt-1 px-1.5 py-0.5 rounded uppercase self-start ${
                  teleprompterSpeed > 160 
                    ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                    : teleprompterSpeed < 115 
                    ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" 
                    : "bg-green-500/10 text-green-400 border border-green-500/20"
                }`}>
                  {teleprompterSpeed > 160 ? "Too Fast" : teleprompterSpeed < 115 ? "Too Slow" : "Target Pace"}
                </span>
              </div>
            </div>

            {/* Scrolling Canvas */}
            <div 
              ref={teleprompterRef}
              className="flex-1 overflow-y-auto px-10 py-16 scroll-smooth bg-[#0c0e14] relative text-center"
              style={{ scrollBehavior: "smooth" }}
            >
              <div className="max-w-2xl mx-auto space-y-6">
                
                {/* Visual guideline markers */}
                <div className="absolute left-0 right-0 top-1/2 h-[44px] -translate-y-1/2 border-y border-dashed border-purple-500/25 bg-purple-500/5 pointer-events-none flex items-center justify-between px-4 z-10 select-none">
                  <ChevronRight size={16} className="text-purple-400 animate-pulse" />
                  <span className="text-[8px] font-mono font-bold text-purple-400 uppercase tracking-widest bg-purple-500/15 px-1.5 rounded">Active Reading line</span>
                  <ChevronRight size={16} className="text-purple-400 animate-pulse rotate-180" />
                </div>

                <div className="py-24 text-slate-200 font-sans text-xl md:text-2xl leading-relaxed tracking-wide font-medium whitespace-pre-wrap select-none">
                  {extractPitchText(editCode)}
                </div>

                <p className="text-slate-600 font-mono text-xs pt-8">--- End of Pitch Transcript ---</p>
              </div>
            </div>

            {/* Playback Actions bar */}
            <div className="px-6 py-5 bg-slate-950 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
              
              {/* Speed control slider */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-slate-400 font-bold text-[10px] uppercase">WPM:</span>
                <input
                  type="range"
                  min="90"
                  max="190"
                  step="5"
                  value={teleprompterSpeed}
                  onChange={(e) => setTeleprompterSpeed(Number(e.target.value))}
                  className="w-32 accent-purple-500 cursor-pointer h-1 rounded-lg bg-white/10"
                />
                <span className="text-purple-400 font-bold">{teleprompterSpeed}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setTeleprompterPlaying(false);
                    setTeleprompterSeconds(0);
                    if (teleprompterRef.current) teleprompterRef.current.scrollTop = 0;
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>

                <button
                  onClick={() => setTeleprompterPlaying(!teleprompterPlaying)}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-[0_4px_12px_rgba(139,92,246,0.3)] hover:-translate-y-0.5 transition-all"
                >
                  {teleprompterPlaying ? <Pause size={14} /> : <Play size={14} />}
                  <span>{teleprompterPlaying ? "Pause Practice" : "Start Practicing"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
