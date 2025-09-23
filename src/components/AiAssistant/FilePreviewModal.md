# File Preview Modal

## Overview
The FilePreviewModal component provides a canvas pop-up interface for previewing files in the chat interface. When users click the "View" button on any file in the FilesPanel, the file opens in a modal overlay with rounded corners.

## Features

### Supported File Types
- **Text Files / Documents**: Display content with proper formatting
- **PDF Files**: Show extracted text content (with PDF.js integration ready)
- **Code Files**: Display with syntax highlighting using react-syntax-highlighter
  - JavaScript/TypeScript (.js, .ts, .jsx, .tsx)
  - Python (.py)
  - Java (.java)
  - C/C++ (.c, .cpp, .h)
  - CSS (.css)
  - HTML (.html)
  - JSON (.json)
  - XML (.xml)
  - YAML (.yaml, .yml)
  - SQL (.sql)
  - Shell scripts (.sh, .bash)
  - Markdown (.md)
  - And many more programming languages
- **Images**: Display fully fitted inside the canvas container
- **Binary Files**: Any other file type supported with download functionality

### File Type Detection
The component automatically detects file types based on:
- MIME type (`file.type`)
- File extension for code files (`.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.java`, etc.)

### Modal Design
- **Canvas-style pop-up** with rounded corners (`rounded-xl`)
- **Modal overlay** that doesn't navigate away from the current page
- **Responsive design** that works on desktop and mobile
- **File metadata display** (name, type, size)
- **Download functionality** integrated into the modal header

## Usage

### Integration with FilesPanel
The FilePreviewModal is automatically integrated with the FilesPanel component:

```tsx
<FilesPanel
  files={files}
  onFileRemove={handleFileRemove}
  isOpen={isFilesOpen}
  onClose={() => setIsFilesOpen(false)}
/>
```

### File Data Structure
The modal expects files with the following structure:

```typescript
interface FileRef {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: number;
  blobId?: string;
  thumbUrl?: string;
  textSnippet?: string;
  originalData?: any;
}
```

## Dependencies

### Required Packages
- `react-pdf`: For PDF viewing capabilities
- `react-syntax-highlighter`: For code syntax highlighting
- `pdfjs-dist`: For PDF.js worker setup

### UI Components
- `@/components/ui/dialog`: For modal functionality
- `@/components/ui/button`: For action buttons
- `@/components/ui/scroll-area`: For scrollable content
- `@/components/ui/badge`: For file type badges

## File Type Handlers

### Image Files
- Displays images with `object-contain` for proper fitting
- Maximum dimensions: `max-w-full max-h-[70vh]`
- Rounded corners and shadow for visual appeal

### Code Files
- Syntax highlighting with VS Code Dark Plus theme
- Line numbers enabled
- Language detection based on file extension
- Monospace font for better readability

### PDF Files
- Shows extracted text content in a scrollable area
- Ready for PDF.js integration for actual PDF rendering
- Fallback to text display for now

### Text/Document Files
- Plain text display with `whitespace-pre-wrap`
- Monospace font for consistent formatting
- Scrollable content area

## Styling

### Modal Container
- Maximum width: `max-w-4xl`
- Maximum height: `max-h-[90vh]`
- Rounded corners: `rounded-xl`
- Overflow hidden for clean edges

### Header
- File icon and metadata display
- Download and close buttons
- File type badge with secondary styling

### Content Area
- Responsive height: `h-[70vh]` for most content types
- Proper scrolling with custom scrollbar
- Consistent padding and spacing

## Error Handling
- Loading states with spinner animation
- Error states with appropriate messaging
- Graceful fallbacks for unsupported file types

## Future Enhancements
- Full PDF.js integration for actual PDF rendering
- Support for more file types (Excel, Word, etc.)
- Zoom functionality for images
- Print functionality
- Full-screen mode
