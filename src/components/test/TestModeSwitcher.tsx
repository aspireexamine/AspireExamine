import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Paper, Question } from '@/types';
import { ExamInterface } from '../student/ExamInterface';
import { ShieldCheck, BookOpen, CheckCircle, XCircle, ChevronRight, ArrowLeft, ChevronLeft as ChevronLeftIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';

interface TestModeSwitcherProps {
  paper: Paper;
  questions: Question[];
  onSubmit: (answers: Record<string, number | null>, perQuestionTimings: Record<string, number>) => void;
  onExit: () => void;
}

const PracticeInterface = ({ paper, questions, onExit, onBackToSelect }: { paper: Paper, questions: Question[], onExit: () => void, onBackToSelect: () => void }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      if (!submitted) {
        setTimeTaken(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted]);

  const resetForNextQuestion = useCallback(() => {
    setSelectedOption(null);
    setSubmitted(false);
    setTimeTaken(0);
  }, []);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      resetForNextQuestion();
    } else {
      onBackToSelect(); // Redirect to home/dashboard
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      resetForNextQuestion();
    }
  };
  const handleSubmit = () => {
    if (selectedOption !== null) {
      setSubmitted(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={onBackToSelect} className="gap-1 px-2 h-8"><ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back</span></Button>
          <div className="text-center flex-1">
            <h1 className="text-base sm:text-lg font-bold truncate">{paper.title}</h1>
            <p className="text-xs text-muted-foreground">Practice Mode</p>
          </div>
          <Button size="sm" onClick={onExit} className="h-8">End</Button>
        </div>

        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row justify-between items-center border-b">
              <div className="text-sm font-semibold bg-muted text-muted-foreground rounded-md px-2.5 py-1.5">
                {currentQuestionIndex + 1}/{questions.length}
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-600 font-sans font-medium">
                <span>{formatTime(timeTaken)}</span>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 space-y-4">
              <p className="text-sm sm:text-base leading-snug sm:leading-relaxed">{currentQuestion.question}</p>
              {currentQuestion.imageUrl && <img src={currentQuestion.imageUrl} alt="Question" className="max-w-full rounded-md border" />}
              
              <RadioGroup
                value={selectedOption?.toString()}
                onValueChange={(value) => setSelectedOption(parseInt(value))}
                disabled={submitted}
                className="space-y-2"
              >
                {currentQuestion.options.map((option, index) => {
                  const isCorrect = index === currentQuestion.correctAnswer;
                  const isSelected = index === selectedOption;
                  return (
                    <Label 
                      key={index}
                      className={cn( "flex items-center space-x-3 p-2.5 sm:p-3 rounded-lg border transition-all",
                        submitted && isCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20",
                        submitted && isSelected && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-900/20",
                        !submitted && "cursor-pointer hover:bg-muted/50",
                        !submitted && isSelected && "border-primary bg-primary/5"
                      )}
                    >
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">{option}</span>
                      {submitted && isCorrect && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
                      {submitted && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-500 ml-auto" />}
                    </Label>
                  );
                })}
              </RadioGroup>

              {submitted && ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-muted rounded-lg space-y-1">
                  <h3 className="font-semibold">Explanation:</h3>
                  <p className="text-sm text-muted-foreground">{currentQuestion.explanation || "No explanation provided."}</p>
                </motion.div>
              )}

              <div className="flex justify-between items-center pt-2 gap-2">
                <Button onClick={handlePrevious} variant="outline" size="sm" className="gap-2 h-9" disabled={currentQuestionIndex === 0}>
                  <ChevronLeftIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                {!submitted && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedOption(null)}
                    disabled={selectedOption === null}
                    className="h-9 px-3 sm:px-4"
                  >
                    Uncheck
                  </Button>
                )}

                {submitted ? (
                  <Button onClick={handleNext} size="sm" className="gap-2 h-9">
                    {currentQuestionIndex === questions.length - 1 ? 'Finish Practice' : 'Next Question'}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} size="sm" disabled={selectedOption === null} className="h-9">Submit</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export function TestModeSwitcher({ paper, questions, onSubmit, onExit }: TestModeSwitcherProps) {
  const [mode, setMode] = useState<'select' | 'test' | 'practice'>('select');

  if (mode === 'test') {
    return <ExamInterface paper={paper} questions={questions} onSubmit={onSubmit} />;
  }

  if (mode === 'practice') {
    return <PracticeInterface paper={paper} questions={questions} onExit={onExit} onBackToSelect={onExit} />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl"
      >
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-bold">Choose Your Mode</CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground">How would you like to attempt this paper?</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 sm:p-4">
            <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card 
                onClick={() => setMode('test')} 
                className="p-3 sm:p-4 cursor-pointer hover:border-primary hover:shadow-lg transition-all"
              >
                <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-2" />
                <h3 className="text-base sm:text-lg font-semibold mb-1">Test Mode</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Simulate a real exam with a timer and final scoring.
                </p>
              </Card>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card 
                onClick={() => setMode('practice')} 
                className="p-3 sm:p-4 cursor-pointer hover:border-green-500 hover:shadow-lg transition-all"
              >
                <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-green-500 mx-auto mb-2" />
                <h3 className="text-base sm:text-lg font-semibold mb-1">Practice Mode</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Get instant feedback and explanations after each question.
                </p>
              </Card>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}