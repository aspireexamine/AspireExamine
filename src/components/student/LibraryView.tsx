import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Star, 
  StarOff, 
  Book, 
  FileText, 
  StickyNote, 
  CreditCard, 
  Network, 
  HelpCircle,
  Calendar,
  Eye,
  ChevronDown,
  ChevronRight,
  Play,
  Upload,
  Type,
  Image,
  Scan,
  Folder,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { 
  LibraryItem, 
  GeneratedContent
} from '@/types';
import { 
  getLibraryItems, 
  updateLibraryItem, 
  initializeDefaultFolders,
  groupLibraryItemsBySource,
  groupLibraryItemsBySourceWithAITitles,
  SourceGroup,
  deleteLibraryItemsBySource,
  clearAllDuplicates
} from '@/lib/libraryStorage';
import { User } from '@/types';

interface LibraryViewProps {
  user: User;
  onViewContent: (item: LibraryItem) => void;
}

export function LibraryView({ user, onViewContent }: LibraryViewProps) {
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [sourceGroups, setSourceGroups] = useState<SourceGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editGroupTitle, setEditGroupTitle] = useState('');
  const [deletingGroup, setDeletingGroup] = useState<string | null>(null);

  // Initialize library data
  useEffect(() => {
    initializeDefaultFolders(user.id);
    loadLibraryData();
  }, [user.id]);

  const loadLibraryData = async () => {
    // Remove duplicates first - use the more aggressive function
    clearAllDuplicates(user.id);
    
    const items = getLibraryItems(user.id);
    
    try {
      // Use AI-generated titles
      const groups = await groupLibraryItemsBySourceWithAITitles(user.id);
      setLibraryItems(items);
      setSourceGroups(groups);
    } catch (error) {
      console.error('Error loading library data with AI titles:', error);
      // Fallback to regular grouping
      const groups = groupLibraryItemsBySource(user.id);
      setLibraryItems(items);
      setSourceGroups(groups);
    }
  };

  // Filter and search source groups
  const filteredSourceGroups = useMemo(() => {
    let groups = sourceGroups;

    // Apply search filter
    if (searchQuery.trim()) {
      groups = groups.map(group => ({
        ...group,
        items: group.items.filter(item => 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      })).filter(group => group.items.length > 0);
    }

    // Apply favorites filter
    if (showFavoritesOnly) {
      groups = groups.map(group => ({
        ...group,
        items: group.items.filter(item => item.isFavorite)
      })).filter(group => group.items.length > 0);
    }

    // Apply tab filter
    if (selectedTab !== 'all') {
      if (selectedTab === 'favorites') {
        groups = groups.map(group => ({
          ...group,
          items: group.items.filter(item => item.isFavorite)
        })).filter(group => group.items.length > 0);
      } else {
        // Filter by generated content type
        groups = groups.map(group => ({
          ...group,
          items: group.items.filter(item => 
            item.type === 'generated-content' && 
            (item.content as GeneratedContent).type === selectedTab
          )
        })).filter(group => group.items.length > 0);
      }
    }

    return groups;
  }, [sourceGroups, searchQuery, showFavoritesOnly, selectedTab]);

  const handleToggleFavorite = (itemId: string) => {
    const item = libraryItems.find(i => i.id === itemId);
    if (item) {
      updateLibraryItem(itemId, { isFavorite: !item.isFavorite });
      loadLibraryData();
    }
  };


  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleEditGroup = (groupId: string, currentTitle: string) => {
    setEditingGroup(groupId);
    setEditGroupTitle(currentTitle);
  };

  const handleSaveEdit = () => {
    if (editingGroup && editGroupTitle.trim()) {
      // Find the group and update its title
      const group = sourceGroups.find(g => g.id === editingGroup);
      if (group) {
        // Update the source title in the group
        const updatedGroups = sourceGroups.map(g => 
          g.id === editingGroup 
            ? { ...g, sourceTitle: editGroupTitle.trim() }
            : g
        );
        setSourceGroups(updatedGroups);
      }
      setEditingGroup(null);
      setEditGroupTitle('');
    }
  };

  const handleCancelEdit = () => {
    setEditingGroup(null);
    setEditGroupTitle('');
  };

  const handleDeleteGroup = (groupId: string) => {
    setDeletingGroup(groupId);
  };

  const handleConfirmDelete = async () => {
    if (deletingGroup) {
      // Find the group to get its input method and source
      const group = sourceGroups.find(g => g.id === deletingGroup);
      if (group) {
        // Delete all items in this group from library storage
        deleteLibraryItemsBySource(user.id, group.inputMethod, group.inputSource);
      }
      
      setDeletingGroup(null);
      await loadLibraryData(); // Refresh the data
    }
  };

  const handleCancelDelete = () => {
    setDeletingGroup(null);
  };

  const getSourceIcon = (inputMethod: string) => {
    switch (inputMethod) {
      case 'youtube':
        return Play;
      case 'file':
        return Upload;
      case 'text':
        return Type;
      case 'image':
        return Image;
      case 'scan':
        return Scan;
      default:
        return Folder;
    }
  };

  const getContentIcon = (item: LibraryItem) => {
    if (item.type === 'notebook') {
      return Book;
    }
    
    const generatedContent = item.content as GeneratedContent;
    switch (generatedContent.type) {
      case 'notes':
        return StickyNote;
      case 'summary':
        return FileText;
      case 'flashcards':
        return CreditCard;
      case 'mindmap':
        return Network;
      case 'questions':
        return HelpCircle;
      default:
        return FileText;
    }
  };

  const getContentTypeColor = (item: LibraryItem) => {
    if (item.type === 'notebook') {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
    
    const generatedContent = item.content as GeneratedContent;
    switch (generatedContent.type) {
      case 'notes':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'summary':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'flashcards':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'mindmap':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
      case 'questions':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Access all your study materials and generated content
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            {showFavoritesOnly ? <Star className="h-4 w-4 mr-2" /> : <StarOff className="h-4 w-4 mr-2" />}
            Favorites
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {filteredSourceGroups.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Book className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No content found</h3>
                <p className="text-muted-foreground text-center">
                  {searchQuery 
                    ? `No content matches your search "${searchQuery}"`
                    : "Your library is empty. Generate some content using Smart Study Hub!"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredSourceGroups.map((group, groupIndex) => {
                  const SourceIcon = getSourceIcon(group.inputMethod);
                  const isExpanded = expandedGroups.has(group.id);
                  
                  return (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: groupIndex * 0.05 }}
                    >
                      <Card className="overflow-hidden">
                        <CardHeader className="hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div 
                              className="flex items-center gap-3 flex-1 cursor-pointer"
                              onClick={() => toggleGroupExpansion(group.id)}
                            >
                              <div className="p-2 rounded-lg bg-primary/10">
                                <SourceIcon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg leading-tight line-clamp-1">
                                  {group.sourceTitle}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(group.updatedAt)}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditGroup(group.id, group.sourceTitle);
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Title
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteGroup(group.id);
                                    }}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Folder
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <div 
                                className="cursor-pointer"
                                onClick={() => toggleGroupExpansion(group.id)}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        
                        {isExpanded && (
                          <CardContent className="pt-0">
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {group.items.map((item, itemIndex) => {
                                const Icon = getContentIcon(item);
                                const generatedContent = item.type === 'generated-content' ? item.content as GeneratedContent : null;
                                
                                return (
                                  <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: itemIndex * 0.05 }}
                                  >
                                    <Card 
                                      className="cursor-pointer hover:shadow-md transition-all group h-full"
                                      onClick={() => onViewContent(item)}
                                    >
                                      <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                          <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                                              <Icon className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <CardTitle className="text-sm leading-tight line-clamp-2">
                                                {item.title}
                                              </CardTitle>
                                              <div className="flex items-center gap-2 mt-1">
                                                <Badge 
                                                  variant="secondary" 
                                                  className={`text-xs ${getContentTypeColor(item)}`}
                                                >
                                                  {generatedContent?.type}
                                                </Badge>
                                                {item.isFavorite && (
                                                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleToggleFavorite(item.id);
                                            }}
                                          >
                                            {item.isFavorite ? (
                                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                            ) : (
                                              <StarOff className="h-3 w-3" />
                                            )}
                                          </Button>
                                        </div>
                                      </CardHeader>
                                      <CardContent className="pt-0">
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                          {item.description}
                                        </p>
                                        
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                          <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(item.createdAt)}
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Eye className="h-3 w-3" />
                                            View
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Folder Dialog */}
      <Dialog open={editingGroup !== null} onOpenChange={handleCancelEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder Title</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="folder-title" className="text-sm font-medium">
                Folder Title
              </label>
              <Input
                id="folder-title"
                value={editGroupTitle}
                onChange={(e) => setEditGroupTitle(e.target.value)}
                placeholder="Enter folder title..."
                className="mt-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveEdit();
                  } else if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={!editGroupTitle.trim()}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletingGroup !== null} onOpenChange={handleCancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this folder? This action will permanently remove the folder and all its contents. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Folder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
