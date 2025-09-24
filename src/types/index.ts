export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  avatar?: string;
  contact_number?: string;
  date_of_birth?: string;
  address?: string;
  results?: Result[];
}

export interface Notebook {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

export interface NotebookFolder {
  id: string;
  name: string;
  notebooks: Notebook[];
}

export interface Chapter {
  id: string;
  name: string;
  papers?: Paper[];
  serial?: number;
}

export interface PracticeSubject {
  id: string;
  name: string;
  chapters: Chapter[];
}

export type PracticeSection = {
  id: string;
  name: string;
  description: string;
  type: 'ALL_ROUND';
  allRoundTypes: ('FULL_SYLLABUS' | 'SUBJECT_WISE' | 'CHAPTER_WISE')[];
  papers: Paper[];
  years?: { year: string; }[];
  subjectWiseData?: Record<string, YearEntry[]>;
  subjects: PracticeSubject[];
  chapters?: Chapter[];
} | {
  id: string;
  name: string;
  description: string;
  type: 'TEST_SERIES';
  papers: Paper[];
};

export interface Stream {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  subjects: Subject[];
  practiceSections?: PracticeSection[];
  testSeries?: TestSeries[];
}

export interface Subject {
  id: string;
  name: string;
  streamId: string;
  icon?: string;
  papers?: Paper[];
  chapters?: Chapter[]; // Added for potential future use
}

export interface Paper {
  id: string;
  title: string;
  subject_id: string;
  chapter_id?: string;
  stream_id?: string;
  duration: number;
  total_questions: number;
  max_marks: number;
  difficulty: Difficulty;
  attempts: number;
  created_at: string;
  questions?: Question[];
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
  id: string;
  paperId: string;
  testId?: string;
  question: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  subject: string;
  topic: string;
  marks: number;
  filePath?: string;
  createdAt?: string;
}

export interface YearEntry {
  year: string;
}

export interface ExamSession {
  id: string;
  paperId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  timeRemaining: number;
  answers: Record<string, number | null>;
  markedForReview: Set<string>;
  currentQuestionIndex: number;
  status: 'in-progress' | 'completed' | 'abandoned';
}

export type Result = {
  id: string;
  examSessionId: string;
  userId: string;
  paperId: string;
  score: number;
  totalMarks: number;
  percentage: number;
  timeTaken: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  createdAt: string;
  answers?: Record<string, number | null>;
  perQuestionTimings?: Record<string, number>;
}

export interface AnalyticsData {
  totalStudents: number;
  totalPapers: number;
  totalAttempts: number;
  averageScore: number;
  topPerformers: Array<{ name: string; score: number }>;
  subjectPerformance: Array<{ subject: string; avgScore: number }>;
  monthlyAttempts: Array<{ month: string; attempts: number }>;
}

export interface Test {
  id: string;
  name: string;
  numQuestions: number;
  duration: number; // in minutes
  questions?: Question[];
}

export interface TestSeries {
  id: string;
  name: string;
  description: string;
  tests: Test[];
}

// Smart Study Hub Generated Content Types
export type GeneratedContentType = 'notes' | 'summary' | 'flashcards' | 'mindmap' | 'questions';

export type InputMethod = 'youtube' | 'file' | 'text' | 'image' | 'scan';

export interface GeneratedContent {
  id: string;
  userId: string;
  title: string;
  type: GeneratedContentType;
  inputMethod: InputMethod;
  inputSource: string; // URL, file name, or text preview
  content: GeneratedContentData;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  isFavorite?: boolean;
}

export interface GeneratedContentData {
  notes?: NotesContent;
  summary?: SummaryContent;
  flashcards?: FlashcardContent[];
  mindmap?: MindmapContent;
  questions?: QuestionContent[];
}

export interface NotesContent {
  title: string;
  sections: NotesSection[];
  keyPoints: string[];
  references?: string[];
}

export interface NotesSection {
  heading: string;
  content: string;
  subSections?: NotesSection[];
}

export interface SummaryContent {
  overview: string;
  keyPoints: string[];
  mainTopics: string[];
  conclusion?: string;
}

export interface FlashcardContent {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
}

export interface MindmapContent {
  title: string;
  centralTopic: string;
  branches: MindmapBranch[];
}

export interface MindmapBranch {
  id: string;
  label: string;
  subBranches: MindmapBranch[];
  color?: string;
}

export interface QuestionContent {
  id: string;
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
}

// Library System Types
export interface LibraryItem {
  id: string;
  userId: string;
  type: 'notebook' | 'generated-content';
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  isFavorite?: boolean;
  // Union type for different content
  content: Notebook | GeneratedContent;
}

export interface LibraryFolder {
  id: string;
  name: string;
  description?: string;
  items: LibraryItem[];
  createdAt: string;
  updatedAt: string;
  isSystemFolder?: boolean; // For auto-generated folders like "Generated Content"
}