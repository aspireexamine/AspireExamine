import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';


interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language = 'text', className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  // Detect if we're in dark mode
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Ensure we have valid code content and preserve formatting
  const cleanCode = code?.trim() || '';
  
  // If no code content, don't render the block
  if (!cleanCode || !isMounted) {
    return null;
  }

  // Format the code to ensure proper line breaks and spacing
  const formattedCode = cleanCode
    // Add line breaks after semicolons and braces
    .replace(/([;}])\s*([a-zA-Z])/g, '$1\n$2')
    // Add line breaks between import statements
    .replace(/(import\s+[^;]+;)\s*(import)/g, '$1\n$2')
    // Add line breaks before major declarations
    .replace(/([;}])\s*(public|private|class|interface|enum)/g, '$1\n\n$2')
    // Add line breaks after import statements before class
    .replace(/(import\s+[^;]+;)\s*(public\s+class)/g, '$1\n\n$2')
    // Fix class declaration formatting
    .replace(/(public\s+class\s+\w+)\s*{/g, '$1 {\n')
    // Fix main method formatting
    .replace(/(public\s+static\s+void\s+main[^{]+)\s*{/g, '$1 {\n')
    // Fix loop and conditional formatting
    .replace(/(while\s*\([^)]+\))\s*{/g, '$1 {\n')
    .replace(/(for\s*\([^)]+\))\s*{/g, '$1 {\n')
    .replace(/(if\s*\([^)]+\))\s*{/g, '$1 {\n')
    .replace(/(else\s*if\s*\([^)]+\))\s*{/g, '$1 {\n')
    .replace(/(else)\s*{/g, '$1 {\n')
    // Add proper indentation
    .split('\n')
    .map((line, index, lines) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return '';
      
      // Calculate indentation based on braces
      let indentLevel = 0;
      for (let i = 0; i < index; i++) {
        const prevLine = lines[i];
        if (prevLine.includes('{')) indentLevel++;
        if (prevLine.includes('}')) indentLevel--;
      }
      
      // Apply indentation
      const indent = '  '.repeat(Math.max(0, indentLevel));
      return indent + trimmedLine;
    })
    .join('\n');

  // Clean up language name
  const cleanLanguage = language === 'javaimport' ? 'java' : language;

  return (
    <div className={cn(
      "code-block-wrapper relative my-4 text-left rounded-xl overflow-hidden border w-full max-w-full",
      isDarkMode ? 'border-zinc-700 bg-[#0D1117]' : 'border-zinc-300 bg-[#f7f7f7]',
      className
    )}>
      {/* Header with language and copy button */}
      <div className={cn(
        "flex items-center justify-between px-4 py-1.5",
        isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'
      )}>
        <span className="text-xs font-sans uppercase">{cleanLanguage}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleCopy} 
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {/* Code content */}
       <div className="overflow-x-auto max-w-full">
         <SyntaxHighlighter
           language={cleanLanguage}
           style={isDarkMode ? vscDarkPlus : oneLight}
           customStyle={{
             padding: '0.75rem',
             margin: '0',
             backgroundColor: 'transparent',
             border: 'none',
             boxShadow: 'none',
             borderRadius: '0',
             whiteSpace: 'pre',
             overflow: 'visible',
             minWidth: 'max-content',
             lineHeight: '1.2',
             fontSize: '0.875rem',
           }}
           codeTagProps={{
             style: {
               backgroundColor: 'transparent',
               fontFamily: '"Source Code Pro", "Fira Code", monospace',
               fontSize: '0.875rem',
               whiteSpace: 'pre',
               overflow: 'visible',
               lineHeight: '1.2',
             }
           }}
           showLineNumbers={false}
           wrapLines={false}
           wrapLongLines={false}
         >
           {formattedCode}
         </SyntaxHighlighter>
       </div>
    </div>
  );
}

