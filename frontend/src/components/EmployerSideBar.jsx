import React, { useState } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { icon: 'bi-house', label: 'Home Page', path: '/EmployerHomePage', key: 'homepage' },
    { icon: 'bi-clipboard2', label: 'Job Posts', path: '/EmployerJobPosts', key: 'jobposts' },
    { icon: 'bi-cpu', label: 'SkillMatch', path: '/skillmatch', key: 'skillmatch' },
    { icon: 'bi-building-gear', label: 'Company', path: '/CompanyPage', key: 'company' },
];

const EmployerSideBar = ({ activePage }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signOut } = useAuth();

    const handleLogout = async () => {
        console.log('Logout button clicked');
        try {
            await signOut();
            console.log('signOut completed, navigating...');
            navigate('/employer-sign-in', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/employer-sign-in', { replace: true });
        }
    };

    const getActiveIndex = () => {
        if (activePage) {
            // Find by key
            const foundByKey = navItems.findIndex(item => item.key === activePage);
            if (foundByKey !== -1) return foundByKey;
        }
        const currentPath = location.pathname.toLowerCase();
        // If on employerapplicants page, highlight Job Posts
        if (currentPath === '/employerapplicants') {
            return 1; // Job Posts index
        }
        
        // If on edit-company-profile page, highlight Company (same as CompanyPage)
        if (currentPath === '/edit-company-profile' || currentPath === '/emp-profile') {
            return 2; // Company index
        }
        
        // Find match by comparing lowercase paths
        const foundIndex = navItems.findIndex(item => item.path.toLowerCase() === currentPath);
        return foundIndex !== -1 ? foundIndex : 0;
    };

    const handleNavClick = (idx, path) => {
        if (path && navigate) {
            navigate(path);
        }
    };

    return (
        <div className="w-full bg-[#9B1C31] flex items-center justify-between px-8 py-6">
            {/* Navigation */}
            <nav className="flex-1 flex justify-center">
                <ul className="flex gap-6 font-bold items-center">                        
                    {navItems.map((item, idx) => (
                        <li
                            key={item.label}
                            className={`flex items-center gap-2 px-6 py-3 rounded-[10px] text-base cursor-pointer transition-colors duration-150 ${
                                getActiveIndex() === idx
                                    ? 'bg-white text-[#9B1C31]'
                                    : 'text-white hover:bg-[#7D1628]'
                            }`}
                            onClick={() => handleNavClick(idx, item.path)}
                        >
                            <i className={`bi ${item.icon} text-xl`}></i>
                            <span>{item.label}</span>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Logout Button */}
            <button 
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 text-white text-base cursor-pointer hover:bg-[#7D1628] rounded-[10px] font-bold relative z-50"
            >
                <i className="bi bi-box-arrow-right text-xl"></i>
                <span>Logout</span>
            </button>
        </div>
    );
};

export default EmployerSideBar;
