'use client';

import { useEffect, useRef, useLayoutEffect, useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { SuggestedActions } from './SuggestedActions';
import { AIChatMessage } from '@/services/aiChatService';
import { Bot } from 'lucide-react';

interface ChatTranscriptProps {
  messages: AIChatMessage[];
  isStreaming: boolean;
  isThinking?: boolean;
  isMobile?: boolean;
  onActionClick?: (action: any) => void;
  showGetStarted?: boolean;
  onCloseGetStarted?: () => void;
  chatInputComponent?: React.ReactNode;
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
}

export function ChatTranscript({ 
  messages, 
  isStreaming, 
  isThinking = false,
  isMobile, 
  onActionClick, 
  showGetStarted = true, 
  onCloseGetStarted,
  chatInputComponent,
  scrollContainerRef
}: ChatTranscriptProps) {

  if (messages.length === 0) {
    return (
      <div ref={scrollContainerRef} className="flex-1 flex flex-col justify-center items-center p-4 space-y-8">
        <div className="w-full max-w-4xl flex flex-col items-center space-y-8">
          {/* AI Assistant Greeting Section */}
          <div className="flex flex-col items-center space-y-4">
            {/* Robot Icon */}
            <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
              <Bot className="h-8 w-8 text-gray-700" />
            </div>
            
            {/* Greeting Text */}
            <h1 className="text-2xl font-medium text-gray-800 text-center">
              How can I help you today?
            </h1>
          </div>
          
          
          {/* Chat Input in the middle for empty state */}
          {chatInputComponent && (
            <div className="w-full max-w-2xl">
              {chatInputComponent}
            </div>
          )}
          
          {/* Get Started Actions */}
          {showGetStarted && onActionClick && (
            <div className="w-full max-w-3xl">
              <SuggestedActions
                onActionClick={onActionClick}
                onClose={onCloseGetStarted}
                showCloseButton={true}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto custom-scrollbar p-4"
    >
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id}
            id={message.id}
            role={message.role}
            content={message.content}
            timestamp={message.timestamp}
            isStreaming={isStreaming && index === messages.length - 1}
            isThinking={isThinking && index === messages.length - 1 && message.role === 'assistant'}
          />
        ))}
      </div>
    </div>
  );
}
