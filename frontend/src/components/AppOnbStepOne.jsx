import React, { useState, useEffect, useRef } from "react";
import SoftwareDev from '../assets/SoftwareDev.png';
import DataScience from '../assets/DataScience.png';
import CyberSec from '../assets/CyberSec.png';
import Infrastructure from '../assets/Infrastructure.png';
import UIUX from '../assets/UIUX.png';
import AIML from '../assets/AIML.png';
import ApplicantWorkExpPopup from './ApplicantWorkExpPopup';
import ApplicantWorkExpCard from './ApplicantWorkExpCard';
import TextField from './TextField'; // Import the new TextField component
import StepProgressFooter from './StepProgressFooter'; // Import the StepProgressFooter component
import { flattenUserDetails } from '../utils/userUtils';

function AppOnbStepOne({
  step,
  segment,
  onNext,
  onBack,
  onSkip, // <-- Add onSkip prop
  userDetails,
  setUserDetails, // Function to update userDetails state
  fetchUserDetails, // Injected fetch function
  saveUserDetails,  // Injected save function
}) {
  const [selectedField, setSelectedField] = useState(null);
  const [showWorkExpPopup, setShowWorkExpPopup] = useState(false);
  const [errors, setErrors] = useState({});
  const [preferredWorkSetting, setPreferredWorkSetting] = useState("");
  const [preferredWorkType, setPreferredWorkType] = useState("");
  const popupRef = useRef(null);

  // Close popup on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowWorkExpPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch user details on component mount
  useEffect(() => {
    const loadUserDetails = async () => {
      const data = await fetchUserDetails(false); // or simply fetchUserDetails()
      setUserDetails(data);
    };
    loadUserDetails();
  }, [fetchUserDetails]);

  const handleCardClick = (field) => {
    setSelectedField(field); // Update the selected field state
    setUserDetails((prev) => ({
      ...prev,
      field, // Update the field in userDetails
    }));
  };

  const validateFields = () => {
    const newErrors = {};

    // Validate Contact Details
    if (!userDetails.contactDetails.currentAddress.trim()) newErrors.currentAddress = "Current Address is required.";
    if (!userDetails.contactDetails.contactNumber.trim()) newErrors.contactNumber = "Contact Number is required.";
    if (!userDetails.contactDetails.telephoneNumber.trim()) newErrors.telephoneNumber = "Telephone Number is required.";

    // Validate Educational Background
    if (!userDetails.educationDetails.university.trim()) newErrors.university = "University is required.";
    if (!userDetails.educationDetails.degree.trim()) newErrors.degree = "Degree is required.";
    if (!userDetails.educationDetails.yearGraduated.trim()) newErrors.yearGraduated = "Year Graduated is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleContinue = async () => {
    if (step === 2 && segment === 9) {
      if (!preferredWorkSetting || !preferredWorkType) {
        alert("Please select both work setting and work type.");
        return;
      }
      // Update parent state with all onboarding data
      const updatedUserDetails = {
        ...userDetails,
        skills,
        softSkills: softSkillsTags,
        certifications,
        proficiency,
      };
      setUserDetails(updatedUserDetails);
      await saveUserDetails(flattenUserDetails(updatedUserDetails));
      onNext();
    } else if (step === 2 && segment === 10) {
      navigate("/ApplicantProfile");
    } else {
      onNext();
    }
  };

  const handleSaveWorkExperience = (workExperience) => {
    setUserDetails((prev) => ({
      ...prev,
      workExperiences: [...prev.workExperiences, workExperience],
    }));
  };

  const handleDeleteWorkExperience = (workExperience) => {
    setUserDetails((prev) => ({
      ...prev,
      workExperiences: prev.workExperiences.filter((exp) => exp !== workExperience),
    }));
  };

  const handleInputChange = (section, field, value) => {
    setUserDetails((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const cardOptions = [
    { title: "Software Development", image: SoftwareDev, value: "Software Development" },
    { title: "Infrastructure & System", image: Infrastructure, value: "Infrastructure & System" },
    { title: "AI & ML", image: AIML, value: "AI and Machine Learning" },
    { title: "Data Science", image: DataScience, value: "Data Science" },
    { title: "Cybersecurity", image: CyberSec, value: "Cybersecurity" },
    { title: "UI/UX", image: UIUX, value: "UI/UX" },
  ];


  return (
    <div className="w-full h-screen font-montserrat overflow-hidden relative">
      <main className="pt-[80px] px-[112px]">
        {/* === Step 1: Segment 1 === */}
        {step === 1 && segment === 1 && (
          <div className="flex flex-col items-center space-y-10">
            {/* === Header Text === */}
            <div className="relative w-full">
              {/* Back Button */}
              

              {/* Header Text */}
              <div className="text-center">
                <h2 className="text-4xl text-[#047857] font-bold mb-[10px]">Let's get you started, User!</h2>
                <p className="text-base text-gray-600">Answer a few questions and start setting up your profile</p>
              </div>
            </div>

            {/* === Segment 1 Content === */}
            <div className="grid grid-cols-2 gap-10 font-montserrat">
              {/* Contact Details */}
              <div className="mt-[74px] mb-[70px] bg-white w-[560px] p-8 px-10 rounded-2xl shadow-all-around border space-y-5">
                <h3 className="text-2xl font-bold text-[#047857]">Contact Details</h3>
                <TextField
                  label="Current Address"
                  value={userDetails.contactDetails.currentAddress}
                  onChange={(e) => handleInputChange("contactDetails", "currentAddress", e.target.value)}
                  error={errors.currentAddress}
                />
                <TextField
                  label="Contact Number"
                  value={userDetails.contactDetails.contactNumber}
                  onChange={(e) => handleInputChange("contactDetails", "contactNumber", e.target.value)}
                  error={errors.contactNumber}
                />
                <TextField
                  label="Telephone Number"
                  value={userDetails.contactDetails.telephoneNumber}
                  onChange={(e) => handleInputChange("contactDetails", "telephoneNumber", e.target.value)}
                  error={errors.telephoneNumber}
                />
              </div>

              {/* Educational Background */}
              <div className="mt-[74px] mb-[70px] bg-white w-[560px] p-8 px-10 rounded-2xl shadow-all-around border space-y-5">
                <h3 className="text-2xl font-bold text-[#047857]">Educational Background</h3>
                <TextField
                  label="University"
                  value={userDetails.educationDetails.university}
                  onChange={(e) => handleInputChange("educationDetails", "university", e.target.value)}
                  error={errors.university}
                />
                <TextField
                  label="Degree"
                  value={userDetails.educationDetails.degree}
                  onChange={(e) => handleInputChange("educationDetails", "degree", e.target.value)}
                  error={errors.degree}
                />
                <TextField
                  label="Year Graduated"
                  value={userDetails.educationDetails.yearGraduated}
                  onChange={(e) => handleInputChange("educationDetails", "yearGraduated", e.target.value)}
                  error={errors.yearGraduated}
                />
              </div>
            </div>
          </div>
        )}

        {/* === Step 1: Segment 2 === */}
        {step === 1 && segment === 2 && (
          <div className="flex flex-col items-center space-y-10">
            {/* === Header Text === */}
            <div className="relative w-full mb-4">
              {/* Back Button */}
              <button
                onClick={onBack}
                className="absolute left-0 top-0 flex items-center text-[#047857] hover:text-[#065F46] font-medium"
              >
                <i className="bi bi-arrow-left mr-2 text-4xl"></i>
              </button>

              {/* Header Text */}
              <h2 className="text-4xl text-[#047857] font-bold text-center">Select the field you belong to</h2>
              <p className="text-base text-gray-600 text-center">Answer a few questions and start setting up your profile</p>
            </div>

            {/* === Segment Cards === */}
            <div className="grid grid-cols-3 gap-10 font-montserrat">
              {cardOptions.map((card) => (
                <div
                  key={card.value}
                  onClick={() => handleCardClick(card.value)}
                  className={`bg-white max-w-[200px] h-[220px] p-8 px-10 rounded-2xl shadow-all-around border cursor-pointer 
                    flex flex-col items-center justify-center space-y-5 text-center
                    ${selectedField === card.value ? 'border-[#047857]' : 'border-gray-200'}
                  `}
                >
                  <img src={card.image} alt={card.title} className="mx-auto" />
                  <span className="text-lg font-semibold text-[#047857]">{card.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === Step 1: Segment 3 === */}
        {step === 1 && segment === 3 && (
          <div className="flex flex-col items-center space-y-10">
            {/* Header Text */}
            <div className="relative w-full mb-4">
              <button
                onClick={onBack}
                className="absolute left-0 top-0 flex items-center text-[#047857] hover:text-[#065F46] font-medium"
              >
                <i className="bi bi-arrow-left mr-2 text-4xl"></i>
              </button>
              <h2 className="text-4xl text-[#047857] font-bold text-center">
                If you have relevant work experience, add it here.
              </h2>
              <p className="text-base text-gray-600 text-center">
                Answer a few questions and start setting up your profile
              </p>
            </div>

            {/* Work Experience Section */}
            <div className="flex w-full justify-center">
              <div className="flex gap-6 overflow-x-auto scrollbar-hide">
                {/* Add Work Experience Button */}
                <div
                  onClick={() => setShowWorkExpPopup(true)} // Show popup on click
                  className="mt-[74px] mb-[140px] flex-shrink-0 w-[416px] h-[325px] p-8 px-10 rounded-2xl border border-dashed border-gray-400 space-y-5
                      flex flex-col items-center justify-center cursor-pointer hover:shadow-all-around transition-all"
                >
                  <div className="flex flex-row items-center justify-center space-x-4">
                    <i className="bi bi-plus-circle text-2xl text-[#047857]" />
                    <h3 className="text-2xl font-bold text-[#047857] text-center">Add work experience</h3>
                  </div>
                </div>

              <div className="flex flex-row gap-6 mt-[74px] mb-[70px]">
                {/* Map Work Experiences */}
                {userDetails.workExperiences.map((workExperience, index) => (
                  <ApplicantWorkExpCard
                    key={index}
                    workExperience={workExperience}
                    onDelete={handleDeleteWorkExperience}
                  />
                ))}
              </div>
            </div>
          </div>
          </div>
        )}
      </main>

      {/* Popup Component */}
      {showWorkExpPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={popupRef} // Attach the ref to the popup container
            className="bg-emerald-50 p-6 rounded-[20px] shadow-lg w-[600px] relative"
          >
            <button
              onClick={() => setShowWorkExpPopup(false)} // Close popup on click
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <i className="bi bi-x-lg"></i>
            </button>
            <ApplicantWorkExpPopup
              onSave={handleSaveWorkExperience} // Pass the save handler
              onCancel={() => setShowWorkExpPopup(false)} // Close popup on cancel
            />
          </div>
        </div>
      )}

      {/* Step Progress Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 mb-[37px]">
        <StepProgressFooter
          step={step}
          segment={segment}
          onContinue={handleContinue} // <-- this calls saveUserDetails and then onNext
          onSkip={onSkip}
        />
      </div>
    </div>
  );
}

export default AppOnbStepOne;