import { supabase } from '../lib/supabase';

export interface Exam {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Course {
  id: string;
  exam_id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getExams(): Promise<Exam[]> {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch exams: ${error.message}`);
  }

  return data || [];
}

export async function getCoursesByExam(examId: string): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('exam_id', examId)
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }

  return data || [];
}