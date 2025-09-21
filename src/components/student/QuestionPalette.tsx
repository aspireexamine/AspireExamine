import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuestionPaletteProps {
  totalQuestions: number; // Keep this for potential future use
  currentQuestion: number;
  answers: Record<string, number | null>;
  markedForReview: Set<string>;
  onQuestionSelect: (index: number) => void;
  getQuestionIdByIndex: (index: number) => string;
  isMobileCompact?: boolean;
}

export function QuestionPalette({
  currentQuestion,
  answers,
  markedForReview,
  onQuestionSelect,
  totalQuestions,
  getQuestionIdByIndex,
  isMobileCompact = false,
}: QuestionPaletteProps) {
  const getQuestionStatus = (index: number) => {
    const questionId = getQuestionIdByIndex(index);
    const isAnswered = answers[questionId] !== undefined && answers[questionId] !== null;
    const isMarked = markedForReview.has(questionId);
    const isCurrent = index === currentQuestion;

    if (isCurrent) return 'current';
    if (isAnswered && isMarked) return 'answered-marked';
    if (isAnswered) return 'answered';
    if (isMarked) return 'marked';
    return 'not-answered';
  };

  const statusStyles = {
    'current': 'bg-primary text-primary-foreground ring-2 ring-primary-foreground ring-offset-2 ring-offset-background',
    'answered': 'bg-green-500 text-white hover:bg-green-600',
    'answered-marked': 'bg-blue-500 text-white hover:bg-blue-600',
    'marked': 'bg-purple-500 text-white hover:bg-purple-600',
    'not-answered': 'bg-muted text-muted-foreground hover:bg-muted/80'
  };

  if (isMobileCompact) {
    return (
      <>
        {Array.from({ length: totalQuestions }, (_, index) => {
          const status = getQuestionStatus(index);
          return (
            <Button
              key={index}
              variant="outline"
              size="icon"
              onClick={() => onQuestionSelect(index)}
              className={cn(
                "h-7 w-7 rounded-md flex-shrink-0 text-xs font-bold",
                statusStyles[status]
              )}
            >
              {index + 1}
            </Button>
          );
        })}
      </>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base sm:text-lg">Question Palette</CardTitle>
        <CardDescription className="text-xs">Click a number to jump to that question.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question Grid */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {Array.from({ length: totalQuestions }, (_, index) => {
            const status = getQuestionStatus(index);
            return (<Button key={index} variant="outline" size="icon" onClick={() => onQuestionSelect(index)} className={cn("h-8 w-8 rounded-full font-semibold text-xs", statusStyles[status])}>
              {index + 1}
            </Button>);
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2"><div className="h-3.5 w-3.5 rounded-full bg-muted border" /> Not Answered</div>
          <div className="flex items-center gap-2"><div className="h-3.5 w-3.5 rounded-full bg-green-500" /> Answered</div>
          <div className="flex items-center gap-2"><div className="h-3.5 w-3.5 rounded-full bg-purple-500" /> Marked for Review</div>
          <div className="flex items-center gap-2"><div className="h-3.5 w-3.5 rounded-full bg-blue-500" /> Answered & Marked</div>
        </div>
      </CardContent>
    </Card>
  );
}