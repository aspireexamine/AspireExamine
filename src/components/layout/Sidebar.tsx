import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Users, 
  BarChart3, 
  User,
  Settings, 
  ChevronLeft,
  Upload,
  Brain,
  PlusCircle,
  Notebook,
  TestTube,
} from 'lucide-react';

interface SidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'streams', label: 'Streams', icon: BookOpen },
  { id: 'papers', label: 'Papers', icon: FileText },
  { id: 'questions', label: 'Questions', icon: PlusCircle },
  { id: 'import', label: 'Bulk Import', icon: Upload },
  { id: 'notebooks', label: 'Library Manager', icon: Notebook },
  { id: 'tests', label: 'Test Manager', icon: TestTube },
  { id: 'ai-tools', label: 'AI Tools', icon: Brain },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'profile', label: 'Profile', icon: User, hidden: true },
];

export function Sidebar({ currentSection, onSectionChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className={cn(
      "relative flex flex-col bg-background transition-all duration-300 ease-in-out shadow-lg",
      collapsed ? "w-20" : "w-64"
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
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform",
            collapsed && "rotate-180"
          )} />
        </Button>
      </div>

      <nav className="flex flex-col gap-2 p-4 flex-grow">
        {menuItems.map((item) => {
          if (item.hidden) return null;
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={currentSection === item.id ? 'secondary' : 'ghost'}
              onClick={() => onSectionChange(item.id)}
              className="w-full justify-start h-11 text-base px-4"
              title={collapsed ? item.label : undefined}
              data-section-id={item.id}
            >
              <Icon className="h-5 w-5 mr-4 flex-shrink-0" />
              <span className={cn("transition-opacity duration-200", collapsed ? "opacity-0" : "opacity-100")}>
                {item.label}
              </span>
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
