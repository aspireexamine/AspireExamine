import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Header as DashboardHeader } from '@/components/layout/Header';
import { StudentDashboard, ViewState } from '@/components/student/StudentDashboard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/sonner';
import { User, Stream, NotebookFolder, Result } from '@/types';
import { getAdminDashboardData, getNotebookFoldersWithNotebooks } from '@/lib/supabaseQueries';
import { STREAMS, SAMPLE_RESULTS } from '@/utils/constants';
import { useLocalStorage } from './hooks/useLocalStorage';
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './LoginPage';
import Squares from '@/components/Squares';
import { supabase } from './lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Loader } from './components/shared/Loader';

const AppContent = () => {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [lastAuthEvent, setLastAuthEvent] = useState<string | undefined>(undefined);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [studentView, setStudentView] = useState<ViewState>(() => {
    try {
      const saved = localStorage.getItem('aspireExamineStudentView');
      return (saved as ViewState) || 'streams';
    } catch { return 'streams'; }
  });
  const [notebookFolders, setNotebookFolders] = useLocalStorage<NotebookFolder[]>('aspireExamineNotebookFolders', []);
  const [loading, setLoading] = useState(true);
  const [hasBootstrapped, setHasBootstrapped] = useState(false);
  const navigate = useNavigate();

  const [streams, setStreams] = useState<Stream[]>(() => {
    try {
      const savedUsers = localStorage.getItem('aspireExamineUsers');
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        if (users[0] && !users[0].results) {
          users[0].results = SAMPLE_RESULTS;
          localStorage.setItem('aspireExamineUsers', JSON.stringify(users));
        }
      }
      const savedStreams = localStorage.getItem('aspireExamineStreams');
      return savedStreams ? JSON.parse(savedStreams) : STREAMS;
    } catch (error) {
      console.error("Could not parse streams from localStorage", error);
      return STREAMS;
    }
  });

  // Persist streams to localStorage whenever they change (fallback on next load)
  useEffect(() => {
    try {
      localStorage.setItem('aspireExamineStreams', JSON.stringify(streams));
    } catch {}
  }, [streams]);

  // Hydrate streams from Supabase after auth state is known (avoid refetch on token refresh)
  useEffect(() => {
    const loadStreams = async () => {
      try {
        const data = await getAdminDashboardData();
        setStreams(data);
        try {
          localStorage.setItem('aspireExamineStreams', JSON.stringify(data));
        } catch {}
      } catch (e) {
        console.error('Failed to load streams from Supabase', e);
      }
    };

    // Only attempt after session is resolved and we know the user id
    if (session !== undefined) {
      loadStreams();
    }
  }, [session?.user?.id]);

  // Hydrate notebook folders from Supabase after auth state is known
  useEffect(() => {
    const loadNotebooks = async () => {
      try {
        const folders = await getNotebookFoldersWithNotebooks();
        setNotebookFolders(folders);
        try { localStorage.setItem('aspireExamineNotebookFolders', JSON.stringify(folders)); } catch {}
      } catch (e) {
        console.error('Failed to load notebook folders from Supabase', e);
      }
    };

    if (session !== undefined) {
      loadNotebooks();
    }
  }, [session?.user?.id]);

  // Realtime synchronization: refresh data when admin edits content
  useEffect(() => {
    if (!session) return;

    let refreshTimeout: any;
    const scheduleRefresh = () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(async () => {
        try {
          const [streamsData, folders] = await Promise.all([
            getAdminDashboardData(),
            getNotebookFoldersWithNotebooks()
          ]);
          setStreams(streamsData);
          setNotebookFolders(folders);
          try {
            localStorage.setItem('aspireExamineStreams', JSON.stringify(streamsData));
            localStorage.setItem('aspireExamineNotebookFolders', JSON.stringify(folders));
          } catch {}
        } catch (e) {
          console.error('Realtime refresh failed', e);
        }
      }, 300); // debounce bursts of changes
    };

    const channel = supabase
      .channel('student-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'streams' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subjects' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chapters' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'papers' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'practice_sections' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'practice_section_papers' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'practice_section_subjects' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'practice_section_chapters' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'test_series' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tests' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notebook_folders' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notebooks' }, scheduleRefresh)
      .subscribe();

    return () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  // Persist student view across reloads
  useEffect(() => {
    try { localStorage.setItem('aspireExamineStudentView', studentView); } catch {}
  }, [studentView]);

  // In-app back/forward navigation within /student using History state
  useEffect(() => {
    if (window.location.pathname === '/student') {
      try { window.history.replaceState({ studentView, restored: true }, document.title); } catch {}
    }
    const onPop = (event: PopStateEvent) => {
      if (window.location.pathname === '/student') {
        const state = (event.state || {}) as any;
        const nextView = state.studentView || 'streams';
        setStudentView(nextView as ViewState);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (window.location.pathname === '/student') {
      try { window.history.pushState({ studentView, restored: true }, document.title); } catch {}
    }
  }, [studentView]);

  // Restore last visited student view on app load
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aspireExamineStudentView');
      if (saved) setStudentView(saved as ViewState);
    } catch {}
  }, []);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLastAuthEvent(undefined);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setLastAuthEvent(event);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async () => {
    if (!session?.user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, role, full_name, contact_number, date_of_birth, address, profile_picture')
        .eq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no row was found
        console.error('Error fetching profile:', error);
        await supabase.auth.signOut();
        return;
      }

      let user: User;

      if (profile) {
        user = {
          id: session.user.id,
          email: session.user.email!,
          role: (profile.role as 'student' | 'admin') || 'student',
          name: profile.full_name || session.user.email || 'New User',
          avatar: profile.profile_picture || `https://i.pravatar.cc/150?u=${session.user.id}`,
          contact_number: profile.contact_number || undefined,
          date_of_birth: profile.date_of_birth || undefined,
          address: profile.address || undefined,
        };
      } else {
        // Create a profile if it doesn't exist
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: session.user.id, role: 'student', full_name: session.user.email })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          await supabase.auth.signOut();
          return;
        }
        user = {
          id: session.user.id,
          email: session.user.email!,
          role: (newProfile.role as 'student' | 'admin') || 'student',
          name: newProfile.full_name || session.user.email || 'New User',
          avatar: newProfile.profile_picture || `https://i.pravatar.cc/150?u=${session.user.id}`,
        };
      }

      setCurrentUser(user);
      return user;

    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    if (session === undefined) return;

    const handleAuthChange = async () => {
      // Ignore token refreshes and passive updates to prevent UI "refresh" feel
      if (lastAuthEvent === 'TOKEN_REFRESHED' || lastAuthEvent === 'USER_UPDATED') return;

      if (!hasBootstrapped) setLoading(true);
      if (session?.user) {
        const user = await fetchUserProfile();
        if (user) {
          const currentPath = window.location.pathname;
          if (currentPath === '/' || currentPath === '/login') {
            navigate(user.role === 'admin' ? '/admin' : '/student');
          }
        }
      } else {
        setCurrentUser(null);
        const currentPath = window.location.pathname;
        if (currentPath !== '/' && currentPath !== '/login') {
          navigate('/login');
        }
      }
      setLoading(false);
      if (!hasBootstrapped) setHasBootstrapped(true);
    };

    handleAuthChange();
  }, [session, lastAuthEvent]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    navigate('/');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    try {
      const savedUsers = localStorage.getItem('aspireExamineUsers');
      const users = savedUsers ? JSON.parse(savedUsers) : [];
      const userIndex = users.findIndex((u: User) => u.id === updatedUser.id);
      if (userIndex > -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('aspireExamineUsers', JSON.stringify(users));
      }
    } catch (error) {
      console.error("Failed to update user in localStorage", error);
    }
  };

  const handleAddResult = (result: Result) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, results: [...(currentUser.results || []), result] };
    setCurrentUser(updatedUser);
  };

  const { theme } = useTheme();
  const squaresborderColor = theme === 'dark' ? '#374151' : '#E5E7EB';
  const squaresHoverFillColor = theme === 'dark' ? '#4B5563' : '#D1D5DB';

  if (loading && !hasBootstrapped) {
    return <Loader />;
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 z-0">
        <Squares
          borderColor={squaresborderColor}
          hoverFillColor={squaresHoverFillColor}
          speed={0.5}
          squareSize={50}
        />
      </div>
      <div className="relative z-10 min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage onGetStarted={() => navigate('/login')} onLogin={() => navigate('/login')} onSignup={() => navigate('/login')} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/student"
            element={
              <ProtectedRoute user={currentUser} role="student">
                <DashboardLayout user={currentUser} onLogout={handleLogout} studentView={studentView} setStudentView={setStudentView}>
                  <StudentDashboard
                    user={currentUser!}
                    streams={streams}
                    currentView={studentView}
                    setCurrentView={setStudentView}
                    onProfileUpdate={fetchUserProfile}
                    onAddResult={handleAddResult}
                    notebookFolders={notebookFolders}
                  />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute user={currentUser} role="admin">
                <DashboardLayout user={currentUser} onLogout={handleLogout} studentView={studentView} setStudentView={setStudentView}>
                  <AdminDashboard
                    streams={streams}
                    setStreams={setStreams}
                    user={currentUser!}
                    onUpdateUser={handleUpdateUser}
                    notebookFolders={notebookFolders}
                    setNotebookFolders={setNotebookFolders}
                  />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
      </div>
    </div>
  );
}

const DashboardLayout = ({ user, onLogout, studentView, setStudentView, children }: { user: User | null, onLogout: () => void, studentView: ViewState, setStudentView: (view: ViewState) => void, children: React.ReactNode }) => {
  const [viewMode, setViewMode] = useState<'student' | 'admin'>(user?.role || 'student');

  const handleViewAs = (role: 'student' | 'admin') => {
    setViewMode(role);
    if (role === 'student') setStudentView('streams');
  };

  const isAdminViewingAsStudent = user?.role === 'admin' && viewMode === 'student';

  return (
    <div className="min-h-screen bg-background">
      {studentView !== 'exam' && (
        <DashboardHeader
          user={user || undefined}
          onLogout={onLogout}
          onNavigate={setStudentView}
          isAdminViewingAsStudent={isAdminViewingAsStudent}
          onReturnToAdmin={() => handleViewAs('admin')}
        />
      )}
      {children}
    </div>
  );
};

const ProtectedRoute = ({ user, role, children }: { user: User | null, role: 'student' | 'admin', children: JSX.Element }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
  }

  return children;
};


function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App;