export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  latex: string;
}

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: "default_alex_webb",
    name: "Alex Webb Classic (Default)",
    description: "The official user-provided roboto-style academic & professional template.",
    latex: `\\documentclass[letterpaper,10pt]{article}

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

\\begin{document}

\\begin{center}
  \\textbf{\\Huge Alex Webb} \\\\
  \\small 555-123-4567 $|$ \\href{mailto:alex@email.com}{alex@email.com} $|$ 
  \\href{https://linkedin.com/in/burhan-webb}{linkedin.com/in/alexwebbx} $|$
  \\href{https://github.com/zwayth}{github.com/alexwebbx}
\\end{center}

\\section*{Summary}
Passionate AI/ML engineer with a strong background in deep learning, computer vision, and natural language processing. Skilled in Python, TensorFlow, PyTorch, and various ML libraries. Excellent problem-solving, research, and collaboration abilities. Seeking a challenging role to develop cutting-edge AI solutions.

\\section{Technical Skills}
\\resumeSubHeadingList
  \\resumeItem{\\textbf{Programming Languages}: Python, C++, SQL, MATLAB}
  \\resumeItem{\\textbf{Deep Learning Frameworks}: TensorFlow, PyTorch, Keras, Caffe}
  \\resumeItem{\\textbf{Libraries \\& Tools}: NumPy, Pandas, Scikit-learn, OpenCV, NLTK, Git, Docker}
\\resumeSubHeadingListEnd

\\section{Projects}
\\resumeSubHeadingList
  \\resumeSubheading
      {Image Captioning System}{Jan 2023 -- Present}
      {Deep Learning Project}{Python, TensorFlow, OpenCV}
      \\resumeSubHeadingList
          \\resumeItem{\\textbullet\\ Developed an end-to-end system for generating descriptive captions for images}
          \\resumeItem{\\textbullet\\ Utilized CNN and LSTM models for image feature extraction and caption generation}
          \\resumeItem{\\textbullet\\ Achieved state-of-the-art performance on the COCO dataset}
      \\resumeSubHeadingListEnd
  \\resumeSubheading
      {Sentiment Analysis API}{Aug 2022 -- Dec 2022} 
      {Natural Language Processing}{Python, Flask, NLTK, Hugging Face}
      \\resumeSubHeadingList
          \\resumeItem{\\textbullet\\ Built a RESTful API for sentiment analysis of text data}
          \\resumeItem{\\textbullet\\ Implemented pre-trained transformer models using Hugging Face}
          \\resumeItem{\\textbullet\\ Deployed the API on a cloud platform for easy integration}
      \\resumeSubHeadingListEnd
\\resumeSubHeadingListEnd

\\section{Experience}
\\resumeSubHeadingList
  \\resumeSubheading
      {AI Research Intern}{June 2022 -- Aug 2022}
      {DeepMind}{London, UK}
      \\resumeSubHeadingList
          \\resumeItem{\\textbullet\\ Conducted research on reinforcement learning algorithms for robotics}
          \\resumeItem{\\textbullet\\ Implemented and evaluated deep RL models using PyTorch and RLlib}
          \\resumeItem{\\textbullet\\ Presented findings at weekly research meetings}
      \\resumeSubHeadingListEnd
  \\resumeSubheading
      {Machine Learning Engineer}{Jan 2021 -- May 2022}
      {Acme AI Solutions}{San Francisco, CA}
      \\resumeSubHeadingList
          \\resumeItem{\\textbullet\\ Developed and deployed machine learning models for various industries}
          \\resumeItem{\\textbullet\\ Optimized model performance and ensured data quality}
          \\resumeItem{\\textbullet\\ Collaborated with cross-functional teams to deliver AI solutions}
      \\resumeSubHeadingListEnd
\\resumeSubHeadingListEnd

\\section{Education}
\\resumeSubHeadingList
  \\resumeSubheading
      {Stanford University}{Stanford, CA}
      {M.S. in Computer Science, Artificial Intelligence}{Aug 2019 -- May 2021}
  \\resumeSubheading
      {University of California, Berkeley}{Berkeley, CA}
      {B.S. in Electrical Engineering and Computer Science}{Aug 2015 -- May 2019}
\\resumeSubHeadingListEnd

\\section{Certifications}
\\resumeSubHeadingList
  \\resumeItem{\\textbullet\\ AWS Certified Machine Learning - Specialty}
  \\resumeItem{\\textbullet\\ TensorFlow Developer Certificate}
\\resumeSubHeadingListEnd

\\end{document}`
  },
  {
    id: "modern_executive",
    name: "Modern Executive",
    description: "Sleek sans-serif style with elegant, thin section breaks and tight layout constraints.",
    latex: `\\documentclass[letterpaper,10pt]{article}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[sfdefault]{roboto}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.0in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\titleformat{\\section}{\\large\\bfseries\\scshape\\raggedright}{}{0em}{}[\\titlerule]

\\begin{document}

\\begin{center}
  \\textbf{\\Huge Professional Candidate} \\\\
  \\small 123-456-7890 $|$ \\href{mailto:candidate@email.com}{candidate@email.com} $|$ LinkedIn: /in/candidate
\\end{center}

\\section*{Summary}
Highly driven executive and team leader specializing in high-performance cloud architectures, rapid software engineering execution, and customer-first technical designs. Expert at aligning cross-functional teams to critical business milestones and engineering goals.

\\section{Technical Skills}
\\begin{itemize}[leftmargin=0.15in]
  \\item \\textbf{Languages}: Java, Python, TypeScript, Go, SQL, Bash
  \\item \\textbf{Infrastructure}: AWS, Google Cloud, Docker, Kubernetes, Terraform, CI/CD pipelines
\\end{itemize}

\\section{Professional Experience}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{Lead Software Engineer} & Jan 2022 -- Present \\\\
      \\textit{Innovate Solutions LLC} & Austin, TX \\\\
    \\end{tabular*}
    \\begin{itemize}
      \\item Lead architecture migration of monolithic microservices to scalable Serverless event-driven queues, improving system latency by 40\\%.
      \\item Oversee a delivery squad of 6 junior engineers to ship high-impact client features 2 weeks ahead of target schedules.
    \\end{itemize}
\\end{itemize}

\\section{Education}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{State University} & M.S. Computer Science \\\\
      \\textit{Graduated with Honors} & May 2021 \\\\
    \\end{tabular*}
\\end{itemize}

\\end{document}`
  },
  {
    id: "minimal_classic",
    name: "Minimal Classic",
    description: "Traditional serif styling, highly legible for academic, research, or standard corporate roles.",
    latex: `\\documentclass[letterpaper,10pt]{article}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[hidelinks]{hyperref}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.0in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\titleformat{\\section}{\\large\\bfseries\\raggedright}{}{0em}{}[\\titlerule]

\\begin{document}

\\begin{center}
  \\textbf{\\Huge Academic Scholar} \\\\
  \\small candidate@university.edu $|$ 555-987-6543 $|$ Berkeley, CA
\\end{center}

\\section{Research Summary}
Experienced researcher focusing on decentralized databases, secure consensus protocols, and cryptographic systems. Proven academic record of publishing peer-reviewed workshop contributions.

\\section{Areas of Expertise}
\\begin{itemize}[leftmargin=0.15in]
  \\item \\textbf{Technical}: Distributed Systems, Cryptography, Blockchain, Go, Rust, C++
\\end{itemize}

\\section{Education}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{University of California, Berkeley} & Berkeley, CA \\\\
      \\textit{Ph.D. in Computer Science} & Sep 2020 -- Present \\\\
    \\end{tabular*}
\\end{itemize}

\\end{document}`
  }
];

export const DEFAULT_COVER_LETTER_TEMPLATE = `\\documentclass[letterpaper,10pt]{article}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[sfdefault]{roboto}
\\usepackage[hidelinks]{hyperref}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.0in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\begin{document}

\\begin{center}
  \\textbf{\\Huge Alex Webb} \\\\
  \\small alex@email.com $|$ 555-123-4567 $|$ github.com/alexwebbx
\\end{center}

\\vspace{12pt}

\\today

\\vspace{10pt}

Dear Hiring Manager,

I am writing to express my strong interest in the target role at your organization. With my extensive background in computer science, machine learning algorithms, and software scaling, I am confident in my ability to immediately add value to your engineering team.

My technical experience aligns perfectly with your goals. During my internship at DeepMind, I designed reinforcement learning agents that dramatically reduced pathing latency. Furthermore, as a Machine Learning Engineer at Acme AI Solutions, I engineered automated modeling pipelines that optimized accuracy for enterprise-scale systems.

I would love the opportunity to speak with your team about how my expertise can support your upcoming product milestones. Thank you for your time and consideration.

\\vspace{12pt}

Sincerely,

\\vspace{24pt}

Alex Webb
`;

export const DEFAULT_PITCH_TEMPLATE = `\\documentclass[letterpaper,10pt]{article}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[sfdefault]{roboto}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.0in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\begin{document}

\\section*{The 60-Second Elevator Pitch}
Hi, I'm Alex Webb. I'm an AI/ML Engineer with a passion for designing production-ready deep learning models and scalable NLP systems. Having trained neural architectures at DeepMind and optimized enterprise algorithms at Acme AI, I bridge the gap between rigorous machine learning research and robust software engineering. I'm excited to apply these skills to solve complex challenges for your team!

\\section*{Behavioral Story 1: Outage Recovery}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\item \\textbf{Story 1: Database Saturation Resolution}
  \\item \\textbf{Situation:} A major production analytics service became unresponsive due to heavy query locks.
  \\item \\textbf{Task:} Restore live analytics updates within our target 15-minute SLA.
  \\item \\textbf{Action:} Pinpointed query bottlenecks, refactored raw joins to use cached materialized views, and implemented transient connection retries.
  \\item \\textbf{Result:} Restored responsiveness within 11 minutes, reducing database load by 60\\% and maintaining continuous service.
\\end{itemize}

\\end{document}`;
