import React from "react";

const TextField = ({ label, value, onChange, error, placeholder = "" }) => {
  return (
    <div className="space-y-2">
      <label className="text-base font-semibold text-gray-500">{label}</label>
      <input
        className="w-full h-[50px] border border-gray-400 rounded-lg p-2"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default TextField;