import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Plus, 
  Search,
  Clock,
  X,
  Trash2,
  Edit2,
  Check,
  X as XIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { chatStorageService } from '@/services/chatStorageService';
import { ChatSession } from '@/services/aiChatService';

interface ChatHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  className?: string;
}

export function ChatHistory({ isOpen, onClose, onSelectChat, onNewChat, className }: ChatHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Clean up existing session titles first
      chatStorageService.cleanupSessionTitles();
      
      const sessions = chatStorageService.getSessions();
      setChatSessions(sessions);
    }
  }, [isOpen]);

  const filteredHistory = searchQuery 
    ? chatStorageService.searchSessions(searchQuery)
    : chatSessions;

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleEditStart = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle);
  };

  const handleEditSave = () => {
    if (editingSessionId && editingTitle.trim()) {
      chatStorageService.updateSessionTitle(editingSessionId, editingTitle.trim());
      setChatSessions(chatStorageService.getSessions());
    }
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const handleEditCancel = () => {
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={cn("fixed inset-0 z-50 bg-black/50", className)} onClick={onClose}>
      <div 
        className="fixed left-0 top-0 h-full w-80 bg-background border-r shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Chat history</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewChat}
              className="h-8 w-8 rounded-full"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full"
            />
          </div>
        </div>

        {/* Chat History List */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {searchQuery ? `Search results (${filteredHistory.length})` : 'Recent chats'}
              </h3>
              {filteredHistory.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'No chats found' : 'No chat history yet'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {searchQuery ? 'Try a different search term' : 'Start a new conversation to see it here'}
                  </p>
                </div>
              ) : (
                filteredHistory.map((chat) => (
                  <Card
                    key={chat.id}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01] rounded-xl group"
                    onClick={() => !editingSessionId && onSelectChat(chat.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {editingSessionId === chat.id ? (
                            // Edit mode
                            <div className="space-y-2">
                              <Input
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={handleKeyPress}
                                className="h-8 text-sm"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditSave();
                                  }}
                                >
                                  <Check className="h-3 w-3 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditCancel();
                                  }}
                                >
                                  <XIcon className="h-3 w-3 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // Normal mode
                            <>
                              <h4 className="font-medium text-sm truncate">{chat.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {chat.messages.length > 1 
                                  ? `${chat.messages.length} messages` 
                                  : chat.messages[0]?.content !== chat.title 
                                    ? chat.messages[0]?.content || 'No messages'
                                    : 'New conversation'
                                }
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {formatTimeAgo(chat.updatedAt)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditStart(chat.id, chat.title);
                                    }}
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      chatStorageService.deleteSession(chat.id);
                                      setChatSessions(chatStorageService.getSessions());
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
