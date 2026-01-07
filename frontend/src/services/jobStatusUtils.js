// utils/statusUtils.js

export const getStatusLabel = (status) => {
  if (status.toLowerCase().includes("rejected")) return "Rejected";

  switch (status) {
    case "applied":
      return "Applied";
    case "interview":
      return "For Interview";
    case "standby":
      return "On Standby";
    case "accepted":
      return "Accepted";
    default:
      return status.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
};

export const getStatusDescription = (status) => {
  switch (status) {
    case "applied":
      return "Your application has been submitted successfully. Please wait while the employer reviews your application.";
    case "interview":
      return "Your application has been reviewed, and the employer has scheduled you for an interview. Please review the provided details including date, time, location (or video link), and any additional remarks.";
    case "rejected-after-interview":
      return "Thank you for attending the interview. While we were impressed with your qualifications, we have decided to move forward with another candidate at this time. We appreciate your interest and the effort you put into the process.";
    case "standby":
      return "You are on standby for further updates.";
    case "accepted":
      return "Congratulations! You have successfully passed the interview process, and your application has been accepted. Further instructions or onboarding details will be sent to you shortly.";
    case "rejected":
      return "We regret to inform you that due to unforeseen changes, we are unable to proceed with the offer previously extended. We understand this may be disappointing and sincerely thank you for your interest and time.";
    default:
      return "Your application has been reviewed. Please wait for further updates regarding the next steps.";
  }
};