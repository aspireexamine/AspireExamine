'use client';

import { useState, useRef, useMemo, memo } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { MessageAttachments } from './MessageAttachments';
import { AIChatMessage } from '@/services/aiChatService';
import CodeBlock from './CodeBlock';
import {
  Copy,
  Check,
  Sparkles,
  Download,
  FileDown,
} from 'lucide-react';
import { PluggableList } from 'unified';
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  className?: string;
  isStreaming?: boolean;
  isThinking?: boolean;
  files?: any[];
  isLastMessage?: boolean;
  onOpenFileInCanvas?: (fileId: string) => void;
  supportsReasoning?: boolean;
}

const ChatMessageComponent = ({ 
  id, 
  role, 
  content, 
  timestamp, 
  className, 
  isStreaming = false, 
  isThinking = false,
  files = [],
  isLastMessage = false,
  onOpenFileInCanvas,
  supportsReasoning = false
}: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const messageContentRef = useRef<HTMLDivElement>(null);

  const attachedFiles = useMemo(() => files || [], [files]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadAsMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aspire-response.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsPng = () => {
    if (messageContentRef.current) {
      html2canvas(messageContentRef.current, {
        backgroundColor: null,
        useCORS: true,
      }).then(canvas => {
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `Aspire-response.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const showThinkingAnimation = isLastMessage && isThinking && role === 'assistant';

  const customComponents: Components = {
    p(props) {
      return <p {...props} className="mb-2 last:mb-0 leading-relaxed" />;
    },
    code(props) {
      const { children, className, ...rest } = props;
      const match = /language-(\w+)/.exec(className || '');
      const codeText = String(children).replace(/\n$/, '');

      return match ? (
        <CodeBlock language={match[1]} value={codeText} />
      ) : (
        <code {...rest} className="bg-muted px-1 py-0.5 rounded-sm">
          {children}
        </code>
      );
    },
  };

  return (
    <div className={`group flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex-1 space-y-2 min-w-0 max-w-full md:max-w-[85%] ${role === 'user' ? 'text-right' : ''}`}>
        <div className={`inline-block max-w-full ${ 
          role === 'user'
            ? 'bg-muted text-foreground rounded-2xl rounded-tr-md px-4 py-3'
            : ''
        }`}>
          {attachedFiles.length > 0 && <MessageAttachments files={attachedFiles} />}

          {/* Show thinking animation when AI is processing */}
          {role === 'assistant' && isLastMessage && isThinking && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span>Thinking...</span>
            </div>
          )}

          <div ref={messageContentRef} className="text-left message-content">
            {role === 'user' ? (
              <p className="whitespace-pre-wrap">{content}</p>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm] as PluggableList}
                components={customComponents}
              >
                {content}
              </ReactMarkdown>
            )}
          </div>
        </div>

        {!showThinkingAnimation && (
          <div className={`flex items-center gap-2 text-xs text-muted-foreground ${ 
            role === 'user' ? 'justify-end' : 'justify-start'
          }`}>
            {role === 'user' && (
              <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(content)}>
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            )}

            <span>{formatTime(timestamp)}</span>

            {role === 'assistant' && !isStreaming && (
              <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(content)}>
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={downloadAsMarkdown}>
                  <FileDown className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={downloadAsPng}>
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const ChatMessage = memo(ChatMessageComponent);
export default ChatMessage;
