import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Home, List, FileText, HelpCircle, Upload, Bot, Users, BarChart, Settings, Notebook, TestTube2, ChevronLeft } from 'lucide-react';

interface AdminSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  className?: string;
  isMobile?: boolean;
  onClose?: () => void;
}

export const adminMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'streams', label: 'Streams', icon: List },
  { id: 'papers', label: 'Papers', icon: FileText },
  { id: 'questions', label: 'Questions', icon: HelpCircle },
  { id: 'notebooks', label: 'Library', icon: Notebook },
  { id: 'tests', label: 'Test Manager', icon: TestTube2 },
  { id: 'import', label: 'Bulk Import', icon: Upload },
  { id: 'ai-tools', label: 'AI Tools', icon: Bot },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const navItems = adminMenuItems;

export function AdminSidebarNav({ currentSection, onSectionChange, collapsed, onLinkClick }: { currentSection: string; onSectionChange: (section: string) => void; collapsed?: boolean; onLinkClick?: () => void; }) {
  return (
    <nav className="flex flex-col gap-2 p-4">
      {adminMenuItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentSection === item.id;

        return (
          <Button
            key={item.id}
            variant={isActive ? 'secondary' : 'ghost'}
            onClick={() => {
              onSectionChange(item.id);
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

export function AdminSidebar({ currentSection, onSectionChange, className, isMobile = false, onClose }: AdminSidebarProps) {
  const [hoverCollapsed, setHoverCollapsed] = useState(true);
  const collapsed = isMobile ? false : hoverCollapsed;

  return (
    <aside 
      className={cn(
        "relative flex flex-col bg-background transition-all duration-300 ease-in-out h-full",
        !isMobile && "shadow-lg",
        collapsed ? "w-20" : "w-64",
        className
      )}
      onMouseEnter={() => !isMobile && setHoverCollapsed(false)}
      onMouseLeave={() => !isMobile && setHoverCollapsed(true)}
    >
      <div className={cn("flex items-center p-4 h-16 bg-transparent", isMobile && "border-b")}>
        <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto absolute right-3 top-4" onClick={onClose}>
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>
      <nav className="flex flex-col gap-2 p-4 flex-grow overflow-y-auto hide-scrollbar">
        {navItems.map(item => (
          <Button
            key={item.id}
            variant={currentSection === item.id ? 'secondary' : 'ghost'}
            onClick={() => onSectionChange(item.id)}
            className="w-full justify-start h-11 text-base px-4"
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-5 w-5 mr-4 flex-shrink-0" />
            <span className={cn("transition-opacity duration-200", collapsed ? "opacity-0" : "opacity-100")}>
              {item.label}
            </span>
          </Button>
        ))}
      </nav>
    </aside>
  );
}