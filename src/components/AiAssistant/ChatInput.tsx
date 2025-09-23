'use client';

import { useState, useRef, useEffect, CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SpeechService, WaveformVisualizer } from '@/lib/speech';
import { MAX_FILE_COUNT, formatFileSize, validateFileForModel, getFileCategory } from '@/lib/file-utils';
import { ProviderAdapter } from '@/lib/providers/base';
import { 
  Plus,
  Send, 
  Mic,
  X,
  FileText,
  Image as ImageIcon,
  FileIcon,
  Square,
  Code,
  Paperclip, 
  Sparkles,
  Loader2,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { aiChatService } from '@/services/aiChatService';
import { toast } from 'sonner';

interface ChatInputProps {
  onSendMessage: (text: string, isCanvasMode: boolean, attachmentIds?: string[]) => void;
  onFileUpload: (files: File[]) => Promise<string[]>;
  onStopGenerating: () => void;
  isStreaming: boolean;
  currentModel: string;
  onModelChange: (modelId: string) => void;
  providers: ProviderAdapter[];
  text: string;
  onTextChange: (text: string | ((prevText: string) => string)) => void;
  onEnhancePrompt: () => void;
  isEnhancing: boolean;
  isSummarizing: boolean;
}

export function ChatInput({ 
  onSendMessage, 
  onFileUpload,
  onStopGenerating,
  isStreaming,
  currentModel,
  onModelChange,
  providers,
  text,
  onTextChange,
  onEnhancePrompt,
  isEnhancing,
  isSummarizing,
}: ChatInputProps) {
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechReady, setIsSpeechReady] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speechServiceRef = useRef<SpeechService | null>(null);
  const waveformRef = useRef<WaveformVisualizer | null>(null);
  const chatInputRef = useRef<HTMLDivElement>(null);
  const isFocusedRef = useRef(false);
  const speechReadyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const prevIsEnhancing = useRef(isEnhancing);
  useEffect(() => {
    if (prevIsEnhancing.current === true && isEnhancing === false) {
      setAnimationKey(prev => prev + 1);
    }
    prevIsEnhancing.current = isEnhancing;
  }, [isEnhancing]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (SpeechService.isSupported()) {
      speechServiceRef.current = new SpeechService();
    }
  }, []);

  useEffect(() => {
    if (isListening && canvasRef.current) {
      if (!waveformRef.current) {
        waveformRef.current = new WaveformVisualizer(canvasRef.current);
      }
      waveformRef.current.start();
    }
  }, [isListening]);

  const displayText = isListening && !isSpeechReady && !interimTranscript
    ? "Initializing voice recognition..."
    : isSpeechReady && !interimTranscript 
      ? "Speak now..." 
      : text + (interimTranscript ? ` ${interimTranscript}` : '');
  const canSend = (text.trim().length > 0 || attachedFiles.length > 0) && !isStreaming && !isSpeechReady;
  
  // Check if any attached files are supported by the current model
  const hasValidFiles = attachedFiles.some(file => validateFileForModel(file, currentModel).valid);
  
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
        textarea.scrollTop = textarea.scrollHeight;
    }
  }, [displayText]);

  useEffect(() => {
    const handleResize = () => {
      if (isFocusedRef.current && window.innerWidth < 768) {
        setTimeout(() => {
          chatInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      // Cleanup speech ready timeout
      if (speechReadyTimeoutRef.current) {
        clearTimeout(speechReadyTimeoutRef.current);
        speechReadyTimeoutRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSend) return;

    let attachmentIds: string[] = [];
    if (attachedFiles.length > 0) {
      attachmentIds = await onFileUpload(attachedFiles);
      setAttachedFiles([]);
    }

    onSendMessage(text.trim(), false, attachmentIds);
    setInterimTranscript('');
    setShowOptions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    e.target.value = '';
  };

  const addFiles = (files: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const validation = validateFileForModel(file, currentModel);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    // Show errors for invalid files
    if (errors.length > 0) {
      errors.forEach(error => {
        toast.error(error);
      });
    }

    // Add valid files
    if (validFiles.length > 0) {
      const newFiles = [...attachedFiles, ...validFiles].slice(0, MAX_FILE_COUNT);
      setAttachedFiles(newFiles);
      
      if (validFiles.length === 1) {
        toast.success(`Added ${validFiles[0].name}`);
      } else {
        toast.success(`Added ${validFiles.length} files`);
      }
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleFocus = () => {
    if (showOptions) setShowOptions(false);
    isFocusedRef.current = true;
    if (window.innerWidth < 768) {
      setTimeout(() => {
        chatInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 300);
    }
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
  };

  const toggleSpeech = () => {
    if (!speechServiceRef.current) return;

    if (isListening) {
      // Clear any pending timeout
      if (speechReadyTimeoutRef.current) {
        clearTimeout(speechReadyTimeoutRef.current);
        speechReadyTimeoutRef.current = null;
      }
      
      speechServiceRef.current.stopListening();
      waveformRef.current?.stop();
      waveformRef.current = null;
      setIsListening(false);
      setIsSpeechReady(false);
    } else {
      setIsListening(true);
      setIsSpeechReady(false);
      
      // Start listening and show "Speak now" only when we get the first result
      speechServiceRef.current.startListening(
        (transcript, isFinal) => {
          // Show "Speak now" indicator only when we get the first transcript
          if (!isSpeechReady && transcript) {
            setIsSpeechReady(true);
          }
          
          if (isFinal) {
            onTextChange((prevText: string) => (prevText + ' ' + transcript).trim());
            setInterimTranscript('');
            setIsSpeechReady(false);
          } else {
            setInterimTranscript(transcript);
            // Keep "Speak now" visible while we have interim transcript
            if (transcript) {
              setIsSpeechReady(true);
            }
          }
        },
        (error) => {
          console.error('Speech recognition error:', error);
          // Clear timeout on error
          if (speechReadyTimeoutRef.current) {
            clearTimeout(speechReadyTimeoutRef.current);
            speechReadyTimeoutRef.current = null;
          }
          setIsListening(false);
          setIsSpeechReady(false);
          waveformRef.current?.stop();
          waveformRef.current = null;
        },
        () => {
          // This callback is called when speech recognition is ready
          // Show "Speak now" indicator after a short delay to ensure service is fully ready
          speechReadyTimeoutRef.current = setTimeout(() => {
            if (isListening) {
              setIsSpeechReady(true);
            }
            speechReadyTimeoutRef.current = null;
          }, 1000); // 1 second delay to ensure service is fully initialized
        },
        () => {
          // Clear timeout when speech ends
          if (speechReadyTimeoutRef.current) {
            clearTimeout(speechReadyTimeoutRef.current);
            speechReadyTimeoutRef.current = null;
          }
          setIsListening(false);
          setIsSpeechReady(false);
          waveformRef.current?.stop();
          waveformRef.current = null;
        }
      );
    }
  };

  const getFileIcon = (file: File) => {
    const category = getFileCategory(file.type);
    switch (category) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileIcon className="h-4 w-4" />;
    }
  };

  return (
    <div ref={chatInputRef} className="mx-auto w-full max-w-4xl px-4 py-2">
      {/* Add Context Button and File Indicator */}
      <div className="mb-2 flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-sm font-medium rounded-full border-muted-foreground/20 hover:border-muted-foreground/40"
        >
          @ Add context
        </Button>
        
        {attachedFiles.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Paperclip className="h-4 w-4" />
            <span>{attachedFiles.length} file{attachedFiles.length > 1 ? 's' : ''} attached</span>
            {!hasValidFiles && (
              <span className="text-destructive text-xs">(Not supported by current model)</span>
            )}
          </div>
        )}
      </div>

      {attachedFiles.length > 0 && (
        <div className="mb-2">
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => {
              const category = getFileCategory(file.type);
              const isSupported = validateFileForModel(file, currentModel).valid;
              
              return (
                <div
                  key={`${file.name}-${index}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                    isSupported 
                      ? 'bg-muted' 
                      : 'bg-destructive/10 border border-destructive/20'
                  }`}
                >
                  {getFileIcon(file)}
                  <span className="truncate max-w-32">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                  {!isSupported && (
                    <span className="text-xs text-destructive font-medium">
                      Not supported
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={
          {
            "--bg": isDragging
              ? "hsla(var(--primary-hsl), 0.05)"
              : "hsl(var(--background))",
          } as CSSProperties
        }
              className={cn(
          "group relative z-0",
          "[background:var(--bg)]",
          "rounded-3xl shadow-xl shadow-black/10 transition-all duration-300 flex flex-col",
          "dark:shadow-[0_10px_50px_-10px_rgba(255,255,255,0.1)] dark:focus-within:shadow-[0_10px_50px_-10px_hsla(210,40%,98%,0.2)]",
          "border-primary",
          "border-2",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="relative grid grid-cols-1 grid-rows-1">
          <Textarea
            ref={textareaRef}
            value={displayText}
            onChange={(e) => {
              onTextChange(e.target.value);
              setInterimTranscript('');
            }}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Ask, search, or make anything..."
            disabled={isStreaming || isSpeechReady}
            style={{ maxHeight: '40vh' }}
            className={`col-start-1 row-start-1 w-full text-base overflow-y-auto resize-none border-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent rounded-t-3xl transition-all duration-300 pt-4 pb-10 pl-4 pr-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
              interimTranscript ? 'text-muted-foreground' : ''
            } ${isSpeechReady ? 'text-primary font-medium italic' : ''} ${
              isListening && !isSpeechReady && !interimTranscript ? 'text-muted-foreground italic' : ''
            }`}
          />
          
          <div className="col-start-1 row-start-1 self-end h-12 flex items-center gap-1 px-3 pointer-events-none">
              <div className="relative pointer-events-auto flex items-center gap-1">
                  <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowOptions(prev => !prev)}
                  disabled={isStreaming}
                  className="h-9 w-9 rounded-full"
                  >
                  <Plus className={`h-5 w-5 transition-transform duration-200 ${showOptions ? 'rotate-45' : ''}`} />
                  </Button>
                  
                  <AnimatePresence>
                  {showOptions && (
                      <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full mb-2"
                      >
                      <Button 
                        type="button" 
                        className="gap-2 rounded-full shadow-lg" 
                        onClick={() => fileInputRef.current?.click()}
                      >
                          <Paperclip className="h-4 w-4" />
                          File
                      </Button>
                      </motion.div>
                  )}
                  </AnimatePresence>
            </div>
            
              <div className="ml-auto flex items-center gap-1 pointer-events-auto">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
            <Button 
                          type="button"
                          variant="ghost"
              size="icon"
                          onClick={onEnhancePrompt}
                          disabled={!text.trim() || isEnhancing || isStreaming}
                          className="h-9 w-9 bg-transparent hover:bg-transparent border-none shadow-none"
                        >
                          {isEnhancing ? (
                            <Loader2 
                              className="h-5 w-5 text-primary animate-spin" 
                              style={{ 
                                animation: 'spin 1s linear infinite',
                                transformOrigin: 'center'
                              }} 
                            />
                          ) : (
                            <Sparkles className="h-5 w-5" />
              )}
            </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enhance Prompt</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                  {isClient && SpeechService.isSupported() && (
                      <Tooltip>
                      <TooltipTrigger asChild>
                          <div
                          onClick={toggleSpeech}
                          className={`h-9 w-9 rounded-full flex items-center justify-center cursor-pointer transition-colors ${ isStreaming ? 'cursor-not-allowed' : isListening ? 'bg-red-500/10' : 'hover:bg-muted'}`}
                          >
                          {isListening ? (
                              <canvas
                                  ref={canvasRef}
                                  width="20"
                                  height="20"
                              />
                          ) : (
                              <Mic className="h-5 w-5" />
                          )}
                          </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {isListening ? 'Stop recording' : 'Start recording'}
                        </p>
                      </TooltipContent>
                      </Tooltip>
                  )}
                  </TooltipProvider>

                  {isStreaming ? (
                  <TooltipProvider>
                      <Tooltip>
                      <TooltipTrigger asChild>
                          <Button
                          type="button"
                          size="icon"
                          onClick={onStopGenerating}
                          className="h-9 w-9 bg-destructive text-destructive-foreground rounded-full"
                          >
                          <Square className="h-5 w-5" />
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Stop generating</p>
                      </TooltipContent>
                      </Tooltip>
                  </TooltipProvider>
                  ) : (
                  <Button
                      type="submit"
                      size="icon"
                      disabled={!canSend}
                      className="h-9 w-9 bg-primary text-primary-foreground rounded-full"
                  >
                      <Send className="h-5 w-5" />
                  </Button>
                  )}
              </div>
          </div>
        </div>
      </form>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center pointer-events-none">
          <p className="text-primary font-medium">Drop files here</p>
        </div>
      )}
    </div>
  );
}
