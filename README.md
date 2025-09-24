# AspireExamine

## Overview

AspireExamine is a comprehensive, AI-powered educational platform designed for competitive exam preparation (NEET, JEE, and similar exams). It provides a complete ecosystem for students and administrators to manage, attempt, and analyze practice tests, previous year questions, and study materials. The platform features advanced AI capabilities, real-time collaboration, and a modern, responsive interface built with cutting-edge technologies.

## Key Features

### 🤖 AI-Powered Learning
- **Aspire AI Assistant**: Advanced AI chat interface with multiple model support (Gemini, Groq, OpenRouter)
- **Smart Study Hub**: AI-generated content from various sources (YouTube, PDFs, text, images)
- **Content Generation**: Automatic creation of notes, summaries, flashcards, mind maps, and practice questions
- **Multi-modal Support**: Text, image, and document processing capabilities

### 📚 Comprehensive Study Management
- **Stream-based Organization**: NEET, JEE, and other competitive exam streams
- **Subject-wise Structure**: Physics, Chemistry, Biology, Mathematics with chapter-wise organization
- **Practice Sections**: Full syllabus, subject-wise, and chapter-wise practice tests
- **Test Series Management**: Mock tests and comprehensive test series
- **Previous Year Questions**: Organized by year and difficulty levels

### 🎯 Advanced Exam Interface
- **Real-time Timer**: Configurable exam timers with warnings
- **Question Palette**: Visual navigation through questions with status indicators
- **Auto-save**: Automatic saving of answers and progress
- **Review System**: Mark questions for review and detailed analysis
- **PDF Reports**: Downloadable detailed performance reports

### 📊 Analytics & Insights
- **Performance Tracking**: Detailed analytics on test performance
- **Progress Monitoring**: Visual progress indicators and statistics
- **Subject-wise Analysis**: Performance breakdown by subject and topic
- **Historical Data**: Track improvement over time

### 🏛️ Admin Dashboard
- **Content Management**: Full CRUD operations for streams, subjects, papers, and questions
- **Bulk Import**: CSV/JSON import for questions and content
- **AI Tools**: YouTube transcript extraction, PDF processing, and question generation
- **User Management**: Student and admin role management
- **Analytics Dashboard**: Platform-wide performance metrics

### 📖 Digital Library
- **Personal Library**: Students can save and organize generated content
- **Notebook Management**: Upload and organize study materials
- **Content Types**: Notes, summaries, flashcards, mind maps, and questions
- **Search & Filter**: Advanced search and categorization features

### 🔐 Authentication & Security
- **Supabase Auth**: Secure authentication with multiple providers
- **Role-based Access**: Student and admin role separation
- **Profile Management**: Complete user profile with avatar support
- **Session Management**: Secure session handling and persistence

---

## Table of Contents
- [File Structure](#file-structure)
- [Frameworks, Libraries, and Tools](#frameworks-libraries-and-tools)
- [Architecture & Infrastructure](#architecture--infrastructure)
- [How the Project Works](#how-the-project-works)
- [Detailed File/Folder Explanations](#detailed-filefolder-explanations)
- [Current Implementation Details](#current-implementation-details)

---

## File Structure

```
[See tree.md for the full file structure.]
```

The complete file structure is maintained in [`tree.md`](tree.md). This structure is reflected in the organization of components, utilities, types, and configuration files.

---

## Technology Stack

### Frontend Technologies
- **React 18**: Modern UI library with hooks and concurrent features
- **TypeScript**: Static typing for enhanced development experience
- **Vite**: Lightning-fast build tool and development server
- **React Router DOM**: Client-side routing with nested routes
- **Framer Motion**: Advanced animations and transitions

### UI & Design System
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Radix UI**: Accessible, unstyled UI primitives (40+ components)
- **Lucide React**: Comprehensive icon library
- **Shadcn/ui**: Pre-built component library
- **CSS Variables**: Dynamic theming with light/dark mode support

### Backend & Database
- **Supabase**: Backend-as-a-Service with PostgreSQL database
- **Supabase Auth**: Authentication with multiple providers
- **Supabase Storage**: File storage for documents and media
- **Supabase Edge Functions**: Serverless functions for AI processing
- **Node.js/Express**: Auxiliary server for YouTube audio proxy

### AI & Machine Learning
- **Google Gemini**: Advanced AI model for content generation
- **Groq**: High-performance AI inference
- **OpenRouter**: Access to multiple AI models
- **AssemblyAI**: Speech-to-text transcription
- **Custom AI Services**: Multi-provider AI chat service

### Data Processing & File Handling
- **PapaParse**: CSV parsing and generation
- **PDF.js**: Client-side PDF processing
- **React PDF**: PDF rendering and display
- **ytdl-core**: YouTube video processing
- **youtube-captions-scraper**: Caption extraction
- **html2canvas**: Screenshot generation
- **jsPDF**: PDF generation for reports

### State Management & Forms
- **React Hook Form**: Performant form handling
- **Zod**: Runtime type validation
- **React Context**: Global state management
- **Local Storage**: Client-side persistence
- **Session Storage**: Temporary data storage

### Development Tools
- **ESLint**: Code linting with TypeScript support
- **TypeScript ESLint**: Advanced TypeScript linting rules
- **Concurrently**: Parallel development server execution
- **PostCSS**: CSS processing and optimization
- **Autoprefixer**: CSS vendor prefixing

---

## Architecture & Infrastructure

- **Frontend**: SPA built with React, TypeScript, and Vite. Uses a modular, component-driven structure. State is managed via hooks and context. The UI is styled with Tailwind CSS and Radix UI primitives for accessibility.
- **Backend**: Lightweight Express server (see `server.js`) for proxying YouTube audio (needed for AI tools). All main data and authentication are handled by Supabase.
- **Supabase**: Used for user authentication, session management, and as a backend database (PostgreSQL).
- **Routing**: Client-side routing with React Router DOM. Admin and student dashboards are separated by role.
- **Theming**: ThemeContext provides light/dark/system theming, persisted in localStorage.
- **Testing/Practice**: Exam/practice flows are managed by stateful React components, with timer, palette, and result analytics.

---

## How the Platform Works

### User Journey

1. **Landing & Authentication**
   - Users access a modern landing page with feature highlights
   - Secure authentication via Supabase (email/password, Google OAuth)
   - Role-based routing to appropriate dashboards

2. **Student Experience**
   - **Home Dashboard**: Browse available streams (NEET, JEE, etc.)
   - **Subject Navigation**: Drill down through subjects → chapters → papers
   - **Practice Tests**: Attempt full syllabus, subject-wise, or chapter-wise tests
   - **AI Assistant**: Get help with study questions and content generation
   - **Smart Study Hub**: Generate study materials from various sources
   - **Personal Library**: Save and organize generated content
   - **Performance Analytics**: Track progress and identify weak areas

3. **Admin Experience**
   - **Content Management**: Create and manage streams, subjects, papers, questions
   - **Bulk Operations**: Import questions via CSV/JSON files
   - **AI Tools**: Generate content from YouTube videos, PDFs, and text
   - **User Management**: Monitor student progress and manage accounts
   - **Analytics Dashboard**: Platform-wide performance metrics
   - **Test Series Management**: Create and organize mock test series

### AI-Powered Features

1. **Content Generation**
   - Extract transcripts from YouTube educational videos
   - Process PDF documents and textbooks
   - Generate practice questions with multiple difficulty levels
   - Create study notes, summaries, and flashcards

2. **Smart Study Assistant**
   - Multi-model AI chat interface (Gemini, Groq, OpenRouter)
   - File upload support for documents and images
   - Context-aware responses based on study materials
   - Chat history and session management

3. **Automated Question Creation**
   - AI-generated multiple-choice questions
   - Customizable difficulty levels and question types
   - Bulk question generation from educational content
   - Quality validation and approval workflows

### Data Architecture

- **Streams**: Top-level exam categories (NEET, JEE, etc.)
- **Subjects**: Academic subjects within each stream
- **Chapters**: Organized content within subjects
- **Papers**: Test papers with questions and metadata
- **Practice Sections**: Specialized practice test categories
- **Test Series**: Mock test collections
- **Results**: Student performance data and analytics
- **Library Items**: Generated and uploaded study materials

---

## Project Structure

### Core Application Files
- **`src/App.tsx`**: Main application component with routing, authentication, and state management
- **`src/main.tsx`**: Application entry point with React Router setup
- **`src/LoginPage.tsx`**: Authentication interface with Supabase integration
- **`server.js`**: Express server for YouTube audio proxy and auxiliary services

### Component Architecture

#### `src/components/student/`
- **`StudentDashboard.tsx`**: Main student interface with navigation and content rendering
- **`ExamInterface.tsx`**: Advanced exam interface with timer, palette, and auto-save
- **`ResultsPage.tsx`**: Performance analysis and detailed result breakdown
- **`ProfilePage.tsx`**: User profile management and settings
- **`SmartStudyHub.tsx`**: AI-powered content generation interface
- **`LibraryView.tsx`**: Personal library for organizing study materials
- **`LibraryContentViewer.tsx`**: Content viewer for generated materials
- **`StudentSidebar.tsx`**: Navigation sidebar with role-based menu items

#### `src/components/admin/`
- **`AdminDashboard.tsx`**: Main admin interface with section routing
- **`StreamsManagement.tsx`**: Stream creation and management
- **`PapersManagement.tsx`**: Paper and question management
- **`QuestionsManagement.tsx`**: Individual question editing and organization
- **`BulkImport.tsx`**: CSV/JSON import system for questions
- **`AITools.tsx`**: AI-powered content generation tools
- **`TestManager.tsx`**: Test series and mock test management
- **`Analytics.tsx`**: Platform analytics and performance metrics
- **`UsersManagement.tsx`**: User account management
- **`AdminLibraryManager.tsx`**: Admin library and notebook management

#### `src/components/AiAssistant/`
- **`AiAssistantScreen.tsx`**: Main AI chat interface with multi-model support
- **`ChatMessage.tsx`**: Individual chat message component with file support
- **`ChatInput.tsx`**: Advanced input with file upload and voice support
- **`FilesPanel.tsx`**: File management and preview system
- **`ChatHistory.tsx`**: Chat session history and management
- **`SuggestedActions.tsx`**: AI-powered suggested actions and prompts

#### `src/components/ui/`
- **40+ UI Components**: Complete design system built on Radix UI primitives
- **Accessible Components**: Accordion, Dialog, Button, Table, Form, etc.
- **Custom Components**: Specialized components for exam interface and analytics

### Services & Utilities

#### `src/services/`
- **`aiChatService.ts`**: Multi-provider AI chat service with fallback support
- **`chatStorageService.ts`**: Chat history and session persistence

#### `src/lib/`
- **`supabaseClient.ts`**: Supabase client configuration and setup
- **`supabaseQueries.ts`**: Database queries and data management
- **`file-utils.ts`**: File handling utilities and validation
- **`speech.ts`**: Speech-to-text and voice input services
- **`providers/base.ts`**: AI provider abstraction layer

#### `src/types/`
- **`index.ts`**: Complete TypeScript definitions for all entities
- **`supabase.ts`**: Generated Supabase type definitions

### Configuration Files
- **`vite.config.ts`**: Vite configuration with path aliases and build optimization
- **`tailwind.config.js`**: Tailwind CSS configuration with custom design tokens
- **`tsconfig.json`**: TypeScript configuration for strict type checking
- **`eslint.config.js`**: ESLint configuration with React and TypeScript rules
- **`package.json`**: Dependencies and build scripts

---

## Implementation Highlights

### Advanced Features

- **Real-time Synchronization**: Live updates across admin and student interfaces using Supabase real-time subscriptions
- **Multi-modal AI Support**: Integration with multiple AI providers (Gemini, Groq, OpenRouter) with automatic fallback
- **Advanced File Processing**: Support for PDFs, images, YouTube videos, and text documents
- **Intelligent Content Generation**: AI-powered creation of study materials, practice questions, and summaries
- **Comprehensive Analytics**: Detailed performance tracking with visual charts and progress indicators
- **Responsive Design**: Mobile-first approach with adaptive layouts for all screen sizes

### Technical Excellence

- **Type Safety**: Complete TypeScript coverage with strict type checking
- **Performance Optimization**: Code splitting, lazy loading, and efficient state management
- **Accessibility**: WCAG-compliant components with keyboard navigation and screen reader support
- **Security**: Secure authentication, role-based access control, and data validation
- **Scalability**: Modular architecture with reusable components and services

### Development Experience

- **Modern Tooling**: Vite for fast development, ESLint for code quality, and TypeScript for reliability
- **Component Library**: 40+ pre-built UI components with consistent design patterns
- **State Management**: Efficient state handling with React Context and custom hooks
- **Testing Ready**: Structured for easy unit and integration testing
- **Documentation**: Comprehensive inline documentation and type definitions

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- AI provider API keys (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AspireExamine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   This runs both the Vite dev server (port 5173) and Express backend (port 3001) concurrently.

### Available Scripts

- **`npm run dev`**: Start development servers
- **`npm run build`**: Build for production
- **`npm run build:netlify`**: Build optimized for Netlify deployment
- **`npm run lint`**: Run ESLint for code quality
- **`npm run preview`**: Preview production build locally
- **`npm run update-schema`**: Update Supabase TypeScript types

### Deployment

The application is configured for deployment on:
- **Netlify**: Use `npm run build:netlify` for optimized builds
- **Vercel**: Standard Vite build process
- **Supabase**: Edge functions for AI processing

### AI Configuration

To enable AI features, configure API keys in your Supabase dashboard:
- Google Gemini API key
- Groq API key  
- OpenRouter API key
- AssemblyAI API key (for transcription)

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Acknowledgments

- Built with [React](https://react.dev/), [Vite](https://vitejs.dev/), [Supabase](https://supabase.com/)
- UI components from [Radix UI](https://www.radix-ui.com/) and [Tailwind CSS](https://tailwindcss.com/)
- AI integration with [Google Gemini](https://ai.google.dev/), [Groq](https://groq.com/), and [OpenRouter](https://openrouter.ai/)
- Icons by [Lucide](https://lucide.dev/)
- Animations by [Framer Motion](https://www.framer.com/motion/)

---

## Support

For support and questions, please open an issue in the repository or contact the development team.
