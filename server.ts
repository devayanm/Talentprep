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
      
      console.log(`Extracting text from PDF via Gemini: ${fileName}`);
      const pdfPart = {
        inlineData: {
          mimeType: "application/pdf",
          data: fileBase64,
        },
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          pdfPart,
          { text: "Extract and return the full raw text content of this document exactly. Retain formatting (like bullet points, lists, sections, dates, and headers). Do not add any conversational text or summary. Return only the raw text of the document." }
        ],
      });

      const extractedText = response.text || "";
      return res.json({ text: extractedText });
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

  if (!resume || !jobDescription) {
    return res.status(400).json({ error: "Resume and Job Description are required." });
  }

  const {
    candidateName,
    targetRole,
    targetClient,
    vendorName,
    domain,
    difficultyDistribution,
  } = config;

  // Build the detailed prompt enforcing all constraints from the Master Prompt
  const prompt = `
Generate a professional, vendor-level interview preparation question bank by analyzing both the candidate's resume and the job description.
The final guide must resemble the interview preparation documents used by large staffing firms (such as Tek Inspirations, Centraprise, Randstad, Apex Systems, Cognizant, TCS, Infosys, Deloitte, Accenture) before submitting candidates to end clients.

Candidate Name: ${candidateName || "Candidate"}
Target Role: ${targetRole || "Role Specified in JD"}
Target Client: ${targetClient || "Client Specified in JD"}
Vendor / Staffing Agency: ${vendorName || "Staffing Agency"}
Industry Domain: ${domain || "General"}

--- CANDIDATE RESUME ---
${resume}

--- JOB DESCRIPTION ---
${jobDescription}

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
