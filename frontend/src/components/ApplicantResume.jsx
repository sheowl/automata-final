import React from "react";
import EmployerSideBar from "../components/EmployerSideBar";

function ApplicantResume() {
  // Temporary user data for dynamic rendering
const userData = {
  matchScore: 72,
  name: "Kyle Desmond Co",
  location: "Silang, Cavite",
  mobile: "0992 356 7294",
  telephone: "8153-4137",
  email: "nasapusokoanglove14@gmail.com",
  university: "Polytechnic University of the Philippines",
  yearGraduated: "2027",
  address: "#1 Kurt St. Brgy. Mapagmahal Silang, Cavite",
  degree: "Bachelor of Science in Computer Science",
  field: "Software Cybersecurity",
  github: "https://github.com/kyleco",
  linkedin: "https://linkedin.com/in/kyleco",
  portfolio: "https://kyleco.dev",
  experience: [
    {
      title: "Senior Graphic Designer",
      company: "Canva Philippines",
      date: "JANUARY 2024 - MAY 2025",
      responsibilities: [
        "Designed marketing materials for campaigns.",
        "Collaborated with product and engineering teams.",
        "Mentored junior designers."
      ]
    }
  ],
  technicalSkills: ["React", "JavaScript", "CSS", "Python", "Django"],
  softSkills: ["Teamwork", "Communication", "Problem Solving"],
  technicalSkillsDetailed: [
    {
      category: "Programming Languages",
      level: "Novice",
      percent: 40,
      tags: ["Python", "JavaScript", "C++", "Java", "Go", "Ruby", "PHP", "C#", "Swift", "Kotlin"]
    },
    {
      category: "Web Development",
      level: "Advanced Beginner",
      percent: 30,
      tags: ["HTML", "CSS", "React", "Vue", "Angular", "SASS", "Bootstrap", "Tailwind"]
    },
    {
      category: "AI/ML/Data Science",
      level: "Competent",
      percent: 60,
      tags: ["TensorFlow", "PyTorch", "Pandas", "NumPy", "scikit-learn", "Keras", "Jupyter"]
    },
    {
      category: "Database",
      level: "Proficient",
      percent: 70,
      tags: ["MySQL", "PostgreSQL", "MongoDB", "SQLite", "Redis", "Oracle"]
    },
    {
      category: "DevOps",
      level: "Expert",
      percent: 100,
      tags: ["Docker", "Kubernetes", "Jenkins", "GitHub Actions", "AWS", "Azure", "GCP"]
    },
    {
      category: "Cybersecurity",
      level: "Expert",
      percent: 100,
      tags: ["Penetration Testing", "Network Security", "Firewalls", "SIEM", "IDS/IPS", "Encryption"]
    },
    {
      category: "Mobile Development",
      level: "Novice",
      percent: 20,
      tags: ["Flutter", "React Native", "Swift", "Kotlin", "Ionic"]
    }
  ]
};

const matchScoreColor = userData.matchScore < 50 ? "text-[#EF4444]" : userData.matchScore < 75 ? "text-[#F5B041]" : "text-[#27AE60]";

  return (
    <div className="min-h-screen bg-[#9B1C31] flex flex-col">
      <EmployerSideBar activePage="jobposts" />

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-t-[40px] overflow-y-auto p-6 shadow-md">
        {/* Header */}
        <div className="flex justify-between items-center w-full px-9 mb-4 mt-4">
          <button
            className="text-gray-600 hover:text-black transition-colors text-[32px] flex items-center gap-2"
            onClick={() => window.history.back()}
            aria-label="Back"
          >
            <i className="bi bi-arrow-left" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="flex flex-col space-y-7 items-center w-full pb-8">
          <div className="w-full max-w-[976px] h-[220px] rounded-[20px] shadow-all-around flex items-center gap-8 bg-white p-10">
            {/* Profile Picture */}
            <div className="relative flex-shrink-0">
              <div className="w-[150px] h-[150px] rounded-full border border-gray-600 flex items-center justify-center text-4xl text-gray-500">
                <i className="bi bi-person-fill text-7xl"></i>
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-[#9B1C31] rounded-full flex items-center justify-center text-[#9B1C31] text-xl">
                <i className="bi bi-plus"></i>
              </div>
            </div>
            {/* Profile Info */}
            <div className="flex flex-col justify-center flex-grow">
              <h2 className="text-[24px] text-[#3C3B3B] font-bold">{userData.name}</h2>
              <div className="text-[#6B7280] text-[14px] font-semibold flex items-center gap-2 mt-1">
                <i className="bi bi-geo-alt"></i> {userData.location}
              </div>
              <div className="text-[#6B7280] text-[14px] font-semibold flex items-center gap-2 mt-1">
                <i className="bi bi-telephone"></i> {userData.mobile}
              </div>
              <div className="text-[#6B7280] text-[14px] font-semibold flex items-center gap-2 mt-1">
                <i className="bi bi-envelope"></i> {userData.email}
              </div>
              {/* Buttons */}
              <div className="flex gap-4 mt-4">
                <a href={userData.github} target="_blank" rel="noopener noreferrer" className="bg-[#9B1C31] font-semibold text-[12px] hover:bg-[#7D1628] text-white px-4 py-2 rounded-md flex items-center gap-2">
                  <i className="bi bi-github"></i> GitHub
                </a>
                <a href={userData.linkedin} target="_blank" rel="noopener noreferrer" className="bg-[#9B1C31] font-semibold text-[12px] hover:bg-[#7D1628] text-white px-4 py-2 rounded-md flex items-center gap-2">
                  <i className="bi bi-linkedin"></i> LinkedIn
                </a>
                <a href={userData.portfolio} target="_blank" rel="noopener noreferrer" className="bg-[#9B1C31] font-semibold text-[12px] hover:bg-[#7D1628] text-white px-4 py-2 rounded-md flex items-center gap-2">
                  <i className="bi bi-globe"></i> Portfolio
                </a>
              </div>
            </div>
          </div>

          {/* Resume Section */}
          <div className="w-full max-w-[976px] h-auto rounded-[20px] shadow-all-around flex items-center gap-8 bg-white p-10">
            <div className="flex flex-col justify-center flex-grow space-y-4">
              <div className="text-[24px] text-[#3C3B3B] font-bold">Resume</div>
              <div className="text-[20px] text-[#3C3B3B] font-semibold">Personal Information</div>
              {/* Two Columns */}
              <div className="grid grid-cols-2 gap-8 text-[16px] font-semibold">
                {/* First Column */}
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col space-y-1">
                    <div className="text-[#6B7280]">Name</div>
                    <div className="text-[#3C3B3B]">{userData.name}</div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <div className="text-[#6B7280]">Mobile Number</div>
                    <div className="text-[#3C3B3B]">{userData.mobile}</div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <div className="text-[#6B7280]">University</div>
                    <div className="text-[#3C3B3B]">{userData.university}</div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <div className="text-[#6B7280]">Year Graduated</div>
                    <div className="text-[#3C3B3B]">{userData.yearGraduated}</div>
                  </div>
                </div>
                {/* Second Column */}
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col space-y-1">
                    <div className="text-[#6B7280]">Address</div>
                    <div className="text-[#3C3B3B]">{userData.address}</div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <div className="text-[#6B7280]">Telephone Number</div>
                    <div className="text-[#3C3B3B]">{userData.telephone}</div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <div className="text-[#6B7280]">Degree</div>
                    <div className="text-[#3C3B3B]">{userData.degree}</div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <div className="text-[#6B7280]">Field</div>
                    <div className="text-[#3C3B3B]">{userData.field}</div>
                  </div>
                </div>
              </div>
              <hr className="border-t border-[#6B7280] my-4" />
              <div className="text-[20px] text-[#3C3B3B] font-semibold">Experience</div>
              {userData.experience.map((exp, index) => (
                <div key={index} className="border-l border-[#6B7280] pl-4 ml-2 mb-6">
                  <div className="flex flex-row justify-between">
                    <div className="text-[16px] text-[#3C3B3B] font-semibold">{exp.title}</div>
                    <div className="text-[#6B7280] text-[14px] font-semibold">{exp.date}</div>
                  </div>
                  <div className="text-[#6B7280] text-[14px] font-semibold">{exp.company}</div>
                  <ul className="text-[#6B7280] text-[12px] font-semibold list-disc pl-6">
                    {exp.responsibilities.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <hr className="border-t border-[#6B7280] my-4" />
              <div className="text-[20px] font-semibold text-[#3C3B3B]">Technical Skills</div>
              <div className="flex flex-col gap-6 w-full">
                {userData.technicalSkillsDetailed.map((skill, idx) => (
                  <div key={idx} className="w-full">
                    <div className="flex justify-between items-center w-full">
                      <div className="text-[16px] font-semibold text-[#3C3B3B]">{skill.category}</div>
                      <div className="text-[14px] text-[#6B7280] font-semibold">{skill.level}</div>
                    </div>
                    <div className="w-full h-2 bg-[#D1FAE5] rounded-full mt-1 mb-2 relative">
                      <div
                        className="h-2 bg-[#9B1C31] rounded-full absolute top-0 left-0"
                        style={{ width: `${skill.percent}%` }}
                      ></div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skill.tags.map((tag, tagIdx) => (
                        <span key={tagIdx} className="bg-[#F5F6FA] text-[#3C3B3B] px-3 py-1 rounded-full text-[12px] font-semibold border border-[#D1FAE5]">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <hr className="border-t border-gray-300 my-4" />
              <div className="text-[20px] font-semibold text-[#3C3B3B]">Soft Skills</div>
              <div className="flex flex-wrap gap-2 mb-2">
                {userData.softSkills.map((skill, idx) => (
                  <span key={idx} className="bg-[#F5F6FA] text-[#3C3B3B] px-3 py-1 rounded-full text-[12px] font-semibold border border-[#D1FAE5]">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicantResume;
