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
  Sparkles,
  ArrowRight,
  Check,
  Image,
  Scan,
  X
} from 'lucide-react';
import { 
  createGeneratedContentFromSmartStudyHub,
  saveGeneratedContent,
  createLibraryItemFromGeneratedContent,
  saveLibraryItem
} from '@/lib/libraryStorage';
import { 
  GeneratedContentType, 
  InputMethod, 
  GeneratedContentData,
  User
} from '@/types';

interface SmartStudyHubProps {
  className?: string;
  user?: User;
  onContentGenerated?: () => void;
}

type InputMethod = 'youtube' | 'file' | 'text' | 'image' | 'scan';
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

  const hasValidInput = () => {
    if (inputMethod === 'youtube') return youtubeUrl.trim() !== '';
    if (inputMethod === 'text') return textInput.trim() !== '';
    if (inputMethod === 'file') return fileInputRef.current?.files?.length > 0;
    if (inputMethod === 'image') return imageInputRef.current?.files?.length > 0;
    if (inputMethod === 'scan') return true; // Scan is always valid once selected
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
      setInputMethod('file');
      setSelectedFileName(e.target.files[0].name);
      setActiveModal(null);
    }
  };

  const handleImageUpload = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setInputMethod('image');
      setSelectedImageName(e.target.files[0].name);
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
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock content based on selected outputs
      const generatedContentData: GeneratedContentData = {};
      
      selectedOutputs.forEach(outputType => {
        switch (outputType) {
          case 'notes':
            generatedContentData.notes = {
              title: `Notes from ${inputMethod}`,
              sections: [
                {
                  heading: 'Main Topic',
                  content: 'This is a sample note generated from your input. In a real implementation, this would be processed by AI to extract key information and structure it into comprehensive study notes.',
                  subSections: [
                    {
                      heading: 'Key Concept 1',
                      content: 'Detailed explanation of the first key concept.'
                    },
                    {
                      heading: 'Key Concept 2',
                      content: 'Detailed explanation of the second key concept.'
                    }
                  ]
                }
              ],
              keyPoints: [
                'Important point 1 from the content',
                'Important point 2 from the content',
                'Important point 3 from the content'
              ],
              references: ['Reference 1', 'Reference 2']
            };
            break;
            
          case 'summary':
            generatedContentData.summary = {
              overview: 'This is a comprehensive summary of the content you provided. It captures the main ideas and key information in a concise format.',
              keyPoints: [
                'Key point 1: Main idea or concept',
                'Key point 2: Supporting information',
                'Key point 3: Additional details',
                'Key point 4: Conclusion or implications'
              ],
              mainTopics: ['Topic 1', 'Topic 2', 'Topic 3'],
              conclusion: 'This summary provides a structured overview of the main content and its implications.'
            };
            break;
            
          case 'flashcards':
            generatedContentData.flashcards = Array.from({ length: 5 }, (_, i) => ({
              id: `card_${i + 1}`,
              front: `Question ${i + 1}: What is the main concept?`,
              back: `Answer ${i + 1}: This is the detailed answer explaining the concept.`,
              difficulty: difficulty,
              category: 'General'
            }));
            break;
            
          case 'mindmap':
            generatedContentData.mindmap = {
              title: 'Content Mind Map',
              centralTopic: 'Main Topic',
              branches: [
                {
                  id: 'branch_1',
                  label: 'Branch 1',
                  subBranches: [
                    { id: 'sub_1_1', label: 'Sub-branch 1.1', subBranches: [] },
                    { id: 'sub_1_2', label: 'Sub-branch 1.2', subBranches: [] }
                  ]
                },
                {
                  id: 'branch_2',
                  label: 'Branch 2',
                  subBranches: [
                    { id: 'sub_2_1', label: 'Sub-branch 2.1', subBranches: [] }
                  ]
                }
              ]
            };
            break;
            
          case 'questions':
            generatedContentData.questions = Array.from({ length: questionCount[0] }, (_, i) => ({
              id: `q_${i + 1}`,
              question: `Sample question ${i + 1}: What is the main concept being discussed?`,
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswer: 0,
              explanation: `This is the explanation for question ${i + 1}. The correct answer is Option A because...`,
              difficulty: difficulty,
              type: 'multiple-choice' as const
            }));
            break;
        }
      });
      
      // Create generated content for each output type
      selectedOutputs.forEach(outputType => {
        const title = `${outputType.charAt(0).toUpperCase() + outputType.slice(1)} from ${inputMethod}`;
        const inputSource = inputMethod === 'youtube' ? youtubeUrl : 
                           inputMethod === 'text' ? textInput.substring(0, 50) + '...' :
                           inputMethod === 'file' ? selectedFileName :
                           inputMethod === 'image' ? selectedImageName :
                           'Document Scan';
        
        const generatedContent = createGeneratedContentFromSmartStudyHub(
          user.id,
          title,
          outputType as GeneratedContentType,
          inputMethod as InputMethod,
          inputSource,
          { [outputType]: generatedContentData[outputType as keyof GeneratedContentData] },
          [inputMethod, outputType, difficulty]
        );
        
        // Save to storage
        saveGeneratedContent(generatedContent);
        
        // Create library item
        const libraryItem = createLibraryItemFromGeneratedContent(generatedContent);
        saveLibraryItem(libraryItem);
      });
      
      // Reset form
      setInputMethod(null);
      setYoutubeUrl('');
      setTextInput('');
      setSelectedOutputs([]);
      setSelectedFileName('');
      setSelectedImageName('');
      
      // Notify parent component
      if (onContentGenerated) {
        onContentGenerated();
      }
      
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsGenerating(false);
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
              <div className={`animate-spin rounded-full border-b-2 border-white mr-2 ${
                isMobile ? 'h-4 w-4' : 'h-5 w-5'
              }`}></div>
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
