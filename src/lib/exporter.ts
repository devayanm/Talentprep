import { QuestionBank } from "../types";

export function downloadMarkdown(rawMarkdown: string, candidateName: string) {
  const element = document.createElement("a");
  const file = new Blob([rawMarkdown], { type: "text/markdown" });
  element.href = URL.createObjectURL(file);
  element.download = `${candidateName.replace(/\s+/g, "_")}_interview_prep_guide.md`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

interface DownloadHtmlOptions {
  parsedBank: QuestionBank | null;
  candidateName: string;
  targetRole: string;
  targetClient: string;
  vendorName: string;
  domain: string;
  basicDiff: number;
  intermediateDiff: number;
  advancedDiff: number;
  userProgress: Record<string, { completed: boolean; notes: string }>;
}

export function downloadHtml({
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
}: DownloadHtmlOptions) {
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
        const state = userProgress[q.id] || { completed: false, notes: "" };
        return `
          <div class="question-block">
            <div class="question-text"><strong>${q.id}.</strong> ${q.text}</div>
            ${state.notes ? `<div class="notes-block"><strong>My Notes:</strong> ${state.notes}</div>` : ""}
          </div>
        `;
      }).join("")}
    </div>
  `).join("") || "";

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
  const file = new Blob([fullHtml], { type: "text/html" });
  element.href = URL.createObjectURL(file);
  element.download = `${candidateName.replace(/\s+/g, "_")}_interview_prep_guide.html`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
