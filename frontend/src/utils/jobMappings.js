// Fallback category mapping (in case database is not available)
const FALLBACK_CATEGORIES = {
  1: "Web Development",
  2: "Programming Languages", 
  3: "Databases",
  4: "AI/ML/Data Science",
  5: "DevOps",
  7: "Cybersecurity",
  8: "Mobile Development",
  9: "Soft Skills"
};

// Fallback proficiency mapping
const FALLBACK_PROFICIENCY_LEVELS = {
  1: "Level 1: Novice",
  2: "Level 2: Advanced Beginner",
  3: "Level 3: Competent", 
  4: "Level 4: Proficient",
  5: "Level 5: Expert"
};

// Category mapping with fallback
export const getCategoryName = (categoryId, categoryMapping = null) => {
  if (categoryMapping) {
    return categoryMapping[categoryId] || "No Category";
  }
  return FALLBACK_CATEGORIES[categoryId] || "No Category";
};

// Proficiency mapping (static - assuming this doesn't change often)
export const getProficiencyLevel = (proficiencyId) => {
  return FALLBACK_PROFICIENCY_LEVELS[proficiencyId] || "No Proficiency";
};

// Work setting mapping
export const getWorkSetting = (setting) => {
  const settings = {
    "hybrid": "Hybrid",
    "remote": "Remote",
    "onsite": "On-site",
    "on-site": "On-site"
  };
  return settings[setting?.toLowerCase()] || setting || "Remote";
};

// Work type mapping
export const getWorkType = (workType) => {
  const types = {
    "part-time": "Part-Time",
    "full-time": "Full-Time",
    "fulltime": "Full-Time",
    "contractual": "Contractual",
    "internship": "Internship"
  };
  return types[workType?.toLowerCase()] || workType || "Contractual";
};

// Helper functions for dropdown options using dynamic data
export const getCategoryOptions = (categoryMapping = null) => {
  const mapping = categoryMapping || FALLBACK_CATEGORIES;
  return Object.entries(mapping)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([id, name]) => ({
      value: parseInt(id),
      label: name
    }));
};

export const getProficiencyOptions = () => {
  return Object.entries(FALLBACK_PROFICIENCY_LEVELS)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([id, level]) => ({
      value: parseInt(id),
      label: level
    }));
};

// Export all mappings as an object for easier importing
export const JobMappings = {
  getCategoryName,
  getProficiencyLevel,
  getWorkSetting,
  getWorkType,
  getCategoryOptions,
  getProficiencyOptions
};

// Export constants for backward compatibility (fallback values)
export const CATEGORIES = FALLBACK_CATEGORIES;
export const PROFICIENCY_LEVELS = FALLBACK_PROFICIENCY_LEVELS;

export const WORK_SETTINGS = {
  "hybrid": "Hybrid",
  "remote": "Remote",
  "onsite": "On-site",
  "on-site": "On-site"
};

export const WORK_TYPES = {
  "part-time": "Part-Time",
  "full-time": "Full-Time",
  "fulltime": "Full-Time",
  "contractual": "Contractual",
  "internship": "Internship"
};