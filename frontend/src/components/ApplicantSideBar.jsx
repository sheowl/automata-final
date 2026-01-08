import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useMockData";
import { useNavigate } from "react-router-dom";

const logout = async () => {
  localStorage.clear();
  window.location.href = "/applicant-sign-in";
};

const navItems = [
  { name: "Browse Jobs", icon: "bi-search", path: "/applicantbrowsejobs" },
  { name: "Applications", icon: "bi-briefcase-fill", path: "/applicantapplications" },
  { name: "Profile", icon: "bi-person-fill", path: "/applicantprofile" },
];

const ApplicantSideBar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/applicant-sign-in");
  };

  return (
    <div className="w-full bg-[#047857] flex items-center justify-between px-8 py-6">
      {/* Navigation */}
      <nav className="flex-1 flex justify-center">
        <ul className="flex gap-6 font-bold items-center">
          {navItems.map((item) => (
            <NavLink
              to={item.path}
              key={item.name}
              className={({ isActive }) =>
                `flex items-center gap-2 px-6 py-3 rounded-[10px] text-base cursor-pointer transition-colors duration-150 ${
                  isActive ? "bg-white text-[#047857]" : "text-white hover:bg-[#065F46]"
                }`
              }
            >
              <i className={`bi ${item.icon} text-xl`}></i>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <NavLink
        to="/applicant-sign-in"
        onClick={handleLogout}
        className="flex items-center gap-2 px-6 py-3 text-white text-base cursor-pointer hover:bg-[#065F46] rounded-[10px] font-bold"
      >
        <i className="bi bi-box-arrow-right text-xl"></i>
        <span>Logout</span>
      </NavLink>
    </div>
  );
};

export default ApplicantSideBar;
