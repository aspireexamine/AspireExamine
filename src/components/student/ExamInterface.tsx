import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { QuestionPalette } from './QuestionPalette';
import { useExamTimer } from '@/hooks/useExamTimer';
import { getPlatformSettings } from '@/lib/supabaseQueries';
import { Paper, Question } from '@/types';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookmarkPlus, 
  BookmarkMinus, 
  Clock, 
  AlertTriangle, 
  LayoutGrid,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExamInterfaceProps {
  paper: Paper;
  questions: Question[];
  onSubmit?: (answers: Record<string, number | null>, perQuestionTimings: Record<string, number>) => void;
  reviewData?: {
    answers: Record<string, number | null>;
    timeTaken: number;
    perQuestionTimings: Record<string, number>;
  };
}

export function ExamInterface({ paper, questions, onSubmit, reviewData }: ExamInterfaceProps) {
  const isReviewMode = !!reviewData;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>(() =>
    isReviewMode ? reviewData.answers : {}
  );
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false); // Renamed from showSubmitConfirm for clarity
  const [perQuestionTime, setPerQuestionTime] = useState(0);
  const [perQuestionTimings, setPerQuestionTimings] = useState<Record<string, number>>({});

  const questionIds = useMemo(() => questions.map(q => q.id), [questions]);

  // This ensures that the palette has access to the correct question IDs
  const getQuestionIdByIndex = (index: number) => questionIds[index];

  const handleSubmit = () => {
    onSubmit?.(answers, perQuestionTimings);
  };

  const [warningMinutes, setWarningMinutes] = useState<number>(5);
  const [criticalMinutes, setCriticalMinutes] = useState<number>(1);

  const { formattedTime, isWarning, isCritical } = useExamTimer(
    paper.duration,
    isReviewMode ? () => {} : () => handleSubmit(),
    { warningMinutes, criticalMinutes }
  );

  useEffect(() => {
    if (isReviewMode) return;
    let cleanup: (() => void) | undefined;
    (async () => {
      try {
        const s = await getPlatformSettings();
        // Prevent Copy/Paste
        if (s.exam_prevent_copy) {
          const onCopy = (e: ClipboardEvent) => e.preventDefault();
          const onCut = (e: ClipboardEvent) => e.preventDefault();
          const onPaste = (e: ClipboardEvent) => e.preventDefault();
          document.addEventListener('copy', onCopy as any);
          document.addEventListener('cut', onCut as any);
          document.addEventListener('paste', onPaste as any);
          cleanup = () => {
            document.removeEventListener('copy', onCopy as any);
            document.removeEventListener('cut', onCut as any);
            document.removeEventListener('paste', onPaste as any);
          };
        }
        if (s.exam_warning_minutes !== null) setWarningMinutes(Number(s.exam_warning_minutes));
        if (s.exam_critical_minutes !== null) setCriticalMinutes(Number(s.exam_critical_minutes));
      } catch {}
    })();
    return () => {
      if (cleanup) cleanup();
    };
  }, [isReviewMode]);

  useEffect(() => {
    if (isReviewMode) return;
    // Reset per-question timer whenever the question index changes
    setPerQuestionTime(0);
    const interval = setInterval(() => {
      setPerQuestionTime(prev => {
        const newTime = prev + 1;
        if (currentQuestionId) {
          setPerQuestionTimings(timings => ({...timings, [currentQuestionId]: (timings[currentQuestionId] || 0) + 1 }));
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestionIndex, isReviewMode]);

  const currentQuestion = questions[currentQuestionIndex];
  const currentQuestionId = currentQuestion?.id; // This can be undefined if questions is empty

  const handleAnswerSelect = (optionIndex: number) => {
    if (currentQuestionId) {
      setAnswers(prev => {
        // If the clicked option is already the selected answer, uncheck it by setting it to null.
        if (prev[currentQuestionId] === optionIndex) {
          return { ...prev, [currentQuestionId]: null };
        }
        // Otherwise, select the new option.
        return { ...prev, [currentQuestionId]: optionIndex, };
      });
    }
  };

  const handleMarkForReview = () => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestionId)) {
        newSet.delete(currentQuestionId);
      } else if (currentQuestionId) {
        newSet.add(currentQuestionId);
      }
      return newSet;
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const isMarked = currentQuestionId ? markedForReview.has(currentQuestionId) : false;
  const selectedAnswer = currentQuestionId ? answers[currentQuestionId] as number | undefined : undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <header className={`sticky top-0 z-20 border-b px-2 sm:px-4 py-2 flex items-center justify-between ${
        isCritical ? 'bg-red-50 dark:bg-red-900/20' : 
        isWarning ? 'bg-yellow-50 dark:bg-yellow-900/20' : 
        'bg-background'
      }`}>
        <div className="flex items-center gap-2 text-sm sm:text-base">
          <div className={`flex items-center gap-1.5`}>
            <Clock className={`h-4 w-4 ${
              isCritical ? 'text-red-600 dark:text-red-400' :
              isWarning ? 'text-yellow-600 dark:text-yellow-400' :
              'text-muted-foreground'
            }`} />
            <span className={`font-sans font-bold text-sm sm:text-base tracking-tighter ${
              isCritical ? 'text-red-600 dark:text-red-400' :
              isWarning ? 'text-yellow-600 dark:text-yellow-400' :
              'text-foreground'
            }`}>
              {isReviewMode 
                ? `${Math.floor(reviewData.timeTaken / 60).toString().padStart(2, '0')}:${(reviewData.timeTaken % 60).toString().padStart(2, '0')}` 
                : formattedTime}
            </span>
          </div>
          <h1 className="hidden sm:block text-lg font-bold truncate">{paper.title}</h1>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* This palette button was in the header and is now removed as per the request. */}
          {!isReviewMode && (
            <Button variant="destructive" size="sm" onClick={() => setIsSubmitConfirmOpen(true)}>
              Submit
            </Button>
          )}
        </div>
      </header>

      {/* Mobile Question Palette Bar */}
      <div className="lg:hidden sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-2 py-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
            <QuestionPalette
              totalQuestions={questions.length}
              currentQuestion={currentQuestionIndex}
              answers={answers}
              markedForReview={markedForReview}
              onQuestionSelect={setCurrentQuestionIndex}
              getQuestionIdByIndex={getQuestionIdByIndex}
              isMobileCompact={true}
            />
          </div>
          <Sheet open={isPaletteOpen} onOpenChange={setIsPaletteOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 flex-shrink-0">
                <LayoutGrid className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Question Palette</SheetTitle>
              </SheetHeader>
              <div className="p-4">
                <QuestionPalette 
                  totalQuestions={questions.length} 
                  currentQuestion={currentQuestionIndex} 
                  answers={answers} 
                  markedForReview={markedForReview} 
                  onQuestionSelect={(index) => { setCurrentQuestionIndex(index); setIsPaletteOpen(false); }} 
                  getQuestionIdByIndex={getQuestionIdByIndex} 
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="container mx-auto p-2 sm:p-4 grid lg:grid-cols-4 gap-6 pt-4">
        {/* Question Area */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 px-1 sm:px-0">
                <div className="flex items-center gap-1 text-[11px] sm:text-xs font-medium rounded-full bg-muted px-2 py-0.5 sm:px-2.5 sm:py-1">
                  <span>Marks:</span>
                  <span className="font-bold text-green-600">+{currentQuestion.marks}</span>
                  <span className="font-bold text-red-500 ml-1">
                    -{(currentQuestion as any).negativeMarks ?? 1}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] sm:text-xs font-medium rounded-full bg-muted px-2 py-0.5 sm:px-2.5 sm:py-1 capitalize">
                  <span>Type:</span>
                  <span className="font-semibold">{(currentQuestion as any).type || 'Single'}</span>
                </div>
              </div>

              <Card>
                <CardHeader className="border-b p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-1 sm:gap-2">
                    <div className="flex items-center gap-2 text-base sm:text-lg font-bold">
                      <div className="text-xs sm:text-sm font-semibold bg-muted text-muted-foreground rounded-md px-2 py-1 sm:px-2.5 sm:py-1.5">
                        {currentQuestionIndex + 1}/{questions.length} 
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-600 font-sans font-medium">
                      {isReviewMode ? (
                        <span>{Math.floor((reviewData.perQuestionTimings[currentQuestionId] || 0) / 60).toString().padStart(2, '0')}:{((reviewData.perQuestionTimings[currentQuestionId] || 0) % 60).toString().padStart(2, '0')}</span>
                      ) : (
                        <span>
                          {Math.floor(perQuestionTime / 60)
                            .toString()
                            .padStart(2, '0')}
                          :{(perQuestionTime % 60).toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      {!isReviewMode && <Button
                        variant={isMarked ? "secondary" : "outline"}
                        size="sm"
                        onClick={handleMarkForReview}
                        className="gap-1 h-8 px-2 sm:px-3 text-xs sm:text-sm"
                      >
                        {isMarked ? <BookmarkMinus className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
                        {isMarked ? 'Unmark' : 'Mark'}
                      </Button>}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert leading-snug sm:leading-relaxed">
                    <p className="text-sm sm:text-base">{currentQuestion.question}</p>
                    {currentQuestion.imageUrl && (
                      <div className="mt-4 mb-4">
                        <img src={currentQuestion.imageUrl} alt="Question illustration" className="max-w-full max-h-60 sm:max-h-72 rounded-md border bg-muted" />
                      </div>
                    )}
                  </div>
                  
                  <RadioGroup
                    value={selectedAnswer?.toString() || ''}
                    onValueChange={(value) => !isReviewMode && handleAnswerSelect(parseInt(value, 10))}
                    className="space-y-2"
                  >
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = selectedAnswer === index;
                      const isCorrect = isReviewMode && currentQuestion.correctAnswer === index;
                      const isIncorrect = isReviewMode && isSelected && !isCorrect;

                      return (
                        <Label 
                          key={index}
                          className={`relative flex items-center space-x-3 p-2.5 sm:p-3 rounded-lg border transition-colors ${
                            isReviewMode ? '' : 'cursor-pointer'
                          } ${
                            isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                            isIncorrect ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                            isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                          }`}
                        >
                          <RadioGroupItem 
                            value={index.toString()} 
                            id={`option-${index}`}
                            disabled={isReviewMode}
                          />
                          <span className="flex-1 text-xs sm:text-sm leading-relaxed">
                            {option} 
                          </span>
                          {isCorrect && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
                          {isIncorrect && <XCircle className="h-5 w-5 text-red-500 ml-auto" />}
                        </Label>
                      );
                    })}
                  </RadioGroup>
                  {isReviewMode && currentQuestion.explanation && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-muted rounded-lg space-y-1 text-sm">
                      <h3 className="font-semibold">Explanation:</h3>
                      <p className="text-muted-foreground">{currentQuestion.explanation}</p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4 gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="gap-1 sm:gap-2 px-3 sm:px-4 h-9"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            
            {!isReviewMode && (
              <Button
                variant="secondary"
                onClick={() => handleAnswerSelect(selectedAnswer as number)}
                disabled={selectedAnswer === undefined || selectedAnswer === null}
                className="h-9 px-3 sm:px-4"
              >
                Uncheck
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              disabled={currentQuestionIndex === questions.length - 1}
              className="gap-1 sm:gap-2 px-3 sm:px-4 h-9"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Question Palette (Desktop) */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-[74px]">
            <QuestionPalette
              totalQuestions={questions.length}
              currentQuestion={currentQuestionIndex}
              answers={answers}
              markedForReview={markedForReview}
              onQuestionSelect={setCurrentQuestionIndex}
              getQuestionIdByIndex={getQuestionIdByIndex}
            />
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={isSubmitConfirmOpen} onOpenChange={setIsSubmitConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Submit Test?
            </AlertDialogTitle>
            <CardDescription>
              Are you sure you want to submit your test? This action cannot be undone.
            </CardDescription>
          </AlertDialogHeader>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Answered:</span>
              <span className="font-semibold text-green-600">
                {Object.values(answers).filter(a => a !== null && a !== undefined).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Marked for Review:</span>
              <span className="font-semibold text-yellow-600">{markedForReview.size}</span>
            </div>
            <div className="flex justify-between">
              <span>Not Attempted:</span>
              <span className="font-semibold text-red-600">
                {questions.length - Object.values(answers).filter(a => a !== null && a !== undefined).length}
              </span>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Test</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Submit Now</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}