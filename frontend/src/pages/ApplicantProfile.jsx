import ApplicantSideBar from "../components/ApplicantSideBar";
import { useState, useEffect } from "react";
import ApplicantHeader from "../components/ApplicantHeader";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import { useTags } from "../context/TagsContext";
import LoadContent from "../components/LoadContent";

function ApplicantProfile() {
  const { user, loading } = useAuth();
  const { getTagsByCategories, flatTagMapping } = useTags();
  const [isEditMode, setIsEditMode] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // NEW: State for real data
  const [workExperience, setWorkExperience] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [proficiencyData, setProficiencyData] = useState([]);
  const [applicantTags, setApplicantTags] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // ADD THESE MISSING STATE VARIABLES:
  const [technicalSkills, setTechnicalSkills] = useState([]);
  const [softSkills, setSoftSkills] = useState([]);

  // Keep existing state...
  const [zoomedCertificate, setZoomedCertificate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeField, setActiveField] = useState(""); 
  
  const [linkValues, setLinkValues] = useState({
    github: "",
    linkedin: "",
    portfolio: "",
  });

  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("profileImage") || null
  );

  // ADD: Fetch functions for real data
  const fetchWorkExperience = async (token) => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/applicants/me/experience", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setWorkExperience(data);
        console.log("Work experience fetched:", data);
      }
    } catch (error) {
      console.error("Failed to fetch work experience:", error);
    }
  };

  const fetchCertificates = async (token) => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/applicants/me/certificates", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCertificates(data);
        console.log("Certificates fetched:", data);
      }
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
    }
  };

  const fetchProficiency = async (token) => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/applicants/me/proficiency", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProficiencyData(data);
        console.log("Proficiency data fetched:", data);
      }
    } catch (error) {
      console.error("Failed to fetch proficiency data:", error);
    }
  };

  const fetchApplicantTags = async (token, applicantId) => {
    try {
      // Get applicant's tags
      const response = await fetch(`http://localhost:8000/api/v1/tags/applicant/${applicantId}/tags`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const applicantTags = await response.json();
        console.log("Raw applicant tags fetched:", applicantTags);
        
        // Get all available tags with category info
        const allTagsResponse = await fetch(`http://localhost:8000/api/v1/tags`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (allTagsResponse.ok) {
          const allTags = await allTagsResponse.json();
          console.log("All available tags:", allTags);
          
          // Enrich applicant tags with category information
          const enrichedTags = applicantTags.map(appTag => {
            const fullTag = allTags.find(tag => tag.tag_id === appTag.tag_id);
            return {
              ...appTag,
              category_id: fullTag?.category_id || null
            };
          });
          
          setApplicantTags(enrichedTags);
          console.log("Enriched applicant tags with categories:", enrichedTags);
        }
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  };

  // ADD: Data processing functions
  const getCategoryNameById = (categoryId) => {
    const categoryMap = {
      1: "Web Development",        // ✅ Fixed - was Programming Languages
      2: "Programming Languages",  // ✅ Fixed - was Web Development  
      3: "Databases",             // ✅ Fixed - was AI/ML/Data Science
      4: "AI/ML/Data Science",    // ✅ Fixed - was Databases
      5: "DevOps",
      7: "Cybersecurity", 
      8: "Mobile Development",
      9: "Soft Skills"
    };
    return categoryMap[categoryId] || "Other";
  };

  const getProficiencyLevel = (proficiencyValue) => {
    const levelMap = {
      1: "Novice",
      2: "Advanced Beginner", 
      3: "Competent",
      4: "Proficient",
      5: "Expert"
    };
    return levelMap[proficiencyValue] || "Unknown";
  };

  const formatWorkExperience = (experiences) => {
    return experiences.map(exp => ({
      title: exp.position,
      company: exp.company,
      date: `${new Date(exp.start_date).toLocaleDateString()} - ${exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Present'}`,
      responsibilities: exp.description ? exp.description.split(';').filter(r => r.trim()) : []
    }));
  };

  const groupProficiencyByCategory = (proficiencyData, tags) => {
    const grouped = {};
    
    // Filter out soft skills (category_id: 8) before processing
    const technicalProficiencyData = proficiencyData.filter(prof => prof.category_id !== 8);
    
    technicalProficiencyData.forEach(prof => {
      const categoryName = getCategoryNameById(prof.category_id);
      const level = getProficiencyLevel(prof.proficiency);
      
      // Get tags for this specific category ID directly from applicant tags
      const categoryTags = tags.filter(tag => tag.category_id === prof.category_id);
      const matchingTags = categoryTags.map(tag => tag.tag_name);

      if (matchingTags.length > 0) { // Only add if there are tags
        grouped[categoryName] = {
          label: categoryName,
          level: level.toLowerCase(),
          tags: matchingTags.slice(0, 5) // Limit to 5 tags per category
        };
      }
    });
    
    return Object.values(grouped);
  };

  const getSoftSkillsFromTags = (tags) => {
    // Get tags organized by categories from TagsContext
    const tagsByCategories = getTagsByCategories();
    const softSkillsFromContext = tagsByCategories["Soft Skills"] || [];
    
    // Filter applicant tags that match soft skills category
    const applicantTagNames = tags.map(tag => tag.tag_name);
    const matchingSoftSkills = softSkillsFromContext
      .filter(tag => applicantTagNames.includes(tag.tag_name))
      .map(tag => ({ label: tag.tag_name }));
    
    return matchingSoftSkills;
  };

  // Existing functions...
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem("profileImage", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    localStorage.removeItem("profileImage");
  };

  const getButtonClass = (field) => {
  if (!isEditMode) {
    // Always solid when not editing
    return "bg-[#047857] text-white border border-[#047857] transition-all duration-300 ease-in-out";
  }
  // Edit mode: solid if filled, dashed if not
  const isFilled = linkValues[field];
  return `${
    isFilled
      ? "bg-[#047857] text-white border border-[#047857]"
      : "bg-white text-[#047857] border border-dashed border-[#047857]"
  } transition-all duration-300 ease-in-out`;
};


  const truncate = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const ProgressBar = ({ label, level, tags = [] }) => {
    const getSkillLevel = () => {
      switch (level.toLowerCase()) {
        case "novice":
          return 20;
        case "advanced beginner":
          return 40;
        case "competent":
          return 60;
        case "proficient":
          return 80;
        case "expert":
          return 100;
        default:
          return 0;
      }
    };

    const numericLevel = getSkillLevel();

    return (
      <div className="mb-4 space-y-2">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-semibold text-base text-neutral-600">{label}</h4>
          <span className="text-sm text-gray-500 capitalize">{level}</span>
        </div>
        <div className="w-full h-[10px] bg-emerald-100 rounded-full">
          <div
            className="h-full bg-[#047857] rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${numericLevel}%` }}
          ></div>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs text-neutral-700 font-semibold bg-[#EFEEEE] py-1 px-3 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

const CertificateCard = ({ image, title, description, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="min-w-[218px] min-h-[290px] max-w-[218px] rounded-lg border border-gray-300 p-4 shadow-sm hover:border-[#6B7280] 
      transition-transform duration-300 ease-in-out flex flex-col items-center text-center cursor-pointer"
    >
      <div className="w-full min-h-[110px] bg-[#D9D9D9] rounded-md mb-4 overflow-hidden">
        {image && (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        )}
      </div>
      <h3 className="font-semibold text-base text-neutral-700">
        {title.length > 20 ? `${title.slice(0, 20)}...` : title}
      </h3>
      <p className="text-xs text-gray-500 mt-2">
        {description.length > 140 ? `${description.slice(0, 140)}...` : description}
      </p>
    </div>
  );
};

  useEffect(() => {
    const fetchAllData = async () => {
      if (!user) return;
      
      setIsLoadingProfile(true);
      setIsLoadingData(true);

      try {
        const token = (await supabase.auth.getSession()).data.session.access_token;
        
        // Fetch profile first
        const profileResponse = await fetch("http://localhost:8000/api/v1/applicants/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfile(profileData);
          console.log("Profile data fetched:", profileData);
          
          // Fetch all other data in parallel
          await Promise.all([
            fetchWorkExperience(token),
            fetchCertificates(token),
            fetchProficiency(token),
            fetchApplicantTags(token, profileData.applicant_id)
          ]);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoadingProfile(false);
        setIsLoadingData(false);
      }
    };

    if (user) fetchAllData();
  }, [user]);

  useEffect(() => {
    if (applicantTags.length > 0 && proficiencyData.length > 0) {
      // Process technical skills (excluding soft skills)
      const groupedTechnical = groupProficiencyByCategory(proficiencyData, applicantTags);
      setTechnicalSkills(groupedTechnical);
      
      // Process soft skills separately
      const softSkillsData = getSoftSkillsFromTags(applicantTags);
      setSoftSkills(softSkillsData);
    }
  }, [applicantTags, proficiencyData]);

  if (loading || isLoadingProfile || isLoadingData) {
    return (
      <div className="min-h-screen bg-[#047857] flex flex-col">
        <ApplicantSideBar />
        <div className="flex-1 bg-white rounded-t-[40px] overflow-y-auto p-6">
          <LoadContent message="Loading your profile..." />
        </div>
      </div>
    );
  }

  // Process the real data
  const experienceData = formatWorkExperience(workExperience);

  // Map profile fields to your layout
  const contactInfo = [
    { label: "Full Name", value: (profile?.first_name || "") + " " + (profile?.last_name || "") },
    { label: "Location", value: profile?.current_address || "" },
    { label: "Contact Number", value: profile?.contact_number || "" },
    { label: "Email", value: profile?.email || profile?.applicant_email || "" },
  ];

  const personalInfoLeft = [
    { label: "Name", value: (profile?.first_name || "") + " " + (profile?.last_name || "") },
    { label: "Mobile Number", value: profile?.contact_number || "" },
    { label: "University", value: profile?.university || "" },
    { label: "Year Graduated", value: profile?.year_graduated || "" },
  ];

  const personalInfoRight = [
    { label: "Address", value: profile?.current_address || "" },
    { label: "Telephone Number", value: profile?.telephone_number || "" },
    { label: "Degree", value: profile?.degree || "" },
    { label: "Field", value: profile?.field || "" },
  ];

  return (
    <div className="min-h-screen bg-[#047857] flex flex-col">
      <ApplicantSideBar />

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-t-[40px] overflow-y-auto p-6 shadow-md font-montserrat">
        {/* Header */}
        <ApplicantHeader
          title="User Profile"
          showProfile={false}
          showSearchBar={false}
        />

        {/* Profile Content */}
        <div className="flex flex-col space-y-7 justify-center items-center w-full">
          <div className="relative w-full max-w-[976px] h-[220px] rounded-[20px] shadow-all-around flex items-center gap-8 bg-white p-10">
          {/* Edit Icon */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {isEditMode && (
              <span className="text-sm font-semibold text-gray-500]">
                In Edit Mode
              </span>
            )}
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className="text-gray-500 hover:text-[#047857]"
              title={isEditMode ? "Exit Edit Mode" : "Edit Profile"}
            >
              <i className="bi bi-pencil-square text-xl" />
            </button>
          </div>

            {/* Profile Picture */}
            <div className="relative flex-shrink-0">
            {isEditMode ? (
              <>
              <label className="cursor-pointer relative block">
                <div className="w-[150px] h-[150px] rounded-full border border-gray-600 overflow-hidden flex items-center justify-center bg-white">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="bi bi-person-fill text-7xl text-gray-500"></i>
                  )}
                </div>

                    {/* Upload icon */}
                    <div className="absolute bottom-0 right-2 w-8 h-8 bg-white border border-[#047857] rounded-full flex items-center justify-center text-[#047857] text-xl">
                      <i className="bi bi-plus"></i>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                  </label>

               {/* Delete button (only if image exists) */}
              {profileImage && (
                <button
                  onClick={handleRemoveImage}
                  title="Remove Photo"
                  className="absolute top-2 right-2 bg-red-500 border border-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-100"
                >
                  <i className="bi bi-x" />
                </button>
              )

              }
              </>
            ) : (
              <div className="w-[150px] h-[150px] rounded-full border border-gray-600 overflow-hidden flex items-center justify-center bg-white">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <i className="bi bi-person-fill text-7xl text-gray-500"></i>
                )}
              </div>
            )}

          </div>

            {/* Profile Info */}
            <div className="flex flex-col justify-center flex-grow">
              <h2 className="text-2xl font-bold">{contactInfo[0].value}</h2>
              {contactInfo.slice(1).map((info, index) => (
                <div key={index} className="text-gray-600 flex items-center gap-2 mt-1">
                  <i
                    className={`bi ${
                      info.label === "Location"
                        ? "bi-geo-alt"
                        : info.label === "Contact Number"
                        ? "bi-telephone"
                        : "bi-envelope"
                    }`}
                  ></i>
                  {info.value}
                </div>
              ))}

              {/* Buttons */}
              <div className="flex gap-4 mt-4">
                <button
                  className={`${getButtonClass("github")} px-4 py-2 rounded-md flex items-center gap-2`}
                  onClick={() => {
                    if (isEditMode) {
                      setActiveField("github"); // or "linkedin", "portfolio"
                      setIsModalOpen(true);
                    } else {
                      const url = linkValues.github;
                      if (url) window.open(url.startsWith("http") ? url : `https://${url}`, "_blank");
                    }
                  }}
                >
                  <i className="bi bi-github"></i> GitHub
                </button>

                <button
                  className={`${getButtonClass("linkedin")} px-4 py-2 rounded-md flex items-center gap-2`}
                  onClick={() => {
                    if (isEditMode) {
                      setActiveField("linkedin"); // or "linkedin", "portfolio"
                      setIsModalOpen(true);
                    } else {
                      const url = linkValues.linkedin;
                      if (url) window.open(url.startsWith("http") ? url : `https://${url}`, "_blank");
                    }
                  }}
                >
                  <i className="bi bi-linkedin"></i> LinkedIn
                </button>

                <button
                  className={`${getButtonClass("portfolio")} px-4 py-2 rounded-md flex items-center gap-2`}
                  onClick={() => {
                    if (isEditMode) {
                      setActiveField("portfolio"); // or "linkedin", "portfolio"
                      setIsModalOpen(true);
                    } else {
                      const url = linkValues.portfolio;
                      if (url) window.open(url.startsWith("http") ? url : `https://${url}`, "_blank");
                    }
                  }}
                >
                  <i className="bi bi-globe"></i> Portfolio
                </button>
              </div>
            </div>
          </div>

          {/* Resume Section */}
          <div className="w-full max-w-[976px] h-auto rounded-[20px] shadow-all-around flex items-center gap-8 bg-white p-10">
            <div className="flex flex-col justify-center flex-grow space-y-4">
              <div className="text-2xl font-bold text-neutral-700">Resume</div>
              <div className="text-xl font-semibold text-neutral-700">
                Personal Information
              </div>

              {/* Two Columns */}
              <div className="grid grid-cols-2 gap-8">
                {/* First Column */}
                <div className="flex flex-col space-y-4">
                  {personalInfoLeft.map((field, index) => (
                    <div key={index} className="flex flex-col space-y-1">
                      <div className="text-gray-500 text-base font-semibold">
                        {field.label}
                      </div>
                      <div className="text-black">{field.value}</div>
                    </div>
                  ))}
                </div>

                {/* Second Column */}
                <div className="flex flex-col space-y-4">
                  {personalInfoRight.map((field, index) => (
                    <div key={index} className="flex flex-col space-y-1">
                      <div className="text-gray-500 text-base font-semibold">
                        {field.label}
                      </div>
                      <div className="text-black">{field.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-t border-gray-300 my-4" />

              <div className="text-xl font-semibold text-neutral-700">
                Experience
              </div>

              {experienceData.map((exp, index) => (
                <div key={index} className="border-l-1 border-[#047857] pl-6 mb-6">
                  <div className="flex flex-row justify-between">
                    <div className="text-base text-neutral-700 font-semibold">
                      {exp.title}
                    </div>
                    <div className="text-gray-500 text-sm font-semibold">
                      {exp.date}
                    </div>
                  </div>
                  <div className="text-gray-500 text-sm font-semibold">
                    {exp.company}
                  </div>
                  <ul className="text-gray-500 text-xs list-disc pl-6">
                    {exp.responsibilities.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}

              <hr className="border-t border-gray-300 my-4" />

              {/* Technical Skills Section - NO SOFT SKILLS HERE */}
              <div className="text-xl font-semibold text-neutral-700">Technical Skills</div>
              {technicalSkills.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {technicalSkills.map((skill, index) => (
                    <ProgressBar
                      key={index}
                      label={skill.label}
                      level={skill.level}
                      tags={skill.tags || []}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm italic mt-4">
                  No technical skills proficiency data available.
                </div>
              )}

              <hr className="border-t border-gray-300 my-4" />

              {/* Soft Skills Section - SEPARATE, NO PROFICIENCY */}
              <div className="text-xl font-semibold text-neutral-700">Soft Skills</div>
              {softSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {softSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="text-xs text-neutral-700 font-semibold bg-[#EFEEEE] py-1 px-3 rounded-full"
                    >
                      {skill.label}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm italic mt-2">
                  No soft skills data available.
                </div>
              )}
            </div>
          </div>

          {/* Certifications Section */}
          <div className="w-full max-w-[976px] h-auto rounded-[20px] shadow-all-around bg-white p-10 overflow-visible">
            <div className="text-2xl font-bold text-neutral-700 mb-8">Certifications</div>
            {certificates.length > 0 ? (
              <div className="flex flex-row gap-6 justify-start overflow-x-auto overflow-visible relative">
                {certificates.map((cert, idx) => (
                  <CertificateCard
                    key={idx}
                    title={cert.certificate_name}
                    description={cert.certificate_description || "No description available"}
                    image={cert.certificate_file_url}
                    onClick={() => setZoomedCertificate(cert)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm italic">
                No certificates added yet.
              </div>
            )}
          </div>
        </div>
        
        {/* Modal for editing links */}
        {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px] shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              Link to your {activeField.charAt(0).toUpperCase() + activeField.slice(1)} Profile
            </h2>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#047857]"
              placeholder={`https://${activeField}.com/yourusername`}
              value={linkValues[activeField]}
              onChange={(e) =>
                setLinkValues({ ...linkValues, [activeField]: e.target.value })
              }
            />
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-[#047857] text-white px-4 py-2 rounded-md"
                onClick={() => {
                  console.log(`${activeField} saved:`, linkValues[activeField]);
                  setIsModalOpen(false);
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default ApplicantProfile;