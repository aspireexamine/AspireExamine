import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Youtube, 
  Upload, 
  FileText, 
  StickyNote, 
  FileSearch, 
  CreditCard, 
  Network, 
  HelpCircle,
  ArrowRight,
  Check,
  Image,
  Scan,
  X,
  Loader2,
  Brain
} from 'lucide-react';
import { 
  createGeneratedContentFromSmartStudyHub,
  saveGeneratedContent,
  createLibraryItemFromGeneratedContent,
  saveLibraryItem
} from '@/lib/libraryStorage';
import { 
  GeneratedContentType, 
  GeneratedContentData,
  User,
  InputMethod
} from '@/types';
import { aiChatService } from '@/services/aiChatService';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface SmartStudyHubProps {
  className?: string;
  user?: User;
  onContentGenerated?: () => void;
}

type OutputType = 'notes' | 'summary' | 'flashcards' | 'mindmap' | 'questions';
type Difficulty = 'easy' | 'medium' | 'hard';

export function SmartStudyHub({ className, user, onContentGenerated }: SmartStudyHubProps) {
  const [inputMethod, setInputMethod] = useState<InputMethod | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [textInput, setTextInput] = useState('');
  const [selectedOutputs, setSelectedOutputs] = useState<OutputType[]>([]);
  const [questionCount, setQuestionCount] = useState([5]);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedImageName, setSelectedImageName] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [activeModal, setActiveModal] = useState<InputMethod | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState<'idle' | 'extracting' | 'sending' | 'generating' | 'preparing' | 'done'>('idle');
  const [transcript, setTranscript] = useState<{ name: string; content: string; source: 'youtube' | 'pdf' | 'text' } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  // Helper function to get YouTube video ID
  const getYouTubeVideoId = (url: string) => {
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get('v');
  };

  // Helper function to extract text from PDF
  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      // Try Supabase Edge Function first
      const form = new FormData();
      form.append('file', file);
      const fnUrl = `${import.meta.env.VITE_SUPABASE_URL?.replace('/project', '')}/functions/v1/extract-pdf`;
      const resp = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: form,
      });
      if (resp.ok) {
        const json = await resp.json();
        return json.text || '';
      } else {
        throw new Error('edge-fn-failed');
      }
    } catch {
      // Fallback to local pdfjs
      try {
        const dataBuffer = await file.arrayBuffer();
        const pdf = await (pdfjsLib as any).getDocument(dataBuffer).promise;
        let textContent = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          textContent += text.items.map((item: any) => ('str' in item ? item.str : '')).join(' ');
          textContent += '\n';
        }
        return textContent;
      } catch (error) {
        throw new Error('Failed to parse PDF file.');
      }
    }
  };

  // Helper function to get YouTube transcript
  const getYouTubeTranscript = async (url: string): Promise<string> => {
    const errors: string[] = [];
    
    // 1) Try Python transcript service first (yt-dlp based)
    try {
      const pyUrl = import.meta.env.VITE_PY_TRANSCRIPT_URL as string | undefined;
      console.log('Python transcript URL:', pyUrl);
      if (pyUrl) {
        // First, try to check if the service is running
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          const healthCheck = await fetch(`${pyUrl.replace(/\/$/, '')}/health`, {
            method: 'GET',
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          console.log('Python service health check:', healthCheck.status);
        } catch (healthError) {
          console.log('Python service health check failed:', healthError);
        }

        console.log('Trying Python transcript service at:', `${pyUrl.replace(/\/$/, '')}/youtube-transcript`);
        const r = await fetch(`${pyUrl.replace(/\/$/, '')}/youtube-transcript`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        console.log('Python service response status:', r.status);
        if (r.ok) {
          const json = await r.json();
          console.log('Python service response:', json);
          if (json.text && json.text.trim()) {
            console.log('Successfully got transcript from Python service');
            return json.text;
          } else {
            errors.push('Python service returned empty transcript');
          }
        } else {
          const errorText = await r.text();
          console.error('Python service error:', errorText);
          errors.push(`Python service: ${r.status} - ${errorText}`);
        }
      } else {
        console.log('Python service URL not configured in environment variables');
        errors.push('Python service URL not configured');
      }
    } catch (error) {
      console.error('Python service exception:', error);
      errors.push(`Python service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 2) Try Supabase Edge Function as secondary
    try {
      console.log('Trying Supabase Edge Function...');
      const ytFnUrl = `${import.meta.env.VITE_SUPABASE_URL?.replace('/project', '')}/functions/v1/youtube-transcript`;
      const resp = await fetch(ytFnUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json.text && json.text.trim()) {
          console.log('Successfully got transcript from Supabase function');
          return json.text;
        }
      } else {
        const errorText = await resp.text();
        errors.push(`Supabase function: ${resp.status} - ${errorText}`);
      }
    } catch (error) {
      errors.push(`Supabase function: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 3) Try direct yt-dlp approach (if Python service is available but failed)
    try {
      console.log('Trying direct yt-dlp approach...');
      const pyUrl = import.meta.env.VITE_PY_TRANSCRIPT_URL as string | undefined;
      if (pyUrl) {
        // Try a different endpoint or method
        const r = await fetch(`${pyUrl.replace(/\/$/, '')}/transcript`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ youtube_url: url })
        });
        if (r.ok) {
          const json = await r.json();
          if (json.transcript && json.transcript.trim()) {
            console.log('Successfully got transcript from direct yt-dlp');
            return json.transcript;
          }
        }
      }
    } catch (error) {
      errors.push(`Direct yt-dlp: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 4) Fallback to AssemblyAI via local helper (only if local server is available)
    try {
      console.log('Trying AssemblyAI fallback...');
      const proxyResponse = await fetch('http://localhost:3001/api/get-audio-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl: url }),
      });

      if (proxyResponse.ok) {
        const { audioUrl } = await proxyResponse.json();
        const response = await fetch('https://api.assemblyai.com/v2/transcript', {
          method: 'POST',
          headers: {
            'Authorization': 'cfbb8869df1a442cbb1f318dc3769eb0',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ audio: audioUrl, speech_model: 'universal' })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.status === 'completed' && result.text) {
            console.log('Successfully got transcript from AssemblyAI');
            return result.text;
          }
        }
      }
    } catch (error) {
      errors.push(`AssemblyAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // If all methods fail, provide a helpful error message
    const errorMessage = `All transcript methods failed. Errors: ${errors.join('; ')}`;
    console.error('YouTube transcript extraction failed:', errorMessage);
    throw new Error(errorMessage);
  };

  const hasValidInput = () => {
    if (inputMethod === 'youtube') return youtubeUrl.trim() !== '';
    if (inputMethod === 'text') return textInput.trim() !== '';
    if (inputMethod === 'file') return selectedFile !== null;
    if (inputMethod === 'image') return selectedImage !== null;
    if (inputMethod === 'scan') return selectedImage !== null; // Scan uses selectedImage
    return false;
  };

  const canGenerate = () => {
    return hasValidInput() && selectedOutputs.length > 0;
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setInputMethod('file');
      setSelectedFileName(file.name);
      setSelectedFile(file);
      setActiveModal(null);
    }
  };

  const handleImageUpload = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setInputMethod('image');
      setSelectedImageName(file.name);
      setSelectedImage(file);
      setActiveModal(null);
    }
  };

  const handleScanDocument = async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // Create a video element to show camera feed
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      
      // Create a modal-like overlay for camera interface
      const cameraOverlay = document.createElement('div');
      cameraOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: black;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      `;
      
      // Create camera container
      const cameraContainer = document.createElement('div');
      cameraContainer.style.cssText = `
        position: relative;
        width: 90%;
        max-width: 500px;
        aspect-ratio: 4/3;
        background: white;
        border-radius: 12px;
        overflow: hidden;
      `;
      
      // Style the video element
      video.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
      `;
      
      // Create controls
      const controls = document.createElement('div');
      controls.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 20px;
        align-items: center;
      `;
      
      // Capture button
      const captureBtn = document.createElement('button');
      captureBtn.innerHTML = '📷';
      captureBtn.style.cssText = `
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 4px solid white;
        background: #3b82f6;
        color: white;
        font-size: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      
      // Close button
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '✕';
      closeBtn.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid white;
        background: rgba(0,0,0,0.5);
        color: white;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      
      // Add event listeners
      captureBtn.addEventListener('click', () => {
        // Create canvas to capture image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0);
        
        // Convert to blob and simulate file selection
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'scanned-document.jpg', { type: 'image/jpeg' });
            setInputMethod('image');
            setSelectedImageName('scanned-document.jpg');
            setSelectedImage(file);
            
            // Stop camera and remove overlay
            stream.getTracks().forEach(track => track.stop());
            document.body.removeChild(cameraOverlay);
          }
        }, 'image/jpeg', 0.8);
      });
      
      closeBtn.addEventListener('click', () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(cameraOverlay);
      });
      
      // Assemble the camera interface
      controls.appendChild(closeBtn);
      controls.appendChild(captureBtn);
      cameraContainer.appendChild(video);
      cameraContainer.appendChild(controls);
      cameraOverlay.appendChild(cameraContainer);
      document.body.appendChild(cameraOverlay);
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions and try again.');
    }
  };

  const handleOutputToggle = (output: OutputType) => {
    setSelectedOutputs(prev => 
      prev.includes(output) 
        ? prev.filter(o => o !== output)
        : [...prev, output]
    );
  };

  const handleGenerate = async () => {
    if (!canGenerate() || !user) return;
    
    setIsGenerating(true);
    setProcessingStage('extracting');
    setProcessingProgress(5);
    
    try {
      let sourceContent = '';
      let sourceName = '';
      
      // Extract content based on input method
      if (inputMethod === 'youtube') {
        setProcessingProgress(10);
        toast.info('Fetching YouTube transcript...');
        try {
          sourceContent = await getYouTubeTranscript(youtubeUrl);
          const videoId = getYouTubeVideoId(youtubeUrl) || 'video';
          sourceName = `YouTube: ${videoId}`;
          setTranscript({ name: `${videoId}_transcript.txt`, content: sourceContent, source: 'youtube' });
          setProcessingProgress(30);
        } catch (error) {
          console.error('YouTube transcript failed:', error);
          toast.error('Failed to get YouTube transcript automatically. Please try a different video or check if the video has captions.');
          
          // Show a dialog to allow manual transcript input
          const manualTranscript = prompt(
            'Automatic transcript extraction failed. This could be because:\n\n' +
            '• The YouTube video doesn\'t have captions\n' +
            '• The transcript service is not running\n' +
            '• Network connectivity issues\n\n' +
            'You can:\n' +
            '1. Try a different YouTube video with captions\n' +
            '2. Manually paste the transcript text below\n' +
            '3. Cancel to try a different input method\n\n' +
            'If you want to paste transcript manually, enter it below:'
          );
          
          if (manualTranscript && manualTranscript.trim()) {
            sourceContent = manualTranscript.trim();
            const videoId = getYouTubeVideoId(youtubeUrl) || 'video';
            sourceName = `YouTube: ${videoId} (Manual)`;
            setTranscript({ name: `${videoId}_transcript_manual.txt`, content: sourceContent, source: 'youtube' });
            setProcessingProgress(30);
            toast.success('Using manually entered transcript');
          } else {
            throw new Error('No transcript available. Please try a different video or input method.');
          }
        }
      } else if (inputMethod === 'file' && selectedFile) {
        setProcessingProgress(10);
        toast.info('Extracting text from document...');
        sourceContent = await extractTextFromPDF(selectedFile);
        sourceName = selectedFile.name;
        setTranscript({ name: selectedFile.name, content: sourceContent, source: 'pdf' });
        setProcessingProgress(30);
      } else if (inputMethod === 'text') {
        sourceContent = textInput;
        sourceName = 'Custom Text';
        setTranscript({ name: 'custom_text.txt', content: sourceContent, source: 'text' });
        setProcessingProgress(30);
      } else if (inputMethod === 'image' && selectedImage) {
        // For images, we'll convert to base64 and send to AI
        const reader = new FileReader();
        sourceContent = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(selectedImage);
        });
        sourceName = selectedImage.name;
        setProcessingProgress(30);
      } else if (inputMethod === 'scan' && selectedImage) {
        // Same as image processing
        const reader = new FileReader();
        sourceContent = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(selectedImage);
        });
        sourceName = 'Scanned Document';
        setProcessingProgress(30);
      }
      
      setProcessingStage('sending');
      setProcessingProgress(40);
      
      // Generate content for each selected output type
      const generatedContentData: GeneratedContentData = {};
      
      for (const outputType of selectedOutputs) {
        setProcessingStage('generating');
        setProcessingProgress(50 + (selectedOutputs.indexOf(outputType) * 10));
        
        const prompt = generatePromptForOutputType(outputType, sourceContent, sourceName, difficulty, questionCount[0]);
        
        try {
          const aiResponse = await aiChatService.sendMessage(prompt);
          const parsedContent = parseAIResponse(aiResponse, outputType);
          generatedContentData[outputType as keyof GeneratedContentData] = parsedContent;
        } catch (error) {
          console.error(`Error generating ${outputType}:`, error);
          toast.error(`Failed to generate ${outputType}. Please try again.`);
        }
      }
      
      setProcessingStage('preparing');
      setProcessingProgress(90);
      
      // Create generated content for each output type
      selectedOutputs.forEach(outputType => {
        const title = `${outputType.charAt(0).toUpperCase() + outputType.slice(1)} from ${inputMethod}`;
        const inputSource: string = inputMethod === 'youtube' ? youtubeUrl : 
                           inputMethod === 'text' ? textInput.substring(0, 50) + '...' :
                           inputMethod === 'file' ? selectedFileName || 'Unknown File' :
                           inputMethod === 'image' ? selectedImageName || 'Unknown Image' :
                           'Document Scan';
        
        const generatedContent = createGeneratedContentFromSmartStudyHub(
          user.id,
          title,
          outputType as GeneratedContentType,
          inputMethod as InputMethod,
          inputSource,
          { [outputType]: generatedContentData[outputType as keyof GeneratedContentData] },
          [inputMethod || 'unknown', outputType, difficulty]
        );
        
        // Save to storage
        saveGeneratedContent(generatedContent);
        
        // Create library item
        const libraryItem = createLibraryItemFromGeneratedContent(generatedContent);
        saveLibraryItem(libraryItem);
      });
      
      setProcessingStage('done');
      setProcessingProgress(100);
      
      toast.success('Content generated successfully!');
      
      // Reset form
      setInputMethod(null);
      setYoutubeUrl('');
      setTextInput('');
      setSelectedOutputs([]);
      setSelectedFileName('');
      setSelectedImageName('');
      setSelectedFile(null);
      setSelectedImage(null);
      setTranscript(null);
      
      // Notify parent component
      if (onContentGenerated) {
        onContentGenerated();
      }
      
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error(`Error generating content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
      setProcessingStage('idle');
      setTimeout(() => setProcessingProgress(0), 500);
    }
  };

  // Helper function to generate prompts for different output types
  const generatePromptForOutputType = (outputType: OutputType, sourceContent: string, sourceName: string, difficulty: Difficulty, questionCount: number): string => {
    const basePrompt = `Based on the following content from "${sourceName}", generate ${outputType}. IMPORTANT: Always produce the final output in English, even if the source content is in another language.`;
    
    switch (outputType) {
      case 'notes':
        return `${basePrompt}
        
        Create comprehensive study notes with the following structure:
        - Title: A descriptive title for the notes
        - Sections: Main topics with headings, content, and sub-sections
        - Key Points: Important takeaways
        - References: Any sources mentioned
        
        Format as JSON:
        {
          "title": "...",
          "sections": [
            {
              "heading": "...",
              "content": "...",
              "subSections": [
                {
                  "heading": "...",
                  "content": "..."
                }
              ]
            }
          ],
          "keyPoints": ["...", "...", "..."],
          "references": ["...", "..."]
        }
        
        Content:
        ${sourceContent}`;
        
      case 'summary':
        return `${basePrompt}
        
        Create a comprehensive summary with:
        - Overview: Brief description of the main content
        - Key Points: Important concepts and ideas
        - Main Topics: Primary subjects covered
        - Conclusion: Summary of implications or conclusions
        
        Format as JSON:
        {
          "overview": "...",
          "keyPoints": ["...", "...", "..."],
          "mainTopics": ["...", "...", "..."],
          "conclusion": "..."
        }
        
        Content:
        ${sourceContent}`;
        
      case 'flashcards':
        return `${basePrompt}
        
        Create ${questionCount} flashcards with:
        - Front: Question or concept
        - Back: Answer or explanation
        - Difficulty: ${difficulty}
        - Category: Relevant subject area
        
        Format as JSON array:
        [
          {
            "id": "card_1",
            "front": "...",
            "back": "...",
            "difficulty": "${difficulty}",
            "category": "..."
          }
        ]
        
        Content:
        ${sourceContent}`;
        
      case 'mindmap':
        return `${basePrompt}
        
        Create a mind map structure with:
        - Title: Main topic title
        - Central Topic: Core concept
        - Branches: Main themes with sub-branches
        
        Format as JSON:
        {
          "title": "...",
          "centralTopic": "...",
          "branches": [
            {
              "id": "branch_1",
              "label": "...",
              "subBranches": [
                {
                  "id": "sub_1_1",
                  "label": "...",
                  "subBranches": []
                }
              ]
            }
          ]
        }
        
        Content:
        ${sourceContent}`;
        
      case 'questions':
        return `${basePrompt}
        
        Create ${questionCount} multiple-choice questions with:
        - Question: Clear, standalone question
        - Options: 4 answer choices
        - Correct Answer: Index of correct option (0-3)
        - Explanation: Why the answer is correct
        - Difficulty: ${difficulty}
        - Type: "multiple-choice"
        
        Format as JSON array:
        [
          {
            "id": "q_1",
            "question": "...",
            "options": ["...", "...", "...", "..."],
            "correctAnswer": 0,
            "explanation": "...",
            "difficulty": "${difficulty}",
            "type": "multiple-choice"
          }
        ]
        
        Content:
        ${sourceContent}`;
        
      default:
        return basePrompt;
    }
  };

  // Helper function to parse AI responses
  const parseAIResponse = (response: string, outputType: OutputType): any => {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // If no JSON found, return a fallback structure
      switch (outputType) {
        case 'notes':
          return {
            title: 'Generated Notes',
            sections: [{ heading: 'Main Content', content: response }],
            keyPoints: ['Key point extracted from content'],
            references: []
          };
        case 'summary':
          return {
            overview: response.substring(0, 200) + '...',
            keyPoints: ['Key point 1', 'Key point 2'],
            mainTopics: ['Topic 1', 'Topic 2'],
            conclusion: 'Summary conclusion'
          };
        case 'flashcards':
          return [{
            id: 'card_1',
            front: 'Question from content',
            back: response.substring(0, 100),
            difficulty: difficulty,
            category: 'General'
          }];
        case 'mindmap':
          return {
            title: 'Content Mind Map',
            centralTopic: 'Main Topic',
            branches: [{
              id: 'branch_1',
              label: 'Main Branch',
              subBranches: []
            }]
          };
        case 'questions':
          return [{
            id: 'q_1',
            question: 'Sample question from content',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 0,
            explanation: response.substring(0, 100),
            difficulty: difficulty,
            type: 'multiple-choice'
          }];
        default:
          return {};
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Return fallback content
      return parseAIResponse('', outputType);
    }
  };

  // Input box configurations
  const getInputBoxes = () => {
    const baseBoxes = [
      {
        id: 'youtube' as InputMethod,
        title: 'YouTube Video',
        icon: Youtube,
        description: 'Extract content',
        onClick: () => setActiveModal('youtube')
      },
      {
        id: 'file' as InputMethod,
        title: 'Upload Document',
        icon: Upload,
        description: 'PDF & files',
        onClick: () => setActiveModal('file')
      },
      {
        id: 'text' as InputMethod,
        title: 'Paste Text',
        icon: FileText,
        description: 'Type or paste',
        onClick: () => setActiveModal('text')
      }
    ];

    if (isMobile) {
      return [
        ...baseBoxes,
        {
          id: 'image' as InputMethod,
          title: 'Select Image',
          icon: Image,
          description: 'Upload images',
          onClick: () => setActiveModal('image')
        },
        {
          id: 'scan' as InputMethod,
          title: 'Scan Document',
          icon: Scan,
          description: 'Camera scan',
          onClick: handleScanDocument
        }
      ];
    } else {
      return [
        ...baseBoxes,
        {
          id: 'image' as InputMethod,
          title: 'Upload Image',
          icon: Image,
          description: 'Upload images',
          onClick: () => setActiveModal('image')
        }
      ];
    }
  };

  const outputCards = [
    {
      id: 'notes' as OutputType,
      title: 'Notes',
      icon: StickyNote,
      description: 'Structured study notes'
    },
    {
      id: 'summary' as OutputType,
      title: 'Summary',
      icon: FileSearch,
      description: 'Key points overview'
    },
    {
      id: 'flashcards' as OutputType,
      title: 'Flashcards',
      icon: CreditCard,
      description: 'Interactive study cards'
    },
    {
      id: 'mindmap' as OutputType,
      title: 'Mind Map',
      icon: Network,
      description: 'Visual knowledge map'
    },
    {
      id: 'questions' as OutputType,
      title: 'Practice Questions',
      icon: HelpCircle,
      description: 'Test your understanding'
    }
  ];

  return (
    <div className={`max-w-6xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8 ${className}`}>

      {/* Main Input Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-2 p-3 sm:p-6 md:p-8">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl text-center">Choose Your Input Method</CardTitle>
            <p className="text-muted-foreground text-center text-sm sm:text-base">
              Select how you'd like to provide your content
            </p>
          </CardHeader>
          <CardContent>
            {/* Input Boxes Grid */}
            <div className={`grid gap-3 sm:gap-4 ${
              isMobile 
                ? 'grid-cols-2' 
                : 'grid-cols-2 lg:grid-cols-4'
            }`}>
              {getInputBoxes().map((box, index) => {
                const Icon = box.icon;
                const isSelected = inputMethod === box.id;
                
                // Mobile-specific layout: 2-2-1 arrangement
                const getMobileGridPosition = () => {
                  if (!isMobile) return '';
                  
                  if (index < 2) {
                    return 'col-span-1 row-span-1'; // First row: 2 boxes side by side
                  } else if (index < 4) {
                    return 'col-span-1 row-span-1'; // Second row: 2 boxes side by side
                  } else {
                    return 'col-span-2 row-span-1'; // Third row: 1 box centered (spans 2 columns)
                  }
                };
                
                return (
                  <motion.div
                    key={box.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={getMobileGridPosition()}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-200 border-2 ${
                        isMobile ? 'h-28' : 'h-auto'
                      } ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border hover:border-primary/50 hover:shadow-sm'
                      }`}
                      onClick={box.onClick}
                    >
                      <CardContent className={`h-full flex flex-col items-center justify-center text-center ${
                        isMobile ? 'p-2 space-y-1' : 'p-4 space-y-3'
                      }`}>
                        <div className={`rounded-full flex items-center justify-center ${
                          isMobile ? 'w-8 h-8' : 'w-12 h-12'
                        } ${
                          isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <Icon className={isMobile ? 'h-4 w-4' : 'h-6 w-6'} />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h3 className={`font-semibold text-foreground leading-tight ${
                            isMobile ? 'text-xs' : 'text-base'
                          }`}>{box.title}</h3>
                          <p className={`text-muted-foreground leading-tight ${
                            isMobile ? 'text-xs mt-1' : 'text-sm'
                          }`}>{box.description}</p>
                        </div>
                        {isSelected && (
                          <div className="flex justify-center mt-1">
                            <div className={`rounded-full bg-primary text-primary-foreground flex items-center justify-center ${
                              isMobile ? 'w-4 h-4' : 'w-6 h-6'
                            }`}>
                              <Check className={isMobile ? 'h-2 w-2' : 'h-4 w-4'} />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Selected Input Display */}
            {hasValidInput() && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-muted/50 rounded-lg ${
                  isMobile ? 'mt-3 p-3' : 'mt-6 p-4'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`rounded-full bg-primary text-primary-foreground flex items-center justify-center ${
                      isMobile ? 'w-6 h-6' : 'w-8 h-8'
                    }`}>
                      {getInputBoxes().find(box => box.id === inputMethod)?.icon && 
                        React.createElement(getInputBoxes().find(box => box.id === inputMethod)!.icon, { 
                          className: isMobile ? "h-3 w-3" : "h-4 w-4" 
                        })
                      }
                    </div>
                    <div>
                      <p className={`font-medium text-foreground ${
                        isMobile ? 'text-sm' : 'text-base'
                      }`}>
                        {inputMethod === 'youtube' && 'YouTube Video Selected'}
                        {inputMethod === 'file' && `File: ${selectedFileName}`}
                        {inputMethod === 'text' && 'Text Input Selected'}
                        {inputMethod === 'image' && `Image: ${selectedImageName}`}
                        {inputMethod === 'scan' && 'Document Scan Selected'}
                      </p>
                      <p className={`text-muted-foreground ${
                        isMobile ? 'text-xs' : 'text-sm'
                      }`}>
                        {inputMethod === 'youtube' && youtubeUrl}
                        {inputMethod === 'text' && `${textInput.substring(0, isMobile ? 30 : 50)}${textInput.length > (isMobile ? 30 : 50) ? '...' : ''}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size={isMobile ? "sm" : "sm"}
                    onClick={() => {
                      setInputMethod(null);
                      setYoutubeUrl('');
                      setTextInput('');
                      setSelectedFileName('');
                      setSelectedImageName('');
                      setSelectedFile(null);
                      setSelectedImage(null);
                      setTranscript(null);
                    }}
                    className={isMobile ? 'p-1' : ''}
                  >
                    <X className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Output Selection */}
      <AnimatePresence>
        {hasValidInput() && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2">
              <CardHeader className={isMobile ? 'pb-3' : 'pb-6'}>
                <CardTitle className={`text-center ${
                  isMobile ? 'text-lg' : 'text-xl'
                }`}>
                  What would you like to generate?
                </CardTitle>
              </CardHeader>
              <CardContent className={isMobile ? 'p-3' : 'p-6'}>
                <div className={`grid gap-3 sm:gap-4 ${
                  isMobile 
                    ? 'grid-cols-2' 
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`}>
                  {outputCards.map((card) => {
                    const Icon = card.icon;
                    const isSelected = selectedOutputs.includes(card.id);
                    
                    return (
                      <motion.div
                        key={card.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={`cursor-pointer transition-all duration-200 border-2 ${
                            isMobile ? 'h-28' : 'h-auto'
                          } ${
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-md'
                              : 'border-border hover:border-primary/50 hover:shadow-sm'
                          }`}
                          onClick={() => handleOutputToggle(card.id)}
                        >
                          <CardContent className={`h-full flex flex-col items-center justify-center text-center ${
                            isMobile ? 'p-2 space-y-1' : 'p-4 space-y-3'
                          }`}>
                            <div className={`rounded-full flex items-center justify-center ${
                              isMobile ? 'w-8 h-8' : 'w-12 h-12'
                            } ${
                              isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}>
                              <Icon className={isMobile ? 'h-4 w-4' : 'h-6 w-6'} />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                              <h3 className={`font-semibold text-foreground leading-tight ${
                                isMobile ? 'text-xs' : 'text-base'
                              }`}>{card.title}</h3>
                              <p className={`text-muted-foreground leading-tight ${
                                isMobile ? 'text-xs mt-1' : 'text-sm'
                              }`}>{card.description}</p>
                            </div>
                            {isSelected && (
                              <div className="flex justify-center mt-1">
                                <div className={`rounded-full bg-primary text-primary-foreground flex items-center justify-center ${
                                  isMobile ? 'w-4 h-4' : 'w-6 h-6'
                                }`}>
                                  <Check className={isMobile ? 'h-2 w-2' : 'h-4 w-4'} />
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Practice Questions Options */}
                {selectedOutputs.includes('questions') && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-muted/50 rounded-lg space-y-3 ${
                      isMobile ? 'mt-4 p-3' : 'mt-6 p-4 space-y-4'
                    }`}
                  >
                    <h4 className={`font-semibold text-foreground ${
                      isMobile ? 'text-sm' : 'text-base'
                    }`}>Practice Questions Settings</h4>
                    
                    <div className="space-y-2 sm:space-y-3">
                      <label className={`font-medium text-foreground ${
                        isMobile ? 'text-xs' : 'text-sm'
                      }`}>
                        Number of Questions: {questionCount[0]}
                      </label>
                      <Slider
                        value={questionCount}
                        onValueChange={setQuestionCount}
                        max={20}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={`font-medium text-foreground ${
                        isMobile ? 'text-xs' : 'text-sm'
                      }`}>Difficulty</label>
                      <div className="flex gap-2">
                        {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                          <Button
                            key={level}
                            variant={difficulty === level ? 'default' : 'outline'}
                            size={isMobile ? "sm" : "sm"}
                            onClick={() => setDifficulty(level)}
                            className={`capitalize ${
                              isMobile ? 'text-xs px-2 py-1' : ''
                            }`}
                          >
                            {level}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Status */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="border-2">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-primary animate-pulse" />
                    <span className="font-semibold text-foreground">
                      {processingStage === 'extracting' && 'Extracting Content...'}
                      {processingStage === 'sending' && 'Sending to AI...'}
                      {processingStage === 'generating' && 'Generating Content...'}
                      {processingStage === 'preparing' && 'Preparing Results...'}
                      {processingStage === 'done' && 'Completed!'}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {processingProgress}% Complete
                  </p>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <p>• Processing your input content</p>
                  <p>• Analyzing with AI</p>
                  <p>• Generating study materials</p>
                  <p>• Preparing for your library</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center"
      >
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate() || isGenerating}
          size={isMobile ? "default" : "lg"}
          className={`font-semibold ${
            isMobile 
              ? 'h-10 px-6 text-sm' 
              : 'h-14 px-8 text-lg'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className={`animate-spin mr-2 ${
                isMobile ? 'h-4 w-4' : 'h-5 w-5'
              }`} />
              Generating...
            </>
          ) : (
            <>
              Generate Content
              <ArrowRight className={`ml-2 ${
                isMobile ? 'h-4 w-4' : 'h-5 w-5'
              }`} />
            </>
          )}
        </Button>
      </motion.div>

      {/* Status Messages */}
      {!hasValidInput() && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-muted-foreground"
        >
          <p className={isMobile ? 'text-sm' : 'text-base'}>Please provide content to get started</p>
        </motion.div>
      )}

      {hasValidInput() && selectedOutputs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-muted-foreground"
        >
          <p className={isMobile ? 'text-sm' : 'text-base'}>Select at least one output type to continue</p>
        </motion.div>
      )}

      {/* Input Modals */}
      {/* YouTube Modal */}
      <Dialog open={activeModal === 'youtube'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5" />
              YouTube Video
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">YouTube URL</label>
              <Input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setActiveModal(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (youtubeUrl.trim()) {
                    setInputMethod('youtube');
                    setActiveModal(null);
                  }
                }}
                disabled={!youtubeUrl.trim()}
              >
                Add Video
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* File Upload Modal */}
      <Dialog open={activeModal === 'file'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Document
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select File</label>
              <Button
                variant="outline"
                onClick={handleFileUpload}
                className="w-full h-12 border-2 border-dashed"
              >
                <Upload className="h-5 w-5 mr-2" />
                Choose File
              </Button>
              {selectedFileName && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedFileName}
                </p>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setActiveModal(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => setActiveModal(null)}
                disabled={!selectedFileName}
              >
                Add File
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Text Input Modal */}
      <Dialog open={activeModal === 'text'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              Text Input
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-medium">Paste or Type Text</label>
              <Textarea
                placeholder="Paste your text here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-[120px] resize-none text-sm"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={() => {
                  if (textInput.trim()) {
                    setInputMethod('text');
                    setActiveModal(null);
                  }
                }}
                disabled={!textInput.trim()}
              >
                Add Text
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Upload Modal */}
      <Dialog open={activeModal === 'image'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Upload Image
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Image</label>
              <Button
                variant="outline"
                onClick={handleImageUpload}
                className="w-full h-12 border-2 border-dashed"
              >
                <Image className="h-5 w-5 mr-2" />
                Choose Image
              </Button>
              {selectedImageName && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedImageName}
                </p>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setActiveModal(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => setActiveModal(null)}
                disabled={!selectedImageName}
              >
                Add Image
              </Button>
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
