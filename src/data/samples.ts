export interface SamplePreset {
  name: string;
  role: string;
  client: string;
  vendor: string;
  domain: 'Healthcare' | 'Banking' | 'Retail' | 'Telecom' | 'Manufacturing' | 'General';
  candidateName: string;
  resume: string;
  jobDescription: string;
}

export const SAMPLES: SamplePreset[] = [
  {
    name: "Healthcare Analytics Specialist",
    role: "Senior Healthcare Data Analyst",
    client: "UnitedHealth Group / Optum",
    vendor: "Tek Inspirations",
    domain: "Healthcare",
    candidateName: "Sarah Jenkins, MPH",
    resume: `SARAH JENKINS, MPH
Senior Healthcare Data Analyst | HEDIS & Risk Adjustment Specialist
Email: sarah.jenkins@example.com | Phone: (555) 019-2834 | Boston, MA

PROFESSIONAL SUMMARY
Highly analytical Healthcare Data Analyst with over 8 years of experience designing and optimizing clinical data pipelines, HEDIS reporting workflows, and Medicare Advantage Risk Adjustment (HCC/RAF) models. Expert in SQL Server, SSIS, and Power BI, translating complex claims, clinical, and encounter data into actionable executive insights.

TECHNICAL SKILLS
- Databases & ETL: SQL Server (2016-2022), SSIS, T-SQL (Window Functions, CTEs, Index Optimization, Execution Plans, Stored Procedures, Partitioning), CDC, SCD Types 1 & 2.
- Data Visualization & Reporting: Power BI (DAX, RLS, Incremental Refresh, Semantic Models, Power Query), SSRS.
- Healthcare Domains: HEDIS, CMS Star Ratings, Risk Adjustment (HCC, RAF score calculations), Claims Processing (837/835), Clinical Data (HL7, FHIR), EDPS/RAPS.
- Methodologies & Frameworks: HIPAA compliance, Agile/Scrum, Data Governance.

PROFESSIONAL EXPERIENCE
Senior Healthcare Data Analyst | Blue Cross Blue Shield of Massachusetts | 2021 – Present
- Lead HEDIS and Medicare Advantage Risk Adjustment reporting, improving overall Star Rating from 3.5 to 4.5 stars over 2 years by identifying clinical gap-closure opportunities.
- Architected and optimized a T-SQL engine processing over 150 million healthcare records (claims, pharmacy, encounters), reducing ETL processing time from 9 hours to 18 minutes using partition switching, custom index tuning, and recursive CTE query rewrites.
- Developed executive-level Power BI dashboards with complex DAX measures and row-level security (RLS) for 15+ regional provider groups, enabling real-time performance tracking of HEDIS measures.

Healthcare Data Analyst | Tufts Health Plan | 2018 – 2021
- Managed data reconciliation pipelines between internal Claims systems and CMS EDPS/RAPS submissions, ensuring 99.8% reconciliation accuracy.
- Built an automated SSIS-based ETL system utilizing Change Data Capture (CDC) to ingest and process HL7 lab results, clinical feeds, and pharmacy records daily.
- Created predictive models for member risk scores (RAF) using SQL and Python (Pandas/NumPy), helping target high-risk members for wellness campaigns.

EDUCATION & CERTIFICATIONS
- Master of Public Health (MPH) in Health Informatics | Boston University
- Bachelor of Science in Health Sciences | Northeastern University
- Certified Health Data Analyst (CHDA) | AHIMA
- Microsoft Certified: Power BI Data Analyst Associate`,
    jobDescription: `Job Title: Senior Healthcare Data Analyst (HEDIS & Risk Adjustment)
Client: UnitedHealth Group / Optum
Location: Remote (US)
Contract Term: 12 Months

JOB DESCRIPTION
Optum is seeking a Senior Healthcare Data Analyst to join our Clinical Analytics team. This individual will be responsible for leading data analysis, reporting, and dashboard development to support our HEDIS reporting, Risk Adjustment (HCC/RAF) campaigns, and CMS Star Ratings initiatives. 

REPRESENTATIVE RESPONSIBILITIES
- Design, build, and maintain deep T-SQL queries, stored procedures, and ETL pipelines (using SSIS) to process massive datasets including Claims (medical/pharmacy), Member Enrollment, and Provider Data.
- Analyze encounter data and lead reconciliation efforts for CMS submissions (EDPS/RAPS) to identify gaps, anomalies, and submission failures.
- Design, develop, and publish high-performing Power BI dashboards and semantic models containing up to 200 million rows. Optimize DAX measures and maintain strict row-level security (RLS) based on provider contracts.
- Partner with clinical stakeholders, care managers, and product owners to translate complex clinical guidelines into technical specs for reporting.
- Ensure all data processes adhere strictly to HIPAA compliance and internal data governance standards.

REQUIRED SKILLS
- 5+ years of experience in Healthcare Analytics (HEDIS, Medicare Advantage, CMS Star Ratings, or Risk Adjustment).
- Expert-level SQL skills (T-SQL, advanced analytical functions, query tuning, index design, execution plan analysis).
- Advanced experience with Power BI development (DAX, Power Query, gateway administration, RLS, composite models, and incremental refresh).
- Solid experience with SSIS for data warehousing and data movement (CDC, SCD).
- Strong understanding of medical terminology, coding standards (ICD-10, CPT, HCPCS), and claim formats (837I/P).`
  },
  {
    name: "Fintech Core Java Developer",
    role: "Lead Java Spring Boot Developer",
    client: "JPMorgan Chase & Co.",
    vendor: "Randstad Technologies",
    domain: "Banking",
    candidateName: "David Chen",
    resume: `DAVID CHEN
Lead Java / Microservices Engineer
Email: david.chen@example.com | Phone: (555) 014-9988 | Jersey City, NJ

PROFESSIONAL SUMMARY
Highly skilled Lead Software Engineer with 10+ years of experience designing and implementing high-throughput, low-latency transaction processing systems and microservices in the Financial Services domain. Expert in Java (8-17), Spring Boot, Kafka, and relational databases. Proven success in optimizing system latency, cloud migration (AWS), and leading global development teams.

TECHNICAL SKILLS
- Programming: Java (11/17), Scala, SQL, Python.
- Frameworks & Tools: Spring Boot, Spring Cloud, Hibernate/JPA, JUnit, Mockito, Maven, Git.
- Middleware & Messaging: Apache Kafka (Kafka Connect, Kafka Streams, Schema Registry), RabbitMQ.
- Cloud & DevOps: AWS (EC2, RDS, EKS, Lambda, IAM), Docker, Kubernetes, Jenkins, Terraform.
- Databases: PostgreSQL, Oracle, Redis (Caching), Flyway.
- Domain Knowledge: Payment systems, AML/KYC screening, transaction settlement, concurrency & JVM optimization.

PROFESSIONAL EXPERIENCE
Lead Software Engineer | BNY Mellon | 2021 – Present
- Architected and implemented a real-time domestic payments routing engine using Java 17, Spring Boot, and Apache Kafka, handling peaks of 12,000 transactions per second (TPS) with sub-50ms latency.
- Led the migration of legacy monolithic settlement systems to AWS cloud-native microservices (deployed on Kubernetes/EKS), improving scaling capabilities and reducing infrastructure costs by 30%.
- Optimized JVM memory configurations, garbage collection settings (G1GC to ZGC transition), and implemented multi-threaded concurrency patterns, eliminating stop-the-world pauses and reducing CPU usage by 25%.
- Implemented robust error handling, DLQ (Dead Letter Queue) strategies, and transaction reconciliation scripts in Kafka pipelines to ensure 100% message delivery and zero financial data loss.

Senior Software Engineer | Goldman Sachs | 2017 – 2021
- Developed high-volume RESTful APIs and microservices for AML (Anti-Money Laundering) and KYC (Know Your Customer) real-time screening workflows.
- Designed and maintained complex database structures in PostgreSQL, optimized SQL queries using indexes, partition tables, and wrote stored procedures for transaction logging.
- Mentored a team of 6 engineers, established CI/CD pipelines using Jenkins, Docker, and enforced 90%+ code coverage standards.

EDUCATION
- Bachelor of Science in Computer Science | Rutgers University`,
    jobDescription: `Job Title: Lead Java / Spring Boot Engineer (Payments & Transaction Processing)
Client: JPMorgan Chase & Co.
Location: Jersey City, NJ (Hybrid - 3 days in office)
Term: Full-time

POSITION SUMMARY
JPMorgan Chase is looking for a Lead Software Engineer to drive the engineering and architectural direction of our global payments clearing platform. The ideal candidate has deep expertise in Java concurrency, Spring Boot microservices, high-volume event streaming with Apache Kafka, and resilient database transaction design.

RESPONSIBILITIES
- Drive the design, development, and maintenance of low-latency transaction processing APIs and event-driven microservices.
- Ensure strict transactional integrity across distributed systems, managing complex distributed transaction patterns (Saga, 2-Phase Commit).
- Optimize JVM performance, analyze thread dumps, heap dumps, and fine-tune garbage collection settings to ensure SLA compliance.
- Build high-availability Kafka streaming architectures with proper partitioning, compaction, consumer group tuning, and schema governance.
- Integrate systems with AWS cloud resources (EKS, RDS PostgreSQL, IAM, Secrets Manager) using secure infrastructure-as-code principles.
- Maintain top-tier security standards, including OAuth2, mutual TLS (mTLS), and compliant logging to protect sensitive financial data.

REQUIREMENTS
- 8+ years of Java development experience with exceptional mastery of Java Collections, Concurrency, and Streams.
- Expert knowledge of Spring Boot, Spring Security, Hibernate/JPA, and microservices architecture.
- 3+ years of production experience with Apache Kafka, including performance tuning, error-handling patterns, and high-availability configuration.
- Strong SQL and database design skills (PostgreSQL or Oracle), including transactional isolation levels, deadlock prevention, and query tuning.
- Production experience deploying containerized applications to AWS (EKS/Kubernetes).`
  }
];
