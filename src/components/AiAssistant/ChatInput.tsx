import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Paperclip, 
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  isCompact?: boolean;
}

export function ChatInput({ 
  onSendMessage, 
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
    <div className={cn("w-full max-w-3xl", className)}>
      <Card className="border-2 shadow-sm rounded-2xl">
        <CardContent className="p-4">
          {/* Add Context Button */}
          <div className="mb-3">
            <Button variant="outline" size="sm" className="h-7 px-3 text-xs rounded-full">
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
          <div className="flex items-center justify-between mt-4">
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
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
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
