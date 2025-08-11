import { supabase } from '../lib/supabase';
import { Question } from '../types/question';
import { enhanceQuestionWithLatex } from './latexConverter';

export async function saveQuestions(questions: Question[], courseId?: string): Promise<void> {
  // Enhance questions with LaTeX formatting
  const enhancedQuestions = questions.map(q => ({
    ...q,
    question_statement: enhanceQuestionWithLatex(q.question_statement),
    options: q.options?.map(opt => enhanceQuestionWithLatex(opt)) || null,
    course_id: courseId || null
  }));

  const { error } = await supabase
    .from('questions')
    .insert(enhancedQuestions);

  if (error) {
    throw new Error(`Failed to save questions: ${error.message}`);
  }
}

export async function getQuestions(questionType?: string): Promise<Question[]> {
  let query = supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false });

  if (questionType) {
    query = query.eq('question_type', questionType);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch questions: ${error.message}`);
  }

  return data || [];
}

export async function deleteQuestion(id: string): Promise<void> {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete question: ${error.message}`);
  }
}