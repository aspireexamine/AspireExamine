# AspireExamine

## Overview

AspireExamine is a professional, full-stack web application designed for NEET/JEE and similar exam preparation. It provides a robust platform for students and administrators to manage, attempt, and analyze practice tests, previous year questions, and study materials. The system is built with a modern React + TypeScript frontend, a Node.js/Express backend for auxiliary services, and leverages Supabase for authentication and data management. The UI is highly interactive, responsive, and leverages a component-driven architecture with Tailwind CSS and Radix UI primitives for accessibility and design consistency.

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

## Frameworks, Libraries, and Tools

### Core Frameworks
- **React 18**: UI library for building interactive user interfaces.
- **TypeScript**: Static typing for JavaScript, improving code quality and maintainability.
- **Vite**: Fast development server and build tool.
- **Node.js/Express**: Backend server for auxiliary API endpoints (e.g., YouTube audio proxy).
- **Supabase**: Backend-as-a-Service for authentication and database.

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **Radix UI**: Accessible, unstyled UI primitives (used via @radix-ui/* packages).
- **Framer Motion**: Animation library for React.
- **Lucide React**: Icon library.
- **ShaderGradient**: For animated backgrounds.

### State & Forms
- **React Hook Form**: Form state management.
- **Zod**: Schema validation.
- **React Router DOM**: Routing and navigation.
- **React Context**: Theming and global state.

### Data & Parsing
- **PapaParse**: CSV parsing.
- **pdf-parse, pdfjs-dist, react-pdf**: PDF parsing and rendering.
- **ytdl-core, youtube-captions-scraper**: YouTube audio/captions extraction.
- **AssemblyAI**: AI-powered transcription (used in admin tools).

### Dev & Build Tools
- **ESLint**: Linting and code quality.
- **TypeScript ESLint**: TypeScript linting.
- **Concurrently**: Run Vite and Express together in dev.
- **PostCSS, TailwindCSS Animate**: CSS tooling.

---

## Architecture & Infrastructure

- **Frontend**: SPA built with React, TypeScript, and Vite. Uses a modular, component-driven structure. State is managed via hooks and context. The UI is styled with Tailwind CSS and Radix UI primitives for accessibility.
- **Backend**: Lightweight Express server (see `server.js`) for proxying YouTube audio (needed for AI tools). All main data and authentication are handled by Supabase.
- **Supabase**: Used for user authentication, session management, and as a backend database (PostgreSQL).
- **Routing**: Client-side routing with React Router DOM. Admin and student dashboards are separated by role.
- **Theming**: ThemeContext provides light/dark/system theming, persisted in localStorage.
- **Testing/Practice**: Exam/practice flows are managed by stateful React components, with timer, palette, and result analytics.

---

## How the Project Works

1. **Landing & Auth**: Users land on a visually rich landing page (`LandingPage.tsx`). Authentication is handled via Supabase (email/password, phone/OTP, Google, etc.).
2. **Role-based Dashboards**: After login, users are routed to either the Student or Admin dashboard based on their role.
3. **Student Dashboard**: Students can:
   - Browse streams (e.g., NEET), subjects, and papers.
   - Attempt practice tests, view results, and manage their profile.
   - Access notebooks and study materials.
   - Use a palette for question navigation and a timer for exams.
4. **Admin Dashboard**: Admins can:
   - Manage streams, subjects, chapters, and papers.
   - Bulk import questions (CSV/JSON), manage users, and view analytics.
   - Use AI tools for transcript/caption extraction and question generation.
   - Configure platform and exam settings.
5. **AI Tools**: Admins can extract YouTube audio, transcribe it (AssemblyAI), and generate questions from transcripts.
6. **Data Model**: All entities (User, Stream, Subject, Paper, Question, Result, etc.) are defined in `src/types/index.ts` and used throughout the app.

---

## Detailed File/Folder Explanations

### Top-Level Files
- **index.html**: Main HTML entry point.
- **package.json**: Project dependencies and scripts.
- **vite.config.ts**: Vite configuration, including path aliases.
- **server.js**: Express server for YouTube audio proxy.
- **tailwind.config.js, postcss.config.js**: Tailwind and PostCSS configuration.
- **tsconfig.json, tsconfig.app.json, tsconfig.node.json**: TypeScript configuration.
- **components.json**: (If present) likely used for component documentation or tooling.

### `src/` Directory
- **App.tsx**: Main application logic, routing, and session management.
- **main.tsx**: Entry point, renders the app and sets up React Router.
- **contexts/ThemeContext.tsx**: Provides theming (light/dark/system) via React Context.
- **hooks/**: Custom React hooks (e.g., `useLocalStorage`, `useExamTimer`, `use-toast`).
- **lib/**: Utility libraries (e.g., `supabaseClient.ts` for Supabase integration, `utils.ts` for class merging, etc.).
- **types/**: TypeScript interfaces and types for all major entities (User, Stream, Paper, etc.).
- **utils/constants.ts**: Sample data and configuration constants.

#### `src/components/`
- **admin/**: All admin dashboard features (Streams, Papers, Questions, Bulk Import, AI Tools, Analytics, Settings, Users, Notebooks).
- **student/**: Student dashboard features (Exam interface, Results, Profile, Practice, Notebooks).
- **landing/**: Landing page and marketing UI.
- **layout/**: Shared layout components (Header, Sidebar).
- **shared/**: Reusable UI elements (Loader, EmptyState, ThemeToggle, etc.).
- **ui/**: Design system components, mostly built on Radix UI primitives (Accordion, Dialog, Button, Table, etc.).
- **placeholders/**: Placeholder components for dashboard sections.
- **test/**: Test/practice mode switcher and related logic.

---

## Current Implementation Details

- **Authentication**: Supabase handles all user authentication and session management. The app supports email/password, phone/OTP, and Google login.
- **Admin Tools**: Admins can manage all content (streams, subjects, papers, questions), import/export data, and use AI tools for content generation.
- **Student Experience**: Students can browse, attempt, and review practice tests, view analytics, and manage their profile.
- **AI Integration**: Admins can extract audio from YouTube, transcribe it, and generate questions using AssemblyAI and custom logic.
- **PDF/CSV Support**: Bulk import/export of questions and papers is supported via CSV and PDF parsing.
- **Analytics**: Rich analytics dashboards for both students and admins, including charts and performance metrics.
- **Theming**: Full support for light/dark/system themes, persisted in localStorage.
- **Component-Driven**: All UI is built from reusable, accessible components, with a focus on maintainability and scalability.

---

## Usage

### Development
```sh
npm install
npm run dev
```
This runs both the Vite dev server and the Express backend concurrently.

### Build
```sh
npm run build
```

### Lint
```sh
npm run lint
```

---

## Credits
- Built with [React](https://react.dev/), [Vite](https://vitejs.dev/), [Supabase](https://supabase.com/), [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), and more.

---

## For full details on each file and function, see the inline comments in the codebase and the [tree.md](tree.md) file for the complete structure.
