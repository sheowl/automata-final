import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import ApplicantSideBar from '../components/ApplicantSideBar';

function ApplicantInbox() {
    const navigate = useNavigate();

    useEffect(() => {
      if (!localStorage.getItem("access_token")) {
        navigate("/applicant-sign-in", { replace: true });
      }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-[#047857] flex flex-col">
            <ApplicantSideBar />

            {/* Main Content Area */}
            <div className="flex-1 bg-white rounded-t-[40px] overflow-y-auto p-6 shadow-md">
                
            </div>
        </div>
    );
}

export default ApplicantInbox;
