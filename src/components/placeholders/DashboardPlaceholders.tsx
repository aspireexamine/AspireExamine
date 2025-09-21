import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Generic placeholder for missing components
const PlaceholderComponent = ({ name }: { name: string }) => (
  <Card className="border-2 border-dashed">
    <CardContent className="p-6">
      <h3 className="text-lg font-semibold text-center text-muted-foreground">{name}</h3>
      <p className="text-sm text-center text-muted-foreground">This is a placeholder component.</p>
    </CardContent>
  </Card>
);

// Placeholders for StudentDashboard
export const StreamCard = ({ stream, onClick }: any) => <Button onClick={onClick} className="w-full h-24">{stream.name}</Button>;
export const SubjectCard = ({ subject, onClick }: any) => <Button onClick={onClick} className="w-full h-24">{subject.name}</Button>;
export const PaperCard = ({ paper, onStart }: any) => <Card><CardHeader><CardTitle>{paper.title}</CardTitle></CardHeader><CardContent><Button onClick={onStart}>Start Paper</Button></CardContent></Card>;
export const ExamInterface = ({ onExit }: any) => <div><h1 className="text-2xl font-bold">Exam Interface</h1><Button onClick={onExit}>Exit Exam</Button></div>;
export const ResultsPage = ({ onGoHome }: any) => <div><h1 className="text-2xl font-bold">Results Page</h1><Button onClick={onGoHome}>Go Home</Button></div>;

// Placeholders for AdminDashboard
export const Sidebar = ({ onSectionChange }: any) => <div className="w-64 bg-muted p-4"><h2 className="font-bold mb-4">Admin Menu</h2><Button className="w-full justify-start mb-2" variant="ghost" onClick={() => onSectionChange('dashboard')}>Dashboard</Button><Button className="w-full justify-start" variant="ghost" onClick={() => onSectionChange('users')}>Users</Button></div>;
export const StreamsManagement = () => <PlaceholderComponent name="Streams Management" />;
export const PapersManagement = () => <PlaceholderComponent name="Papers Management" />;
export const QuestionsManagement = () => <PlaceholderComponent name="Questions Management" />;
export const BulkImport = () => <PlaceholderComponent name="Bulk Import Tool" />;
export const AITools = () => <PlaceholderComponent name="AI Content Tools" />;
export const UsersManagement = () => <PlaceholderComponent name="Users Management" />;
export const Analytics = () => <PlaceholderComponent name="Analytics Dashboard" />;
export const SettingsPanel = () => <PlaceholderComponent name="Settings Panel" />;
