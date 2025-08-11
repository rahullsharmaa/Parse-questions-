/*
  # Create questions table

  1. New Tables
    - `questions`
      - `id` (uuid, primary key)
      - `question_type` (text) - MCQ, MSQ, NAT, or Subjective
      - `question_statement` (text) - The main question text
      - `options` (text array) - Array of options for MCQ/MSQ, null for others
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `questions` table
    - Add policy for public read access (since this appears to be a question bank)
    - Add policy for public insert access (to allow adding questions)
    - Add policy for public delete access (to allow removing questions)
*/

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_type text NOT NULL CHECK (question_type IN ('MCQ', 'MSQ', 'NAT', 'Subjective')),
  question_statement text NOT NULL,
  options text[] DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access to questions"
  ON questions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to questions"
  ON questions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to questions"
  ON questions
  FOR DELETE
  TO public
  USING (true);

-- Create an index on question_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(question_type);

-- Create an index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);