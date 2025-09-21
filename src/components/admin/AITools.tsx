import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stream, Paper, TestSeries } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Brain, FileText, Video, Upload, Loader2, CheckCircle, Settings, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AssemblyAI } from 'assemblyai';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
import { bulkAddQuestions, getAdminDashboardData, getAIProviderKeys } from '@/lib/supabaseQueries';

interface AIToolsProps {
  streams: Stream[];
  setStreams: React.Dispatch<React.SetStateAction<Stream[]>>;
}

async function getTranscript(
  youtubeUrl: string
): Promise<{ transcript: string; source: 'youtube' | 'assemblyai' }> {
  // 1. Call our local server proxy to get the real audio stream URL
  const proxyResponse = await fetch('http://localhost:3001/api/get-audio-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ youtubeUrl }),
  });

  if (!proxyResponse.ok) {
    const { error } = await proxyResponse.json();
    throw new Error(error || 'Failed to get audio stream from server.');
  }

  const { audioUrl } = await proxyResponse.json();

  const client = new AssemblyAI({ apiKey: "cfbb8869df1a442cbb1f318dc3769eb0" });
  const transcript = await client.transcripts.transcribe({ audio: audioUrl, speech_model: "universal" });
  if (transcript.status === 'error') throw new Error(transcript.error);
  return { transcript: transcript.text || '', source: 'assemblyai' };
}

export function AITools({ streams, setStreams }: AIToolsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [transcript, setTranscript] = useState<{ name: string; content: string; source: 'youtube' | 'pdf' | 'text' } | null>(null);
  const [showApiConfirm, setShowApiConfirm] = useState(false);
  const [generationConfig, setGenerationConfig] = useState({
    numQuestions: 10,
    format: 'json' as 'json' | 'csv',
    difficulty: 'Mixed' as 'Easy' | 'Medium' | 'Hard' | 'Mixed',
  });
  const [fileToProcess, setFileToProcess] = useState<File | null>(null);
  const [textToProcess, setTextToProcess] = useState('');
  const [approvedQuestions, setApprovedQuestions] = useState<any[]>([]);
  const [aiKeys, setAiKeys] = useState<{ google?: string | null; openrouter?: string | null; groq?: string | null }>({});
  const [processingStage, setProcessingStage] = useState<'idle' | 'extracting' | 'sending' | 'generating' | 'preparing' | 'done'>('idle');
  const [lastSource, setLastSource] = useState<{ type: 'pdf' | 'text' | 'youtube'; name: string; content: string } | null>(null);
  const [selectedAction, setSelectedAction] = useState<'none' | 'generate_questions' | 'generate_similar'>('generate_questions');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [transcriptDraft, setTranscriptDraft] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const keys = await getAIProviderKeys();
        setAiKeys({ google: keys.google_gemini_key || null, openrouter: keys.openrouter_key || null, groq: keys.groq_key || null });
      } catch {}
    })();
  }, []);

  // Persist/restore state to survive refreshes and tab switches
  const STORAGE_KEY = 'ai-tools-state-v1';

  // State for import targeting
  const [importTarget, setImportTarget] = useState<'stream_subject' | 'stream_practice' | 'test_series'>('stream_subject');
  const [selectedStreamId, setSelectedStreamId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [selectedPracticeSectionId, setSelectedPracticeSectionId] = useState<string>('');
  const [selectedPaperId, setSelectedPaperId] = useState<string>('');
  const [selectedTestSeriesId, setSelectedTestSeriesId] = useState<string>('');
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [selectedTestType, setSelectedTestType] = useState<string>('');
  // Restore persisted state after all related hooks are declared
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.generationConfig) setGenerationConfig(saved.generationConfig);
      if (saved.importTarget) setImportTarget(saved.importTarget);
      if (saved.selectedStreamId) setSelectedStreamId(saved.selectedStreamId);
      if (saved.selectedSubjectId) setSelectedSubjectId(saved.selectedSubjectId);
      if (saved.selectedChapterId) setSelectedChapterId(saved.selectedChapterId);
      if (saved.selectedPracticeSectionId) setSelectedPracticeSectionId(saved.selectedPracticeSectionId);
      if (saved.selectedPaperId) setSelectedPaperId(saved.selectedPaperId);
      if (saved.selectedTestSeriesId) setSelectedTestSeriesId(saved.selectedTestSeriesId);
      if (saved.selectedTestId) setSelectedTestId(saved.selectedTestId);
      if (Array.isArray(saved.generatedQuestions)) setGeneratedQuestions(saved.generatedQuestions);
      if (Array.isArray(saved.approvedQuestions)) setApprovedQuestions(saved.approvedQuestions);
      if (saved.transcript) setTranscript(saved.transcript);
      if (saved.textToProcess) setTextToProcess(saved.textToProcess);
      if (saved.lastSource) setLastSource(saved.lastSource);
      if (saved.processingStage) setProcessingStage(saved.processingStage);
      if (typeof saved.processingProgress === 'number') setProcessingProgress(saved.processingProgress);
      if (saved.selectedAction !== undefined) setSelectedAction(saved.selectedAction || 'none');
      if (typeof saved.customPrompt === 'string') setCustomPrompt(saved.customPrompt);
    } catch {}
  }, []);

  // Save snapshot when relevant state changes
  useEffect(() => {
    const snapshot = {
      generationConfig,
      importTarget,
      selectedStreamId,
      selectedSubjectId,
      selectedChapterId,
      selectedPracticeSectionId,
      selectedPaperId,
      selectedTestSeriesId,
      selectedTestId,
      generatedQuestions,
      approvedQuestions,
      transcript,
      textToProcess,
      lastSource,
      processingStage,
      processingProgress,
      selectedAction,
      customPrompt,
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)); } catch {}
  }, [
    generationConfig,
    importTarget,
    selectedStreamId,
    selectedSubjectId,
    selectedChapterId,
    selectedPracticeSectionId,
    selectedPaperId,
    selectedTestSeriesId,
    selectedTestId,
    generatedQuestions,
    approvedQuestions,
    transcript,
    textToProcess,
    lastSource,
    processingStage,
    processingProgress,
    selectedAction,
    customPrompt,
  ]);

  const selectedStream = useMemo(() => streams.find(s => s.id === selectedStreamId), [streams, selectedStreamId]);
  const availablePracticeSections = useMemo(() => selectedStream?.practiceSections || [], [selectedStream]);
  const selectedTestSeries = useMemo(() => selectedStream?.testSeries?.find((ts: TestSeries) => ts.id === selectedTestSeriesId), [selectedStream, selectedTestSeriesId]);
  const selectedSubject = useMemo(() => selectedStream?.subjects.find(s => s.id === selectedSubjectId), [selectedStream, selectedSubjectId]);
  const selectedChapter = useMemo(() => selectedSubject?.chapters?.find(c => c.id === selectedChapterId), [selectedSubject, selectedChapterId]);
  const selectedPracticeSection = useMemo(() => availablePracticeSections.find(ps => ps.id === selectedPracticeSectionId), [availablePracticeSections, selectedPracticeSectionId]);

  const handleGenerateQuestions = async (source: string | File, sourceName: string) => {
    // Start processing immediately, close the config dialog, reset state
    setIsProcessing(true);
    setProcessingStage('extracting');
    setProcessingProgress(5);
    setGeneratedQuestions([]);
    setFileToProcess(null);

    let sourceContent = '';
    if (typeof source === 'string') {
      sourceContent = source;
      setProcessingProgress(30);
    } else {
      // File → try Supabase Edge Function first, fall back to local pdfjs
      try {
        const form = new FormData();
        form.append('file', source);
        const fnUrl = `${import.meta.env.VITE_SUPABASE_URL?.replace('/project', '')}/functions/v1/extract-pdf`;
        const resp = await fetch(fnUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: form,
        });
        if (resp.ok) {
          const json = await resp.json();
          sourceContent = json.text || '';
        } else {
          throw new Error('edge-fn-failed');
        }
        setProcessingProgress(30);
      } catch {
      try {
        const dataBuffer = await source.arrayBuffer();
          const pdf = await (pdfjsLib as any).getDocument(dataBuffer).promise;
        let textContent = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
            textContent += text.items.map((item: any) => ('str' in item ? item.str : '')).join(' ');
          textContent += '\n';
        }
        sourceContent = textContent;
          setProcessingProgress(30);
      } catch (error) {
          setIsProcessing(false);
          setProcessingStage('idle');
          toast.error('Failed to parse PDF file.');
        return;
      }
    }
    }
    // Save last source so we can resume after reload if needed
    setLastSource({ type: 'pdf', name: sourceName, content: sourceContent });
    setProcessingStage('sending');
    setProcessingProgress(40);

    const actionInstruction = selectedAction === 'generate_similar'
      ? `Generate ${generationConfig.numQuestions} similar multiple-choice questions by varying numbers and wording while preserving underlying concepts.`
      : selectedAction === 'generate_questions'
        ? `Generate ${generationConfig.numQuestions} multiple-choice questions.`
        : '';

    const customInstruction = customPrompt ? `Additional instructions: ${customPrompt}` : '';

    const prompt = `
      Based on the following content from "${sourceName}", ${actionInstruction || 'perform the requested task.'}
      IMPORTANT: Always produce the final output in English, even if the source content is in another language. Translate source concepts as needed, but keep all question text, options, explanations in English.
      Write stand-alone questions. Do NOT mention or reference the source with phrases like "according to the text", "from the passage", "as per the transcript/video", or "based on the text". Avoid meta language; just ask the question directly.
      Target difficulty: ${generationConfig.difficulty}.
      Preferred output: ${generationConfig.format.toUpperCase()}.
      ${customInstruction}

      If generating questions and using JSON, use this structure (English):
      [
        {
          "question": "...", // English
          "options": ["...", "...", "...", "..."], // English
          "correctAnswer": 0,
          "explanation": "...", // English
          "subject": "...", // English
          "topic": "...", // English
          "difficulty": "...",
          "marks": 4
        }
      ]

      If using CSV, use header (English values):
      question,option_a,option_b,option_c,option_d,correct_answer,explanation,subject,topic,difficulty,marks

      Content:
      ---
      ${sourceContent}
      ---
    `;

    try {
      const tryGemini = async () => {
        const key = aiKeys.google;
        if (!key) throw new Error('Gemini key not set');
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
          method: 'POST',
          headers: {
            'x-goog-api-key': key,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              { parts: [{ text: prompt }] }
            ]
          })
        });
        if (!response.ok) throw new Error('Gemini request failed');
        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        return { choices: [{ message: { content: text } }] };
      };

      const tryGroq = async () => {
        const key = aiKeys.groq;
        if (!key) throw new Error('Groq key not set');
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [{ role: 'user', content: prompt }]
          })
        });
        if (!response.ok) throw new Error('Groq request failed');
        return response.json();
      };

      const tryOpenRouter = async () => {
        const key = aiKeys.openrouter;
        if (!key) throw new Error('OpenRouter key not set');
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "qwen/qwen-2.5-72b-instruct:free",
          "messages": [
            { "role": "user", "content": prompt }
          ]
        })
      });
        if (!response.ok) throw new Error('OpenRouter request failed');
        return response.json();
      };

      let data: any;
      // Priority: Gemini → Groq → OpenRouter
      try {
        data = await tryGemini();
      } catch {
        try {
          data = await tryGroq();
        } catch {
          data = await tryOpenRouter();
        }
      }
      setProcessingStage('generating');
      setProcessingProgress(70);
      const generatedContent = data.choices?.[0]?.message?.content ?? '';

      // Extract JSON robustly: code block > first JSON array/object > fallback
      const codeBlockRegex = /```(json)?\s*([\s\S]*?)\s*```/i;
      const codeMatch = generatedContent.match(codeBlockRegex);
      let finalContent = codeMatch ? codeMatch[2].trim() : generatedContent.trim();
      // Try to locate the first JSON array/object if wrappers exist
      const jsonStart = Math.min(
        ...[finalContent.indexOf('['), finalContent.indexOf('{')].filter(i => i >= 0)
      );
      if (jsonStart >= 0) finalContent = finalContent.slice(jsonStart);

      if (generationConfig.format === 'json') {
        try {
          // Sometimes models add trailing text; try to parse progressively
          let parsed: any;
          try { parsed = JSON.parse(finalContent); }
          catch {
            // Heuristic: cut after last ] or }
            const lastBracket = Math.max(finalContent.lastIndexOf(']'), finalContent.lastIndexOf('}'));
            if (lastBracket > 0) {
              parsed = JSON.parse(finalContent.slice(0, lastBracket + 1));
            } else {
              throw new Error('No JSON payload found');
            }
          }
          const questions = Array.isArray(parsed) ? parsed : (parsed?.questions || []);
          if (!Array.isArray(questions) || questions.length === 0) throw new Error('Empty questions array');
          setProcessingStage('preparing');
          setProcessingProgress(90);
          setGeneratedQuestions(questions.map((q: any, i: number) => ({ ...q, id: String(i + 1) })));
        } catch (e) {
          toast.error('Failed to parse JSON from AI response.');
          console.error('Generated content:', generatedContent);
          setIsProcessing(false);
          setProcessingStage('idle');
          return;
        }
      } else {
        // Basic CSV parsing - this can be improved with a library if needed
        const lines = finalContent.split('\n');
        if (lines.length < 2) {
            toast.error("CSV response from AI is malformed or empty.");
            setIsProcessing(false);
            setProcessingStage('idle');
            return;
        }
        const headers = lines[0].split(',').map((h: string) => h.trim());
        const questions = lines.slice(1)
          .map((line: string, i: number) => {
            if (!line.trim()) return null;
            const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // handle commas inside quotes
            const entry: any = {};
            headers.forEach((key: string, i: number) => {
                entry[key] = values[i]?.trim().replace(/^"|"$/g, '') || '';
            });

            return {
                id: `q-ai-${Date.now()}-${i}`,
                question: entry.question,
                options: [entry.option_a, entry.option_b, entry.option_c, entry.option_d],
                correctAnswer: parseInt(entry.correct_answer, 10),
                explanation: entry.explanation,
                subject: entry.subject,
                topic: entry.topic,
                difficulty: entry.difficulty || 'Medium',
                marks: parseInt(entry.marks, 10) || 4,
            };
          })
          .filter(Boolean); // Remove null entries from empty lines
        setProcessingStage('preparing');
        setProcessingProgress(90);
        setGeneratedQuestions(questions as any[]);
      }

      toast.success('Questions generated successfully!');
      setApprovedQuestions([]); // Reset approvals for new batch
      setProcessingStage('done');
      setProcessingProgress(100);

    } catch (error) {
      toast.error(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
      // Reset stage display back to idle after brief completion
      setTimeout(() => setProcessingStage('idle'), 500);
      // Do not clear text/file here so user can re-generate if needed
    }
  };

  const handleApproveAndImport = async () => {
    if ((importTarget === 'stream_subject' || importTarget === 'stream_practice') && !selectedPaperId) {
      toast.error("Please select a stream, target, and paper/chapter to import questions into.");
      return;
    }
    if (importTarget === 'test_series' && !selectedTestId) {
      toast.error("Please select a stream, test series, and test to import questions into.");
      return;
    }

    const approvedSet = new Set(approvedQuestions);
    const toImport = approvedSet.size > 0
      ? generatedQuestions.filter((q: any) => approvedSet.has(q.id))
      : generatedQuestions;

    if (toImport.length === 0) {
      toast.error('No questions selected for import. Approve some questions first.');
      return;
    }

    try {
      const rows = toImport.map((q: any) => ({
        paper_id: (importTarget === 'stream_subject' || importTarget === 'stream_practice') ? selectedPaperId : null,
        test_id: importTarget === 'test_series' ? selectedTestId : null,
        question: String(q.question || '').trim(),
        image_url: q.imageUrl || null,
        options: Array.isArray(q.options) ? q.options.filter((o: any) => String(o || '').trim().length > 0) : [],
        correct_answer: Number.isFinite(q.correctAnswer) ? q.correctAnswer : 0,
        explanation: q.explanation ? String(q.explanation) : null,
        difficulty: ['Easy','Medium','Hard'].includes(q.difficulty) ? q.difficulty : 'Medium',
        subject: q.subject ? String(q.subject) : null,
        topic: q.topic ? String(q.topic) : null,
        marks: Number.isFinite(q.marks) ? q.marks : 4,
        file_path: q.filePath || null,
      })).filter(r => r.question.length > 0);

      if (rows.length === 0) {
        toast.error('No valid questions to import.');
        return;
      }

      await bulkAddQuestions(rows);
      const refreshed = await getAdminDashboardData();
      setStreams(refreshed);

      toast.success(`${rows.length} question(s) imported successfully!`);
      setGeneratedQuestions([]);
      setApprovedQuestions([]);
      setLastSource(null);
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    } catch (err: any) {
      toast.error(`Import failed: ${err.message || String(err)}`);
    }
  };

  const handleToggleApproval = (questionId: string) => {
    setApprovedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId) 
        : [...prev, questionId]
    );
  };

  const handleApproveAll = () => {
    setApprovedQuestions(generatedQuestions.map(q => q.id));
  };

  const handleDeleteQuestion = (questionId: string) => {
    setGeneratedQuestions(prev => prev.filter(q => q.id !== questionId));
    setApprovedQuestions(prev => prev.filter(id => id !== questionId));
  };

  const getYouTubeVideoId = (url: string) => {
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get('v');
  };

  const transcribeWithApi = async () => {
    const videoId = getYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      toast.error('Invalid YouTube URL. Could not find video ID.');
      setIsProcessing(false);
      return;
    }

    toast.info('No captions found. Using AssemblyAI for transcription...');
    setProcessingProgress(10); // Initial progress

    const client = new AssemblyAI({
      apiKey: "cfbb8869df1a442cbb1f318dc3769eb0",
    });

    try {
      const transcript = await client.transcripts.transcribe({
        audio: youtubeUrl,
        speech_model: "universal",
      });

      if (transcript.status === 'error') {
        throw new Error(transcript.error);
      }

      setProcessingProgress(100);
      setTranscript({ name: `${videoId}_transcript.txt`, content: transcript.text || '', source: 'youtube' });
      toast.success('Transcript generated successfully with AssemblyAI!');

    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleYouTubeProcess = async () => {
    if (!youtubeUrl) {
      toast.error('Please enter a YouTube URL.');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(10);
    setTranscript(null);
    toast.info('Fetching captions...');

    try {
      // 1) Try Python transcript service first
      const pyUrl = import.meta.env.VITE_PY_TRANSCRIPT_URL as string | undefined;
      if (pyUrl) {
        const r = await fetch(`${pyUrl.replace(/\/$/, '')}/youtube-transcript`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: youtubeUrl })
        });
        if (r.ok) {
          const json = await r.json();
          const vid = json.videoId || (getYouTubeVideoId(youtubeUrl) || 'video');
          setTranscript({ name: `${vid}_transcript.txt`, content: json.text || '', source: 'youtube' });
          setProcessingProgress(100);
          toast.success('Transcript fetched from Python service.');
          setIsProcessing(false);
          return;
        }
      }

      // 2) Try Supabase Edge Function as secondary
      try {
        const ytFnUrl = `${import.meta.env.VITE_SUPABASE_URL?.replace('/project', '')}/functions/v1/youtube-transcript`;
        const resp = await fetch(ytFnUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url: youtubeUrl })
        });
        if (resp.ok) {
          const json = await resp.json();
          const vid = json.videoId || (getYouTubeVideoId(youtubeUrl) || 'video');
          setTranscript({ name: `${vid}_transcript.txt`, content: json.text || '', source: 'youtube' });
          setProcessingProgress(100);
          toast.success('Transcript fetched from YouTube captions.');
          setIsProcessing(false);
          return;
        }
      } catch {}

      // 3) Fallback to AssemblyAI via local helper
      setProcessingProgress(40);
      toast.message('Captions not found. Falling back to AssemblyAI...');
      const { transcript: transcriptText } = await getTranscript(youtubeUrl);
      const videoId = getYouTubeVideoId(youtubeUrl) || 'video';
      setTranscript({ name: `${videoId}_transcript.txt`, content: transcriptText, source: 'youtube' });
      setProcessingProgress(100);
      toast.success('Transcript generated via AssemblyAI.');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePDFFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileToProcess(file);
    }
  };

  const handleTextSubmit = () => {
    if (!textToProcess.trim()) {
      toast.error('Please enter some text to generate questions from.');
      return;
    }
    handleGenerateQuestions(textToProcess, 'custom_text');
  };

  return (
    <div className="space-y-2">
      <AlertDialog open={showApiConfirm} onOpenChange={setShowApiConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm API Usage</AlertDialogTitle>
            <AlertDialogDescription>
              No existing captions were found for this video. Do you want to use the AssemblyAI API to generate a transcript? This will consume API credits.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsProcessing(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={transcribeWithApi}>
              Yes, Use API
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!fileToProcess} onOpenChange={(isOpen) => !isOpen && setFileToProcess(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Configure Question Generation</DialogTitle>
            <DialogDescription>Set the options for generating questions from "{fileToProcess?.name}".</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div>
                <Label htmlFor="ai-action">AI Action (optional)</Label>
                <Select value={selectedAction} onValueChange={(v) => setSelectedAction(v as any)}>
                  <SelectTrigger id="ai-action" className="w-full"><SelectValue placeholder="Choose an action..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No predefined action</SelectItem>
                    <SelectItem value="generate_questions">Generate Questions</SelectItem>
                    <SelectItem value="generate_similar">Generate Similar Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ai-custom-prompt">Custom Prompt (optional)</Label>
                <Textarea
                  id="ai-custom-prompt"
                  placeholder="e.g., Make them MCQs with moderate difficulty; vary numbers and wording."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="gen-num-questions">Number of Questions</Label>
              <Input id="gen-num-questions" type="number" value={generationConfig.numQuestions} onChange={(e) => setGenerationConfig(c => ({ ...c, numQuestions: Number(e.target.value) }))} className="w-full" />
            </div>
            <div>
              <Label htmlFor="gen-format">Output Format</Label>
              <Select value={generationConfig.format} onValueChange={(value) => setGenerationConfig(c => ({ ...c, format: value as any }))}>
                <SelectTrigger id="gen-format" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="gen-difficulty">Difficulty</Label>
              <Select value={generationConfig.difficulty} onValueChange={(value) => setGenerationConfig(c => ({ ...c, difficulty: value as any }))}>
                <SelectTrigger id="gen-difficulty" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2"><Button variant="outline" onClick={() => setFileToProcess(null)}>Cancel</Button><Button onClick={() => fileToProcess && handleGenerateQuestions(fileToProcess, fileToProcess.name)}>Generate</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transcript View/Edit Modal */}
      <Dialog open={showTranscriptModal} onOpenChange={setShowTranscriptModal}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Transcript</DialogTitle>
            <DialogDescription>Edit the transcript text below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              value={transcriptDraft}
              onChange={(e) => setTranscriptDraft(e.target.value)}
              className="min-h-[320px] font-sans leading-6 text-sm"
              placeholder="Transcript text..."
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowTranscriptModal(false)}>Cancel</Button>
            <Button onClick={() => { setTranscript(prev => prev ? { ...prev, content: transcriptDraft } : prev); setShowTranscriptModal(false); toast.success('Transcript updated'); }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="pdf" className="w-full space-y-3 sm:space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="pdf" className="h-full py-2 sm:py-3 text-xs sm:text-sm">
            <div className="flex flex-col items-center">
              <span>PDF</span><span className="hidden sm:inline-block ml-1">Import</span><span className="sm:hidden">Import</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="youtube" className="h-full py-2 sm:py-3 text-xs sm:text-sm">
            <div className="flex flex-col items-center">
              <span>YouTube</span><span className="hidden sm:inline-block ml-1">Import</span><span className="sm:hidden">Import</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="text" className="h-full py-2 sm:py-3 text-xs sm:text-sm">
            <div className="flex flex-col items-center">
              <span>Text</span><span className="hidden sm:inline-block ml-1">Generation</span><span className="sm:hidden">Generation</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pdf" className="space-y-6 pt-6">
          <Card className="sm:rounded-lg rounded-md">
            <CardHeader className="py-3 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                PDF Question Generation
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Upload PDF files to automatically generate questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 sm:p-8 text-center hover:border-primary/50 transition-colors">
                <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <div className="space-y-2">
                  <p className="text-sm sm:text-base font-medium">Upload PDF files</p>
                  <p className="text-xs sm:text-xs text-muted-foreground">Educational PDFs, textbooks, study materials (max 50MB)</p>
                </div>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handlePDFFileSelect}
                  className="mt-3 sm:mt-4 cursor-pointer text-xs sm:text-sm"
                />
              </div>

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="text-xs sm:text-sm font-medium">
                    {processingStage === 'extracting' && 'Extracting text from PDF…'}
                    {processingStage === 'sending' && 'Sending content to AI…'}
                    {processingStage === 'generating' && 'Generating questions…'}
                    {processingStage === 'preparing' && 'Preparing preview…'}
                    {processingStage === 'done' && 'Completed.'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-primary animate-pulse" />
                    <span className="text-xs sm:text-sm font-medium">AI Processing Content...</span>
                  </div>
                  <Progress value={processingProgress} className="h-2 sm:h-3" />
                  <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                    <p>• Extracting text and concepts</p>
                    <p>• Generating relevant questions</p>
                    <p>• Creating multiple choice options</p>
                    <p>• Validating content accuracy</p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="youtube" className="space-y-6 pt-6">
          <Card className="sm:rounded-lg rounded-md">
            <CardHeader className="py-3 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Video className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                YouTube Question Generation
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Generate questions from educational YouTube videos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="youtube-url" className="text-xs sm:text-sm">YouTube Video URL</Label>
                  <Input
                    id="youtube-url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full text-xs sm:text-sm"
                  />
                </div>
                <Button 
                  onClick={handleYouTubeProcess}
                  className="w-full gap-2 text-xs sm:text-sm py-2 sm:py-3"
                  disabled={isProcessing}
                >
                  <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
                  Generate Transcript
                </Button>
              </div>

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-red-500" />
                    <span className="text-xs sm:text-sm font-medium">Processing Video Content...</span>
                  </div>
                  <Progress value={processingProgress} className="h-1.5 sm:h-2" />
                  <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                    <p>• Downloading video transcript</p>
                    <p>• Analyzing educational content</p>
                  </div>
                </motion.div>
              )}

              {transcript && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="mt-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm sm:text-base">Transcript</CardTitle>
                      <CardDescription className="text-[10px] sm:text-xs">{transcript.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                      <div className="h-40 sm:h-48 overflow-auto rounded border p-2 text-xs sm:text-sm whitespace-pre-wrap">
                        {transcript.content.slice(0, 500)}{transcript.content.length > 500 ? '…' : ''}
                      </div>
                      {/* Configuration prior to question generation */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="ai-action-youtube">AI Action (optional)</Label>
                            <Select value={selectedAction} onValueChange={(v) => setSelectedAction(v as any)}>
                              <SelectTrigger id="ai-action-youtube"><SelectValue placeholder="Choose an action..." /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No predefined action</SelectItem>
                                <SelectItem value="generate_questions">Generate Questions</SelectItem>
                                <SelectItem value="generate_similar">Generate Similar Questions</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="ai-custom-prompt-youtube">Custom Prompt (optional)</Label>
                            <Textarea
                              id="ai-custom-prompt-youtube"
                              placeholder="Add extra instructions for the AI..."
                              value={customPrompt}
                              onChange={(e) => setCustomPrompt(e.target.value)}
                              className="min-h-24"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                          <div>
                            <Label htmlFor="num-questions-youtube">Number of Questions</Label>
                            <Input
                              id="num-questions-youtube"
                              type="number"
                              min={1}
                              max={50}
                              value={generationConfig.numQuestions}
                              onChange={(e) => setGenerationConfig(c => ({ ...c, numQuestions: Number(e.target.value) }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="difficulty-youtube">Difficulty Level</Label>
                            <Select value={generationConfig.difficulty} onValueChange={(value) => setGenerationConfig(c => ({ ...c, difficulty: value as any }))}>
                              <SelectTrigger id="difficulty-youtube"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Mixed">Mixed</SelectItem>
                                <SelectItem value="Easy">Easy</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Hard">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="format-youtube">Question Type / Format</Label>
                            <Select value={generationConfig.format} onValueChange={(value) => setGenerationConfig(c => ({ ...c, format: value as any }))}>
                              <SelectTrigger id="format-youtube"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="json">JSON</SelectItem>
                                <SelectItem value="csv">CSV</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" className="w-full" onClick={() => { setTranscriptDraft(transcript.content); setShowTranscriptModal(true); }}>View / Edit</Button>
                        <Button className="w-full" onClick={() => handleGenerateQuestions(transcript.content, transcript.name)}>
                          <Settings className="h-4 w-4 mr-1" /> Generate Questions
                        </Button>
                        <Button variant="destructive" className="w-full" onClick={() => setTranscript(null)}>Delete</Button>
                        <Button variant="secondary" className="w-full" onClick={() => {
                          const blob = new Blob([transcript.content], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = transcript.name || 'transcript.txt';
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}>Download</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="text" className="space-y-6 pt-6">
          <Card className="sm:rounded-lg rounded-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                Text-Based Generation
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Generate questions from text content or topics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ai-action-text">AI Action (optional)</Label>
                  <Select value={selectedAction} onValueChange={(v) => setSelectedAction(v as any)}>
                    <SelectTrigger id="ai-action-text"><SelectValue placeholder="Choose an action..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No predefined action</SelectItem>
                      <SelectItem value="generate_questions">Generate Questions</SelectItem>
                      <SelectItem value="generate_similar">Generate Similar Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ai-custom-prompt-text">Custom Prompt (optional)</Label>
                  <Textarea
                    id="ai-custom-prompt-text"
                    placeholder="Add extra instructions for the AI..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="min-h-24"
                  />
                </div>
              </div>
                <div>
                  <Label htmlFor="content-text">Content Text</Label>
                  <Textarea
                    id="content-text"
                    placeholder="Paste educational content or describe the topic you want questions about..."
                    value={textToProcess}
                    onChange={(e) => setTextToProcess(e.target.value)}
                    className="min-h-32"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="num-questions">Number of Questions</Label>
                    <Input
                      id="num-questions"
                      type="number"
                      placeholder="10"
                      min="1"
                      max="50"
                      value={generationConfig.numQuestions}
                      onChange={(e) => setGenerationConfig(c => ({ ...c, numQuestions: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="difficulty-level">Difficulty Level</Label>
                    <Select value={generationConfig.difficulty} onValueChange={(value) => setGenerationConfig(c => ({ ...c, difficulty: value as any }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mixed">Mixed</SelectItem>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="question-type">Question Type</Label>
                    <Select value={generationConfig.format} onValueChange={(value) => setGenerationConfig(c => ({ ...c, format: value as any }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full gap-2 text-xs sm:text-sm py-2 sm:py-3" disabled={isProcessing} onClick={handleTextSubmit}>
                  <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
                  Generate Questions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generated Questions Review */}
      {!isProcessing && lastSource && generatedQuestions.length === 0 && (
        <Alert variant="default" className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 mb-2">
          <AlertTitle className="text-blue-800 dark:text-blue-200">Resume Generation</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            You have an unfinished generation session from "{lastSource.name}". Would you like to resume?
          </AlertDescription>
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={() => handleGenerateQuestions(lastSource.content, lastSource.name)}>Resume</Button>
            <Button size="sm" variant="outline" onClick={() => { setLastSource(null); try { localStorage.removeItem(STORAGE_KEY); } catch {} }}>Dismiss</Button>
          </div>
        </Alert>
      )}

      {generatedQuestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Card className="sm:rounded-lg rounded-md">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <CardTitle className="text-base sm:text-lg">Generated Questions Review</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Review and approve AI-generated questions before importing.</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" onClick={handleApproveAll}>Approve All</Button>
                  <Button variant="destructive" size="sm" onClick={() => setGeneratedQuestions([])}>Delete All</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-2 sm:p-6">
              {/* START: Import Destination UI */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">Import Destination</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="import-target-select-ai">Import Into</Label>
                    <Select value={importTarget} onValueChange={(value: any) => { setImportTarget(value); setSelectedPaperId(''); setSelectedTestId(''); setSelectedSubjectId(''); setSelectedChapterId(''); setSelectedPracticeSectionId(''); }}>
                      <SelectTrigger id="import-target-select-ai"><SelectValue placeholder="Select Target..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stream_subject">Stream → Subject</SelectItem>
                        <SelectItem value="stream_practice">Stream → PYQ/Practice</SelectItem>
                        <SelectItem value="test_series">Test Series</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="stream-select-ai">Stream</Label>
                    <Select value={selectedStreamId} onValueChange={id => { setSelectedStreamId(id); setSelectedPaperId(''); setSelectedTestSeriesId(''); setSelectedTestId(''); setSelectedSubjectId(''); setSelectedChapterId(''); setSelectedPracticeSectionId(''); }}>
                      <SelectTrigger id="stream-select-ai"><SelectValue placeholder="Select Stream..." /></SelectTrigger>
                      <SelectContent>{streams.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                {importTarget === 'stream_subject' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="subject-select-ai">Subject</Label>
                      <Select value={selectedSubjectId} onValueChange={id => { setSelectedSubjectId(id); setSelectedChapterId(''); setSelectedPaperId(''); }} disabled={!selectedStreamId}>
                        <SelectTrigger id="subject-select-ai"><SelectValue placeholder="Select Subject..." /></SelectTrigger>
                        <SelectContent>{selectedStream?.subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="chapter-select-ai">Chapter</Label>
                      <Select value={selectedChapterId} onValueChange={id => { setSelectedChapterId(id); setSelectedPaperId(''); }} disabled={!selectedSubjectId}>
                        <SelectTrigger id="chapter-select-ai"><SelectValue placeholder="Select Chapter..." /></SelectTrigger>
                        <SelectContent>{(selectedSubject?.chapters || []).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="paper-select-ai">Paper</Label>
                      <Select value={selectedPaperId} onValueChange={setSelectedPaperId} disabled={!selectedChapterId}>
                        <SelectTrigger id="paper-select-ai"><SelectValue placeholder="Select Paper..." /></SelectTrigger>
                        <SelectContent>{(selectedChapter?.papers || []).map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                {importTarget === 'stream_practice' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <Label htmlFor="practice-section-select-ai">Target</Label>
                        <Select value={selectedPracticeSectionId} onValueChange={id => { setSelectedPracticeSectionId(id); setSelectedPaperId(''); setSelectedTestType(''); setSelectedSubjectId(''); }}>
                          <SelectTrigger id="practice-section-select-ai"><SelectValue placeholder="Select Target..." /></SelectTrigger>
                          <SelectContent>{availablePracticeSections.map(ps => <SelectItem key={ps.id} value={ps.id}>{ps.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="test-type-select-ai">Test Type</Label>
                        <Select value={selectedTestType} onValueChange={setSelectedTestType} disabled={!selectedPracticeSectionId}>
                          <SelectTrigger id="test-type-select-ai"><SelectValue placeholder="Select Test Type..." /></SelectTrigger>
                          <SelectContent>
                            {selectedPracticeSection?.type === 'ALL_ROUND' && selectedPracticeSection.allRoundTypes.map(type => (
                              <SelectItem key={type} value={type}>{type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      {selectedTestType === 'SUBJECT_WISE' && (
                        <div>
                          <Label htmlFor="subject-select-ai-practice">Subject</Label>
                          <Select value={selectedSubjectId} onValueChange={id => { setSelectedSubjectId(id); setSelectedPaperId(''); }}>
                            <SelectTrigger id="subject-select-ai-practice"><SelectValue placeholder="Select Subject..." /></SelectTrigger>
                            <SelectContent>{selectedStream?.subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      )}
                      {selectedTestType === 'CHAPTER_WISE' && (
                        <div>
                          <Label htmlFor="subject-select-ai-practice-chap">Subject</Label>
                          <Select value={selectedSubjectId} onValueChange={id => { setSelectedSubjectId(id); setSelectedPaperId(''); }}>
                            <SelectTrigger id="subject-select-ai-practice-chap"><SelectValue placeholder="Select Subject..." /></SelectTrigger>
                            <SelectContent>{(selectedPracticeSection && (selectedPracticeSection as any).subjects ? (selectedPracticeSection as any).subjects : []).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      )}
                      {(selectedTestType === 'FULL_SYLLABUS' || (selectedTestType === 'SUBJECT_WISE' && selectedSubjectId) || (selectedTestType === 'CHAPTER_WISE' && selectedSubjectId)) && (
                        <div>
                          <Label htmlFor="paper-select-ai-practice">Paper/Year/Chapter</Label>
                          <Select value={selectedPaperId} onValueChange={setSelectedPaperId} disabled={!selectedTestType}>
                            <SelectTrigger id="paper-select-ai-practice"><SelectValue placeholder="Select..." /></SelectTrigger>
                            <SelectContent>
                              {selectedPracticeSection?.papers.filter((p: Paper) => {
                                if (selectedTestType === 'FULL_SYLLABUS') {
                                  return /^Full\s*Syllabus\s*-\s*\d{4}$/i.test(p.title || '');
                                }
                                if (selectedTestType === 'SUBJECT_WISE') {
                                  return p.subject_id === selectedSubjectId && !p.chapter_id;
                                }
                                if (selectedTestType === 'CHAPTER_WISE') {
                                  return p.subject_id === selectedSubjectId && !!p.chapter_id;
                                }
                                return false;
                              }).map((p: Paper) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {importTarget === 'test_series' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="test-series-select-ai">Test Series</Label>
                      <Select value={selectedTestSeriesId} onValueChange={id => { setSelectedTestSeriesId(id); setSelectedTestId(''); }} disabled={!selectedStreamId}>
                        <SelectTrigger id="test-series-select-ai"><SelectValue placeholder="Select Test Series..." /></SelectTrigger>
                        <SelectContent>{selectedStream?.testSeries?.map(ts => <SelectItem key={ts.id} value={ts.id}>{ts.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="test-select-ai">Test</Label>
                      <Select value={selectedTestId} onValueChange={setSelectedTestId} disabled={!selectedTestSeriesId}>
                        <SelectTrigger id="test-select-ai"><SelectValue placeholder="Select Test..." /></SelectTrigger>
                        <SelectContent>{selectedTestSeries?.tests.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
              {/* END: Import Destination UI */}

              {generatedQuestions.map((question) => (
                <Card key={question.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-2 sm:p-6">
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-xs sm:text-base">{question.question}</p>
                          <div className="flex items-center gap-2 mt-1 sm:mt-2">
                            <Badge variant="secondary" className="text-[10px] sm:text-xs">
                              {question.subject}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] sm:text-xs capitalize">
                              {question.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1 self-end sm:self-start">
                          <Button 
                            variant={approvedQuestions.includes(question.id) ? "secondary" : "ghost"} 
                            size="sm"
                            className="text-green-600"
                            onClick={() => handleToggleApproval(question.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {approvedQuestions.includes(question.id) ? 'Approved' : 'Approve'}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteQuestion(question.id)}>
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Array.isArray(question.options) && question.options.map((option: string, optionIndex: number) => (
                          <div
                            key={optionIndex}
                            className={`p-2 rounded border text-xs sm:text-sm ${
                              optionIndex === question.correctAnswer
                                ? 'border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300'
                                : 'border-border bg-muted/30'
                            }`}
                          >
                            <span className="font-semibold mr-2">({String.fromCharCode(65 + optionIndex)})</span>
                            {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-4">
                <Button variant="outline" size="sm" onClick={() => setGeneratedQuestions([])}>
                  Reject All
                </Button>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    className="gap-2 w-full text-xs sm:text-sm py-2 sm:py-3"
                    onClick={handleApproveAndImport}
                    disabled={((importTarget === 'stream_subject' || importTarget === 'stream_practice') && !selectedPaperId) || (importTarget === 'test_series' && !selectedTestId)}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve & Import ({generatedQuestions.length} questions)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}