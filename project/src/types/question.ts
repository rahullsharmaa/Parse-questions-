export interface Question {
  id?: string;
  question_type: 'MCQ' | 'MSQ' | 'NAT' | 'Subjective';
  question_statement: string;
  options?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface ParsedQuestion {
  question_statement: string;
  options?: string[];
}