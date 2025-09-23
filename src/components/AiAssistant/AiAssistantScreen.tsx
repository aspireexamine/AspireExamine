import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { History, ArrowDown, Bot, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { FilesPanel } from './FilesPanel';
import { SuggestedActions } from './SuggestedActions';
import { ChatHistory } from './ChatHistory';
import { aiChatService, ChatMessage as AIChatMessage } from '@/services/aiChatService';
import { chatStorageService } from '@/services/chatStorageService';
import { mockProviders } from '@/lib/providers/base';
import { toast } from 'sonner';

interface AiAssistantScreenProps {
  className?: string;
  initialMessage?: string;
}

export interface AiAssistantScreenRef {
  openHistory: () => void;
  openFiles: () => void;
}




export const AiAssistantScreen = forwardRef<AiAssistantScreenRef, AiAssistantScreenProps>(({ className, initialMessage }, ref) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showGetStarted, setShowGetStarted] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFilesOpen, setIsFilesOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolled, setIsUserScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [text, setText] = useState('');
  const [currentModel, setCurrentModel] = useState('openai:gpt-4');
  
  // Collect all files from messages for the FilesPanel
  const getAllFilesFromMessages = () => {
    const allFiles: any[] = [];
    
    messages.forEach(message => {
      if (message.attachments) {
        message.attachments.forEach(fileId => {
          const fileData = sessionStorage.getItem(`file_${fileId}`);
          if (fileData) {
            const parsed = JSON.parse(fileData);
            
            // Determine the display type for the FilesPanel
            let displayType = parsed.type;
            if (parsed.type === 'binary') {
              // For binary files, use the MIME type if available, otherwise infer from extension
              displayType = parsed.mimeType || getMimeTypeFromExtension(parsed.name);
            }
            
            // Convert our file format to FilesPanel format
            allFiles.push({
              id: fileId,
              name: parsed.name,
              type: displayType,
              size: parsed.size || 0,
              createdAt: new Date(parsed.uploadedAt || parsed.extractedAt || Date.now()).getTime(),
              blobId: fileId,
              thumbUrl: parsed.type === 'image' ? parsed.data : undefined,
              textSnippet: (parsed.type === 'text' || parsed.type === 'pdf' || parsed.type === 'binary') ? 
                (parsed.content?.substring(0, 100) + (parsed.content?.length > 100 ? '...' : '')) : 
                undefined,
              // Store original data for compatibility
              originalData: parsed
            });
          }
        });
      }
    });
    
    return allFiles;
  };

  const getMimeTypeFromExtension = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      'js': 'application/javascript',
      'ts': 'application/typescript',
      'jsx': 'application/javascript',
      'tsx': 'application/typescript',
      'json': 'application/json',
      'py': 'text/x-python',
      'java': 'text/x-java-source',
      'cpp': 'text/x-c++',
      'c': 'text/x-c',
      'css': 'text/css',
      'html': 'text/html',
      'xml': 'application/xml',
      'yaml': 'application/x-yaml',
      'yml': 'application/x-yaml',
      'sql': 'application/sql',
      'sh': 'application/x-sh',
      'bash': 'application/x-sh',
      'md': 'text/markdown',
      'txt': 'text/plain'
    };
    
    return mimeTypes[extension || ''] || 'application/octet-stream';
  };
  const [isEnhancing, setIsEnhancing] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom function
  const scrollToBottom = (smooth: boolean = true) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
      setShowScrollButton(false);
      setIsUserScrolled(false); // Reset user scroll state when programmatically scrolling
    }
  };

  // Manual scroll to bottom (called by button click)
  const handleScrollToBottom = () => {
    scrollToBottom(true);
  };

  // Debounced scroll function for smoother streaming
  const debouncedScrollToBottom = (smooth: boolean = true) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      scrollToBottom(smooth);
    }, 16); // ~60fps
  };

  // Handle scroll events to show/hide scroll button and detect user scrolling
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // Slightly larger threshold
      
      
      setShowScrollButton(!isAtBottom);
      
      // Detect if user has manually scrolled away from bottom
      if (!isAtBottom) {
        setIsUserScrolled(true);
        // Clear any pending user scroll timeout
        if (userScrollTimeoutRef.current) {
          clearTimeout(userScrollTimeoutRef.current);
        }
      } else {
        // User is at bottom, re-enable auto-scroll immediately
        if (userScrollTimeoutRef.current) {
          clearTimeout(userScrollTimeoutRef.current);
        }
        setIsUserScrolled(false);
      }
    }
  };

  // Auto-scroll when messages change (only if user hasn't scrolled away)
  useEffect(() => {
    if (messages.length > 0 && !isUserScrolled) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        scrollToBottom(true);
      });
    }
  }, [messages.length, isUserScrolled]);

  // Auto-scroll during streaming (when content updates, only if user hasn't scrolled away)
  useEffect(() => {
    if (isLoading && !isThinking && !isUserScrolled && messages.length > 0) {
      // Use debounced scroll for smoother streaming
      debouncedScrollToBottom(true);
    }
  }, [messages, isLoading, isThinking, isUserScrolled]);

  // Add scroll event listener - re-attach when scroll container changes
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      // Check initial scroll state for empty state
      if (messages.length === 0) {
        setTimeout(() => handleScroll(), 100);
      }
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [messages.length]); // Re-attach when switching between empty and active states

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize session on component mount
  useEffect(() => {
    // Clean up existing session titles first
    chatStorageService.cleanupSessionTitles();
    
    // Don't automatically load the most recent session
    // Let the user explicitly choose to start a new chat or load from history
    // This prevents the screen from automatically shifting to a previous chat
  }, []);

  // Handle initial message
  useEffect(() => {
    if (initialMessage && initialMessage.trim()) {
      // Set the initial message in the text input
      setText(initialMessage);
      // Automatically send the message
      handleSendMessage(initialMessage.trim(), false);
    }
  }, [initialMessage]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
    };
  }, []);

  const handleSendMessage = async (message: string, _isCanvasMode: boolean, attachmentIds?: string[]) => {
    if (!message.trim() || isLoading) return;

    const userMessage: AIChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
      attachments: attachmentIds,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsThinking(true);
    setShowGetStarted(false);
    setIsUserScrolled(false); // Reset user scroll state for new conversation
    setText(''); // Clear input text

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    // Create AI message placeholder for streaming
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: AIChatMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    // Don't add empty AI message to UI - we'll show thinking animation instead

    // Handle session management
    let sessionId = currentSessionId;
    if (!sessionId) {
      // Create new session with user message only (AI message will be added when streaming starts)
      const title = aiChatService.generateChatTitle(message.trim());
      const newSession = chatStorageService.createSession(title, userMessage);
      sessionId = newSession.id;
      setCurrentSessionId(sessionId);
    } else {
      // Add user message to existing session
      chatStorageService.addMessage(sessionId, userMessage);
    }

    // Add AI message placeholder to storage immediately after session is ready
    chatStorageService.addMessage(sessionId, aiMessage);

    try {
      // Stream AI response
      let fullResponse = '';
      let hasStartedStreaming = false;
      
      for await (const chunk of aiChatService.sendMessageStream(message.trim(), messages, attachmentIds || [], abortControllerRef.current?.signal)) {
        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }
        if (!hasStartedStreaming) {
          setIsThinking(false);
          hasStartedStreaming = true;
          // Add AI message to UI when streaming starts
          setMessages(prev => {
            const updated = [...prev, aiMessage];
            return updated;
          });
        }
        
        fullResponse += chunk;
        
        // Update the AI message with streaming content
        const updatedAiMessage = { ...aiMessage, content: fullResponse };
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? updatedAiMessage
            : msg
        ));
        
        // Update the message in storage as it streams
        chatStorageService.updateMessage(sessionId, aiMessageId, updatedAiMessage);
      }

      // Finalize the AI message
      const finalAiMessage: AIChatMessage = {
        id: aiMessageId,
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
      };

      // Update messages with final content
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? finalAiMessage
          : msg
      ));

      // Update final AI message in session
      chatStorageService.updateMessage(sessionId, aiMessageId, finalAiMessage);

    } catch (error) {
      console.error('AI request failed:', error);
      toast.error('Failed to get AI response. Please check your API keys in admin settings.');
      
      // Remove the AI message from storage since the API failed
      if (sessionId) {
        const session = chatStorageService.getSession(sessionId);
        if (session) {
          session.messages = session.messages.filter(msg => msg.id !== aiMessageId);
          session.updatedAt = new Date();
          chatStorageService.saveSession(session);
        }
      }
    } finally {
      setIsLoading(false);
      setIsThinking(false);
      abortControllerRef.current = null;
    }
  };

  const handleSuggestedAction = (action: any) => {
    if (action.prompt) {
      // Set the prompt text in the input area instead of auto-sending
      setText(action.prompt);
    }
    // Don't close the Get Started section - let it stay visible until user sends message
  };

  const handleFileUpload = async (files: File[]): Promise<string[]> => {
    const fileIds: string[] = [];
    
    for (const file of files) {
      try {
        // Process different file types
        if (file.type === 'application/pdf') {
          // Use existing PDF processing
          const fileId = await processPDFFile(file);
          fileIds.push(fileId);
        } else if (file.type.startsWith('image/')) {
          // Process image files
          const fileId = await processImageFile(file);
          fileIds.push(fileId);
        } else if (file.type.startsWith('text/') || isTextBasedFile(file)) {
          // Process text files and text-based files (code, json, etc.)
          const fileId = await processTextFile(file);
          fileIds.push(fileId);
        } else {
          // For other file types, process as binary/generic files
          const fileId = await processGenericFile(file);
          fileIds.push(fileId);
        }
      } catch (error) {
        console.error(`Failed to process file ${file.name}:`, error);
        toast.error(`Failed to process ${file.name}`);
      }
    }
    
    return fileIds;
  };

  const processPDFFile = async (file: File): Promise<string> => {
    // Use the existing PDF extraction service
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/supabase/functions/extract-pdf', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to extract PDF text');
      }
      
      const result = await response.json();
      const fileId = `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store the extracted text for later use
      // In a real implementation, you'd store this in a database or cache
      sessionStorage.setItem(`file_${fileId}`, JSON.stringify({
        type: 'pdf',
        name: file.name,
        content: result.text,
        extractedAt: new Date().toISOString()
      }));
      
      return fileId;
    } catch (error) {
      console.error('PDF processing error:', error);
      throw error;
    }
  };

  const processImageFile = async (file: File): Promise<string> => {
    // Convert image to base64 for AI processing
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const fileId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Store the image data
        sessionStorage.setItem(`file_${fileId}`, JSON.stringify({
          type: 'image',
          name: file.name,
          mimeType: file.type,
          data: reader.result,
          uploadedAt: new Date().toISOString()
        }));
        
        resolve(fileId);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processTextFile = async (file: File): Promise<string> => {
    // Read text file content
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const fileId = `txt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Store the text content
        sessionStorage.setItem(`file_${fileId}`, JSON.stringify({
          type: 'text',
          name: file.name,
          content: reader.result,
          uploadedAt: new Date().toISOString()
        }));
        
        resolve(fileId);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const processGenericFile = async (file: File): Promise<string> => {
    // Process any file type as binary data
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Store the file data
        sessionStorage.setItem(`file_${fileId}`, JSON.stringify({
          type: 'binary',
          name: file.name,
          mimeType: file.type,
          size: file.size,
          data: reader.result, // Base64 encoded data
          uploadedAt: new Date().toISOString()
        }));
        
        resolve(fileId);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file); // This will encode as base64
    });
  };

  const isTextBasedFile = (file: File): boolean => {
    // Check if file is text-based by extension
    const textExtensions = [
      'txt', 'md', 'json', 'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'h',
      'css', 'html', 'htm', 'xml', 'yaml', 'yml', 'sql', 'sh', 'bash', 'ps1',
      'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala', 'r', 'm', 'pl', 'lua',
      'vim', 'vimrc', 'gitignore', 'gitattributes', 'dockerfile', 'makefile',
      'cmake', 'gradle', 'pom', 'sbt', 'gemfile', 'rakefile', 'gulpfile',
      'webpack', 'babel', 'eslint', 'prettier', 'editorconfig', 'env',
      'log', 'csv', 'tsv', 'ini', 'cfg', 'conf', 'config', 'properties'
    ];
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    return extension ? textExtensions.includes(extension) : false;
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    setIsThinking(false);
    toast.info('AI response stopped');
  };

  const handleEnhancePrompt = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to enhance');
      return;
    }

    setIsEnhancing(true);
    try {
      const enhancedText = await aiChatService.enhancePrompt(text.trim());
      setText(enhancedText);
      toast.success('Prompt enhanced successfully');
    } catch (error) {
      console.error('Prompt enhancement failed:', error);
      toast.error('Failed to enhance prompt. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleModelChange = (modelId: string) => {
    setCurrentModel(modelId);
  };

  const handleFileRemove = (fileId: string) => {
    // Remove from sessionStorage
    sessionStorage.removeItem(`file_${fileId}`);
    
    // Update messages to remove the file reference
    setMessages(prev => prev.map(msg => ({
      ...msg,
      attachments: msg.attachments?.filter(id => id !== fileId)
    })));
    
    // Update current session if it exists
    if (currentSessionId) {
      const session = chatStorageService.getSession(currentSessionId);
      if (session) {
        session.messages = session.messages.map(msg => ({
          ...msg,
          attachments: msg.attachments?.filter(id => id !== fileId)
        }));
        chatStorageService.saveSession(session);
      }
    }
    
    toast.success('File removed');
  };

  const handleFileSelect = (fileId: string) => {
    // This function is now handled by the FilesPanel component
    // The FilePreviewModal will be opened from within the FilesPanel
    console.log('File selected:', fileId);
  };

  const handleSelectChat = (chatId: string) => {
    const session = chatStorageService.getSession(chatId);
    if (session) {
      setMessages(session.messages);
      setCurrentSessionId(session.id);
      setShowGetStarted(false);
      setIsUserScrolled(false); // Reset user scroll state when loading a chat
      // Auto-scroll to bottom when loading a chat
      setTimeout(() => {
        scrollToBottom(false);
      }, 200);
    }
    setIsHistoryOpen(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setShowGetStarted(true);
    setIsUserScrolled(false); // Reset user scroll state for new chat
    setIsHistoryOpen(false);
  };


  // Expose the history and files opening functions to parent component
  useImperativeHandle(ref, () => ({
    openHistory: () => setIsHistoryOpen(true),
    openFiles: () => setIsFilesOpen(true)
  }));



  return (
    <div className={cn("h-full w-full relative flex flex-col", className)}>
      {/* History Button - Top Left (Desktop only) */}
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsHistoryOpen(true)}
          className="absolute top-4 left-4 h-8 w-8 rounded-full z-20"
        >
          <History className="h-4 w-4" />
        </Button>
      )}

      {/* Files Button - Top Right (Desktop only) */}
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFilesOpen(true)}
          className="absolute top-4 right-4 h-8 w-8 rounded-full z-20"
        >
          <FolderOpen className="h-4 w-4" />
        </Button>
      )}

      {/* Main Content Area - Account for fixed input */}
      <div className="w-full flex flex-col h-[calc(100vh-40px)]">
        {/* Empty Chat State - Scrollable Layout */}
        {messages.length === 0 && !isLoading ? (
          <div className="relative h-full flex flex-col">
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto ai-chat-scrollbar overflow-x-hidden">
               <div className="p-2 sm:p-4 pb-8">
                 <div className="text-center max-w-2xl mx-auto py-4">
                  {/* AI Avatar and Greeting */}
                  <div className="mb-4">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h1 className="text-2xl font-semibold text-foreground mb-2">
                      How can I help you today?
                    </h1>
                  </div>

                  {/* Chat Input - Centered in empty state */}
                  <div className="mb-6">
                    <ChatInput
                      onSendMessage={handleSendMessage}
                      onFileUpload={handleFileUpload}
                      onStopGenerating={handleStopGenerating}
                      isStreaming={isLoading}
                      currentModel={currentModel}
                      onModelChange={handleModelChange}
                      providers={mockProviders}
                      text={text}
                      onTextChange={setText}
                      onEnhancePrompt={handleEnhancePrompt}
                      isEnhancing={isEnhancing}
                      isSummarizing={false}
                    />
                  </div>

                   {/* Get Started Section */}
                   {showGetStarted && (
                     <div className="flex justify-center mb-4">
                       <SuggestedActions
                         onActionClick={handleSuggestedAction}
                         onClose={() => setShowGetStarted(false)}
                       />
                     </div>
                   )}
                </div>
              </div>
            </div>
            
            {/* Scroll to bottom button for empty state */}
            {showScrollButton && (
              <Button
                onClick={handleScrollToBottom}
                className="absolute bottom-16 right-4 h-10 w-10 rounded-full shadow-lg z-[60]"
                size="icon"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          /* Scrollable Chat Messages Area - Active Chat State */
          <div className="relative h-full flex flex-col">
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto ai-chat-scrollbar overflow-x-hidden">
              <div className="p-2 sm:p-4 pb-48 sm:pb-52">
                <div className="mx-auto w-full max-w-4xl">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <ChatMessage
                        key={message.id}
                        id={message.id}
                        role={message.role}
                        content={message.content}
                        timestamp={message.timestamp}
                        isStreaming={message.role === 'assistant' && index === messages.length - 1 && isLoading && !isThinking}
                        files={message.attachments ? message.attachments.map(id => {
                          const fileData = sessionStorage.getItem(`file_${id}`);
                          return fileData ? JSON.parse(fileData) : null;
                        }).filter(Boolean) : []}
                      />
                    ))}
                    
                    {/* Thinking Animation */}
                    {isThinking && (
                      <ChatMessage
                        id="thinking"
                        role="assistant"
                        content=""
                        timestamp={new Date()}
                        isStreaming={false}
                        isThinking={true}
                      />
                    )}
                    
                  </div>
                </div>
              </div>
            </div>
            
            {/* Scroll to bottom button */}
            {showScrollButton && (
              <Button
                onClick={handleScrollToBottom}
                className="absolute bottom-16 right-4 h-10 w-10 rounded-full shadow-lg z-[60]"
                size="icon"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Independent Fixed Chat Input - Overlay on top */}
      {messages.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="max-w-4xl mx-auto p-4">
            <ChatInput
              onSendMessage={handleSendMessage}
              onFileUpload={handleFileUpload}
              onStopGenerating={handleStopGenerating}
              isStreaming={isLoading}
              currentModel={currentModel}
              onModelChange={handleModelChange}
              providers={mockProviders}
              text={text}
              onTextChange={setText}
              onEnhancePrompt={handleEnhancePrompt}
              isEnhancing={isEnhancing}
              isSummarizing={false}
            />
          </div>
        </div>
      )}

      {/* Chat History Sidebar */}
      <ChatHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
      />

      {/* Files Panel Sidebar */}
      <FilesPanel
        files={getAllFilesFromMessages()}
        onFileRemove={handleFileRemove}
        onFileSelect={handleFileSelect}
        isOpen={isFilesOpen}
        onClose={() => setIsFilesOpen(false)}
      />
    </div>
  );
});

