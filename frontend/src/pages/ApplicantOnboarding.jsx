import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppOnbStepOne from "../components/AppOnbStepOne";
import AppOnbStepTwo from "../components/AppOnbStepTwo";
import StepProgressFooter from "../components/StepProgressFooter";

import { fetchUserDetails, saveUserDetails } from "../utils/userService";
import { useAuth } from "../hooks/useMockData";
import { flattenUserDetails } from "../utils/userUtils";

function ApplicantOnboarding() {
  const [step, setStep] = useState(1);
  const [segment, setSegment] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [userDetails, setUserDetails] = useState({
    contactDetails: {
      currentAddress: "",
      contactNumber: "",
      telephoneNumber: "",
    },
    educationDetails: {
      university: "",
      degree: "",
      yearGraduated: "",
    },
    field: "",
    preferred_worksetting: "",
    preferred_worktype: "",
    // ...add more as needed
  });
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/applicant-sign-in");
      return;
    }
    // Skip onboarding check - use static flow
    setIsLoading(false);
  }, [navigate, loading, user]);

  const totalSegments = step === 2 ? 9 : 2;

  const handleNextSegment = () => {
    if (step === 2 && segment === 9) {
      console.log("Onboarding completed - Redirecting to Sign In");
      navigate("/applicant-sign-in");
    } else if (segment < totalSegments) {
      setSegment((prev) => prev + 1);
    } else {
      setSegment(1);
      setStep((prev) => prev + 1);
    }
  };

  const handleBackSegment = () => {
    if (segment > 1) {
      setSegment((prev) => prev - 1);
    } else if (step > 1) {
      setStep((prev) => prev - 1);
      setSegment(step === 2 ? 2 : 9);
    }
  };

  const handleSkipSegment = () => {
    if (step === 2 && segment === 9) {
      console.log("Onboarding skipped - Redirecting to Sign In");
      navigate("/applicant-sign-in");
    } else if (segment < totalSegments) {
      setSegment((prev) => prev + 1);
    } else {
      setSegment(1);
      setStep((prev) => prev + 1);
    }
  };

  const saveUserDetailsHandler = async (details) => {
    const success = await saveUserDetails(details);
    if (success) {
      console.log("User details saved successfully");
    } else {
      console.error("Failed to save user details");
    }
    return success;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
          <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        );  
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="w-full h-[100px] pl-[112px] pt-[24px] pb-[24px] bg-white shadow-md z-10 relative">
      </div>
      <div className="flex-grow flex flex-col items-center overflow-y-auto px-4 bg-gray-50">
        {step === 1 && (
          <AppOnbStepOne
            step={step}
            segment={segment}
            onNext={handleNextSegment}
            onBack={handleBackSegment}
            onSkip={handleSkipSegment}
            userDetails={userDetails}
            setUserDetails={setUserDetails}
            fetchUserDetails={fetchUserDetails}
            saveUserDetails={saveUserDetails}
          />
        )}
        {step === 2 && (
          <AppOnbStepTwo
            step={step}
            segment={segment}
            onNext={handleNextSegment}
            onBack={handleBackSegment}
            onSkip={handleSkipSegment}
            userDetails={userDetails}
            setUserDetails={setUserDetails}
            saveUserDetails={saveUserDetails}
          />
        )}
      </div>
    </div>
  );
}

export default ApplicantOnboarding;
