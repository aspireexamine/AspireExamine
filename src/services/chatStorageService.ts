import { ChatMessage, ChatSession } from './aiChatService';

// Re-export types for external use
export type { ChatSession };

class ChatStorageService {
  private readonly STORAGE_KEY = 'aspire-examine-chat-sessions';
  private readonly MAX_SESSIONS = 50;

  // Get all chat sessions
  getSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const sessions = JSON.parse(stored);
      return sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
      return [];
    }
  }

  // Get a specific chat session
  getSession(sessionId: string): ChatSession | null {
    const sessions = this.getSessions();
    return sessions.find(session => session.id === sessionId) || null;
  }

  // Save a chat session
  saveSession(session: ChatSession): void {
    try {
      const sessions = this.getSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.unshift(session);
      }

      // Limit the number of stored sessions
      if (sessions.length > this.MAX_SESSIONS) {
        sessions.splice(this.MAX_SESSIONS);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save chat session:', error);
    }
  }

  // Create a new chat session
  createSession(title: string, firstMessage: ChatMessage): ChatSession {
    const session: ChatSession = {
      id: Date.now().toString(),
      title,
      messages: [firstMessage],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.saveSession(session);
    return session;
  }

  // Add a message to an existing session
  addMessage(sessionId: string, message: ChatMessage): void {
    const session = this.getSession(sessionId);
    if (!session) return;

    session.messages.push(message);
    session.updatedAt = new Date();
    this.saveSession(session);
  }

  // Update an existing message in a session
  updateMessage(sessionId: string, messageId: string, updatedMessage: ChatMessage): void {
    const session = this.getSession(sessionId);
    if (!session) return;

    const messageIndex = session.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex >= 0) {
      session.messages[messageIndex] = updatedMessage;
      session.updatedAt = new Date();
      this.saveSession(session);
    }
  }

  // Update session title
  updateSessionTitle(sessionId: string, title: string): void {
    const session = this.getSession(sessionId);
    if (!session) return;

    // Check if title already exists and make it unique if needed
    const uniqueTitle = this.makeTitleUnique(title, sessionId);
    
    session.title = uniqueTitle;
    session.updatedAt = new Date();
    this.saveSession(session);
  }

  // Make title unique by adding a number suffix if needed
  private makeTitleUnique(title: string, excludeSessionId?: string): string {
    const sessions = this.getSessions();
    const existingTitles = sessions
      .filter(session => session.id !== excludeSessionId)
      .map(session => session.title);
    
    if (!existingTitles.includes(title)) {
      return title;
    }
    
    let counter = 1;
    let uniqueTitle = `${title} (${counter})`;
    
    while (existingTitles.includes(uniqueTitle)) {
      counter++;
      uniqueTitle = `${title} (${counter})`;
    }
    
    return uniqueTitle;
  }

  // Delete a chat session
  deleteSession(sessionId: string): void {
    try {
      const sessions = this.getSessions();
      const filteredSessions = sessions.filter(session => session.id !== sessionId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredSessions));
    } catch (error) {
      console.error('Failed to delete chat session:', error);
    }
  }

  // Clear all chat sessions
  clearAllSessions(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear chat sessions:', error);
    }
  }

  // Search chat sessions
  searchSessions(query: string): ChatSession[] {
    const sessions = this.getSessions();
    const lowercaseQuery = query.toLowerCase();
    
    return sessions.filter(session => 
      session.title.toLowerCase().includes(lowercaseQuery) ||
      session.messages.some(msg => 
        msg.content.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  // Clean up existing session titles by removing timestamps
  cleanupSessionTitles(): void {
    const sessions = this.getSessions();
    let hasChanges = false;

    const cleanedSessions = sessions.map(session => {
      // Remove timestamp pattern like " (06:34 PM)" from titles
      const cleanedTitle = session.title.replace(/\s*\(\d{1,2}:\d{2}\s*(AM|PM)\)$/i, '').trim();
      
      if (cleanedTitle !== session.title) {
        hasChanges = true;
        return {
          ...session,
          title: cleanedTitle,
          updatedAt: new Date()
        };
      }
      
      return session;
    });

    if (hasChanges) {
      // Save the cleaned sessions back to localStorage
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cleanedSessions));
        console.log('Cleaned up chat session titles');
      } catch (error) {
        console.error('Failed to clean up session titles:', error);
      }
    }
  }
}

export const chatStorageService = new ChatStorageService();
