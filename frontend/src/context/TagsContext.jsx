import React, { createContext, useContext, useReducer, useEffect } from 'react';
import tagService from '../services/tagService';

const TagsContext = createContext();

// Action types
const TAGS_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_CATEGORIES: 'SET_CATEGORIES',
  SET_CATEGORY_MAPPING: 'SET_CATEGORY_MAPPING',
  SET_TAGS: 'SET_TAGS',
  SET_TAG_MAPPING: 'SET_TAG_MAPPING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial state
const initialState = {
  categories: [],
  categoryMapping: {}, // { categoryId: categoryName }
  tags: [],
  tagMapping: {}, // { categoryId: { tagId: tagName } }
  flatTagMapping: {}, // { tagId: tagName }
  loading: false,
  error: null
};

// Reducer
function tagsReducer(state, action) {
  switch (action.type) {
    case TAGS_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case TAGS_ACTIONS.SET_CATEGORIES:
      return { ...state, categories: action.payload };
    
    case TAGS_ACTIONS.SET_CATEGORY_MAPPING:
      return { ...state, categoryMapping: action.payload };
    
    case TAGS_ACTIONS.SET_TAGS:
      return { ...state, tags: action.payload };
    
    case TAGS_ACTIONS.SET_TAG_MAPPING:
      return { 
        ...state, 
        tagMapping: action.payload.byCategory,
        flatTagMapping: action.payload.flat
      };
    
    case TAGS_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    
    case TAGS_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    default:
      return state;
  }
}

// Provider component
export function TagsProvider({ children }) {
  const [state, dispatch] = useReducer(tagsReducer, initialState);

  // Load categories and tags on component mount
  useEffect(() => {
    loadCategoriesAndTags();
  }, []);

  const loadCategoriesAndTags = async () => {
    try {
      dispatch({ type: TAGS_ACTIONS.SET_LOADING, payload: true });
      
      // Fetch both categories and tags
      const [categories, tags] = await Promise.all([
        tagService.getAllCategories(),
        tagService.getAllTags()
      ]);
      
      console.log('Loaded categories:', categories);
      console.log('Loaded tags:', tags);
      
      // Set categories
      dispatch({ type: TAGS_ACTIONS.SET_CATEGORIES, payload: categories });
      
      // Transform categories to mapping format
      const categoryMapping = tagService.transformCategoriesToFlat(categories);
      dispatch({ type: TAGS_ACTIONS.SET_CATEGORY_MAPPING, payload: categoryMapping });
      
      // Set tags
      dispatch({ type: TAGS_ACTIONS.SET_TAGS, payload: tags });
      
      // Transform tags to mapping format
      const tagMapping = tagService.transformTagsToMapping(tags);
      const flatTagMapping = tagService.transformTagsToFlat(tags);
      
      dispatch({ 
        type: TAGS_ACTIONS.SET_TAG_MAPPING, 
        payload: { 
          byCategory: tagMapping, 
          flat: flatTagMapping 
        } 
      });
      
    } catch (error) {
      console.error('Error loading categories and tags:', error);
      dispatch({ type: TAGS_ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: TAGS_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Helper functions
  const getCategoryNameById = (categoryId) => {
    return state.categoryMapping[categoryId] || "Unknown Category";
  };

  const getTagsByCategory = (categoryId) => {
    return state.tagMapping[categoryId] || {};
  };

  const getTagNameById = (tagId) => {
    return state.flatTagMapping[tagId] || `Tag ${tagId}`;
  };

  const getTagNamesByIds = (tagIds) => {
    if (!Array.isArray(tagIds)) return [];
    return tagIds.map(id => getTagNameById(id));
  };

  const getCategoryOptions = () => {
    return Object.entries(state.categoryMapping)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([id, name]) => ({
        value: parseInt(id),
        label: name
      }));
  };

  // Group tags by category for display
  const getTagsByCategories = () => {
    const grouped = {};
    state.tags.forEach(tag => {
      const categoryName = state.categoryMapping[tag.category_id] || 'Other';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(tag);
    });
    return grouped;
  };

  const clearError = () => {
    dispatch({ type: TAGS_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    // State
    categories: state.categories,
    categoryMapping: state.categoryMapping,
    tags: state.tags,
    tagMapping: state.tagMapping,
    flatTagMapping: state.flatTagMapping,
    loading: state.loading,
    error: state.error,
    
    // Helper functions
    getCategoryNameById,
    getTagsByCategory,
    getTagNameById,
    getTagNamesByIds,
    getCategoryOptions,
    getTagsByCategories,
    loadCategoriesAndTags,
    clearError
  };

  return (
    <TagsContext.Provider value={value}>
      {children}
    </TagsContext.Provider>
  );
}

// Custom hook
export function useTags() {
  const context = useContext(TagsContext);
  if (!context) {
    throw new Error('useTags must be used within a TagsProvider');
  }
  return context;
}

export { TagsContext };