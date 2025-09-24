import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  EyeOff
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
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Practice Questions</span>
              <span className="text-sm font-normal text-muted-foreground">
                {selectedQuestionIndex + 1} of {questions.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{currentQuestion.difficulty}</Badge>
                <Badge variant="secondary">{currentQuestion.type}</Badge>
              </div>
              
              <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
              
              {currentQuestion.options && (
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </div>
                  ))}
                </div>
              )}
              
              {currentQuestion.explanation && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Explanation</h4>
                  <p className="text-foreground">{currentQuestion.explanation}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setSelectedQuestionIndex(Math.max(0, selectedQuestionIndex - 1))}
                disabled={selectedQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedQuestionIndex(Math.min(questions.length - 1, selectedQuestionIndex + 1))}
                disabled={selectedQuestionIndex === questions.length - 1}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
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
