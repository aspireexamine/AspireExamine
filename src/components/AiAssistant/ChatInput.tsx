import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Paperclip, 
  Square
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStopAI?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  isCompact?: boolean;
}

export function ChatInput({ 
  onSendMessage, 
  onStopAI,
  isLoading = false, 
  placeholder = "Ask, search, or make anything...",
  className,
  isCompact = false
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [sourceMode, setSourceMode] = useState<'auto' | 'research'>('auto');

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const sourceModes = [
    { key: 'auto', label: 'Auto', icon: null },
    { key: 'research', label: 'Research', icon: null }
  ];

  return (
    <div className={cn("w-full", className)}>
      <Card className="border-2 shadow-sm rounded-2xl">
        <CardContent className={cn("p-4", isCompact && "p-3")}>
          {/* Add Context Button - Top Left */}
          <div className="flex justify-start mb-3">
            <Button variant="outline" size="sm" className={cn("h-7 px-3 text-xs rounded-full", isCompact && "h-6 px-2 text-xs")}>
              @ Add context
            </Button>
          </div>
          
          {/* Main Input */}
          <div className="relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className={cn(
                "resize-none border-0 p-0 text-base focus-visible:ring-0 focus-visible:ring-offset-0",
                isCompact ? "min-h-[32px]" : "min-h-[40px]"
              )}
              disabled={isLoading}
            />
          </div>

          {/* Bottom Controls */}
          <div className={cn("flex items-center justify-between mt-4", isCompact && "mt-3")}>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Paperclip className="h-4 w-4" />
              </Button>
              
              {sourceModes.map((mode) => (
                <div key={mode.key} className="flex items-center gap-1">
                  <Badge 
                    variant={sourceMode === mode.key ? "default" : "secondary"} 
                    className="h-6 px-2 text-xs cursor-pointer rounded-full"
                    onClick={() => setSourceMode(mode.key as any)}
                  >
                    {mode.label}
                  </Badge>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={isLoading ? onStopAI : handleSendMessage}
              disabled={!isLoading && !inputValue.trim()}
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full",
                isLoading && "bg-red-500 hover:bg-red-600 text-white"
              )}
            >
              {isLoading ? (
                <Square className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
