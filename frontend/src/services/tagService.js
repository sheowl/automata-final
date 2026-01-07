const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

class TagService {
  async getAllCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/tags/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }

      const categories = await response.json();
      console.log('Fetched categories from database:', categories);
      return categories;
    } catch (error) {
      console.error('TagService: Error fetching categories:', error);
      throw error;
    }
  }

  async getAllTags() {
    try {
      const response = await fetch(`${API_BASE_URL}/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tags: ${response.status} ${response.statusText}`);
      }

      const tags = await response.json();
      console.log('Fetched tags from database:', tags);
      return tags;
    } catch (error) {
      console.error('TagService: Error fetching tags:', error);
      throw error;
    }
  }

  async getTagsByCategory(categoryId) {
    try {
      const response = await fetch(`${API_BASE_URL}/tags/category/${categoryId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tags for category: ${response.status} ${response.statusText}`);
      }

      const tags = await response.json();
      console.log(`Fetched tags for category ${categoryId}:`, tags);
      return tags;
    } catch (error) {
      console.error('TagService: Error fetching tags by category:', error);
      throw error;
    }
  }

  // Transform database categories to mapping format
  transformCategoriesToMapping(categories) {
    const categoryMapping = {};
    categories.forEach(category => {
      categoryMapping[category.category_id] = category.category_name;
    });
    return categoryMapping;
  }

  // Transform database tags to mapping format
  transformTagsToMapping(tags) {
    const tagMapping = {};
    
    tags.forEach(tag => {
      if (!tagMapping[tag.category_id]) {
        tagMapping[tag.category_id] = {};
      }
      tagMapping[tag.category_id][tag.tag_id] = tag.tag_name;
    });

    return tagMapping;
  }

  // Get flat tag mapping (tag_id: tag_name)
  transformTagsToFlat(tags) {
    const flatMapping = {};
    tags.forEach(tag => {
      flatMapping[tag.tag_id] = tag.tag_name;
    });
    return flatMapping;
  }

  // Get flat category mapping (category_id: category_name)
  transformCategoriesToFlat(categories) {
    const flatMapping = {};
    categories.forEach(category => {
      flatMapping[category.category_id] = category.category_name;
    });
    return flatMapping;
  }

  // Helper method to get tag name by ID
  getTagNameById(tagId, flatTagMapping) {
    return flatTagMapping[tagId] || `Tag ${tagId}`;
  }

  // Helper method to get multiple tag names by IDs
  getTagNamesByIds(tagIds, flatTagMapping) {
    if (!Array.isArray(tagIds)) return [];
    return tagIds.map(id => this.getTagNameById(id, flatTagMapping));
  }
}

export default new TagService();