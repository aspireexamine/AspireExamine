// Utility function to detect and extract code blocks from text
export function extractCodeBlocks(text: string): Array<{ type: 'text' | 'code', content: string, language?: string }> {
  const blocks: Array<{ type: 'text' | 'code', content: string, language?: string }> = [];
  
  // Clean up the text first - handle cases where markdown is mixed with content
  let cleanedText = text
    .replace(/([a-zA-Z])\s*(```\w*)/g, '$1\n\n$2') // Add line break before code blocks
    .replace(/(```\w*)\s*([a-zA-Z])/g, '$1\n$2') // Add line break after code blocks
    .replace(/(\*\*[^*]+\*\*)\s*(```\w*)/g, '$1\n\n$2') // Add line break after bold before code
    .replace(/([.!?])\s*(```\w*)/g, '$1\n\n$2') // Add line break after sentences before code
    .replace(/(\*\*[^*]+\*\*)\s*(=+)/g, '$1\n\n---\n\n') // Replace equals with horizontal rule
    .replace(/(=+)\s*([A-Z])/g, '---\n\n$2') // Replace equals before text with horizontal rule
    // Fix code formatting issues
    .replace(/(import\s+[^;]+;)\s*(import)/g, '$1\n$2') // Fix import statements
    .replace(/([;}])\s*(import|public|private|class)/g, '$1\n\n$2') // Add breaks before major declarations
    .replace(/(public\s+class\s+\w+)\s*{/g, '$1 {\n') // Fix class declaration
    .replace(/(public\s+static\s+void\s+main[^{]+)\s*{/g, '$1 {\n') // Fix main method
    .replace(/(while\s*\([^)]+\))\s*{/g, '$1 {\n') // Fix while loops
    .replace(/(for\s*\([^)]+\))\s*{/g, '$1 {\n') // Fix for loops
    .replace(/(if\s*\([^)]+\))\s*{/g, '$1 {\n') // Fix if statements
    .replace(/(else\s*if\s*\([^)]+\))\s*{/g, '$1 {\n') // Fix else if statements
    .replace(/(else)\s*{/g, '$1 {\n') // Fix else statements
    // Ensure markdown formatting is preserved
    .replace(/(\*\*[^*]+\*\*)/g, '$1') // Preserve bold markdown
    .replace(/(\*[^*]+\*)/g, '$1') // Preserve italic markdown
    .replace(/(`[^`]+`)/g, '$1'); // Preserve inline code markdown
  
  // First, try to find markdown code blocks (including inline ones)
  const markdownCodeRegex = /```(\w+)?\s*([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  
  while ((match = markdownCodeRegex.exec(cleanedText)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const textContent = cleanedText.slice(lastIndex, match.index).trim();
      if (textContent) {
        blocks.push({ type: 'text', content: textContent });
      }
    }
    
    // Add code block
    const language = match[1] || 'text';
    const code = match[2].trim();
    blocks.push({ type: 'code', content: code, language });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < cleanedText.length) {
    const remainingText = cleanedText.slice(lastIndex).trim();
    if (remainingText) {
      blocks.push({ type: 'text', content: remainingText });
    }
  }
  
  // If no markdown code blocks found, try to detect code patterns
  if (blocks.length === 0 || (blocks.length === 1 && blocks[0].type === 'text')) {
    // Normalize the text by adding line breaks where needed
    const normalizedText = cleanedText
      .replace(/([.!?])\s*([A-Z])/g, '$1\n\n$2') // Add breaks after sentences
      .replace(/(\w)\s*(\*\*)/g, '$1\n$2') // Add break before markdown bold
      .replace(/(\*\*[^*]+\*\*)\s*([A-Z])/g, '$1\n\n$2') // Add break after bold text
      .replace(/(\*\*[^*]+\*\*)\s*(=+)/g, '$1\n$2') // Add break after bold text before equals
      .replace(/(=+)\s*([A-Z])/g, '$1\n\n$2') // Add break after equals before text
      .replace(/([a-z])\s*(import\s+\w+|def\s+\w+|class\s+\w+|public\s+class|private\s+|public\s+static)/gi, '$1\n\n$2') // Add break before code
      .replace(/([.!?])\s*(import\s+\w+|def\s+\w+|class\s+\w+|public\s+class|private\s+|public\s+static)/gi, '$1\n\n$2') // Add break before code after sentences
      .replace(/(\*\*[^*]+\*\*)\s*(import\s+\w+|def\s+\w+|class\s+\w+|public\s+class|private\s+|public\s+static)/gi, '$1\n\n$2') // Add break after bold before code
      .replace(/([a-zA-Z])\s*(```\w*)/g, '$1\n\n$2') // Add break before code block markers
      .replace(/(```\w*)\s*([a-zA-Z])/g, '$1\n$2'); // Add break after code block markers
    
    const lines = normalizedText.split('\n');
    
    // Look for code patterns in the normalized text
    const codePatterns = [
      // Java patterns - check first since Java imports can be confused with Python
      { pattern: /^(import\s+java\.|public\s+class|private\s+|public\s+static|System\.out\.print|Scanner\s+\w+\s*=|String\[\]\s+args)/i, language: 'java' },
      // Python patterns
      { pattern: /^(import\s+\w+|def\s+\w+|class\s+\w+|if\s+__name__\s*==\s*["']__main__["']|while\s+True:|for\s+\w+\s+in\s+|print\s*\(|input\s*\()/i, language: 'python' },
      // JavaScript patterns
      { pattern: /^(function\s+\w+|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=|console\.log)/i, language: 'javascript' },
      // HTML patterns
      { pattern: /^(<html|<head|<body|<div|<p|<h[1-6])/i, language: 'html' },
      // CSS patterns
      { pattern: /^(\.[\w-]+\s*\{|#[\w-]+\s*\{|@media\s)/i, language: 'css' },
    ];
    
    let codeStartIndex = -1;
    let detectedLanguage = 'text';
    
    // Find where code starts
    for (let i = 0; i < lines.length; i++) {
      for (const { pattern, language } of codePatterns) {
        if (pattern.test(lines[i].trim())) {
          codeStartIndex = i;
          detectedLanguage = language;
          break;
        }
      }
      if (codeStartIndex !== -1) break;
    }
    
    if (codeStartIndex !== -1) {
      // Split into description and code parts
      const description = lines.slice(0, codeStartIndex).join('\n').trim();
      const code = lines.slice(codeStartIndex).join('\n').trim();
      
      // Clear existing blocks and add new ones
      blocks.length = 0;
      
      console.log('Detected language:', detectedLanguage, 'Code preview:', code.substring(0, 100));
      
      if (description) {
        blocks.push({ type: 'text', content: description });
      }
      if (code) {
        blocks.push({ type: 'code', content: code, language: detectedLanguage });
      }
    }
  }
  
  // If still no blocks, return the original text
  if (blocks.length === 0) {
    blocks.push({ type: 'text', content: text });
  }
  
  return blocks;
}
