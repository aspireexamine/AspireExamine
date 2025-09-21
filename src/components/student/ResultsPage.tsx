import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Result } from '@/types';
import { 
  BookOpenCheck,
  Download, 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Home 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ResultsPageProps {
  result: Result;
  onDownloadPdf?: () => void; // Making this optional as it's not always used
  onGoHome: () => void;
  onReviewTest: () => void;
}

export function ResultsPage({ result, onDownloadPdf, onGoHome, onReviewTest }: ResultsPageProps) {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'bg-green-500' };
    if (percentage >= 80) return { grade: 'A', color: 'bg-green-400' };
    if (percentage >= 70) return { grade: 'B+', color: 'bg-blue-400' };
    if (percentage >= 60) return { grade: 'B', color: 'bg-blue-300' };
    if (percentage >= 50) return { grade: 'C', color: 'bg-yellow-400' };
    return { grade: 'F', color: 'bg-red-400' };
  };

  const { grade, color } = getGrade(result.percentage);
  const timeTakenInMinutes = Math.floor(result.timeTaken / 60);
  const timeTakenInSeconds = result.timeTaken % 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-2 sm:p-4 md:p-6">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4 sm:mb-6"
        >
          <div className="flex items-center justify-center mb-2 sm:mb-3">
            <div className={`p-2.5 sm:p-4 rounded-full ${color} text-white`}>
              <Trophy className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Test Completed!</h1>
          <p className="text-muted-foreground">Here are your detailed results</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
          {/* Score Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Your Score</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="space-y-1">
                  <div className={`text-3xl sm:text-4xl font-bold ${getScoreColor(result.percentage)}`}>
                    {result.score}/{result.totalMarks}
                  </div>
                  <div className={`text-lg sm:text-2xl font-semibold ${getScoreColor(result.percentage)}`}>
                    {result.percentage.toFixed(1)}%
                  </div>
                  <Badge className={`${color} text-white`}>
                    Grade {grade}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Performance Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-3 sm:p-6 pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Correct</span>
                  </div>
                  <span className="font-semibold text-sm text-green-600">{result.correctAnswers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Incorrect</span>
                  </div>
                  <span className="font-semibold text-sm text-red-600">{result.wrongAnswers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Unanswered</span>
                  </div>
                  <span className="font-semibold text-sm text-gray-600">{result.unanswered}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Time Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="md:col-span-2 lg:col-span-1"
          >
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Time Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-3 sm:p-6 pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Time Taken</span>
                  </div>
                  <span className="font-semibold text-sm">{timeTakenInMinutes}m {timeTakenInSeconds}s</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    {/* This calculation requires paper duration which is not part of the result object. 
                        We can show the percentage of questions attempted. */}
                    <span>Attempted</span>
                    <span suppressHydrationWarning>{(((result.correctAnswers + result.wrongAnswers) / result.totalMarks * 4) * 100).toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={((result.correctAnswers + result.wrongAnswers) / result.totalMarks * 4) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Detailed Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span>Overall Score</span>
                    <span className="font-semibold">{result.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={result.percentage} className="h-2" />
                </div>
                
                <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1">
                  <div className="text-center p-2 sm:p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <CheckCircle className="h-5 w-5 sm:h-8 sm:w-8 text-green-500 mx-auto mb-1" />
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{result.correctAnswers}</div>
                    <div className="text-xs text-green-600">Correct</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <XCircle className="h-5 w-5 sm:h-8 sm:w-8 text-red-500 mx-auto mb-1" />
                    <div className="text-xl sm:text-2xl font-bold text-red-600">{result.wrongAnswers}</div>
                    <div className="text-xs text-red-600">Incorrect</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20">
                    <AlertCircle className="h-5 w-5 sm:h-8 sm:w-8 text-gray-500 mx-auto mb-1" />
                    <div className="text-xl sm:text-2xl font-bold text-gray-600">{result.unanswered}</div>
                    <div className="text-xs text-gray-600">Skipped</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center mt-4 sm:mt-6"
        >
          <Button onClick={onReviewTest} className="gap-2 w-full sm:w-auto" size="sm">
            <BookOpenCheck className="h-4 w-4" />
            View Solutions
          </Button>
          <Button onClick={onGoHome} variant="outline" className="gap-2 w-full sm:w-auto" size="sm">
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button onClick={onDownloadPdf} className="gap-2 w-full sm:w-auto" size="sm">
            <Download className="h-4 w-4" />
            Download PDF Report
          </Button>
        </motion.div>
      </div>
    </div>
  );
}