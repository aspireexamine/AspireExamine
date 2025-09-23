'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  FileText,
  Image,
  FileIcon,
  Trash2,
  Eye,
  Download,
  Calendar,
  FolderOpen
} from 'lucide-react';
import { FilePreviewModal } from './FilePreviewModal';

interface FileRef {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: number;
  blobId?: string;
  thumbUrl?: string;
  textSnippet?: string;
  originalData?: any; // For our chat file data
}

interface FilesPanelProps {
  files: FileRef[];
  onFileRemove: (fileId: string) => void;
  onFileSelect?: (fileId: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function FilesPanel({ files, onFileRemove, isOpen = false, onClose }: FilesPanelProps) {
  const [fileContents, setFileContents] = useState<{ [key: string]: string }>({});
  const [previewFile, setPreviewFile] = useState<FileRef | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const loadFileContents = async () => {
      const contents: { [key: string]: string } = {};
      
      for (const file of files) {
        if (file.thumbUrl) {
          contents[file.id] = file.thumbUrl;
        } else if (file.originalData) {
          // Handle our chat file data
          if (file.originalData.type === 'image' && file.originalData.data) {
            contents[file.id] = file.originalData.data;
          } else if (file.originalData.type === 'text' && file.originalData.content) {
            contents[file.id] = file.originalData.content;
          } else if (file.originalData.type === 'pdf' && file.originalData.content) {
            contents[file.id] = file.originalData.content;
          }
        } else if (file.blobId) {
          // For now, we'll just use the text snippet if available
          // In a real implementation, you'd load the blob from your storage system
          if (file.textSnippet) {
            contents[file.id] = file.textSnippet;
          }
        }
      }
      
      setFileContents(contents);
    };

    if (files.length > 0) {
      loadFileContents();
    }
  }, [files]);

  const downloadFile = async (file: FileRef) => {
    try {
      if (file.originalData) {
        // Handle our chat file data
        if (file.originalData.type === 'image' && file.originalData.data) {
          // Download image
          const link = document.createElement('a');
          link.href = file.originalData.data;
          link.download = file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (file.originalData.type === 'text' && file.originalData.content) {
          // Download text file
          const blob = new Blob([file.originalData.content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else if (file.originalData.type === 'pdf' && file.originalData.content) {
          // Download PDF content as text file (since we extracted text)
          const blob = new Blob([file.originalData.content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = file.name.replace('.pdf', '_extracted.txt');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else if (file.originalData.type === 'binary' && file.originalData.data) {
          // Download binary file
          const link = document.createElement('a');
          link.href = file.originalData.data;
          link.download = file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        // Fallback for other file types
        console.log('Download file:', file.name);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleViewFile = (file: FileRef) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewFile(null);
  };

  const getFileIcon = (file: FileRef) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    if (file.type.startsWith('text/')) {
      return <FileText className="h-4 w-4" />;
    }
    return <FileIcon className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays < 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const truncateFilename = (filename: string, maxLength: number = 30) => {
    if (filename.length <= maxLength) return filename;
    const extension = filename.split('.').pop();
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, maxLength - 3 - (extension?.length || 0));
    return `${truncatedName}...${extension ? '.' + extension : ''}`;
  };

  const groupedFiles = files.reduce((acc, file) => {
    const dateKey = formatDate(file.createdAt);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(file);
    return acc;
  }, {} as Record<string, FileRef[]>);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Files
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar mt-6">
          {files.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <FileIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No files attached</p>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {Object.entries(groupedFiles).map(([date, dateFiles]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium text-muted-foreground">
                      {date}
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {dateFiles.map((file) => (
                      <div
                        key={file.id}
                        className="group border rounded-lg p-3 hover:bg-muted/30 transition-colors"
                      >
                        {file.type.startsWith('image/') && fileContents[file.id] && (
                          <div className="mb-2">
                            <img
                              src={fileContents[file.id]}
                              alt={file.name}
                              className="w-full h-32 object-cover rounded"
                            />
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getFileIcon(file)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate" title={file.name}>
                              {truncateFilename(file.name, 35)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                            {file.textSnippet && (
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {file.textSnippet}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewFile(file);
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadFile(file);
                              }}
                            >
                              <Download className="h-3 w-3" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                onFileRemove(file.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
      
      <FilePreviewModal
        file={previewFile}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        onDownload={downloadFile}
      />
    </Sheet>
  );
}
