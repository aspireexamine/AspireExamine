import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Stream, Question, Difficulty, Paper, PracticeSubject, Chapter, Subject, TestSeries, Test, PracticeSection } from '@/types';
import { Plus, Edit, Trash2, HelpCircle, Search, FileCode } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getAdminDashboardData, addQuestion, updateQuestion, deleteQuestions } from '@/lib/supabaseQueries';

interface QuestionsManagementProps {
  streams: Stream[];
  setStreams: React.Dispatch<React.SetStateAction<Stream[]>>;
  onUpdate?: (updatedPaper: Paper) => void;
  paperContext?: Paper | null;
  allQuestionsFromFile?: Question[]; // New prop for all questions
  setAllQuestions?: React.Dispatch<React.SetStateAction<Question[]>>;
}

export function QuestionsManagement({ streams, setStreams, paperContext, onUpdate, setAllQuestions }: QuestionsManagementProps) {
  
  const allTestSeries = useMemo(() => streams.flatMap(s => s.testSeries || []), [streams]);
  
  
  
  
  // Use the new prop for the global question view, otherwise use paper-specific questions
  const allQuestions = useMemo(() => {
    // If managing a single paper, show only its own questions (deduped)
    if (paperContext) {
      const paperQs = paperContext.questions || [];
      return Array.from(new Map(paperQs.map(q => [q.id, q])).values());
    }

    const collectedQuestions: Question[] = [];

    streams.forEach(stream => {
      // Collect questions from subjects/chapters/papers
      stream.subjects.forEach(subject => {
        subject.chapters?.forEach((chapter: Chapter) => {
          chapter.papers?.forEach((paper: Paper) => {
            paper.questions?.forEach((question: Question) => {
              collectedQuestions.push(question);
            });
          });
        });
      });

      // Collect questions from practice sections
      stream.practiceSections?.forEach((ps: PracticeSection) => {
        ps.papers?.forEach((paper: Paper) => {
          paper.questions?.forEach((question: Question) => {
            collectedQuestions.push(question);
          });
        });
      });

      // Collect questions from test series
      stream.testSeries?.forEach((ts: TestSeries) => {
        ts.tests.forEach((test: Test) => {
          test.questions?.forEach((question: Question) => {
            collectedQuestions.push(question);
          });
        });
      });
    });

    // Remove duplicates based on question ID
    return Array.from(new Map(collectedQuestions.map(q => [q.id, q])).values());
  }, [streams, paperContext]);

  
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false); // New state for selection mode
  const [targetType, setTargetType] = useState<'stream_subject' | 'stream_practice' | 'test_series'>('stream_subject');
  const [selectedStreamId, setSelectedStreamId] = useState<string>('');
  const [selectedTestType, setSelectedTestType] = useState<string>('');
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const emptyFormData = {
    question: '',
    imageUrl: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    difficulty: 'Medium' as Difficulty,
    marks: 4,
    paperId: '',
    targetId: '', // Can be practiceSectionId or testSeriesId
    subjectId: '',
    chapterId: '',
    testId: '',
    filePath: '',
  };
  const [formData, setFormData] = useState(emptyFormData);

  const allSubjects = streams.flatMap(stream => stream.subjects);
  const selectedStream = useMemo(() => streams.find((s: Stream) => s.id === selectedStreamId), [streams, selectedStreamId]);
  const selectedTestSeries = useMemo(() => allTestSeries.find((ts: TestSeries) => ts.id === formData.targetId), [allTestSeries, formData.targetId]);
  const availablePracticeSections = useMemo(() => selectedStream?.practiceSections || [], [selectedStream]);
  const selectedPracticeSection = useMemo(() => selectedStream?.practiceSections?.find((ps: PracticeSection) => ps.id === formData.targetId), [selectedStream, formData.targetId]);
  const selectedSubjectForNesting = useMemo(() => selectedStream?.subjects.find((s: Subject) => s.id === formData.subjectId), [selectedStream, formData.subjectId]);
  const selectedChapterForNesting = useMemo(() => selectedSubjectForNesting?.chapters?.find((c: Chapter) => c.id === formData.chapterId), [selectedSubjectForNesting, formData.chapterId]);

  
  
  const isFormValid: boolean = useMemo(() => {
    if (!formData.question.trim() || formData.options.some(opt => !opt.trim())) return false;
    if (paperContext) return true; // If in paper context, we don't need to validate target
    return (targetType === 'stream_subject' && !!formData.paperId) || (targetType === 'stream_practice' && !!formData.paperId) || (targetType === 'test_series' && !!formData.testId);
  }, [formData, targetType, paperContext]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const resetSelections = () => {
    setSelectedStreamId('');
    setSelectedTestType('');
    setFormData(prev => ({ ...prev, paperId: '', targetId: '', subjectId: '', chapterId: '', testId: '' }));
  };

  const handleOpenDialog = (mode: 'create' | 'edit', question?: Question) => {
    setDialogMode(mode);
    setIsDialogOpen(true);

    if (mode === 'edit' && question) {
      setCurrentQuestion(question);

      // Find the full path for the question
      let streamId = '';
      let subjectId = '';
      let chapterId = '';
      let testSeriesId = '';
      let testId = '';
      let practiceSectionId = '';
      let foundTargetType: 'stream_subject' | 'stream_practice' | 'test_series' | null = null;

      for (const stream of streams) {
        // Check subjects
        for (const subject of stream.subjects) {
          for (const chapter of subject.chapters || []) {
            for (const paper of chapter.papers || []) {
              if (paper.questions?.some(q => q.id === question.id)) {
                streamId = stream.id;
                subjectId = subject.id;
                chapterId = chapter.id;
                foundTargetType = 'stream_subject';
                break;
              }
            }
            if (foundTargetType) break;
          }
          if (foundTargetType) break;
        }
        if (foundTargetType) break;

        // Check practice sections
        for (const ps of stream.practiceSections || []) {
          for (const paper of ps.papers || []) {
            if (paper.questions?.some(q => q.id === question.id)) {
              streamId = stream.id;
              practiceSectionId = ps.id;
              foundTargetType = 'stream_practice';
              break;
            }
          }
          if (foundTargetType) break;
        }
        if (foundTargetType) break;

        // Check test series
        for (const ts of stream.testSeries || []) {
          for (const test of ts.tests || []) {
            if ((test as any).questions?.some((q: Question) => q.id === question.id)) {
              streamId = stream.id;
              testSeriesId = ts.id;
              testId = test.id;
              foundTargetType = 'test_series';
              break;
            }
          }
          if (foundTargetType) break;
        }
        if (foundTargetType) break;
      }

      if (foundTargetType) {
        setTargetType(foundTargetType);
        setSelectedStreamId(streamId);
        setFormData({
          ...emptyFormData,
          ...question,
          subjectId,
          chapterId,
          paperId: question.paperId,
          targetId: practiceSectionId || testSeriesId,
          testId,
        });
      } else {
        setFormData({ ...emptyFormData, ...question });
      }

    } else { // Create mode
      setCurrentQuestion(null);
      resetSelections();
      setTargetType('stream_subject');
      if (paperContext) {
        const subject = allSubjects.find(s => s.id === paperContext.subjectId);
        if (subject) {
          const streamId = subject.streamId!;
          const chapter = subject.chapters?.find(c => c.papers?.some(p => p.id === paperContext.id));
          setSelectedStreamId(streamId);
          setFormData({
            ...emptyFormData,
            paperId: paperContext.id,
            subjectId: subject.id,
            chapterId: chapter?.id || '',
          });
          return;
        }
      }
      setFormData(emptyFormData);
    }
  };

  const handleDelete = async (questionIds: string[]) => {
    if (questionIds.length === 0) return;

    try {
      await deleteQuestions(questionIds);
      const fresh = await getAdminDashboardData();
      setStreams(fresh);
    if (setAllQuestions) {
      setAllQuestions(prev => prev.filter(q => !questionIds.includes(q.id)));
    }
      setSelectedQuestions(prev => prev.filter(id => !questionIds.includes(id)));
      toast.success(`${questionIds.length} question(s) deleted successfully!`);
    } catch (err) {
      console.error('Failed to delete questions', err);
      toast.error('Failed to delete questions.');
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid) {
      toast.error("Please fill all required fields, including the file destination.");
      return;
    }

    try {
      let filePath = 'Manual Entry';
      const selectedStreamName = streams.find((s: Stream) => s.id === selectedStreamId)?.name;

      if (targetType === 'stream_subject') {
        const selectedSubjectName = selectedStream?.subjects.find((s: Subject) => s.id === formData.subjectId)?.name;
        const selectedChapterName = selectedSubjectForNesting?.chapters?.find((c: Chapter) => c.id === formData.chapterId)?.name;
        const selectedPaperTitle = selectedChapterForNesting?.papers?.find((p: Paper) => p.id === formData.paperId)?.title;
        if (selectedStreamName && selectedSubjectName && selectedChapterName && selectedPaperTitle) {
          filePath = `${selectedStreamName} / ${selectedSubjectName} / ${selectedChapterName} / ${selectedPaperTitle}`;
        }
      } else if (targetType === 'stream_practice') {
        const selectedPracticeSectionName = selectedStream?.practiceSections?.find((ps: PracticeSection) => ps.id === formData.targetId)?.name;
        let practicePath = `${selectedStreamName} / ${selectedPracticeSectionName}`;
        if (selectedTestType === 'SUBJECT_WISE') {
          const selectedSubjectName = selectedStream?.subjects.find((s: Subject) => s.id === formData.subjectId)?.name;
          practicePath += ` / ${selectedTestType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} / ${selectedSubjectName}`;
        } else if (selectedTestType === 'CHAPTER_WISE' && selectedPracticeSection?.type === 'ALL_ROUND') {
          const selectedSubjectName = selectedStream?.subjects.find((s: Subject) => s.id === formData.subjectId)?.name;
          const selectedChapterName = selectedPracticeSection?.subjects.find((s: PracticeSubject) => s.id === formData.subjectId)?.chapters.find((c: Chapter) => selectedPracticeSection.papers.find((p: Paper) => p.title.endsWith(`- ${c.name}`))?.id === formData.paperId)?.name;
          practicePath += ` / ${selectedTestType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} / ${selectedSubjectName} / ${selectedChapterName}`;
        }
        const selectedPaperTitle = selectedPracticeSection?.papers.find((p: Paper) => p.id === formData.paperId)?.title;
        if (selectedPaperTitle) {
          practicePath += ` / ${selectedPaperTitle}`;
        }
        if (selectedStreamName && selectedPracticeSectionName) {
          filePath = practicePath;
        }
      } else if (targetType === 'test_series') {
        const selectedTestSeriesName = selectedStream?.testSeries?.find((ts: TestSeries) => ts.id === formData.targetId)?.name;
        const selectedTestName = selectedTestSeries?.tests.find((t: Test) => t.id === formData.testId)?.name;
        if (selectedStreamName && selectedTestSeriesName && selectedTestName) {
          filePath = `${selectedStreamName} / ${selectedTestSeriesName} / ${selectedTestName}`;
        }
      }

      const payload = {
        paperId: paperContext ? paperContext.id : (targetType !== 'test_series' ? (formData.paperId || null) : null),
        testId: targetType === 'test_series' ? (formData.testId || null) : null,
          question: formData.question,
          imageUrl: formData.imageUrl,
          options: formData.options,
          correctAnswer: formData.correctAnswer,
          explanation: formData.explanation,
          difficulty: formData.difficulty,
          subject: allSubjects.find(sub => sub.id === formData.subjectId)?.name || 'Unknown',
          topic: 'General',
          marks: formData.marks,
          filePath: filePath,
      } as any;

      if (dialogMode === 'edit' && currentQuestion?.id) {
        await updateQuestion({ id: currentQuestion.id, ...payload });
        } else {
        // Prevent exceeding question limit for paperContext
        if (paperContext && (paperContext.questions?.length || 0) >= paperContext.total_questions) {
            toast.error(`Paper "${paperContext.title}" has reached its question limit.`);
          return;
        }
        await addQuestion(payload);
      }

      const fresh = await getAdminDashboardData();
      setStreams(fresh);
      toast.success(`Question ${dialogMode === 'create' ? 'created' : 'updated'} successfully!`);
      setIsDialogOpen(false);

    } catch (error) {
      console.error("Error during question save:", error);
      toast.error("Failed to save question. Please try again.");
    }
  };

  const filteredQuestions = allQuestions.filter(question => {
    if (!question) return false;
    const searchTermLower = searchTerm.toLowerCase();
    return (
      question.question?.toLowerCase().includes(searchTermLower) ||
      question.subject?.toLowerCase().includes(searchTermLower) ||
      question.topic?.toLowerCase().includes(searchTermLower)
    );
  });

  const isQuestionInPaper = (questionId: string) => {
    return paperContext?.questions?.some(q => q.id === questionId) ?? false;
  }

  const handleToggleQuestionInPaper = (question: Question) => {
    if (!paperContext || !onUpdate) return;

    let updatedQuestions;
    const existingQuestions = paperContext.questions || [];
    const isInPaper = isQuestionInPaper(question.id);

    if (isInPaper) {
      updatedQuestions = existingQuestions.filter(q => q.id !== question.id);
    } else {
      if (existingQuestions.length >= paperContext.total_questions) {
        toast.error("This paper has reached its question limit.");
        return;
      }
      updatedQuestions = [...existingQuestions, question];
    }
    
    const updatedPaper = { ...paperContext, questions: updatedQuestions };
    onUpdate(updatedPaper);
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQuestions(filteredQuestions.map(q => q.id));
    } else {
      setSelectedQuestions([]);
    }
  };


  return (
    <div className="space-y-6">
      {!paperContext && (
        <div className="flex gap-2"> {/* Added gap-2 for spacing */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button onClick={() => handleOpenDialog('create')} className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Create Question
            </Button>
            {/* Create/Edit Dialog remains largely the same but is now for global questions */}
            <DialogContent className="max-w-3xl">
              {/* ... Dialog content for creating global questions ... */}
            </DialogContent>
          </Dialog>
          {isSelectionMode ? (
            <Button variant="outline" onClick={() => { setIsSelectionMode(false); setSelectedQuestions([]); }} className="gap-2 w-full sm:w-auto">
              Cancel Selection
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setIsSelectionMode(true)} className="gap-2 w-full sm:w-auto">
              Mark Selection
            </Button>
          )}
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={paperContext ? "Search this paper's questions..." : "Search all questions..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {selectedQuestions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-muted/50">
            <CardContent className="p-3 flex items-center justify-between">
              <p className="text-sm font-medium">{selectedQuestions.length} question(s) selected</p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Selected
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the {selectedQuestions.length} selected questions.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(selectedQuestions)}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </motion.div>
      )}
      {/* Questions List */}
      <div className="grid gap-4">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Card className={`border-2 hover:shadow-lg transition-all duration-200 ${paperContext && isQuestionInPaper(question.id) ? 'border-primary/50' : ''}`}>
                <CardHeader className="p-3 sm:p-4">
                  <div className="space-y-3">
                    {/* Top row with badges and actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-1.5 mb-2">
                          {isSelectionMode && (
                            <Checkbox
                              id={`select-${question.id}`}
                              checked={selectedQuestions.includes(question.id)}
                              onCheckedChange={(checked) => {
                                setSelectedQuestions(prev => checked ? [...prev, question.id] : prev.filter(id => id !== question.id));
                              }}
                              aria-label={`Select question ${question.id}`} 
                              className="flex-shrink-0"
                            />
                          )}
                          {paperContext && (
                             <Badge variant={isQuestionInPaper(question.id) ? 'default' : 'outline'} className="text-xs">
                               {isQuestionInPaper(question.id) ? 'In Paper' : 'Available'}
                             </Badge>
                          )}
                          <Badge className={`text-xs ${
                            question.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                            question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                          }`}>
                            {question.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">{question.marks}m</Badge>
                        </div>
                        {question.filePath && (
                          <Badge variant="secondary" className="text-xs gap-1 mb-2">
                            <FileCode className="h-3 w-3" />
                            <span className="truncate max-w-[200px] sm:max-w-none">{question.filePath}</span>
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {paperContext && (
                          <Button variant="ghost" size="sm" onClick={() => handleToggleQuestionInPaper(question)} className="text-xs px-2 py-1 h-auto">
                            {isQuestionInPaper(question.id) ? 'Remove' : 'Add'}
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog('edit', question)} className="h-8 w-8">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 h-8 w-8">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this question.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete([question.id])}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    {/* Question text */}
                    <CardTitle className="text-sm sm:text-base leading-relaxed break-words">{question.question}</CardTitle>
                    {question.imageUrl && (
                      <div className="mt-2">
                        <img src={question.imageUrl} alt="Question visual" className="rounded-md max-h-32 sm:max-h-48 object-contain w-full"/>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {question.options.map((option: string, optionIndex: number) => (
                      <div 
                        key={optionIndex}
                        className={`p-2 rounded border text-xs sm:text-sm ${
                          optionIndex === question.correctAnswer
                            ? 'border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300'
                            : 'border-border bg-muted/30'
                        }`}
                      >
                        <span className="font-semibold mr-1">({String.fromCharCode(65 + optionIndex)})</span>
                        <span className="break-words">{option}</span>
                      </div>
                    ))}
                  </div>
                  {question.explanation && (
                    <div className="mt-3 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs sm:text-sm">
                      <div className="flex items-center gap-2 mb-1 sm:mb-2">
                        <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                        <span className="font-medium text-blue-600 text-xs sm:text-sm">Explanation</span>
                      </div>
                      <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 break-words">{question.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">No questions found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms." : "Create a question to get started."}
            </p>
          </div>
        )}
        {filteredQuestions.length > 0 && !paperContext && isSelectionMode && (
          <div className="flex items-center gap-4 p-4 border-t">
            <Checkbox
              id="select-all"
              checked={selectedQuestions.length === filteredQuestions.length && filteredQuestions.length > 0}
              onCheckedChange={(checked) => handleSelectAll(!!checked)}
            />
            <Label htmlFor="select-all" className="text-sm font-medium">
              Select all ({filteredQuestions.length})
            </Label>
          </div>
        )}
      </div>
      
      
      {/* Dialog for editing/creating questions */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="p-3 sm:p-4 pb-0 flex-shrink-0">
            <DialogTitle className="text-base sm:text-lg">{dialogMode === 'create' ? 'Create New Question' : 'Edit Question'}</DialogTitle>
            <DialogDescription className="text-sm">
              {dialogMode === 'create' ? 'Fill in the form to create a new question.' : 'Update the question details.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4 py-2 flex-1 overflow-y-auto px-3 sm:px-4 hide-scrollbar">
              <div>
                <Label htmlFor="question" className="text-sm">Question Text</Label>
                <Textarea id="question" value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} placeholder="Enter the question statement..."/>
              </div>
              <div>
                <Label htmlFor="imageUrl" className="text-sm">Image URL (Optional)</Label>
                <Input id="imageUrl" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://example.com/diagram.png"/>
              </div>
              <div className="space-y-3">
                <Label className="text-sm">Options</Label>
                {formData.options.map((option, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={formData.correctAnswer === index ? "default" : "outline"} className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 flex items-center justify-center text-xs">{String.fromCharCode(65 + index)}</Badge>
                      <span className="text-sm font-medium">Option {String.fromCharCode(65 + index)}</span>
                    </div>
                    <Input value={option} onChange={(e) => handleOptionChange(index, e.target.value)} placeholder={`Enter option ${String.fromCharCode(65 + index)}`} className="w-full"/>
                    <Button variant={formData.correctAnswer === index ? "default" : "outline"} size="sm" className="w-full sm:w-auto text-xs px-3" onClick={() => setFormData({ ...formData, correctAnswer: index })}>
                      {formData.correctAnswer === index ? '✓ Correct Answer' : 'Set as Correct'}
                    </Button>
                  </div>
                ))}
              </div>
              <div>
                <Label htmlFor="explanation" className="text-sm">Explanation (Optional)</Label>
                <Textarea id="explanation" value={formData.explanation} onChange={(e) => setFormData({ ...formData, explanation: e.target.value })} placeholder="Explain why this is the correct answer..." className="min-h-20"/>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t">
                <div>
                  <Label htmlFor="difficulty-meta" className="text-sm">Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="marks" className="text-sm">Marks</Label>
                  <Input id="marks" type="number" value={formData.marks} onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) || 4 })} placeholder="4"/>
                </div>
              </div>
              {/* File Destination Selector */}
              {!paperContext && (
                <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t">
                  <h3 className="text-sm sm:text-base font-medium">File Destination</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="destination-type-select">Import Into</Label>
                      <Select value={targetType} onValueChange={(value) => { setTargetType(value as any); resetSelections(); }}>
                        <SelectTrigger id="destination-type-select"><SelectValue placeholder="Select Target..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stream_subject">Stream → Subject</SelectItem>
                          <SelectItem value="stream_practice">Stream → PYQ/Practice</SelectItem>
                          <SelectItem value="test_series">Test Series</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="stream-select-q">Stream</Label>
                      <Select value={selectedStreamId} onValueChange={id => { setSelectedStreamId(id); setFormData(prev => ({ ...prev, subjectId: '', chapterId: '', paperId: '', targetId: '', testId: '' })); }}>
                        <SelectTrigger id="stream-select-q"><SelectValue placeholder="Select Stream..." /></SelectTrigger>
                        <SelectContent>{streams.map((s: Stream) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>

                  {targetType === 'stream_subject' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t">
                      <div>
                        <Label htmlFor="subject-select-q">Subject</Label>
                        <Select value={formData.subjectId} onValueChange={id => setFormData(prev => ({ ...prev, subjectId: id, chapterId: '', paperId: '' }))} disabled={!selectedStreamId}>
                          <SelectTrigger id="subject-select-q"><SelectValue placeholder="Select Subject..." /></SelectTrigger>
                          <SelectContent>{selectedStream?.subjects.map((s: Subject) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="chapter-select-q">Chapter</Label>
                        <Select value={formData.chapterId} onValueChange={id => setFormData(prev => ({ ...prev, chapterId: id, paperId: '' }))} disabled={!formData.subjectId}>
                          <SelectTrigger id="chapter-select-q"><SelectValue placeholder="Select Chapter..." /></SelectTrigger>
                          <SelectContent>{selectedSubjectForNesting?.chapters?.map((c: Chapter) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="paper-select-q">Paper</Label>
                        <Select value={formData.paperId} onValueChange={id => setFormData({ ...formData, paperId: id })} disabled={!formData.chapterId}>
                          <SelectTrigger id="paper-select-q"><SelectValue placeholder="Select Paper..." /></SelectTrigger>
                          <SelectContent>{selectedChapterForNesting?.papers?.map((p: Paper) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {targetType === 'stream_practice' && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 mt-2 border-t">
                      <div>
                        <Label htmlFor="practice-section-select">Target</Label>
                        <Select value={formData.targetId} onValueChange={id => { setFormData(prev => ({ ...prev, targetId: id, subjectId: '', paperId: '' })); setSelectedTestType(''); }}>
                          <SelectTrigger id="practice-section-select"><SelectValue placeholder="Select Practice Session..." /></SelectTrigger>
                          <SelectContent>
                            {availablePracticeSections.map((ps: PracticeSection) => <SelectItem key={ps.id} value={ps.id}>{ps.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="test-type-select">Test Type</Label>
                        <Select value={selectedTestType} onValueChange={setSelectedTestType} disabled={!formData.targetId}>
                          <SelectTrigger id="test-type-select"><SelectValue placeholder="Select Test Type..." /></SelectTrigger>
                          <SelectContent> 
                            {selectedPracticeSection?.type === 'ALL_ROUND' && selectedPracticeSection?.allRoundTypes?.map((type: string) => (
                              <SelectItem key={type} value={type}>{type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedTestType === 'SUBJECT_WISE' && (
                        <div>
                          <Label htmlFor="subject-select-import">Subject</Label>
                          <Select value={formData.subjectId} onValueChange={id => setFormData({ ...formData, subjectId: id })}>
                            <SelectTrigger id="subject-select-import"><SelectValue placeholder="Select Subject..." /></SelectTrigger>
                            <SelectContent>{selectedStream?.subjects.map((s: Subject) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      )}
                      {selectedTestType === 'CHAPTER_WISE' && (
                        <div>
                          <Label htmlFor="subject-select-import">Subject</Label>
                          <Select value={formData.subjectId} onValueChange={id => setFormData({ ...formData, subjectId: id })}>
                            <SelectTrigger id="subject-select-import"><SelectValue placeholder="Select Subject..." /></SelectTrigger>
                            <SelectContent>                            {selectedPracticeSection?.type === 'ALL_ROUND' && selectedPracticeSection?.subjects?.map((s: PracticeSubject) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}

                  {targetType === 'test_series' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 mt-2 border-t">
                      <div>
                        <Label htmlFor="test-series-select">Test Series</Label>
                        <Select value={formData.targetId} onValueChange={id => setFormData(prev => ({ ...prev, targetId: id, testId: '' }))} disabled={!selectedStreamId}>
                          <SelectTrigger id="test-series-select"><SelectValue placeholder="Select Test Series..." /></SelectTrigger>
                          <SelectContent>{selectedStream?.testSeries?.map((ts: TestSeries) => <SelectItem key={ts.id} value={ts.id}>{ts.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="test-select">Test</Label>
                        <Select value={formData.testId} onValueChange={id => setFormData({ ...formData, testId: id })} disabled={!formData.targetId}>
                          <SelectTrigger id="test-select"><SelectValue placeholder="Select Test..." /></SelectTrigger>
                          <SelectContent>{selectedTestSeries?.tests.map((t: Test) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                   {targetType === 'stream_practice' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 mt-2 border-t">
                      {selectedTestType === 'CHAPTER_WISE' && formData.subjectId && (
                      <div>
                        <Label htmlFor="chapter-select-import">Chapter</Label>
                        <Select value={formData.paperId} onValueChange={id => setFormData({ ...formData, paperId: id })}>
                          <SelectTrigger id="chapter-select-import"><SelectValue placeholder="Select Chapter..." /></SelectTrigger>
                          <SelectContent>{selectedPracticeSection?.type === 'ALL_ROUND' && selectedPracticeSection?.subjects?.find((s: PracticeSubject) => s.id === formData.subjectId)?.chapters?.map((c: Chapter) => <SelectItem key={c.id} value={selectedPracticeSection?.papers?.find((p: Paper) => p.title.endsWith(`- ${c.name}`))?.id || ''}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      )}
                      {(selectedTestType === 'FULL_SYLLABUS' || (selectedTestType === 'SUBJECT_WISE' && formData.subjectId)) && (
                      <div>
                        <Label htmlFor="paper-select-import">Year</Label>
                        <Select value={formData.paperId} onValueChange={id => setFormData({ ...formData, paperId: id })}>
                          <SelectTrigger id="paper-select-import"><SelectValue placeholder="Select Year..." /></SelectTrigger>
                          <SelectContent>
                            {selectedPracticeSection?.papers
                              ?.filter((p: Paper) => {
                                if (selectedTestType === 'FULL_SYLLABUS') {
                                  return /^Full Syllabus\s*-\s*\d{4}$/.test(p.title || '');
                                }
                                // SUBJECT_WISE
                                return p.subject_id === formData.subjectId && /\s-\s*\d{4}$/.test(p.title || '');
                              })
                              .map((p: Paper) => (
                                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      )}
                    </div>)}
                </div>
              )}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 sm:pt-4 border-t flex-shrink-0">
                <Button onClick={handleSubmit} className="w-full sm:w-auto" disabled={!isFormValid}>
                  {dialogMode === 'create' ? 'Create Question' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
              </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}