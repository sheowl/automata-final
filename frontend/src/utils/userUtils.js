export function flattenUserDetails(userDetails) {
  return {
    current_address: userDetails.contactDetails?.currentAddress || "",
    contact_number: userDetails.contactDetails?.contactNumber || "",
    telephone_number: userDetails.contactDetails?.telephoneNumber || "",
    university: userDetails.educationDetails?.university || "",
    degree: userDetails.educationDetails?.degree || "",
    // Convert year_graduated to integer, send null if empty
    year_graduated: userDetails.educationDetails?.yearGraduated ? 
      parseInt(userDetails.educationDetails.yearGraduated, 10) : null,
    // Only send field if it has a valid value, otherwise send null
    field: userDetails.field || null,
    preferred_worksetting: userDetails.preferred_worksetting || null,
    preferred_worktype: userDetails.preferred_worktype || null,
    // ...other fields
  };
}

// Add mapping functions here:
export function mapWorkSettingToEnum(val) {
  switch (val) {
    case "Hybrid": return "hybrid";
    case "Remote": return "remote";
    case "On-Site": return "onsite";
    default: return null; // Changed from undefined to null
  }
}

export function mapWorkTypeToEnum(val) {
  switch (val) {
    case "Part-Time": return "part-time";
    case "Full-Time": return "fulltime";
    case "Contractual": return "contractual";
    case "Internship": return "internship";
    default: return null; // Changed from undefined to null
  }
}
