import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stream } from '@/types';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface StreamCardProps {
  stream: Stream;
  onClick: () => void;
  subjectsClassName?: string;
}

export function StreamCard({ stream, onClick, subjectsClassName }: StreamCardProps) {
  useTheme(); // Ensures component re-renders on theme change

  const cardStyle = stream.imageUrl
    ? {
        backgroundImage: `url(${stream.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {};

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card
        className="cursor-pointer transition-all duration-200 hover:shadow-lg border-2 hover:border-primary/20 group h-full flex flex-col justify-between relative overflow-hidden"
        onClick={onClick}
        style={cardStyle}
      >
        <div className="absolute inset-0 transition-colors bg-transparent group-hover:bg-black/10 dark:group-hover:bg-white/10" />
        <div className="relative flex flex-col flex-grow z-10 justify-between p-3 sm:p-4 bg-background/70 backdrop-blur-sm">
          <div>
            <CardHeader className="p-0 pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg sm:text-xl font-bold">
                  {stream.name}
                </CardTitle>
                <ChevronRight className="h-5 w-5 flex-shrink-0 ml-2" />
              </div>
              {stream.description && (
                <CardDescription className="text-sm leading-relaxed pt-1 text-foreground/80">
                  {stream.description}
                </CardDescription>
              )}
            </CardHeader>
          </div>
          <CardContent className="p-0 pt-1">
            <div className={`flex flex-wrap gap-2 ${subjectsClassName || ''}`}>
              {stream.subjects.map((subject) => (
                <Badge key={subject.id} variant={'secondary'}>
                  {subject.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}

