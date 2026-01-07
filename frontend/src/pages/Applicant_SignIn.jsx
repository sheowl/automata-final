import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import TugmaLogo from "../assets/TugmaLogo.svg";

const Applicant_SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { applicantLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/applicantonboarding", // or your desired page
        },
      });
      if (error) setError("Google sign-in failed: " + error.message);
    } catch (err) {
      setError("Google sign-in error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FEFEFF] font-montserrat pt-24 pb-12 px-2 sm:pt-32 sm:pb-20 sm:px-6 md:pt-[120px] md:pb-[80px] md:px-[120px]">
      <div className="absolute top-8 left-4 pl-4 sm:top-12 sm:left-16 sm:pl-12 md:top-20 md:left-40 md:pl-24">
        <img src={TugmaLogo} alt="Logo" className="w-40 h-16 sm:w-60 sm:h-20 md:w-[192px] md:h-[60px]" />
      </div>
      <div className="flex flex-col items-center bg-[#F0FDF4] justify-center w-[615px] shadow-all-around
      h-[650px] px-2 sm:px-4 md:px-8 rounded-xl md:rounded-3xl mx-auto py-2 sm:py-3 md:py-4 mt-2 md:mt-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#047857] mb-10 md:mb-12 text-center">
          Log in to Tugma
        </h1>
        <form
          className="space-y-3 sm:space-y-4 w-full flex flex-col items-center justify-center"
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            setIsLoading(true);

            // Basic validation
            if (!username || !password) {
              setError("Please fill in all fields");
              setIsLoading(false);
              return;
            }
            if (!username.includes("@")) {
              setError("Please enter a valid email address");
              setIsLoading(false);
              return;
            }

            try {
              const { data, error } = await supabase.auth.signInWithPassword({
                email: username,
                password,
              });
              if (error) {
                setError(error.message || "Login failed");
                setIsLoading(false);
                return;
              }
              // Optionally, sync with your backend if you need to create a DB row
              navigate("/applicantonboarding");
              setIsLoading(false);
            } catch (error) {
              console.error("Login error:", error);
              setError("Network error. Please check your connection.");
            } finally {
              setIsLoading(false);
            }
          }}
        >
          <div className="w-full max-w-xs sm:max-w-xs md:max-w-md">
            <input
              id="username"
              type="text"
              className="w-full px-1 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg md:rounded-xl bg-[#F9F9F9] border border-[#6B7280] hover:border-2 text-black focus:outline-none focus:ring-2 md:focus:ring-4 focus:ring-blue-200 text-xs sm:text-sm md:text-base placeholder:font-montserrat placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-base"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Email"
              required
              disabled={isLoading}
            />
          </div>
          <div className="relative w-full max-w-xs sm:max-w-xs md:max-w-md">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="w-full px-1 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg md:rounded-xl bg-[#F9F9F9] border border-[#6B7280] hover:border-2 text-black focus:outline-none focus:ring-2 md:focus:ring-4 focus:ring-emerald-200 text-xs sm:text-sm md:text-base placeholder:font-montserrat placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-base"
              placeholder="Password"
              style={{ paddingRight: "3.5rem" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute top-2 right-3 sm:top-[12%] sm:right-4 transform -translate-y-1/2 focus:outline-none"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeIcon className="h-6 w-6 text-[#6B7280]" />
              ) : (
                <EyeSlashIcon className="h-6 w-6 text-[#6B7280]" />
              )}
            </button>
            <p className="text-left text-[#047857] font-semibold hover:underline cursor-pointer text-sm mt-1 mb-1 ml-1">
              <a href="#">Forgot password?</a>
            </p>
            <div className="h-[24px]" />
          </div>
          {error && (
            <div className="text-red-500 text-sm mb-2">{error}</div>
          )}
          <div className="h-2" />
          <button
            type="submit"
            className={`max-w-md bg-[#047857] text-white rounded-2xl hover:bg-[#065F46] transition mt-4 h-[44px] w-[225px] font-semibold text-sm ${
              isLoading ? "bg-gray-400 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing In...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        <p className="text-center text-sm text-[#6B7280] font-semibold mt-2">
          Doesn’t have an Account?
          <a href="/appcomreg" className="text-[#065F46] hover:underline ml-2">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Applicant_SignIn;
