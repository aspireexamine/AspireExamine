import { useState, useMemo, Fragment, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  StreamCard
} from './StreamCard';
import { SubjectCard } from './SubjectCard';
import { PaperCard } from './PaperCard';
import { TestModeSwitcher } from '../test/TestModeSwitcher';
import { ExamInterface } from './ExamInterface';
import { ResultsPage } from './ResultsPage';
import { ProfilePage } from './ProfilePage'; 
import { StudentSidebar } from './StudentSidebar';
import { StreamCarousel } from './StreamCarousel';

import { Stream, Subject, Paper, Result, User, PracticeSection, PracticeSubject, Chapter, Difficulty } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion";
import { 
  ArrowLeft, 
  Book,
  Library,
  FileText,
  ChevronRight,
  Trophy, 
  Clock, 
  Target,
  AlertTriangle,
  TrendingUp,
  TestTube2,
} from 'lucide-react'; 
import FolderAnimation from '../Folder';
import { NotebookFolder } from '@/types'; 
import { motion, AnimatePresence } from 'framer-motion'; // Keep this import

export type ViewState = 
  | 'streams' 
  | 'subjects' 
  | 'papers' 
  | 'chapters'
  | 'exam' 
  | 'exam-review'
  | 'results' 
  | 'profile' 
  | 'practiceSection'
  | 'practiceSubject'
  | 'practiceChapter'
  | 'notebooks' 
  | 'notebooks-folder'
  | 'tests';

interface StudentDashboardProps {
  user: User;
  streams: Stream[];
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  notebookFolders: NotebookFolder[];
  onAddResult: (result: Result) => void;
  onProfileUpdate: () => void;
}
export function StudentDashboard({ user, streams, currentView, setCurrentView, onAddResult, notebookFolders, onProfileUpdate }: StudentDashboardProps) {
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [currentResult, setCurrentResult] = useState<Result | null>(null);
  const [examStartTime, setExamStartTime] = useState<number>(0);
  const [selectedNotebookFolder, setSelectedNotebookFolder] = useState<NotebookFolder | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // New state for practice sessions
  const [selectedPracticeSection, setSelectedPracticeSection] = useState<PracticeSection | null>(null);
  const [practiceType, setPracticeType] = useState<'FULL' | 'SUBJECT' | 'CHAPTER' | null>(null);
  const [practiceSubject, setPracticeSubject] = useState<Subject | PracticeSubject | null>(null);
  const [showNoQuestionsAlert, setShowNoQuestionsAlert] = useState(false);

  // Mock recent activity for the dashboard overview
  const recentTests = user.results || [];

  const allPapersForStream = useMemo(() => {
    const papersFromSubjects = streams.flatMap(s => s.subjects.flatMap(sub => sub.papers || []));
    const papersFromPracticeSections = streams.flatMap(s => s.practiceSections?.flatMap(ps => ps.papers || []) || []);
    const papersFromTestSeries = streams.flatMap(s => s.testSeries?.flatMap(ts => ts.tests.flatMap(t => t.questions ? [{ id: t.id, title: t.name, questions: t.questions, subject_id: 'mock-test', duration: t.duration, total_questions: t.numQuestions, max_marks: t.numQuestions * 4, difficulty: 'Medium' as Difficulty, attempts: 0, created_at: new Date().toISOString() }] : []) || []) || []);

    // Combine all papers and ensure uniqueness by ID
    const combinedPapers = [...papersFromSubjects, ...papersFromPracticeSections, ...papersFromTestSeries] as Paper[];
    const uniquePapers = Array.from(new Map(combinedPapers.map(paper => [paper.id, paper])).values());
    return uniquePapers;
  }, [streams]);

  const handleStreamSelect = (stream: Stream) => {
    setSelectedStream(stream);
    setCurrentView('subjects');
    try {
      if (window.location.pathname === '/student') {
        window.history.pushState({ studentView: 'subjects', streamId: stream.id }, document.title);
      }
    } catch {}
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    if (subject.chapters && subject.chapters.length > 0) {
      setCurrentView('chapters');
    } else {
      // Fallback for subjects without chapters
      setCurrentView('papers');
    }
    try {
      if (window.location.pathname === '/student') {
        window.history.pushState({ studentView: subject.chapters?.length ? 'chapters' : 'papers', streamId: selectedStream?.id, subjectId: subject.id }, document.title);
      }
    } catch {}
  };
  
  const handlePracticeSectionSelect = (section: PracticeSection) => {
    setSelectedPracticeSection(section);
    setSelectedStream(streams.find(s => s.practiceSections?.some(ps => ps.id === section.id)) || null); // Correctly find the stream
    // This view will now show the three options
    setCurrentView('practiceSection'); 
  };

  const handlePracticeTypeSelect = (type: 'FULL' | 'SUBJECT' | 'CHAPTER') => {
    setPracticeType(type);
    if (type === 'FULL' && selectedPracticeSection) {
      // const fullSyllabusPapers = selectedPracticeSection.papers.filter(p => (p as any).subject_id === 'full-syllabus');
      // You might want to do something with these papers here, like setting a state for them.
    } else {
      setCurrentView('practiceSubject'); // Move to subject selection
    }
  };

  const handlePracticeSubjectSelect = (subject: Subject | PracticeSubject) => {
    setPracticeSubject(subject);
    if (practiceType === 'CHAPTER') {
      setCurrentView('practiceChapter');
    }
    // For SUBJECT type, we stay in 'practiceSubject' view to show years
  };

  const handleChapterSelect = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setCurrentView('papers');
    try {
      if (window.location.pathname === '/student') {
        window.history.pushState({ studentView: 'papers', streamId: selectedStream?.id, subjectId: selectedSubject?.id, chapterId: chapter.id }, document.title);
      }
    } catch {}
  };

  const handlePaperStart = (paper: Paper) => {
    if (!paper.questions || paper.questions.length === 0) {
      setShowNoQuestionsAlert(true);
      return;
    }
    setSelectedPaper(paper);
    setExamStartTime(Date.now());
    setCurrentView('exam');
  };

  const handleTestStart = (test: any, series: any) => {
    if (!test.questions || test.questions.length === 0) {
      setShowNoQuestionsAlert(true);
      return;
    }
    const testPaper: Paper = {
      id: test.id,
      title: `${series.name} - ${test.name}`,
      subject_id: 'mock-test',
      duration: test.duration,
      total_questions: test.numQuestions,
      max_marks: test.numQuestions * 4,
      difficulty: 'Medium', // Could be dynamic in the future
      attempts: 0,
      created_at: new Date().toISOString(),
      questions: test.questions
    } as any;
    handlePaperStart(testPaper);
  }

  const handleExamSubmit = (answers: Record<string, number | null>, perQuestionTimings: Record<string, number>) => {
    if (!selectedPaper || !selectedPaper.questions) return;

    const paperQuestions = selectedPaper.questions;
    const answeredEntries = Object.entries(answers).filter(([, answer]) => answer !== null);
    const correctAnswers = answeredEntries.filter(([questionId, answer]) => {
      const question = paperQuestions.find(q => q.id === questionId); // This assumes questionId from answers matches question.id
      return question && question.correctAnswer === answer;
    }).length;

    const totalQuestions = paperQuestions.length;
    const unanswered = totalQuestions - answeredEntries.length;
    const wrongAnswers = answeredEntries.length - correctAnswers;
    const score = (correctAnswers * 4) - wrongAnswers;
    const percentage = totalQuestions > 0 ? (score / (totalQuestions * 4)) * 100 : 0;

    const result: Result = {
      id: Date.now().toString(),
      examSessionId: 'session-1',
      userId: user.id,
      paperId: selectedPaper!.id,
      score,
      totalMarks: totalQuestions * 4,
      percentage,
      timeTaken: Math.floor((Date.now() - examStartTime) / 1000),
      correctAnswers,
      wrongAnswers,
      unanswered,
      createdAt: new Date().toISOString(),
      answers: answers,
      perQuestionTimings,
    };

    setCurrentResult(result);
    onAddResult(result);
    setCurrentView('results');
  };

  const handleReviewTest = (result: Result) => {
    console.log("handleReviewTest called with result:", result);
    let paperToReview: Paper | undefined;

    // First, try to use the currently selected paper if its ID matches the result's paperId
    if (selectedPaper && selectedPaper.id === result.paperId) {
      paperToReview = selectedPaper;
      console.log("Using selectedPaper for review:", paperToReview.id, "Questions count:", paperToReview.questions?.length);
    } else {
      // If not, try to find it in the comprehensive list
      paperToReview = allPapersForStream.find(p => p.id === result.paperId);
      if (paperToReview) {
        console.log("Found paper in allPapersForStream:", paperToReview.id, "Questions count:", paperToReview.questions?.length);
      }
    }

    if (paperToReview && paperToReview.questions && paperToReview.questions.length > 0) {
      setSelectedPaper(paperToReview);
      setCurrentView('exam-review');
    } else {
      console.error("Paper not found for review or has no questions:", result.paperId, paperToReview);
      // Optionally, add a toast notification here for the user
      // toast.error("Could not find the test paper for review or it has no questions.");
    }
  };

  const handleFolderClick = (folder: NotebookFolder | null) => {
    setSelectedNotebookFolder(folder);
    setCurrentView('notebooks-folder');
  };

  const navigateToHome = () => {
    setCurrentView('streams');
    setSelectedStream(null);
    setSelectedSubject(null);
    setSelectedPaper(null);
    setSelectedChapter(null);
    setSelectedPracticeSection(null);
    setPracticeType(null);
    setPracticeSubject(null);
    setSelectedNotebookFolder(null);
  };

  const handleBackNavigation = () => {
    try {
      if (window.location.pathname === '/student' && window.history.length > 1) {
        window.history.back();
        return;
      }
    } catch {}
    if (currentView === 'subjects' || currentView === 'practiceSection' || currentView === 'notebooks' || currentView === 'tests') {
      navigateToHome();
    } else if (currentView === 'papers') {
      if (selectedChapter) {
        setCurrentView('chapters');
        setSelectedChapter(null);
      } else {
        setCurrentView('subjects');
        setSelectedSubject(null);
      }
    } else if (currentView === 'chapters') {
      setCurrentView('subjects');
      setSelectedSubject(null);
    } else if (currentView === 'practiceSubject') {
      setPracticeSubject(null);
      setPracticeType(null);
      setCurrentView('practiceSection'); 
    } else if (currentView === 'practiceChapter') {
      setCurrentView('practiceSubject');
    } else if (currentView === 'exam') {
      // Go back to the most relevant previous view
      if (practiceType) setCurrentView('practiceSection');
      else if (selectedChapter) setCurrentView('chapters');
      else setCurrentView('papers');
      setSelectedPaper(null);
    } else if (currentView === 'results' || currentView === 'profile' || currentView === 'exam-review') {
      navigateToHome();
    } else if (currentView === 'notebooks-folder') {
      setCurrentView('notebooks');
      setSelectedNotebookFolder(null);
    }
  };

  const getBreadcrumbs = () => {
    const breadcrumbs: string[] = [];
    if (currentView === 'profile') return ['Profile'];
    if (currentView === 'notebooks') return ['Notebooks'];
    if (currentView === 'tests') return ['Test Series'];
    
    if (currentView === 'notebooks-folder' && selectedNotebookFolder) return ['Notebooks', selectedNotebookFolder.name];
    if (selectedStream) breadcrumbs.push(selectedStream.name);
    if (selectedSubject) breadcrumbs.push(selectedSubject.name);
    if (selectedChapter) breadcrumbs.push(selectedChapter.name);
    if (selectedPaper) breadcrumbs.push(selectedPaper.title);
    if (selectedPracticeSection && currentView !== 'practiceSection') {
      breadcrumbs.push(selectedPracticeSection.name);
      if (practiceType === 'SUBJECT' && practiceSubject) breadcrumbs.push(practiceSubject.name);
      if (practiceType === 'CHAPTER' && practiceSubject) breadcrumbs.push(practiceSubject.name);
    }

    return breadcrumbs;
  };

  const viewTitles: Partial<Record<ViewState, string>> = {
    streams: "Home",
    notebooks: "Notebooks",
    'notebooks-folder': selectedNotebookFolder?.name || 'Notebooks',
    tests: "Test Series",
  };

  if (currentView === 'exam' && selectedPaper) {
    return <TestModeSwitcher paper={selectedPaper} questions={selectedPaper.questions || []} onSubmit={handleExamSubmit} onExit={handleBackNavigation} />;
  }
  if (currentView === 'results' && currentResult) {
    return <ResultsPage result={currentResult} onGoHome={navigateToHome} onReviewTest={() => handleReviewTest(currentResult)} />;
  } 
  console.log("StudentDashboard render - currentView:", currentView, "currentResult:", !!currentResult, "selectedPaper:", !!selectedPaper);
  if (currentView === 'exam-review' && currentResult && selectedPaper) {
    return <ExamInterface
      paper={selectedPaper}
      questions={selectedPaper.questions || []}
      reviewData={{ answers: (currentResult as any).answers || {}, timeTaken: currentResult.timeTaken, perQuestionTimings: (currentResult as any).perQuestionTimings || {} }} />;
  }
  if (currentView === 'profile') {
    return <ProfilePage user={user} onProfileUpdate={onProfileUpdate} recentTests={recentTests} allPapers={allPapersForStream as Paper[]} />;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <StudentSidebar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'streams') {
            navigateToHome();
          } else {
            setCurrentView(view);
          }
          try {
            if (window.location.pathname === '/student') {
              window.history.pushState({ studentView: view, streamId: selectedStream?.id, subjectId: selectedSubject?.id, chapterId: selectedChapter?.id }, document.title);
            }
          } catch {}
        }} />
      <main className="flex-1 p-2 sm:p-6 lg:p-8 overflow-y-auto bg-muted/30">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {currentView !== 'streams' ? (
              <Button variant="ghost" size="icon" onClick={handleBackNavigation} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
            ) : null}
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-foreground">
              {viewTitles[currentView] || getBreadcrumbs().slice(-1)[0] || 'Dashboard'}
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <span>Dashboard</span>
            {getBreadcrumbs().map((crumb, index) => (
              <Fragment key={index}>
                <ChevronRight className="h-4 w-4" />
                <span>{crumb}</span>
              </Fragment>
            ))}
          </div>
        </div>

        <AlertDialog open={showNoQuestionsAlert} onOpenChange={setShowNoQuestionsAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/50">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                </div>
                <AlertDialogTitle>No Questions Available</AlertDialogTitle>
              </div>
            </AlertDialogHeader>
            <AlertDialogDescription>
              This test section is currently empty. Please check back later or contact an administrator.
            </AlertDialogDescription>
            <AlertDialogAction onClick={() => setShowNoQuestionsAlert(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>

        <AnimatePresence mode="wait">
          {currentView === 'streams' && (
            <motion.div
              key="streams"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-xs text-muted-foreground mb-3">Welcome back, {user.name}!</p>
              
              <section className="mb-4">
                <h2 className="mb-2 text-base font-bold text-foreground flex items-center gap-2">
                  <Book className="h-4 w-4"/> 
                  Choose Your Exam Stream
                </h2>
                {isMobile ? (
                  <StreamCarousel streams={streams} onStreamSelect={handleStreamSelect} />
                ) : (
                  <div className="flex gap-3 sm:gap-6 pb-3 -mx-2 sm:-mx-6 lg:-mx-8 px-2 sm:px-6 lg:px-8">
                    {streams.map((stream, index) => (
                      <motion.div
                        key={stream.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        className="flex-shrink-0 w-48 sm:w-72"
                      >
                        <StreamCard 
                          key={stream.id} 
                          stream={stream} 
                          onClick={() => handleStreamSelect(stream)} 
                          subjectsClassName="hidden sm:flex"
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
              
              {/* Quick Stats */}
              <section className={`mb-6 ${isMobile ? 'mt-8' : ''}`}>
                <h2 className="mb-2 text-base font-bold text-foreground flex items-center gap-2" suppressHydrationWarning>
                  <TrendingUp className="h-4 w-4"/> 
                  Your Progress at a Glance
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  <Card className="border-2 hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => setCurrentView('profile')}>
                    <CardContent className="p-2 sm:pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base sm:text-2xl font-bold">{recentTests.length}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Tests Taken</p>
                        </div>
                        <Target className="h-5 w-5 sm:h-8 sm:w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-2 hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => setCurrentView('profile')}>
                    <CardContent className="p-2 sm:pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base sm:text-2xl font-bold">85%</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Best Score</p>
                        </div>
                        <Trophy className="h-5 w-5 sm:h-8 sm:w-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-2 hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => setCurrentView('profile')}>
                    <CardContent className="p-2 sm:pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base sm:text-2xl font-bold">12h</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Study Time</p>
                        </div>
                        <Clock className="h-5 w-5 sm:h-8 sm:w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-2 hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => setCurrentView('profile')}>
                    <CardContent className="p-2 sm:pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base sm:text-2xl font-bold">+15%</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Improvement</p>
                        </div>
                        <TrendingUp className="h-5 w-5 sm:h-8 sm:w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

            </motion.div>
          )}

          {currentView === 'notebooks' && (
            <motion.div
              key="notebooks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-8 space-y-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
                {(notebookFolders || []).map((folder, index) => (
                  <motion.div
                    key={folder.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => handleFolderClick(folder)}
                  >
                    <FolderAnimation />
                    <span className="mt-2 text-sm font-medium text-center">{folder.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {currentView === 'notebooks-folder' && selectedNotebookFolder && (
            <motion.div
              key="notebooks-folder"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-8 space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedNotebookFolder.notebooks.map((notebook, index) => (
                  <motion.div
                    key={notebook.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <a href={notebook.url} target="_blank" rel="noopener noreferrer" className="block h-full">
                      <Card className="cursor-pointer hover:shadow-lg hover:border-primary transition-all group h-full">
                        <CardHeader className="items-center text-center">
                          <Book className="h-10 w-10 text-primary mb-3" />
                          <CardTitle className="text-sm group-hover:text-primary">{notebook.name}</CardTitle>
                        </CardHeader>
                      </Card>
                    </a>
                  </motion.div>
                ))}
              </div>
              {selectedNotebookFolder.notebooks.length === 0 && (
                <p className="text-center text-muted-foreground py-8">This folder is empty.</p>
              )}
            </motion.div>
          )}

          {currentView === 'tests' && (
            <motion.div
              key="tests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">Select a test series to view available mock tests.</p>
              </div>

              <div className="space-y-6">
                {streams.map(stream => (stream.testSeries || []).length > 0 && (
                  <section key={stream.id} className="space-y-4">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <TestTube2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      {stream.name} Test Series
                    </h2>
                    <Accordion type="multiple" className="w-full space-y-4">
                      {(stream.testSeries || []).map(series => (
                        <AccordionItem value={series.id} key={series.id} className="border-none">
                          <Card className="overflow-hidden transition-all hover:shadow-md">
                            <AccordionTrigger className="p-3 sm:p-4 bg-muted/50 hover:no-underline hover:bg-muted/80">
                              <div className="flex flex-col items-start text-left">
                                <CardTitle className="text-base sm:text-lg">{series.name}</CardTitle>
                                <CardDescription className="mt-1 text-xs sm:text-sm">{series.description}</CardDescription>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-0">
                               <div className="divide-y divide-border">
                                {series.tests.map((test, index) => (
                                  <motion.div
                                    key={test.id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.2 }}
                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 hover:bg-muted/50 gap-2"
                                  >
                                    <div className="font-medium text-sm sm:text-base">{test.name}</div>
                                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground w-full sm:w-auto">
                                      <span className="flex items-center gap-1.5"><Target className="h-3 w-3 sm:h-4 sm:w-4" /> {test.numQuestions} Qs</span>
                                      <span className="flex items-center gap-1.5"><Clock className="h-3 w-3 sm:h-4 sm:w-4" /> {test.duration} min</span>
                                      <div className="flex-grow"></div>
                                      <Button size="sm" onClick={() => handleTestStart(test, series)} className="h-8 w-full sm:w-auto">Start Test</Button>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </AccordionContent>
                          </Card>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </section>
                ))}
              </div>
            </motion.div>
          )}
          
          {currentView === 'practiceSection' && selectedPracticeSection && selectedStream && (
            <motion.div
              key="practice-section-detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            > 
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">{selectedPracticeSection.name}</h2>
                <p className="text-muted-foreground text-sm sm:text-base">{selectedPracticeSection.description}</p>
              </div>
              
              {/* Practice Type Selection */}
              {!practiceType ? (
                <div className="grid gap-4 md:grid-cols-3">                  
                    {selectedPracticeSection.type === 'ALL_ROUND' && selectedPracticeSection.allRoundTypes.includes('FULL_SYLLABUS') && <Card className="cursor-pointer hover:shadow-lg" onClick={() => handlePracticeTypeSelect('FULL')}><CardHeader><CardTitle className="text-base sm:text-lg">Full Syllabus PYQ Test</CardTitle></CardHeader></Card>}
                    {selectedPracticeSection.type === 'ALL_ROUND' && selectedPracticeSection.allRoundTypes.includes('SUBJECT_WISE') && <Card className="cursor-pointer hover:shadow-lg" onClick={() => handlePracticeTypeSelect('SUBJECT')}><CardHeader><CardTitle className="text-base sm:text-lg">Subject-wise PYQ Test</CardTitle></CardHeader></Card>}
                    {selectedPracticeSection.type === 'ALL_ROUND' && selectedPracticeSection.allRoundTypes.includes('CHAPTER_WISE') && <Card className="cursor-pointer hover:shadow-lg" onClick={() => handlePracticeTypeSelect('CHAPTER')}><CardHeader><CardTitle className="text-base sm:text-lg">Chapter-wise PYQ Test</CardTitle></CardHeader></Card>}
                    {selectedPracticeSection.type === 'TEST_SERIES' && selectedPracticeSection.papers.map((paper) => (
                        <Card key={paper.id} className="cursor-pointer hover:shadow-lg" onClick={() => handlePaperStart(paper)}>
                            <CardHeader><CardTitle className="text-base sm:text-lg">{paper.title}</CardTitle></CardHeader>
                        </Card>
                    ))}
                </div>
              ) : (
                <>
                  {/* Full Syllabus Year Selection */}
                  {practiceType === 'FULL' && selectedPracticeSection.type === 'ALL_ROUND' && (
                      <div className="space-y-6">
                          {Object.entries(
                              selectedPracticeSection.papers
                                  .filter(p => (p as any).subject_id === 'full-syllabus')
                                  .reduce((acc, paper) => {
                                      const year = paper.title.match(/\b\d{4}\b/)?.[0] || 'Uncategorized';
                                      if (!acc[year]) acc[year] = [];
                                      acc[year].push(paper);
                                      return acc;
                                  }, {} as Record<string, Paper[]>)
                          )
                          .sort(([yearA], [yearB]) => yearB.localeCompare(yearA))
                          .map(([year, papers]) => (
                              <div key={year}>
                                  <Accordion type="single" collapsible className="w-full" defaultValue={year}>
                                    <AccordionItem value={year}>
                                      <AccordionTrigger className="text-xl sm:text-2xl font-bold">{year} Papers</AccordionTrigger>
                                      <AccordionContent>
                                        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 pt-4">
                                          {papers.map((paper, index) => (
                                            <motion.div key={paper.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.4 }}>
                                              <PaperCard paper={paper} onStart={() => handlePaperStart(paper)} />
                                            </motion.div>
                                          ))}
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  </Accordion>
                              </div>
                          ))}
                      </div>
                  )}

                  {/* Subject-wise Year Selection */}
                  {practiceType === 'SUBJECT' && practiceSubject && selectedPracticeSection.type === 'ALL_ROUND' && (
                      <div className="mt-8">
                          <h3 className="text-xl sm:text-2xl font-bold mb-4">Select Year for {practiceSubject.name}</h3>
                          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                              {selectedPracticeSection.papers.filter(p => (p as any).subject_id === (practiceSubject as Subject).id).map((paper, index) => (
                                  <motion.div key={paper.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.4 }}>
                                      <PaperCard paper={paper} onStart={() => handlePaperStart(paper)} />
                                  </motion.div>
                              ))}
                          </div>
                      </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {currentView === 'practiceSubject' && selectedStream && (
            <motion.div
              key="practice-subject"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Select a Subject</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(practiceType === 'SUBJECT' ? selectedStream.subjects : selectedPracticeSection?.type === 'ALL_ROUND' && selectedPracticeSection.allRoundTypes.includes('CHAPTER_WISE') ? selectedPracticeSection.subjects : []).map((subject, index) => (
                  <motion.div key={subject.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.4 }}>
                    <SubjectCard subject={subject} onClick={() => handlePracticeSubjectSelect(subject)} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {currentView === 'practiceChapter' && practiceSubject && (
            <motion.div
              key="practice-chapter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Select a Chapter from {practiceSubject.name}</h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {(practiceSubject as PracticeSubject).chapters.map((chapter, index) => (
                  <motion.div key={chapter.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.4 }}>
                    <Card
                      className="cursor-pointer hover:shadow-lg hover:border-primary transition-all group"
                      onClick={() => {
                        const chapterPaper = selectedPracticeSection?.papers.find(p => p.title.endsWith(chapter.name));
                        if (chapterPaper) handlePaperStart(chapterPaper);
                      }}>
                      <CardContent className="p-3 sm:p-4 flex items-center justify-between">
                        <span className="font-semibold text-sm sm:text-base group-hover:text-primary">{chapter.name}</span>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {currentView === 'subjects' && selectedStream && (
            <motion.div
              key="subjects"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <section>
                <h3 className="mb-4 text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2"><Book className="h-5 w-5 sm:h-6 sm:w-6"/> Subjects</h3>
                <div className="flex gap-4 sm:gap-6 pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
                  {selectedStream.subjects.map((subject, index) => (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      className="flex-shrink-0 w-64 sm:w-72"
                    >
                      <SubjectCard subject={subject} onClick={() => handleSubjectSelect(subject)} />
                    </motion.div>
                  ))}
                </div>
             </section>

              {selectedStream.practiceSections && selectedStream.practiceSections.length > 0 && (
                <section className="mt-6 sm:mt-12">
                  <div className="mb-4 sm:mb-6 border-t pt-6 sm:pt-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
                      <Library className="h-6 w-6 sm:h-7 sm:w-7 text-primary" /> 
                      <span>Practice Sections</span>
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">Specialized sections for targeted practice and previous year questions.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {selectedStream.practiceSections.map((section) => (
                      <motion.div key={section.id} whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                        <Card 
                          className="flex items-center justify-between p-4 sm:p-5 cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group"
                          onClick={() => handlePracticeSectionSelect(section)}
                        >
                          <div>
                            <CardTitle className="text-base font-bold group-hover:text-primary">{section.name}</CardTitle>
                            <CardDescription className="mt-1 text-xs sm:text-sm">{section.description}</CardDescription>
                          </div>
                           <div className="text-sm text-primary font-semibold flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                View Section <ChevronRight className="h-4 w-4 ml-1" />
                           </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          )}

          {currentView === 'chapters' && selectedSubject && (
            <motion.div
              key="chapters"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Chapters in {selectedSubject.name}</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Select a chapter to view practice papers.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {(selectedSubject.chapters || [])
                  .sort((a, b) => (a.serial || 0) - (b.serial || 0))
                  .map((chapter, index) => (
                  <motion.div key={chapter.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.4 }}>
                    <Card className="cursor-pointer hover:shadow-lg hover:border-primary transition-all group" onClick={() => handleChapterSelect(chapter)}>
                      <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-4">
                        <span className="font-semibold text-sm sm:text-base group-hover:text-primary flex-grow">
                          <span className="text-muted-foreground mr-2">{chapter.serial}.</span>{chapter.name}
                        </span>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {(selectedSubject.chapters || []).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No chapters available for this subject yet.</p>
                )}
              </div>
            </motion.div>
          )}

          {currentView === 'papers' && selectedSubject && (
            <motion.div
              key="papers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">{selectedChapter ? selectedChapter.name : selectedSubject.name} Papers</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Choose a practice paper to begin your test</p>
              </div>

              {/* Show papers associated with the selected chapter */}
              {selectedChapter && selectedChapter.papers && selectedChapter.papers.length > 0 ? (
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {selectedChapter.papers.map((paper: Paper, index: number) => (
                    <motion.div
                      key={paper.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                      <PaperCard paper={paper} onStart={() => handlePaperStart(paper)} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="border-2 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No papers available yet</h3>
                    <p className="text-muted-foreground text-center mb-6">
                      Papers for {selectedChapter ? selectedChapter.name : selectedSubject.name} are being prepared. Check back soon! 📚
                    </p>
                    <Button variant="outline" onClick={handleBackNavigation}>
                      Choose Another Subject
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

