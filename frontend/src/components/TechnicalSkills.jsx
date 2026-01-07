import { useState } from "react";

export default function TechnicalSkills({
  skills = [],
  setSkills,
  tags = [],
  title,
  selectedProficiency,
  setProficiency,
  showProficiency = true,
}) {
  const [openLevel, setOpenLevel] = useState(null);

  console.log(`🏷️ TechnicalSkills for ${title}:`, tags);

  const toggleTag = (tag) => {
    if (skills.includes(tag)) {
      setSkills(skills.filter((skill) => skill !== tag));
    } else {
      setSkills([...skills, tag]);
    }
  };

  const levels = [
    {
      label: "Level 1: Novice",
      description: (
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600 mt-1">
          <li>
            Has basic knowledge; completed a course or tutorial; understands
            syntax or usage but has minimal project experience
          </li>
          <li>Watched videos, read docs, or completed 1–2 mini projects</li>
        </ul>
      ),
    },
    {
      label: "Level 2: Advanced Beginner",
      description: (
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600 mt-1">
          <li>
            Can use the skill in real-world scenarios with supervision or
            references
          </li>
          <li>
            Has used the skill in class projects, freelance tasks, or
            internships
          </li>
        </ul>
      ),
    },
    {
      label: "Level 3: Competent",
      description: (
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600 mt-1">
          <li>
            Can solve problems and build systems using the skill independently
          </li>
          <li>
            Can debug, optimize, and integrate the skill in team projects or
            real work
          </li>
        </ul>
      ),
    },
    {
      label: "Level 4: Proficient",
      description: (
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600 mt-1">
          <li>
            Deep understanding; knows advanced features, tools, and patterns;
            may mentor others
          </li>
          <li>
            Used in multiple professional projects; contributed to open-source
            or led teams
          </li>
        </ul>
      ),
    },
    {
      label: "Level 5: Expert",
      description: (
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600 mt-1">
          <li>
            Recognized expertise; can architect systems or teach others; solves
            edge cases and performance issues
          </li>
          <li>
            Published content, spoken at events, or built tools/libraries for
            this skill
          </li>
        </ul>
      ),
    },
  ];

  const toggleOpen = (levelLabel) => {
    setOpenLevel(openLevel === levelLabel ? null : levelLabel);
  };

  // FIXED: Update how proficiency is set
  const handleProficiencyChange = (levelLabel) => {
    // Extract numeric level from the label (e.g., "Level 3: Competent" -> 3)
    const levelMatch = levelLabel.match(/Level (\d+)/);
    if (levelMatch) {
      const numericLevel = parseInt(levelMatch[1]);

      // Set proficiency as an object with title as key and numeric level as value
      setProficiency((prev) => ({
        ...prev,
        [title]: numericLevel, // Use title (category name) as key, numeric level as value
      }));
    }
  };

  return (
    <div
      className={`flex gap-8 justify-center items-start mt-8 mb-8 ${
        showProficiency ? "flex-row" : "flex justify-center"
      }`}
    >
      {/* Tag Selection */}
      <div
        className={`p-6 bg-white rounded-[10px] shadow-all-around ${
          showProficiency ? "w-[416px] min-h-[360px]" : "w-[480px] h-[318px]"
        }`}
      >
        <h1
          className={`text-2xl font-bold text-[#047857] p-4 ${
            showProficiency ? "" : "text-center"
          }`}
        >
          {title}
        </h1>
        <div
          className={`flex flex-wrap gap-2 p-4 ${
            showProficiency ? "justify-start" : "justify-center"
          }`}
        >
          {tags.map((tag) => {
            const isSelected = skills.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`inline-flex items-center gap-2 border rounded-[20px] px-3 py-1 text-sm font-semibold transition-colors ${
                  isSelected
                    ? "bg-[#047857] text-white border-[#047857]"
                    : "text-[#047857] border-[#047857]"
                }`}
              >
                <i
                  className={`${
                    isSelected ? "bi bi-x" : "bi bi-plus"
                  } font-bold text-base`}
                ></i>
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Proficiency Levels */}
      {showProficiency && (
        <div className="p-6 bg-white rounded-[10px] shadow-all-around w-[416px] min-h-[360px]">
          <h1 className="text-2xl font-bold text-[#047857] p-4">
            Proficiency Level
          </h1>
          <div className="space-y-4 p-4">
            {levels.map((level) => (
              <div key={level.label} className="border-b pb-2">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => {
                    handleProficiencyChange(level.label); // Use the new handler
                    toggleOpen(level.label);
                  }}
                >
                  <label className="flex items-center gap-2 text-[#047857] text-base font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name={`proficiency-${title}`}
                      checked={
                        selectedProficiency[title] ===
                        parseInt(level.label.match(/Level (\d+)/)?.[1])
                      }
                      onChange={() => handleProficiencyChange(level.label)}
                      className="accent-[#047857] w-5 h-5"
                    />
                    {level.label}
                  </label>
                  <span className="text-[#047857]">
                    <i
                      className={`bi ${
                        openLevel === level.label
                          ? "bi-chevron-up"
                          : "bi-chevron-down"
                      }`}
                    />
                  </span>
                </div>
                {openLevel === level.label && (
                  <div className="mt-2 pl-4">{level.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
