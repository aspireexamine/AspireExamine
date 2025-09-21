import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
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
import { Stream, Subject, Paper, PracticeSection, PracticeSubject, Chapter, YearEntry } from '@/types';
import { Plus, Edit, Trash2, BookOpen, Library, X, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { getAdminDashboardData, updatePaper as updatePaperApi, deletePaper as deletePaperApi } from '@/lib/supabaseQueries';
import { toast } from 'sonner';

interface StreamsManagementProps {
  streams: Stream[];
  setStreams: React.Dispatch<React.SetStateAction<Stream[]>>;
}

const emptyStreamFormData = { name: '', description: '', imageUrl: '' };
const emptySubjectFormData = { 
  name: '', 
  chapters: [{ serial: 1, name: '', paperIds: [] as string[] }] 
};


const emptyPracticeSectionFormData = {
  name: '',
  description: '',
  type: 'ALL_ROUND' as 'ALL_ROUND' | 'TEST_SERIES',
  allRoundTypes: ['FULL_SYLLABUS'] as ('FULL_SYLLABUS' | 'SUBJECT_WISE' | 'CHAPTER_WISE')[],
  subjects: [] as { id: string; name: string; chapters: { id: string; name: string }[] }[],
  paperIds: [] as string[],
  years: [] as { year: string; }[],
  subjectWiseData: {} as Record<string, { year: string; }[]>
};

export function StreamsManagement({ streams, setStreams }: StreamsManagementProps) {
  const [isStreamDialogOpen, setIsStreamDialogOpen] = useState(false);
  const [streamDialogMode, setStreamDialogMode] = useState<'create' | 'edit'>('create'); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);
  const [streamToDelete, setStreamToDelete] = useState<Stream | null>(null);
  const [streamFormData, setStreamFormData] = useState(emptyStreamFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refetchStreams, setRefetchStreams] = useState(false);

  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [subjectDialogMode, setSubjectDialogMode] = useState<'create' | 'edit'>('create'); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<{ streamId: string; subject: Subject } | null>(null);
  const [paperSearchTerms, setPaperSearchTerms] = useState<Record<number, string>>({});
  const [subjectFormData, setSubjectFormData] = useState(emptySubjectFormData);

  const [isPracticeSectionDialogOpen, setIsPracticeSectionDialogOpen] = useState(false);
  const [practiceSectionDialogMode, setPracticeSectionDialogMode] = useState<'create' | 'edit'>('create');
  const [currentPracticeSection, setCurrentPracticeSection] = useState<PracticeSection | null>(null);
  const [practiceSectionToDelete, setPracticeSectionToDelete] = useState<{ streamId: string; section: PracticeSection } | null>(null);
  const [practiceSectionFormData, setPracticeSectionFormData] = useState<typeof emptyPracticeSectionFormData>(emptyPracticeSectionFormData);
  const [isManagePapersOpen, setIsManagePapersOpen] = useState(false);
  const [sectionForPapers, setSectionForPapers] = useState<PracticeSection | null>(null);
  const [paperEditModalOpen, setPaperEditModalOpen] = useState(false);
  const [paperBeingEdited, setPaperBeingEdited] = useState<Paper | null>(null);
  const [paperEditForm, setPaperEditForm] = useState({
    title: '',
    duration: 180,
    total_questions: 100,
    max_marks: 400,
    difficulty: 'Medium' as Paper['difficulty'],
    yearStr: '',
  });

  // Helper functions to open dialogs
  const handleOpenStreamDialog = (mode: 'create' | 'edit', stream?: Stream) => {
    setStreamDialogMode(mode);
    setCurrentStream(stream || null);
    setIsStreamDialogOpen(true);
  };

  const handleOpenSubjectDialog = (mode: 'create' | 'edit', stream: Stream, subject?: Subject) => {
    setSubjectDialogMode(mode);
    setCurrentStream(stream);
    setCurrentSubject(subject || null);
    setIsSubjectDialogOpen(true);
  };

  const handleOpenPracticeSectionDialog = (mode: 'create' | 'edit', stream: Stream, section?: PracticeSection) => {
    setPracticeSectionDialogMode(mode);
    setCurrentStream(stream);
    setCurrentPracticeSection(section || null);
    setIsPracticeSectionDialogOpen(true);
  };
  const handleOpenManagePapers = (stream: Stream, section: PracticeSection) => {
    // Prefer the freshest section instance from state if available
    const latestSection = (stream.practiceSections || []).find(ps => ps.id === section.id) || section;
    setCurrentStream(stream);
    setSectionForPapers(latestSection);
    setIsManagePapersOpen(true);
  };
  const openPaperEdit = (paper: Paper) => {
    setPaperBeingEdited(paper);
    const subjectId = (paper as any).subject_id as string | null;
    const chapterId = (paper as any).chapter_id as string | null;
    const subject = subjectId ? currentStream?.subjects.find(s => s.id === subjectId) : undefined;
    const subjectName = subject?.name || '';
    const subjectWiseRegex = subjectName ? new RegExp(`^${subjectName.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\s*-\\s*\\d{4}$`) : /^.+?\s*-\s*\d{4}$/;
    const isFullSyllabus = !subjectId && /^Full Syllabus\s*-\s*\d{4}$/.test(paper.title || '');
    const isSubjectWise = !!subjectId && !chapterId && subjectWiseRegex.test(paper.title || '');
    const yearMatch = (isFullSyllabus || isSubjectWise) ? (paper.title || '').match(/(\d{4})$/) : null;
    setPaperEditForm({
      title: paper.title,
      duration: Number((paper as any).duration || 180),
      total_questions: Number((paper as any).total_questions || 100),
      max_marks: Number((paper as any).max_marks || 400),
      difficulty: (paper as any).difficulty || 'Medium',
      yearStr: yearMatch?.[1] || '',
    });
    setPaperEditModalOpen(true);
  };
  const savePaperEdit = async () => {
    if (!paperBeingEdited) return;
    try {
      const subjectId = (paperBeingEdited as any).subject_id as string | null;
      const chapterId = (paperBeingEdited as any).chapter_id as string | null;
      const subject = subjectId ? currentStream?.subjects.find(s => s.id === subjectId) : undefined;
      const subjectName = subject?.name || '';
      const chapterName = subject && chapterId ? (subject.chapters || []).find(c => c.id === chapterId)?.name : undefined;

      let nextTitle = paperEditForm.title;
      if (!subjectId) {
        // Full Syllabus
        nextTitle = `Full Syllabus - ${String(paperEditForm.yearStr || '').trim()}`;
      } else if (subjectId && !chapterId) {
        // Subject-wise
        nextTitle = `${subjectName} - ${String(paperEditForm.yearStr || '').trim()}`;
      } else if (subjectId && chapterId) {
        // Chapter-wise
        nextTitle = `${subjectName} - ${chapterName || ''}`.trim();
      }
      await updatePaperApi({
        id: paperBeingEdited.id,
        title: nextTitle,
        duration: Number(paperEditForm.duration),
        total_questions: Number(paperEditForm.total_questions),
        max_marks: Number(paperEditForm.max_marks),
        difficulty: paperEditForm.difficulty,
      } as any);
      setPaperEditModalOpen(false);
      setPaperBeingEdited(null);
      setRefetchStreams(prev => !prev);
    } catch (e) {
      console.error('Failed to update paper', e);
    }
  };
  const deletePaperFromSection = async (paper: Paper, section?: PracticeSection) => {
    try {
      if (section) {
        await supabase.from('practice_section_papers').delete().eq('practice_section_id', (section as any).id).eq('paper_id', paper.id);
      } else {
        await supabase.from('practice_section_papers').delete().eq('paper_id', paper.id);
      }
      await deletePaperApi(paper.id);
      // Optimistically update local UI
      setSectionForPapers(prev => prev ? ({ ...prev, papers: (prev.papers || []).filter(p => p.id !== paper.id) }) as any : prev);
      if (currentStream) {
        setStreams(prev => prev.map(s => s.id !== currentStream!.id ? s : ({
          ...s,
          practiceSections: (s.practiceSections || []).map(ps => {
            const targetId = (section || sectionForPapers)?.id;
            if (ps.id !== targetId) return ps;
            return { ...ps, papers: (ps.papers || []).filter(p => p.id !== paper.id) } as any;
          })
        })));
      }
      toast.success('Paper deleted');
      setRefetchStreams(prev => !prev);
    } catch (e) {
      console.error('Failed to delete paper', e);
      toast.error('Failed to delete paper');
    }
  };
  
  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const data = await getAdminDashboardData();
        setStreams(data);
      } catch (e) {
        console.error('Error fetching streams:', e);
      }
    };

    fetchStreams();
  }, [setStreams, refetchStreams]);

  useEffect(() => {
    if (streamDialogMode === 'edit' && currentStream) {
      setStreamFormData({ name: currentStream.name, description: currentStream.description, imageUrl: currentStream.imageUrl || '' });
    } else {
      setStreamFormData(emptyStreamFormData);
    }
  }, [streamDialogMode, currentStream, isStreamDialogOpen]);

  useEffect(() => {
    if (subjectDialogMode === 'edit' && currentSubject) {
      const chaptersData = (currentSubject.chapters || []).map(c => ({
        serial: c.serial || 0,
        name: c.name,
        paperIds: (c.papers || []).map((p: Paper) => p.id)
      }));
      setSubjectFormData({ name: currentSubject.name, chapters: chaptersData.length ? chaptersData : [{ serial: 1, name: '', paperIds: [] }] });
    } else {
      setSubjectFormData(emptySubjectFormData);
    }
  }, [subjectDialogMode, currentSubject, isSubjectDialogOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (practiceSectionDialogMode === 'edit' && currentPracticeSection) {
        const baseData = {
            name: currentPracticeSection.name,
            description: currentPracticeSection.description,
            type: currentPracticeSection.type,
        };

        if (currentPracticeSection.type === 'ALL_ROUND') {
            const years: YearEntry[] = [];
            const subjectWiseData: Record<string, YearEntry[]> = {};
            const chapterWiseSubjects: PracticeSubject[] = [];
            const newChapterInput: Record<string, string> = {};

            // Process papers for FULL_SYLLABUS and SUBJECT_WISE years
            currentPracticeSection.papers?.forEach(paper => {
                const paperSubjectId = (paper as any).subject_id;
                if (currentPracticeSection.allRoundTypes?.includes('SUBJECT_WISE') && paperSubjectId) {
                    const subjectWiseMatch = paper.title.match(/ - (\d{4})$/);
                    const year = subjectWiseMatch?.[1];
                    if (year) {
                        if (!subjectWiseData[paperSubjectId]) {
                            subjectWiseData[paperSubjectId] = [];
                        }
                        if (!subjectWiseData[paperSubjectId].some(y => y.year === year)) {
                            subjectWiseData[paperSubjectId].push({ year });
                        }
                    }
                } else if (currentPracticeSection.allRoundTypes?.includes('FULL_SYLLABUS')) {
                    const fullSyllabusMatch = paper.title.match(/^Full Syllabus - (\d{4})$/);
                    if (fullSyllabusMatch && fullSyllabusMatch[1] && !years.some(y => y.year === fullSyllabusMatch[1])) {
                        years.push({ year: fullSyllabusMatch[1] });
                    }
                }
            });

            // Process subjects and chapters for CHAPTER_WISE
            if (currentPracticeSection.allRoundTypes?.includes('CHAPTER_WISE')) {
                const chaptersBySubject: Record<string, Chapter[]> = {};
                currentPracticeSection.chapters?.forEach((chapter: Chapter) => {
                    const subjectId = (chapter as any).subject_id;
                    if (subjectId) {
                        if (!chaptersBySubject[subjectId]) {
                            chaptersBySubject[subjectId] = [];
                        }
                        chaptersBySubject[subjectId].push(chapter);
                    }
                });

                currentPracticeSection.subjects?.forEach(subject => {
                    const chapters = chaptersBySubject[subject.id] || [];
                    chapterWiseSubjects.push({
                        ...subject,
                        chapters: chapters.map(c => ({ id: c.id, name: c.name })),
                    });
                    if (chapters.length > 0) {
                        newChapterInput[subject.id] = chapters.map(c => c.name).join(', ');
                    }
                });
            }
            // chapter input text state removed; UI now uses chapter checkboxes

            setPracticeSectionFormData({
                ...emptyPracticeSectionFormData,
                ...baseData,
                allRoundTypes: currentPracticeSection.allRoundTypes,
                subjects: chapterWiseSubjects.length > 0 ? chapterWiseSubjects : currentPracticeSection.subjects,
                years: years.length > 0 ? years : (currentPracticeSection.years || []),
                subjectWiseData: Object.keys(subjectWiseData).length > 0 ? subjectWiseData : (currentPracticeSection.subjectWiseData || {}),
                paperIds: currentPracticeSection.papers?.map(p => p.id) ?? []
            });
        } else { // TEST_SERIES
            setPracticeSectionFormData({
                ...emptyPracticeSectionFormData,
                ...baseData,
                paperIds: currentPracticeSection.papers?.map(p => p.id) ?? []
            });
        }
    } else {
        setPracticeSectionFormData(emptyPracticeSectionFormData);
    }
}, [practiceSectionDialogMode, currentPracticeSection, isPracticeSectionDialogOpen]);


 const handleStreamSubmit = async () => {
    if (!streamFormData.name) return;
    setIsSubmitting(true);

    if (streamDialogMode === 'create') {
      const { data } = await supabase
        .from('streams')
        .insert([{
          name: streamFormData.name,
          description: streamFormData.description,
          image_url: streamFormData.imageUrl
        }])
        .select();

      if (data) {
        const newStream: Stream = { ...data[0], description: data[0].description ?? '', subjects: [], practiceSections: [] };
        setStreams(prev => [newStream, ...prev]);
        setRefetchStreams(prev => !prev);
      }
    } else if (currentStream) {
      const { data } = await supabase
        .from('streams')
        .update({ 
          name: streamFormData.name, 
          description: streamFormData.description,
          image_url: streamFormData.imageUrl
        })
        .eq('id', currentStream.id)
        .select();

      if (data) {
        setStreams(streams.map(s => s.id === currentStream.id ? { ...s, ...data[0], description: data[0].description ?? '' } : s));
        setRefetchStreams(prev => !prev);
      }
    }
    setIsStreamDialogOpen(false);
    setIsSubmitting(false);
  };
  
  const handleDeleteStream = async () => {
    if (streamToDelete) {
      const { error } = await supabase
        .from('streams')
        .delete()
        .eq('id', streamToDelete.id);

      if (!error) {
        setStreams(streams.filter(s => s.id !== streamToDelete.id));
      }
      setStreamToDelete(null);
    }
  };

  const handleSubjectSubmit = async () => {
    if (!subjectFormData.name || !currentStream) return;

    if (subjectDialogMode === 'create') {
      const { data: subjectData } = await supabase
        .from('subjects')
        .insert([{
          name: subjectFormData.name,
          stream_id: currentStream.id
        }])
        .select();

      if (subjectData) {
        const newSubject = subjectData[0];
        const chaptersToInsert = subjectFormData.chapters
          .filter(c => c.name.trim())
          .map((c, index) => ({
            name: c.name.trim(),
            serial: c.serial || index + 1,
            subject_id: newSubject.id
          }));

        if (chaptersToInsert.length > 0) {
          await supabase.from('chapters').insert(chaptersToInsert);
        }

        const updatedStream = { 
          ...currentStream, 
          subjects: [...currentStream.subjects.map(s => ({ ...s, streamId: s.streamId || '' })), { ...newSubject, streamId: newSubject.stream_id || '', chapters: chaptersToInsert.map(c => ({id: c.subject_id + '-' + c.serial, name: c.name, serial: c.serial, papers: []} as Chapter)) }] 
        };
        setStreams(streams.map(s => s.id === currentStream.id ? updatedStream : s));
      }
    } else if (currentSubject) {
      const { data: subjectData } = await supabase
        .from('subjects')
        .update({ name: subjectFormData.name })
        .eq('id', currentSubject.id)
        .select();

      if (subjectData) {
        const updatedSubject = subjectData[0];
        await supabase.from('chapters').delete().eq('subject_id', currentSubject.id);
        const chaptersToInsert = subjectFormData.chapters
          .filter(c => c.name.trim())
          .map((c, index) => ({
            name: c.name.trim(),
            serial: c.serial || index + 1,
            subject_id: currentSubject.id
          }));

        if (chaptersToInsert.length > 0) {
          await supabase.from('chapters').insert(chaptersToInsert);
        }

        const updatedStream = { 
          ...currentStream, 
          subjects: currentStream.subjects.map(s => s.id === currentSubject.id ? { ...updatedSubject, streamId: updatedSubject.stream_id || '', chapters: chaptersToInsert.map(c => ({id: c.subject_id + '-' + c.serial, name: c.name, serial: c.serial, papers: []} as Chapter)) } : { ...s, streamId: s.streamId || '' })
        };
        setStreams(streams.map(s => s.id === currentStream.id ? updatedStream : s));
      }
    }

    setIsSubjectDialogOpen(false);
  };

  const handleDeleteSubject = async () => {
    if (subjectToDelete) {
      const { streamId, subject } = subjectToDelete;
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subject.id);

      if (!error) {
        setStreams(streams.map(s => s.id === streamId ? { ...s, subjects: s.subjects.filter(sub => sub.id !== subject.id) } : s));
      }
      setSubjectToDelete(null);
    }
  };

  const handleChapterDataChange = (index: number, field: 'name' | 'serial', value: string | number) => {
    const newChapters = [...subjectFormData.chapters];
    const chapter = newChapters[index];
    if (field === 'name' && typeof value === 'string') {
      chapter.name = value;
    } else if (field === 'serial' && typeof value === 'number') {
      chapter.serial = value;
    }
    setSubjectFormData(prev => ({ ...prev, chapters: newChapters }));
  };

  const handleAddChapterField = () => {
    setSubjectFormData(prev => ({
      ...prev,
      chapters: [...prev.chapters, { serial: prev.chapters.length + 1, name: '', paperIds: [] }]
    }));
  };

  const handleRemoveChapterField = (index: number) => {
    if (subjectFormData.chapters.length <= 1) return;
    const newChapters = subjectFormData.chapters.filter((_, i) => i !== index);
    setSubjectFormData(prev => ({ ...prev, chapters: newChapters }));
  };

  const handleChapterPaperChange = (chapterIndex: number, paperId: string, checked: boolean) => {
    const newChapters = [...subjectFormData.chapters];
    const paperIds = newChapters[chapterIndex].paperIds;
    newChapters[chapterIndex].paperIds = checked ? [...paperIds, paperId] : paperIds.filter(id => id !== paperId);
    setSubjectFormData(prev => ({ ...prev, chapters: newChapters }));
  };

  const handlePracticeSectionSubmit = async () => {
    if (!practiceSectionFormData.name || !currentStream) return;

    const { name, description, type, allRoundTypes, paperIds, subjects: practiceSubjects, years, subjectWiseData } = practiceSectionFormData;

    let sectionId: string | undefined;
    let errorOccurred = false;

    // Step 1: Create or Update the Practice Section
    if (practiceSectionDialogMode === 'create') {
      const { data, error } = await supabase
        .from('practice_sections')
        .insert([{ name, description, type, all_round_types: allRoundTypes, stream_id: currentStream.id }])
        .select('id')
        .single();

      if (error || !data) {
        console.error('Error creating practice section:', error);
        errorOccurred = true;
      } else {
        sectionId = data.id;
      }
    } else if (currentPracticeSection) {
      const { data, error } = await supabase
        .from('practice_sections')
        .update({ name, description, type, all_round_types: allRoundTypes })
        .eq('id', currentPracticeSection.id)
        .select('id')
        .single();

      if (error || !data) {
        console.error('Error updating practice section:', error);
        errorOccurred = true;
      } else {
        sectionId = data.id;
        // Clean up old relations only on successful update
        await supabase.from('practice_section_papers').delete().eq('practice_section_id', sectionId);
        await supabase.from('practice_section_subjects').delete().eq('practice_section_id', sectionId);
        await supabase.from('practice_section_chapters').delete().eq('practice_section_id', sectionId);
      }
    } else {
      return; // Should not happen
    }

    if (errorOccurred || !sectionId) return;

    // Step 2: Insert new relations based on type
    let allPaperIdsToLink = [...paperIds];

    // Create and link papers from years
    if (type === 'ALL_ROUND') {
      const desiredDescriptors: Array<{ title: string; subject_id: string | null }>= [];
      if (allRoundTypes.includes('FULL_SYLLABUS') && years.length > 0) {
        for (const yearEntry of years) {
          desiredDescriptors.push({ title: `Full Syllabus - ${yearEntry.year}`, subject_id: null });
        }
      }
      if (allRoundTypes.includes('SUBJECT_WISE') && Object.keys(subjectWiseData).length > 0) {
        for (const subjectId in subjectWiseData) {
          for (const yearEntry of subjectWiseData[subjectId]) {
            // Subject-wise paper titled with subject name + year
            const subj = currentStream.subjects.find(s => s.id === subjectId);
            if (subj) {
              desiredDescriptors.push({ title: `${subj.name} - ${yearEntry.year}`, subject_id: subjectId });
            }
          }
        }
      }

      if (desiredDescriptors.length > 0) {
        const titles = Array.from(new Set(desiredDescriptors.map(d => d.title)));
        let existingPapers: Array<{ id: string; title: string; subject_id: string | null }> = [];
        if (titles.length > 0) {
          const { data: existing, error: existingErr } = await supabase
            .from('papers')
            .select('id, title, subject_id')
            .eq('stream_id', currentStream.id)
            .in('title', titles as string[]);
          if (existingErr) {
            console.error('Error checking existing year-based papers:', existingErr);
          } else if (existing) {
            existingPapers = existing as any;
          }
        }

        const existingKeyToId = new Map<string, string>();
        for (const p of existingPapers) {
          const key = `${p.title}::${p.subject_id ?? 'null'}`;
          existingKeyToId.set(key, p.id);
        }

        const papersToInsert: Array<{
          title: string;
          difficulty: string;
          duration: number;
          total_questions: number;
          max_marks: number;
          stream_id: string;
          subject_id?: string | null;
        }> = [];

        const defaultPaperFields = {
          difficulty: 'Medium',
          duration: 180,
          total_questions: 100,
          max_marks: 400,
          stream_id: currentStream.id,
        } as const;

        for (const d of desiredDescriptors) {
          const key = `${d.title}::${d.subject_id ?? 'null'}`;
          const existingId = existingKeyToId.get(key);
          if (existingId) {
            allPaperIdsToLink.push(existingId);
          } else {
            papersToInsert.push({
              title: d.title,
              ...defaultPaperFields,
              subject_id: d.subject_id,
            });
          }
        }

        if (papersToInsert.length > 0) {
          const { data: newPapers, error: paperInsertError } = await supabase
            .from('papers')
            .insert(papersToInsert)
            .select('id');
          if (paperInsertError) {
            console.error('Error creating year-based papers:', paperInsertError);
          } else if (newPapers) {
            allPaperIdsToLink.push(...newPapers.map(p => p.id));
          }
        }
      }
    }

    if (allPaperIdsToLink.length > 0) {
      const papersToInsert = allPaperIdsToLink.map(paper_id => ({ practice_section_id: sectionId, paper_id }));
      const { error } = await supabase.from('practice_section_papers').insert(papersToInsert);
      if (error) console.error('Error linking papers:', error);
    }

    if (type === 'ALL_ROUND' && allRoundTypes.includes('CHAPTER_WISE') && practiceSubjects.length > 0) {
      const subjectsToInsert = practiceSubjects.map(s => ({ practice_section_id: sectionId, subject_id: s.id }));
      const { error: subjectError } = await supabase.from('practice_section_subjects').insert(subjectsToInsert);
      if (subjectError) {
        console.error('Error linking subjects:', subjectError);
      } else {
        const subjectIds = practiceSubjects.map(s => s.id);
        const { data: allChaptersInSubjects, error: chaptersError } = await supabase
          .from('chapters')
          .select('id, name, subject_id')
          .in('subject_id', subjectIds);

        if (chaptersError) {
          console.error('Error fetching chapters for linking:', chaptersError);
        } else if (allChaptersInSubjects) {
          // Ensure all typed chapters exist; create missing ones
          const chaptersArray = [...allChaptersInSubjects];
          const missingChapterInserts: Array<{ name: string; subject_id: string; serial?: number | null }> = [];
          for (const subjectFromForm of practiceSubjects) {
            const existingNames = new Set(
              chaptersArray.filter(c => c.subject_id === subjectFromForm.id).map(c => c.name)
            );
            for (const ch of subjectFromForm.chapters) {
              if (!existingNames.has(ch.name)) {
                missingChapterInserts.push({ name: ch.name, subject_id: subjectFromForm.id });
              }
            }
          }

          if (missingChapterInserts.length > 0) {
            const { data: createdChapters, error: createChapterErr } = await supabase
              .from('chapters')
              .insert(missingChapterInserts)
              .select('id, name, subject_id');
            if (createChapterErr) {
              console.error('Error creating missing chapters for chapter-wise:', createChapterErr);
            } else if (createdChapters) {
              chaptersArray.push(...createdChapters as any);
            }
          }

          // Link selected chapters to section
          const selectedChapterRows = practiceSubjects.flatMap(subjectFromForm => {
            const chapterNamesFromForm = new Set(subjectFromForm.chapters.map(c => c.name));
            return chaptersArray
              .filter(chapterFromDB =>
                chapterFromDB.subject_id === subjectFromForm.id &&
                chapterNamesFromForm.has(chapterFromDB.name)
              );
          });

          const chaptersToLink = selectedChapterRows.map(ch => ({ practice_section_id: sectionId, chapter_id: ch.id }));
          if (chaptersToLink.length > 0) {
            const { error: chapterInsertError } = await supabase.from('practice_section_chapters').insert(chaptersToLink);
            if (chapterInsertError) console.error('Error linking chapters:', chapterInsertError);
          }

          // Create missing chapter-wise papers and link them to the practice section
          const subjectIdToName = new Map(practiceSubjects.map(s => [s.id, s.name] as const));
          const desiredChapterPapers = selectedChapterRows.map(ch => ({
            title: `${subjectIdToName.get(ch.subject_id!) || 'Subject'} - ${ch.name}`,
            subject_id: ch.subject_id as string,
            chapter_id: ch.id as string,
          }));

          if (desiredChapterPapers.length > 0) {
            const desiredChapterIds = Array.from(new Set(desiredChapterPapers.map(d => d.chapter_id)));
            // Find existing papers for these chapters in the same stream
            const { data: existingChapterPapers, error: existingChErr } = await supabase
              .from('papers')
              .select('id, chapter_id')
              .eq('stream_id', currentStream.id)
              .in('chapter_id', desiredChapterIds);
            if (existingChErr) {
              console.error('Error checking existing chapter papers:', existingChErr);
            }

            const existingByChapterId = new Map<string, string>((existingChapterPapers || []).map(p => [p.chapter_id as string, p.id]));

            const defaultPaperFields = {
              difficulty: 'Medium',
              duration: 180,
              total_questions: 100,
              max_marks: 400,
              stream_id: currentStream.id,
            } as const;

            const chapterPapersToInsert = desiredChapterPapers
              .filter(d => !existingByChapterId.has(d.chapter_id))
              .map(d => ({ ...defaultPaperFields, title: d.title, subject_id: d.subject_id, chapter_id: d.chapter_id }));

            const newChapterPaperIds: string[] = [];
            if (chapterPapersToInsert.length > 0) {
              const { data: createdPapers, error: createErr } = await supabase
                .from('papers')
                .insert(chapterPapersToInsert)
                .select('id');
              if (createErr) {
                console.error('Error creating chapter-wise papers:', createErr);
              } else if (createdPapers) {
                newChapterPaperIds.push(...createdPapers.map(p => p.id));
              }
            }

            // Collect all chapter paper ids (existing + newly created) and link them to the section
            const allChapterPaperIds = [
              ...Array.from(existingByChapterId.values()),
              ...newChapterPaperIds,
            ];
            if (allChapterPaperIds.length > 0) {
              const linkRows = allChapterPaperIds.map(pid => ({ practice_section_id: sectionId, paper_id: pid }));
              const { error: linkErr } = await supabase.from('practice_section_papers').insert(linkRows);
              if (linkErr) console.error('Error linking chapter papers:', linkErr);
            }
          }
        }
      }
    }

    // Step 3: Manually update local state for immediate UI feedback
    const streamToUpdate = streams.find(s => s.id === currentStream.id);
    if (streamToUpdate) {
        let newSectionForState: PracticeSection;
        if (type === 'ALL_ROUND') {
            newSectionForState = {
                id: sectionId,
                name: name,
                description: description,
                type: 'ALL_ROUND',
                allRoundTypes: allRoundTypes,
                papers: [], 
                subjects: practiceSubjects,
                years: years,
                subjectWiseData: subjectWiseData,
            };
        } else { // TEST_SERIES
            newSectionForState = {
                id: sectionId,
                name: name,
                description: description,
                type: 'TEST_SERIES',
                papers: [],
            };
        }

        const updatedStream = {
            ...streamToUpdate,
            practiceSections: practiceSectionDialogMode === 'create'
                ? [...(streamToUpdate.practiceSections || []), newSectionForState]
                : (streamToUpdate.practiceSections || []).map(ps => ps.id === sectionId ? newSectionForState : ps)
        };

        setStreams(streams.map(s => s.id === currentStream.id ? updatedStream : s));
    }

    // Step 4: Refresh local state from DB in the background and close dialog
    setRefetchStreams(prev => !prev);
    setIsPracticeSectionDialogOpen(false);
  };

  

  const handleDeletePracticeSection = async () => {
    if (practiceSectionToDelete) {
        const { streamId, section } = practiceSectionToDelete;
        const { error } = await supabase
          .from('practice_sections')
          .delete()
          .eq('id', section.id);

        if (!error) {
          setStreams(streams.map(s => s.id === streamId ? { ...s, practiceSections: (s.practiceSections || []).filter(sec => sec.id !== section.id) } : s));
        }
        setPracticeSectionToDelete(null);
    }
  };

  const handleAddPracticeSubject = () => {
    setPracticeSectionFormData((prev: typeof emptyPracticeSectionFormData) => ({
        ...prev,
        subjects: [...(prev.subjects || []), { id: `ps-sub-${Date.now()}`, name: '', chapters: [] }]
    }));
  };
  
  const handlePracticeSubjectChange = (index: number, subjectId: string) => {
      setPracticeSectionFormData((prev: typeof emptyPracticeSectionFormData) => {
          const newSubjects = [...prev.subjects] as PracticeSubject[];
          const subject = newSubjects[index];
          const streamSubject = currentStream?.subjects.find(s => s.id === subjectId);
          subject.id = subjectId;
          subject.name = streamSubject?.name || '';
          return { ...prev, subjects: newSubjects };
      });
  };

  const handleRemovePracticeSubject = (index: number) => {
    setPracticeSectionFormData((prev: typeof emptyPracticeSectionFormData) => ({
      ...prev,
      subjects: (prev.subjects || []).filter((_: PracticeSubject, i: number) => i !== index)
    }));
  };

  const handleTogglePracticeChapter = (subjectIndex: number, chapter: Chapter, checked: boolean) => {
    setPracticeSectionFormData((prev: typeof emptyPracticeSectionFormData) => {
      const subjects = [...prev.subjects] as PracticeSubject[];
      const sub = subjects[subjectIndex];
      const current = sub.chapters || [];
      const exists = current.some(c => c.id === chapter.id);
      let next: Chapter[];
      if (checked && !exists) {
        next = [...current, { id: chapter.id, name: chapter.name } as Chapter];
      } else if (!checked && exists) {
        next = current.filter(c => c.id !== chapter.id);
      } else {
        next = current;
      }
      subjects[subjectIndex] = { ...sub, chapters: next } as PracticeSubject;
      return { ...prev, subjects };
    });
  };

  // Chapter input text removed; selections use checkboxes now
  
  const handleSubjectWiseYearsChange = (subjectId: string, years: string) => {
    const yearEntries = years.split(',').map(y => y.trim()).filter(Boolean).map(year => ({ year }));
    setPracticeSectionFormData((prev: typeof emptyPracticeSectionFormData) => ({ ...prev, subjectWiseData: { ...prev.subjectWiseData, [subjectId]: yearEntries } }));
  };

  const handleFullSyllabusYearsChange = (years: string) => {
    const yearEntries = years.split(',').map(y => y.trim()).filter(Boolean).map(year => ({ year }));
    setPracticeSectionFormData((prev: typeof emptyPracticeSectionFormData) => ({ ...prev, years: yearEntries }));
  };


  const allPapers = useMemo(() => {
    const papersFromStreams = streams.flatMap(s => s.subjects.flatMap(sub => sub.papers || []));
    const papersFromCurrentSubject = subjectDialogMode === 'edit' && currentSubject
      ? currentSubject.chapters?.flatMap(c => c.papers || []) || []
      : [];
    return Array.from(new Set([...papersFromStreams, ...papersFromCurrentSubject]));
  }, [streams, subjectDialogMode, currentSubject]);

  // Keep Manage Papers view synced with latest stream/section data after refetches
  useEffect(() => {
    if (!isManagePapersOpen || !sectionForPapers) return;
    const latestStream = streams.find(s => s.id === currentStream?.id);
    const latestSection = latestStream?.practiceSections?.find(ps => ps.id === sectionForPapers.id);
    if (latestSection) {
      setSectionForPapers(latestSection);
    }
  }, [streams, isManagePapersOpen, sectionForPapers?.id, currentStream?.id]);
  
  return (
    <div className="space-y-6">
      <Button onClick={() => handleOpenStreamDialog('create')} className="w-full sm:w-auto gap-2">
        <Plus className="h-4 w-4" /> Create Stream
      </Button>
      
      <Dialog open={isStreamDialogOpen} onOpenChange={setIsStreamDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{streamDialogMode === 'create' ? 'Create New Stream' : 'Edit Stream'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label htmlFor="stream-name">Stream Name</Label><Input id="stream-name" value={streamFormData.name} onChange={(e) => setStreamFormData({ ...streamFormData, name: e.target.value })} disabled={isSubmitting} /></div>
            <div><Label htmlFor="stream-description">Description</Label><Textarea id="stream-description" value={streamFormData.description} onChange={(e) => setStreamFormData({ ...streamFormData, description: e.target.value })} disabled={isSubmitting} /></div>
            <div><Label htmlFor="stream-image-url">Image URL</Label><Input id="stream-image-url" value={streamFormData.imageUrl} onChange={(e) => setStreamFormData({ ...streamFormData, imageUrl: e.target.value })} placeholder="https://example.com/image.png" disabled={isSubmitting} /></div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline" disabled={isSubmitting}>Cancel</Button></DialogClose><Button onClick={handleStreamSubmit} disabled={isSubmitting}>{isSubmitting ? (streamDialogMode === 'create' ? 'Creating...' : 'Saving...') : (streamDialogMode === 'create' ? 'Create' : 'Save')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">{subjectDialogMode === 'create' ? 'Add New Subject' : 'Edit Subject'}</DialogTitle>
              <DialogDescription>To stream: {currentStream?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div><Label htmlFor="subject-name">Subject Name</Label><Input id="subject-name" value={subjectFormData.name} onChange={(e) => setSubjectFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., Physics, Organic Chemistry" /></div>
              <div className="space-y-3">
                <Label>Chapters</Label>
                {subjectFormData.chapters.map((chapter, index) => (
                  <div key={index} className="p-3 border rounded-md space-y-3 bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Input type="number" placeholder="No." value={chapter.serial} onChange={e => handleChapterDataChange(index, 'serial', Number(e.target.value))} className="w-16 h-9" />
                      <Input placeholder="Chapter Name" value={chapter.name} onChange={e => handleChapterDataChange(index, 'name', e.target.value)} className="h-9" />
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveChapterField(index)} disabled={subjectFormData.chapters.length <= 1}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="papers" className="border-none">
                        <AccordionTrigger className="text-xs p-2">Assign Papers ({chapter.paperIds.length})</AccordionTrigger>
                        <AccordionContent className="p-2 space-y-2">
                          <Input 
                            placeholder="Search papers..." 
                            className="h-8 text-xs"
                            value={paperSearchTerms[index] || ''}
                            onChange={(e) => setPaperSearchTerms(prev => ({ ...prev, [index]: e.target.value }))}
                          />
                          <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                          {(currentStream?.subjects.flatMap(s => 
                              s.chapters?.flatMap(c => c.papers || []) || []
                            ) || [])
                            .filter(p => p.title.toLowerCase().includes((paperSearchTerms[index] || '').toLowerCase()))
                            .map(paper => (
                            <div key={paper.id} className="flex items-center space-x-2"><Checkbox id={`p-${index}-${paper.id}`} checked={chapter.paperIds.includes(paper.id)} onCheckedChange={(checked) => handleChapterPaperChange(index, paper.id, !!checked)} /><Label htmlFor={`p-${index}-${paper.id}`} className="text-xs font-normal">{paper.title}</Label></div>
                          ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddChapterField} className="w-full"><Plus className="h-4 w-4 mr-2" />Add Another Chapter</Button>
              </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2">
              <DialogClose asChild><Button variant="outline" className="w-full sm:w-auto">Cancel</Button></DialogClose><Button onClick={handleSubjectSubmit} className="w-full sm:w-auto">{subjectDialogMode === 'create' ? 'Add Subject' : 'Save Changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isPracticeSectionDialogOpen} onOpenChange={setIsPracticeSectionDialogOpen}>
          <DialogContent className="sm:max-w-3xl p-0 flex flex-col h-[90vh]">
              <DialogHeader className="p-4 sm:p-6 pb-0"><DialogTitle className="text-lg sm:text-xl">{practiceSectionDialogMode === 'create' ? 'Create New Practice Section' : 'Edit Practice Section'}</DialogTitle><DialogDescription>Configure practice tests for this stream.</DialogDescription></DialogHeader>
              <div className="flex-grow space-y-4 py-2 overflow-y-auto px-4 sm:px-6 hide-scrollbar">
                  <div><Label htmlFor="ps-name" className="text-sm">Section Name</Label><Input id="ps-name" value={practiceSectionFormData.name} onChange={(e) => setPracticeSectionFormData(prev => ({...prev, name: e.target.value}))} className="h-9 mt-1 text-sm" /></div>
                  <div><Label htmlFor="ps-desc" className="text-sm">Description</Label><Textarea id="ps-desc" value={practiceSectionFormData.description} onChange={(e) => setPracticeSectionFormData(prev => ({...prev, description: e.target.value}))} className="mt-1 text-sm" /></div>
                  <div>
                      <Label>Section Type</Label>
                      <Select value={practiceSectionFormData.type} onValueChange={(v: 'ALL_ROUND' | 'TEST_SERIES') => setPracticeSectionFormData(prev => ({...prev, type: v}))} disabled={practiceSectionDialogMode === 'edit'} >
                          <SelectTrigger className="h-9 text-sm"><SelectValue/></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="ALL_ROUND">All-Round Practice</SelectItem>
                              <SelectItem value="TEST_SERIES">Test Series</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                  
                  {practiceSectionFormData.type === 'ALL_ROUND' && (
                    <div className="space-y-4">
                      <Label className="text-sm">Practice Types</Label>
                      <div className="grid grid-cols-3 gap-2 rounded-lg border p-2">
                        {(['FULL_SYLLABUS', 'SUBJECT_WISE', 'CHAPTER_WISE'] as const).map(testType => (
                          <div key={testType} className="flex items-center space-x-2">
                            <Checkbox
                              id={`type-${testType}`}
                              checked={practiceSectionFormData.allRoundTypes.includes(testType)}
                              onCheckedChange={(checked) => {
                                setPracticeSectionFormData((prev: typeof emptyPracticeSectionFormData) => {
                                  const newTypes = checked
                                    ? [...prev.allRoundTypes, testType]
                                    : prev.allRoundTypes.filter((t: string) => t !== testType);
                                  return { ...prev, allRoundTypes: newTypes };
                                });
                              }}
                            />
                            <label htmlFor={`type-${testType}`} className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {testType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </label>
                          </div>
                        ))}
                      </div>

                      {practiceSectionFormData.allRoundTypes.includes('FULL_SYLLABUS') && (
                        <div className="space-y-2 rounded-md border p-3 sm:p-4">
                          <Label htmlFor="ps-years" className="text-sm">Full Syllabus Years (comma-separated)</Label>
                          <Input id="ps-years" placeholder="e.g., 2024, 2023, 2022" value={practiceSectionFormData.years?.map((y: { year: string }) => y.year).join(', ') || ''} onChange={(e) => handleFullSyllabusYearsChange(e.target.value)} className="h-9 mt-1" />
                          <div className="flex flex-wrap gap-2 pt-2">
                            {practiceSectionFormData.years?.map((entry: YearEntry) => (
                              <Badge key={entry.year} variant="secondary">{entry.year}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {practiceSectionFormData.allRoundTypes.includes('SUBJECT_WISE') && (
                        <div className="space-y-3 rounded-md border p-3 sm:p-4">
                          <h4 className="font-semibold text-sm">Subject-wise Years</h4>
                          {currentStream?.subjects.map((subject: Subject) => (
                            <div key={subject.id} className="space-y-2 p-2 sm:p-3 rounded-md border bg-muted/50">
                              <Label htmlFor={`ps-years-${subject.id}`} className="text-sm">{subject.name} (comma-separated)</Label>
                              <Input id={`ps-years-${subject.id}`} placeholder="e.g., 2024, 2023" value={practiceSectionFormData.subjectWiseData[subject.id]?.map((y: { year: string }) => y.year).join(', ') || ''} onChange={(e) => handleSubjectWiseYearsChange(subject.id, e.target.value)} className="h-9 mt-1" />                              <div className="flex flex-wrap gap-2 pt-2">
                                {practiceSectionFormData.subjectWiseData[subject.id]?.map((entry: YearEntry) => (
                                  <Badge key={entry.year} variant="secondary">{entry.year}</Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
  
                      {practiceSectionFormData.allRoundTypes.includes('CHAPTER_WISE') && (
                        <div className="space-y-3 rounded-md border p-3 sm:p-4">
                            <div className="flex items-center justify-between"><h4 className="font-semibold text-sm">Subjects & Chapters</h4><Button size="sm" onClick={handleAddPracticeSubject} className="h-8"><Plus className="h-4 w-4 mr-2"/>Add Subject</Button></div>
                            {practiceSectionFormData.subjects.map((sub: PracticeSubject, index: number) => {
                              const selectedSubject = currentStream?.subjects.find(s => s.id === sub.id);
                              const availableChapters = selectedSubject?.chapters || [];
                              return (
                                <div key={sub.id} className="space-y-2 rounded-md border bg-muted/50 p-2 sm:p-3">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-grow space-y-1">
                                      <Select onValueChange={(value) => handlePracticeSubjectChange(index, value)} value={selectedSubject?.id || 'new-subject'}>
                                        <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
                                        <SelectContent>
                                          {currentStream?.subjects.map((s: Subject) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 self-start" onClick={() => handleRemovePracticeSubject(index)}><X className="h-4 w-4"/></Button>
                                  </div>

                                  {selectedSubject ? (
                                    <div className="space-y-2 rounded-md border bg-background p-2">
                                      <Label className="text-xs">Select Chapters</Label>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-40 overflow-y-auto pr-1">
                                        {availableChapters.map((c: Chapter) => {
                                          const checked = (sub.chapters || []).some(ch => ch.id === c.id);
                                          return (
                                            <div key={c.id} className="flex items-center space-x-2">
                                              <Checkbox id={`ch-${sub.id}-${c.id}`} checked={checked} onCheckedChange={(val) => handleTogglePracticeChapter(index, c, !!val)} />
                                              <Label htmlFor={`ch-${sub.id}-${c.id}`} className="text-xs font-normal">{c.name}</Label>
                                            </div>
                                          );
                                        })}
                                      </div>
                                      <div className="flex flex-wrap gap-2 pt-2">
                                        {(sub.chapters || []).map((chapter: Chapter) => (
                                          <Badge key={chapter.id} variant="secondary">{chapter.name}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-muted-foreground">Select a subject to choose chapters.</p>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  )}
  
                  {practiceSectionFormData.type === 'TEST_SERIES' && (
                       <div className="space-y-2 rounded-md border p-3 sm:p-4">
                          <h4 className="font-semibold text-sm">Select Papers</h4>
                          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                            {allPapers.map((paper: Paper) => (
                                <div key={paper.id} className="flex items-center space-x-2">
                                    <Checkbox id={`paper-${paper.id}`} checked={practiceSectionFormData.paperIds.includes(paper.id)} onCheckedChange={(checked: boolean) => {
                                        setPracticeSectionFormData((prev: typeof emptyPracticeSectionFormData) => ({ ...prev, paperIds: checked ? [...prev.paperIds, paper.id] : prev.paperIds.filter((id: string) => id !== paper.id)}))
                                    }}/>
                                    <Label htmlFor={`paper-${paper.id}`} className="text-sm font-normal">{paper.title}</Label>
                                </div>
                            ))}
                          </div>
                       </div>
                  )}
              </div><DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 border-t p-4 sm:p-6">
                <DialogClose asChild><Button variant="outline" className="w-full sm:w-auto">Cancel</Button></DialogClose>
                <Button onClick={handlePracticeSectionSubmit} className="w-full sm:w-auto">{practiceSectionDialogMode === 'create' ? 'Create Section' : 'Save Changes'}</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      <AlertDialog open={!!streamToDelete} onOpenChange={() => setStreamToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogDescription>This will permanently delete the "{streamToDelete?.name}" stream and all its content.</AlertDialogDescription>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteStream}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!subjectToDelete} onOpenChange={() => setSubjectToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
            <AlertDialogDescription>This will permanently delete the "{subjectToDelete?.subject.name}" subject.</AlertDialogDescription>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteSubject}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!practiceSectionToDelete} onOpenChange={() => setPracticeSectionToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
            <AlertDialogDescription>This will permanently delete the "{practiceSectionToDelete?.section.name}" section.</AlertDialogDescription>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeletePracticeSection}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Manage Papers Dialog */}
      <Dialog open={isManagePapersOpen} onOpenChange={setIsManagePapersOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Papers{sectionForPapers ? ` — ${sectionForPapers.name}` : ''}</DialogTitle>
            <DialogDescription>View, edit, or delete papers in this practice section.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
            {sectionForPapers && (sectionForPapers as any).type === 'ALL_ROUND' && (
              <div className="space-y-4">
                {(sectionForPapers as any).allRoundTypes?.includes('FULL_SYLLABUS') && (
                  <div className="rounded-md border p-3">
                    <h4 className="font-semibold text-sm mb-2">Full Syllabus</h4>
                    <div className="space-y-2">
                      {(sectionForPapers as any).papers
                        ?.filter((p: any) => /^Full Syllabus\s*-\s*/.test(p.title || ''))
                        .map((p: Paper) => (
                          <div key={p.id} className="flex items-center justify-between rounded bg-muted/50 p-2">
                            <span className="text-sm">{p.title}</span>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openPaperEdit(p)}><Edit className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deletePaperFromSection(p, sectionForPapers!)}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                {(sectionForPapers as any).allRoundTypes?.includes('SUBJECT_WISE') && (
                  <div className="rounded-md border p-3">
                    <h4 className="font-semibold text-sm mb-2">Subject-wise</h4>
                    <div className="space-y-2">
                      {(sectionForPapers as any).papers
                        // Subject-wise: has subject_id, no chapter_id, and title ends with "- YYYY"
                        ?.filter((p: any) => !!p.subject_id && !p.chapter_id && /\s-\s*\d{4}$/.test(p.title || ''))
                        .map((p: Paper) => (
                          <div key={p.id} className="flex items-center justify-between rounded bg-muted/50 p-2">
                            <span className="text-sm">{p.title}</span>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openPaperEdit(p)}><Edit className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deletePaperFromSection(p, sectionForPapers!)}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                {(sectionForPapers as any).allRoundTypes?.includes('CHAPTER_WISE') && (
                  <div className="rounded-md border p-3">
                    <h4 className="font-semibold text-sm mb-2">Chapter-wise</h4>
                    <div className="space-y-2">
                      {(() => {
                        const chapters: any[] = (sectionForPapers as any).chapters || [];
                        if (!chapters.length) {
                          return <p className="text-xs text-muted-foreground">No chapters linked yet.</p>;
                        }
                        const bySubject: Record<string, any[]> = {};
                        for (const ch of chapters) {
                          const sid = (ch as any).subject_id || 'unknown';
                          if (!bySubject[sid]) bySubject[sid] = [];
                          bySubject[sid].push(ch);
                        }
                        const subjectEntries = Object.entries(bySubject);
                        return subjectEntries.map(([subjectId, subjectChapters]) => {
                          const subjectName = currentStream?.subjects.find(s => s.id === subjectId)?.name
                            || (sectionForPapers as any).subjects?.find((s: any) => s.id === subjectId)?.name
                            || 'Subject';
                          return (
                            <div key={subjectId} className="space-y-1">
                              <div className="text-xs font-medium">{subjectName}</div>
                              {(subjectChapters as any[]).map((c: any) => {
                                const paper = (sectionForPapers as any).papers?.find((pp: any) => (pp.chapter_id || '') === c.id)
                                  || (sectionForPapers as any).papers?.find((pp: any) => (pp.title || '').endsWith(`- ${c.name}`));
                                return (
                                  <div key={c.id} className="flex items-center justify-between rounded bg-muted/30 p-2">
                                    <span className="text-sm">{c.name}{paper ? ` — ${paper.title}` : ''}</span>
                                    {paper && (
                                      <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openPaperEdit(paper)}><Edit className="h-3.5 w-3.5" /></Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deletePaperFromSection(paper, sectionForPapers!)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Paper Modal */}
      <Dialog open={paperEditModalOpen} onOpenChange={setPaperEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Paper</DialogTitle>
            <DialogDescription>Update paper details.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2">
              <Label htmlFor="pp-title">Title</Label>
              <Input
                id="pp-title"
                value={paperEditForm.title}
                onChange={(e) => setPaperEditForm(f => ({ ...f, title: e.target.value }))}
                disabled={
                  /^Full Syllabus\s*-\s*\d{4}$/.test(paperEditForm.title || '') ||
                  // Subject-wise: Subject - YYYY
                  /\s-\s*\d{4}$/.test(paperEditForm.title || '') ||
                  // Chapter-wise: Subject - Chapter
                  /\s-\s*.+$/.test(paperEditForm.title || '')
                }
              />
            </div>
            {(/^Full Syllabus\s*-\s*\d{4}$/.test(paperEditForm.title || '') || /\s-\s*\d{4}$/.test(paperEditForm.title || '')) && (
              <div>
                <Label htmlFor="pp-year">Year</Label>
                <Input id="pp-year" type="number" value={paperEditForm.yearStr} onChange={(e) => setPaperEditForm(f => ({ ...f, yearStr: e.target.value }))} />
              </div>
            )}
            <div>
              <Label htmlFor="pp-duration">Duration</Label>
              <Input id="pp-duration" type="number" value={paperEditForm.duration} onChange={(e) => setPaperEditForm(f => ({ ...f, duration: Number(e.target.value) }))} />
            </div>
            <div>
              <Label htmlFor="pp-total">Total Questions</Label>
              <Input id="pp-total" type="number" value={paperEditForm.total_questions} onChange={(e) => setPaperEditForm(f => ({ ...f, total_questions: Number(e.target.value) }))} />
            </div>
            <div>
              <Label htmlFor="pp-marks">Max Marks</Label>
              <Input id="pp-marks" type="number" value={paperEditForm.max_marks} onChange={(e) => setPaperEditForm(f => ({ ...f, max_marks: Number(e.target.value) }))} />
            </div>
            <div>
              <Label htmlFor="pp-diff">Difficulty</Label>
              <Select value={paperEditForm.difficulty} onValueChange={(v) => setPaperEditForm(f => ({ ...f, difficulty: v as any }))}>
                <SelectTrigger id="pp-diff"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={savePaperEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="grid gap-6">
        {streams.map((stream, index) => (
          <motion.div key={stream.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.3 }} className="sm:overflow-hidden">
            <Card className="border hover:shadow-md transition-all duration-200">
              <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">{stream.imageUrl ? <img src={stream.imageUrl} alt={stream.name} className="h-5 w-5 object-cover rounded-sm" /> : <BookOpen className="h-5 w-5 text-primary" />}</div>
                          <div><CardTitle className="text-base sm:text-xl">{stream.name}</CardTitle><CardDescription className="mt-1 text-xs sm:text-sm">{stream.description}</CardDescription></div>
                      </div>
                       <div className="flex items-center gap-0 sm:gap-2"><Button variant="ghost" size="icon" onClick={() => handleOpenStreamDialog('edit', stream)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setStreamToDelete(stream)}><Trash2 className="h-4 w-4" /></Button></div>
                  </div>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4 items-start p-4 pt-0 sm:p-6 sm:pt-0 ">
                  <div className="space-y-3 rounded-lg border p-3 sm:p-4 flex flex-col h-full">
                      <div className="flex items-center justify-between"><h4 className="font-semibold flex items-center gap-2 text-sm sm:text-base"><BookOpen className="h-4 w-4"/>Subjects</h4><Button size="sm" variant="outline" className="gap-1 h-8" onClick={() => handleOpenSubjectDialog('create', stream)}><Plus className="h-3.5 w-3.5" /> Add</Button></div>
                      <div className="space-y-2 flex-grow">
                        {stream.subjects.length > 0 ? stream.subjects.map(subject => (
                          <div key={subject.id} className="flex items-center justify-between rounded-md border bg-background p-2 pl-3">
                            <span className="text-sm font-medium">{subject.name}</span>
                            <div className="flex items-center">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenSubjectDialog('edit', stream, subject)}><Edit className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => setSubjectToDelete({ streamId: stream.id, subject })}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </div>
                        )) : (
                          <p className="text-sm text-muted-foreground text-center py-4">No subjects added yet.</p>
                        )}
                      </div>
                  </div>
                  <div className="space-y-3 rounded-lg border p-3 sm:p-4 flex flex-col h-full">
                      <div className="flex items-center justify-between"><h4 className="font-semibold flex items-center gap-2 text-sm sm:text-base"><Library className="h-4 w-4"/>Practice Sections</h4><Button size="sm" variant="outline" className="gap-1 h-8" onClick={() => handleOpenPracticeSectionDialog('create', stream)}><Plus className="h-3.5 w-3.5" /> Add</Button></div>
                      <div className="space-y-2 flex-grow">
                        {(stream.practiceSections && stream.practiceSections.length > 0) ? stream.practiceSections.map(section => (
                          <div key={section.id} className="flex items-center justify-between rounded-md border bg-background p-2 pl-3">
                            <span className="text-sm font-medium">{section.name}</span>
                            <div className="flex items-center">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenPracticeSectionDialog('edit', stream, section)}><Edit className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => setPracticeSectionToDelete({ streamId: stream.id, section })}><Trash2 className="h-3.5 w-3.5" /></Button>
                              <Button variant="outline" size="sm" className="ml-1 h-8" onClick={() => handleOpenManagePapers(stream, section)}>
                                <FileText className="h-3.5 w-3.5 mr-1" /> Manage
                              </Button>
                            </div>
                          </div>
                        )) : (
                          <p className="text-sm text-muted-foreground text-center py-4">No practice sections added yet.</p>
                        )}
                      </div>
                  </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {streams.length === 0 && (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No streams yet</h3>
              <p className="text-muted-foreground text-center mb-4">Get started by creating your first examination stream.</p>
              <Button onClick={() => handleOpenStreamDialog('create')} className="gap-2"><Plus className="h-4 w-4" />Create First Stream</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}