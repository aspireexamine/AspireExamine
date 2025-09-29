import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Star, 
  StarOff, 
  Download, 
  Share, 
  Edit,
  Book,
  FileText,
  StickyNote,
  CreditCard,
  Network,
  HelpCircle,
  Calendar,
  Tag,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  BookmarkPlus,
  BookmarkMinus,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  LibraryItem, 
  GeneratedContent, 
  Notebook,
  NotesContent,
  SummaryContent,
  FlashcardContent,
  MindmapContent,
  QuestionContent
} from '@/types';

interface LibraryContentViewerProps {
  item: LibraryItem;
  onBack: () => void;
  onToggleFavorite: (itemId: string) => void;
}

export function LibraryContentViewer({ item, onBack, onToggleFavorite }: LibraryContentViewerProps) {
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  const isGeneratedContent = item.type === 'generated-content';
  const generatedContent = isGeneratedContent ? item.content as GeneratedContent : null;
  const notebook = !isGeneratedContent ? item.content as Notebook : null;

  const getContentIcon = () => {
    if (!isGeneratedContent) return Book;
    
    switch (generatedContent?.type) {
      case 'notes':
        return StickyNote;
      case 'summary':
        return FileText;
      case 'flashcards':
        return CreditCard;
      case 'mindmap':
        return Network;
      case 'questions':
        return HelpCircle;
      default:
        return FileText;
    }
  };

  const getContentTypeColor = () => {
    if (!isGeneratedContent) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
    
    switch (generatedContent?.type) {
      case 'notes':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'summary':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'flashcards':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'mindmap':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
      case 'questions':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderNotebookContent = () => {
    if (!notebook) return null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Notebook Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">
                This is a notebook from your library. Click the link below to access the full content.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Access Link</h3>
              <a 
                href={notebook.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                {notebook.url}
              </a>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Uploaded</h3>
              <p className="text-muted-foreground">{formatDate(notebook.uploadedAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderNotesContent = (notes: NotesContent) => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{notes.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {notes.sections.map((section, index) => (
              <div key={index} className="space-y-3">
                <h3 className="text-lg font-semibold text-primary">{section.heading}</h3>
                <p className="text-foreground whitespace-pre-wrap">{section.content}</p>
                {section.subSections && section.subSections.map((subSection, subIndex) => (
                  <div key={subIndex} className="ml-4 space-y-2">
                    <h4 className="text-base font-medium">{subSection.heading}</h4>
                    <p className="text-foreground whitespace-pre-wrap">{subSection.content}</p>
                  </div>
                ))}
              </div>
            ))}
            
            {notes.keyPoints.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Key Points</h3>
                <ul className="space-y-2">
                  {notes.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {notes.references && notes.references.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">References</h3>
                <ul className="space-y-1">
                  {notes.references.map((ref, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {ref}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSummaryContent = (summary: SummaryContent) => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Overview</h3>
              <p className="text-foreground whitespace-pre-wrap">{summary.overview}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Key Points</h3>
              <ul className="space-y-2">
                {summary.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Main Topics</h3>
              <div className="flex flex-wrap gap-2">
                {summary.mainTopics.map((topic, index) => (
                  <Badge key={index} variant="secondary">{topic}</Badge>
                ))}
              </div>
            </div>
            
            {summary.conclusion && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Conclusion</h3>
                <p className="text-foreground whitespace-pre-wrap">{summary.conclusion}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderFlashcardsContent = (flashcards: FlashcardContent[]) => {
    const currentCard = flashcards[currentFlashcardIndex];
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Flashcards</span>
              <span className="text-sm font-normal text-muted-foreground">
                {currentFlashcardIndex + 1} of {flashcards.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="min-h-[200px] flex items-center justify-center">
              <Card className="w-full max-w-md">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <Badge variant="outline">{currentCard.category || 'General'}</Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-4">
                    {showFlashcardAnswer ? 'Answer' : 'Question'}
                  </h3>
                  <p className="text-foreground whitespace-pre-wrap">
                    {showFlashcardAnswer ? currentCard.back : currentCard.front}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
              >
                {showFlashcardAnswer ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showFlashcardAnswer ? 'Show Question' : 'Show Answer'}
              </Button>
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentFlashcardIndex(Math.max(0, currentFlashcardIndex - 1));
                  setShowFlashcardAnswer(false);
                }}
                disabled={currentFlashcardIndex === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentFlashcardIndex(Math.min(flashcards.length - 1, currentFlashcardIndex + 1));
                  setShowFlashcardAnswer(false);
                }}
                disabled={currentFlashcardIndex === flashcards.length - 1}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderMindmapContent = (mindmap: MindmapContent) => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{mindmap.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              <Network className="h-12 w-12 mx-auto mb-4" />
              <p>Mind map visualization would be displayed here</p>
              <p className="text-sm mt-2">Central Topic: {mindmap.centralTopic}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderQuestionsContent = (questions: QuestionContent[]) => {
    const currentQuestion = questions[selectedQuestionIndex];
    const [answers, setAnswers] = useState<Record<string, number | null>>({});
    const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
    const [showExplanation, setShowExplanation] = useState(false);
    
    const handleAnswerSelect = (optionIndex: number) => {
      const questionId = currentQuestion.id;
      setAnswers(prev => {
        if (prev[questionId] === optionIndex) {
          return { ...prev, [questionId]: null };
        }
        return { ...prev, [questionId]: optionIndex };
      });
    };

    const handleMarkForReview = () => {
      const questionId = currentQuestion.id;
      setMarkedForReview(prev => {
        const newSet = new Set(prev);
        if (newSet.has(questionId)) {
          newSet.delete(questionId);
        } else {
          newSet.add(questionId);
        }
        return newSet;
      });
    };

    const isMarked = markedForReview.has(currentQuestion.id);
    const selectedAnswer = answers[currentQuestion.id] as number | undefined;
    const isCorrect = selectedAnswer !== undefined && currentQuestion.correctAnswer === selectedAnswer;
    const isIncorrect = selectedAnswer !== undefined && currentQuestion.correctAnswer !== selectedAnswer;
    
    return (
      <div className="min-h-screen bg-background">
        {/* Header Bar */}
        <header className="sticky top-0 z-20 border-b px-2 sm:px-4 py-2 flex items-center justify-between bg-background">
          <div className="flex items-center gap-2 text-sm sm:text-base">
            <h1 className="hidden sm:block text-lg font-bold truncate">Practice Questions</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant={showExplanation ? "default" : "outline"}
              size="sm"
              onClick={() => setShowExplanation(!showExplanation)}
            >
              {showExplanation ? 'Hide' : 'Show'} Explanation
            </Button>
          </div>
        </header>

        <div className="container mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6 pt-4">
          {/* Question Area */}
          <div className="space-y-4 sm:space-y-6">
            <motion.div
              key={selectedQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 px-1 sm:px-0">
                <div className="flex items-center gap-1 text-[11px] sm:text-xs font-medium rounded-full bg-muted px-2 py-0.5 sm:px-2.5 sm:py-1">
                  <span>Difficulty:</span>
                  <span className="font-bold capitalize">{currentQuestion.difficulty}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] sm:text-xs font-medium rounded-full bg-muted px-2 py-0.5 sm:px-2.5 sm:py-1 capitalize">
                  <span>Type:</span>
                  <span className="font-semibold">{currentQuestion.type}</span>
                </div>
              </div>

              <Card>
                <CardHeader className="border-b p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-1 sm:gap-2">
                    <div className="flex items-center gap-2 text-base sm:text-lg font-bold">
                      <div className="text-xs sm:text-sm font-semibold bg-muted text-muted-foreground rounded-md px-2 py-1 sm:px-2.5 sm:py-1.5">
                        {selectedQuestionIndex + 1}/{questions.length} 
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Button
                        variant={isMarked ? "secondary" : "outline"}
                        size="sm"
                        onClick={handleMarkForReview}
                        className="gap-1 h-8 px-2 sm:px-3 text-xs sm:text-sm"
                      >
                        {isMarked ? <BookmarkMinus className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
                        {isMarked ? 'Unmark' : 'Mark'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert leading-snug sm:leading-relaxed">
                    <p className="text-sm sm:text-base">{currentQuestion.question}</p>
                  </div>
                  
                  {currentQuestion.options && (
                    <RadioGroup
                      value={selectedAnswer?.toString() || ''}
                      onValueChange={(value) => handleAnswerSelect(parseInt(value, 10))}
                      className="space-y-2"
                    >
                      {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedAnswer === index;
                        const isCorrectAnswer = currentQuestion.correctAnswer === index;

                        return (
                          <Label 
                            key={index}
                            className={`relative flex items-center space-x-3 p-2.5 sm:p-3 rounded-lg border transition-colors cursor-pointer ${
                              showExplanation && isCorrectAnswer ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                              showExplanation && isSelected && !isCorrectAnswer ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                              isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                            }`}
                          >
                            <RadioGroupItem 
                              value={index.toString()} 
                              id={`option-${index}`}
                            />
                            <span className="flex-1 text-xs sm:text-sm leading-relaxed">
                              {option} 
                            </span>
                            {showExplanation && isCorrectAnswer && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
                            {showExplanation && isSelected && !isCorrectAnswer && <XCircle className="h-5 w-5 text-red-500 ml-auto" />}
                          </Label>
                        );
                      })}
                    </RadioGroup>
                  )}
                  
                  {showExplanation && currentQuestion.explanation && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="mt-4 p-3 bg-muted rounded-lg space-y-1 text-sm"
                    >
                      <h3 className="font-semibold">Explanation:</h3>
                      <p className="text-muted-foreground">{currentQuestion.explanation}</p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4 gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedQuestionIndex(Math.max(0, selectedQuestionIndex - 1))}
                disabled={selectedQuestionIndex === 0}
                className="gap-1 sm:gap-2 px-3 sm:px-4 h-9"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => handleAnswerSelect(selectedAnswer as number)}
                disabled={selectedAnswer === undefined || selectedAnswer === null}
                className="h-9 px-3 sm:px-4"
              >
                Uncheck
              </Button>
              
              <Button
                onClick={() => setSelectedQuestionIndex(Math.min(questions.length - 1, selectedQuestionIndex + 1))}
                disabled={selectedQuestionIndex === questions.length - 1}
                className="gap-1 sm:gap-2 px-3 sm:px-4 h-9"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGeneratedContent = () => {
    if (!generatedContent) return null;

    const { content } = generatedContent;

    switch (generatedContent.type) {
      case 'notes':
        return content.notes ? renderNotesContent(content.notes) : null;
      case 'summary':
        return content.summary ? renderSummaryContent(content.summary) : null;
      case 'flashcards':
        return content.flashcards ? renderFlashcardsContent(content.flashcards) : null;
      case 'mindmap':
        return content.mindmap ? renderMindmapContent(content.mindmap) : null;
      case 'questions':
        return content.questions ? renderQuestionsContent(content.questions) : null;
      default:
        return null;
    }
  };

  const Icon = getContentIcon();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{item.title}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={getContentTypeColor()}>
                  {isGeneratedContent ? generatedContent?.type : 'Notebook'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDate(item.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleFavorite(item.id)}
          >
            {item.isFavorite ? (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon">
            <Share className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isGeneratedContent ? renderGeneratedContent() : renderNotebookContent()}
    </div>
  );
}
