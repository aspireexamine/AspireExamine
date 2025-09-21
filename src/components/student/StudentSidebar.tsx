import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Home, Notebook, TestTube2, ChevronLeft } from 'lucide-react';

interface StudentSidebarProps {
  currentView: string;
  onNavigate: (view: 'streams' | 'notebooks' | 'tests') => void;
  className?: string;
}

export const studentMenuItems = [
  { id: 'streams', label: 'Home', icon: Home },
  { id: 'notebooks', label: 'Notebooks', icon: Notebook },
  { id: 'tests', label: 'Tests', icon: TestTube2 },
];

export function StudentSidebarNav({ currentView, onNavigate, collapsed, onLinkClick }: { currentView: string; onNavigate: (view: 'streams' | 'notebooks' | 'tests') => void; collapsed?: boolean; onLinkClick?: () => void; }) {
  return (
    <nav className="flex flex-col gap-2 p-4">
      {studentMenuItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.id === 'streams'
          ? ['streams', 'subjects', 'papers', 'exam', 'results', 'practiceSection', 'practiceSubject', 'practiceChapter'].includes(currentView)
          : currentView === item.id;

        return (
          <Button
            key={item.id}
            variant={isActive ? 'secondary' : 'ghost'}
            onClick={() => {
              onNavigate(item.id as 'streams' | 'notebooks' | 'tests');
              onLinkClick?.();
            }}
            className="w-full justify-start h-11 text-base px-4"
            title={collapsed ? item.label : undefined}
          >
            <Icon className="h-5 w-5 mr-4 flex-shrink-0" />
            <span className={cn("transition-opacity duration-200", collapsed ? "opacity-0" : "opacity-100")}>
              {item.label}
            </span>
          </Button>
        );
      })}
    </nav>
  );
}

export function StudentSidebar({ currentView, onNavigate, className }: StudentSidebarProps) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <aside className={cn(
      "hidden md:flex flex-col bg-background transition-all duration-300 ease-in-out shadow-lg",
      collapsed ? "w-20" : "w-64",
      className
    )}
    onMouseEnter={() => setCollapsed(false)}
    onMouseLeave={() => setCollapsed(true)}
    >
      <div className="flex items-center p-4 h-16 bg-transparent">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 ml-auto absolute right-3 top-4"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>
      <StudentSidebarNav currentView={currentView} onNavigate={onNavigate} collapsed={collapsed} />
    </aside>
  );
}