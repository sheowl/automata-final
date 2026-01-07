import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import AuthService from '../services/AuthService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true; // ⭐ Add mounted flag back

    const checkExistingSession = async () => {
      try {
        console.log("🔍 Checking for existing Supabase session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return; // ⭐ Early return if unmounted
        
        if (error) {
          console.error("❌ Session check error:", error);
          if (mounted) setLoading(false);
          return;
        }

        if (session?.user) {
          console.log("✅ Found existing session:", session.user);
          if (mounted) setUser(session.user);
          
          // ⭐ CRITICAL: Determine user type from metadata first
          let detectedUserType = session.user.user_metadata?.user_type;
          
          if (detectedUserType) {
            if (mounted) setUserType(detectedUserType);
            console.log(`✅ User type from metadata: ${detectedUserType}`);
          } else {
            // ⭐ FALLBACK: Try to detect from backend
            try {
              const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/me`, {
                headers: {
                  'Authorization': `Bearer ${session.access_token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (!mounted) return; // ⭐ Check mounted after async operation
              
              if (response.ok) {
                const userData = await response.json();
                const isEmployer = userData.database_user?.company_id || userData.user_type === 'employer';
                detectedUserType = isEmployer ? 'employer' : 'applicant';
                if (mounted) setUserType(detectedUserType);
                console.log(`✅ User type from backend: ${detectedUserType}`);
              } else {
                console.warn("⚠️ Backend check failed, using email pattern fallback");
                detectedUserType = session.user.email?.includes('@company') || session.user.email?.includes('corp') ? 'employer' : 'applicant';
                if (mounted) setUserType(detectedUserType);
              }
            } catch (backendError) {
              if (!mounted) return;
              console.warn("⚠️ Backend check failed, using metadata fallback");
              detectedUserType = session.user.email?.includes('@company') || session.user.email?.includes('corp') ? 'employer' : 'applicant';
              if (mounted) setUserType(detectedUserType);
            }
          }
          
          // ⭐ IMPORTANT: Force update user metadata if it's missing
          if (!session.user.user_metadata?.user_type && detectedUserType && mounted) {
            try {
              await supabase.auth.updateUser({
                data: { user_type: detectedUserType }
              });
              console.log(`✅ Updated user metadata with user_type: ${detectedUserType}`);
            } catch (updateError) {
              console.warn("⚠️ Could not update user metadata:", updateError);
            }
          }
        } else {
          console.log("ℹ️ No existing session found");
        }
      } catch (error) {
        console.error("❌ Error checking session:", error);
      } finally {
        if (mounted) setLoading(false); // ⭐ Only set loading if still mounted
      }
    };

    checkExistingSession();

    // ⭐ CRITICAL: Listen for auth changes (including page refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return; // ⭐ Check mounted at start of callback
        
        console.log(`🔄 Auth state changed: ${event}`, session?.user);
        
        if (session?.user) {
          setUser(session.user);
          
          // ⭐ Preserve user type or detect it
          let userType = session.user.user_metadata?.user_type;
          
          if (!userType) {
            const isEmployerEmail = session.user.email?.includes('@company') || 
                                   session.user.email?.includes('corp');
            userType = isEmployerEmail ? 'employer' : 'applicant';
            
            // Update metadata for future use
            try {
              await supabase.auth.updateUser({
                data: { user_type: userType }
              });
            } catch (error) {
              console.warn("Could not update user metadata:", error);
            }
          }
          
          if (mounted) setUserType(userType);
          console.log(`🔄 Set user type: ${userType}`);
        } else {
          if (mounted) {
            setUser(null);
            setUserType(null);
          }
          console.log("🔄 User logged out");
        }
        if (mounted) setLoading(false);
      }
    );

    // ⭐ Cleanup function - set mounted to false
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Company authentication methods using Supabase
  const companyLogin = async (company_email, password) => {
    console.log("🔐 AuthContext: Company login attempt");
    const result = await AuthService.companyLogin(company_email, password);
    
    if (result.success) {
      console.log("✅ AuthContext: Setting user and userType");
      setUser(result.data.user);
      setUserType('employer');
    } else {
      console.error("❌ AuthContext: Login failed:", result.error);
    }
    
    return result;
  };

  const companySignup = async (company_email, password, company_name) => {
    const result = await AuthService.companySignup(company_email, password, company_name);
    if (result.success) {
      setUser(result.data.user);
      setUserType('employer');
    }
    return result;
  };

  // Applicant authentication methods using Supabase
  const applicantLogin = async (email, password) => {
    const result = await AuthService.applicantLogin(email, password);
    if (result.success) {
      setUser(result.data.user);
      setUserType('applicant');
    }
    return result;
  };

  const applicantSignup = async (email, password, userData) => {
    const result = await AuthService.applicantSignup(email, password, userData);
    if (result.success) {
      setUser(result.data.user);
      setUserType('applicant');
    }
    return result;
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    setUserType(null);
  };

  // Check functions using Supabase session
  const isAuthenticated = () => {
    return !!user;
  };

  const isEmployer = () => {
    return userType === 'employer' || user?.user_metadata?.user_type === 'employer';
  };

  const isApplicant = () => {
    return userType === 'applicant' || user?.user_metadata?.user_type === 'applicant';
  };

  const value = {
    // State
    user,
    userType,
    loading,
    
    // Authentication methods
    logout,
    isAuthenticated,
    
    // Company-specific methods
    companyLogin,
    companySignup,
    
    // Applicant-specific methods
    applicantLogin,
    applicantSignup,
    
    // Helper methods
    isEmployer,
    isApplicant,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
