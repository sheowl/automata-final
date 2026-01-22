import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";

const Employer_SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signIn(email, password);
      navigate("/employerhomepage");
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FEFEFF] font-montserrat pt-24 pb-12 px-2 sm:pt-32 sm:pb-20 sm:px-6 md:pt-[120px] md:pb-[80px] md:px-[120px]">
      <div className="flex flex-col items-center bg-[#FFF1F2] justify-center w-[615px] h-[650px] px-2 sm:px-4 md:px-8 rounded-xl md:rounded-3xl mx-auto py-2 sm:py-3 md:py-4 mt-2 md:mt-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#7D1628] mb-10 md:mb-12 text-center">
          Log in to Tugma
        </h1>
        
        {/* Error Message */}
        {error && (
          <div className="w-full max-w-xs sm:max-w-xs md:max-w-md mb-4">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        )}

        <form
          className="space-y-3 sm:space-y-4 w-full flex flex-col items-center justify-center"
          onSubmit={handleSubmit}
        >
          <div className="w-full max-w-xs sm:max-w-xs md:max-w-md">
            <input
              id="email"
              type="email"
              className="w-full px-1 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg md:rounded-xl bg-[#F9F9F9] border border-[#6B7280] hover:border-2 text-black focus:outline-none focus:ring-2 md:focus:ring-4 focus:ring-orange-200 text-xs sm:text-sm md:text-base placeholder:font-montserrat placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Company Email"
              required
              disabled={isLoading}
            />
          </div>
          <div className="relative w-full max-w-xs sm:max-w-xs md:max-w-md">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="w-full px-1 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg md:rounded-xl bg-[#F9F9F9] border border-[#6B7280] hover:border-2 text-black focus:outline-none focus:ring-2 md:focus:ring-4 focus:ring-rose-200 text-xs sm:text-sm md:text-base placeholder:font-montserrat placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-base"
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
              className="absolute top-2 right-3 focus:outline-none"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeIcon className="h-6 w-6 text-[#6B7280]" />
              ) : (
                <EyeSlashIcon className="h-6 w-6 text-[#6B7280]" />
              )}
            </button>
            <p className="text-left text-[#9B1C31] font-semibold hover:underline cursor-pointer text-sm mt-1 mb-1 ml-1">
              <a href="#">Forgot password?</a>
            </p>
            <div className="h-[24px]" />
          </div>
          <div className="h-2" />
          <button
            type="submit"
            className={`max-w-md text-white rounded-2xl transition mt-4 h-[44px] w-[225px] font-semibold text-sm ${
              isLoading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-[#9B1C31] hover:bg-[#7D1628]"
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
          Doesn't have an Account?
          <a href="/empcomreg" className="text-[#9B1C31] hover:underline ml-2">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Employer_SignIn;
