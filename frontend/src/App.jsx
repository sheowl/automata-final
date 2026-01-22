import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "./output.css";
import { AuthProvider } from './context/AuthContext';
import { JobsCacheProvider } from './context/JobsCacheContext';
import { ProtectedRoute } from './components/ProtectedRoute';
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
import ApplicantOnboarding from "./pages/ApplicantOnboarding.jsx";
import EmployerOnboarding from "./pages/EmployerOnboarding.jsx";
import CompanyPage from "./pages/CompanyPage.jsx";
import EditCompanyPage from "./components/EditCompanyPage.jsx";
import ApplicantResume from "./components/ApplicantResume.jsx";
import TugmaLandingPage from './pages/TugmaLandingPage.jsx';
import SkillMatchDashboard from './pages/SkillMatchDashboard.jsx';

function App() {
  return (
    <AuthProvider>
      <JobsCacheProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<TugmaLandingPage />} />
              <Route path="/applicant-sign-in" element={<ApplicantSignIn />} />
              <Route path="/employer-sign-in" element={<EmployerSignIn />} />
              <Route path="/empcomreg" element={<EmpComReg />} />
            <Route path="/appcomreg" element={<AppComReg />} />
            <Route path="/tugmalandingpage" element={<TugmaLandingPage />} />
            
            {/* Applicant Protected Routes */}
            <Route path="/applicantbrowsejobs" element={
              <ProtectedRoute requireRole="applicant">
                <ApplicantBrowseJobs />
              </ProtectedRoute>
            } />
            <Route path="/applicantinbox" element={
              <ProtectedRoute requireRole="applicant">
                <ApplicantInbox />
              </ProtectedRoute>
            } />
            <Route path="/applicantapplications" element={
              <ProtectedRoute requireRole="applicant">
                <ApplicantApplications />
              </ProtectedRoute>
            } />
            <Route path="/applicantprofile" element={
              <ProtectedRoute requireRole="applicant">
                <ApplicantProfile />
              </ProtectedRoute>
            } />
            <Route path="/applicantonboarding" element={
              <ProtectedRoute requireRole="applicant">
                <ApplicantOnboarding />
              </ProtectedRoute>
            } />
            <Route path="/applicantresume" element={
              <ProtectedRoute requireRole="applicant">
                <ApplicantResume />
              </ProtectedRoute>
            } />
            
            {/* Employer Protected Routes */}
            <Route path="/employerhomepage" element={
              <ProtectedRoute requireRole="employer">
                <EmployerHomePage />
              </ProtectedRoute>
            } />
            <Route path="/employerapplicants" element={
              <ProtectedRoute requireRole="employer">
                <EmployerApplicants />
              </ProtectedRoute>
            } />
            <Route path="/employeronboarding" element={
              <ProtectedRoute requireRole="employer">
                <EmployerOnboarding />
              </ProtectedRoute>
            } />
            <Route path="/companypage" element={
              <ProtectedRoute requireRole="employer">
                <CompanyPage />
              </ProtectedRoute>
            } />
            <Route path="/edit-company-profile" element={
              <ProtectedRoute requireRole="employer">
                <EditCompanyPage />
              </ProtectedRoute>
            } />
            <Route path="/skillmatch" element={
              <ProtectedRoute requireRole="employer">
                <SkillMatchDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
      </JobsCacheProvider>
    </AuthProvider>
  );
}

export default App;
