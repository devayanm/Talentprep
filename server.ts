import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import mammoth from "mammoth";

dotenv.config();

const app = express();
const PORT = 3000;

// Set body limit to 50mb to support base64 documents (PDF/DOCX)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Endpoint to check environment & API Key status
app.get("/api/status", (req, res) => {
  res.json({
    hasApiKey: !!process.env.GEMINI_API_KEY,
    appUrl: process.env.APP_URL || "http://localhost:3000",
  });
});

// Endpoint to extract text from PDF, DOCX, or text files
app.post("/api/extract-text", async (req, res) => {
  const { fileBase64, fileName, mimeType } = req.body;

  if (!fileBase64) {
    return res.status(400).json({ error: "No file data provided." });
  }

  try {
    const isPdf = mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");
    const isDocx = mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || fileName.toLowerCase().endsWith(".docx");

    if (isPdf) {
      if (!ai) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured. Cannot process PDF file.",
        });
      }
      
      const preferredModel = req.body.preferredModel || "auto";
      console.log(`Extracting text from PDF via Gemini: ${fileName} using model selection: ${preferredModel}`);
      const pdfPart = {
        inlineData: {
          mimeType: "application/pdf",
          data: fileBase64,
        },
      };

      const extractPrompt = "Extract and return the full raw text content of this document exactly. Retain formatting (like bullet points, lists, sections, dates, and headers). Do not add any conversational text or summary. Return only the raw text of the document.";
      
      let responseText = "";
      let lastErr: any = null;

      if (preferredModel && preferredModel !== "auto") {
        try {
          const response = await ai.models.generateContent({
            model: preferredModel,
            contents: [pdfPart, { text: extractPrompt }],
          });
          responseText = response.text || "";
        } catch (err: any) {
          console.error(`Extraction failed with preferred model ${preferredModel}:`, err);
          throw new Error(`The requested model '${preferredModel}' failed to extract text (possibly rate-limited or busy). Error: ${err.message || err}`);
        }
      } else {
        // Cascade mode
        const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
        for (const model of modelsToTry) {
          try {
            console.log(`Trying extraction with model ${model}...`);
            const response = await ai.models.generateContent({
              model: model,
              contents: [pdfPart, { text: extractPrompt }],
            });
            responseText = response.text || "";
            if (responseText) {
              console.log(`Extraction successful with model ${model}!`);
              break;
            }
          } catch (err: any) {
            lastErr = err;
            console.warn(`Extraction failed with model ${model}. Trying next in cascade...`);
          }
        }

        if (!responseText) {
          throw new Error(`All models failed to extract text from PDF. The models are likely experiencing heavy traffic. Please try again or select a specific model. Details: ${lastErr?.message || lastErr}`);
        }
      }

      return res.json({ text: responseText });
    } else if (isDocx) {
      console.log(`Extracting text from DOCX via mammoth: ${fileName}`);
      const buffer = Buffer.from(fileBase64, "base64");
      const result = await mammoth.extractRawText({ buffer });
      const extractedText = result.value || "";
      return res.json({ text: extractedText });
    } else {
      // Fallback: decode base64 as UTF-8 string for txt/csv etc.
      console.log(`Extracting text as plain text: ${fileName}`);
      const decodedText = Buffer.from(fileBase64, "base64").toString("utf-8");
      return res.json({ text: decodedText });
    }
  } catch (error: any) {
    console.error("Error extracting file text:", error);
    return res.status(500).json({ error: error.message || "Failed to extract text from file." });
  }
});

// Endpoint to stream generated interview questions
app.post("/api/generate-questions", async (req, res) => {
  const { resume, jobDescription, config } = req.body;

  if (!ai) {
    return res.status(500).json({
      error: "GEMINI_API_KEY is not configured in environment variables. Please configure it in Settings > Secrets.",
    });
  }

  const {
    candidateName,
    targetRole,
    targetClient,
    vendorName,
    domain,
    difficultyDistribution,
  } = config || {};

  // Relax validation check: Require at least one identifying item instead of demanding both
  if (!resume && !jobDescription && !targetRole) {
    return res.status(400).json({ error: "Please provide at least a Resume, a Job Description, or a Target Role to compile preparation materials." });
  }

  // Build the detailed prompt enforcing all constraints from the Master Prompt
  const prompt = `
Generate a professional, vendor-level interview preparation question bank by analyzing both the candidate's resume and the job description.
The final guide must resemble the interview preparation documents used by large staffing firms (such as Tek Inspirations, Centraprise, Randstad, Apex Systems, Cognizant, TCS, Infosys, Deloitte, Accenture) before submitting candidates to end clients.

Candidate Name: ${candidateName || "Candidate"}
Target Role: ${targetRole || "Role Specified"}
Target Client: ${targetClient || "Client Specified"}
Vendor / Staffing Agency: ${vendorName || "Staffing Agency"}
Industry Domain: ${domain || "General"}

--- INPUT VARIABILITY ROBUSTNESS ---
Note: The Candidate Resume or target Job Description may be empty or incomplete:
- If CANDIDATE RESUME is empty or placeholder: Generate general technical screening questions suited for a top-tier candidate applying to the Target Role and Job Description. Focus Section 1 (Resume Validation) on general experience and achievement verification questions.
- If JOB DESCRIPTION is empty or placeholder: Focus the entire guide on validating the Candidate's Resume experience, technical skills, and industry domain best practices.
- If both are empty: Generate a stellar, industry-standard interview prep guide for a candidate entering the Target Role.

--- CANDIDATE RESUME ---
${resume || "No resume provided. Assume a standard senior-level professional profile for the target role."}

--- JOB DESCRIPTION ---
${jobDescription || "No job description provided. Optimize for general technical screening in the target role and domain."}

--- PRIMAL INSTRUCTIONS & GOALS ---
1. Prepare the candidate for: Vendor Screening, Technical Round, and Client Interview.
2. Every single line in Section 1 to 8 MUST be an actual, realistic interview question. Never generate bulleted lists of topics, definitions, or generic questions.
3. Use the following difficulty distribution across all technical questions:
   - 20% Basic (Beginner to intermediate on secondary/JD-only skills)
   - 50% Intermediate (Detailed, project-specific, or tool-specific questions)
   - 30% Advanced (Tuning, architecture, troubleshooting, edge cases, scalability)
4. Question Quality Rules:
   - No generic questions. Never ask: "What is SQL?" or "What is Power BI?".
   - Instead, ask scenario-based, deep questions that simulate a real interview with a Senior Engineer, Tech Lead, Principal Engineer, or Hiring Manager.
   - Example Database Optimization: "A query processing 150 million healthcare records is taking 9 minutes to complete. Walk me through how you would identify the bottleneck and optimize it."
   - Example Power BI: "Describe how you would redesign a Power BI semantic model containing over 200 million rows to improve dashboard performance while maintaining row-level security."
   - Example Cloud/DevOps: "Walk me through how you configure and optimize a Spark Catalyst optimizer, Delta Lake, or Unity Catalog cluster sizing."
5. Tailor questions to the resume:
   - If a technology appears in both the resume and Job Description, generate deeply technical questions probing into their real-world experience.
   - If a technology appears only in the Job Description, generate practical beginner-to-intermediate questions on it.
   - Never generate questions on technologies absent from both.
6. Tailor questions to the Industry Domain:
   - For Healthcare: Integrate topics like HEDIS, CMS, Risk Adjustment (HCC/RAF), Claims, HIPAA, HL7, FHIR, EDPS, Member data.
   - For Banking: Payments (clearing, routing), Fraud, KYC, AML, Compliance, risk metrics, trading, settlement, transactions.
   - For Retail: Inventory, supply chain, customer analytics, pricing engines.
   - For Telecom: Network activation, provisioning, OSS/BSS, subscriber data.
   - For Manufacturing: ERP, MES, IoT, SCADA, production quality.
7. Technical Depth topics to cover where applicable from resume/JD:
   - SQL: Window functions, CTEs, Recursive CTEs, query optimization, execution plans, transactions, deadlocks, performance tuning, partitioning.
   - Power BI: DAX, Measures, Gateway, RLS, composite models, incremental refresh.
   - Databricks/Spark: Delta Lake, Medallion, Streaming, Photon, Unity Catalog, partitioning, caching.
   - Python: Pandas, NumPy, concurrency, memory optimization, generators, API automation.
   - Java: Collections, Streams, Concurrency, JVM/GC tuning, Spring Boot, microservices, Saga, Kafka (DLQ, partitions).
   - Cybersecurity: SIEM, Splunk, NIST, HIPAA, incident response.
   - PM / Coordinator: JIRA, RAID, agile prioritization, user stories, dependency tracking.

--- REQUIRED OUTPUT SECTIONS AND COUNTS ---
Your output must match the exact number of questions per section as requested by staffing vendor templates:
- Title Page Details: Role, Client, Vendor, Candidate, Title of preparation guide
- Table of Contents
- Section 1: Resume & Experience Validation (Exactly 25 Questions)
  Validate achievements, timeline, companies, and roles mentioned in the resume.
- Section 2: Core Technical Skills (Exactly 30 Questions)
  Deep dive into core technologies common or mentioned.
- Section 3: Cloud & Infrastructure (Exactly 25 Questions)
  Deployment, serverless, VPC, IAM, Kubernetes, cloud-native patterns.
- Section 4: Database (Exactly 30 Questions)
  Advanced querying, schemas, optimization, indices, distributed DBs, warehousing.
- Section 5: Architecture (Exactly 25 Questions)
  System design, high availability, microservices, event-driven, resiliency.
- Section 6: Scenario Based (Exactly 30 Questions)
  Outages, performance spikes, failures, data mismatches, lag, API bottlenecks.
- Section 7: Behavioral (Exactly 20 Questions)
  STAR format questions covering conflict, leadership, project failures, or stakeholder management.
- Section 8: Questions Candidate Should Ask Interviewer (Exactly 10 Questions)
  Insightful, smart questions showing interest in architectural or business challenges.

--- STYLISTIC CONSTRAINTS ---
- NO answers.
- NO explanations.
- NO emojis.
- NO introductory or concluding pleasantries. Output only the formatted content.
- Do not use tables unless specifically asked.
- Use clean Markdown with headers:
  - Keep the metadata at the very top using custom keys like:
    ROLE: ${targetRole}
    CLIENT: ${targetClient}
    VENDOR: ${vendorName}
    PREPARED_FOR: ${candidateName}
  - Then use "## Section 1: Resume & Experience Validation", etc.
  - Numbered list for questions (e.g. "1. ", "2. ", up to the exact count specified for each section).

Begin generating the interview preparation question bank strictly following these instructions.
`;

  try {
    // Set response headers for Server-Sent Events (SSE) streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const preferredModel = req.body.preferredModel || "auto";
    let resultStream;
    let selectedModel = "gemini-3.5-flash";
    let lastError: any = null;

    // Helper function to execute stream with retries
    async function tryModelWithRetry(modelName: string, retries = 2, delay = 1000): Promise<any> {
      try {
        console.log(`Attempting generation with model ${modelName}...`);
        const stream = await ai.models.generateContentStream({
          model: modelName,
          contents: prompt,
          config: {
            temperature: 0.2, // lower temperature for more precise technical focus
          },
        });
        return stream;
      } catch (err: any) {
        console.error(`Error with model ${modelName}:`, err?.message || err);
        const isTransient = err?.status === 503 || 
                            err?.status === 429 || 
                            err?.message?.includes("503") || 
                            err?.message?.includes("429") ||
                            err?.message?.includes("UNAVAILABLE") ||
                            err?.message?.includes("high demand") ||
                            err?.message?.includes("busy");
        
        if (isTransient && retries > 0) {
          console.warn(`Transient error on model ${modelName}. Retrying in ${delay}ms... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return tryModelWithRetry(modelName, retries - 1, delay * 2);
        }
        throw err;
      }
    }

    if (preferredModel && preferredModel !== "auto") {
      // User requested a specific model. We only try this model.
      try {
        selectedModel = preferredModel;
        resultStream = await tryModelWithRetry(preferredModel, 2, 1000);
      } catch (err: any) {
        console.error(`User preferred model ${preferredModel} failed:`, err);
        const errMessage = err?.message || String(err);
        const userFriendlyError = `The requested model '${preferredModel}' is currently experiencing extremely high demand or has crossed its rate limit. Please select a different model from the dropdown (e.g. Gemini 3.1 Flash Lite or 1.5 Flash) or choose 'Auto-Fallback Mode' and try again. [Details: ${errMessage}]`;
        throw new Error(userFriendlyError);
      }
    } else {
      // Auto-fallback cascade mode
      const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
      
      for (const model of modelsToTry) {
        try {
          selectedModel = model;
          resultStream = await tryModelWithRetry(model, 1, 1000); // 1 retry per model in cascade to fail-over faster
          if (resultStream) {
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`Model ${model} failed in cascade. Trying next...`);
        }
      }

      if (!resultStream) {
        throw new Error(`All automatic models are currently overloaded. Please choose a specific model (like Gemini 3.1 Flash Lite) from the model selector to attempt a manual connection. Details: ${lastError?.message || lastError}`);
      }
    }

    for await (const chunk of resultStream) {
      if (chunk.text) {
        // Send raw text chunk formatted for SSE
        res.write(`data: ${JSON.stringify({ text: chunk.text, model: selectedModel })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err: any) {
    console.error("Gemini stream error:", err);
    res.write(`data: ${JSON.stringify({ error: err.message || "An error occurred during generation." })}\n\n`);
    res.end();
  }
});

// Endpoint to stream generated LaTeX Resume
app.post("/api/generate-resume-latex", async (req, res) => {
  const { resume, jobDescription, config, targetPages, templateLatex } = req.body;

  if (!ai) {
    return res.status(500).json({
      error: "GEMINI_API_KEY is not configured. Please configure it in Settings > Secrets.",
    });
  }

  const {
    candidateName,
    targetRole,
    targetClient,
    vendorName,
    domain,
  } = config;

  const pageLimitInstruction = targetPages === "1" 
    ? "Force the content to fit strictly within 1 page. Keep summaries concise, limit to 2-3 key projects and past roles, and use 2-3 high-impact bullet points per role."
    : targetPages === "2"
    ? "Optimize content density for exactly 2 pages. Include detailed professional summaries, up to 4 roles and 3 projects with comprehensive bullet points demonstrating quantitative impact."
    : "Output a natural length, typically 1 to 2 pages based on experience depth.";

  const templateMandate = templateLatex 
    ? `--- PRESETS & LATEX TEMPLATE MANDATE ---
You must output a single fully-compilable LaTeX file. You MUST strictly use the EXACT preamble, documentclass, margins, custom commands (such as \\resumeSubheading, \\resumeItem, etc.), and layout styling defined in the template below. 
Do NOT invent new custom command definitions or change font packages unless they are in the template. Re-align and reformat the candidate's achievements and projects into this style:
\`\`\`latex
${templateLatex}
\`\`\``
    : `--- PRESETS & LATEX TEMPLATE MANDATE ---
You must output a single fully-compilable LaTeX file. Maintain this EXACT structural and aesthetic preamble:
\`\`\`latex
\\documentclass[letterpaper,10pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

% Font options
\\usepackage[sfdefault]{roboto}  % Sans-serif font

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Section formatting
\\titleformat{\\section}{\\Large\\bfseries\\scshape\\raggedright}{}{0em}{}[\\titlerule]

% Ensure PDF is machine readable
\\pdfgentounicode=1

% Custom commands
\\newcommand{\\resumeItem}[1]{\\item\\small{#1}}
\\newcommand{\\resumeSubheading}[4]{
\\vspace{-1pt}\\item
  \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
    \\textbf{#1} & #2 \\\\
    \\textit{#3} & \\textit{#4} \\\\
  \\end{tabular*}\\vspace{-7pt}
}
\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\newcommand{\\resumeSubHeadingList}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\`\`\``;

  const prompt = `
You are an expert resume writer and ATS optimization specialist.
Reformat the candidate's resume to match the exact LaTeX template and styling rules provided below.
Align the resume contents with the provided Job Description to make it highly ATS-friendly, optimizing descriptions for matching keywords, phrasing achievements with quantitative impact, and using industry terms.

--- INPUT VARIABILITY ROBUSTNESS ---
Note: Either the candidate's resume or the target Job Description may be empty or incomplete:
- If CANDIDATE RESUME is empty: Create an incredibly clean, high-impact boilerplate Resume template for the specified Target Role, featuring realistic placeholder achievements, project bullet points, and skills that the user can later customize.
- If JOB DESCRIPTION is empty: Reformat and clean up the candidate's resume based purely on the candidate resume provided, optimizing for general ATS best practices, correcting typography, and implementing beautiful LaTeX formatting.

Page Target Rule: ${pageLimitInstruction}

Candidate Name: ${candidateName || "Candidate Name"}
Target Role: ${targetRole || "Target Role"}
Target Client: ${targetClient || "Target Client"}
Vendor / Staffing Agency: ${vendorName || "Staffing Agency"}
Industry Domain: ${domain || "General"}

--- CANDIDATE RESUME ---
${resume || "No resume provided. Generate a high-quality professional boilerplate for the specified role."}

--- JOB DESCRIPTION ---
${jobDescription || "No job description provided. Perform standard ATS-optimized formatting and styling."}

${templateMandate}

--- WRITING & REFORMATTING RULES ---
1. Header: Render candidate name at the top in \\textbf{\\Huge Candidate Name}. Render contact details nicely below (Phone, Email, LinkedIn, GitHub). Escape all special characters in URLs and emails properly (such as using \\href{mailto:email}{email}, and escaping '_' as \\_).
2. Summary: Generate a 3-4 sentence powerful Professional Summary targeting the Job Description's requirements and domain.
3. Technical Skills: Map candidate's skills to the JD, categorizing them clearly (e.g., Programming Languages, Databases, Tools). Use \\resumeSubHeadingList and \\resumeItem.
4. Experience & Projects: Use the exact \\resumeSubheading{Company/Title}{Dates}{Role}{Location} command. Bullet points under experience and projects must use:
   \\begin{itemize}[leftmargin=0.15in]
     \\resumeItem{Developed/Architected/Optimized...}
     \\resumeItem{Reduced latency...}
   \\end{itemize}
5. Educational & Certifications: Align with the user template structures.
6. Crucial LaTeX escaping:
   - Escape percentage symbols % as \\%
   - Escape ampersand symbols & as \\&
   - Escape underscores _ as \\_
   - Escape dollar signs $ as \\$
   - Ensure braces are closed properly and do not include unescaped control sequences.
7. Output only the compilable LaTeX code starting from \\documentclass and ending with \\end{document}. Do not wrap the response in markdown blocks in the streaming text or include introductory texts. Just output raw latex directly.

Begin generating the optimized, compilable LaTeX Resume.
`;

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const preferredModel = req.body.preferredModel || "auto";
    let resultStream;
    let selectedModel = "gemini-3.5-flash";

    if (preferredModel && preferredModel !== "auto") {
      selectedModel = preferredModel;
      resultStream = await ai.models.generateContentStream({
        model: preferredModel,
        contents: prompt,
        config: { temperature: 0.2 },
      });
    } else {
      resultStream = await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { temperature: 0.2 },
      });
    }

    for await (const chunk of resultStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text, model: selectedModel })}\n\n`);
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err: any) {
    console.error("Resume LaTeX stream error:", err);
    res.write(`data: ${JSON.stringify({ error: err.message || "An error occurred during resume generation." })}\n\n`);
    res.end();
  }
});

// Endpoint to stream generated LaTeX Cover Letter
app.post("/api/generate-cover-letter-latex", async (req, res) => {
  const { resume, jobDescription, config } = req.body;

  if (!ai) {
    return res.status(500).json({
      error: "GEMINI_API_KEY is not configured. Please configure it in Settings > Secrets.",
    });
  }

  const {
    candidateName,
    targetRole,
    targetClient,
    vendorName,
    domain,
  } = config;

  const prompt = `
You are a top-tier executive career coach.
Generate a tailored, high-impact Cover Letter in LaTeX that matches the fonts and layout aesthetic of the resume template.
Address it to the hiring manager of ${targetClient || "the Target Client"} for the role of ${targetRole || "the Target Role"}.
Align the narrative with the Job Description's key challenges and show how the candidate's experience solves their specific problems.

--- INPUT VARIABILITY ROBUSTNESS ---
Note: Either the candidate's resume or the target Job Description may be empty or incomplete:
- If CANDIDATE RESUME is empty: Draft a highly professional Cover Letter with generic strong narrative highlights for the Target Role, allowing the candidate to fill in specific metric highlights later.
- If JOB DESCRIPTION is empty: Create a general-purpose professional cover letter expressing high interest in the Target Role, showcasing key skills and achievements from the candidate's resume.

Candidate Name: ${candidateName || "Candidate Name"}
Vendor / Staffing Agency: ${vendorName || "Staffing Agency"}
Industry Domain: ${domain || "General"}

--- CANDIDATE RESUME ---
${resume || "No resume provided. Write a high-impact cover letter for the specified target role with professional achievements placeholders."}

--- JOB DESCRIPTION ---
${jobDescription || "No job description provided. Optimize for high interest and value alignment for the specified target role."}

--- PRESETS & LATEX TEMPLATE MANDATE ---
Output a single fully-compilable LaTeX file. Use this Roboto style to match the resume exactly:
\`\`\`latex
\\documentclass[letterpaper,10pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

% Font options
\\usepackage[sfdefault]{roboto}  % Sans-serif font

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Section formatting
\\titleformat{\\section}{\\Large\\bfseries\\scshape\\raggedright}{}{0em}{}[\\titrule]

% Ensure PDF is machine readable
\\pdfgentounicode=1

\\begin{document}

\\begin{center}
  \\textbf{\\Huge ${candidateName || "Candidate Name"}} \\\\
  \\small [Phone / Email / Links from Resume]
\\end{center}

\\vspace{10pt}

\\hfill \\today

\\vspace{10pt}

\\textbf{TO:} \\\\
Hiring Team / Hiring Manager \\\\
${targetClient || "Target Client"} \\\\
[Client Address or Remote Office]

\\vspace{15pt}

\\textbf{RE: Application for ${targetRole || "Target Role"}}

\\vspace{10pt}

Dear Hiring Manager,

[Body of Cover Letter:
  - Paragraph 1: Express strong, customized interest in the role, referencing the specific client, domain, and role.
  - Paragraph 2: Dive into 2-3 specific technical achievements from their resume that directly solve the core technical pain points mentioned in the Job Description. Highlight quantitative impact.
  - Paragraph 3: Explain their experience in the ${domain} domain and why they are uniquely suited to deliver immediate value.
  - Paragraph 4: Professional closing, referencing the staffing partner ${vendorName || "Staffing Partner"} if appropriate, and requesting a discussion.
]

\\vspace{15pt}

Sincerely, \\\\
\\vspace{15pt}
\\textbf{${candidateName || "Candidate Name"}}

\\end{document}
\`\`\`

--- WRITING & LATEX RULES ---
1. Body text must be extremely persuasive, executive, and direct. Avoid generic fluff.
2. Escape special characters: % as \\%, & as \\&, _ as \\_, $ as \\$.
3. Clean LaTeX syntax. Fill in placeholders like [Phone / Email / Links] with actual values parsed from the resume.
4. Output only raw compilable LaTeX code starting from \\documentclass. Do not wrap in markdown or add conversational intro/outro texts.

Begin generating the compilable LaTeX Cover Letter.
`;

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const preferredModel = req.body.preferredModel || "auto";
    let resultStream;
    let selectedModel = "gemini-3.5-flash";

    if (preferredModel && preferredModel !== "auto") {
      selectedModel = preferredModel;
      resultStream = await ai.models.generateContentStream({
        model: preferredModel,
        contents: prompt,
        config: { temperature: 0.25 },
      });
    } else {
      resultStream = await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { temperature: 0.25 },
      });
    }

    for await (const chunk of resultStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text, model: selectedModel })}\n\n`);
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err: any) {
    console.error("Cover Letter LaTeX stream error:", err);
    res.write(`data: ${JSON.stringify({ error: err.message || "An error occurred during cover letter generation." })}\n\n`);
    res.end();
  }
});

// Endpoint to stream generated LaTeX Pitch / Prep Sheet
app.post("/api/generate-pitch-latex", async (req, res) => {
  const { resume, jobDescription, config } = req.body;

  if (!ai) {
    return res.status(500).json({
      error: "GEMINI_API_KEY is not configured. Please configure it in Settings > Secrets.",
    });
  }

  const {
    candidateName,
    targetRole,
    targetClient,
    vendorName,
    domain,
  } = config;

  const prompt = `
You are a senior recruitment director.
Create a comprehensive, personalized Interview Preparation Pitch and Cheat Sheet in compilable LaTeX using the Roboto sans-serif layout.
This document helps the candidate master their introduction and high-stakes answers before talking to the client.

--- INPUT VARIABILITY ROBUSTNESS ---
Note: Either the candidate's resume or the target Job Description may be empty or incomplete:
- If CANDIDATE RESUME is empty: Construct a general, high-impact 60-second verbal pitch transcript for the specified Target Role and target client, along with standard high-performance STAR stories that are typical for top candidates in this field.
- If JOB DESCRIPTION is empty: Base all verbal pitch and behavioral STAR outline coaching points purely on the candidate's actual resume history and general industry role expectations.

Candidate Name: ${candidateName || "Candidate"}
Target Role: ${targetRole || "Target Role"}
Target Client: ${targetClient || "Target Client"}
Vendor Partner: ${vendorName || "Staffing Partner"}
Domain: ${domain}

--- CANDIDATE RESUME ---
${resume || "No resume provided. Generate a high-quality professional 60s pitch and STAR prep brief for this role."}

--- JOB DESCRIPTION ---
${jobDescription || "No job description provided. Perform standard high-performance interview elevator pitch and STAR response outlines."}

--- CONTENT REQUIREMENTS ---
Create three key sections formatted in compilable LaTeX:
1. Section: 60-Second Elevator Pitch (A highly-crafted, verbal response to "Tell me about yourself". Must flow naturally and connect their background directly to the requirements of the JD)
2. Section: High-Impact Behavioral Frameworks (Generate 3 real STAR stories Situations, Tasks, Actions, Results from their resume matching key technical/behavioral needs of the JD. Categorize them as: Overcoming Technical Challenge, Resolving Conflict/Stakeholder Alignment, and Scaling/Optimizing Infrastructure)
3. Section: Secret Weapon Prep Q&A (Prepare deep strategic responses to: "Why are you interested in ${targetClient}?" and "What makes you uniquely qualified for this specific codebase?")

--- PRESETS & LATEX TEMPLATE MANDATE ---
Output a single compilable LaTeX file. Maintain this Roboto styling:
\`\`\`latex
\\documentclass[letterpaper,10pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

% Font options
\\usepackage[sfdefault]{roboto}  % Sans-serif font

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Section formatting
\\titleformat{\\section}{\\Large\\bfseries\\scshape\\raggedright}{}{0em}{}[\\titlerule]

% Ensure PDF is machine readable
\\pdfgentounicode=1

\\begin{document}

\\begin{center}
  \\textbf{\\Huge ${candidateName || "Candidate"} - INTERVIEW PREP BRIEFING} \\\\
  \\small Target Role: ${targetRole || "Role"} $|$ Client: ${targetClient || "Client"} $|$ Vendor Partner: ${vendorName || "Partner"}
\\end{center}

\\section*{1. The 60-Second Elevator Pitch}
[Engaging verbal transcript here. Write in 1st person. Make it flow perfectly.]

\\section*{2. High-Impact STAR Stories}
\\begin{description}
  \\item[\\textbf{Story 1: Technical Outage \\& Problem Solving}] \\\\
    \\textbf{Situation:} [Context...] \\\\
    \\textbf{Task:} [Objective...] \\\\
    \\textbf{Action:} [Exact steps candidate took...] \\\\
    \\textbf{Result:} [Quantitative metrics/outcome...]
  
  \\item[\\textbf{Story 2: Stakeholder Alignment}] \\\\
    \\textbf{Situation:} [Context...] \\\\
    \\textbf{Task:} [Objective...] \\\\
    \\textbf{Action:} [Exact steps candidate took...] \\\\
    \\textbf{Result:} [Outcome...]

  \\item[\\textbf{Story 3: Scalability \\& Performance Tuning}] \\\\
    \\textbf{Situation:} [Context...] \\\\
    \\textbf{Task:} [Objective...] \\\\
    \\textbf{Action:} [Exact steps...] \\\\
    \\textbf{Result:} [Metrics...]
\\end{description}

\\section*{3. Tactical Answers to Strategic Questions}
\\begin{description}
  \\item[\\textbf{Why are you interested in ${targetClient}?}] \\\\
    [Insightful response showcasing knowledge of their domain and technology stacks...]
  \\item[\\textbf{What makes you the absolute best fit for this environment?}] \\\\
    [Compelling value proposition matching resume strengths with JD requirements...]
\\end{description}

\\end{document}
\`\`\`

--- WRITING & LATEX RULES ---
1. Keep responses highly customized, professional, and powerful.
2. Escape special characters properly (e.g. % -> \\%, & -> \\&, _ -> \\_).
3. Output only the compilable LaTeX content starting from \\documentclass. Do not wrap in markdown or add conversational texts.

Begin generating the compilable LaTeX Interview Briefing.
`;

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const preferredModel = req.body.preferredModel || "auto";
    let resultStream;
    let selectedModel = "gemini-3.5-flash";

    if (preferredModel && preferredModel !== "auto") {
      selectedModel = preferredModel;
      resultStream = await ai.models.generateContentStream({
        model: preferredModel,
        contents: prompt,
        config: { temperature: 0.25 },
      });
    } else {
      resultStream = await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { temperature: 0.25 },
      });
    }

    for await (const chunk of resultStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text, model: selectedModel })}\n\n`);
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err: any) {
    console.error("Interview Pitch LaTeX stream error:", err);
    res.write(`data: ${JSON.stringify({ error: err.message || "An error occurred during interview briefing generation." })}\n\n`);
    res.end();
  }
});

// Endpoint to stream generated recruiter-style Job Description
app.post("/api/generate-jd", async (req, res) => {
  const { resume, config } = req.body;

  if (!ai) {
    return res.status(500).json({
      error: "GEMINI_API_KEY is not configured. Please configure it in Settings > Secrets.",
    });
  }

  const {
    candidateName,
    targetRole,
    targetClient,
    vendorName,
    location,
    duration,
    payRate,
    domain,
    specializationProfile,
  } = config || {};

  const prompt = `You are a strict, enterprise-grade AI system that outputs Job Descriptions (JDs) following a highly-defined markdown template. 

CORE MISSION:
You are provided with a strict Markdown template. Your sole task is to generate the content for each section based on the Candidate Resume, Candidate Specialization Profile, and Target Specs, and return the template fully populated.
Do NOT modify the structure, do NOT change the header wording, do NOT add extra headers, and do NOT remove any headers.
Do NOT wrap the output in markdown code blocks (e.g. do NOT use triple backticks block wrapper).
Do NOT include any introduction, conversational text, or explanation before or after the JD. Output ONLY the filled template.

--- STRICT MARKDOWN TEMPLATE TO FILL ---
Hello ${candidateName || "XYZ"},

Hope this email finds you well!

Kindly go through the job description and let me know if you are interested.


**Role:** ${targetRole || "Role Specified"}
**Location:** ${location || "Remote"}
**Duration:** ${duration || "12+ Months Contract"}
**Prime Vendor:** **${vendorName || "Staffing Partner"}**
**End Client:** **${targetClient || "Confidential Client"}**
**Pay Rate:** ${payRate || "$55/hr - $75/hr"}


### **Job Summary:**

[1 or 2 paragraphs of Job Summary text describing the role, mission, and setting. If multiple paragraphs, separate with a blank line. Aligned to candidate background but 1-2 levels stronger. Make sure to bold key terms like target client and role title where they first appear.]

### **Requirements:**

* **[Requirement item 1 title/key-phrase in bold]** [details...]
* **[Requirement item 2 title/key-phrase in bold]** [details...]
... [Provide exactly 8-10 high-quality, relevant requirements. No generic bullet symbols other than '* '. Bold the initial key-phrase of every single requirement bullet.]

### **Nice to Have:**

* **[Nice-to-Have item 1 in bold]** [details...]
... [Provide exactly 3-5 relevant nice-to-have items. No generic bullet symbols other than '* '. Bold the initial key-phrase of every single bullet.]

### **Responsibilities:**

* **[Responsibility item 1 action title in bold]** [action and business impact...]
* **[Responsibility item 2 action title in bold]** [action and business impact...]
... [Provide exactly 8-10 high-quality, relevant responsibilities. No generic bullet symbols other than '* '. Start each bullet with a strong action verb and bold the initial key-phrase of every single responsibility bullet.]

--- END OF TEMPLATE ---

--- VALUES TO POPULATE INTO THE TEMPLATE ---
Candidate Name: ${candidateName || "XYZ"}
Candidate Specialization Profile: ${specializationProfile || "None"}
Target Role: ${targetRole || "Role Specified"}
Location: ${location || "Remote"}
Duration: ${duration || "12+ Months Contract"}
Prime Vendor: ${vendorName || "Staffing Partner"}
End Client: ${targetClient || "Confidential Client"}
Pay Rate: ${payRate || "$55/hr - $75/hr"}

--- CANDIDATE RESUME FOR PROFILE ALIGNMENT ---
${resume || "No resume provided. Assume a standard high-caliber professional matching the target role."}

--- ENHANCEMENT & ATS RULES (APPLY WHEN GENERATING THE CONTENT TO FILL) ---
1. PROFILE ALIGNMENT & ATS-OPTIMIZATION:
- Content must align with the candidate's core domain, experience, and technical direction.
- Add adjacent technologies, enterprise expectations, and distributed/cloud-native/production-grade engineering expectations.
- Maintain a highly technical, professional, and powerful tone. Every bullet must feel realistic.
- Every single bullet point under Requirements, Nice to Have, and Responsibilities MUST start with an asterisk followed by a space ('* ') and have the initial key phrase bolded (e.g. "* **5+ years** of experience in...").

2. MANDATORY VARIATION RULE:
- Vary role titles, summaries, technical wording, responsibilities, and requirement orders so it feels independently crafted rather than repetitive.

3. SPECIALIZATION-SPECIFIC RULES:
${specializationProfile === "bindu" ? `- Inject highly technical AI/ML/Data Engineering terminology, enterprise ML systems, distributed processing, LLM/RAG, PySpark, MLOps, cloud-scale pipelines, and cloud data warehouse (CDW) context.` : ""}
${specializationProfile === "harsha" ? `- Inject AI systems, LLM, RAG, inference pipelines, NLP, and AI infrastructure terminology.` : ""}
${specializationProfile === "kirandeep" ? `- Inject Salesforce architecture, Apex, LWC, CRM integrations, enterprise CRM automation, and CI/CD terminology.` : ""}
${specializationProfile === "likhitha" ? `- Inject scalable frontend, performance optimization, UI engineering, React ecosystem, observability, and design systems.` : ""}

Begin generating the populated template. Remember, do not output backticks or wrap the output. Output raw text of the filled template directly.
`;

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const preferredModel = req.body.preferredModel || "auto";
    let resultStream;
    let selectedModel = "gemini-3.5-flash";
    let lastError: any = null;

    // Helper function to execute stream with retries
    async function tryModelWithRetry(modelName: string, retries = 2, delay = 1000): Promise<any> {
      try {
        console.log(`Attempting JD generation with model ${modelName}...`);
        const stream = await ai.models.generateContentStream({
          model: modelName,
          contents: prompt,
          config: {
            temperature: 0.3,
          },
        });
        return stream;
      } catch (err: any) {
        console.error(`Error with model ${modelName}:`, err?.message || err);
        const isTransient = err?.status === 503 || 
                            err?.status === 429 || 
                            err?.message?.includes("503") || 
                            err?.message?.includes("429") ||
                            err?.message?.includes("UNAVAILABLE") ||
                            err?.message?.includes("high demand") ||
                            err?.message?.includes("busy");
        
        if (isTransient && retries > 0) {
          console.warn(`Transient error on model ${modelName}. Retrying in ${delay}ms... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return tryModelWithRetry(modelName, retries - 1, delay * 2);
        }
        throw err;
      }
    }

    if (preferredModel && preferredModel !== "auto") {
      try {
        selectedModel = preferredModel;
        resultStream = await tryModelWithRetry(preferredModel, 2, 1000);
      } catch (err: any) {
        console.error(`User preferred model ${preferredModel} failed for JD:`, err);
        const errMessage = err?.message || String(err);
        const userFriendlyError = `The requested model '${preferredModel}' is currently experiencing extremely high demand or has crossed its rate limit. Please select a different model from the dropdown (e.g. Gemini 3.1 Flash Lite) or choose 'Auto-Fallback Mode' and try again. [Details: ${errMessage}]`;
        throw new Error(userFriendlyError);
      }
    } else {
      // Auto-fallback cascade mode
      const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
      for (const model of modelsToTry) {
        try {
          selectedModel = model;
          resultStream = await tryModelWithRetry(model, 1, 1000);
          if (resultStream) break;
        } catch (err: any) {
          lastError = err;
          console.warn(`Model ${model} failed in cascade for JD. Trying next...`);
        }
      }

      if (!resultStream) {
        throw new Error(`All automatic models are currently overloaded. Please choose a specific model (like Gemini 3.1 Flash Lite) to attempt a manual connection. Details: ${lastError?.message || lastError}`);
      }
    }

    for await (const chunk of resultStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text, model: selectedModel })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err: any) {
    console.error("Gemini JD stream error:", err);
    res.write(`data: ${JSON.stringify({ error: err.message || "An error occurred during JD generation." })}\n\n`);
    res.end();
  }
});

// Vite middleware and static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
