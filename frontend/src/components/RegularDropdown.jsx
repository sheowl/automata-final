import React, { useState, useRef, useEffect } from "react";

const RegularDropdown = ({ options, selected, onSelect, placeholder = "SELECT AN OPTION" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-full h-[50px] text-black bg-white border border-gray-400 rounded-lg px-4 text-left cursor-pointer flex items-center justify-between focus:outline-none"
      >
        <span className={`${selected ? "text-black" : "text-gray-400"}`}>
          {selected || placeholder}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <i className="bi bi-chevron-down text-gray-500"></i>
        </span>
      </button>

      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto">
          {options.map((option, idx) => (
            <li
              key={idx}
              onClick={() => {
                console.log(`Selected:`, option); // Debugging log
                onSelect(option); // Pass selected value to parent
                setIsOpen(false);
              }}
              className={`cursor-pointer select-none relative py-2 pl-4 pr-4 hover:bg-gray-100 ${
                option === selected ? "bg-green-200 font-semibold" : ""
              }`}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RegularDropdown;
