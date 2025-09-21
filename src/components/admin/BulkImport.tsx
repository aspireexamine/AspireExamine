import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Download, CheckCircle, AlertCircle, Loader2, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { Stream, Question, Paper, PracticeSubject, Chapter, Subject, Difficulty } from '@/types';
import { toast } from 'sonner';
import { getAdminDashboardData, bulkAddQuestions } from '@/lib/supabaseQueries';

interface BulkImportProps {
  streams: Stream[];
  setStreams: React.Dispatch<React.SetStateAction<Stream[]>>;
}

export function BulkImport({ streams, setStreams }: BulkImportProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); 
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string; imported: number; failed: number; } | null>(null);

  const [selectedStreamId, setSelectedStreamId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [selectedPaperId, setSelectedPaperId] = useState<string>('');
  const [selectedTestSeriesId, setSelectedTestSeriesId] = useState<string>('');
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [selectedPracticeSectionId, setSelectedPracticeSectionId] = useState<string>('');
  const [selectedTestType, setSelectedTestType] = useState<string>('');
  const [manualEntryText, setManualEntryText] = useState('');
  const [importTarget, setImportTarget] = useState<'stream_subject' | 'stream_practice' | 'test_series'>('stream_subject');
  const [manualEntryFormat, setManualEntryFormat] = useState<'csv' | 'json'>('csv');

  const selectedStream = useMemo(() => streams.find(s => s.id === selectedStreamId), [streams, selectedStreamId]);
  const availableSubjects = useMemo(() => selectedStream?.subjects || [], [selectedStream]);
  const selectedTestSeries = useMemo(() => selectedStream?.testSeries?.find(ts => ts.id === selectedTestSeriesId), [selectedStream, selectedTestSeriesId]);
  const selectedSubject = useMemo(() => availableSubjects.find(s => s.id === selectedSubjectId), [availableSubjects, selectedSubjectId]);
  const selectedChapter = useMemo(() => selectedSubject?.chapters?.find(c => c.id === selectedChapterId), [selectedSubject, selectedChapterId]);
  const availablePapers = useMemo(() => {
    if (importTarget === 'stream_subject') return selectedChapter?.papers || [];
    return [];
  }, [selectedChapter, importTarget]);
  const availablePracticeSections = useMemo(() => selectedStream?.practiceSections || [], [selectedStream]);
  const selectedPracticeSection = useMemo(() => availablePracticeSections.find(ps => ps.id === selectedPracticeSectionId), [availablePracticeSections, selectedPracticeSectionId]);

  const getPaperForImport = () => {
    if (importTarget === 'stream_practice' && selectedPracticeSectionId) {
      return selectedPracticeSection?.papers.find((p: Paper) => p.id === selectedPaperId);
    }
    if (importTarget === 'stream_subject') {
      return availablePapers.find(p => p.id === selectedPaperId);
    }
    return null;
  };
  const selectedPaper = getPaperForImport();

  const resetSelections = () => {
    setSelectedStreamId('');
    setSelectedSubjectId('');
    setSelectedPaperId('');
    setSelectedChapterId('');
    setSelectedTestSeriesId('');
    setSelectedTestId('');
    setSelectedTestType('');
    setManualEntryText('');
  };
  // const isPracticeSessionSelected = !!selectedPracticeSectionId;

  const generateFilePath = (): string => {
    let filePath = 'Bulk Import'; // Default for bulk imported questions
    const currentSelectedStream = streams.find(s => s.id === selectedStreamId);

    if (!currentSelectedStream) return filePath;

    const selectedStreamName = currentSelectedStream.name;

    if (importTarget === 'stream_subject') {
      const currentSelectedSubject = currentSelectedStream.subjects.find(s => s.id === selectedSubjectId);
      const currentSelectedChapter = currentSelectedSubject?.chapters?.find(c => c.id === selectedChapterId);
      const currentSelectedPaper = currentSelectedChapter?.papers?.find(p => p.id === selectedPaperId);

      if (selectedStreamName && currentSelectedSubject?.name && currentSelectedChapter?.name && currentSelectedPaper?.title) {
        filePath = `${selectedStreamName} / ${currentSelectedSubject.name} / ${currentSelectedChapter.name} / ${currentSelectedPaper.title}`;
      }
    } else if (importTarget === 'stream_practice') {
      const currentSelectedPracticeSection = currentSelectedStream.practiceSections?.find(ps => ps.id === selectedPracticeSectionId);
      let practicePath = `${selectedStreamName} / ${currentSelectedPracticeSection?.name}`;

      if (selectedTestType === 'SUBJECT_WISE') {
        const currentSelectedSubject = currentSelectedStream.subjects.find(s => s.id === selectedSubjectId);
        practicePath += ` / ${selectedTestType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} / ${currentSelectedSubject?.name}`;
      } else if (selectedTestType === 'CHAPTER_WISE' && currentSelectedPracticeSection?.type === 'ALL_ROUND') {
        const currentSelectedSubject = currentSelectedPracticeSection.subjects.find(s => s.id === selectedSubjectId);
        const currentSelectedChapter = currentSelectedSubject?.chapters.find(c => currentSelectedPracticeSection.papers.find(p => p.title.endsWith(`- ${c.name}`))?.id === selectedPaperId)?.name;
        practicePath += ` / ${selectedTestType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} / ${currentSelectedSubject?.name} / ${currentSelectedChapter}`;
      }
      const currentSelectedPaper = currentSelectedPracticeSection?.papers.find(p => p.id === selectedPaperId)?.title;
      if (currentSelectedPaper) {
        practicePath += ` / ${currentSelectedPaper}`;
      }
      if (selectedStreamName && currentSelectedPracticeSection?.name) {
        filePath = practicePath;
      }
    } else if (importTarget === 'test_series') {
      const currentSelectedTestSeries = currentSelectedStream.testSeries?.find(ts => ts.id === selectedTestSeriesId);
      const currentSelectedTest = currentSelectedTestSeries?.tests.find(t => t.id === selectedTestId);
      if (selectedStreamName && currentSelectedTestSeries?.name && currentSelectedTest?.name) {
        filePath = `${selectedStreamName} / ${currentSelectedTestSeries.name} / ${currentSelectedTest.name}`;
      }
    }
    return filePath;
  };

  const normalizeHeaderKey = (raw: string) => raw.trim().toLowerCase().replace(/\s+/g, '_');
  const toDifficulty = (val: unknown): Difficulty => {
    const s = String(val ?? '').toLowerCase();
    if (s === 'easy') return 'Easy';
    if (s === 'hard') return 'Hard';
    return 'Medium';
  };
  const parseCSV = (content: string): Omit<Question, 'id' | 'paperId' | 'testId'>[] => {
    const linesAll = content.split(/\r?\n/).filter(line => line.trim());
    if (linesAll.length === 0) return [];
    const expectedKeys = ['question','option_a','option_b','option_c','option_d','correct_answer','explanation','subject','topic','difficulty','marks'];

    const headerCandidate = linesAll[0];
    const headerCandNormalized = headerCandidate.split(',').map(normalizeHeaderKey);
    const hasHeader = headerCandNormalized.includes('question');

    const header = hasHeader ? headerCandNormalized : expectedKeys;
    const dataLines = hasHeader ? linesAll.slice(1) : linesAll; // treat first row as data when headerless

    const questions: Omit<Question, 'id' | 'paperId' | 'testId'>[] = [];

    for (const line of dataLines) {
      const values = line.match(/(?:"(?:\\"|[^"])*"|[^,])+/g) || [];
      const entry: Record<string, string> = {};
      header.forEach((key, i) => {
        let value = (values[i] ?? '').trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1).replace(/\\"/g, '"');
        }
        entry[key] = value;
      });

      const optionA = entry['option_a'] || '';
      const optionB = entry['option_b'] || '';
      const optionC = entry['option_c'] || '';
      const optionD = entry['option_d'] || '';
      const options = [optionA, optionB, optionC, optionD].filter(opt => !!opt);
      const parsedCA = parseInt(entry['correct_answer'] || '', 10);
      const correctAnswer = Number.isFinite(parsedCA) ? parsedCA : 0;

      const questionText = entry['question'] || '';
      if (!questionText.trim()) {
        continue;
      }

      questions.push({
        question: questionText,
        options,
        correctAnswer,
        explanation: entry['explanation'] || '',
        subject: entry['subject'] || '',
        topic: entry['topic'] || '',
        difficulty: toDifficulty(entry['difficulty']),
        marks: parseInt(entry['marks'] || '', 10) || 4,
      });
    }
    return questions;
  };

  const parseJSON = (content: string): Omit<Question, 'id' | 'paperId' | 'testId'>[] => {
    const arr = JSON.parse(content);
    if (!Array.isArray(arr)) return [];
    return arr
      .map((q: any) => ({
        question: String(q?.question || ''),
        options: Array.isArray(q?.options) ? q.options.filter((x: any) => typeof x === 'string' && x) : [],
        correctAnswer: Number.isFinite(q?.correctAnswer) ? q.correctAnswer : 0,
        explanation: q?.explanation || '',
        subject: q?.subject || '',
        topic: q?.topic || '',
        difficulty: toDifficulty(q?.difficulty),
        marks: Number.isFinite(q?.marks) ? q.marks : 4,
      }))
      .filter((q: any) => q.question && q.question.trim());
  };

  const processAndImportQuestions = async (content: string, type: 'csv' | 'json') => {
     if ((importTarget === 'stream_subject' || importTarget === 'stream_practice') && !selectedPaper) {
        toast.error('Please select a stream, target, and paper/chapter first.');
        return;
    }
    if (importTarget === 'test_series' && !selectedTestId) {
        toast.error('Please select a stream, test series, and test first.');
        return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      let parsedQuestions: Omit<Question, 'id' | 'paperId' | 'testId'>[] = [];

      if (type === 'csv') {
        parsedQuestions = parseCSV(content);
      } else if (type === 'json') {
        parsedQuestions = parseJSON(content);
      } else {
        throw new Error('Unsupported file type.');
      }

      const path = generateFilePath();

      // Validate parsed content
      const validQuestions = parsedQuestions.filter(q => (q.question || '').trim());
      const invalidCount = parsedQuestions.length - validQuestions.length;
      if (validQuestions.length === 0) {
        throw new Error('No valid questions found. Ensure "question" is present in each row.');
      }

      if ((importTarget === 'stream_subject' || importTarget === 'stream_practice') && selectedPaper) {
        const spaceAvailable = (selectedPaper as any).total_questions - (selectedPaper.questions?.length || 0);
        if (validQuestions.length > spaceAvailable) {
          toast.error(`Import failed: This paper only has space for ${spaceAvailable} more questions, but you are trying to import ${validQuestions.length}.`);
          setUploadResult({ success: false, message: `Not enough space in paper. Available: ${spaceAvailable}, trying to add: ${validQuestions.length}.`, imported: 0, failed: validQuestions.length });
          setIsUploading(false);
          return;
        }
        // Build rows for DB insert
        const payloadRows = validQuestions.map(q => ({
          paper_id: selectedPaperId || null,
          test_id: null,
          question: q.question,
          image_url: (q as any).imageUrl || null,
          options: q.options,
          correct_answer: q.correctAnswer,
          explanation: q.explanation || null,
          difficulty: q.difficulty,
          subject: q.subject || null,
          topic: q.topic || null,
          marks: q.marks ?? 4,
          file_path: path,
        }));
        await bulkAddQuestions(payloadRows);
        const fresh = await getAdminDashboardData();
        setStreams(fresh);
      } else if (importTarget === 'test_series' && selectedTestSeries) {
        const test = selectedTestSeries.tests.find(t => t.id === selectedTestId);
        if (!test) { throw new Error("Selected test not found"); }
        const spaceAvailable = (test as any).numQuestions - ((test as any).questions?.length || 0);
        if (validQuestions.length > spaceAvailable) {
          toast.error(`Import failed: This test only has space for ${spaceAvailable} more questions, but you are trying to import ${validQuestions.length}.`);
          setUploadResult({ success: false, message: `Not enough space in test. Available: ${spaceAvailable}, trying to add: ${validQuestions.length}.`, imported: 0, failed: validQuestions.length });
          setIsUploading(false);
          return;
        }
        const payloadRows = validQuestions.map(q => ({
          paper_id: null,
          test_id: selectedTestId || null,
          question: q.question,
          image_url: (q as any).imageUrl || null,
          options: q.options,
          correct_answer: q.correctAnswer,
          explanation: q.explanation || null,
          difficulty: q.difficulty,
          subject: q.subject || null,
          topic: q.topic || null,
          marks: q.marks ?? 4,
          file_path: path,
        }));
        await bulkAddQuestions(payloadRows);
        const fresh = await getAdminDashboardData();
        setStreams(fresh);
      }

      setUploadResult({
        success: true,
        message: 'Import completed successfully.',
        imported: validQuestions.length,
        failed: 0
      });
      const skippedMsg = invalidCount > 0 ? ` (${invalidCount} row(s) skipped due to missing question text)` : '';
      toast.success(`${validQuestions.length} questions imported successfully${skippedMsg}.`);

    } catch (error: any) {
      setUploadResult({ success: false, message: `Import failed: ${error.message}`, imported: 0, failed: 0 });
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setIsUploading(false);
        }
  };

  const handleFileUpload = async (file: File) => {
    const content = await file.text();
    const type = (file.type === 'text/csv' || file.name.endsWith('.csv')) ? 'csv' : 'json';
    processAndImportQuestions(content, type);
  };

  const handleManualSubmit = () => {
    processAndImportQuestions(manualEntryText, manualEntryFormat);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    toast.success(`${type} template copied to clipboard!`);
  };

  const csvTemplate = `question,option_a,option_b,option_c,option_d,correct_answer,explanation,subject,topic,difficulty,marks
"What is the acceleration due to gravity?","9.8 m/s²","10 m/s²","8.9 m/s²","11 m/s²",0,"Standard acceleration due to gravity on Earth","Physics","Motion",Medium,4
"Which element has atomic number 1?","Hydrogen","Helium","Lithium","Carbon",0,"Hydrogen is the first element in periodic table","Chemistry","Atomic Structure",Easy,4`;

  const jsonTemplate = `[
  {
    "question": "What is the acceleration due to gravity?",
    "options": ["9.8 m/s²", "10 m/s²", "8.9 m/s²", "11 m/s²"],
    "correctAnswer": 0,
    "explanation": "Standard acceleration due to gravity on Earth",
    "subject": "Physics",
    "topic": "Motion",
    "difficulty": "Medium",
    "marks": 4
  }
]`;

  return (
    <div className="space-y-2">
      <Tabs defaultValue="upload" className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="upload" className="h-auto py-3 sm:py-4">
            <div className="flex flex-col items-center">
              <span>Upload</span><span className="hidden sm:inline-block ml-1">File</span><span className="sm:hidden">File</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="templates" className="h-auto py-3 sm:py-4">
            <div className="flex flex-col items-center">
              <span>Download</span><span className="hidden sm:inline-block ml-1">Template</span><span className="sm:hidden">Template</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="manual" className="h-auto py-3 sm:py-4">
            <div className="flex flex-col items-center">
              <span>Manual</span><span className="hidden sm:inline-block ml-1">Entry</span><span className="sm:hidden">Entry</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">File Upload</CardTitle>
              <CardDescription className="text-sm">Upload CSV or JSON files containing questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="import-target-select">Import Into</Label>
                    <Select value={importTarget} onValueChange={(value) => { setImportTarget(value as any); resetSelections(); }}>
                      <SelectTrigger id="import-target-select"><SelectValue placeholder="Select Target..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stream_subject">Stream → Subject</SelectItem>
                        <SelectItem value="stream_practice">Stream → PYQ/Practice</SelectItem>
                        <SelectItem value="test_series">Test Series</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                 <div>
                  <Label htmlFor="stream-select">Stream</Label>
                  <Select value={selectedStreamId} onValueChange={id => { setSelectedStreamId(id); setSelectedSubjectId(''); setSelectedChapterId(''); setSelectedPaperId(''); setSelectedTestSeriesId(''); setSelectedTestId(''); setSelectedPracticeSectionId(''); }}>
                    <SelectTrigger id="stream-select"><SelectValue placeholder="Select Stream..." /></SelectTrigger>
                    <SelectContent>{streams.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              {importTarget === 'stream_subject' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="subject-select-import">Subject</Label>
                    <Select value={selectedSubjectId} onValueChange={id => { setSelectedSubjectId(id); setSelectedChapterId(''); setSelectedPaperId(''); }} disabled={!selectedStreamId}>
                      <SelectTrigger id="subject-select-import"><SelectValue placeholder="Select Subject..." /></SelectTrigger>
                      <SelectContent>{availableSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="chapter-select-import">Chapter</Label>
                    <Select value={selectedChapterId} onValueChange={id => { setSelectedChapterId(id); setSelectedPaperId(''); }} disabled={!selectedSubjectId}>
                      <SelectTrigger id="chapter-select-import"><SelectValue placeholder="Select Chapter..." /></SelectTrigger>
                      <SelectContent>{(selectedSubject?.chapters || []).map((c: Chapter) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="paper-select-import">Paper</Label>
                    <Select value={selectedPaperId} onValueChange={setSelectedPaperId} disabled={!selectedChapterId}>
                      <SelectTrigger id="paper-select-import"><SelectValue placeholder="Select Paper..." /></SelectTrigger>
                      <SelectContent>{availablePapers.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {importTarget === 'stream_practice' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 mt-2 border-t">
                  <div>
                    <Label htmlFor="practice-section-select">Target</Label>
                    <Select value={selectedPracticeSectionId} onValueChange={id => { setSelectedPracticeSectionId(id); setSelectedSubjectId(''); setSelectedPaperId(''); }}>
                      <SelectTrigger id="practice-section-select"><SelectValue placeholder="Select Practice Session..." /></SelectTrigger>
                      <SelectContent>
                        {availablePracticeSections.map(ps => <SelectItem key={ps.id} value={ps.id}>{ps.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="test-type-select">Test Type</Label>
                    <Select value={selectedTestType} onValueChange={setSelectedTestType} disabled={!selectedPracticeSectionId}>
                      <SelectTrigger id="test-type-select"><SelectValue placeholder="Select Test Type..." /></SelectTrigger>
                      <SelectContent>
                        {selectedPracticeSection?.type === 'ALL_ROUND' && selectedPracticeSection.allRoundTypes.map(type => (
                          <SelectItem key={type} value={type}>{type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedTestType === 'SUBJECT_WISE' && (
                    <div>
                      <Label htmlFor="subject-select-import">Subject</Label>
                      <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                        <SelectTrigger id="subject-select-import"><SelectValue placeholder="Select Subject..." /></SelectTrigger>
                        <SelectContent>{selectedStream?.subjects.map((s: Subject) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  )}
                  {selectedTestType === 'CHAPTER_WISE' && (
                    <div>
                      <Label htmlFor="subject-select-import">Subject</Label>
                      <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                        <SelectTrigger id="subject-select-import"><SelectValue placeholder="Select Subject..." /></SelectTrigger>
                        <SelectContent>{selectedPracticeSection?.type === 'ALL_ROUND' && selectedPracticeSection.subjects.map((s: PracticeSubject) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  )}                  
                </div>
              )}
              {importTarget === 'test_series' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 mt-2 border-t">
                  <div>
                    <Label htmlFor="test-series-select">Test Series</Label>
                    <Select value={selectedTestSeriesId} onValueChange={id => { setSelectedTestSeriesId(id); setSelectedTestId(''); }} disabled={!selectedStreamId}>
                      <SelectTrigger id="test-series-select"><SelectValue placeholder="Select Test Series..." /></SelectTrigger>
                      <SelectContent>{selectedStream?.testSeries?.map(ts => <SelectItem key={ts.id} value={ts.id}>{ts.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="test-select">Test</Label>
                    <Select value={selectedTestId} onValueChange={setSelectedTestId} disabled={!selectedTestSeriesId}>
                      <SelectTrigger id="test-select"><SelectValue placeholder="Select Test..." /></SelectTrigger>
                      <SelectContent>{selectedTestSeries?.tests.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {importTarget === 'stream_practice' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 mt-2 border-t">
                  {selectedTestType === 'CHAPTER_WISE' && selectedSubjectId && (
                  <div>
                    <Label htmlFor="chapter-select-import">Chapter</Label>
                    <Select value={selectedPaperId} onValueChange={setSelectedPaperId}>
                      <SelectTrigger id="chapter-select-import"><SelectValue placeholder="Select Chapter..." /></SelectTrigger>
                      <SelectContent>{selectedPracticeSection?.type === 'ALL_ROUND' && selectedPracticeSection.subjects.find(s => s.id === selectedSubjectId)?.chapters.map(c => <SelectItem key={c.id} value={selectedPracticeSection.papers.find(p => p.title.endsWith(`- ${c.name}`))?.id || ''}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  )}
                  {(selectedTestType === 'FULL_SYLLABUS' || (selectedTestType === 'SUBJECT_WISE' && selectedSubjectId)) && (
                  <div>
                    <Label htmlFor="paper-select-import">Year</Label>
                    <Select value={selectedPaperId} onValueChange={setSelectedPaperId}>
                      <SelectTrigger id="paper-select-import"><SelectValue placeholder="Select Year..." /></SelectTrigger>
                      <SelectContent>{selectedPracticeSection?.papers.filter(p => selectedTestType === 'FULL_SYLLABUS' ? /^Full Syllabus\s*-\s*\d{4}$/.test(p.title || '') : p.subject_id === selectedSubjectId).map((p: Paper) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  )}
                </div>)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload File</CardTitle>
              <CardDescription className="text-sm">Select a file to import into the chosen paper</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 sm:p-8 text-center hover:border-primary/50 transition-colors">
                <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-2 sm:mb-4" />
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-medium">Choose files to upload</p>
                  <p className="text-xs text-muted-foreground">Supports CSV and JSON formats (max 10MB)</p>
                </div>
                <Input
                  type="file"
                  accept=".csv,.json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  disabled={isUploading || ((importTarget === 'stream_subject' || importTarget === 'stream_practice') && !selectedPaperId) || (importTarget === 'test_series' && !selectedTestId)}
                  className="mt-4 cursor-pointer"
                />
              </div>

              {isUploading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">Processing file...</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    {uploadProgress}% complete
                  </p>
                </motion.div>
              )}

              {uploadResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert className={uploadResult.success ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}>
                    {uploadResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={uploadResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                      <p className="font-bold text-sm">{uploadResult.message}</p>
                      <div className="mt-2 text-xs sm:text-sm">
                        {uploadResult.success && `Successfully imported: ${uploadResult.imported} questions.`}
                        {uploadResult.failed > 0 && ` Failed to import: ${uploadResult.failed} questions.`}
                      </div>
                    </AlertDescription>
                  </Alert>
                  <Button variant="outline" size="sm" onClick={() => { setUploadResult(null); resetSelections(); }} className="mt-2">
                    Start New Import
                  </Button>
                </motion.div>
              )}

              <div className="space-y-2 pt-2">
                <h4 className="font-semibold text-sm">Supported Formats:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>CSV files with proper column headers</li>
                  <li>JSON files with question objects array</li>
                  <li>Maximum file size: 10MB</li>
                  <li>Encoding: UTF-8</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6 pt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-5 w-5" />
                  CSV Template
                </CardTitle>
                <CardDescription className="text-sm">Download CSV template with sample data</CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex flex-col sm:flex-row gap-2">
                <div className="flex gap-2">
                  <Button className="w-full gap-2" variant="outline" onClick={() => handleCopy(csvTemplate, 'CSV')}>
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                  <Button className="w-full gap-2" onClick={() => handleDownload(csvTemplate, 'template.csv')}>
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-5 w-5" />
                  JSON Template
                </CardTitle>
                <CardDescription className="text-sm">Download JSON template with sample structure</CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex flex-col sm:flex-row gap-2">
                <div className="flex gap-2">
                  <Button className="w-full gap-2" variant="outline" onClick={() => handleCopy(jsonTemplate, 'JSON')}>
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                  <Button className="w-full gap-2" onClick={() => handleDownload(jsonTemplate, 'template.json')}>
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Manual Bulk Entry</CardTitle>
              <CardDescription className="text-sm">Enter multiple questions using a structured format</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                 <div>
                    <Label htmlFor="import-target-select-manual">Import Into</Label>
                    <Select value={importTarget} onValueChange={(value) => { setImportTarget(value as any); resetSelections(); }}>
                      <SelectTrigger id="import-target-select-manual"><SelectValue placeholder="Select Target..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stream_subject">Stream → Subject</SelectItem>
                        <SelectItem value="stream_practice">Stream → PYQ/Practice</SelectItem>
                        <SelectItem value="test_series">Test Series</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                 <div>
                  <Label htmlFor="stream-select-manual">Stream</Label>
                  <Select value={selectedStreamId} onValueChange={id => { setSelectedStreamId(id); setSelectedPracticeSectionId(''); setSelectedTestType(''); setSelectedSubjectId(''); setSelectedChapterId(''); setSelectedPaperId(''); setSelectedTestSeriesId(''); setSelectedTestId(''); }}>
                    <SelectTrigger id="stream-select-manual"><SelectValue placeholder="Select Stream..." /></SelectTrigger>
                    <SelectContent>{streams.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              {importTarget === 'stream_subject' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="subject-select-manual">Subject</Label>
                    <Select value={selectedSubjectId} onValueChange={id => { setSelectedSubjectId(id); setSelectedChapterId(''); setSelectedPaperId(''); }} disabled={!selectedStreamId}>
                      <SelectTrigger id="subject-select-manual"><SelectValue placeholder="Select Subject..." /></SelectTrigger>
                      <SelectContent>{availableSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="chapter-select-manual">Chapter</Label>
                    <Select value={selectedChapterId} onValueChange={id => { setSelectedChapterId(id); setSelectedPaperId(''); }} disabled={!selectedSubjectId}>
                      <SelectTrigger id="chapter-select-manual"><SelectValue placeholder="Select Chapter..." /></SelectTrigger>
                      <SelectContent>{(selectedSubject?.chapters || []).map((c: Chapter) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="paper-select-manual">Paper</Label>
                    <Select value={selectedPaperId} onValueChange={setSelectedPaperId} disabled={!selectedChapterId}>
                      <SelectTrigger id="paper-select-manual"><SelectValue placeholder="Select Paper..." /></SelectTrigger>
                      <SelectContent>{(selectedChapter?.papers || []).map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {importTarget === 'stream_practice' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 mt-2 border-t">
                  <div>
                    <Label htmlFor="practice-section-select-manual">Target</Label>
                    <Select value={selectedPracticeSectionId} onValueChange={id => { setSelectedPracticeSectionId(id); setSelectedTestType(''); setSelectedSubjectId(''); setSelectedPaperId(''); }} disabled={!selectedStreamId}>
                      <SelectTrigger id="practice-section-select-manual"><SelectValue placeholder="Select Target..." /></SelectTrigger>
                      <SelectContent>{availablePracticeSections.map(ps => <SelectItem key={ps.id} value={ps.id}>{ps.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="test-type-select-manual">Test Type</Label>
                    <Select value={selectedTestType} onValueChange={setSelectedTestType} disabled={!selectedPracticeSectionId}>
                      <SelectTrigger id="test-type-select-manual"><SelectValue placeholder="Select Test Type..." /></SelectTrigger>
                      <SelectContent>
                        {selectedPracticeSection?.type === 'ALL_ROUND' && selectedPracticeSection.allRoundTypes.map(type => (
                          <SelectItem key={type} value={type}>{type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedTestType === 'SUBJECT_WISE' && (
                    <div>
                      <Label htmlFor="subject-select-manual">Subject</Label>
                      <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                        <SelectTrigger id="subject-select-manual"><SelectValue placeholder="Select Subject..." /></SelectTrigger>
                        <SelectContent>{selectedStream?.subjects.map((s: Subject) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  )}
                  {selectedTestType === 'CHAPTER_WISE' && (
                    <div>
                      <Label htmlFor="subject-select-manual">Subject</Label>
                      <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                        <SelectTrigger id="subject-select-manual"><SelectValue placeholder="Select Subject..." /></SelectTrigger>
                        <SelectContent>{selectedPracticeSection?.type === 'ALL_ROUND' && selectedPracticeSection.subjects.map((s: PracticeSubject) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  )}                  
                </div>
              )}
              {importTarget === 'test_series' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 mt-2 border-t">
                  <div>
                    <Label htmlFor="test-series-select-manual">Test Series</Label>
                    <Select value={selectedTestSeriesId} onValueChange={id => { setSelectedTestSeriesId(id); setSelectedTestId(''); }} disabled={!selectedStreamId}>
                      <SelectTrigger id="test-series-select-manual"><SelectValue placeholder="Select Test Series..." /></SelectTrigger>
                      <SelectContent>{selectedStream?.testSeries?.map(ts => <SelectItem key={ts.id} value={ts.id}>{ts.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="test-select-manual">Test</Label>
                    <Select value={selectedTestId} onValueChange={setSelectedTestId} disabled={!selectedTestSeriesId}>
                      <SelectTrigger id="test-select-manual"><SelectValue placeholder="Select Test..." /></SelectTrigger>
                      <SelectContent>{selectedTestSeries?.tests.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {importTarget === 'stream_practice' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 mt-2 border-t">
                  {selectedTestType === 'CHAPTER_WISE' && selectedSubjectId && (
                  <div>
                    <Label htmlFor="chapter-select-manual">Chapter</Label>
                    <Select value={selectedPaperId} onValueChange={setSelectedPaperId}>
                      <SelectTrigger id="chapter-select-manual"><SelectValue placeholder="Select Chapter..." /></SelectTrigger>
                      <SelectContent>{selectedPracticeSection?.type === 'ALL_ROUND' && selectedPracticeSection.subjects.find(s => s.id === selectedSubjectId)?.chapters.map(c => <SelectItem key={c.id} value={selectedPracticeSection.papers.find(p => p.title.endsWith(`- ${c.name}`))?.id || ''}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  )}
                  {(selectedTestType === 'FULL_SYLLABUS' || (selectedTestType === 'SUBJECT_WISE' && selectedSubjectId)) && (
                  <div>
                    <Label htmlFor="paper-select-manual">Year</Label>
                    <Select value={selectedPaperId} onValueChange={setSelectedPaperId}>
                      <SelectTrigger id="paper-select-manual"><SelectValue placeholder="Select Year..." /></SelectTrigger>
                      <SelectContent>{selectedPracticeSection?.papers.filter(p => selectedTestType === 'FULL_SYLLABUS' ? /^Full Syllabus\s*-\s*\d{4}$/.test(p.title || '') : p.subject_id === selectedSubjectId).map((p: Paper) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  )}
                </div>)}
              <div>
                <Label htmlFor="manual-format-select">Data Format</Label>
                <Select value={manualEntryFormat} onValueChange={(value: 'csv' | 'json') => setManualEntryFormat(value)}>
                  <SelectTrigger id="manual-format-select">
                    <SelectValue placeholder="Select format..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Comma-Separated Values)</SelectItem>
                    <SelectItem value="json">JSON (JavaScript Object Notation)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bulk-text">Questions (One per line, structured format)</Label>
                <Textarea
                  id="bulk-text"
                  placeholder="Paste your questions here in the specified format..."
                  className="min-h-32 sm:min-h-48"
                  value={manualEntryText}
                  onChange={(e) => setManualEntryText(e.target.value)}
                  disabled={isUploading || ((importTarget === 'stream_subject' || importTarget === 'stream_practice') && !selectedPaperId) || (importTarget === 'test_series' && !selectedTestId)}
                />
                <p className="text-xs text-muted-foreground">Use the same format as the CSV template, with one question per line.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button onClick={handleManualSubmit} className="flex-1 gap-2" disabled={isUploading || !manualEntryText.trim() || ((importTarget === 'stream_subject' || importTarget === 'stream_practice') && !selectedPaperId) || (importTarget === 'test_series' && !selectedTestId)}>
                  <Upload className="h-4 w-4" />
                  Process Questions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
