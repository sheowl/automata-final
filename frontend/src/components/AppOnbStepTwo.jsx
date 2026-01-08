import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TechnicalSkills from "./TechnicalSkills";
import StepProgressFooter from "./StepProgressFooter";
import { flattenUserDetails, mapWorkSettingToEnum, mapWorkTypeToEnum } from "../utils/userUtils";
import { useTags } from "../hooks/useMockData"; 

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

  // FIXED: Complete handleContinue function
  const handleContinue = async () => {
    try {
      console.log("=== ONBOARDING SAVE DEBUG ===");
      
      // Debug all data sources
      console.log("userDetails:", userDetails);
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

      // Save proficiency
      console.log("Step 2: Processing proficiency data...");
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
      if (error.message.includes("proficiency")) {
        alert(`Failed to save proficiency data: ${error.message}\n\nPlease try again or contact support.`);
      } else {
        alert(`Failed to save data: ${error.message}\n\nPlease try again or contact support.`);
      }
    }
  };

  // FIXED: Use static data - no API calls
  const saveProficiency = async (proficiencyArr) => {
    console.log("Proficiency saved (static):", proficiencyArr);
    return Promise.resolve();
  };

  const saveApplicantTags = async (skills, isAdditional = false) => {
    console.log("🏷️ Tags saved (static):", skills);
    return Promise.resolve();
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
      </main>

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

