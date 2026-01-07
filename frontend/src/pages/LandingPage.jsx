import React, { useState } from 'react';
import TechnicalSkills from "../components/TechnicalSkills";

function LandingPage() {
  const [skills, setSkills] = useState([]);
  const [proficiency, setProficiency] = useState(null); // NEW

  const availableTags = [
    "Python", "Java", "JavaScript", "C++", "C#", "Go",
    "Rust", "PHP", "TypeScript", "Ruby", "Kotlin", "Swift", "R", "Bash/Shell"
  ];

  return (
    <div className="p-6">
      <TechnicalSkills
        title="Programming Languages"
        skills={skills}
        setSkills={setSkills}
        tags={availableTags}
        selectedProficiency={proficiency}
        setProficiency={setProficiency}
      />

      <div className="mt-4">
        <h4 className="font-bold">Selected Skills:</h4>
        <p>{skills.join(", ") || "None selected"}</p>
      </div>

      <div className="mt-4">
        <h4 className="font-bold">Proficiency Level:</h4>
        <p>{proficiency || "None selected"}</p>
      </div>
    </div>
  );
}

export default LandingPage;
