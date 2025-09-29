import { GeneratedContent, LibraryItem, LibraryFolder, GeneratedContentType, InputMethod, GeneratedContentData } from '@/types';

// Local storage keys
const GENERATED_CONTENT_KEY = 'aspire_generated_content';
const LIBRARY_ITEMS_KEY = 'aspire_library_items';
const LIBRARY_FOLDERS_KEY = 'aspire_library_folders';

// Generated Content Storage
export const saveGeneratedContent = (content: GeneratedContent): void => {
  try {
    const existingContent = getGeneratedContent();
    const updatedContent = [...existingContent, content];
    localStorage.setItem(GENERATED_CONTENT_KEY, JSON.stringify(updatedContent));
  } catch (error) {
    console.error('Error saving generated content:', error);
  }
};

export const getGeneratedContent = (userId?: string): GeneratedContent[] => {
  try {
    const content = localStorage.getItem(GENERATED_CONTENT_KEY);
    const parsedContent = content ? JSON.parse(content) : [];
    
    if (userId) {
      return parsedContent.filter((item: GeneratedContent) => item.userId === userId);
    }
    
    return parsedContent;
  } catch (error) {
    console.error('Error retrieving generated content:', error);
    return [];
  }
};

export const updateGeneratedContent = (id: string, updates: Partial<GeneratedContent>): void => {
  try {
    const existingContent = getGeneratedContent();
    const updatedContent = existingContent.map((item: GeneratedContent) =>
      item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    );
    localStorage.setItem(GENERATED_CONTENT_KEY, JSON.stringify(updatedContent));
  } catch (error) {
    console.error('Error updating generated content:', error);
  }
};

export const deleteGeneratedContent = (id: string): void => {
  try {
    const existingContent = getGeneratedContent();
    const updatedContent = existingContent.filter((item: GeneratedContent) => item.id !== id);
    localStorage.setItem(GENERATED_CONTENT_KEY, JSON.stringify(updatedContent));
  } catch (error) {
    console.error('Error deleting generated content:', error);
  }
};

// Library Items Storage
export const saveLibraryItem = (item: LibraryItem): void => {
  try {
    const existingItems = getLibraryItems();
    const updatedItems = [...existingItems, item];
    localStorage.setItem(LIBRARY_ITEMS_KEY, JSON.stringify(updatedItems));
  } catch (error) {
    console.error('Error saving library item:', error);
  }
};

export const getLibraryItems = (userId?: string): LibraryItem[] => {
  try {
    const items = localStorage.getItem(LIBRARY_ITEMS_KEY);
    const parsedItems = items ? JSON.parse(items) : [];
    
    if (userId) {
      return parsedItems.filter((item: LibraryItem) => item.userId === userId);
    }
    
    return parsedItems;
  } catch (error) {
    console.error('Error retrieving library items:', error);
    return [];
  }
};

export const updateLibraryItem = (id: string, updates: Partial<LibraryItem>): void => {
  try {
    const existingItems = getLibraryItems();
    const updatedItems = existingItems.map((item: LibraryItem) =>
      item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    );
    localStorage.setItem(LIBRARY_ITEMS_KEY, JSON.stringify(updatedItems));
  } catch (error) {
    console.error('Error updating library item:', error);
  }
};

export const deleteLibraryItem = (id: string): void => {
  try {
    const existingItems = getLibraryItems();
    const updatedItems = existingItems.filter((item: LibraryItem) => item.id !== id);
    localStorage.setItem(LIBRARY_ITEMS_KEY, JSON.stringify(updatedItems));
  } catch (error) {
    console.error('Error deleting library item:', error);
  }
};

export const deleteLibraryItemsBySource = (userId: string, inputMethod: string, inputSource: string): void => {
  try {
    const existingItems = getLibraryItems();
    const updatedItems = existingItems.filter((item: LibraryItem) => {
      if (item.userId !== userId || item.type !== 'generated-content') {
        return true;
      }
      
      const generatedContent = item.content as GeneratedContent;
      return !(generatedContent.inputMethod === inputMethod && generatedContent.inputSource === inputSource);
    });
    localStorage.setItem(LIBRARY_ITEMS_KEY, JSON.stringify(updatedItems));
  } catch (error) {
    console.error('Error deleting library items by source:', error);
  }
};

export const removeDuplicateLibraryItems = (userId: string): void => {
  try {
    const existingItems = getLibraryItems(userId);
    const seen = new Set<string>();
    const uniqueItems: LibraryItem[] = [];
    
    // Sort by creation date to keep the most recent version
    const sortedItems = existingItems.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    for (const item of sortedItems) {
      if (item.type === 'generated-content') {
        const generatedContent = item.content as GeneratedContent;
        
        // Create multiple unique keys to catch different types of duplicates
        const key1 = `${item.userId}_${generatedContent.inputMethod}_${generatedContent.inputSource}_${generatedContent.type}`;
        const key2 = `${item.userId}_${generatedContent.inputMethod}_${generatedContent.type}_${item.title}`;
        const key3 = `${item.userId}_${generatedContent.type}_${item.title}`;
        
        // Check if any of these keys have been seen
        if (!seen.has(key1) && !seen.has(key2) && !seen.has(key3)) {
          seen.add(key1);
          seen.add(key2);
          seen.add(key3);
          uniqueItems.push(item);
        }
      } else {
        // For non-generated content, use title and type as unique key
        const uniqueKey = `${item.userId}_${item.type}_${item.title}`;
        if (!seen.has(uniqueKey)) {
          seen.add(uniqueKey);
          uniqueItems.push(item);
        }
      }
    }
    
    // Update storage with unique items
    const allItems = getLibraryItems();
    const otherUsersItems = allItems.filter(item => item.userId !== userId);
    const updatedItems = [...otherUsersItems, ...uniqueItems];
    localStorage.setItem(LIBRARY_ITEMS_KEY, JSON.stringify(updatedItems));
  } catch (error) {
    console.error('Error removing duplicate library items:', error);
  }
};

export const clearAllDuplicates = (userId: string): void => {
  try {
    // Get all items for the user
    const allItems = getLibraryItems();
    const userItems = allItems.filter(item => item.userId === userId);
    const otherUsersItems = allItems.filter(item => item.userId !== userId);
    
    // Group items by title and type to find exact duplicates
    const groupedItems = new Map<string, LibraryItem[]>();
    
    userItems.forEach(item => {
      const key = `${item.title}_${item.type}`;
      if (!groupedItems.has(key)) {
        groupedItems.set(key, []);
      }
      groupedItems.get(key)!.push(item);
    });
    
    // Keep only the most recent item from each group
    const uniqueItems: LibraryItem[] = [];
    groupedItems.forEach(items => {
      if (items.length > 0) {
        // Sort by creation date and keep the most recent
        const sortedItems = items.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        uniqueItems.push(sortedItems[0]);
      }
    });
    
    // Update storage
    const updatedItems = [...otherUsersItems, ...uniqueItems];
    localStorage.setItem(LIBRARY_ITEMS_KEY, JSON.stringify(updatedItems));
  } catch (error) {
    console.error('Error clearing all duplicates:', error);
  }
};

// Library Folders Storage
export const saveLibraryFolder = (folder: LibraryFolder): void => {
  try {
    const existingFolders = getLibraryFolders();
    const updatedFolders = [...existingFolders, folder];
    localStorage.setItem(LIBRARY_FOLDERS_KEY, JSON.stringify(updatedFolders));
  } catch (error) {
    console.error('Error saving library folder:', error);
  }
};

export const getLibraryFolders = (userId?: string): LibraryFolder[] => {
  try {
    const folders = localStorage.getItem(LIBRARY_FOLDERS_KEY);
    const parsedFolders = folders ? JSON.parse(folders) : [];
    
    if (userId) {
      return parsedFolders.filter((folder: LibraryFolder) => 
        folder.items.some(item => item.userId === userId)
      );
    }
    
    return parsedFolders;
  } catch (error) {
    console.error('Error retrieving library folders:', error);
    return [];
  }
};

export const updateLibraryFolder = (id: string, updates: Partial<LibraryFolder>): void => {
  try {
    const existingFolders = getLibraryFolders();
    const updatedFolders = existingFolders.map((folder: LibraryFolder) =>
      folder.id === id ? { ...folder, ...updates, updatedAt: new Date().toISOString() } : folder
    );
    localStorage.setItem(LIBRARY_FOLDERS_KEY, JSON.stringify(updatedFolders));
  } catch (error) {
    console.error('Error updating library folder:', error);
  }
};

export const deleteLibraryFolder = (id: string): void => {
  try {
    const existingFolders = getLibraryFolders();
    const updatedFolders = existingFolders.filter((folder: LibraryFolder) => folder.id !== id);
    localStorage.setItem(LIBRARY_FOLDERS_KEY, JSON.stringify(updatedFolders));
  } catch (error) {
    console.error('Error deleting library folder:', error);
  }
};

// Utility Functions
export const createLibraryItemFromGeneratedContent = (content: GeneratedContent): LibraryItem => {
  return {
    id: `lib_${content.id}`,
    userId: content.userId,
    type: 'generated-content',
    title: content.title,
    description: `Generated ${content.type} from ${content.inputMethod}`,
    createdAt: content.createdAt,
    updatedAt: content.updatedAt,
    tags: content.tags,
    isFavorite: content.isFavorite,
    content: content
  };
};

export const createGeneratedContentFromSmartStudyHub = (
  userId: string,
  title: string,
  type: GeneratedContentType,
  inputMethod: InputMethod,
  inputSource: string,
  contentData: GeneratedContentData,
  tags?: string[]
): GeneratedContent => {
  const now = new Date().toISOString();
  
  return {
    id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    title,
    type,
    inputMethod,
    inputSource,
    content: contentData,
    createdAt: now,
    updatedAt: now,
    tags,
    isFavorite: false
  };
};

export const getLibraryItemsByType = (userId: string, type: 'notebook' | 'generated-content'): LibraryItem[] => {
  return getLibraryItems(userId).filter(item => item.type === type);
};

export const getLibraryItemsByContentType = (userId: string, contentType: GeneratedContentType): LibraryItem[] => {
  return getLibraryItems(userId).filter(item => 
    item.type === 'generated-content' && 
    (item.content as GeneratedContent).type === contentType
  );
};

export const searchLibraryItems = (userId: string, query: string): LibraryItem[] => {
  const items = getLibraryItems(userId);
  const lowercaseQuery = query.toLowerCase();
  
  return items.filter(item => 
    item.title.toLowerCase().includes(lowercaseQuery) ||
    item.description?.toLowerCase().includes(lowercaseQuery) ||
    item.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const getFavoriteLibraryItems = (userId: string): LibraryItem[] => {
  return getLibraryItems(userId).filter(item => item.isFavorite);
};

// Group library items by source
export interface SourceGroup {
  id: string;
  sourceTitle: string;
  inputMethod: InputMethod;
  inputSource: string;
  items: LibraryItem[];
  createdAt: string;
  updatedAt: string;
}

export const groupLibraryItemsBySource = (userId: string): SourceGroup[] => {
  const items = getLibraryItems(userId);
  const generatedItems = items.filter(item => item.type === 'generated-content');
  
  // Group by inputMethod and inputSource combination
  const sourceMap = new Map<string, SourceGroup>();
  
  generatedItems.forEach(item => {
    const generatedContent = item.content as GeneratedContent;
    const sourceKey = `${generatedContent.inputMethod}_${generatedContent.inputSource}`;
    
    if (!sourceMap.has(sourceKey)) {
      sourceMap.set(sourceKey, {
        id: `source_${sourceKey.replace(/[^a-zA-Z0-9]/g, '_')}_${userId}`,
        sourceTitle: getSourceTitle(generatedContent.inputMethod, generatedContent.inputSource),
        inputMethod: generatedContent.inputMethod,
        inputSource: generatedContent.inputSource,
        items: [],
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      });
    }
    
    const sourceGroup = sourceMap.get(sourceKey)!;
    sourceGroup.items.push(item);
    
    // Update timestamps to reflect the most recent item
    if (new Date(item.updatedAt) > new Date(sourceGroup.updatedAt)) {
      sourceGroup.updatedAt = item.updatedAt;
    }
  });
  
  // Convert map to array and sort by most recent update
  return Array.from(sourceMap.values()).sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
};

export const groupLibraryItemsBySourceWithAITitles = async (userId: string): Promise<SourceGroup[]> => {
  const items = getLibraryItems(userId);
  const generatedItems = items.filter(item => item.type === 'generated-content');
  
  // Group by inputMethod and inputSource combination
  const sourceMap = new Map<string, SourceGroup>();
  
  generatedItems.forEach(item => {
    const generatedContent = item.content as GeneratedContent;
    const sourceKey = `${generatedContent.inputMethod}_${generatedContent.inputSource}`;
    
    if (!sourceMap.has(sourceKey)) {
      sourceMap.set(sourceKey, {
        id: `source_${sourceKey.replace(/[^a-zA-Z0-9]/g, '_')}_${userId}`,
        sourceTitle: getSourceTitle(generatedContent.inputMethod, generatedContent.inputSource),
        inputMethod: generatedContent.inputMethod,
        inputSource: generatedContent.inputSource,
        items: [],
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      });
    }
    
    const sourceGroup = sourceMap.get(sourceKey)!;
    sourceGroup.items.push(item);
    
    // Update timestamps to reflect the most recent item
    if (new Date(item.updatedAt) > new Date(sourceGroup.updatedAt)) {
      sourceGroup.updatedAt = item.updatedAt;
    }
  });
  
  // Generate AI titles for each source group
  const sourceGroups = Array.from(sourceMap.values());
  
  // Process AI title generation in parallel
  const titlePromises = sourceGroups.map(async (group) => {
    try {
      // Get the first item's content to analyze
      const firstItem = group.items[0];
      if (firstItem && firstItem.type === 'generated-content') {
        const generatedContent = firstItem.content as GeneratedContent;
        
        // Extract content from the generated content
        let contentToAnalyze = '';
        if (generatedContent.content.notes) {
          contentToAnalyze = generatedContent.content.notes.title + ' ' + 
            generatedContent.content.notes.sections.map(s => s.heading + ' ' + s.content).join(' ');
        } else if (generatedContent.content.summary) {
          contentToAnalyze = generatedContent.content.summary.overview + ' ' + 
            generatedContent.content.summary.keyPoints.join(' ');
        } else if (generatedContent.content.flashcards) {
          contentToAnalyze = generatedContent.content.flashcards.map(f => f.front + ' ' + f.back).join(' ');
        } else if (generatedContent.content.mindmap) {
          contentToAnalyze = generatedContent.content.mindmap.title + ' ' + 
            generatedContent.content.mindmap.centralTopic + ' ' +
            generatedContent.content.mindmap.branches.map(b => b.label).join(' ');
        } else if (generatedContent.content.questions) {
          contentToAnalyze = generatedContent.content.questions.map(q => q.question).join(' ');
        }
        
        const aiTitle = await generateAISourceTitle(
          group.inputMethod, 
          group.inputSource, 
          contentToAnalyze || group.inputSource
        );
        
        group.sourceTitle = aiTitle;
      }
    } catch (error) {
      console.error('Error generating AI title for group:', error);
      // Keep the original title if AI generation fails
    }
    
    return group;
  });
  
  const groupsWithAITitles = await Promise.all(titlePromises);
  
  // Sort by most recent update
  return groupsWithAITitles.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
};

export const getSourceTitle = (inputMethod: InputMethod, inputSource: string): string => {
  switch (inputMethod) {
    case 'youtube':
      return `YouTube: ${inputSource.length > 50 ? inputSource.substring(0, 50) + '...' : inputSource}`;
    case 'file':
      return `Document: ${inputSource}`;
    case 'text':
      return `Text: ${inputSource.length > 30 ? inputSource.substring(0, 30) + '...' : inputSource}`;
    case 'image':
      return `Image: ${inputSource}`;
    case 'scan':
      return `Scanned: ${inputSource}`;
    default:
      return inputSource;
  }
};

export const generateAISourceTitle = async (inputMethod: InputMethod, inputSource: string, content?: string): Promise<string> => {
  try {
    // Import the AI service dynamically to avoid circular dependencies
    const { aiChatService } = await import('@/services/aiChatService');
    
    // Use the content if available, otherwise use the input source
    const contentToAnalyze = content || inputSource;
    
    return await aiChatService.generateFolderTitle(contentToAnalyze, inputMethod, inputSource);
  } catch (error) {
    console.error('Error generating AI title:', error);
    // Fallback to the original function
    return getSourceTitle(inputMethod, inputSource);
  }
};

// Initialize default folders for new users
export const initializeDefaultFolders = (userId: string): void => {
  const existingFolders = getLibraryFolders(userId);
  
  if (existingFolders.length === 0) {
    const now = new Date().toISOString();
    
    const defaultFolders: LibraryFolder[] = [
      {
        id: `folder_favorites_${userId}`,
        name: 'Favorites',
        description: 'Your favorite library items',
        items: [],
        createdAt: now,
        updatedAt: now,
        isSystemFolder: true
      }
    ];
    
    defaultFolders.forEach(folder => saveLibraryFolder(folder));
  }
};
