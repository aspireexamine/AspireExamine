import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Paper } from '@/types';
import { Clock, Users, Target, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaperCardProps {
  paper: Paper;
  onStart: () => void;
}

export function PaperCard({ paper, onStart }: PaperCardProps) {
  const difficultyColors = {
    'Easy': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    'Hard': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="transition-all duration-200 hover:shadow-lg border-2 hover:border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-bold leading-tight">
                {paper.title}
              </CardTitle>
              <CardDescription className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Created {new Date(paper.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{paper.duration} min</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>{paper.totalQuestions} questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{paper.attempts} attempts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Max: {paper.maxMarks} marks</span>
            </div>
          </div>
          
          <Button 
            onClick={onStart} 
            className="w-full bg-primary hover:bg-primary/90 transition-colors duration-200"
            size="lg"
          >
            Start Test
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}