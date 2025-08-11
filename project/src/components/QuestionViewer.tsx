import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2, FileText, Clock, BookOpen, GraduationCap } from 'lucide-react';
import { getQuestions, deleteQuestion } from '../services/questionService';
import { getExams, getCoursesByExam, Exam, Course } from '../services/examService';
import { Question } from '../types/question';
import QuestionDisplay from './QuestionDisplay';

export default function QuestionViewer() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
    loadExams();
  }, []);

  useEffect(() => {
    if (selectedExam && selectedExam !== 'all') {
      loadCourses(selectedExam);
    } else {
      setCourses([]);
      setSelectedCourse('all');
    }
  }, [selectedExam]);

  useEffect(() => {
    filterQuestions();
  }, [questions, selectedType, selectedCourse, searchTerm]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const data = await getQuestions();
      setQuestions(data);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExams = async () => {
    try {
      const examData = await getExams();
      setExams(examData);
    } catch (error) {
      console.error('Failed to load exams:', error);
    }
  };

  const loadCourses = async (examId: string) => {
    try {
      const courseData = await getCoursesByExam(examId);
      setCourses(courseData);
      setSelectedCourse('all');
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const filterQuestions = () => {
    let filtered = questions;

    if (selectedType !== 'all') {
      filtered = filtered.filter(q => q.question_type === selectedType);
    }

    if (selectedCourse !== 'all') {
      filtered = filtered.filter(q => q.course_id === selectedCourse);
    }

    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.question_statement.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredQuestions(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      await deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (error) {
      console.error('Failed to delete question:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MCQ': return 'bg-blue-100 text-blue-800';
      case 'MSQ': return 'bg-purple-100 text-purple-800';
      case 'NAT': return 'bg-green-100 text-green-800';
      case 'Subjective': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 rounded-full">
            <FileText className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Question Database
        </h1>
        <p className="text-gray-600 text-lg">
          View and manage all your parsed questions
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Types</option>
                <option value="MCQ">MCQ</option>
                <option value="MSQ">MSQ</option>
                <option value="NAT">NAT</option>
                <option value="Subjective">Subjective</option>
              </select>
            </div>
          </div>
          
          <div>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Exams</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>{exam.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                disabled={selectedExam === 'all'}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none disabled:opacity-50"
              >
                <option value="all">All Courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>Total: {questions.length} questions</span>
          <span>Showing: {filteredQuestions.length} questions</span>
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-100 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No questions found</h3>
          <p className="text-gray-600">
            {questions.length === 0 
              ? "Start by parsing some questions to see them here"
              : "Try adjusting your search or filter criteria"
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <div key={question.id} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(question.question_type)}`}>
                      {question.question_type}
                    </span>
                    {question.course_id && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {courses.find(c => c.id === question.course_id)?.name || 
                         exams.find(e => courses.some(c => c.exam_id === e.id && c.id === question.course_id))?.name || 
                         'Course'}
                      </span>
                    )}
                    {question.created_at && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(question.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => question.id && handleDelete(question.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    title="Delete question"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <QuestionDisplay 
                    content={question.question_statement}
                    className="text-gray-900"
                  />
                </div>
                
                {question.options && question.options.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-2">Options:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {question.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="text-gray-700">{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}