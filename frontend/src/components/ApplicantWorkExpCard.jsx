export default function ApplicantWorkExpCard({ workExperience, onDelete }) {
  const { position, company, startMonth, startYear, endMonth, endYear, descriptions } = workExperience;

  return (
    <div className= "w-[416px] h-[325px] border border-[#047857] rounded-lg p-6 space-y-4">
      {/* Position and Company */}
      <div className="flex justify-between items-center">
        <i className="bi bi-folder2-open text-[#047857] text-4xl"></i>

        <div>
          <h2 className="text-xl font-bold text-[#047857]">{position}</h2>
          <h3 className="text-sm font-semibold text-[#676767]">{company}</h3>
           <p className="text-xs text-[#676767]">
        {startMonth} {startYear} - {endMonth} {endYear}
      </p>
        </div>
        <button
          onClick={() => onDelete(workExperience)}
          className="text-red-500 hover:underline"
        >
          <i className="bi bi-trash text-2xl"></i>
        </button>
      </div>
   

      {/* Descriptions */}
      <ul className="list-disc pl-8 space-y-1 text-xs text-[#676767]">
        {descriptions.map((desc, index) => (
          <li key={index}>{desc}</li>
        ))}
      </ul>
    </div>
  );
}