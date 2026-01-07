// import { useState } from "react";
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import { JobsProvider } from './context/JobsContext';
import { CompanyProvider } from './context/CompanyContext';
import { TagsProvider } from './context/TagsContext'; // Import TagsProvider
import "./output.css";
import ApplicantSignIn from "./pages/Applicant_SignIn.jsx";
import EmployerSignIn from "./pages/Employer_SignIn.jsx";    
import EmpComReg from "./pages/EmpComReg.jsx";
import AppComReg from "./pages/AppComReg.jsx";
import ApplicantBrowseJobs from "./pages/ApplicantBrowseJobs.jsx";
import ApplicantApplications from "./pages/ApplicantApplications.jsx";
import ApplicantInbox from "./pages/ApplicantInbox.jsx";
import ApplicantProfile from "./pages/ApplicantProfile.jsx";
import EmployerApplicants from "./pages/EmployerApplicants.jsx";
import EmployerHomePage from "./pages/EmployerHomePage.jsx";
import EmployerJobPosts from "./pages/EmployerJobPosts.jsx";
import ApplicantOnboarding from "./pages/ApplicantOnboarding.jsx";
import EmployerOnboarding from "./pages/EmployerOnboarding.jsx";
import TechnicalSkills from "./components/TechnicalSkills.jsx";
import CompanyPage from "./pages/CompanyPage.jsx";
import EditCompanyPage from "./components/EditCompanyPage.jsx";
import ApplicantResume from "./components/ApplicantResume.jsx";
import TugmaLandingPage from './pages/TugmaLandingPage.jsx';

function App() {
  return (
    <AuthProvider>  {/* Wrap entire app with AuthProvider */}
      <CompanyProvider>  {/* Add CompanyProvider here */}
        <TagsProvider>  {/* Add TagsProvider for categories and tags */}
          <JobsProvider>
            <Router>
              <div className="App">
                <Routes>
                  <Route path="/" element={<TugmaLandingPage />} />
                  <Route path="/applicant-sign-in" element={<ApplicantSignIn />} />
                  <Route path="/employer-sign-in" element={<EmployerSignIn />} />
                  <Route path="/empcomreg" element={<EmpComReg />} />
                  <Route path="/appcomreg" element={<AppComReg />} />
                  <Route path="/applicantbrowsejobs" element={<ApplicantBrowseJobs />} />
                  <Route path="/applicantinbox" element={<ApplicantInbox />} />
                  <Route path="/applicantapplications" element={<ApplicantApplications />} />
                  <Route path="/applicantprofile" element={<ApplicantProfile />} />
                  <Route path="/employerhomepage" element={<EmployerHomePage />} />
                  <Route path="/employerapplicants" element={<EmployerApplicants />} />
                  <Route path="/employerjobposts" element={<EmployerJobPosts />} />
                  <Route path="/applicantonboarding" element={<ApplicantOnboarding />} />
                  <Route path="/employeronboarding" element={<EmployerOnboarding />} />
                  <Route path="/companypage" element={<CompanyPage />} />
                  <Route path="/edit-company-profile" element={<EditCompanyPage />} />
                  <Route path="/applicantresume" element={<ApplicantResume />} />
                  <Route path="/tugmalandingpage" element={<TugmaLandingPage />} />
                </Routes>
              </div>
            </Router>
          </JobsProvider>
        </TagsProvider>
      </CompanyProvider>
    </AuthProvider>
  );
}

export default App;
