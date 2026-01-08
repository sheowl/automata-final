import React, { useState, useRef, useEffect } from "react";

const ApplicantHeader = ({
  title,
  subtitle,
  firstName,
  showProfile = true,
}) => {
  const notifRef = useRef();

  useEffect(() => {
    return () => {};
  }, []);

  return (
    <>
      <div className="flex justify-between w-full px-9 mb-0 relative">
        {/* Greeting */}
        <div className="flex items-center gap-[15px] m-9">
          <div>
            <div className="font-[Montserrat] text-4xl font-bold text-[#047857]">
              {title}
            </div>
            <div className="font-semibold italic text-rose-400 text-xl">
              {subtitle}
            </div>
          </div>
        </div>

       
      </div>
    </>
  );
};

export default ApplicantHeader;