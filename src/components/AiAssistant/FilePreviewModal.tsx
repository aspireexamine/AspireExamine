'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  Image as ImageIcon, 
  FileIcon,
  Code,
  FileType
} from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

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

interface FilePreviewModalProps {
  file: FileRef | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (file: FileRef) => void;
}

export function FilePreviewModal({ file, isOpen, onClose, onDownload }: FilePreviewModalProps) {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    if (file && isOpen) {
      loadFileContent();
    }
  }, [file, isOpen]);

  const loadFileContent = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      if (file.originalData) {
        // Handle our chat file data
        if (file.originalData.type === 'image' && file.originalData.data) {
          setFileContent(file.originalData.data);
        } else if (file.originalData.type === 'text' && file.originalData.content) {
          setFileContent(file.originalData.content);
        } else if (file.originalData.type === 'pdf' && file.originalData.content) {
          setFileContent(file.originalData.content);
        } else if (file.originalData.type === 'binary' && file.originalData.content) {
          setFileContent(file.originalData.content);
        }
      } else if (file.thumbUrl) {
        setFileContent(file.thumbUrl);
      } else if (file.textSnippet) {
        setFileContent(file.textSnippet);
      } else {
        setError('File content not available');
      }
    } catch (err) {
      setError('Failed to load file content');
      console.error('Error loading file content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getFileType = (file: FileRef) => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('text/')) return 'text';
    if (file.type === 'application/pdf') return 'pdf';
    
    // Check for code files by MIME type
    const codeMimeTypes = [
      'application/javascript',
      'application/typescript',
      'text/x-python',
      'text/x-java-source',
      'text/x-c++',
      'text/x-c',
      'text/css',
      'text/html',
      'application/xml',
      'application/x-yaml',
      'application/sql',
      'application/x-sh',
      'text/markdown'
    ];
    
    if (codeMimeTypes.includes(file.type)) return 'code';
    
    // Check for code files by extension
    if (file.name.match(/\.(js|ts|jsx|tsx|py|java|cpp|c|css|html|json|xml|yaml|yml|md|sql|sh|bash)$/i)) {
      return 'code';
    }
    
    return 'document';
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <ImageIcon className="h-5 w-5" />;
      case 'code':
        return <Code className="h-5 w-5" />;
      case 'pdf':
        return <FileType className="h-5 w-5" />;
      case 'text':
        return <FileText className="h-5 w-5" />;
      default:
        return <FileIcon className="h-5 w-5" />;
    }
  };

  const getLanguageFromFileName = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'jsx',
      'ts': 'typescript',
      'tsx': 'tsx',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'bash',
      'bash': 'bash'
    };
    return languageMap[extension || ''] || 'text';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderFileContent = () => {
    if (!file || !fileContent) return null;

    const fileType = getFileType(file);

    switch (fileType) {
      case 'image':
        return (
          <div className="flex items-center justify-center p-4">
            <img
              src={fileContent}
              alt={file.name}
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
            />
          </div>
        );

      case 'pdf':
        // For PDF files, we'll show the extracted text content
        // In a real implementation, you might want to use react-pdf to show the actual PDF
        return (
          <div className="p-4">
            <div className="bg-muted/30 rounded-lg p-4 mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                PDF content (extracted text):
              </p>
              <ScrollArea className="h-[60vh]">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {fileContent}
                </pre>
              </ScrollArea>
            </div>
          </div>
        );

      case 'code':
        return (
          <div className="p-4">
            <ScrollArea className="h-[70vh]">
              <SyntaxHighlighter
                language={getLanguageFromFileName(file.name)}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
                showLineNumbers
                wrapLines
              >
                {fileContent}
              </SyntaxHighlighter>
            </ScrollArea>
          </div>
        );

      case 'text':
      case 'document':
      default:
        return (
          <div className="p-4">
            <ScrollArea className="h-[70vh]">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {fileContent}
              </pre>
            </ScrollArea>
          </div>
        );
    }
  };

  if (!file) return null;

  const fileType = getFileType(file);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 rounded-xl overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(fileType)}
              <div>
                <DialogTitle className="text-lg font-semibold truncate max-w-md">
                  {file.name}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {fileType.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onDownload && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(file)}
                  className="h-8"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading file...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <FileIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          ) : (
            renderFileContent()
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
