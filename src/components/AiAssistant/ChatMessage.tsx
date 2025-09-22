import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';
import { extractCodeBlocks } from '@/utils/codeBlockUtils';

interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  className?: string;
  isStreaming?: boolean;
  isThinking?: boolean;
}


export function ChatMessage({ id, role, content, timestamp, className, isStreaming = false, isThinking = false }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [displayedContent, setDisplayedContent] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [contentBlocks, setContentBlocks] = useState<Array<{ type: 'text' | 'code', content: string, language?: string }>>([]);

  // Handle streaming content with smooth fade-in animation
  useEffect(() => {
    if (isStreaming) {
      setDisplayedContent(content);
      setContentBlocks(extractCodeBlocks(content));
      setIsVisible(true);
    } else {
      // For non-streaming messages, show content immediately with fade-in
      setDisplayedContent(content);
      setContentBlocks(extractCodeBlocks(content));
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
      <div
        className={cn(
          "max-w-[98%] sm:max-w-[80%] rounded-2xl px-4 py-3 shadow-sm relative w-full overflow-hidden",
          role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted border'
        )}
      >
        <div className={cn(
          "transition-opacity duration-500 ease-in-out",
          isVisible ? "opacity-100" : "opacity-0"
        )}>
          {isThinking ? (
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
              </div>
              <span className="text-sm text-muted-foreground ml-2">Thinking...</span>
            </div>
          ) : (
            <div className="text-sm leading-relaxed sm:leading-relaxed leading-snug pr-8">
              <div className={cn(
                "transition-opacity duration-500 ease-in-out",
                isVisible ? "opacity-100" : "opacity-0"
              )}>
                {contentBlocks.map((block, index) => {
                  if (block.type === 'code') {
                    // Only render code block if it has content
                    if (block.content && block.content.trim()) {
                      return (
                        <CodeBlock
                          key={index}
                          code={block.content}
                          language={block.language || 'text'}
                        />
                      );
                    } else {
                      return null;
                    }
                  } else {
                    return (
                      <div key={index} className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            code: ({ children }) => (
                              <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
                                {children}
                              </code>
                            ),
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="text-sm">{children}</li>,
                            h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-foreground">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-foreground">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-foreground">{children}</h3>,
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-muted-foreground/30 pl-3 italic my-2">
                                {children}
                              </blockquote>
                            ),
                          }}
                        >
                          {block.content}
                        </ReactMarkdown>
                      </div>
                    );
                  }
                })}
                {isStreaming && (
                  <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs opacity-70">
            {timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
          {!isStreaming && !isThinking && (
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
    </div>
  );
}
