import { useState } from 'react';
import { Bot, History } from 'lucide-react';
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

export function AiAssistantScreen({ className }: AiAssistantScreenProps) {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showGetStarted, setShowGetStarted] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

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

    // Create AI message placeholder for streaming
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: AIChatMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, aiMessage]);

    try {
      // Handle session management
      if (!currentSessionId) {
        // Create new session
        const title = aiChatService.generateChatTitle(message.trim());
        const newSession = chatStorageService.createSession(title, userMessage);
        setCurrentSessionId(newSession.id);
      } else {
        // Add user message to existing session
        chatStorageService.addMessage(currentSessionId, userMessage);
      }

      // Stream AI response
      let fullResponse = '';
      let hasStartedStreaming = false;
      
      for await (const chunk of aiChatService.sendMessageStream(message.trim(), messages)) {
        if (!hasStartedStreaming) {
          setIsThinking(false);
          hasStartedStreaming = true;
        }
        
        fullResponse += chunk;
        
        // Update the AI message with streaming content
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: fullResponse }
            : msg
        ));
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

      // Add final AI message to session
      if (currentSessionId) {
        chatStorageService.addMessage(currentSessionId, finalAiMessage);
      }

    } catch (error) {
      console.error('AI request failed:', error);
      toast.error('Failed to get AI response. Please check your API keys in admin settings.');
      
      const errorMessage: AIChatMessage = {
        id: aiMessageId,
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to the AI service right now. Please check if the API keys are properly configured in the admin settings.",
        timestamp: new Date(),
      };
      
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? errorMessage
          : msg
      ));
    } finally {
      setIsLoading(false);
      setIsThinking(false);
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
    }
    setIsHistoryOpen(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setShowGetStarted(true);
    setIsHistoryOpen(false);
  };


  return (
    <div className={cn("flex flex-col h-full relative", className)}>
      {/* History Button - Top Left */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsHistoryOpen(true)}
        className="absolute top-4 left-4 h-8 w-8 rounded-full z-20"
      >
        <History className="h-4 w-4" />
      </Button>

      {/* Main Content Area - Scrollable with padding for fixed input */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 pb-24 sm:pb-28">
        <div className="max-w-4xl mx-auto">
          {/* Empty Chat State */}
          {messages.length === 0 && (
            <div className="flex flex-col h-full">
              {/* AI Avatar and Greeting - At the top */}
              <div className="text-center mb-8 pt-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-8 w-8 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                  How can I help you today?
                </h1>
              </div>

              {/* Get Started Section */}
              {showGetStarted && (
                <div className="flex justify-center">
                  <SuggestedActions
                    onActionClick={handleSuggestedAction}
                    onClose={() => setShowGetStarted(false)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Active Chat State */}
          {messages.length > 0 && (
            <div className="space-y-4">
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
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-muted border shadow-sm">
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
                      </div>
                      <span className="text-sm text-muted-foreground ml-2">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Chat Input Area - Overlay */}
      <div className="absolute bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="Ask, search, or make anything..."
            isCompact={messages.length > 0}
          />
        </div>
      </div>

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
