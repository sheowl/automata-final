import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile with timeout
  const fetchProfile = async (userId) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // Create a promise that rejects after timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // Race between fetch and timeout
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      console.log('Profile fetched successfully:', data?.email);
      return data;
    } catch (err) {
      console.error('Exception fetching profile:', err.message);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    let isInitializing = true;

    // Initial session check
    const initAuth = async () => {
      console.log('initAuth starting...');
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        console.log('Session check complete, user:', session?.user?.email);

        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(userProfile);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        if (mounted) {
          console.log('initAuth complete, setting loading to false');
          setLoading(false);
          isInitializing = false;
        }
      }
    };

    initAuth();

    // Listen for auth changes (sign in, sign out) - but NOT during initialization
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email, 'isInitializing:', isInitializing);
        
        // Skip ALL events during initialization - initAuth handles everything
        if (isInitializing) {
          console.log('Skipping event during initialization');
          return;
        }
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setLoading(true);
          const userProfile = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(userProfile);
            setLoading(false);
          }
          return;
        }
        
        // TOKEN_REFRESHED - just update user, don't refetch profile
        if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user);
          return;
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign up
  const signUp = async (email, password, role, name) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Insert profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email,
            role,
            name
          });

        if (profileError) {
             console.error("Error creating profile:", profileError);
             // Don't throw here, allow auth to succeed even if profile creation acts up (rare)
        } else {
             const newProfile = await fetchProfile(authData.user.id);
             setProfile(newProfile);
        }
      }
      return authData;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Sign in
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    localStorage.clear(); // Optional: clear local storage if needed
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isEmployer: profile?.role === 'employer',
    isApplicant: profile?.role === 'applicant',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
