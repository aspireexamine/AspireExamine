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

// Initialize default folders for new users
export const initializeDefaultFolders = (userId: string): void => {
  const existingFolders = getLibraryFolders(userId);
  
  if (existingFolders.length === 0) {
    const now = new Date().toISOString();
    
    const defaultFolders: LibraryFolder[] = [
      {
        id: `folder_generated_${userId}`,
        name: 'Generated Content',
        description: 'Content created using Smart Study Hub',
        items: [],
        createdAt: now,
        updatedAt: now,
        isSystemFolder: true
      },
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
