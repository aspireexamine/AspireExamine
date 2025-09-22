# AI Assistant Feature

This directory contains the fully functional AI Assistant feature for the student dashboard, designed to replicate the Notion AI chat interface with real AI capabilities.

## 🚀 **Fully Functional Features**

### **Real AI Integration**
- **Multiple AI Providers**: Supports Gemini, Groq, and OpenRouter APIs
- **Automatic Fallback**: If one provider fails, automatically tries the next
- **API Key Management**: Uses existing Supabase-stored API keys from admin settings
- **Error Handling**: Graceful error handling with user-friendly messages

### **Chat Management**
- **Persistent Storage**: All chat sessions saved to localStorage
- **Chat History**: Browse and search through previous conversations
- **Session Management**: Create, load, and delete chat sessions
- **Auto-Title Generation**: Automatically generates chat titles from first message

## Components

### `AiAssistantScreen.tsx`
The main AI Assistant screen with full functionality.

**Features:**
- Real AI chat integration
- Session management
- History button (top-left corner)
- Error handling with toast notifications
- Loading states during AI processing

### `ChatMessage.tsx`
Individual chat message component with proper styling.

**Features:**
- Role-based styling (user vs assistant)
- Timestamp display
- Smooth animations
- Avatar integration

### `ChatInput.tsx`
Advanced chat input component with Notion-like styling.

**Features:**
- Compact design (40px height)
- Source mode selection (Auto, Research)
- Send button with loading states
- Keyboard shortcuts (Enter to send)
- Rounded design elements

### `ChatHistory.tsx`
Full-featured chat history sidebar.

**Features:**
- Real chat session data
- Search functionality
- Delete chat sessions
- Empty state handling
- Responsive design

### `SuggestedActions.tsx`
Component displaying suggested actions to help users get started.

**Features:**
- 8 different action cards
- Hover effects and animations
- Pre-defined prompts
- Close button functionality

### `LoadingMessage.tsx`
Loading indicator component for AI processing.

**Features:**
- Animated dots
- Consistent styling
- Smooth appearance animations

## Services

### `aiChatService.ts`
Core AI service handling all AI provider integrations.

**Features:**
- Multi-provider support (Gemini, Groq, OpenRouter)
- Automatic fallback system
- Conversation history support
- Error handling and retry logic

### `chatStorageService.ts`
Local storage service for chat session management.

**Features:**
- Session CRUD operations
- Search functionality
- Data persistence
- Session limits and cleanup

## Integration

The AI Assistant is fully integrated into the student dashboard:

1. **Sidebar Navigation**: "AI Assistant" option in student sidebar
2. **Routing**: `ai-assistant` view state in dashboard
3. **API Integration**: Uses existing Supabase API key storage
4. **Error Handling**: Toast notifications for user feedback

## Usage

### **For Students:**
1. Navigate to the student dashboard
2. Click "AI Assistant" in the sidebar
3. Start chatting with the AI assistant
4. Access chat history via the history button (top-left)
5. Create new chats or continue existing conversations

### **For Admins:**
1. Configure AI API keys in Admin → Settings → AI Provider API Keys
2. Supported providers: Google Gemini, Groq, OpenRouter
3. Keys are stored securely in Supabase

## API Configuration

The AI Assistant uses the same API keys configured in the admin panel:

- **Google Gemini**: For Google's Gemini 2.0 Flash model
- **Groq**: For Llama 3 8B model
- **OpenRouter**: For Llama 3.1 8B model (free tier)

## Error Handling

- **API Failures**: Automatic fallback between providers
- **No API Keys**: Clear error messages directing to admin settings
- **Network Issues**: Graceful degradation with retry options
- **User Feedback**: Toast notifications for all error states

## Styling

- **Notion-like Design**: Clean, modern interface
- **Rounded Elements**: Consistent rounded corners throughout
- **Responsive**: Works on mobile and desktop
- **Animations**: Smooth transitions and loading states
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Data Storage

- **Local Storage**: Chat sessions stored locally in browser
- **Session Limits**: Maximum 50 chat sessions
- **Search**: Full-text search across chat history
- **Persistence**: Survives browser refreshes and tab switches
