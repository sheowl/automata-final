import React, { useState } from "react";
import RegularDropdown from "./RegularDropdown";

export default function ApplicantWorkExpPopup({ onSave, onCancel }) {
    const monthOptions = "January February March April May June July August September October November December".split(" ");
    const yearOptions = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(String);

    const [position, setPosition] = useState(""); // State for Position/Role
    const [company, setCompany] = useState(""); // State for Company Name
    const [startMonth, setStartMonth] = useState("");
    const [startYear, setStartYear] = useState("");
    const [endMonth, setEndMonth] = useState("");
    const [endYear, setEndYear] = useState("");
    const [descriptions, setDescriptions] = useState([]); // Array to store descriptions
    const [currentDescription, setCurrentDescription] = useState(""); // Current input value
    const [errors, setErrors] = useState({}); // State for validation errors

    const handleAddDescription = () => {
        if (currentDescription.trim() !== "") {
            setDescriptions([...descriptions, currentDescription]); // Add to array
            setCurrentDescription(""); // Clear input
        }
    };

    const validateFields = () => {
        const newErrors = {};
        if (!position.trim()) newErrors.position = "Position/Role is required.";
        if (!company.trim()) newErrors.company = "Company is required.";
        if (!startMonth) newErrors.startMonth = "Start Month is required.";
        if (!startYear) newErrors.startYear = "Start Year is required.";
        if (!endMonth) newErrors.endMonth = "End Month is required.";
        if (!endYear) newErrors.endYear = "End Year is required.";
        if (descriptions.length === 0) newErrors.descriptions = "At least one description is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    const handleSave = () => {
        if (validateFields()) {
            const workExperience = {
                position,
                company,
                startMonth,
                startYear,
                endMonth,
                endYear,
                descriptions,
            };
            console.log("Saving Work Experience:", workExperience); // Log the work experience data
            onSave(workExperience); // Pass the data to the parent component
            onCancel(); // Close the popup after saving
        }
    };

    return (
        <div className="flex flex-col gap-4 max-h-[800px] overflow-y-auto pr-1">
            <h2 className="text-2xl font-semibold text-[#047857]">Add Work Experience</h2>

            {/* Position/Role */}
            <div className="space-y-2">
                <label className="text-base font-semibold text-[#3C3B3B]">Position/Role</label>
                <input
                    className="w-full h-[50px] border border-gray-400 rounded-lg p-4"
                    placeholder="Enter your position/role"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)} // Update position state
                />
                {errors.position && <p className="text-red-500 text-sm">{errors.position}</p>}
            </div>

            {/* Company */}
            <div className="space-y-2">
                <label className="text-base font-semibold text-[#3C3B3B]">Company</label>
                <input
                    className="w-full h-[50px] border border-gray-400 rounded-lg p-4"
                    placeholder="Enter company name"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)} // Update company state
                />
                {errors.company && <p className="text-red-500 text-sm">{errors.company}</p>}
            </div>

            {/* Start Date */}
            <div className="space-y-2">
                <label className="text-base font-semibold text-[#3C3B3B]">Start Date</label>
                <div className="flex gap-4">
                    <div className="w-full">
                        <RegularDropdown
                            options={monthOptions}
                            selected={startMonth}
                            onSelect={(value) => setStartMonth(value)}
                            placeholder="Select Start Month"
                        />
                    </div>
                    <RegularDropdown
                        options={yearOptions}
                        selected={startYear}
                        onSelect={(value) => setStartYear(value)}
                        placeholder="Select Start Year"
                    />
                </div>
                {errors.startMonth && <p className="text-red-500 text-sm">{errors.startMonth}</p>}
                {errors.startYear && <p className="text-red-500 text-sm">{errors.startYear}</p>}
            </div>

            {/* End Date */}
            <div className="space-y-2">
                <label className="text-base font-semibold text-[#3C3B3B]">End Date</label>
                <div className="flex gap-4">
                    <RegularDropdown
                        options={monthOptions}
                        selected={endMonth}
                        onSelect={(value) => setEndMonth(value)}
                        placeholder="Select End Month"
                    />
                    <RegularDropdown
                        options={yearOptions}
                        selected={endYear}
                        onSelect={(value) => setEndYear(value)}
                        placeholder="Select End Year"
                    />
                </div>
                {errors.endMonth && <p className="text-red-500 text-sm">{errors.endMonth}</p>}
                {errors.endYear && <p className="text-red-500 text-sm">{errors.endYear}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label className="text-base font-semibold text-[#3C3B3B]">Description</label>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={currentDescription}
                        onChange={(e) => setCurrentDescription(e.target.value)}
                        className="w-full h-[50px] border border-gray-400 rounded-lg p-4"
                        placeholder="Add a description"
                    />
                    <button
                        onClick={handleAddDescription}
                        className="h-[35px] w-[35px] flex items-center justify-center bg-[#047857] text-white rounded-full hover:bg-[#065F46]"
                    >
                        <i className="bi bi-plus-lg"></i>
                    </button>
                </div>
                {errors.descriptions && <p className="text-red-500 text-sm">{errors.descriptions}</p>}
                {/* Display Added Descriptions */}
                <ul className="space-y-2">
                    {descriptions.map((desc, index) => (
                        <li key={index} className="flex items-center justify-between bg-white p-2 rounded-lg">
                            <span className="text-gray-700">{desc}</span>
                            <button
                                onClick={() => setDescriptions(descriptions.filter((_, i) => i !== index))}
                                className="text-red-500 hover:text-red-700"
                            >
                                <i className="bi bi-trash"></i>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-4">
                <button
                    onClick={onCancel} // Call the onCancel function to close the popup
                    className="w-36 px-6 py-2 bg-white text-gray-700 text-base font-bold rounded-[10px] hover:bg-gray-400"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave} // Call the handleSave function to save the data
                    className="w-36 px-6 py-2 bg-[#047857] text-white text-base font-bold rounded-[10px] hover:bg-[#065F46]"
                >
                    Save
                </button>
            </div>
        </div>
    );
}