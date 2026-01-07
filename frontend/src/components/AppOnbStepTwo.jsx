import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TechnicalSkills from "./TechnicalSkills";
import ApplicantCertPopup from "./ApplicantCertPopup";
import ApplicantCertCard from "./ApplicantCertCard";
import StepProgressFooter from "./StepProgressFooter";
import { flattenUserDetails, mapWorkSettingToEnum, mapWorkTypeToEnum } from "../utils/userUtils"; 
import { supabase } from "../services/supabaseClient";
import { useTags } from "../context/TagsContext";

// FIXED: Updated category map to match your segment titles exactly
const categoryMap = {
  "Web Development": 1,
  "Programming Languages": 2,
  "Databases": 3,
  "AI/ML and Data Science": 4, // Changed from "AI/ML/Data Science"
  "DevOps": 5,
  "Cybersecurity": 7,
  "Mobile Development": 8,
  "Soft Skills": 9,
};

function AppOnbStepTwo({ step, segment, onNext, onBack, onSkip, userDetails, setUserDetails, saveUserDetails }) {
  const [skills, setSkills] = useState([]);
  const [proficiency, setProficiency] = useState({});
  const [softSkillsTags, setSoftSkillsTags] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [workExperiences, setWorkExperiences] = useState([]); // FIXED: Added missing state
  const [showCertPopup, setShowCertPopup] = useState(false);
  const [preferredWorkSetting, setPreferredWorkSetting] = useState("");
  const [preferredWorkType, setPreferredWorkType] = useState("");
  const popupRef = useRef(null);
  const navigate = useNavigate();
  // Get tags by categories from context
  const { getTagsByCategories, loading: tagsLoading, flatTagMapping } = useTags();
  const tagsByCategories = getTagsByCategories();
  
  // Build tagNameToId mapping from context
  const tagNameToId = {};
  Object.entries(flatTagMapping).forEach(([id, name]) => {
    tagNameToId[name] = parseInt(id);
  });

  // Get tags for each category dynamically
  const getProgrammingLanguageTags = () => {
    return tagsByCategories["Programming Languages"] || [];
  };

  const getWebDevelopmentTags = () => {
    return tagsByCategories["Web Development"] || [];
  };

  const getAiMlDataScienceTags = () => {
    return tagsByCategories["AI/ML/Data Science"] || [];
  };

  const getDatabaseTags = () => {
    return tagsByCategories["Databases"] || [];
  };

  const getDevOpsTags = () => {
    return tagsByCategories["DevOps"] || [];
  };

  const getCybersecurityTags = () => {
    return tagsByCategories["Cybersecurity"] || [];
  };

  const getMobileDevelopmentTags = () => {
    return tagsByCategories["Mobile Development"] || [];
  };

  const getSoftSkillsTags = () => {
    return tagsByCategories["Soft Skills"] || [];
  };

  // Add this debug logging in AppOnbStepTwo
  console.log("🏷️ Tags by categories:", tagsByCategories);
  console.log("🏷️ Programming Languages tags:", getProgrammingLanguageTags());
  console.log("🏷️ Web Development tags:", getWebDevelopmentTags());

  const handleAddCertification = (certification) => {
    if (certification) {
      setCertifications((prev) => [...prev, certification]);
    }
  };

  const handleDeleteCertification = (certification) => {
    setCertifications((prev) => prev.filter((cert) => cert !== certification));
  };

  // FIXED: Complete handleContinue function
  const handleContinue = async () => {
    try {
      console.log("=== ONBOARDING SAVE DEBUG ===");
      
      // Debug all data sources
      console.log("userDetails:", userDetails);
      console.log("userDetails.workExperiences:", userDetails.workExperiences);
      console.log("certifications state:", certifications);
      console.log("proficiency state:", proficiency);

      // Update userDetails with latest work settings
      const updatedUserDetails = {
        ...userDetails,
        preferred_worksetting: mapWorkSettingToEnum(preferredWorkSetting),
        preferred_worktype: mapWorkTypeToEnum(preferredWorkType),
      };
      setUserDetails(updatedUserDetails);

      console.log("Step 1: Saving main applicant info...");
      const dataToSend = flattenUserDetails(updatedUserDetails);
      console.log("🔍 Data being sent to API:", dataToSend);
      console.log("🔍 Work setting in payload:", dataToSend.preferred_worksetting);
      console.log("🔍 Work type in payload:", dataToSend.preferred_worktype);
      await saveUserDetails(dataToSend);
      console.log("Step 1: Main applicant info saved");

      console.log("Updated userDetails with work settings and types:", updatedUserDetails);

      // Save work experiences
      const workExpsToSave = userDetails.workExperiences || [];
      if (workExpsToSave.length > 0) {
        console.log("Step 2: Saving work experiences...", workExpsToSave);
        await saveWorkExperiences(workExpsToSave);
        console.log("Step 2: Work experiences saved");
      } else {
        console.log("Step 2: No work experiences to save");
      }

      // Save certificates
      if (certifications && certifications.length > 0) {
        console.log("Step 3: Saving certificates...", certifications);
        await saveCertificates(certifications);
        console.log("Step 3: Certificates saved");
      } else {
        console.log("Step 3: No certificates to save");
      }

      // Save proficiency
      console.log("Step 4: Processing proficiency data...");
      console.log("Raw proficiency data:", JSON.stringify(proficiency, null, 2));
      
      if (proficiency && Object.keys(proficiency).length > 0) {
        const proficiencyArr = [];
        Object.entries(proficiency).forEach(([key, value]) => {
          if (!isNaN(key)) return;
          const categoryId = categoryMap[key];
          if (!categoryId) {
            console.warn(`No category ID found for key: ${key}`);
            return;
          }
          const proficiencyValue = Number(value);
          if (!Number.isInteger(proficiencyValue) || proficiencyValue < 1 || proficiencyValue > 5) {
            console.warn(`Invalid proficiency value for ${key}: ${value}`);
            return;
          }
          
          proficiencyArr.push({
            category_id: categoryId,
            proficiency: proficiencyValue,
          });
        });
        
        if (proficiencyArr.length > 0) {
          console.log("Step 4: Saving proficiency...", proficiencyArr);
          await saveProficiency(proficiencyArr);
          console.log("Step 4: Proficiency saved");
        } else {
          console.log("Step 4: No valid proficiency data to save");
        }
      } else {
        console.log("Step 4: No proficiency data found");
      }

      // After proficiency is saved
      if (skills && skills.length > 0) {
        console.log("Saving technical skills...", skills);
        await saveApplicantTags(skills, false); // false = replace all tags
        console.log("Technical skills tags saved!");
      } else {
        console.log("No technical skills selected, skipping tag save.");
      }

      // ADD soft skills to existing tags (don't replace)
      if (softSkillsTags && softSkillsTags.length > 0) {
        console.log("Adding soft skills to existing tags...", softSkillsTags);
        await saveApplicantTags(softSkillsTags, true); // true = add to existing tags
        console.log("Soft skills tags added!");
      } else {
        console.log("No soft skills selected, skipping soft skills save.");
      }

      console.log("ALL ONBOARDING DATA SAVED SUCCESSFULLY!");
      onNext();
      
    } catch (error) {
      console.error("ONBOARDING SAVE ERROR:");
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      console.error("Full error:", error);

      // Show user-friendly error message
      if (error.message.includes("certificate")) {
        alert(`Failed to save certificates: ${error.message}\n\nPlease try again or contact support.`);
      } else if (error.message.includes("proficiency")) {
        alert(`Failed to save proficiency data: ${error.message}\n\nPlease try again or contact support.`);
      } else {
        alert(`Failed to save data: ${error.message}\n\nPlease try again or contact support.`);
      }
    }
  };

  // FIXED: Use Supabase tokens for all authenticated requests
  const saveWorkExperiences = async (workExperiences) => {
    try {
      console.log("=== WORK EXPERIENCE SAVE DEBUG ===");
      
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        throw new Error("No access token for work experience save");
      }
      
      console.log("Work experiences to save:", workExperiences);

      for (let i = 0; i < workExperiences.length; i++) {
        const exp = workExperiences[i];
        console.log(`\nSaving work experience ${i + 1}/${workExperiences.length}:`, exp);
        
        // Validate required fields
        if (!exp.company || !exp.position) {
          console.warn(`Missing required fields for experience ${i + 1}:`, {
            company: exp.company,
            position: exp.position
          });
          continue;
        }
        
        // Convert date format if needed
        const workExpData = {
          company: exp.company,
          position: exp.position,
          start_date: exp.start_date || `${exp.startYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`, // Convert from startMonth/startYear
          end_date: exp.end_date || `${exp.endYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`, // Convert from endMonth/endYear
          description: exp.description || exp.descriptions?.join('; ') || "", // Handle descriptions array
        };

        console.log(`Sending work experience data:`, workExpData);
        
        const response = await fetch("http://localhost:8000/api/v1/applicants/me/experience", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(workExpData),
        });
        
        console.log(`Work experience ${i + 1} response status:`, response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Work experience ${i + 1} failed:`, errorText);
          throw new Error(`Failed to save work experience ${i + 1}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log(`Work experience ${i + 1} saved:`, result);
      }
      
      console.log("ALL WORK EXPERIENCES SAVED!");
      
    } catch (error) {
      console.error("WORK EXPERIENCE SAVE ERROR:", error);
      throw error;
    }
  };

  const saveCertificates = async (certifications) => {
    try {
      console.log("=== CERTIFICATES SAVE DEBUG ===");
      
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        throw new Error("No access token for certificates save");
      }
      
      console.log("Certificates to save:", certifications);

      for (let i = 0; i < certifications.length; i++) {
        const cert = certifications[i];
        console.log(`\nSaving certificate ${i + 1}/${certifications.length}:`, cert);
        
        // Validate required fields
        if (!cert.certificate_name && !cert.name) {
          console.warn(`Missing certificate name for certificate ${i + 1}:`, cert);
          continue;
        }
        
        let certificateFileUrl = null;
        
        // ENHANCED: Handle file upload with better error handling
        if (cert.file) {
          console.log(`Uploading file for certificate ${i + 1}:`, cert.file.name);
          
          try {
            // FIXED: Better bucket handling
            if (cert.file) {
              console.log(`Uploading file for certificate ${i + 1}:`, cert.file.name);
              
              // Create unique filename
              const fileExtension = cert.file.name.split('.').pop();
              const fileName = `certificates/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
              
              console.log(`Uploading to: ${fileName}`);
              
              // Upload file to Supabase Storage directly
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('certificate-files')
                .upload(fileName, cert.file, {
                  cacheControl: '3600',
                  upsert: false
                });
          
              if (uploadError) {
                console.error(`File upload failed for certificate ${i + 1}:`, uploadError);
                console.log("Continuing without file URL");
                // Don't throw error, continue without file URL
              } else {
                console.log(`File uploaded successfully:`, uploadData);

                // Get public URL for the uploaded file
                const { data: urlData } = supabase.storage
                  .from('certificate-files')
                  .getPublicUrl(fileName);
            
                certificateFileUrl = urlData.publicUrl;
                console.log(`Public URL generated: ${certificateFileUrl}`);
              }
                
            }
            
          } catch (fileError) {
            console.error(`File handling error for certificate ${i + 1}:`, fileError);
            console.log("Continuing without file upload");
            // Continue without file URL - don't let file upload failure stop certificate save
          }
        }
        
        const certificateData = {
          certificate_name: cert.certificate_name || cert.name,
          certificate_description: cert.certificate_description || cert.description || "",
          certificate_file_url: certificateFileUrl  // Will be null if upload failed
        };
        
        console.log(`Sending certificate data:`, certificateData);
        
        const response = await fetch("http://localhost:8000/api/v1/applicants/me/certificates", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(certificateData),
        });
        
        console.log(`Certificate ${i + 1} response status:`, response.status);
        console.log(`Certificate ${i + 1} response headers:`, Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Certificate ${i + 1} failed:`, errorText);

          // Try to parse error details
          try {
            const errorJson = JSON.parse(errorText);
            console.error("Parsed certificate error:", errorJson);
          } catch (e) {
            console.log("Certificate error not JSON:", errorText);
          }
          
          throw new Error(`Failed to save certificate ${i + 1}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log(`Certificate ${i + 1} saved successfully:`, result);
      }

      console.log("ALL CERTIFICATES SAVED!");

    } catch (error) {
      console.error("CERTIFICATES SAVE ERROR:", error);
      throw error;
    }
  };

  // FIXED: Use Supabase tokens for authentication
  // Enhanced debugging version
const saveProficiency = async (proficiencyArr) => {
  try {
    console.log("=== ENHANCED PROFICIENCY DEBUG ===");
    
    // Get session info
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    
    if (!accessToken) {
      throw new Error("No access token");
    }
    
    console.log("🎫 Token exists, checking user info...");
    
    // First, get current user info to see applicant_id
    const meResponse = await fetch("http://localhost:8000/api/v1/applicants/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    
    if (meResponse.ok) {
      const userInfo = await meResponse.json();
      console.log("👤 Current user info:", userInfo);
      console.log("🆔 Applicant ID:", userInfo.applicant_id);
    } else {
      console.error("❌ Failed to get user info:", await meResponse.text());
    }
    
    // Check existing proficiencies
    const existingResponse = await fetch("http://localhost:8000/api/v1/applicants/me/proficiency", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    
    if (existingResponse.ok) {
      const existingProfs = await existingResponse.json();
      console.log("📊 Existing proficiencies:", existingProfs);
      console.log("📊 Existing categories:", existingProfs.map(p => p.category_id));
    } else {
      console.log("📊 No existing proficiencies or error:", await existingResponse.text());
    }

    // Now try saving each proficiency
    for (let i = 0; i < proficiencyArr.length; i++) {
      const prof = proficiencyArr[i];
      console.log(`\n🔄 Saving proficiency ${i + 1}/${proficiencyArr.length}:`, prof);
      
      const response = await fetch("http://localhost:8000/api/v1/applicants/me/proficiency", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category_id: prof.category_id,
          proficiency: prof.proficiency,
        }),
      });
      
      console.log(`📊 Response ${i + 1} status:`, response.status);
      console.log(`📊 Response ${i + 1} headers:`, Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Proficiency ${i + 1} failed:`, errorText);
        console.error(`❌ Failed data:`, {
          category_id: prof.category_id,
          proficiency: prof.proficiency
        });
        
        // Try to parse error details
        try {
          const errorJson = JSON.parse(errorText);
          console.error("❌ Parsed error:", errorJson);
        } catch (e) {
          console.log("❌ Error not JSON, raw text:", errorText);
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log(`✅ Proficiency ${i + 1} saved successfully:`, result);
    }
    
    console.log("🎉 ALL PROFICIENCIES SAVED!");
    
  } catch (error) {
    console.error("💥 PROFICIENCY SAVE ERROR:");
    console.error("🔍 Error type:", error.constructor.name);
    console.error("🔍 Error message:", error.message);
    console.error("🔍 Full error:", error);
    throw error;
  }
};

  const saveApplicantTags = async (skills, isAdditional = false) => {
    console.log("🏷️ Saving applicant tags...");
    console.log("🏷️ Selected skills:", skills);
    console.log("🏷️ Is additional tags:", isAdditional);
    
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    
    if (!accessToken) throw new Error("No access token");

    // Map skill/tag names to tag IDs
    const tagIds = skills.map(name => tagNameToId[name]).filter(id => id !== undefined);
    console.log("🏷️ Mapped tag IDs:", tagIds);

    // Use different endpoints based on whether this is additional tags
    const endpoint = isAdditional 
      ? "http://localhost:8000/api/v1/tags/applicant/me/add-tags"  // ADD tags
      : "http://localhost:8000/api/v1/tags/applicant/me";         // REPLACE tags

    const method = isAdditional ? "POST" : "PUT";

    console.log(`🏷️ Using ${method} ${endpoint}`);

    const response = await fetch(endpoint, {
      method: method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tag_ids: tagIds }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("🏷️ Failed to save tags:", errorText);
      throw new Error(`Failed to save applicant tags: ${errorText}`);
    }
    
    console.log("🏷️ Tags saved successfully!");
  };

  const handleSkip = () => {
    if (step === 2 && segment === 9) {
      setPreferredWorkSetting("");
      setPreferredWorkType("");
    }
    onSkip();
  };

  const Header = () => (
    <div className="relative w-full mb-4">
      <button
        onClick={onBack}
        className="absolute left-0 top-0 flex items-center text-[#047857] hover:text-[#065F46] font-medium"
      >
        <i className="bi bi-arrow-left mr-2 text-4xl"></i>
      </button>
      <div className="flex justify-center">
        <div className="text-center max-w-[1088px]">
          <h2 className="text-4xl text-[#047857] font-bold mb-[10px]">
            Select your technical skills using tags and specify your proficiency level for each.
          </h2>
          <p className="text-base text-gray-600">
            Answer a few questions and start setting up your profile
          </p>
        </div>
      </div>
    </div>
  );

  const workSettings = ["Hybrid", "Remote", "On-Site"];
  const workTypes = ["Part-Time", "Full-Time", "Contractual", "Internship"];

  function RadioGroup({ title, name, options, value, onChange, grid = false }) {
    return (
      <div className="w-[420px] bg-white rounded-[10px] shadow-all-around p-6 h-auto min-h-[240px] font-montserrat">
        <h1 className="text-2xl font-bold text-[#047857] p-6">{title}</h1>
        <div className={grid ? "grid grid-cols-2 gap-x-10 gap-y-2" : "flex flex-col space-y-2"}>
          {options.map((option) => (
            <label key={option} className="flex items-center gap-2 text-base pl-6">
              <input
                type="radio"
                name={name}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                className="accent-[#047857] w-5 h-5"
              />
              {option}
            </label>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen font-montserrat overflow-hidden relative">
      <main className="pt-[80px] px-[112px]">
        {step === 2 && segment === 1 && (
          <div className="flex flex-col items-center space-y-10">
            <Header />
            <TechnicalSkills
              title="Programming Languages"
              skills={skills}
              setSkills={setSkills}
              tags={getProgrammingLanguageTags().map(tag => tag.tag_name)} // ✅ Correct - maps to tag names
              selectedProficiency={proficiency}
              setProficiency={setProficiency}
            />
          </div>
        )}

        {step === 2 && segment === 2 && (
          <div className="flex flex-col items-center space-y-10">
            <Header />
            <TechnicalSkills
              title="Web Development"
              skills={skills}
              setSkills={setSkills}
              tags={getWebDevelopmentTags().map(tag => tag.tag_name)} // ✅ Correct - maps to tag names
              selectedProficiency={proficiency}
              setProficiency={setProficiency}
            />
          </div>
        )}

        {step === 2 && segment === 3 && (
          <div className="flex flex-col items-center space-y-10">
            <Header />
            <TechnicalSkills
              title="AI/ML and Data Science"
              skills={skills}
              setSkills={setSkills}
              tags={getAiMlDataScienceTags().map(tag => tag.tag_name)} // ✅ Correct - maps to tag names
              selectedProficiency={proficiency}
              setProficiency={setProficiency}
            />
          </div>
        )}

        {step === 2 && segment === 4 && (
          <div className="flex flex-col items-center space-y-10">
            <Header />
            <TechnicalSkills
              title="Databases"
              skills={skills}
              setSkills={setSkills}
              tags={getDatabaseTags().map(tag => tag.tag_name)} // ✅ Correct - maps to tag names
              selectedProficiency={proficiency}
              setProficiency={setProficiency}
            />
          </div>
        )}

        {step === 2 && segment === 5 && (
          <div className="flex flex-col items-center space-y-10">
            <Header />
            <TechnicalSkills
              title="DevOps"
              skills={skills}
              setSkills={setSkills}
              tags={getDevOpsTags().map(tag => tag.tag_name)} // ✅ Correct - maps to tag names
              selectedProficiency={proficiency}
              setProficiency={setProficiency}
            />
          </div>
        )}

        {step === 2 && segment === 6 && (
          <div className="flex flex-col items-center space-y-10">
            <Header />
            <TechnicalSkills
              title="Cybersecurity"
              skills={skills}
              setSkills={setSkills}
              tags={getCybersecurityTags().map(tag => tag.tag_name)} // ✅ Correct - maps to tag names
              selectedProficiency={proficiency}
              setProficiency={setProficiency}
            />
          </div>
        )}

        {step === 2 && segment === 7 && (
          <div className="flex flex-col items-center space-y-10">
            <Header />
            <TechnicalSkills
              title="Mobile Development"
              skills={skills}
              setSkills={setSkills}
              tags={getMobileDevelopmentTags().map(tag => tag.tag_name)} // ✅ Correct - maps to tag names
              selectedProficiency={proficiency}
              setProficiency={setProficiency}
            />
          </div>
        )}

        {step === 2 && segment === 8 && (
          <div className="flex flex-col items-center space-y-10">
            <Header />
            <TechnicalSkills
              title="Soft Skills"
              skills={softSkillsTags}
              setSkills={setSoftSkillsTags}
              tags={getSoftSkillsTags().map(tag => tag.tag_name)}
              showProficiency={false}
            />
          </div>
        )}

        {step === 2 && segment === 9 && (
          <div className="flex flex-col items-center space-y-10">
            <Header />
            <div className="flex flex-row gap-6 justify-center items-center">
              <RadioGroup
                title="Preferred Work Settings"
                name="workSettings"
                options={workSettings}
                value={preferredWorkSetting}
                onChange={setPreferredWorkSetting}
              />
              <RadioGroup
                title="Preferred Work Type"
                name="workType"
                options={workTypes}
                value={preferredWorkType}
                onChange={setPreferredWorkType}
                grid
              />
            </div>
          </div>
        )}

        {step === 2 && segment === 10 && (
          <div className="flex flex-col items-center space-y-10">
            <Header />
            <div
              onClick={() => setShowCertPopup(true)}
              className="mt-[74px] mb-[140px] flex-shrink-0 w-[416px] h-[200px] p-8 px-10 rounded-2xl border border-dashed border-gray-400 space-y-5
                  flex flex-col items-center justify-center cursor-pointer hover:shadow-all-around transition-all"
            >
              <div className="flex flex-row items-center justify-center space-x-4">
                <i className="bi bi-plus-circle text-2xl text-[#047857]" />
                <h3 className="text-2xl font-bold text-[#047857] text-center">Add Certification</h3>
              </div>
            </div>

            <div className="flex flex-row gap-6 mt-[74px] mb-[70px]">
              {certifications.map((certification, index) => (
                <ApplicantCertCard
                  key={index}
                  certification={certification}
                  onDelete={handleDeleteCertification}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Popup Component */}
      {showCertPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={popupRef}
            className="bg-emerald-50 p-6 rounded-[20px] shadow-lg w-[600px] relative"
          >
            <button
              onClick={() => setShowCertPopup(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <i className="bi bi-x-lg text-xl text-red-600"></i>
            </button>
            <ApplicantCertPopup
              onSave={(certification) => {
                handleAddCertification(certification);
                setShowCertPopup(false);
              }}
              onCancel={() => setShowCertPopup(false)}
            />
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-50 mb-[37px]">
        <StepProgressFooter
          step={step}
          segment={segment}
          onContinue={handleContinue}
          onSkip={handleSkip}
        />
      </div>
    </div>
  );
}

export default AppOnbStepTwo;

