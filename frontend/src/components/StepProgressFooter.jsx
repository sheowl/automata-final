export default function StepProgressFooter({ step, segment, onContinue, onSkip }) {
  const totalSegments = step === 2 ? 10 : 3;

  const handleContinue = () => {
    if (step === 2 && segment === 10) {
      // FIXED: Call onContinue first to save data, then redirect will happen from AppOnbStepTwo
      console.log("Final segment - calling onContinue to save data first");
      onContinue(); // This will call handleContinue in AppOnbStepTwo which saves data then calls onNext()
    } else {
      onContinue(); // Call the provided onContinue function for other steps/segments
    }
  };

  return (
    <div className="flex justify-between items-center w-full mt-12 px-[112px]">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">
          Step {step} of 2
        </p>
        <div className="flex gap-2">
          {Array.from({ length: totalSegments }, (_, index) => index + 1).map((s) => (
            <div
              key={s}
              className={`h-2 w-8 rounded-full ${
                segment >= s ? "bg-[#047857]" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        {(step === 1 || step === 2) && (
          <button
            onClick={onSkip}
            className="w-[192px] px-6 py-3 text-[#047857] font-bold rounded-md hover:bg-emerald-50"
          >
            Skip
          </button>
        )}
        <button
          onClick={handleContinue} // Use the updated handleContinue function
          className="w-[192px] px-6 py-3 bg-[#047857] text-white font-bold rounded-md hover:bg-[#065F46]"
        >
          {step === 2 && segment === 10 ? "Complete" : "Continue"}
        </button>
      </div>
    </div>
  );
}