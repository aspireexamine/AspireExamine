
import { supabase } from './supabaseClient';
import { Stream, Paper, Question } from '@/types';

// Fetch all data needed for the admin dashboard
export const getAdminDashboardData = async (): Promise<Stream[]> => {
  const { data: streamsData, error } = await supabase
    .from('streams')
    .select(`
      *,
      subjects (*, chapters (*, papers (*, questions (*)))),
      practice_sections (
        *,
        practice_section_papers(papers(*, questions(*))),
        practice_section_subjects(subjects(*)),
        practice_section_chapters(chapters(*))
      ),
      test_series (*, tests(*, questions(*)))
    `);

  if (error) {
    console.error("Error fetching admin dashboard data:", error);
    throw error;
  }

  if (!streamsData) {
    return [];
  }

  const mapDbQuestion = (q: any): Question => ({
    id: q.id,
    paperId: q.paper_id || '',
    question: q.question,
    imageUrl: q.image_url || '',
    options: q.options || [],
    correctAnswer: q.correct_answer,
    explanation: q.explanation || '',
    difficulty: q.difficulty,
    subject: q.subject || '',
    topic: q.topic || '',
    marks: q.marks ?? 1,
    filePath: q.file_path || '',
    testId: q.test_id || undefined,
  });

  const processedStreams = streamsData.map(stream => {
    return {
      ...stream,
      imageUrl: (stream as any).image_url || undefined,
      description: stream.description ?? '',
      subjects: (stream.subjects || []).map((s: any) => ({
        ...s,
        streamId: stream.id,
        chapters: (s.chapters || []).map((c: any) => ({
          ...c,
          papers: (c.papers || []).map((p: any) => ({
            ...p,
            questions: (p.questions || []).map(mapDbQuestion).filter(Boolean),
          })).filter(Boolean),
        }))
      })),
      practiceSections: (stream.practice_sections || []).map((ps: any) => {
        const { all_round_types, practice_section_papers, practice_section_subjects, practice_section_chapters, ...rest } = ps;
        return {
          ...rest,
          allRoundTypes: all_round_types,
          papers: (practice_section_papers || []).map((p: any) => ({
            ...p.papers,
            questions: ((p.papers || {}).questions || []).map(mapDbQuestion).filter(Boolean),
          })).filter(Boolean),
          subjects: (practice_section_subjects || []).map((s: any) => s.subjects).filter(Boolean),
          chapters: (practice_section_chapters || []).map((c: any) => c.chapters).filter(Boolean),
        };
      }),
      testSeries: (stream.test_series || []).map((ts: any) => ({
        ...ts,
        tests: (ts.tests || []).map((t: any) => ({
          ...t,
          numQuestions: t.numQuestions ?? t.numquestions ?? 0,
          questions: (t.questions || []).map(mapDbQuestion).filter(Boolean),
        })).filter(Boolean),
      })),
    };
  });

  return processedStreams as Stream[];
};

// Paper Management
export const addPaper = async (paper: Omit<Paper, 'id' | 'created_at' | 'attempts' | 'questions'>) => {
  const { data, error } = await supabase.from('papers').insert([paper]).select().single();
  if (error) throw error;
  return data;
};

export const updatePaper = async (paper: Partial<Paper> & { id: string }) => {
  const { id, questions, ...paperData } = paper;
  const { data, error } = await supabase.from('papers').update(paperData).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deletePaper = async (paperId: string) => {
  const { error } = await supabase.from('papers').delete().eq('id', paperId);
  if (error) throw error;
};

// Questions Management
export const addQuestion = async (question: Omit<Question, 'id' | 'createdAt'> & { paperId?: string; testId?: string }) => {
  const payload: any = {
    paper_id: (question as any).paperId || null,
    test_id: (question as any).testId || null,
    question: question.question,
    image_url: question.imageUrl || null,
    options: question.options || [],
    correct_answer: question.correctAnswer,
    explanation: question.explanation || null,
    difficulty: question.difficulty,
    subject: question.subject || null,
    topic: question.topic || null,
    marks: question.marks ?? 1,
    file_path: question.filePath || null,
  };
  const { data, error } = await supabase.from('questions' as any).insert([payload]).select('*').single();
  if (error) throw error;
  return data;
};

export const updateQuestion = async (question: Partial<Question> & { id: string }) => {
  const payload: any = {
    paper_id: (question as any).paperId || null,
    test_id: (question as any).testId || null,
    question: question.question,
    image_url: (question as any).imageUrl,
    options: question.options,
    correct_answer: (question as any).correctAnswer,
    explanation: (question as any).explanation,
    difficulty: (question as any).difficulty,
    subject: (question as any).subject,
    topic: (question as any).topic,
    marks: (question as any).marks,
    file_path: (question as any).filePath,
  };
  // Remove undefined keys to avoid overwriting with null unintentionally
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
  const { data, error } = await supabase.from('questions' as any).update(payload).eq('id', question.id).select('*').single();
  if (error) throw error;
  return data;
};

export const deleteQuestions = async (questionIds: string[]) => {
  if (!questionIds.length) return;
  const { error } = await supabase.from('questions' as any).delete().in('id', questionIds);
  if (error) throw error;
};

export const bulkAddQuestions = async (
  rows: Array<{
    paper_id: string | null;
    test_id: string | null;
    question: string;
    image_url?: string | null;
    options: string[];
    correct_answer: number;
    explanation?: string | null;
    difficulty: string;
    subject?: string | null;
    topic?: string | null;
    marks?: number | null;
    file_path?: string | null;
  }>
) => {
  if (!rows.length) return [] as { id: string }[];
  const chunkSize = 500;
  const created: { id: string }[] = [];
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { data, error } = await supabase
      .from('questions' as any)
      .insert(chunk)
      .select('id');
    if (error) throw error;
    if (data) created.push(...(data as any));
  }
  return created;
};

// AI Provider Keys
type AIProviderKeys = {
  google_gemini_key?: string | null;
  openrouter_key?: string | null;
  groq_key?: string | null;
};

export const getAIProviderKeys = async (): Promise<AIProviderKeys> => {
  const { data, error } = await supabase
    .from('ai_provider_keys' as any)
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error && error.code !== 'PGRST116') throw error; // ignore no rows
  const row: any = data as any;
  return {
    google_gemini_key: row?.google_gemini_key ?? null,
    openrouter_key: row?.openrouter_key ?? null,
    groq_key: row?.groq_key ?? null,
  };
};

export const upsertAIProviderKeys = async (keys: AIProviderKeys) => {
  const payload: any = {
    google_gemini_key: keys.google_gemini_key ?? null,
    openrouter_key: keys.openrouter_key ?? null,
    groq_key: keys.groq_key ?? null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('ai_provider_keys' as any)
    .insert([payload])
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

// Platform Settings
export type PlatformSettings = {
  platform_name: string | null;
  admin_email: string | null;
  platform_description: string | null;
  exam_auto_submit: boolean | null;
  exam_prevent_copy: boolean | null;
  exam_show_immediate_results: boolean | null;
  exam_warning_minutes: number | null;
  exam_critical_minutes: number | null;
  updated_at?: string | null;
};

export const getPlatformSettings = async (): Promise<PlatformSettings> => {
  const { data, error } = await supabase
    .from('platform_settings' as any)
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error && error.code !== 'PGRST116') throw error;
  const row: any = data || {};
  return {
    platform_name: row.platform_name ?? null,
    admin_email: row.admin_email ?? null,
    platform_description: row.platform_description ?? null,
    exam_auto_submit: row.exam_auto_submit ?? true,
    exam_prevent_copy: row.exam_prevent_copy ?? true,
    exam_show_immediate_results: row.exam_show_immediate_results ?? true,
    exam_warning_minutes: row.exam_warning_minutes ?? 5,
    exam_critical_minutes: row.exam_critical_minutes ?? 1,
    updated_at: row.updated_at ?? null,
  };
};

export const upsertPlatformSettings = async (settings: PlatformSettings) => {
  const payload: any = {
    platform_name: settings.platform_name ?? null,
    admin_email: settings.admin_email ?? null,
    platform_description: settings.platform_description ?? null,
    exam_auto_submit: settings.exam_auto_submit ?? true,
    exam_prevent_copy: settings.exam_prevent_copy ?? true,
    exam_show_immediate_results: settings.exam_show_immediate_results ?? true,
    exam_warning_minutes: settings.exam_warning_minutes ?? 5,
    exam_critical_minutes: settings.exam_critical_minutes ?? 1,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('platform_settings' as any)
    .insert([payload])
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

// Notebook Management
export const getNotebookFoldersWithNotebooks = async () => {
  const { data, error } = await supabase
    .from('notebook_folders' as any)
    .select('*, notebooks(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    notebooks: (f.notebooks || []).map((n: any) => ({
      id: n.id,
      name: n.name,
      url: n.url,
      uploadedAt: n.uploaded_at,
    })),
  }));
};

export const createNotebookFolder = async (name: string) => {
  const { data, error } = await supabase.from('notebook_folders' as any).insert([{ name }]).select('*').single();
  if (error) throw error;
  return data;
};

export const updateNotebookFolder = async (id: string, name: string) => {
  const { data, error } = await supabase.from('notebook_folders' as any).update({ name }).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
};

export const deleteNotebookFolder = async (id: string) => {
  const { error } = await supabase.from('notebook_folders' as any).delete().eq('id', id);
  if (error) throw error;
};

export const createNotebook = async (folderId: string, name: string, url: string) => {
  const payload = { folder_id: folderId, name, url } as any;
  const { data, error } = await supabase.from('notebooks' as any).insert([payload]).select('*').single();
  if (error) throw error;
  return data;
};

export const updateNotebook = async (id: string, name: string, url: string) => {
  const { data, error } = await supabase.from('notebooks' as any).update({ name, url }).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
};

export const deleteNotebook = async (id: string) => {
  const { error } = await supabase.from('notebooks' as any).delete().eq('id', id);
  if (error) throw error;
};

export const uploadNotebookFile = async (file: File, folderId: string) => {
  const path = `${folderId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from('notebooks').upload(path, file, { upsert: false });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from('notebooks').getPublicUrl(path);
  return data.publicUrl;
};

// Test Series Management
export const createTestSeries = async (streamId: string, name: string, description: string) => {
  const payload = { stream_id: streamId, name, description } as any;
  const { data, error } = await supabase.from('test_series').insert([payload]).select('*').single();
  if (error) throw error;
  return data;
};

export const updateTestSeries = async (id: string, name: string, description: string) => {
  const { data, error } = await supabase.from('test_series').update({ name, description }).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
};

export const deleteTestSeries = async (id: string) => {
  const { error } = await supabase.from('test_series').delete().eq('id', id);
  if (error) throw error;
};

export const createTest = async (seriesId: string, name: string, numQuestions: number, duration: number) => {
  const payload = { test_series_id: seriesId, name, numquestions: numQuestions, duration } as any;
  const { data, error } = await supabase.from('tests').insert([payload]).select('*').single();
  if (error) throw error;
  return data;
};

export const updateTest = async (id: string, name: string, numQuestions: number, duration: number) => {
  const payload = { name, numquestions: numQuestions, duration } as any;
  const { data, error } = await supabase.from('tests').update(payload).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
};

export const deleteTest = async (id: string) => {
  const { error } = await supabase.from('tests').delete().eq('id', id);
  if (error) throw error;
};

// Stream Management
export const addStream = async (stream: Omit<Stream, 'id' | 'subjects' | 'practiceSections' | 'testSeries'>) => {
  const { data, error } = await supabase.from('streams').insert([stream]).select();
  if (error) throw error;
  return data[0];
};

export const updateStream = async (stream: Pick<Stream, 'id' | 'name' | 'description' | 'imageUrl'>) => {
  const { data, error } = await supabase.from('streams').update(stream).eq('id', stream.id).select();
  if (error) throw error;
  return data[0];
};

export const deleteStream = async (streamId: string) => {
  const { error } = await supabase.from('streams').delete().eq('id', streamId);
  if (error) throw error;
};

// Users Management
export type ProfileRow = {
  id: string;
  full_name: string | null;
  role: string | null;
  profile_picture?: string | null;
  contact_number?: string | null;
  address?: string | null;
  date_of_birth?: string | null;
  // Optional email if present in profiles
  email?: string | null;
};

export const getAllProfiles = async (): Promise<ProfileRow[]> => {
  const res = await supabase
    .from('profiles' as any)
    .select('*')
    .order('full_name', { ascending: true });
  if (res.error) throw res.error;
  const rows = (res.data || []) as any[];
  return rows.map(r => ({
    id: r.id,
    full_name: r.full_name ?? null,
    role: r.role ?? null,
    profile_picture: r.profile_picture ?? null,
    contact_number: r.contact_number ?? null,
    address: r.address ?? null,
    date_of_birth: r.date_of_birth ?? null,
    email: r.email ?? null,
  }));
};
