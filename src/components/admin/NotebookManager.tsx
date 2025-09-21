import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotebookFolder, Notebook } from '@/types';
import { Plus, Edit, Trash2, Folder, FileText, UploadCloud } from 'lucide-react';
import { getNotebookFoldersWithNotebooks, createNotebookFolder, updateNotebookFolder, deleteNotebookFolder, createNotebook, updateNotebook, deleteNotebook, uploadNotebookFile } from '@/lib/supabaseQueries';

interface NotebookManagerProps {
  notebookFolders: NotebookFolder[];
  setNotebookFolders: React.Dispatch<React.SetStateAction<NotebookFolder[]>>;
}

const Dropzone = ({ onFileChange }: { onFileChange: (file: File | null) => void }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <Label 
      htmlFor="file-upload"
      className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors ${
        isDragging ? 'border-primary' : 'border-border'
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
        <p className="mb-2 text-sm text-muted-foreground">
          <span className="font-semibold">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground">PDF, DOCX, etc. (up to 10MB)</p>
      </div>
      <Input id="file-upload" type="file" className="hidden" onChange={(e) => onFileChange(e.target.files ? e.target.files[0] : null)} />
    </Label>
  );
};

export function NotebookManager({ notebookFolders, setNotebookFolders }: NotebookManagerProps) {
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [isNotebookDialogOpen, setIsNotebookDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [currentFolder, setCurrentFolder] = useState<NotebookFolder | null>(null);
  const [currentNotebook, setCurrentNotebook] = useState<Notebook | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'folder' | 'notebook', id: string, folderId?: string } | null>(null);
  const [formData, setFormData] = useState({ name: '', url: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getNotebookFoldersWithNotebooks();
        setNotebookFolders(data);
      } catch (e) {
        // ignore initial fetch error
      }
    })();
  }, [setNotebookFolders]);

  const handleOpenFolderDialog = (mode: 'create' | 'edit', folder?: NotebookFolder) => {
    setDialogMode(mode);
    setCurrentFolder(folder || null);
    setFormData({ name: folder ? folder.name : '', url: '' });
    setIsFolderDialogOpen(true);
  };

  const handleOpenNotebookDialog = (mode: 'create' | 'edit', folder: NotebookFolder, notebook?: Notebook) => {
    setDialogMode(mode);
    setCurrentFolder(folder);
    setCurrentNotebook(notebook || null);
    setFormData({ name: notebook ? notebook.name : '', url: notebook ? notebook.url : '' });
    setSelectedFile(null);
    setIsNotebookDialogOpen(true);
  };

  const handleOpenDeleteDialog = (type: 'folder' | 'notebook', id: string, folderId?: string) => {
    setItemToDelete({ type, id, folderId });
    setIsDeleteDialogOpen(true);
  };

  const handleFolderSubmit = async () => {
    if (!formData.name) return;
    if (dialogMode === 'create') {
      const created = await createNotebookFolder(formData.name);
      const data = await getNotebookFoldersWithNotebooks();
      setNotebookFolders(data);
    } else if (currentFolder) {
      await updateNotebookFolder(currentFolder.id, formData.name);
      const data = await getNotebookFoldersWithNotebooks();
      setNotebookFolders(data);
    }
    setIsFolderDialogOpen(false);
  };

  const handleNotebookSubmit = async () => {
    if (!currentFolder) return;

    let notebookUrl = formData.url;
    let notebookName = formData.name;

    if (selectedFile) {
      try {
        notebookUrl = await uploadNotebookFile(selectedFile, currentFolder.id);
      } catch (e) {
        return;
      }
      if (!notebookName) {
        notebookName = selectedFile.name;
      }
    }

    if (!notebookName || !notebookUrl) return;

    if (dialogMode === 'create') {
      await createNotebook(currentFolder.id, notebookName, notebookUrl);
    } else if (currentNotebook) {
      await updateNotebook(currentNotebook.id, notebookName, notebookUrl);
    }
    const data = await getNotebookFoldersWithNotebooks();
    setNotebookFolders(data);
    setIsNotebookDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'folder') {
      await deleteNotebookFolder(itemToDelete.id);
      const data = await getNotebookFoldersWithNotebooks();
      setNotebookFolders(data);
    } else if (itemToDelete.type === 'notebook' && itemToDelete.folderId) {
      await deleteNotebook(itemToDelete.id);
      const data = await getNotebookFoldersWithNotebooks();
      setNotebookFolders(data);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex">
        <Button onClick={() => handleOpenFolderDialog('create')} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Create Folder
        </Button>
      </div>

      <Accordion type="multiple" className="w-full space-y-4">
        {notebookFolders.map(folder => (
          <AccordionItem value={folder.id} key={folder.id} className="border-none">
            <Card className="overflow-hidden transition-all hover:shadow-md border">
              <AccordionTrigger className="p-3 sm:p-4 bg-muted/50 hover:no-underline hover:bg-muted/80">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Folder className="h-5 w-5 text-primary" />
                    <span className="text-base sm:text-lg font-semibold">{folder.name}</span>
                  </div>
                  <div className="flex items-center gap-0 sm:gap-2 pr-2 sm:pr-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleOpenFolderDialog('edit', folder); }}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={(e) => { e.stopPropagation(); handleOpenDeleteDialog('folder', folder.id); }}><Trash2 className="h-4 w-4" /></Button>
                    <Button size="sm" className="h-8" onClick={(e) => { e.stopPropagation(); handleOpenNotebookDialog('create', folder); }}>
                      <Plus className="h-4 w-4 mr-2" /> Add Notebook
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-2 sm:p-4 pt-0">
                {folder.notebooks.length > 0 ? (
                  <div className="space-y-2">
                    {folder.notebooks.map(notebook => (
                      <div key={notebook.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-background border">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm truncate max-w-[150px] sm:max-w-xs md:max-w-sm">{notebook.name}</p>
                            <a href={notebook.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline block truncate max-w-[150px] sm:max-w-xs md:max-w-sm">{notebook.url}</a>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenNotebookDialog('edit', folder, notebook)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleOpenDeleteDialog('notebook', notebook.id, folder.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">No notebooks in this folder yet.</p>
                )}
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Folder Dialog */}
      <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === 'create' ? 'Create Folder' : 'Edit Folder'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input id="folder-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFolderDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleFolderSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notebook Dialog */}
      <Dialog open={isNotebookDialogOpen} onOpenChange={setIsNotebookDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'create' ? 'Add Notebook' : 'Edit Notebook'}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="url" className="py-4">
            <TabsList>
              <TabsTrigger value="url">Import from URL</TabsTrigger>
              <TabsTrigger value="device">Import from Device</TabsTrigger>
            </TabsList>
            <TabsContent value="url" className="space-y-4 pt-4">
              <div>
                <Label htmlFor="notebook-name">Notebook Name</Label>
                <Input id="notebook-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="notebook-url">Notebook URL</Label>
                <Input id="notebook-url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} />
              </div>
            </TabsContent>
            <TabsContent value="device" className="space-y-4 pt-4">
              <div>
                <Label htmlFor="notebook-file-name">Notebook Name (Optional)</Label>
                <Input id="notebook-file-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Leave blank to use file name" />
              </div>
              <Dropzone onFileChange={setSelectedFile} />
              {selectedFile && <p className="text-sm text-muted-foreground">Selected file: {selectedFile.name}</p>}
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotebookDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleNotebookSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {itemToDelete?.type}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}