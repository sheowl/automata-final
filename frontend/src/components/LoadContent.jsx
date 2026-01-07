const LoadingMainContent = ({ message = "Loading...", bgColor = "bg-white" }) => {
  return (
    <div className={`flex-1 h-screen ${bgColor} rounded-tl-[40px] overflow-y-auto p-6 shadow-md font-montserrat`}>
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#047857] mx-auto mb-4"></div>
          <div>{message}</div>
        </div>
      </div>
    </div>
  );
};

export default LoadingMainContent;