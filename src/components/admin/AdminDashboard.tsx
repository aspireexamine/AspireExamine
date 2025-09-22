import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminSidebar } from './AdminSidebar';
import { StreamsManagement } from './StreamsManagement';
import { PapersManagement } from './PapersManagement';
import { QuestionsManagement } from './QuestionsManagement';
import { BulkImport } from './BulkImport';
import { NotebookManager } from './NotebookManager';
import { TestManager } from './TestManager';
import { AITools } from './AITools';
import { UsersManagement } from './UsersManagement';
import { Analytics } from './Analytics';
import { SettingsPanel as AdminSettingsPanel } from './SettingsPanel';
import { ProfilePage } from '../student/ProfilePage';
import { Toaster } from '@/components/ui/sonner';
import { AnalyticsData, Stream, User, NotebookFolder, Question } from '@/types';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Target,
  LayoutDashboard,
} from 'lucide-react';

const mockAnalyticsData: AnalyticsData = {
  totalStudents: 12450,
  totalPapers: 248,
  totalAttempts: 45230,
  averageScore: 72.3,
  topPerformers: [
    { name: 'Rahul Sharma', score: 98.5 },
    { name: 'Priya Patel', score: 97.2 },
    { name: 'Amit Kumar', score: 96.8 }
  ],
  subjectPerformance: [
    { subject: 'Physics', avgScore: 68.5 },
    { subject: 'Chemistry', avgScore: 74.2 },
    { subject: 'Biology', avgScore: 76.8 },
    { subject: 'Mathematics', avgScore: 69.3 }
  ],
  monthlyAttempts: [
    { month: 'Jan', attempts: 3200 },
    { month: 'Feb', attempts: 3800 },
    { month: 'Mar', attempts: 4100 },
    { month: 'Apr', attempts: 3900 },
    { month: 'May', attempts: 4500 }
  ]
};

interface AdminDashboardProps {
  streams: Stream[];
  user: User;
  setStreams: React.Dispatch<React.SetStateAction<Stream[]>>;
  notebookFolders: NotebookFolder[];
  setNotebookFolders: React.Dispatch<React.SetStateAction<NotebookFolder[]>>;
  onUpdateUser: (user: User) => void;
}

export function AdminDashboard({ streams, user, setStreams, onUpdateUser, notebookFolders, setNotebookFolders }: AdminDashboardProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentView = location.pathname.split('/')[2] || 'dashboard';

  const setCurrentView = (section: string) => {
    if (section === 'dashboard') {
      navigate('/admin');
    } else {
      navigate(`/admin/${section}`);
    }
  };
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);

  const viewTitles: { [key: string]: string } = {
    dashboard: 'Dashboard',
    streams: 'Streams Management',
    papers: 'Papers Management',
    questions: 'Questions Management',
    notebooks: 'Library',
    tests: 'Test Manager',
    import: 'Bulk Import',
    'ai-tools': 'AI Tools',
    users: 'Users Management',
    analytics: 'Analytics',
    settings: 'Settings',
  };

  const DashboardOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">{mockAnalyticsData.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-sm font-medium">Total Papers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">{mockAnalyticsData.totalPapers}</div>
            <p className="text-xs text-muted-foreground mt-1">+5 added this week</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-sm font-medium">Test Attempts</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">{mockAnalyticsData.totalAttempts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">+18% from last month</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">{mockAnalyticsData.averageScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">+2.3% improvement</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="space-y-3">
              {[
                { action: 'New paper created', subject: 'Physics Mock Test 15', time: '2 hours ago' },
                { action: 'Bulk import completed', subject: '50 Chemistry questions', time: '4 hours ago' },
                { action: 'Student registered', subject: 'Neha Singh', time: '6 hours ago' },
                { action: 'AI content generated', subject: 'Biology Chapter 8', time: '1 day ago' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50">
                  <div>
                    <div className="font-medium text-sm">{activity.action}</div>
                    <div className="text-xs text-muted-foreground">{activity.subject}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Top Performers</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Highest scoring students this month</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="space-y-4">
              {mockAnalyticsData.topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{performer.name}</span>
                  </div>
                  <Badge variant="outline" className="font-semibold text-sm">
                    {performer.score}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  

  const renderSection = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'streams':
        return <StreamsManagement streams={streams} setStreams={setStreams} />;
      case 'papers':
        return <PapersManagement streams={streams} setStreams={setStreams} />;
      case 'questions':
        return <QuestionsManagement streams={streams} setStreams={setStreams} allQuestionsFromFile={allQuestions} setAllQuestions={setAllQuestions} />;
      case 'notebooks':
        return <NotebookManager notebookFolders={notebookFolders} setNotebookFolders={setNotebookFolders} />;
      case 'tests':
        return <TestManager streams={streams} setStreams={setStreams} />;
      case 'import':
        return <BulkImport streams={streams} setStreams={setStreams} />;
      case 'ai-tools':
        return <AITools streams={streams} setStreams={setStreams} />;
      case 'users':
        return <UsersManagement />;
      case 'analytics':
        return <Analytics data={mockAnalyticsData} />;
      case 'profile':
        return <ProfilePage user={user} onProfileUpdate={() => {}} recentTests={[]} allPapers={[]} />;
      case 'settings':
        return <AdminSettingsPanel />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-muted/30">
      <AdminSidebar
        currentSection={currentView}
        onSectionChange={setCurrentView}
        className="hidden lg:block"
      />
      <main className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">{viewTitles[currentView] || 'Dashboard'}</h2>
            </div>
          </div>
          <div className="space-y-6">
            {renderSection()}
          </div>
        </div>
        <Toaster />
      </main>
    </div>
  );
}
