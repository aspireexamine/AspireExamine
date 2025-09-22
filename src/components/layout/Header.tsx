import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { User, LogOut, Menu, History } from 'lucide-react';
import { User as UserType } from '@/types';
import { ViewState } from '../student/StudentDashboard';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { StudentSidebarNav } from '../student/StudentSidebar';
import { AdminSidebarNav } from '../admin/AdminSidebar';
import { useState, useEffect } from 'react';

const AspireExamineLogo = () => (
  <svg className="h-7 w-7 sm:h-8 sm:w-8 text-blue-500" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path 
      clipRule="evenodd" 
      d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" 
      fill="currentColor" 
      fillRule="evenodd"
    />
  </svg>
);

interface HeaderProps {
  user?: UserType;
  onLogout?: () => void;
  onNavigate: (view: ViewState) => void;
  isAdminViewingAsStudent?: boolean;
  onReturnToAdmin?: () => void;
  currentView?: ViewState;
  currentAdminSection?: string;
  onAdminSectionChange?: (section: string) => void;
  onOpenAIHistory?: () => void;
}

export function Header({ user, onLogout, onNavigate, isAdminViewingAsStudent, onReturnToAdmin, currentView, currentAdminSection, onAdminSectionChange, onOpenAIHistory }: HeaderProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
       {isAdminViewingAsStudent && (
        <div className="bg-yellow-400 text-yellow-900 text-center py-2 text-sm font-semibold">
          You are currently viewing the platform as a student. 
          <Button variant="link" className="text-yellow-900 h-auto p-0 ml-2 font-bold underline" onClick={onReturnToAdmin}>
            Return to Admin Dashboard
          </Button>
        </div>
      )}
      <div className="container flex h-12 sm:h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          {/* Mobile hamburger menu and AI history button */}
          {isMobile ? (
            <div className="flex items-center space-x-2">
              <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open Menu</span>
                  </Button>
                </SheetTrigger>
              <SheetContent side="left" className="w-3/4 sm:w-1/2 p-0 [&>button]:hidden">
                <div className="p-4 border-b">
                  <h2 className="text-base font-semibold">Menu</h2>
                </div>
                {user?.role === 'admin' && currentAdminSection && onAdminSectionChange ? (
                  <AdminSidebarNav 
                    currentSection={currentAdminSection} 
                    onSectionChange={(section) => {
                      onAdminSectionChange(section);
                      setIsMobileSidebarOpen(false);
                    }}
                    onLinkClick={() => setIsMobileSidebarOpen(false)}
                  />
                ) : (
                  <StudentSidebarNav 
                    currentView={currentView || "streams"} 
                    onNavigate={(view) => {
                      if (view === 'streams') {
                        onNavigate('streams');
                      } else {
                        onNavigate(view as ViewState);
                      }
                      setIsMobileSidebarOpen(false);
                    }}
                    onLinkClick={() => setIsMobileSidebarOpen(false)}
                  />
                )}
              </SheetContent>
            </Sheet>
            
            {/* AI History Button - Only show on mobile when in AI Assistant view */}
            {currentView === 'ai-assistant' && onOpenAIHistory && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenAIHistory}
                className="h-8 w-8"
              >
                <History className="h-4 w-4" />
                <span className="sr-only">Open AI Chat History</span>
              </Button>
            )}
            </div>
          ) : (
            /* Desktop logo and title */
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('streams')}>
              <AspireExamineLogo />
              <span className="text-lg sm:text-xl font-bold text-blue-500">AspireExamine</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Admin "View as Student" button removed */}

          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                    <AvatarImage 
                      src={user.avatar || ''} 
                      alt={user.name} 
                      className="object-cover rounded-full border-2 border-white dark:border-black"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {/* Hide Profile entry for admins in admin panel */}
                {user?.role !== 'admin' && (
                  <DropdownMenuItem onClick={() => onNavigate('profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost">Login</Button>
              <Button>Sign Up</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}