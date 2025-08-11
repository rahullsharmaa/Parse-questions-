import React, { useState } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle, FileText, BookOpen, GraduationCap } from 'lucide-react';
import { parseQuestionsWithAI } from '../services/geminiService';
import { saveQuestions } from '../services/questionService';
import { getExams, getCoursesByExam, Exam, Course } from '../services/examService';
import { Question, ParsedQuestion } from '../types/question';
import QuestionDisplay from './QuestionDisplay';

export default function QuestionParser() {
  const [questionType, setQuestionType] = useState<Question['question_type']>('MCQ');
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false);

  React.useEffect(() => {
    loadExams();
  }, []);

  React.useEffect(() => {
    if (selectedExam) {
      loadCourses(selectedExam);
    } else {
      setCourses([]);
      setSelectedCourse('');
    }
  }, [selectedExam]);

  const loadExams = async () => {
    try {
      setIsLoadingData(true);
      const examData = await getExams();
      setExams(examData);
    } catch (error) {
      console.error('Failed to load exams:', error);
      setStatus('error');
      setStatusMessage('Failed to load exams');
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadCourses = async (examId: string) => {
    try {
      setIsLoadingData(true);
      const courseData = await getCoursesByExam(examId);
      setCourses(courseData);
      setSelectedCourse('');
    } catch (error) {
      console.error('Failed to load courses:', error);
      setStatus('error');
      setStatusMessage('Failed to load courses');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleParse = async () => {
    if (!rawText.trim()) {
      setStatus('error');
      setStatusMessage('Please enter questions to parse');
      return;
    }

    setIsProcessing(true);
    setStatus('processing');
    setStatusMessage('AI is parsing your questions...');

    try {
      const questions = await parseQuestionsWithAI(rawText, questionType);
      setParsedQuestions(questions);
      setStatus('success');
      setStatusMessage(`Successfully parsed ${questions.length} questions`);
    } catch (error) {
      setStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Failed to parse questions');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (parsedQuestions.length === 0) return;

    if (!selectedCourse) {
      setStatus('error');
      setStatusMessage('Please select an exam and course before saving');
      return;
    }
    setIsProcessing(true);
    setStatus('processing');
    setStatusMessage('Saving questions to database...');

    try {
      const questionsToSave: Question[] = parsedQuestions.map(q => ({
        question_type: questionType,
        question_statement: q.question_statement,
        options: (questionType === 'MCQ' || questionType === 'MSQ') ? q.options || null : null,
      }));

      await saveQuestions(questionsToSave, selectedCourse);
      setStatus('success');
      setStatusMessage(`Successfully saved ${questionsToSave.length} questions to database`);
      
      // Reset form
      setRawText('');
      setParsedQuestions([]);
      setSelectedExam('');
      setSelectedCourse('');
    } catch (error) {
      setStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Failed to save questions');
    } finally {
      setIsProcessing(false);
    }
  };

  const questionTypes = [
    { value: 'MCQ', label: 'Multiple Choice (Single Answer)', description: 'Single correct answer' },
    { value: 'MSQ', label: 'Multiple Select (Multiple Answers)', description: 'Multiple correct answers' },
    { value: 'NAT', label: 'Numerical Answer Type', description: 'Numerical input required' },
    { value: 'Subjective', label: 'Subjective', description: 'Descriptive answer' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
            <FileText className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          AI Question Parser
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Paste your questions separated by "---" and let our AI intelligently parse and store them in the database
        </p>
      </div>

      {/* Exam and Course Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <GraduationCap className="h-6 w-6 mr-2 text-blue-600" />
          Select Exam and Course
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              disabled={isLoadingData}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">Select an exam...</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={!selectedExam || isLoadingData}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">Select a course...</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {selectedExam && selectedCourse && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-green-800">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">
                Selected: {exams.find(e => e.id === selectedExam)?.name} - {courses.find(c => c.id === selectedCourse)?.name}
              </span>
            </div>
          </div>
        )}
        
        <div className="mt-4 bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
          <h3 className="font-medium text-blue-800 mb-2">Enhanced LaTeX Processing:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Mathematical expressions will be automatically converted to LaTeX</li>
            <li>• Matrices, determinants, and equations will be beautifully formatted</li>
            <li>• Greek letters and mathematical symbols will be properly rendered</li>
            <li>• Questions will be enhanced for professional mathematical display</li>
          </ul>
        </div>
      </div>

      {/* Question Type Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Question Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questionTypes.map((type) => (
            <label
              key={type.value}
              className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md ${
                questionType === type.value
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="questionType"
                value={type.value}
                checked={questionType === type.value}
                onChange={(e) => setQuestionType(e.target.value as Question['question_type'])}
                className="sr-only"
              />
              <div className="font-medium text-gray-900">{type.label}</div>
              <div className="text-sm text-gray-500 mt-1">{type.description}</div>
              {questionType === type.value && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                </div>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Paste Your Questions</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h3 className="font-medium text-gray-800 mb-2">Format Guidelines:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Separate each question with "---"</li>
              <li>• Use "-" to separate question from options</li>
              <li>• Options can be listed as a), b), c) or 1), 2), 3)</li>
              <li>• For NAT and Subjective questions, no options needed</li>
            </ul>
          </div>
          
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`Example format:

What is the capital of France?
-
a) London
b) Paris
c) Berlin
d) Madrid
---
Which programming languages are object-oriented?
-
a) Java
b) Python
c) JavaScript
d) C
---`}
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
          />
          
          <button
            onClick={handleParse}
            disabled={isProcessing || !rawText.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
            <span>{isProcessing ? 'Processing...' : 'Parse Questions with AI'}</span>
          </button>
        </div>
      </div>

      {/* Status Message */}
      {status !== 'idle' && (
        <div className={`rounded-lg p-4 flex items-center space-x-3 ${
          status === 'success' ? 'bg-green-50 border border-green-200' :
          status === 'error' ? 'bg-red-50 border border-red-200' :
          'bg-blue-50 border border-blue-200'
        }`}>
          {status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
          {status === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
          {status === 'processing' && <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />}
          <span className={`font-medium ${
            status === 'success' ? 'text-green-800' :
            status === 'error' ? 'text-red-800' :
            'text-blue-800'
          }`}>
            {statusMessage}
          </span>
        </div>
      )}

      {/* Parsed Questions Preview */}
      {parsedQuestions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Parsed Questions ({parsedQuestions.length})
            </h2>
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="bg-green-600 text-white py-2 px-6 rounded-lg font-medium transition-all duration-200 hover:bg-green-700 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <span>Save to Database</span>
            </button>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {parsedQuestions.map((question, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    Question {index + 1} ({questionType})
                  </span>
                </div>
                <div className="mb-3">
                  <QuestionDisplay 
                    content={question.question_statement}
                    className="text-gray-800 font-medium"
                  />
                </div>
                {question.options && question.options.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Options:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {question.options.map((option, optIndex) => (
                        <li key={optIndex}>{option}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}