import { Stream, Question, Result } from '@/types';

export const STREAMS: Stream[] = [];

export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: '1',
    paperId: '1',
    question: 'A particle moves in a straight line with constant acceleration. If its velocity changes from 10 m/s to 30 m/s in 4 seconds, what is its acceleration?',
    options: ['5 m/s²', '10 m/s²', '2.5 m/s²', '7.5 m/s²'],
    correctAnswer: 0,
    explanation: 'Using v = u + at, we get 30 = 10 + a(4), so a = 5 m/s²',
    difficulty: 'Easy' as const,
    subject: 'Physics',
    topic: 'Motion',
    marks: 4
  }
];

export const SAMPLE_RESULTS: Result[] = [
  {
    id: 'res-1',
    examSessionId: 'session-1',
    userId: '1',
    paperId: '1',
    score: 140,
    totalMarks: 180,
    percentage: (140/180) * 100,
    timeTaken: 10800, // 3 hours in seconds
    correctAnswers: 35,
    wrongAnswers: 10,
    unanswered: 0,
    createdAt: '2024-05-10T10:00:00Z',
  }
];

export const EXAM_CONFIG = {
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  WARNING_TIME: 300000, // 5 minutes
  CRITICAL_TIME: 60000, // 1 minute
};
