import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Star, 
  StarOff, 
  Book, 
  FileText, 
  StickyNote, 
  CreditCard, 
  Network, 
  HelpCircle,
  Calendar,
  Tag,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  Download
} from 'lucide-react';
import { 
  LibraryItem, 
  LibraryFolder, 
  GeneratedContent, 
  GeneratedContentType,
  Notebook 
} from '@/types';
import { 
  getLibraryItems, 
  getLibraryFolders, 
  updateLibraryItem, 
  deleteLibraryItem,
  searchLibraryItems,
  getLibraryItemsByType,
  getFavoriteLibraryItems,
  initializeDefaultFolders
} from '@/lib/libraryStorage';
import { User } from '@/types';

interface LibraryViewProps {
  user: User;
  onViewContent: (item: LibraryItem) => void;
}

export function LibraryView({ user, onViewContent }: LibraryViewProps) {
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [libraryFolders, setLibraryFolders] = useState<LibraryFolder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'notebook' | 'generated-content'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Initialize library data
  useEffect(() => {
    initializeDefaultFolders(user.id);
    loadLibraryData();
  }, [user.id]);

  const loadLibraryData = () => {
    const items = getLibraryItems(user.id);
    const folders = getLibraryFolders(user.id);
    setLibraryItems(items);
    setLibraryFolders(folders);
  };

  // Filter and search library items
  const filteredItems = useMemo(() => {
    let items = libraryItems;

    // Apply search filter
    if (searchQuery.trim()) {
      items = searchLibraryItems(user.id, searchQuery);
    }

    // Apply type filter
    if (filterType !== 'all') {
      items = items.filter(item => item.type === filterType);
    }

    // Apply favorites filter
    if (showFavoritesOnly) {
      items = items.filter(item => item.isFavorite);
    }

    // Apply tab filter
    if (selectedTab !== 'all') {
      if (selectedTab === 'favorites') {
        items = items.filter(item => item.isFavorite);
      } else if (selectedTab === 'generated') {
        items = items.filter(item => item.type === 'generated-content');
      } else if (selectedTab === 'notebooks') {
        items = items.filter(item => item.type === 'notebook');
      } else {
        // Filter by generated content type
        items = items.filter(item => 
          item.type === 'generated-content' && 
          (item.content as GeneratedContent).type === selectedTab
        );
      }
    }

    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [libraryItems, searchQuery, filterType, showFavoritesOnly, selectedTab, user.id]);

  const handleToggleFavorite = (itemId: string) => {
    const item = libraryItems.find(i => i.id === itemId);
    if (item) {
      updateLibraryItem(itemId, { isFavorite: !item.isFavorite });
      loadLibraryData();
    }
  };

  const handleDeleteItem = (itemId: string) => {
    deleteLibraryItem(itemId);
    loadLibraryData();
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
          <h1 className="text-2xl sm:text-3xl font-bold">My Library</h1>
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

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All
              </Button>
              <Button
                variant={filterType === 'generated-content' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('generated-content')}
              >
                Generated
              </Button>
              <Button
                variant={filterType === 'notebook' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('notebook')}
              >
                Notebooks
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="generated">Generated</TabsTrigger>
          <TabsTrigger value="notebooks">Notebooks</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Book className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground text-center">
                  {searchQuery 
                    ? `No items match your search "${searchQuery}"`
                    : "Your library is empty. Generate some content using Smart Study Hub!"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {filteredItems.map((item, index) => {
                  const Icon = getContentIcon(item);
                  const generatedContent = item.type === 'generated-content' ? item.content as GeneratedContent : null;
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="cursor-pointer hover:shadow-lg transition-all group h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base leading-tight line-clamp-2">
                                  {item.title}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant="secondary" 
                                    className={`text-xs ${getContentTypeColor(item)}`}
                                  >
                                    {item.type === 'notebook' ? 'Notebook' : generatedContent?.type}
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
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(item.id);
                              }}
                            >
                              {item.isFavorite ? (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              ) : (
                                <StarOff className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent 
                          className="pt-0 cursor-pointer"
                          onClick={() => onViewContent(item)}
                        >
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {item.description}
                          </p>
                          
                          {generatedContent && (
                            <div className="text-xs text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                From: {generatedContent.inputMethod}
                              </div>
                            </div>
                          )}
                          
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
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
