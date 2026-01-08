import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../hooks/useMockData";
import { useEmployerData } from "../hooks/useEmployerData";

const EmployerOnboarding = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    location: '',
    description: '',
    company_size: ''  // Changed from companySize to company_size to match backend
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Use CompanyContext for company operations
  const { 
    getOnboardingStatus, 
    completeOnboarding,
    loading: companyLoading,
    error: companyError,
    clearError
  } = useCompany();

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      // Clear any previous errors
      setError('');
      clearError();

      // Check onboarding status using CompanyContext method
      const status = await getOnboardingStatus();

      if (!status.needs_onboarding) {
        // Already completed onboarding - redirect to homepage
        navigate('/employerhomepage');
      } else {
        // Show onboarding form
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setError(error.message || 'Failed to load onboarding status. Please try again.');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRadioChange = (value) => {
    setFormData(prev => ({
      ...prev,
      company_size: value  // Changed from companySize to company_size
    }));
  };

  const handleContinue = async () => {
    setError('');
    clearError(); // Clear any previous company errors
    
    // Basic validation
    if (!formData.location || !formData.description || !formData.company_size) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Map frontend values to backend enum values
      const mappedData = {
        location: formData.location.trim(),
        description: formData.description.trim(),
        company_size: mapCompanySize(formData.company_size)
      };

      console.log('Submitting onboarding data:', mappedData);

      // Use CompanyContext method to complete onboarding
      const result = await completeOnboarding(mappedData);
      
      if (result.company || result.success !== false) {
        console.log('Onboarding completed successfully:', result);
        // Onboarding successful - redirect to homepage
        navigate('/employerhomepage');
      } else {
        setError('Failed to complete onboarding. Please try again.');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      setError(error.message || 'An error occurred during onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Map frontend values to backend CompanySizeEnum values
  const mapCompanySize = (value) => {
    const mapping = {
      'just-me': 'Me',
      'micro': 'Micro',
      'small': 'Small',
      'medium': 'Medium',
      'large': 'Large'
    };
    return mapping[value] || value;
  };

  const companySizeOptions = [
    { value: 'just-me', label: "It's just me" },
    { value: 'micro', label: 'Micro' },
    { value: 'small', label: 'Small Corporation' },
    { value: 'medium', label: 'Medium Corporation' },
    { value: 'large', label: 'Large Corporation' }
  ];

  // Loading state while checking onboarding status (combine both loading states)
  if (isLoading || companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your profile...</p>
        </div>
      </div>
    );
  }

  // Combine errors from both contexts
  const displayError = error || companyError;

  return (
    <div className="min-h-screen bg-[#FEFEFF]">         
      <div className="bg-[#F9F9F9] shadow-lg min-h-[128px]">
        <div className="w-full px-0">
          <div className="flex justify-start items-center">            
            <div className="flex items-center mt-10 ml-[112px]">
            </div>
          </div>
        </div>
      </div>      
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-[36px] font-bold text-[#9B1C31] mb-2">
            Let's get you hiring
          </h1>
          <p className="text-[16px] text-[#3C3B3B] font-semibold">
            Answer a few questions to start posting jobs and finding the right candidates.
          </p>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <span>{displayError}</span>
              <button 
                onClick={() => {
                  setError('');
                  clearError();
                }}
                className="ml-4 text-red-700 hover:text-red-900 font-semibold"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        
        {/* Form Card */}
        <div className="bg-[#FEFEFF] rounded-[24px] shadow-2xl mx-auto border border-gray-100" style={{width: '1152px', height: '438px'}}>
          <h2 className="text-[24px] font-bold text-[#9B1C31] mb-10 mt-4 text-center">
            Company Information
          </h2>
          
          <div className="grid grid-cols-2 gap-16">
            <div className="space-y-8 ml-24">
              <div>
                <label className="block text-[16px] font-semibold text-[#3C3B3B] mb-3">
                  Location of the Company *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#6B7280] rounded-[8px] focus:ring-2 focus:ring-[#9B1C31] focus:border-[#9B1C31] outline-none transition-colors text-[14px]"
                  placeholder="City, Country"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-[14px] font-semibold text-[#3C3B3B] mb-3">
                  Brief Description of the Company *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="6"
                  className="w-full px-4 py-3 border-2 border-[#6B7280] rounded-[8px] focus:ring-2 focus:ring-[#9B1C31] focus:border-[#9B1C31] outline-none transition-colors resize-none text-[14px]"
                  placeholder="Tell us about your company..."
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-[16px] font-semibold text-[#3C3B3B] mb-6">
                How many people are in your company? *
              </label>
              <div className="space-y-4 ml-32">
                {companySizeOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center cursor-pointer group ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`}
                    onClick={() => !isSubmitting && handleRadioChange(option.value)}
                  >
                    <input
                      type="radio"
                      name="company_size"
                      value={option.value}
                      checked={formData.company_size === option.value}
                      onChange={() => handleRadioChange(option.value)}
                      className="sr-only"
                      disabled={isSubmitting}
                    />
                    <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${
                      formData.company_size === option.value
                        ? 'border-[#9B1C31] bg-white'
                        : 'border-[#D1D5DB] bg-white group-hover:border-[#9B1C31]'
                    }`}>
                      {formData.company_size === option.value && (
                        <div className="w-4 h-4 rounded-full bg-[#9B1C31]"></div>
                      )}
                    </div>
                    <span className={`text-[14px] text-[#3C3B3B] font-semibold transition-colors ${
                      formData.company_size === option.value
                        ? 'text-[#374151]'
                        : 'text-[#374151] group-hover:text-[#9B1C31]'
                    }`}>
                      {option.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>         
          </div>
        </div>

        {/* Continue Button - Outside the form */}
        <div className="flex justify-end max-w-4xl mx-auto mt-8">
          <button
            onClick={handleContinue}
            disabled={isSubmitting || companyLoading}
            className={`font-semibold px-8 py-3 rounded-[8px] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#9B1C31] focus:ring-offset-2 text-[14px] ${
              isSubmitting || companyLoading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-[#9B1C31] hover:bg-[#7D1628] text-white'
            }`}
          >
            {isSubmitting || companyLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Completing...
              </div>
            ) : (
              'Continue'
            )}
          </button>
        </div>

        {/* Skip Option */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => navigate('/employerhomepage')}
            disabled={isSubmitting || companyLoading}
            className="text-sm text-[#9B1C31] hover:text-[#7D1628] underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployerOnboarding;