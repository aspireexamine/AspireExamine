'use client';

import { useState, useEffect } from 'react';
import { FileText, Image, FileIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface FileRef {
  id?: string;
  name: string;
  type: string;
  size?: number;
  createdAt?: number;
  blobId?: string;
  thumbUrl?: string;
  textSnippet?: string;
  data?: string; // For base64 data
  content?: string; // For text content
  mimeType?: string; // For MIME type
}

interface MessageAttachmentsProps {
  files: FileRef[];
}

export function MessageAttachments({ files }: MessageAttachmentsProps) {
  const [fileContents, setFileContents] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadFileContents = async () => {
      const contents: { [key: string]: string } = {};
      
      for (const file of files) {
        const fileId = file.id || file.name;
        if (file.thumbUrl) {
          contents[fileId] = file.thumbUrl;
        } else if (file.textSnippet) {
          contents[fileId] = file.textSnippet;
        } else if (file.data) {
          contents[fileId] = file.data;
        } else if (file.content) {
          contents[fileId] = file.content;
        }
      }
      
      setFileContents(contents);
    };

    if (files.length > 0) {
      loadFileContents();
    }
  }, [files]);

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

  const truncateFilename = (filename: string, maxLength: number = 20) => {
    if (filename.length <= maxLength) return filename;
    const extension = filename.split('.').pop();
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, maxLength - 3 - (extension?.length || 0));
    return `${truncatedName}...${extension ? '.' + extension : ''}`;
  };

  const FilePreview = ({ file }: { file: FileRef }) => {
    const fileId = file.id || file.name;
    const content = fileContents[fileId];

    if (file.type.startsWith('image/') && content) {
      return (
        <img
          src={content}
          alt={file.name}
          className="max-w-full max-h-96 rounded-lg"
        />
      );
    }

    if (file.type.startsWith('text/') && content) {
      return (
        <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96 whitespace-pre-wrap">
          {content}
        </pre>
      );
    }

    return (
      <div className="p-8 text-center text-muted-foreground">
        <FileIcon className="h-12 w-12 mx-auto mb-2" />
        <p>Preview not available</p>
        <p className="text-sm mt-2">{formatFileSize(file.size)}</p>
      </div>
    );
  };

  if (files.length === 0) return null;

  return (
    <div className="mb-2 flex flex-wrap gap-2 file-attachment-container">
      {files.map((file) => (
        <Dialog key={file.id}>
          <DialogTrigger asChild>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full border max-w-[200px] sm:max-w-[280px] cursor-pointer hover:bg-muted/75 transition-colors"
              title={file.name} // Show full filename on hover
            >
              <div className="flex-shrink-0 text-muted-foreground">
                {getFileIcon(file)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium file-attachment-name">
                  <span className="sm:hidden">{truncateFilename(file.name, 15)}</span>
                  <span className="hidden sm:inline">{truncateFilename(file.name, 25)}</span>
                </p>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="break-all">{file.name}</DialogTitle>
            </DialogHeader>
            <FilePreview file={file} />
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
