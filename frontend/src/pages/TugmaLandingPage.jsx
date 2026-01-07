import React from "react";
import { useNavigate } from "react-router-dom";
import ApplicantDashLogo from "../assets/ApplicantDashLogo.svg";
import TugmaLogo from "../assets/TugmaLogo.svg";

const TugmaLandingPage = () => {
  const navigate = useNavigate();

  const handleJobSeekerClick = () => {
    navigate("/appcomreg");
  };

  const handleEmployerClick = () => {
    navigate("/empcomreg");
  };

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(to right, #BDD1FF 0%, white 25%, white 75%, #FFDAAC 100%)'
      }}
    >
      <div className=" items-center mt-8 justify-start px-6">
        <img 
          src={ApplicantDashLogo} 
          alt="Tugma Logo" 
          className="h-[42px] w-[77px] ml-16"
        />
      </div>
      
      {/* Header/Navigation */}
      <nav className="w-full p-6 flex justify-start">
        <div className="flex items-center">
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 -mt-16">
        {/* Logo */}
        <div className="mb-12 flex flex-col items-center">
          <img 
            src={TugmaLogo} 
            alt="Tugma Logo" 
            className="h-[135px] w-[431px] mt-8 mb-4"
          />
        </div>

        {/* Main Heading */}
        <div className="text-center mb-12 max-w-4xl">
          <h1 className="text-[55px] font-extrabold text-[#3C3B3B] mb-4 leading-tight">
            Skills-based matching for
          </h1>
          <div className="text-[55px] font-extrabold leading-tight">
            <span 
              className="bg-gradient-to-r from-[#2F6DF6] to-[#F2772B] bg-clip-text text-transparent"
            >
              entry-level tech jobs
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-6">
          <button
            onClick={handleJobSeekerClick}
            className="w-[256px] h-[44px] bg-[#047857] hover:[#065F46] text-white font-bold px-8 py-1 rounded-lg text-[20px] transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            I am a Job Seeker
          </button>
          <button
            onClick={handleEmployerClick}
            className="w-[256px] h-[44px] bg-[#9B1C31] hover:bg-[#7D1628] text-white font-bold px-8 py-1 rounded-lg text-[20px] transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            I am an Employer
          </button>
        </div>
      </div>

      {/* Footer spacing */}
      <div className="h-20"></div>
    </div>
  );
};

export default TugmaLandingPage;