import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployerSideBar from '../components/EmployerSideBar';
import ApplicantDashLogo from '../assets/ApplicantDashLogo.svg';
import { useCompany } from '../context/CompanyContext';

const EditCompanyPage = () => {
  const navigate = useNavigate();
  const { companyProfile, updateCompanyProfile, getCompanyProfile, loading, error } = useCompany();
  
  const [companyData, setCompanyData] = useState({
    name: '',
    location: '',
    type: '',
    description: '',
    logo: null
  });

  const [contactUrls, setContactUrls] = useState({
    linkedin: '',
    instagram: '',
    facebook: '',
    github: '',
    telegram: '',
    viber: ''
  });

  const [contactLinks, setContactLinks] = useState({
    linkedin: false,
    instagram: false,
    facebook: false,
    github: false,
    telegram: false,
    viber: false
  });

  const [showPopup, setShowPopup] = useState(null);
  const [tempUrl, setTempUrl] = useState('');
  const [originalData, setOriginalData] = useState({});
  const [originalUrls, setOriginalUrls] = useState({});
  const [saving, setSaving] = useState(false);

  // Load company data when component mounts or when companyProfile changes
  useEffect(() => {
    if (companyProfile) {
      const profileData = {
        name: companyProfile.company_name || companyProfile.name || '',
        location: companyProfile.location || '',
        type: companyProfile.company_size || companyProfile.type || '',
        description: companyProfile.description || '',
        logo: companyProfile.logo || null
      };
      
      setCompanyData(profileData);
      setOriginalData(profileData);

      // Handle contact links - change from social_links to contact_links
      const socialData = companyProfile.contact_links || {};
      setContactUrls(socialData);
      setOriginalUrls(socialData);
      
      // Set socialLinks based on which URLs exist
      const activeSocialLinks = {};
      Object.keys(socialData).forEach(key => {
        activeSocialLinks[key] = socialData[key] && socialData[key].trim() !== '';
      });
      setContactLinks(activeSocialLinks);
    }
  }, [companyProfile]);

  const hasChanges = () => {
    return JSON.stringify(companyData) !== JSON.stringify(originalData) ||
           JSON.stringify(contactUrls) !== JSON.stringify(originalUrls);
  };

  const handleInputChange = (field, value) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setCompanyData(prev => ({
            ...prev,
            logo: e.target.result,
            logoFile: file // Store the file for upload
          }));
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select a valid image file.');
      }
    }
  };

  const handleLogoClick = () => {
    document.getElementById('logoInput').click();
  };

  const toggleSocialLink = (platform) => {
    if (contactLinks[platform]) {
      // Remove the link
      setContactLinks(prev => ({
        ...prev,
        [platform]: false
      }));
      setContactUrls(prev => ({
        ...prev,
        [platform]: ''
      }));
    } else {
      // Show popup to add link
      setShowPopup(platform);
      setTempUrl(contactUrls[platform] || '');
    }
  };

  const handleAddLink = () => {
    if (tempUrl.trim()) {
      setContactLinks(prev => ({
        ...prev,
        [showPopup]: true
      }));
      setContactUrls(prev => ({
        ...prev,
        [showPopup]: tempUrl.trim()
      }));
    }
    setShowPopup(null);
    setTempUrl('');
  };

  const handleCancelPopup = () => {
    setShowPopup(null);
    setTempUrl('');
  };

  const handleSave = async () => {
    if (!hasChanges()) return;

    try {
      setSaving(true);

      // Prepare the data for backend - use contact_links instead of social_links
      const updateData = {
        company_name: companyData.name,
        location: companyData.location,
        company_size: companyData.type,
        description: companyData.description,
        contact_links: contactUrls  // Changed from social_links to contact_links
      };

      console.log('Sending update data:', updateData);

      // Update company profile using context method
      await updateCompanyProfile(updateData);
      
      console.log('Company profile updated successfully');
      navigate('/CompanyPage');
      
    } catch (error) {
      console.error('Error updating company profile:', error);
      alert('Error updating company profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setCompanyData(originalData);
    setContactUrls(originalUrls);
    
    // Reset social links based on original URLs
    const resetSocialLinks = {};
    Object.keys(originalUrls).forEach(key => {
      resetSocialLinks[key] = originalUrls[key] && originalUrls[key].trim() !== '';
    });
    setContactLinks(resetSocialLinks);
    
    setShowPopup(null);
    setTempUrl('');
    navigate('/CompanyPage');
  };

  const socialPlatforms = [
    { key: 'linkedin', name: 'LinkedIn', icon: 'bi-linkedin' },
    { key: 'instagram', name: 'Instagram', icon: 'bi-instagram' },
    { key: 'facebook', name: 'Facebook', icon: 'bi-facebook' },
    { key: 'github', name: 'GitHub', icon: 'bi-github' },
    { key: 'telegram', name: 'Telegram', icon: 'bi-telegram' },
    { key: 'viber', name: 'Viber', icon: 'bi-whatsapp' }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#9B1C31] flex items-start overflow-hidden">
        <EmployerSideBar />
        <div className="flex-1 h-screen bg-[#FEFEFF] rounded-tl-[40px] overflow-y-auto p-2 sm:p-4 md:p-6 shadow-md w-full max-w-full">
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#9B1C31] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading company data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#9B1C31] flex items-start overflow-hidden">
      <EmployerSideBar />
      <div className="flex-1 h-screen bg-[#FEFEFF] rounded-tl-[40px] overflow-y-auto p-2 sm:p-4 md:p-6 shadow-md w-full max-w-full">        
        <div className="flex justify-between items-center p-4 pl-[112px] pr-[118px] mt-8">
          <div className="flex items-center gap-8">
            <img 
              src={ApplicantDashLogo} 
              alt="Dashboard Logo" 
              className="w-[136px] h-[84px]"
            />
            <h1 className="text-[48px] font-bold text-[#9B1C31] -mb-1">Edit Company Profile</h1>
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
                  <div className="w-[150px] h-[150px] bg-gray-300 rounded-full flex items-center justify-center relative cursor-pointer" 
                    onClick={handleLogoClick}>
                    {companyData.logo ? (
                      <img 
                        src={companyData.logo} 
                        alt="Company Logo" 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <i className="bi bi-building text-gray-500 text-5xl"></i>
                    )}
                    {/* Edit icon */}
                    <div className="absolute -bottom-2 -right-2 w-[44px] h-[44px] bg-[#9B1C31] rounded-full flex items-center justify-center cursor-pointer z-20 shadow-lg">
                      <i className="bi bi-pencil-fill text-white text-[24px]"></i>
                    </div>
                  </div>
                  
                  {/* Hidden file input */}
                  <input
                    id="logoInput"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />                  
                  <div className="w-[320px]">                    
                    <div className="-mb-2 flex items-center justify-center gap-1">
                      <input
                        type="text"
                        value={companyData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="text-[24px] font-semibold text-[#3C3B3B] text-center bg-transparent border-none outline-none focus:bg-gray-50 rounded px-2 py-1"
                        placeholder="Company Name"
                        maxLength={30}
                        title={companyData.name}
                        style={{ width: `${Math.max(100, Math.min(320, companyData.name.length * 14 + 20))}px` }}
                      />
                      <i className="bi bi-pencil-fill text-[#B4A598] text-[18px] flex-shrink-0"></i>
                    </div>                    
                    <div className="-mb-1 flex items-center justify-center gap-1">
                      <input
                        type="text"
                        value={companyData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="text-[#6C6C6C] text-[16px] font-semibold text-center bg-transparent border-none outline-none focus:bg-gray-50 rounded px-2 py-1"
                        placeholder="Company Location"
                        style={{ width: `${Math.max(100, Math.min(320, companyData.location.length * 10 + 20))}px` }}
                      />
                      <i className="bi bi-pencil-fill text-[#B4A598] text-[18px] flex-shrink-0"></i>
                    </div>
                    <div className="flex justify-center">
                      <input
                        type="text"
                        value={companyData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        className="text-[#3C3B3B] text-[15px] font-bold text-center bg-transparent border-none outline-none focus:bg-gray-50 rounded px-2 py-1"
                        placeholder="Company Type/Size"
                        style={{ width: `${Math.max(100, Math.min(320, companyData.type.length * 10 + 20))}px` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right side - Company Description */}
                <div className="flex-1 ml-8">
                  <h3 className="text-[24px] font-semibold text-[#3C3B3B] mb-3 mt-8">Company Description</h3>
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <textarea
                      value={companyData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full h-[204px] text-[#676767] text-[16px] font-semibold leading-relaxed bg-transparent border-none outline-none resize-none"
                      placeholder="Enter company description..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Company Links Section */}
            <div className="bg-white border-2 rounded-3xl shadow-xl p-8 mb-6">              
              <h3 className="text-[24px] font-semibold text-[#3C3B3B] mb-4">Company Links</h3>
              <div className="flex gap-4 flex-wrap justify-center">
                {socialPlatforms.map((platform) => (
                  <div key={platform.key}>
                    {contactLinks[platform.key] ? (
                      // Active social link
                      <button 
                        onClick={() => toggleSocialLink(platform.key)}
                        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors relative group"
                        title={contactUrls[platform.key]}
                      >
                        <i className={`bi ${platform.icon}`}></i>
                        {platform.name}
                        <i className="bi bi-x text-white ml-2 group-hover:text-[#9B1C31]"></i>
                      </button>
                    ) : (
                      // Placeholder for adding social link
                      <button 
                        onClick={() => toggleSocialLink(platform.key)}
                        className="flex items-center gap-2 border-2 border-dashed border-black text-black px-4 py-2 rounded-2xl hover:border-[#9B1C31] hover:text-[#9B1C31] transition-colors group"
                      >
                        <i className={`bi ${platform.icon}`}></i>
                        {platform.name}
                        <i className="bi bi-plus text-black group-hover:text-[#9B1C31] ml-2"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-4">
              <button 
                onClick={handleCancel}
                disabled={saving}
                className="w-[192px] h-[50px] px-8 py-3 border-2 border-gray-300 text-gray-600 rounded-3xl hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={!hasChanges() || saving}
                className={`w-[192px] h-[50px] px-8 py-3 rounded-3xl font-semibold transition-colors ${
                  hasChanges() && !saving
                    ? 'bg-[#9B1C31] text-white hover:bg-[#7D1628]' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>              
            </div>
          </div>
        </main>

        {/* Social Media Link Popups */}
        {showPopup && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={handleCancelPopup}
            />
            
            {/* Popup Modal */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 p-6 min-w-[536px] min-h-[97px]">
              <div className="mb-4">
                <label className="block text-[#3C3B3B] text-[12px] font-semibold mb-2">
                  Link to your {socialPlatforms.find(p => p.key === showPopup)?.name} Profile
                </label>
                <input
                  type="url"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  className="w-full h-[30px] text-[12px] px-3 py-2 border-2 border-[#3C3B3B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B1C31] focus:border-transparent"
                  placeholder={`https://${showPopup}.com/yourprofile`}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 -mt-2">
                <button
                  onClick={handleCancelPopup}
                  className="w-[72px] h-[26px] px-4 rounded-lg font-semibold text-[10px] border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLink}
                  disabled={!tempUrl.trim()}
                  className={`w-[72px] h-[26px] px-4 rounded-lg font-semibold text-[10px] transition-colors ${
                    tempUrl.trim()
                      ? 'bg-[#9B1C31] text-white hover:bg-[#7D1628]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Add
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditCompanyPage;
