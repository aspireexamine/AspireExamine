import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Book, 
  StickyNote, 
  FileText, 
  CreditCard, 
  Network, 
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface LibraryDemoProps {
  onNavigateToLibrary: () => void;
  onNavigateToSmartStudyHub: () => void;
}

export function LibraryDemo({ onNavigateToLibrary, onNavigateToSmartStudyHub }: LibraryDemoProps) {
  const demoContent = [
    {
      type: 'notes',
      title: 'Physics Notes from YouTube',
      description: 'Comprehensive notes on quantum mechanics',
      icon: StickyNote,
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      source: 'YouTube Video'
    },
    {
      type: 'summary',
      title: 'Chemistry Summary',
      description: 'Key concepts from organic chemistry textbook',
      icon: FileText,
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      source: 'PDF Document'
    },
    {
      type: 'flashcards',
      title: 'Biology Flashcards',
      description: 'Cell biology flashcards for quick review',
      icon: CreditCard,
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      source: 'Text Input'
    },
    {
      type: 'questions',
      title: 'Math Practice Questions',
      description: 'Calculus practice problems with solutions',
      icon: HelpCircle,
      color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      source: 'Image Upload'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Smart Study Hub & Library Integration</h2>
        <p className="text-muted-foreground">
          Generate study materials and access them all in one organized library
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Smart Study Hub Demo */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Smart Study Hub
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Transform any content into structured study materials using AI:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                YouTube videos → Notes & Summaries
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Documents → Flashcards & Questions
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Images → Mind maps & Analysis
              </li>
            </ul>
            <Button 
              onClick={onNavigateToSmartStudyHub}
              className="w-full"
            >
              Try Smart Study Hub
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Library Demo */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5 text-primary" />
              My Library
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              All your generated content organized in one place:
            </p>
            <div className="space-y-2">
              {demoContent.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <div className="p-1 rounded bg-background">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={`text-xs ${item.color}`}>
                          {item.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">from {item.source}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button 
              onClick={onNavigateToLibrary}
              variant="outline"
              className="w-full"
            >
              View My Library
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">1. Generate Content</h3>
              <p className="text-sm text-muted-foreground">
                Use Smart Study Hub to create notes, summaries, flashcards, and more from any source
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Book className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">2. Auto-Organize</h3>
              <p className="text-sm text-muted-foreground">
                All generated content is automatically saved and organized in your personal library
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <ArrowRight className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">3. Access & Study</h3>
              <p className="text-sm text-muted-foreground">
                Easily find, view, and study your materials with powerful search and filtering
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
