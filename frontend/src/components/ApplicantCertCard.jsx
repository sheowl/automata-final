export default function ApplicantCertCard({ certification, onDelete }) {
  const { name, description, previewURL } = certification || {};

  function truncate(text, maxLength = 100) {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  }

  return (
    <div className="relative w-[416px] bg-white h-[200px] border border-[#047857] rounded-[20px] p-4 flex gap-4 items-center">
      {/* Delete button */}
      <button
        onClick={() => onDelete(certification)}
        aria-label={`Delete certification: ${name}`}
        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
      >
        <i className="bi bi-trash text-xl"></i>
      </button>

      {/* Preview section */}
      <div className="flex-shrink-0">
        {previewURL === "pdf" ? (
          <div className="w-[170px] h-[120px] rounded-[10px] flex items-center justify-center bg-gray-50">
            <i className="bi bi-file-earmark-pdf text-5xl text-red-600"></i>
          </div>
        ) : previewURL ? (
          <img
            src={previewURL}
            alt={name}
            className="w-[170px] h-[120px] object-cover rounded-[10px]"
          />
        ) : (
          <div className="w-[120px] h-[120px] flex items-center justify-center border border-[#047857] rounded bg-gray-50">
            <i className="bi bi-award text-[#047857] text-4xl"></i>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="flex flex-col items-start flex-grow">
        <h2 className="text-base font-bold text-[#047857]">{name}</h2>
        <p className="text-xs text-[#676767] mt-2">{truncate(description, 100)}</p>
      </div>
    </div>
  );
}
