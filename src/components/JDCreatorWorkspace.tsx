import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  Sparkles, 
  Copy, 
  Download, 
  Printer, 
  User, 
  Cpu, 
  FileText, 
  AlertTriangle,
  RefreshCw,
  Plus,
  Compass,
  Check,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2
} from "lucide-react";

interface JDCreatorWorkspaceProps {
  resumeText: string;
  preferredModel: string;
}

interface SpecializedPreset {
  name: string;
  role: string;
  client: string;
  vendor: string;
  domain: "Healthcare" | "Banking" | "Retail" | "Telecom" | "Manufacturing" | "General";
  payRate: string;
  duration: string;
  location: string;
  profileId: "bindu" | "harsha" | "kirandeep" | "likhitha";
  description: string;
}

const SPECIAL_PRESETS: SpecializedPreset[] = [
  {
    profileId: "bindu",
    name: "Bindu",
    role: "ML Platform Engineer",
    client: "Brady Corporation",
    vendor: "Brooksource",
    domain: "Manufacturing",
    payRate: "$75/hr - $95/hr",
    duration: "12+ Months Contract",
    location: "Milwaukee, WI (Hybrid)",
    description: "Highly technical AI/ML/Data Eng, PySpark, MLOps, LLM/RAG, Cloud Data Warehouses"
  },
  {
    profileId: "harsha",
    name: "Harsha",
    role: "Lead AI Engineer",
    client: "UnitedHealth Group",
    vendor: "Centraprise",
    domain: "Healthcare",
    payRate: "$85/hr - $110/hr",
    duration: "18+ Months Contract",
    location: "Austin, TX (Remote)",
    description: "AI Systems, LLMs, NLP, RAG, Inference pipelines, AI Infrastructure"
  },
  {
    profileId: "kirandeep",
    name: "Kirandeep",
    role: "Enterprise Salesforce Architect",
    client: "Bank of America",
    vendor: "Randstad",
    domain: "Banking",
    payRate: "$90/hr - $115/hr",
    duration: "24+ Months Contract",
    location: "Charlotte, NC (Hybrid)",
    description: "Salesforce Architecture, Apex, LWC, CRM Integrations, CI/CD"
  },
  {
    profileId: "likhitha",
    name: "Likhitha",
    role: "Principal UI Developer",
    client: "Capital One",
    vendor: "Teksystems",
    domain: "Banking",
    payRate: "$70/hr - $90/hr",
    duration: "12+ Months Contract",
    location: "Richmond, VA (Hybrid)",
    description: "Scalable Front-End, React Ecosystem, UI Performance, Observability, Design Systems"
  }
];

const REALISTIC_CLIENTS = [
  "UnitedHealth Group",
  "Bank of America",
  "Capital One",
  "Walmart",
  "The Home Depot",
  "Pfizer",
  "Ford Motor Company",
  "Cisco Systems",
  "Eli Lilly",
  "Brady Corporation",
  "CVS Health",
  "Humana",
  "Anthem / Elevance Health",
  "Centene",
  "Cigna",
  "HCA Healthcare",
  "State Farm",
  "Allstate",
  "Travelers Insurance",
  "Liberty Mutual",
  "Nationwide Insurance",
  "Progressive Corporation",
  "PNC Financial Services",
  "Wells Fargo",
  "US Bank",
  "Truist Financial",
  "Discover Financial",
  "Citizens Bank",
  "KeyBank",
  "Fifth Third Bank",
  "Charles Schwab",
  "Fidelity Investments",
  "Comerica",
  "M&T Bank",
  "Target",
  "Lowe's",
  "Costco Wholesale",
  "Kroger",
  "Walgreens Boots Alliance",
  "Macy's",
  "Nordstrom",
  "Starbucks",
  "PepsiCo",
  "Coca-Cola Company",
  "Marriott International",
  "Sysco Corporation",
  "General Mills",
  "Kellanova",
  "General Motors",
  "Deere & Company",
  "Caterpillar Inc.",
  "Boeing",
  "Lockheed Martin",
  "FedEx Corporation",
  "United Parcel Service (UPS)",
  "Union Pacific",
  "Honeywell International",
  "3M Company",
  "Duke Energy",
  "Southern Company",
  "NextEra Energy",
  "Exelon",
  "Comcast",
  "Charter Communications",
  "AT&T",
  "Verizon Communications",
  "AbbVie",
  "Abbott Laboratories",
  "Bristol Myers Squibb"
];

const REALISTIC_VENDORS = [
  "Brooksource",
  "Centraprise",
  "Randstad",
  "Teksystems",
  "Kforce",
  "Insight Global",
  "Apex Systems",
  "Collabera",
  "Robert Half",
  "Kelly Services",
  "ManpowerGroup",
  "Adecco USA",
  "Diversant",
  "Judge Group",
  "Signature Consultants",
  "Rose International",
  "Strategic Staffing Solutions (S3)",
  "Eliassen Group",
  "Oxford Global Resources",
  "Vaco",
  "Genesis10",
  "MATRIX Resources",
  "Beacon Hill Staffing Group",
  "Yoh Staffing",
  "DISYS",
  "Mitchell International",
  "Synergis",
  "Mindlance",
  "Compunnel",
  "Artech Information Systems",
  "US Tech Solutions",
  "TEK Inspirations",
  "System One",
  "Advantage Resourcing",
  "Digital Intelligence Systems"
];

export default function JDCreatorWorkspace({ resumeText, preferredModel }: JDCreatorWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"ai_generator" | "beautifier">("ai_generator");
  
  // Same Day vs Next Day automation states
  const [isSameDay, setIsSameDay] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // State for AI Generator input
  const [candidateName, setCandidateName] = useState("Mihir");
  const [targetRole, setTargetRole] = useState("Data Scientist");
  const [targetClient, setTargetClient] = useState("Brady Corporation");
  const [vendorName, setVendorName] = useState("Brooksource");
  const [domain, setDomain] = useState<string>("Manufacturing");
  const [location, setLocation] = useState("Milwaukee, WI (Hybrid)");
  const [duration, setDuration] = useState("12+ Months Contract");
  const [payRate, setPayRate] = useState("$42/hr - $55/hr");
  const [selectedProfile, setSelectedProfile] = useState<"bindu" | "harsha" | "kirandeep" | "likhitha" | "none">("none");

  // State for Beautifier input
  const [rawPasteJd, setRawPasteJd] = useState("");
  const [beautifyRole, setBeautifyRole] = useState("");
  const [beautifyClient, setBeautifyClient] = useState("");
  const [beautifyVendor, setBeautifyVendor] = useState("");
  const [beautifyLocation, setBeautifyLocation] = useState("");
  const [beautifyDuration, setBeautifyDuration] = useState("");
  const [beautifyPayRate, setBeautifyPayRate] = useState("");

  // Editor and live Preview text state
  const [activeJdText, setActiveJdText] = useState<string>("");
  const [previewMode, setPreviewMode] = useState<"document" | "raw_markdown">("document");
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(0.95);
  const [isCopied, setIsCopied] = useState(false);

  // Master Same Day / Next Day generation checker
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0]; // e.g. "2026-07-17"
    const savedDate = localStorage.getItem("jd_master_date");
    const savedClient = localStorage.getItem("jd_master_client");
    const savedVendor = localStorage.getItem("jd_master_vendor");

    if (savedDate === todayStr && savedClient && savedVendor) {
      setTargetClient(savedClient);
      setVendorName(savedVendor);
      setIsSameDay(true);
    } else {
      // It's a new day! Pick a random client and vendor to ensure zero overlap with previous day
      let newClient = REALISTIC_CLIENTS[Math.floor(Math.random() * REALISTIC_CLIENTS.length)];
      let newVendor = REALISTIC_VENDORS[Math.floor(Math.random() * REALISTIC_VENDORS.length)];

      if (savedClient && REALISTIC_CLIENTS.length > 1) {
        while (newClient === savedClient) {
          newClient = REALISTIC_CLIENTS[Math.floor(Math.random() * REALISTIC_CLIENTS.length)];
        }
      }
      if (savedVendor && REALISTIC_VENDORS.length > 1) {
        while (newVendor === savedVendor) {
          newVendor = REALISTIC_VENDORS[Math.floor(Math.random() * REALISTIC_VENDORS.length)];
        }
      }

      setTargetClient(newClient);
      setVendorName(newVendor);
      localStorage.setItem("jd_master_date", todayStr);
      localStorage.setItem("jd_master_client", newClient);
      localStorage.setItem("jd_master_vendor", newVendor);
      setIsSameDay(false);
    }
  }, []);

  // Update localStorage whenever manual change happens
  const handleClientVendorChange = (client: string, vendor: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    setTargetClient(client);
    setVendorName(vendor);
    localStorage.setItem("jd_master_date", todayStr);
    localStorage.setItem("jd_master_client", client);
    localStorage.setItem("jd_master_vendor", vendor);
    setIsSameDay(true);
  };

  // Instantly roll a new unique combination of Client and Vendor
  const handleRefreshClientVendor = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    
    let newClient = REALISTIC_CLIENTS[Math.floor(Math.random() * REALISTIC_CLIENTS.length)];
    let newVendor = REALISTIC_VENDORS[Math.floor(Math.random() * REALISTIC_VENDORS.length)];

    if (targetClient && REALISTIC_CLIENTS.length > 1) {
      while (newClient === targetClient) {
        newClient = REALISTIC_CLIENTS[Math.floor(Math.random() * REALISTIC_CLIENTS.length)];
      }
    }
    if (vendorName && REALISTIC_VENDORS.length > 1) {
      while (newVendor === vendorName) {
        newVendor = REALISTIC_VENDORS[Math.floor(Math.random() * REALISTIC_VENDORS.length)];
      }
    }

    setTargetClient(newClient);
    setVendorName(newVendor);
    localStorage.setItem("jd_master_date", todayStr);
    localStorage.setItem("jd_master_client", newClient);
    localStorage.setItem("jd_master_vendor", newVendor);
    setIsSameDay(true);
  };

  // Auto-load profile defaults when user clicks a preset pill
  const handleApplyPreset = (preset: SpecializedPreset) => {
    setSelectedProfile(preset.profileId);
    setCandidateName(preset.name);
    setTargetRole(preset.role);
    setDomain(preset.domain);
    setLocation(preset.location);
    setDuration(preset.duration);
    setPayRate(preset.payRate);
    
    // Check if we should override Same-Day credentials or preserve them
    // Preserving Same-Day vendor/client provides better consistency unless they explicitly change them.
    const savedClient = localStorage.getItem("jd_master_client");
    const savedVendor = localStorage.getItem("jd_master_vendor");
    if (savedClient && savedVendor) {
      setTargetClient(savedClient);
      setVendorName(savedVendor);
    } else {
      setTargetClient(preset.client);
      setVendorName(preset.vendor);
    }
  };

  const handleClearPreset = () => {
    setSelectedProfile("none");
    setCandidateName("Mihir");
    setTargetRole("Data Scientist");
    setDomain("Manufacturing");
    setLocation("Milwaukee, WI (Hybrid)");
    setDuration("12+ Months Contract");
    setPayRate("$42/hr - $55/hr");
    
    const savedClient = localStorage.getItem("jd_master_client") || "Brady Corporation";
    const savedVendor = localStorage.getItem("jd_master_vendor") || "Brooksource";
    setTargetClient(savedClient);
    setVendorName(savedVendor);
  };

  // Trigger AI Job Description Generation
  const handleGenerateAIJd = async () => {
    setIsGenerating(true);
    setApiError(null);
    setActiveJdText("");
    setModelUsed(null);

    const config = {
      candidateName,
      targetRole,
      targetClient,
      vendorName,
      location,
      duration,
      payRate,
      domain,
      specializationProfile: selectedProfile === "none" ? undefined : selectedProfile
    };

    try {
      const response = await fetch("/api/generate-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          resume: resumeText, 
          config, 
          preferredModel 
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body reader available.");

      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") continue;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.model) {
                setModelUsed(parsed.model);
              }
              if (parsed.text) {
                setActiveJdText(prev => prev + parsed.text);
              }
            } catch (err) {
              console.warn("Failed to parse chunk:", err, dataStr);
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Failed to generate AI Job Description. Please verify settings.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Option A Manual Beautification & Formatting Engine
  const handleBeautifyManualJd = () => {
    if (!rawPasteJd) {
      setApiError("Please enter some Job Description text to format.");
      return;
    }
    setApiError(null);
    setIsGenerating(true);

    setTimeout(() => {
      // Structure pasted text into the required clean recruiter layout
      const cleanRole = beautifyRole || "Specified Role";
      const cleanClient = beautifyClient || "Confidential End Client";
      const cleanVendor = beautifyVendor || "Selected Prime Vendor";
      const cleanLocation = beautifyLocation || "Milwaukee, WI (Hybrid)";
      const cleanDuration = beautifyDuration || "12+ Months Contract";
      const cleanPayRate = beautifyPayRate || "$45/hr - $60/hr";

      // Simple formatting logic
      let jobSummary = "We are seeking a high-caliber professional to support enterprise-grade technological operations, solving complex business problems and delivering production-ready technical architectures.";
      let requirementsList: string[] = [];
      let responsibilitiesList: string[] = [];
      let niceToHaveList: string[] = [];

      // Extract sections if they exist in raw paste
      const paragraphs = rawPasteJd.split("\n");
      let currentSection: "summary" | "reqs" | "resps" | "nice" | "none" = "summary";

      paragraphs.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        const lower = trimmed.toLowerCase();
        if (lower.includes("summary") || lower.includes("about the role") || lower.includes("overview")) {
          currentSection = "summary";
        } else if (lower.includes("requirement") || lower.includes("qualifications") || lower.includes("what you bring") || lower.includes("skills")) {
          currentSection = "reqs";
        } else if (lower.includes("responsibility") || lower.includes("what you will do") || lower.includes("duties") || lower.includes("role descriptions")) {
          currentSection = "resps";
        } else if (lower.includes("nice to have") || lower.includes("prefer") || lower.includes("certifications") || lower.includes("plus")) {
          currentSection = "nice";
        } else {
          // Clean list prefixes
          const bulletLine = trimmed.replace(/^[\s•\-\*\d\.\)]+/, "").trim();
          if (bulletLine) {
            if (currentSection === "summary") {
              jobSummary = bulletLine;
              currentSection = "none";
            } else if (currentSection === "reqs") {
              requirementsList.push(bulletLine);
            } else if (currentSection === "resps") {
              responsibilitiesList.push(bulletLine);
            } else if (currentSection === "nice") {
              niceToHaveList.push(bulletLine);
            } else {
              // Add to requirements as default fallback
              requirementsList.push(bulletLine);
            }
          }
        }
      });

      // Handle fallback values if extraction yield was empty
      if (requirementsList.length === 0) {
        requirementsList = [
          "3+ years of professional engineering or domain experience in the specified tech stack",
          "Proficiency in cloud architecture, SQL, modern programming frameworks, and enterprise services",
          "Strong communication and operational problem-solving abilities partnering with corporate stakeholders"
        ];
      }
      if (responsibilitiesList.length === 0) {
        responsibilitiesList = [
          "Deploy high-availability production solutions adhering to enterprise performance and governance baselines",
          "Collaborate with development squads and product owners to turn business priorities into software blueprints",
          "Ensure code quality, robust system telemetry, and pipeline automations across environments"
        ];
      }
      if (niceToHaveList.length === 0) {
        niceToHaveList = [
          "Relevant professional cloud or architecture credentials (e.g. AWS, Azure, GCP)",
          "Prior exposure to high-load distributed systems or financial compliance domains"
        ];
      }

      const formattedJd = `Hello ${candidateName || "XYZ"},

Hope this email finds you well!

Kindly go through the job description and let me know if you are interested.


**Role:** ${cleanRole}
**Location:** ${cleanLocation}
**Duration:** ${cleanDuration}
**Prime Vendor:** **${cleanVendor}**
**End Client:** **${cleanClient}**
**Pay Rate:** ${cleanPayRate}


### **Job Summary:**

${jobSummary}

### **Requirements:**

${requirementsList.map(r => `* ${r}`).join("\n")}

### **Nice to Have:**

${niceToHaveList.map(n => `* ${n}`).join("\n")}

### **Responsibilities:**

${responsibilitiesList.map(r => `* ${r}`).join("\n")}
`;

      setActiveJdText(formattedJd);
      setIsGenerating(false);
    }, 600);
  };

  // Copy output text to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(activeJdText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Download plain text file
  const handleDownloadText = () => {
    const element = document.createElement("a");
    const file = new Blob([activeJdText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${(targetRole || beautifyRole || "recruiter_jd").toLowerCase().replace(/[^a-z0-9]/g, "_")}_jd.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Convert markdown-structured recruiter JD text into beautifully styled elements
  const parseJdMarkdownToHtml = (rawText: string, isPrint = false) => {
    if (!rawText) return "";
    
    const lines = rawText.replace(/\r\n/g, "\n").split("\n");
    const processedLines: string[] = [];
    
    let inMetadataBlock = false;
    let metadataItems: string[] = [];
    let inList = false;
    
    const flushList = () => {
      if (inList) {
        processedLines.push("</ul>");
        inList = false;
      }
    };
    
    const flushMetadata = () => {
      if (metadataItems.length > 0) {
        processedLines.push(
          `<div class="${isPrint ? "bg-slate-50 border border-slate-200 rounded-xl p-4 my-4" : "bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 my-3.5"} font-sans text-[11px] grid grid-cols-2 gap-x-4 gap-y-1 text-slate-800 list-none no-list-style">
            ${metadataItems.join("\n")}
          </div>`
        );
        metadataItems = [];
        inMetadataBlock = false;
      }
    };

    for (let line of lines) {
      let trimmed = line.trim();
      
      // Clean up markdown bold markers
      let lineWithBold = trimmed.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      
      // Detect if it is a metadata item
      const isMetadataLine = /^(<strong>)?(Role|Location|Duration|Prime Vendor|End Client|Pay Rate)(:<\/strong>|:)/gi.test(lineWithBold);
      
      if (isMetadataLine) {
        flushList();
        inMetadataBlock = true;
        metadataItems.push(`<div class="py-0.5">${lineWithBold}</div>`);
        continue;
      } else {
        if (trimmed === "" || /^###/gi.test(trimmed) || /^[\*\•\-]\s+/gi.test(trimmed)) {
          flushMetadata();
        }
      }
      
      // Heading items
      if (/^###/gi.test(trimmed)) {
        flushList();
        flushMetadata();
        let headerText = trimmed.replace(/^###\s*/, "").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/[:\s]+$/, "");
        processedLines.push(
          `<h3 class="${isPrint ? "text-sm text-slate-900 mt-6 mb-2 border-b border-slate-200 pb-1" : "text-xs text-slate-950 mt-5 mb-2 border-b border-slate-100 pb-0.5"} font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
            ${isPrint ? "" : '<span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span>'}
            ${headerText}:
          </h3>`
        );
        continue;
      }
      
      // List items
      if (/^[\*\•\-]\s+/gi.test(trimmed)) {
        flushMetadata();
        if (!inList) {
          processedLines.push(`<ul class="list-disc pl-5 space-y-1 ${isPrint ? "my-3" : "my-2"}">`);
          inList = true;
        }
        let bulletContent = lineWithBold.replace(/^[\*\•\-]\s+/, "");
        processedLines.push(`<li class="text-[11px] ${isPrint ? "text-slate-800" : "text-slate-700"} leading-relaxed font-sans">${bulletContent}</li>`);
        continue;
      }
      
      // Blank lines and paragraphs
      if (trimmed === "") {
        flushList();
        flushMetadata();
        processedLines.push(`<div class="${isPrint ? "h-3" : "h-2"}"></div>`);
      } else {
        flushMetadata();
        flushList();
        processedLines.push(`<p class="text-[11px] ${isPrint ? "text-slate-800" : "text-slate-700"} leading-relaxed font-sans mb-1.5">${lineWithBold}</p>`);
      }
    }
    
    flushList();
    flushMetadata();
    
    return processedLines.join("\n");
  };

  // Professional PDF Printing Module
  const handlePrintJd = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const structuredBody = parseJdMarkdownToHtml(activeJdText, true);

    printWindow.document.write(`
      <html>
        <head>
          <title>Recruiter Job Description - ${targetRole || beautifyRole || "Requirement"}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
            body {
              background-color: white !important;
              color: #0f172a !important;
              margin: 0;
              padding: 0.5in;
              font-family: "Inter", sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @page {
              size: letter;
              margin: 0.5in;
            }
            .border-b { border-bottom: 1px solid #e2e8f0; }
            .bg-slate-50 { background-color: #f8fafc; }
            .border-slate-200 { border: 1px solid #e2e8f0; }
            .rounded-xl { border-radius: 0.75rem; }
            .p-4 { padding: 1rem; }
            .my-4 { margin-top: 1rem; margin-bottom: 1rem; }
            .mt-6 { margin-top: 1.5rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .pb-1 { padding-bottom: 0.25rem; }
            .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .gap-x-4 { column-gap: 1rem; }
            .gap-y-2 { row-gap: 0.5rem; }
            .text-xs { font-size: 0.75rem; }
            .text-sm { font-size: 0.875rem; }
            .text-slate-800 { color: #1e293b; }
            .text-slate-700 { color: #334155; }
            .text-slate-500 { color: #64748b; }
            .text-slate-900 { color: #0f172a; }
            .uppercase { text-transform: uppercase; }
            .tracking-wider { tracking-spacing: 0.05em; }
            .list-disc { list-style-type: disc; }
            .ml-4 { margin-left: 1rem; }
            .leading-relaxed { line-height: 1.625; }
            .font-mono { font-family: "JetBrains Mono", monospace; }
          </style>
        </head>
        <body>
          <div style="width: 100%; max-width: 7.5in; margin: 0 auto;">
            ${structuredBody}
          </div>
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                setTimeout(() => window.close(), 500);
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Convert raw preview text into beautiful styled preview elements for the UI
  const renderPreviewToHtml = () => {
    if (!activeJdText) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-300 rounded-lg text-slate-400 font-sans">
          <FileText size={48} className="text-slate-300 mb-4 animate-bounce" />
          <p className="font-bold text-sm text-slate-600">No Job Description Compiled</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {activeTab === "ai_generator" 
              ? "Select candidate presets on the left and click 'Generate Recruiter JD' to compile enterprise specs!" 
              : "Paste a raw Job Description and click 'Beautify & Format' to build a recruiter submission sheet."}
          </p>
        </div>
      );
    }

    const parsedBody = parseJdMarkdownToHtml(activeJdText, false);

    return <div dangerouslySetInnerHTML={{ __html: parsedBody }} />;
  };

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 bg-slate-950/20 text-white divide-x divide-white/5">
      
      {/* LEFT COLUMN: CONTROL PANEL */}
      <section className="lg:col-span-5 flex flex-col overflow-y-auto max-h-[calc(100vh-8rem)] p-5 space-y-5 no-print">
        
        {/* Module Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Briefcase size={16} className="text-orange-400 animate-pulse" />
              <span>Job Description Studio</span>
            </h2>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5 leading-relaxed">
              Generate rejection-safe specifications or format legacy requirements into elite corporate layouts.
            </p>
          </div>
          <span className="text-[9px] font-mono bg-white/5 px-2 py-0.5 border border-white/10 rounded text-slate-400">JD PORTAL</span>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => { setActiveTab("ai_generator"); setApiError(null); }}
            className={`py-2 text-[11px] font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "ai_generator" 
                ? "bg-slate-900 text-orange-400 border border-orange-500/30" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles size={13} />
            <span>Option B: AI JD Creator</span>
          </button>
          <button
            onClick={() => { setActiveTab("beautifier"); setApiError(null); }}
            className={`py-2 text-[11px] font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "beautifier" 
                ? "bg-slate-900 text-orange-400 border border-orange-500/30" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Compass size={13} />
            <span>Option A: JD Beautifier</span>
          </button>
        </div>

        {/* Dynamic Inner Control Panel */}
        {activeTab === "ai_generator" ? (
          <div className="space-y-4">
            
            {/* Candidate Specialization Presets Section */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Cpu size={11} className="text-orange-400" />
                <span>Target Candidate Profile Preset</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SPECIAL_PRESETS.map((p) => (
                  <button
                    key={p.profileId}
                    onClick={() => handleApplyPreset(p)}
                    className={`p-2.5 text-left rounded-xl transition-all border flex flex-col justify-between h-20 text-white cursor-pointer ${
                      selectedProfile === p.profileId 
                        ? "bg-orange-500/15 border-orange-500 shadow-[0_0_12px_rgba(242,125,38,0.15)]" 
                        : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-sans font-black text-xs text-orange-300 flex items-center gap-1">
                        <User size={10} />
                        {p.name}
                      </span>
                      {selectedProfile === p.profileId && <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />}
                    </div>
                    <span className="text-[9px] text-slate-400 leading-normal line-clamp-2 font-mono mt-1">
                      {p.role} @ {p.client}
                    </span>
                  </button>
                ))}
              </div>
              
              {selectedProfile !== "none" && (
                <div className="mt-2 flex justify-between items-center bg-orange-500/5 border border-orange-500/10 rounded-lg p-2 text-[10px] text-orange-300 font-mono">
                  <span>Special Rules active for {selectedProfile.toUpperCase()} candidate.</span>
                  <button onClick={handleClearPreset} className="font-bold underline hover:text-white cursor-pointer uppercase text-[9px]">Clear Rules</button>
                </div>
              )}
            </div>

            {/* Main Interactive Entry Block */}
            <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
              <div>
                <label className="block text-[10px] font-mono text-orange-400 uppercase tracking-wider mb-1">
                  🎯 Target Role Name
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. AI Platform Engineer, Full Stack Developer, Data Scientist"
                  className="w-full px-3 py-2 rounded-lg text-xs font-sans text-white bg-slate-950 border border-white/10 focus:outline-none focus:border-orange-500 font-bold transition-all placeholder:text-slate-600"
                />
              </div>

              {/* Master Ruleset Real-Time Status Badge */}
              <div className="bg-slate-950/80 border border-white/5 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    📅 MASTER RULE ACTIVE: {isSameDay ? "SAME DAY LOCK" : "NEXT DAY REFRESH"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRefreshClientVendor}
                      className="text-[9px] font-mono text-orange-400 hover:text-orange-300 flex items-center gap-1 bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded border border-white/10 transition-all cursor-pointer hover:border-orange-500/30"
                      title="Roll a new random client & vendor combination"
                    >
                      <RefreshCw size={9} className="animate-spin-slow text-orange-400" />
                      Roll Combo
                    </button>
                    <span className="text-[8px] font-mono text-slate-500">
                      {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="bg-white/[2%] px-2 py-1 rounded border border-white/5">
                    <span className="text-[8px] text-slate-500 uppercase block">Prime Vendor</span>
                    <span className="font-bold text-orange-300 truncate block">{vendorName || "BROOKSOURCE"}</span>
                  </div>
                  <div className="bg-white/[2%] px-2 py-1 rounded border border-white/5">
                    <span className="text-[8px] text-slate-500 uppercase block">End Client</span>
                    <span className="font-bold text-orange-300 truncate block">{targetClient || "BRADY CORPORATION"}</span>
                  </div>
                </div>

                <p className="text-[9px] text-slate-400 leading-normal font-sans italic mt-1">
                  * Fulfilling same-day ruleset: The vendor and client are locked for consistency unless changed.
                </p>
              </div>

              {/* Collapsible Advanced Parameters Panel Toggle */}
              <button
                type="button"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="w-full py-1 px-2 border border-white/5 rounded-lg text-left text-[10px] text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-between font-mono cursor-pointer"
              >
                <span>🔧 {isAdvancedOpen ? "Hide" : "Show"} Manual Override Specs (Client, Vendor, Pay, Location)</span>
                <ChevronRight size={12} className={`transition-all transform ${isAdvancedOpen ? "rotate-90" : ""}`} />
              </button>

              {/* Collapsible Inner Form Fields */}
              {isAdvancedOpen && (
                <div className="space-y-3 pt-2 border-t border-white/5 animate-fade-in">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] font-mono text-slate-500 uppercase mb-0.5">Candidate Name</label>
                      <input
                        type="text"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        placeholder="e.g. Mihir"
                        className="w-full glass-input px-2.5 py-1 rounded bg-slate-900 text-[11px] font-sans text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono text-slate-500 uppercase mb-0.5">Business Domain</label>
                      <select
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="w-full glass-input px-2.5 py-1 rounded bg-slate-900 text-[11px] font-sans text-white focus:outline-none h-[24px] appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.6)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.4rem center', backgroundSize: '0.7rem', backgroundRepeat: 'no-repeat' }}
                      >
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Banking">Banking</option>
                        <option value="Retail">Retail</option>
                        <option value="Telecom">Telecom</option>
                        <option value="General">General/Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] font-mono text-slate-500 uppercase mb-0.5">Manual Prime Vendor</label>
                      <input
                        type="text"
                        value={vendorName}
                        onChange={(e) => handleClientVendorChange(targetClient, e.target.value)}
                        placeholder="e.g. Brooksource"
                        className="w-full glass-input px-2.5 py-1 rounded bg-slate-900 text-[11px] font-sans text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono text-slate-500 uppercase mb-0.5">Manual End Client</label>
                      <input
                        type="text"
                        value={targetClient}
                        onChange={(e) => handleClientVendorChange(e.target.value, vendorName)}
                        placeholder="e.g. Brady Corporation"
                        className="w-full glass-input px-2.5 py-1 rounded bg-slate-900 text-[11px] font-sans text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] font-mono text-slate-500 uppercase mb-0.5">Location Format</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Milwaukee, WI (Hybrid)"
                        className="w-full glass-input px-2.5 py-1 rounded bg-slate-900 text-[11px] font-sans text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono text-slate-500 uppercase mb-0.5">Pay Rate Range</label>
                      <input
                        type="text"
                        value={payRate}
                        onChange={(e) => setPayRate(e.target.value)}
                        placeholder="e.g. $42/hr - $55/hr"
                        className="w-full glass-input px-2.5 py-1 rounded bg-slate-900 text-[11px] font-sans text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] font-mono text-slate-500 uppercase mb-0.5">Duration</label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 12+ Months Contract"
                      className="w-full glass-input px-2.5 py-1 rounded bg-slate-900 text-[11px] font-sans text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Error alerts */}
            {apiError && (
              <div className="bg-rose-500/15 border-2 border-rose-500/30 rounded-xl p-3.5 space-y-1.5 text-rose-300 font-sans text-xs">
                <div className="flex items-center gap-1.5 font-bold font-mono text-rose-400">
                  <AlertTriangle size={14} />
                  <span>COMPILATION ERROR</span>
                </div>
                <p>{apiError}</p>
              </div>
            )}

            {/* Trigger Button */}
            <button
              onClick={handleGenerateAIJd}
              disabled={isGenerating || !resumeText}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-mono font-bold text-xs uppercase rounded-xl tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Generating Rejection-Safe Specs...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Generate AI Job Description</span>
                </>
              )}
            </button>

            {!resumeText && (
              <p className="text-[9px] text-center text-amber-300/80 font-mono italic">
                * Note: Paste or upload a Candidate Resume on the left Candidate Intake panel to align AI generator to their profile.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Raw legacy JD Paste Box */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-2">Paste Raw Legacy Job Description</label>
              <textarea
                value={rawPasteJd}
                onChange={(e) => setRawPasteJd(e.target.value)}
                placeholder="Paste raw email, text, or requirements list here to beautify and structure..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs h-40 font-mono text-slate-300 focus:outline-none focus:border-orange-500 resize-none leading-relaxed"
              />
            </div>

            {/* Manual formatting metadata override */}
            <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
              <h3 className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase border-b border-white/5 pb-2">Metadata Custom Overrides</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Target Role Name</label>
                  <input
                    type="text"
                    value={beautifyRole}
                    onChange={(e) => setBeautifyRole(e.target.value)}
                    placeholder="e.g. Data Scientist"
                    className="w-full glass-input px-3 py-1.5 rounded-lg text-xs font-sans text-white bg-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Candidate Name</label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="e.g. Mihir"
                    className="w-full glass-input px-3 py-1.5 rounded-lg text-xs font-sans text-white bg-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">End Client</label>
                  <input
                    type="text"
                    value={beautifyClient}
                    onChange={(e) => setBeautifyClient(e.target.value)}
                    placeholder="e.g. Brady Corporation"
                    className="w-full glass-input px-3 py-1.5 rounded-lg text-xs font-sans text-white bg-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Staffing Vendor</label>
                  <input
                    type="text"
                    value={beautifyVendor}
                    onChange={(e) => setBeautifyVendor(e.target.value)}
                    placeholder="e.g. Brooksource"
                    className="w-full glass-input px-3 py-1.5 rounded-lg text-xs font-sans text-white bg-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Location & Mode</label>
                  <input
                    type="text"
                    value={beautifyLocation}
                    onChange={(e) => setBeautifyLocation(e.target.value)}
                    placeholder="e.g. Milwaukee, WI (Hybrid)"
                    className="w-full glass-input px-3 py-1.5 rounded-lg text-xs font-sans text-white bg-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Hourly Pay Rate</label>
                  <input
                    type="text"
                    value={beautifyPayRate}
                    onChange={(e) => setBeautifyPayRate(e.target.value)}
                    placeholder="e.g. $42/hr - $55/hr"
                    className="w-full glass-input px-3 py-1.5 rounded-lg text-xs font-sans text-white bg-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Duration</label>
                <input
                  type="text"
                  value={beautifyDuration}
                  onChange={(e) => setBeautifyDuration(e.target.value)}
                  placeholder="e.g. 12+ Months Contract"
                  className="w-full glass-input px-3 py-1.5 rounded-lg text-xs font-sans text-white bg-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {apiError && (
              <div className="bg-rose-500/15 border border-rose-500/30 rounded-xl p-3 text-rose-300 font-mono text-xs">
                {apiError}
              </div>
            )}

            <button
              onClick={handleBeautifyManualJd}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-mono font-bold text-xs uppercase rounded-xl tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <FileText size={14} />
              <span>Beautify & Format Legacy JD</span>
            </button>
          </div>
        )}

        {/* Live editing raw textarea */}
        {activeJdText && (
          <div className="space-y-2 border-t border-white/5 pt-4">
            <label className="block text-[10px] font-mono text-slate-400 uppercase">Live Plaintext Editor</label>
            <textarea
              value={activeJdText}
              onChange={(e) => setActiveJdText(e.target.value)}
              className="w-full bg-slate-900/60 border border-white/10 rounded-xl p-3 text-xs h-56 font-mono text-slate-300 focus:outline-none focus:border-orange-500 leading-relaxed"
            />
          </div>
        )}

      </section>

      {/* RIGHT COLUMN: LIVE PAPER PREVIEW CANVAS */}
      <section className="lg:col-span-7 flex flex-col bg-slate-950/40 overflow-y-auto max-h-[calc(100vh-8rem)] relative pb-10">
        
        {/* Preview Control Bar */}
        <div className="bg-slate-900/40 border-b border-white/10 px-5 py-3.5 sticky top-0 z-10 backdrop-blur-md flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wider font-bold">Interactive Recruiter Preview</span>
            {modelUsed && (
              <span className="text-[9px] font-mono bg-white/5 border border-white/10 text-slate-400 px-1.5 py-0.5 rounded uppercase">
                {modelUsed}
              </span>
            )}
          </div>

          {/* Segmented Mode Selector */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5 text-[9px] font-mono no-print">
            <button
              onClick={() => setPreviewMode("document")}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                previewMode === "document" 
                  ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold shadow" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📄 Rich Document
            </button>
            <button
              onClick={() => setPreviewMode("raw_markdown")}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                previewMode === "raw_markdown" 
                  ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold shadow" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📝 Copyable Markdown
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Zoom Controls */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
              <button 
                onClick={() => setZoomScale(prev => Math.max(0.6, prev - 0.05))}
                title="Zoom Out"
                className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white cursor-pointer"
              >
                <ZoomOut size={12} />
              </button>
              <span className="text-[9px] font-mono px-1.5 text-slate-400 select-none">
                {Math.round(zoomScale * 100)}%
              </span>
              <button 
                onClick={() => setZoomScale(prev => Math.min(1.4, prev + 0.05))}
                title="Zoom In"
                className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white cursor-pointer"
              >
                <ZoomIn size={12} />
              </button>
            </div>

            {/* Utility buttons */}
            {activeJdText && (
              <>
                <button
                  onClick={handleCopyToClipboard}
                  className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-mono font-bold hover:text-white transition flex items-center gap-1 cursor-pointer"
                >
                  {isCopied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{isCopied ? "Copied" : "Copy"}</span>
                </button>

                <button
                  onClick={handleDownloadText}
                  className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-mono font-bold hover:text-white transition flex items-center gap-1 cursor-pointer"
                >
                  <Download size={11} />
                  <span>Text</span>
                </button>

                <button
                  onClick={handlePrintJd}
                  className="px-2.5 py-1.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-mono font-black text-[10px] rounded-lg flex items-center gap-1 cursor-pointer shadow-md hover:from-orange-600 hover:to-pink-600 transition"
                >
                  <Printer size={11} />
                  <span>Print PDF</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Paper Container Area */}
        <div className="flex-1 p-6 flex justify-center items-start overflow-x-auto">
          <div
            style={{
              zoom: zoomScale,
              maxWidth: "8.5in",
              minHeight: "11in",
              padding: "0.5in"
            }}
            className="bg-white text-slate-950 shadow-2xl rounded-sm border border-slate-300 w-full mx-auto font-sans text-left transition-all relative pb-12"
          >
            {/* Visual email header replica (non-printed style for realism in app preview) */}
            <div className="border-b border-slate-200 pb-4 mb-6 no-print text-[11px] text-slate-500 font-sans leading-normal">
              <div className="flex py-1 border-b border-slate-100"><span className="w-16 font-semibold">From:</span> recruiter@enterprise-staffing.com</div>
              <div className="flex py-1 border-b border-slate-100"><span className="w-16 font-semibold">To:</span> {candidateName ? `${candidateName.toLowerCase()}@candidate-inbox.net` : "[candidate]@inbox.net"}</div>
              <div className="flex py-1"><span className="w-16 font-semibold">Subject:</span> Requirement Notification</div>
            </div>

            <div className="w-full text-slate-900 leading-relaxed">
              {previewMode === "document" ? (
                renderPreviewToHtml()
              ) : (
                <div className="relative">
                  <div className="absolute right-0 -top-12 no-print">
                    <button
                      onClick={handleCopyToClipboard}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-[10px] font-mono font-bold text-slate-700 hover:text-slate-900 transition flex items-center gap-1 cursor-pointer"
                    >
                      {isCopied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                      <span>{isCopied ? "Copied Raw!" : "Copy Raw Markdown"}</span>
                    </button>
                  </div>
                  <pre className="text-[10px] font-mono text-slate-800 bg-slate-50/50 p-4 rounded-xl border border-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {activeJdText}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
