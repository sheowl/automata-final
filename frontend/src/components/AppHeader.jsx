import React from "react";

const AppHeader = () => (
  <>
    <div className="absolute top-16 right-4 text-xs sm:top-20 sm:right-16 sm:text-sm md:top-24 md:right-60 md:text-base text-[#3C3B3B] font-semibold">
      Here to hire applicants?{" "}
      <a href="/empcomreg" className="text-[#065F46] hover:underline">
        Join as an Employer
      </a>
    </div>
  </>
);

export default AppHeader;
