
export default function Tag({ label, matched }) {
  const bgColor = matched ? "bg-[#34A853]" : "bg-[#EF4444]";
  const textColor = matched ? "text-white" : "text-white";

  return (
    <span className={`px-4 py-2 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
}
