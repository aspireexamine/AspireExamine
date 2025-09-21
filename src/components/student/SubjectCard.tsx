import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PracticeSubject, Subject } from '@/types';
import { ChevronRight, Zap, Beaker, Dna, Calculator, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface SubjectCardProps {
  subject: Subject | PracticeSubject;
  onClick: () => void;
}

const iconMap = {
  'Zap': Zap,
  'Beaker': Beaker,
  'Dna': Dna,
  'Calculator': Calculator,
};

export function SubjectCard({ subject, onClick }: SubjectCardProps) {
  const IconComponent = 'icon' in subject && subject.icon ? iconMap[subject.icon as keyof typeof iconMap] : BookOpen;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="cursor-pointer transition-all duration-200 hover:shadow-lg border-2 hover:border-primary/20 group"
        onClick={onClick}
      >
        <CardHeader className="pb-2 sm:pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <CardTitle className="text-base sm:text-xl font-bold group-hover:text-primary transition-colors">
                {subject.name}
              </CardTitle>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div>
            <CardDescription>
              {(subject as any).chapters?.length || 0} chapters available
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
