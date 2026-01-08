// Mock user service functions

const mockUserDetails = {
  contactDetails: {
    currentAddress: "#1 Kurt St. Brgy. Mapagmahal Silang, Cavite",
    contactNumber: "0992 356 7294",
    telephoneNumber: "8153-4137",
  },
  educationDetails: {
    university: "Polytechnic University of the Philippines",
    degree: "Bachelor of Science in Computer Science",
    yearGraduated: "2027",
  },
  workExperiences: [],
  field: "",
  preferred_worksetting: "Remote",
  preferred_worktype: "Full-Time",
};

export const fetchUserDetails = async () => {
  return new Promise((resolve) => setTimeout(() => resolve(mockUserDetails), 200));
};

export const saveUserDetails = async (userDetails) => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 200));
};

export const saveCertificates = async (certifications) => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 200));
};

export const saveProficiency = async (proficiencyObjOrArr) => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 200));
};

export const saveUserSkills = async (skills) => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 200));
};
