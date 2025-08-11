import { ParsedQuestion } from '../types/question';

const GEMINI_API_KEY = 'AIzaSyBGs6lGKZbq9WhuqYH2O9rh6QHWARQMPOQ';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

export async function parseQuestionsWithAI(
  rawText: string,
  questionType: string
): Promise<ParsedQuestion[]> {
  const prompt = `You are a question parser. Your job is to extract questions from text and convert mathematical expressions to proper LaTeX format.

CRITICAL RULES:
1. Preserve ALL content but enhance mathematical expressions with LaTeX
2. Convert matrices like [[1,0],[0,1]] to \\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}
3. Convert mathematical symbols: alpha → \\alpha, lambda → \\lambda, etc.
4. Convert fractions: 3/4 → \\frac{3}{4}
5. Convert superscripts: A^T → A^T, A^-1 → A^{-1}
6. Wrap mathematical expressions in $ for inline or $$ for display
7. Preserve ALL context and supporting information
8. Handle determinants: |A| should become |A| or \\det(A)

Parse the following text into individual questions separated by "---":

${rawText}

For each question:
- If it has options (after "-" or listed as a), b), c)), extract them as an array
- If no options, set options to null
- Convert mathematical content to proper LaTeX format
- Preserve COMPLETE question context

Return ONLY a JSON array in this format:
[
  {
    "question_statement": "Question text with LaTeX-formatted mathematical expressions",
    "options": ["LaTeX-formatted option1", "LaTeX-formatted option2"] or null
  }
]`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0,
          topK: 1,
          topP: 1,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!generatedText) {
      throw new Error('No response from Gemini API');
    }

    // Clean the response and extract JSON
    let cleanedText = generatedText.trim();
    
    // Remove markdown code blocks if present
    cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find JSON array
    const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      // Fallback: try to parse the entire cleaned text
      try {
        // Escape backslashes before parsing
        const escapedText = cleanedText.replace(/\\/g, '\\\\');
        const parsedQuestions = JSON.parse(escapedText);
        return Array.isArray(parsedQuestions) ? parsedQuestions : [parsedQuestions];
      } catch {
        throw new Error('Could not extract valid JSON from AI response');
      }
    }

    // Escape backslashes in the matched JSON before parsing
    const escapedJson = jsonMatch[0].replace(/\\/g, '\\\\');
    const parsedQuestions = JSON.parse(escapedJson);
    
    // Validate the response
    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      throw new Error('AI returned invalid question format');
    }

    // Ensure all questions have the required fields
    const validatedQuestions = parsedQuestions.map((q, index) => {
      if (!q.question_statement || typeof q.question_statement !== 'string') {
        throw new Error(`Question ${index + 1} is missing or has invalid question_statement`);
      }
      
      // Ensure minimum content length (to catch overly truncated questions)
      if (q.question_statement.trim().length < 10) {
        throw new Error(`Question ${index + 1} appears to be truncated or too short`);
      }
      
      return {
        question_statement: q.question_statement.trim(),
        options: Array.isArray(q.options) ? q.options.filter(opt => opt && opt.trim()) : null
      };
    });

    return validatedQuestions;
  } catch (error) {
    console.error('Error parsing questions with AI:', error);
    throw new Error(`Failed to parse questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}