// Tag data structure for categories and their tags
// This will be used as a reference even when backend is implemented
export const TAG_CATEGORIES = {
  "Programming Languages": [
    "Python", "Java", "JavaScript", "C++", "C#", "Go", "Rust", "PHP", "TypeScript", "Ruby", "Kotlin", "Swift", "R", "Bash/Shell"
  ],
  "AI/ML/Data Science": [
    "TensorFlow", "PyTorch", "NumPy", "Keras", "Pandas", "Scikit-Learn", "Jupyter Notebooks", "Matplotlib/Seaborn", "OpenCV", "Natural Language Processing", "Model Deployment (e.g., ONNX)"
  ],
  "Web Development": [
    "HTML", "CSS", "Tailwind CSS", "React", "Vue", "Next", "Svelte", "Express", "Bootstrap", "Angular"
  ],
  "DevOps": [
    "AWS", "Docker", "Apache", "Microsoft Azure", "Kubernetes", "Terraform", "NGINX", "Google Cloud Platform (GCP)", "Linux Server Management", "CI/CD (GitHub Actions, Jenkins, etc.)"
  ],
  "Mobile Development": [
    "React Native", "Flutter", "Android (Java/Kotlin)", "iOS (Swift)", "Dart"
  ],
  "Databases": [
    "MySQL", "PostgreSQL", "MongoDB", "SQLite", "Cassandra", "DynamoDB", "Redis", "Firebase"
  ],
  "Cybersecurity": [
    "Penetration Testing", "Metasploit", "OWASP Top 10", "Wireshark", "Security Auditing", "Network Security", "SIEM (e.g., Splunk)"
  ],
  "Soft Skills": [
    "Communication", "Leadership", "Team Collaboration", "Time Management", "Problem Solving", "Adaptability", "Critical Thinking"
  ]
};

// Category mapping for backend integration
export const CATEGORY_IDS = {
  "Programming Languages": 1,
  "AI/ML/Data Science": 2,
  "Web Development": 3,
  "DevOps": 4,
  "Mobile Development": 5,
  "Databases": 6,
  "Cybersecurity": 7,
  "Soft Skills": 8
};

// Helper function to get category name by ID
export const getCategoryById = (categoryId) => {
  const entry = Object.entries(CATEGORY_IDS).find(([_, id]) => id === categoryId);
  return entry ? entry[0] : "Unknown Category";
};

// Helper function to get all tags as flat array
export const getAllTags = () => {
  return Object.values(TAG_CATEGORIES).flat();
};

// Helper function to get tags by category name
export const getTagsByCategory = (categoryName) => {
  return TAG_CATEGORIES[categoryName] || [];
};

// Helper function to get category for a specific tag
export const getCategoryForTag = (tagName) => {
  for (const [category, tags] of Object.entries(TAG_CATEGORIES)) {
    if (tags.includes(tagName)) {
      return category;
    }
  }
  return null;
};

export default TAG_CATEGORIES;
