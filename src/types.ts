export interface Question {
  id: number;
  text: string;
  isCompleted?: boolean;
  notes?: string;
}

export interface QuestionSection {
  id: number;
  title: string;
  questions: Question[];
}

export interface QuestionBank {
  role: string;
  client: string;
  vendor: string;
  preparedFor: string;
  sections: QuestionSection[];
  rawMarkdown: string;
}

export interface GenerationConfig {
  candidateName: string;
  targetRole: string;
  targetClient: string;
  vendorName: string;
  domain: 'Healthcare' | 'Banking' | 'Retail' | 'Telecom' | 'Manufacturing' | 'General';
  difficultyDistribution: {
    basic: number; // e.g. 20
    intermediate: number; // e.g. 50
    advanced: number; // e.g. 30
  };
}
