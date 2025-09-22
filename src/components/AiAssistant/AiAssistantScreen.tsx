import { useState, useRef, useEffect } from 'react';
import { History, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SuggestedActions } from './SuggestedActions';
import { ChatHistory } from './ChatHistory';
import { aiChatService, ChatMessage as AIChatMessage } from '@/services/aiChatService';
import { chatStorageService } from '@/services/chatStorageService';
import { toast } from 'sonner';

interface AiAssistantScreenProps {
  className?: string;
}

// Helper function to deduplicate repetitive content
function deduplicateContent(content: string): string {
  // Remove obvious repetitive patterns like "answer 12" followed by "answer 1+2"
  // This is a simple approach - can be enhanced based on specific patterns
  
  // Split into lines and remove duplicate consecutive lines
  const lines = content.split('\n');
  const deduplicatedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i].trim();
    const previousLine = i > 0 ? lines[i - 1].trim() : '';
    
    // Skip if current line is very similar to previous line (with minor variations)
    if (currentLine && currentLine !== previousLine) {
      // Check for patterns like "answer 12" vs "answer 1+2"
      if (previousLine && currentLine.length > 10) {
        const similarity = calculateSimilarity(previousLine, currentLine);
        if (similarity < 0.8) { // Less than 80% similar
          deduplicatedLines.push(lines[i]);
        }
      } else {
        deduplicatedLines.push(lines[i]);
      }
    }
  }
  
  return deduplicatedLines.join('\n');
}

// Simple similarity calculation
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

// Levenshtein distance calculation
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

export function AiAssistantScreen({ className }: AiAssistantScreenProps) {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showGetStarted, setShowGetStarted] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolled, setIsUserScrolled] = useState(false);
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

  // Initialize session on component mount
  useEffect(() => {
    // Clean up existing session titles first
    chatStorageService.cleanupSessionTitles();
    
    // Don't automatically load the most recent session
    // Let the user explicitly choose to start a new chat or load from history
    // This prevents the screen from automatically shifting to a previous chat
  }, []);

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

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: AIChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsThinking(true);
    setShowGetStarted(false);
    setIsUserScrolled(false); // Reset user scroll state for new conversation

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
      
      for await (const chunk of aiChatService.sendMessageStream(message.trim(), messages, abortControllerRef.current?.signal)) {
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
            // console.log('Adding AI message to UI:', aiMessage.id, 'Total messages:', updated.length);
            return updated;
          });
        }
        
        fullResponse += chunk;
        
        // Basic deduplication: remove obvious repetitive patterns
        fullResponse = deduplicateContent(fullResponse);
        
        // Debug: Log chunk and full response to identify duplication
        // console.log('Chunk received:', chunk);
        // console.log('Full response so far:', fullResponse);
        
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

      // Finalize the AI message with deduplication
      const finalAiMessage: AIChatMessage = {
        id: aiMessageId,
        role: 'assistant',
        content: deduplicateContent(fullResponse),
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
      handleSendMessage(action.prompt);
    }
    setShowGetStarted(false);
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

  const handleStopAI = () => {
    // Abort the current AI request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Reset states
    setIsLoading(false);
    setIsThinking(false);
    
    // Show toast notification
    toast.info('AI response stopped');
  };



  return (
    <div className={cn("h-full w-full relative flex flex-col", className)}>
      {/* History Button - Top Left */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsHistoryOpen(true)}
        className="absolute top-4 left-4 h-8 w-8 rounded-full z-20"
      >
        <History className="h-4 w-4" />
      </Button>


      {/* Main Content Area - Account for fixed input */}
      <div className="w-full flex flex-col h-[calc(100vh-200px)]">
        {/* Empty Chat State - Scrollable Layout */}
        {messages.length === 0 && !isLoading ? (
          <div className="relative h-full flex flex-col">
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto ai-chat-scrollbar">
               <div className="p-4 pb-64">
                 <div className="text-center max-w-2xl mx-auto py-8 min-h-[120vh]">
                  {/* AI Avatar and Greeting */}
                  <div className="mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <div className="h-8 w-8 text-muted-foreground text-2xl">🤖</div>
                    </div>
                    <h1 className="text-2xl font-semibold text-foreground mb-2">
                      How can I help you today?
                    </h1>
                  </div>

                  {/* Chat Input - Centered in empty state */}
                  <div className="mb-8">
                    <ChatInput
                      onSendMessage={handleSendMessage}
                      onStopAI={handleStopAI}
                      isLoading={isLoading}
                      placeholder="Ask, search, or make anything..."
                      isCompact={false}
                    />
                  </div>

                   {/* Get Started Section */}
                   {showGetStarted && (
                     <div className="flex justify-center mb-16">
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
                className="absolute bottom-4 right-4 h-10 w-10 rounded-full shadow-lg z-[60]"
                size="icon"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          /* Scrollable Chat Messages Area - Active Chat State */
          <div className="relative h-full flex flex-col">
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto ai-chat-scrollbar">
              <div className="p-4 pb-32">
                <div className="mx-auto w-full max-w-4xl">
                  <div className="space-y-6">
                    {messages.map((message, index) => (
                      <ChatMessage
                        key={message.id}
                        id={message.id}
                        role={message.role}
                        content={message.content}
                        timestamp={message.timestamp}
                        isStreaming={message.role === 'assistant' && index === messages.length - 1 && isLoading && !isThinking}
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
                className="absolute bottom-4 right-4 h-10 w-10 rounded-full shadow-lg z-[60]"
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
              onStopAI={handleStopAI}
              isLoading={isLoading}
              placeholder="Ask, search, or make anything..."
              isCompact={true}
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
    </div>
  );
}
