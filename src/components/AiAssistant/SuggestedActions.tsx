import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles,
  List,
  FileText,
  CheckCircle,
  X,
  BookOpen,
  Brain,
  Target,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuggestedAction {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  prompt?: string;
}

interface SuggestedActionsProps {
  onActionClick: (action: SuggestedAction) => void;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
}

const defaultActions: SuggestedAction[] = [
  {
    icon: Sparkles,
    title: "What's new in AI Assistant",
    description: "Learn about latest features",
    prompt: "What are the latest features and capabilities of this AI Assistant?"
  },
  {
    icon: List,
    title: "Create study plan",
    description: "Get personalized study schedule",
    prompt: "Help me create a personalized study plan for my upcoming exams"
  },
  {
    icon: FileText,
    title: "Analyze study materials",
    description: "Upload and analyze documents",
    prompt: "I want to analyze my study materials and get insights"
  },
  {
    icon: CheckCircle,
    title: "Practice questions",
    description: "Generate practice problems",
    prompt: "Generate some practice questions for me to test my knowledge"
  },
  {
    icon: BookOpen,
    title: "Explain concepts",
    description: "Get detailed explanations",
    prompt: "Can you explain a difficult concept in simple terms?"
  },
  {
    icon: Brain,
    title: "Study strategies",
    description: "Learn effective study methods",
    prompt: "What are the most effective study strategies for exam preparation?"
  },
  {
    icon: Target,
    title: "Goal setting",
    description: "Set and track study goals",
    prompt: "Help me set realistic study goals and create a plan to achieve them"
  },
  {
    icon: Zap,
    title: "Quick review",
    description: "Rapid knowledge check",
    prompt: "Give me a quick review of key concepts I should know"
  }
];

export function SuggestedActions({ 
  onActionClick, 
  onClose, 
  showCloseButton = true,
  className 
}: SuggestedActionsProps) {
  return (
    <div className={cn("w-full max-w-3xl", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-foreground">Get started</h3>
        {showCloseButton && onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {defaultActions.map((action, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] p-4 group rounded-2xl"
            onClick={() => onActionClick(action)}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-2 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <p className="text-sm font-medium group-hover:text-primary transition-colors">
                  {action.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
