import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bot, User, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  className?: string;
  isStreaming?: boolean;
}

export function ChatMessage({ id, role, content, timestamp, className, isStreaming = false }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [displayedContent, setDisplayedContent] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // Handle streaming content with smooth fade-in animation
  useEffect(() => {
    if (isStreaming) {
      setDisplayedContent(content);
      setIsVisible(true);
    } else {
      // For non-streaming messages, show content immediately with fade-in
      setDisplayedContent(content);
      setIsVisible(true);
    }
  }, [content, isStreaming]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Message copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 animate-in slide-in-from-bottom-2 duration-300 group",
        role === 'user' ? 'justify-end' : 'justify-start',
        className
      )}
    >
      {role === 'assistant' && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-primary/10">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm relative",
          role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted border'
        )}
      >
        <div className={cn(
          "transition-opacity duration-500 ease-in-out",
          isVisible ? "opacity-100" : "opacity-0"
        )}>
          <p className="text-sm whitespace-pre-wrap leading-relaxed pr-8">
            {displayedContent}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
            )}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs opacity-70">
            {timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
          {!isStreaming && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className={cn(
                "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
                role === 'user' 
                  ? 'text-primary-foreground hover:bg-primary-foreground/20' 
                  : 'text-muted-foreground hover:bg-muted-foreground/20'
              )}
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </div>
      
      {role === 'user' && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-secondary">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
