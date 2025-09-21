import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnalyticsData } from '@/types';
import { Home, List, FileText, HelpCircle, Upload, Bot, Users, BarChart, Settings } from 'lucide-react';

// This file provides simple, working versions of all the components
// that AdminDashboard.tsx needs to render without crashing.

const PlaceholderComponent = ({ name }: { name: string }) => (
  <Card className="border-2 border-dashed h-full">
    <CardContent className="flex flex-col items-center justify-center p-6 h-full">
      <h3 className="text-xl font-semibold text-center text-muted-foreground">{name}</h3>
      <p className="text-sm text-center text-muted-foreground mt-2">This is a placeholder component. The full feature will be built here.</p>
    </CardContent>
  </Card>
);

export const Sidebar = ({ currentSection, onSectionChange }: { currentSection: string; onSectionChange: (section: string) => void; }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'streams', label: 'Streams', icon: List },
    { id: 'papers', label: 'Papers', icon: FileText },
    { id: 'questions', label: 'Questions', icon: HelpCircle },
    { id: 'import', label: 'Bulk Import', icon: Upload },
    { id: 'ai-tools', label: 'AI Tools', icon: Bot },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];
  return (
    <div className="w-64 bg-muted/40 border-r p-4 flex-col hidden lg:flex">
      <h2 className="text-lg font-semibold mb-4 px-2">Admin Menu</h2>
      <nav className="flex flex-col gap-1">
        {navItems.map(item => (
          <Button
            key={item.id}
            variant={currentSection === item.id ? 'secondary' : 'ghost'}
            onClick={() => onSectionChange(item.id)}
            className="w-full justify-start"
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </nav>
    </div>
  );
};

export const StreamsManagement = () => <PlaceholderComponent name="Streams Management" />;
export const PapersManagement = () => <PlaceholderComponent name="Papers Management" />;
export const QuestionsManagement = () => <PlaceholderComponent name="Questions Management" />;
export const BulkImport = () => <PlaceholderComponent name="Bulk Import Tool" />;
export const AITools = () => <PlaceholderComponent name="AI Content Tools" />;
export const UsersManagement = () => <PlaceholderComponent name="Users Management" />;
export const Analytics = ({ data }: { data: AnalyticsData }) => <PlaceholderComponent name="Analytics Dashboard" />;
export const SettingsPanel = () => <PlaceholderComponent name="Settings Panel" />;

