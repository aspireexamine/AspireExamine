import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Stream, Subject, Paper, Result } from '@/types';
import { FileText, Printer } from 'lucide-react';

// --- Card Components ---

export const StreamCard = ({ stream, onClick }: { stream: Stream; onClick: () => void }) => (
  <div onClick={onClick} className="group block cursor-pointer overflow-hidden rounded-lg bg-card shadow-sm transition-all duration-300 hover:shadow-lg">
    <div className="aspect-video w-full overflow-hidden">
      {stream.imageUrl ? (
        <img
          src={stream.imageUrl}
          alt={stream.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <FileText className="size-12 text-muted-foreground" />
        </div>
      )}
    </div>
    <div className="p-4">
      <h3 className="text-lg font-semibold text-card-foreground">{stream.name}</h3>
    </div>
  </div>
);

export const SubjectCard = ({ subject, onClick }: { subject: Subject; onClick: () => void }) => (
  <Card onClick={onClick} className="cursor-pointer hover:border-primary transition-all duration-200">
    <CardHeader>
      <CardTitle>{subject.name}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{subject.papers?.length ?? 0} papers available</p>
    </CardContent>
  </Card>
);

export const PaperCard = ({ paper, onStart }: { paper: Paper; onStart: () => void }) => (
  <Card className="flex flex-col h-full">
    <CardHeader>
      <CardTitle>{paper.title}</CardTitle>
      <CardDescription>{paper.total_questions} Questions | {paper.duration} mins</CardDescription>
    </CardHeader>
    <CardContent className="flex-grow">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Difficulty: <Badge variant="outline">{paper.difficulty}</Badge></span>
        <span>Attempts: {paper.attempts}</span>
      </div>
    </CardContent>
    <div className="p-4 pt-0">
      <Button onClick={onStart} className="w-full">Start Test</Button>
    </div>
  </Card>
);

// --- Results Page ---

export const ResultsPage = ({ result, onGoHome }: { result: Result; onGoHome: () => void; }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Test Result</CardTitle>
          <CardDescription>Here's your performance breakdown.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="flex flex-col items-center justify-center">
              <div className="relative h-48 w-48">
                <svg className="absolute h-full w-full" viewBox="0 0 36 36">
                    <path
                        className="text-muted/20"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="text-primary"
                        strokeDasharray={`${result.percentage}, 100`}
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{result.percentage.toFixed(2)}%</span>
                  <span className="text-muted-foreground">Overall Score</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <Card>
                <CardHeader><CardTitle>{result.score}/{result.totalMarks}</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">Total Score</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>{result.correctAnswers}</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">Correct</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>{result.wrongAnswers}</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">Wrong</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>{result.unanswered}</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">Unanswered</p></CardContent>
              </Card>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <Button onClick={onGoHome}>Go to Dashboard</Button>
            <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Download PDF</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

