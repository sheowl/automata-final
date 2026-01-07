import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployerSideBar from '../components/EmployerSideBar';
import ApplicantDashLogo from '../assets/ApplicantDashLogo.svg';
import { useCompany } from '../context/CompanyContext';
import { useAuth } from '../context/AuthContext';

const CompanyPage = () => {
  const navigate = useNavigate();
  
  // ⭐ ADD AUTH CONTEXT
  const { 
    isEmployer, 
    isAuthenticated,
    loading: authLoading 
  } = useAuth();
  
  // Use the custom hook instead of useContext
  const { 
    companyProfile, 
    getCompanyProfile, 
    loading: companyLoading, 
    error 
  } = useCompany();

  const socialPlatforms = [
    { key: 'linkedin', name: 'LinkedIn', icon: 'bi-linkedin' },
    { key: 'instagram', name: 'Instagram', icon: 'bi-instagram' },
    { key: 'facebook', name: 'Facebook', icon: 'bi-facebook' },
    { key: 'github', name: 'GitHub', icon: 'bi-github' },
    { key: 'telegram', name: 'Telegram', icon: 'bi-telegram' },
    { key: 'viber', name: 'Viber', icon: 'bi-whatsapp' }
  ];

  // Get social links from company profile - change to contact_links
  const socialLinks = companyProfile?.contact_links || {};
  
  const activeSocialPlatforms = socialPlatforms.filter(platform => 
    socialLinks[platform.key] && socialLinks[platform.key].trim() !== ''
  );

  // ⭐ ADD AUTH CHECK AND DATA LOADING
  useEffect(() => {
    if (!authLoading) { // ⭐ Only run when AuthContext is done loading
      checkAuthAndLoadData();
    }
  }, [authLoading]); // ⭐ Add authLoading dependency

  const checkAuthAndLoadData = async () => {
    try {
      console.log("🔍 CompanyPage Auth check - Loading:", authLoading, "Authenticated:", isAuthenticated(), "Employer:", isEmployer());
      
      // ⭐ Wait for auth context to finish loading
      if (authLoading) {
        console.log("⏳ Auth context still loading, waiting...");
        return;
      }

      // Check if user is authenticated and is an employer
      if (!isAuthenticated()) {
        console.log("❌ Not authenticated, redirecting to sign-in");
        navigate('/employer-sign-in');
        return;
      }

      if (!isEmployer()) {
        console.log("❌ Not an employer, redirecting to sign-in");
        navigate('/employer-sign-in');
        return;
      }

      console.log("✅ Auth check passed, loading company profile");
      // Load company profile if not already loaded
      if (!companyProfile) {
        await getCompanyProfile();
      }
      
    } catch (error) {
      console.error("Error checking auth or loading data:", error);
      navigate('/employer-sign-in');
    }
  };

  // Use companyProfile instead of companyData
  const companyData = companyProfile;

  const handleEditProfile = () => {
    navigate('/edit-company-profile');
  };

  // ⭐ UPDATED: Show loading state while AuthContext OR company data is loading
  if (authLoading || companyLoading) {
    return (
      <div className="min-h-screen bg-[#9B1C31] flex flex-col">
        <EmployerSideBar />
        <div className="flex-1 bg-[#FEFEFF] rounded-t-[40px] overflow-y-auto p-6 shadow-md">
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#9B1C31] mx-auto"></div>
              <p className="mt-4 text-gray-600">
                {authLoading ? 'Verifying authentication...' : 'Loading company profile...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#9B1C31] flex flex-col">
        <EmployerSideBar />
        <div className="flex-1 bg-[#FEFEFF] rounded-t-[40px] overflow-y-auto p-6 shadow-md">
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
              <button 
                onClick={() => getCompanyProfile()}
                className="mt-4 bg-[#9B1C31] text-white px-4 py-2 rounded hover:bg-[#7D1628]"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#9B1C31] flex flex-col">
      <EmployerSideBar />
      <div className="flex-1 bg-[#FEFEFF] rounded-t-[40px] overflow-y-auto p-6 shadow-md">        
        <div className="flex justify-between items-center p-4 pl-[112px] pr-[118px] mt-8">
          <div className="flex items-center gap-8">
            <img 
              src={ApplicantDashLogo} 
              alt="Dashboard Logo" 
              className="w-[136px] h-[84px]"
            />
            <h1 className="text-[48px] font-bold text-[#9B1C31] -mb-1">Company Profile</h1>
          </div>
        </div>        
          
        {/* Content */}
        <main className="flex-1 px-8 pb-8 mt-16">
          <div className="max-w-6xl mx-auto">            
            {/* Company Profile Section */}
            <div className="bg-white border-2 rounded-3xl shadow-xl p-16 mb-6">
              <div className="flex gap-8 items-start">
                {/* Left side - Company Logo and Info stacked vertically */}
                <div className="flex flex-col items-center text-center space-y-6 flex-shrink-0">                  
                  {/* Company Logo */}
                  <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                    {companyData?.logo ? (
                      <img 
                        src={companyData.logo} 
                        alt="Company Logo" 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <i className="bi bi-building text-gray-500 text-5xl"></i>
                    )}
                  </div>                  
                  {/* Company Info */}
                  <div>
                    <h2 className="text-[24px] font-semibold text-[#3C3B3B] mb-2 truncate max-w-[300px]" title={companyData?.company_name || companyData?.name}>
                      {companyData?.company_name || companyData?.name || 'Company Name'}
                    </h2>
                    <p className="text-[#6C6C6C] text-[16px] font-semibold mb-1">
                      {companyData?.location || 'Location not specified'}
                    </p>
                    <p className="text-[#3C3B3B] text-[15px] font-bold">
                      {companyData?.company_size || companyData?.type || 'Industry not specified'}
                    </p>
                  </div>
                </div>

                {/* Right side - Company Description */}
                <div className="flex-1 ml-8">
                  <h3 className="text-[24px] font-semibold text-[#3C3B3B] mb-3 mt-8">Company Description</h3>
                  <p className="text-[#676767] text-[16px] font-semibold leading-relaxed">
                    {companyData?.description || 'No company description available.'}
                  </p>
                </div>
              </div>
            </div>            
            
            {/* Company Links Section */}
            <div className="bg-white items-center border-2 rounded-3xl shadow-xl p-8 mb-6">              
              <h3 className="text-[24px] font-semibold text-[#3C3B3B] mb-4">Company Links</h3>
              {activeSocialPlatforms.length > 0 ? (
                <div className="flex gap-4 flex-wrap justify-center">
                  {activeSocialPlatforms.map((platform) => (
                    <button 
                      key={platform.key}
                      onClick={() => window.open(socialLinks[platform.key], '_blank')}
                      className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-[40px] hover:bg-gray-800 transition-colors"
                    >
                      <i className={`bi ${platform.icon}`}></i>
                      {platform.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>No social media links added yet.</p>
                  <p className="text-sm mt-2">Click "Edit Profile" to add your company's social media links.</p>
                </div>
              )}
            </div>
            
            {/* Edit Profile Button */}
            <div className="flex justify-end mt-6">
              <button 
                onClick={handleEditProfile}
                className="text-[#9B1C31] text-[16px] px-6 py-2 rounded-lg hover:text-[#7D1628] hover:underline transition-colors font-semibold"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompanyPage;
