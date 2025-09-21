import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Paper, Stream, Subject, Chapter, YearEntry, PracticeSubject, Test, Difficulty } from '@/types';
import { QuestionsManagement } from './QuestionsManagement'; // We can reuse this
import { Plus, Edit, Trash2, FileText, Clock, Target, Users, Search, AlertTriangle, Folder } from 'lucide-react';
import { getAdminDashboardData, addPaper, updatePaper, deletePaper } from '@/lib/supabaseQueries';
import { supabase } from '@/lib/supabaseClient';

interface PapersManagementProps {
  streams: Stream[];
  setStreams: React.Dispatch<React.SetStateAction<Stream[]>>;
}

const emptyFormData: {
  title: string,
  stream_id: string,
  subject_id: string,
  chapter_id: string,
  duration: number | string,
  total_questions: number | string,
  max_marks: number | string,
  difficulty: Difficulty,
  importTarget: 'stream_subject' | 'test_series' | string,
  practiceSectionId: string,
  testSeriesId: string,
  practiceTestType?: 'FULL_SYLLABUS' | 'SUBJECT_WISE' | 'CHAPTER_WISE' | '',
  practiceTargetPaperId?: string,
  practiceSubjectId?: string,
} = {
  title: '',
  stream_id: '',
  subject_id: '',
  chapter_id: '',
  duration: 180,
  total_questions: 100,
  max_marks: 400,
  difficulty: 'Medium',
  importTarget: 'stream_subject',
  practiceSectionId: '',
  testSeriesId: '',
  practiceTestType: '',
  practiceTargetPaperId: '',
  practiceSubjectId: '',
};

export function PapersManagement({ streams, setStreams }: PapersManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [paperToDelete, setPaperToDelete] = useState<Paper | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [managingQuestionsFor, setManagingQuestionsFor] = useState<Paper | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  
  const [formData, setFormData] = useState(emptyFormData);

  const refetchData = async () => {
    const data = await getAdminDashboardData();
    setStreams(data);
  };

  const allPapers = useMemo(() => streams.flatMap(s => 
    s.subjects.flatMap(sub => 
      sub.chapters?.flatMap(c => c.papers || []) || [])
  ), [streams]);
  const allSubjects: Subject[] = streams.flatMap(stream => stream.subjects);

  const selectedStream = useMemo(() => streams.find(s => s.id === formData.stream_id), [streams, formData.stream_id]);
  // Practice import removed; handled under Streams Management
  const availableSubjects = useMemo(() => selectedStream?.subjects || [], [selectedStream]);
  const selectedSubject = useMemo(() => availableSubjects.find(s => s.id === formData.subject_id), [availableSubjects, formData.subject_id]);
  const availableTestSeries = useMemo(() => selectedStream?.testSeries || [], [selectedStream]);
  

  const practiceSessionStructure = useMemo(() => {
    const structure = [];
    for (const stream of streams) {
      for (const section of stream.practiceSections || []) {
        if (section.type !== 'ALL_ROUND') continue;

        const sectionNode: any = {
          id: section.id,
          name: section.name,
          papers: [],
          fullSyllabus: null,
          subjectWise: null,
          chapterWise: null,
        };

        if (section.allRoundTypes.includes('FULL_SYLLABUS')) {
          sectionNode.fullSyllabus = (section.years || []).map((entry: YearEntry) => ({
            year: entry.year,
            papers: section.papers.filter(p => p.subject_id === 'full-syllabus' && p.title.includes(entry.year)),
          })).filter(y => y.papers.length > 0);
        }

        if (section.allRoundTypes.includes('SUBJECT_WISE')) {
          sectionNode.subjectWise = Object.entries(section.subjectWiseData || {}).map(([subjectId, yearEntries]) => {
            const subject = stream.subjects.find(s => s.id === subjectId);
            return {
              subjectId,
              subjectName: subject?.name || 'Unknown Subject',
              years: (yearEntries as YearEntry[]).map(entry => ({
                year: entry.year,
                papers: section.papers.filter(p => p.subject_id === subjectId && p.title.includes(entry.year)),
              })).filter(y => y.papers.length > 0),
            };
          }).filter(s => s.years.length > 0);
        }

        if (section.allRoundTypes.includes('CHAPTER_WISE')) {
          sectionNode.chapterWise = (section.subjects || []).map((subject: PracticeSubject) => ({
            subjectId: subject.id,
            subjectName: subject.name,
            chapters: (subject.chapters || []).map((chapter: Chapter) => ({
              chapterId: chapter.id,
              chapterName: chapter.name,
              paper: section.papers.find(p => p.title.endsWith(`- ${chapter.name}`)),
            })).filter((c: { paper: Paper | undefined; }) => c.paper),
          })).filter(s => s.chapters.length > 0);
        }
        structure.push(sectionNode);
      }
    }
    return structure;
  }, [streams]);

  const testSeriesStructure = useMemo(() => {
    const structure: { id: string; name: string; tests: Test[]; }[] = [];
    for (const stream of streams) {
      for (const ts of stream.testSeries || []) {
        structure.push({
          id: ts.id,
          name: ts.name,
          tests: ts.tests || [],
        });
      }
    }
    return structure;
  }, [streams]);
  
  const handleOpenModal = (paper: Paper | null) => {
    if (paper) {
      setEditingPaper(paper);
      setFormData({
        title: paper.title,
        stream_id: paper.stream_id || '',
        chapter_id: paper.chapter_id || '',
        subject_id: paper.subject_id,
        duration: String(paper.duration),
        total_questions: String(paper.total_questions),
        max_marks: String(paper.max_marks),
        difficulty: paper.difficulty,
        importTarget: 'stream_subject', // Default for existing papers
        practiceSectionId: '',
        testSeriesId: '',
      });
    } else {
      setEditingPaper(null);
      setFormData(emptyFormData);
    }
    setIsModalOpen(true);
  };

  const handleStreamChange = (stream_id: string) => {
    setFormData({ ...formData, stream_id, subject_id: '', chapter_id: '', testSeriesId: '' });
  };

  const handleSubmit = async () => {
    const { importTarget, stream_id, subject_id, chapter_id, testSeriesId, title, duration, total_questions, max_marks, difficulty } = formData;

    const isStreamSubjectValid = importTarget === 'stream_subject' && subject_id && chapter_id;
    const isTestSeriesValid = importTarget === 'test_series' && formData.testSeriesId;

    if (!title || !stream_id || !duration || !total_questions || !max_marks) {
      console.error("Please fill all required paper details.");
      return;
    }

    if (!isStreamSubjectValid && !isTestSeriesValid) {
      console.error("Please select a valid import target and fill its required fields.");
      return;
    }

    if (importTarget === 'test_series') {
        if (!testSeriesId) {
            console.error("Please select a test series.");
            return;
        }
        const testData = {
            name: title,
            numquestions: parseInt(String(total_questions)),
            duration: parseInt(String(duration)),
            test_series_id: testSeriesId,
        };
        await supabase.from('tests').insert(testData);
    } else {
        const paperData: any = {
          title,
          duration: parseInt(String(duration)),
          total_questions: parseInt(String(total_questions)),
          max_marks: parseInt(String(max_marks)),
          difficulty: difficulty,
          stream_id: stream_id,
        };

        if (importTarget === 'stream_subject') {
            paperData.subject_id = subject_id;
            paperData.chapter_id = chapter_id;
        }

        if (editingPaper) {
          await updatePaper({ ...editingPaper, ...paperData });
        } else {
          await addPaper(paperData);
        }

        // no-op here for stream_subject
    }

    await refetchData();
    setIsModalOpen(false);
  };

  const handleDeletePaper = async () => {
    if (paperToDelete) {
      await deletePaper(paperToDelete.id);
      await refetchData();
      setPaperToDelete(null);
    }
  };

  const handleManageQuestions = (paper: Paper) => {
    setManagingQuestionsFor(paper);
    setIsQuestionModalOpen(true);
  };

  const handleQuestionsUpdate = async (updatedPaper: Paper) => {
    await updatePaper(updatedPaper);
    await refetchData();
    setManagingQuestionsFor(updatedPaper);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) { 
      case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-500/20';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 border-yellow-500/20';
      case 'Hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border-red-500/20';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 border-gray-500/20';
    }
  };

  const PaperRow = ({ paper }: { paper: Paper }) => {
    const subject = allSubjects.find((s: Subject) => s.id === paper.subject_id);
    const isTest = (paper as any).numQuestions !== undefined && paper.subject_id === '';

    return <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell className="font-medium pl-4 sm:pl-8 text-sm">{paper.title}</TableCell>
      <TableCell className="hidden md:table-cell"><Badge variant="outline">{isTest ? 'Test Series' : (subject?.name || 'Full Syllabus')}</Badge></TableCell>
      <TableCell className="hidden lg:table-cell"><div className="flex items-center gap-1 text-muted-foreground text-xs"><Clock className="h-3 w-3" />{paper.duration}m</div></TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-muted-foreground text-xs">
          <Target className="h-3 w-3" />{paper.questions?.length || 0} / {isTest ? (paper as any).numQuestions : paper.total_questions}
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell"><Badge className={`${getDifficultyColor(paper.difficulty)} text-xs`}>{paper.difficulty}</Badge></TableCell>
      <TableCell className="hidden lg:table-cell"><div className="flex items-center gap-1 text-muted-foreground text-xs"><Users className="h-3 w-3" />{paper.attempts}</div></TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-0 sm:gap-1">
          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => handleManageQuestions(paper)}>
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Manage Qs</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(paper)}><Edit className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => setPaperToDelete(paper)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </TableCell>
    </TableRow>;
  };

  return (
    <div className="space-y-6">
      <div className="flex">
        <Button onClick={() => handleOpenModal(null)} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Create Paper
        </Button>
      </div>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">{editingPaper ? 'Edit Paper' : 'Create New Paper'}</DialogTitle>
            <DialogDescription>
              {editingPaper ? 'Update the details for this examination paper.' : 'Set up a new examination paper with questions and timing.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <Label htmlFor="title">Paper Title</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Physics Mock Test 1" className="h-9 mt-1"/>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <Label htmlFor="import-target-select">Import Into</Label>
                <Select value={formData.importTarget} onValueChange={(value) => setFormData(f => ({ ...f, importTarget: value as any }))}>
                  <SelectTrigger id="import-target-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stream_subject">Stream → Subject</SelectItem>
                    <SelectItem value="test_series">Test Series</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="stream">Stream</Label>
                <Select value={formData.stream_id} onValueChange={handleStreamChange}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select stream" /></SelectTrigger>
                  <SelectContent>
                    {streams.map((stream) => <SelectItem key={stream.id} value={stream.id}>{stream.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.importTarget === 'stream_subject' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t animate-in fade-in-0">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={formData.subject_id} onValueChange={(value) => setFormData({ ...formData, subject_id: value, chapter_id: '' })} disabled={!formData.stream_id}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {availableSubjects.map((subject) => 
                        <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="chapter">Chapter</Label>
                  <Select value={formData.chapter_id} onValueChange={(value) => setFormData({ ...formData, chapter_id: value })} disabled={!formData.subject_id}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select chapter" /></SelectTrigger>
                    <SelectContent>
                      {(selectedSubject?.chapters || []).map((chapter) => 
                        <SelectItem key={chapter.id} value={chapter.id}>{chapter.name}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {/* Practice import removed; use Streams Management for practice papers */}

            {formData.importTarget === 'test_series' && (
              <div className="grid grid-cols-1 gap-4 pt-4 border-t animate-in fade-in-0">
                <div>
                  <Label htmlFor="test-series">Test Series</Label>
                  <Select value={formData.testSeriesId} onValueChange={(value) => setFormData(f => ({ ...f, testSeriesId: value }))} disabled={!formData.stream_id}>
                    <SelectTrigger id="test-series"><SelectValue placeholder="Select test series..." /></SelectTrigger>
                    <SelectContent>{availableTestSeries.map(ts => <SelectItem key={ts.id} value={ts.id}>{ts.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value as any })}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input id="duration" type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="180" className="h-9 mt-1"/>
            </div>
              <div>
              <Label htmlFor="total_questions">Total Questions</Label>
              <Input id="total_questions" type="number" value={formData.total_questions} onChange={(e) => setFormData({ ...formData, total_questions: e.target.value })} placeholder="45" className="h-9 mt-1"/>
            </div>
              <div>
              <Label htmlFor="max_marks">Maximum Marks</Label>
              <Input id="max_marks" type="number" value={formData.max_marks} onChange={(e) => setFormData({ ...formData, max_marks: e.target.value })} placeholder="180" className="h-9 mt-1"/>
            </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingPaper ? 'Save Changes' : 'Create Paper'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isQuestionModalOpen} onOpenChange={setIsQuestionModalOpen}>
        <DialogContent className="max-w-7xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Managing Questions for: {managingQuestionsFor?.title}</DialogTitle>
          </DialogHeader>
          <div className="h-full overflow-y-auto">
            <QuestionsManagement streams={streams} setStreams={setStreams} paperContext={managingQuestionsFor} onUpdate={handleQuestionsUpdate} />
          </div>
        </DialogContent>
      </Dialog>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search papers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterSubject} onValueChange={setFilterSubject} >
              <SelectTrigger className="w-48"><SelectValue placeholder="Filter by subject" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {allSubjects.map((subject) => <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Papers ({allPapers.length})</CardTitle>
          <CardDescription className="text-sm">All examination papers in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {streams.map(stream => (
              <AccordionItem value={stream.id} key={stream.id}>
                <AccordionTrigger className="text-base font-semibold hover:no-underline">{stream.name}</AccordionTrigger>
                <AccordionContent className="pl-4">
                  <Accordion type="multiple" className="w-full">
                    {stream.subjects.map(subject => (
                      <AccordionItem value={subject.id} key={subject.id}>
                        <AccordionTrigger>{subject.name}</AccordionTrigger>
                        <AccordionContent className="pl-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="pl-4 sm:pl-8">Paper Title</TableHead>
                                <TableHead className="hidden md:table-cell">Subject</TableHead>
                                <TableHead className="hidden lg:table-cell">Duration</TableHead>
                                <TableHead>Questions</TableHead>
                                <TableHead className="hidden md:table-cell">Difficulty</TableHead>
                                <TableHead className="hidden lg:table-cell">Attempts</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {subject.chapters?.flatMap(c => c.papers || []).map(p => <PaperRow key={p.id} paper={p} />)}
                            </TableBody>
                          </Table>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {practiceSessionStructure.length > 0 && (
            <Accordion type="multiple" className="w-full">
              {practiceSessionStructure.map(section => (
                <AccordionItem value={section.id} key={section.id}>
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Folder className="h-5 w-5 text-primary" />
                      <span>{section.name}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-4 border-l-2 border-primary/20">
                    <Accordion type="multiple" className="w-full">
                      {section.fullSyllabus && (
                        <AccordionItem value="full-syllabus">
                          <AccordionTrigger>Full-Syllabus PYQ Test</AccordionTrigger>
                          <AccordionContent className="pl-4">
                            <Table>
                              <TableHeader><TableRow><TableHead className="pl-4 sm:pl-8">Paper Title</TableHead><TableHead className="hidden md:table-cell">Subject</TableHead><TableHead className="hidden lg:table-cell">Duration</TableHead><TableHead>Questions</TableHead><TableHead className="hidden md:table-cell">Difficulty</TableHead><TableHead className="hidden lg:table-cell">Attempts</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                              <TableBody>
                                {section.fullSyllabus.flatMap((y: any) => y.papers).map((p: Paper) => <PaperRow key={p.id} paper={p} />)}
                              </TableBody>
                            </Table>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                      {section.subjectWise && (
                        <AccordionItem value="subject-wise">
                          <AccordionTrigger>Subject-wise PYQ Test</AccordionTrigger>
                          <AccordionContent className="pl-4">
                            <Accordion type="multiple" className="w-full">
                              {section.subjectWise.map((sub: any) => (
                                <AccordionItem value={sub.subjectId} key={sub.subjectId}>
                                  <AccordionTrigger>{sub.subjectName}</AccordionTrigger>
                                  <AccordionContent className="pl-4">
                                    <Table>                                      <TableHeader><TableRow><TableHead className="pl-4 sm:pl-8">Paper Title</TableHead><TableHead className="hidden md:table-cell">Subject</TableHead><TableHead className="hidden lg:table-cell">Duration</TableHead><TableHead>Questions</TableHead><TableHead className="hidden md:table-cell">Difficulty</TableHead><TableHead className="hidden lg:table-cell">Attempts</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                      <TableBody>
                                        {sub.years.flatMap((y: any) => y.papers).map((p: Paper) => <PaperRow key={p.id} paper={p} />)}
                                      </TableBody>
                                    </Table>
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                      {section.chapterWise && (
                        <AccordionItem value="chapter-wise">
                          <AccordionTrigger>Chapter-wise PYQ Test</AccordionTrigger>
                          <AccordionContent className="pl-4">
                            <Accordion type="multiple" className="w-full">
                              {section.chapterWise.map((sub: any) => (
                                <AccordionItem value={sub.subjectId} key={sub.subjectId}>
                                  <AccordionTrigger>{sub.subjectName}</AccordionTrigger>
                                  <AccordionContent className="pl-4">
                                  <Accordion type="multiple" className="w-full">
                                    {sub.chapters.map((c: any) => (
                                      c.paper && (
                                        <AccordionItem value={c.chapterId} key={c.chapterId}>
                                          <AccordionTrigger>{c.chapterName}</AccordionTrigger>
                                          <AccordionContent className="pl-4">
                                            <Table>
                                              <TableBody>
                                                <PaperRow paper={c.paper} />
                                              </TableBody>
                                            </Table>
                                          </AccordionContent>
                                        </AccordionItem>
                                      )
                                    ))}
                                  </Accordion>
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                    </Accordion>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
          {testSeriesStructure.length > 0 && (
            <Accordion type="multiple" className="w-full mt-4"> {/* Added mt-4 for spacing */}
              {testSeriesStructure.map(series => (
                <AccordionItem value={series.id} key={series.id}>
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400"> {/* Custom styling */}
                      <Folder className="h-5 w-5" />
                      <span>{series.name} (Test Series)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-4 border-l-2 border-purple-400/20"> {/* Custom styling */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-4 sm:pl-8">Test Name</TableHead>
                          <TableHead className="hidden md:table-cell">Questions</TableHead>
                          <TableHead className="hidden lg:table-cell">Duration</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {series.tests.map(test => (
                          <PaperRow key={test.id} paper={{
                            id: test.id,
                            title: test.name,
                            total_questions: test.numQuestions,
                            duration: test.duration,
                            questions: test.questions,
                            subject_id: '',
                            max_marks: 0,
                            difficulty: 'Medium',
                            attempts: 0,
                            created_at: new Date().toISOString(),
                          } as Paper} />
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
          {practiceSessionStructure.length === 0 && testSeriesStructure.length === 0 && allPapers.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No papers or test series found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first examination paper or test series to get started.
              </p>
              {!searchTerm && filterSubject === 'all' && (
                <Button onClick={() => handleOpenModal(null)} className="gap-2"><Plus className="h-4 w-4" />Create First Paper</Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <AlertDialog open={!!paperToDelete} onOpenChange={(isOpen) => !isOpen && setPaperToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-4">
               <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/50">
                <AlertTriangle className="h-6 w-6 text-red-500 dark:text-red-400" />
               </div>
               <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            </div>
          </AlertDialogHeader>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the paper titled <span className="font-semibold text-foreground">"{paperToDelete?.title}"</span> and all of its associated data.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePaper} className="bg-red-600 hover:bg-red-700">Yes, delete paper</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}