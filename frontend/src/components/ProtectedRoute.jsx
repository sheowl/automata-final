import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requireRole = null }) => {
  const { user, profile, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFEFF]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9B1C31]"></div>
          <p className="text-[#9B1C31] font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to appropriate sign in
  if (!user) {
    if (requireRole === 'employer') {
      return <Navigate to="/employer-sign-in" replace />;
    } else if (requireRole === 'applicant') {
      return <Navigate to="/applicant-sign-in" replace />;
    }
    // Default to employer sign in if no specific role
    return <Navigate to="/employer-sign-in" replace />;
  }

  // If we have a user but no profile yet, still render the page
  // The profile will load asynchronously - don't block the UI
  // (Pages that need profile data should handle null profile gracefully)

  // Check role requirement - only if we have a profile
  // If profile is null, don't redirect yet - let it load
  if (requireRole && profile && profile.role !== requireRole) {
    // Wrong role - redirect to appropriate dashboard
    if (profile.role === 'employer') {
      return <Navigate to="/employerhomepage" replace />;
    } else if (profile.role === 'applicant') {
      return <Navigate to="/applicantbrowsejobs" replace />;
    }
    // Fallback
    return <Navigate to="/" replace />;
  }

  return children;
};
