export default function ApplicationTimeline({ status, large = false }) {
  const getTimelineSteps = () => {
    switch (status) {
      case "applied":
        return [{ label: "Applied", date: "02/12/25; 11:01 AM", color: "bg-[#5DADE2]" }];
      case "interview":
        return [
          { label: "Applied", date: "02/12/25; 11:01 AM", color: "bg-[#27AE60]" },
          { label: "For Interview", date: "02/13/25; 10:00 AM", color: "bg-[#FBBC04]" },
        ];
      case "rejected-after-interview":
        return [
          { label: "Applied", date: "02/12/25; 11:01 AM", color: "bg-[#27AE60]" },
          { label: "Rejected", date: "02/13/25; 11:30 AM", color: "bg-[#EA4335]" },
        ];
      case "standby":
        return [
          { label: "Applied", date: "02/12/25; 11:01 AM", color: "bg-[#27AE60]" },
          { label: "For Interview", date: "02/13/25; 10:00 AM", color: "bg-[#27AE60]" },
        ];
      case "accepted":
        return [
          { label: "Applied", date: "02/12/25; 11:01 AM", color: "bg-[#27AE60]" },
          { label: "For Interview", date: "02/13/25; 10:00 AM", color: "bg-[#27AE60]" },
          { label: "Accepted", date: "02/14/25; 09:00 AM", color: "bg-[#27AE60]" },
        ];
      case "rejected":
        return [
          { label: "Applied", date: "02/12/25; 11:01 AM", color: "bg-[#27AE60]" },
          { label: "For Interview", date: "02/13/25; 10:00 AM", color: "bg-[#27AE60]" },
          { label: "Rejected", date: "02/13/25; 11:30 AM", color: "bg-[#EF4444]" },
        ];
      default:
        return [];
    }
  };

  const steps = getTimelineSteps();

  const dotSize = large ? "w-8 h-8" : "w-5 h-5";
  const lineHeight = large ? "h-[60px]" : "h-[44px]";
  const lineThickness = large ? "w-[6px]" : "w-[4px]";
  const labelText = large ? "text-sm" : "text-xs";
  const dateText = large ? "text-[11px]" : "text-[10px]";
  const headingSize = large ? "text-xl mb-4" : "text-base mb-2";

  return (
    <div className="">
      <h3 className={`text-[#047857] font-bold ${large ? 'text-left' : 'text-right'} ${headingSize}`}>
        {large ? "Application Status" : <>Application<br />Status</>}
      </h3>

      <div className="relative ml-3">
        {steps.map((step, index) => (
          <div key={index} className="relative z-10 flex items-start last:mb-0">
            <div className="flex flex-col items-center mr-3">
              <div className={`rounded-full ${dotSize} ${step.color}`} />
              {index < steps.length - 1 && (
                <div className={`${lineThickness} ${lineHeight} ${steps[index + 1].color}`} />
                )}
            </div>
            <div>
              <p className={`font-bold ${labelText}`}>{step.label}</p>
              <p className={`${dateText} text-[#676767]`}>{step.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}