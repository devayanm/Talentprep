import { QuestionBank, QuestionSection, Question } from "../types";

export function parseMarkdownToQuestionBank(
  rawMarkdown: string,
  targetRole: string,
  targetClient: string,
  vendorName: string,
  candidateName: string
): QuestionBank {
  // Quick regexes to extract metadata if specified at the top
  const roleMatch = rawMarkdown.match(/ROLE:\s*(.*)/i);
  const clientMatch = rawMarkdown.match(/CLIENT:\s*(.*)/i);
  const vendorMatch = rawMarkdown.match(/VENDOR:\s*(.*)/i);
  const prepForMatch = rawMarkdown.match(/PREPARED_FOR:\s*(.*)/i);

  const sections: QuestionSection[] = [];
  
  // Split the markdown by standard headings like "## Section" or "### Section"
  // We search for line starting with ## Section
  const sectionBlocks = rawMarkdown.split(/(?=^##\s+Section\s+\d+)/mi);

  let secIdCounter = 1;
  let questionIdCounter = 1;

  sectionBlocks.forEach((block) => {
    const headerLineMatch = block.match(/^##\s+(Section\s+\d+:\s*.*)$/m);
    if (!headerLineMatch) return;

    const title = headerLineMatch[1].trim();
    const questions: Question[] = [];

    // Extract lines that look like: 1. Question text or 1) Question text
    const lines = block.split("\n");
    lines.forEach((line) => {
      const qMatch = line.match(/^\s*(\d+)[\.\)]\s*(.*)$/);
      if (qMatch) {
        questions.push({
          id: questionIdCounter++,
          text: qMatch[2].trim(),
        });
      }
    });

    if (title || questions.length > 0) {
      sections.push({
        id: secIdCounter++,
        title: title,
        questions: questions,
      });
    }
  });

  return {
    role: roleMatch ? roleMatch[1].trim() : targetRole,
    client: clientMatch ? clientMatch[1].trim() : targetClient,
    vendor: vendorMatch ? vendorMatch[1].trim() : vendorName,
    preparedFor: prepForMatch ? prepForMatch[1].trim() : candidateName,
    sections,
    rawMarkdown,
  };
}
