import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TestTube2, FolderPlus, Trash2, Edit } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Test, TestSeries, Stream } from '@/types';
import { toast } from 'sonner';
import { createTestSeries, createTest, updateTest, deleteTest, updateTestSeries, deleteTestSeries, getAdminDashboardData } from '@/lib/supabaseQueries';

interface TestManagerProps {
  streams: Stream[];
  setStreams: React.Dispatch<React.SetStateAction<Stream[]>>;
}

export function TestManager({ streams, setStreams }: TestManagerProps) {
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isEditTestModalOpen, setIsEditTestModalOpen] = useState(false);
  
  const [selectedStreamId, setSelectedStreamId] = useState<string>('');
  const [currentSeriesId, setCurrentSeriesId] = useState<string | null>(null);

  const [newSeriesName, setNewSeriesName] = useState('');
  const [newSeriesDescription, setNewSeriesDescription] = useState('');

  const [newTestName, setNewTestName] = useState('');
  const [newTestNumQuestions, setNewTestNumQuestions] = useState(100);
  const [newTestDuration, setNewTestDuration] = useState(120);

  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [testToDelete, setTestToDelete] = useState<{ streamId: string, seriesId: string, test: Test } | null>(null);

  const handleCreateSeries = async () => {
    if (!newSeriesName || !selectedStreamId) {
      toast.error("Please select a stream and provide a series name.");
      return;
    }
    await createTestSeries(selectedStreamId, newSeriesName, newSeriesDescription);
    const fresh = await getAdminDashboardData();
    setStreams(fresh);

    setNewSeriesName('');
    setNewSeriesDescription('');
    setIsSeriesModalOpen(false);
    toast.success(`Test series "${newSeries.name}" created successfully.`);
  };

  const handleOpenTestModal = (seriesId: string) => {
    setCurrentSeriesId(seriesId);
    setIsTestModalOpen(true);
  };
  
  const handleOpenSeriesModal = () => {
    setSelectedStreamId('');
    setNewSeriesName('');
    setNewSeriesDescription('');
    setIsSeriesModalOpen(true);
  }

  const handleCreateTest = async () => {
    if (!newTestName || !currentSeriesId || !selectedStreamId) {
      toast.error("Could not create test. Series or Stream not identified.");
      return;
    }
    await createTest(currentSeriesId, newTestName, newTestNumQuestions, newTestDuration);
    const fresh = await getAdminDashboardData();
    setStreams(fresh);

    setNewTestName('');
    setNewTestNumQuestions(100);
    setNewTestDuration(120);
    setIsTestModalOpen(false);
    setCurrentSeriesId(null);
    toast.success(`Test "${newTest.name}" added successfully.`);
  };

  const handleOpenEditTestModal = (test: Test, seriesId: string, streamId: string) => {
    setEditingTest(test);
    setCurrentSeriesId(seriesId);
    setSelectedStreamId(streamId);
    setNewTestName(test.name);
    setNewTestNumQuestions(test.numQuestions);
    setNewTestDuration(test.duration);
    setIsEditTestModalOpen(true);
  };

  const handleUpdateTest = async () => {
    if (!newTestName || !editingTest || !currentSeriesId || !selectedStreamId) {
      toast.error("Could not update test. Missing required information.");
      return;
    }

    await updateTest(editingTest.id, newTestName, newTestNumQuestions, newTestDuration);
    const fresh = await getAdminDashboardData();
    setStreams(fresh);

    setIsEditTestModalOpen(false);
    setEditingTest(null);
    toast.success(`Test "${updatedTest.name}" updated successfully.`);
  };

  const handleDeleteTest = async () => {
    if (!testToDelete) return;
    const { streamId, seriesId, test } = testToDelete;
    await deleteTest(test.id);
    const fresh = await getAdminDashboardData();
    setStreams(fresh);
    setTestToDelete(null);
    toast.success(`Test "${test.name}" has been deleted.`);
  };

  return (
    <div className="space-y-6">
      <Dialog open={isSeriesModalOpen} onOpenChange={setIsSeriesModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Test Series</DialogTitle>
            <DialogDescription>A test series is a collection of tests, like a folder.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="stream-select">Stream</Label>
            <Select value={selectedStreamId} onValueChange={setSelectedStreamId}>
              <SelectTrigger id="stream-select"><SelectValue placeholder="Select Stream..." /></SelectTrigger>
              <SelectContent>{streams.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="series-name">Series Name</Label>
              <Input 
                id="series-name" 
                placeholder="e.g., AIPMT, JEE Mains" 
                value={newSeriesName}
                onChange={e => setNewSeriesName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="series-description">Description</Label>
              <Input 
                id="series-description" 
                placeholder="e.g., Full syllabus mock tests for 2025"
                value={newSeriesDescription}
                onChange={e => setNewSeriesDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSeriesModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSeries}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Test</DialogTitle>
            <DialogDescription>Add a new test to the selected series.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="test-name">Test Name</Label>
              <Input 
                id="test-name" 
                placeholder="e.g., Mock Test 1, AIPMT #3"
                value={newTestName}
                onChange={e => setNewTestName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="test-questions">Number of Questions</Label>
                <Input 
                  id="test-questions" 
                  type="number"
                  value={newTestNumQuestions}
                  onChange={e => setNewTestNumQuestions(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-duration">Duration (minutes)</Label>
                <Input 
                  id="test-duration" 
                  type="number"
                  value={newTestDuration}
                  onChange={e => setNewTestDuration(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTest}>Create Test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditTestModalOpen} onOpenChange={setIsEditTestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Test</DialogTitle>
            <DialogDescription>Update the details for "{editingTest?.name}".</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-test-name">Test Name</Label>
              <Input 
                id="edit-test-name" 
                value={newTestName}
                onChange={e => setNewTestName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-test-questions">Number of Questions</Label>
                <Input 
                  id="edit-test-questions" 
                  type="number"
                  value={newTestNumQuestions}
                  onChange={e => setNewTestNumQuestions(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-test-duration">Duration (minutes)</Label>
                <Input 
                  id="edit-test-duration" 
                  type="number"
                  value={newTestDuration}
                  onChange={e => setNewTestDuration(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTestModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateTest}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!testToDelete} onOpenChange={() => setTestToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogDescription>This will permanently delete the test "{testToDelete?.test.name}". This action cannot be undone.</AlertDialogDescription>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteTest} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">Create and manage mock tests, full syllabus tests, and more.</p>
        <Button onClick={handleOpenSeriesModal} className="gap-2 w-full sm:w-auto">
          <FolderPlus className="h-4 w-4" />
          Create Test Series
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Test Series</CardTitle>
          <CardDescription className="text-sm">Manage your test series and the tests within them.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {streams.every(s => (s.testSeries || []).length === 0) ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <TestTube2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No test series created yet</h3>
              <p className="text-muted-foreground">Click "Create Test Series" to get started.</p>
            </div>
          ) : (
            streams.map(stream => (stream.testSeries || []).length > 0 && (
              <Accordion key={stream.id} type="multiple" className="w-full border rounded-lg p-2 sm:p-4">
                <h3 className="font-bold text-base sm:text-lg px-2 sm:px-4 pb-2">{stream.name}</h3>
                {stream.testSeries?.map(series => (
                  <AccordionItem value={series.id} key={series.id}>
                  <AccordionTrigger className="text-base sm:text-lg font-medium hover:no-underline">{series.name}</AccordionTrigger>
                  <AccordionContent className="space-y-2 sm:space-y-4">
                    <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground px-2">
                      <p>{series.description}</p>
                      <Button variant="outline" size="sm" className="gap-1 sm:gap-2 h-8 text-xs" onClick={() => { setSelectedStreamId(stream.id); handleOpenTestModal(series.id); }}>
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Add Test</span>
                      </Button>
                    </div>
                    {series.tests.length > 0 ? (
                      <div className="space-y-2">
                        {series.tests.map(test => (
                          <div key={test.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50">
                            <div>
                              <p className="font-semibold text-sm sm:text-base">{test.name}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {test.numQuestions} Questions | {test.duration} minutes
                              </p>
                            </div>
                            <div className="flex items-center gap-0 sm:gap-1">
                               <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditTestModal(test, series.id, stream.id)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => setTestToDelete({ streamId: stream.id, seriesId: series.id, test })}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">No tests in this series yet.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
                ))}
              </Accordion>
            )))}
        </CardContent>
      </Card>
    </div>
  );
}