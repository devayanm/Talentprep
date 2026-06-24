# 📋 Interview Preparation Kit Generator

An intelligent, full-stack web application designed for candidates, recruiters, and vendor partners to automatically generate targeted, high-fidelity interview preparation kits. By extracting data from resumes and matching them with specific job descriptions, the app uses AI to create tailored technical modules, difficulty distributions, and scenario-based interview question banks.

---

### 🌐 Live Published Links
* **Live Web App / Preview Link:** [https://ais-pre-zp65vfhvsyith6i5esu3ch-405531852596.us-west1.run.app](https://ais-pre-zp65vfhvsyith6i5esu3ch-405531852596.us-west1.run.app)
* **Development / Test Link:** [https://ais-dev-zp65vfhvsyith6i5esu3ch-405531852596.us-west1.run.app](https://ais-dev-zp65vfhvsyith6i5esu3ch-405531852596.us-west1.run.app)

---

## ✨ Features

- **📂 Multi-Format File Upload Support:** Skip copy-pasting entirely. Easily upload candidate Resumes and Job Descriptions directly as **PDF**, **DOCX**, or **TXT** files.
- **🧠 Intelligent Text Extraction:** Uses Gemini-based inline PDF content analysis and high-performance server-side DOCX (Mammoth) parsing to pull clean text.
- **⚙️ Custom Difficulty Weights:** Dynamically adjust the ratio of Basic, Intermediate, and Advanced questions (e.g., 20% / 50% / 30%) to align with the candidate's experience level.
- **📝 Real-time Progress Tracking & Notes:** Mark questions as completed, track overall preparation stats, and add customized responses or study notes directly underneath questions.
- **🖨️ Professional Print Layouts:** Built-in CSS print stylesheets render a pristine, high-density, beautifully aligned presentation dossier perfect for direct physical printing or saving as a PDF (`Ctrl + P`).
- **📥 Offline Portability:** Export your generated question banks as Markdown documents or high-fidelity HTML templates.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, and Framer Motion.
- **Backend:** Node.js, Express, and Mammoth (DOCX parser).
- **AI Core:** Google Gemini (`gemini-3.5-flash`) via the official `@google/genai` SDK.
- **Architecture:** Full-stack proxy setup (Vite middleware for development, optimized static CJS bundles for deployment).

---

## 🚀 Local Installation & Setup

Follow these simple steps to run this project on your local machine:

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) and **npm** installed.

### 2. Clone/Download the Codebase
Download this project as a ZIP or clone the repository to your local directory.

### 3. Install Dependencies
Navigate to the root directory and run:
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root of your project and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 5. Start Development Server
Run the following command to boot both the Express server and Vite frontend:
```bash
npm run dev
```
Open your browser to [http://localhost:3000](http://localhost:3000) to see the app running!

---
