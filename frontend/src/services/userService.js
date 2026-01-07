import { supabase } from "../services/supabaseClient";

// // Mock data for testing
// const mockUserDetails = {
//   contactDetails: {
//     currentAddress: "#1 Kurt St. Brgy. Mapagmahal Silang, Cavite",
//     contactNumber: "0992 356 7294",
//     telephoneNumber: "8153-4137",
//   },
//   educationDetails: {
//     university: "Polytechnic University of the Philippines",
//     degree: "Bachelor of Science in Computer Science",
//     yearGraduated: "2027",
//   },
//   workExperiences: [],
//   field: "",
// };

// Fetch user details (mock or real)
export const fetchUserDetails = async (useMock = false) => {
  if (useMock) {
    // Simulate an asynchronous call with mock data
    return new Promise((resolve) => setTimeout(() => resolve(mockUserDetails), 500));
  }
  // Real API call
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  if (!accessToken) throw new Error("No access token");

  const res = await fetch("http://localhost:8000/api/v1/applicants/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch user details");
  const data = await res.json();
  // Optionally transform data to match your frontend structure
  return {
    contactDetails: {
      currentAddress: data.current_address || "",
      contactNumber: data.contact_number || "",
      telephoneNumber: data.telephone_number || "",
    },
    educationDetails: {
      university: data.university || "",
      degree: data.degree || "",
      yearGraduated: data.year_graduated ? String(data.year_graduated) : "",
    },
    workExperiences: data.work_experiences || [],
    field: data.field || "",
    preferred_worksetting: data.preferred_worksetting || "",
    preferred_worktype: data.preferred_worktype || "",
    // Add other fields as needed
  };
};

// Save user details (mock or real)
export const saveUserDetails = async (userDetails) => {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  if (!accessToken) throw new Error("No access token");

  const res = await fetch("http://localhost:8000/api/v1/applicants/me", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userDetails), // userDetails is already flattened
  });
  if (!res.ok) throw new Error("Failed to save user details");
  return true;
};

export const saveCertificates = async (certifications) => {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  if (!accessToken) throw new Error("No access token");

  for (const cert of certifications) {
    const res = await fetch("http://localhost:8000/api/v1/applicants/me/certificates", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        certificate_name: cert.name || cert.certificate_name,
        certificate_description: cert.description || cert.certificate_description,
        // Add other fields as needed
      }),
    });
    if (!res.ok) throw new Error("Failed to save certificate");
  }
};

export const saveProficiency = async (proficiencyObjOrArr) => {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  if (!accessToken) throw new Error("No access token");

  // If it's an object, convert to array
  const proficiencyArr = Array.isArray(proficiencyObjOrArr)
    ? proficiencyObjOrArr
    : Object.entries(proficiencyObjOrArr).map(([category_id, proficiency]) => ({
        category_id: Number(category_id),
        proficiency,
      }));

  for (const prof of proficiencyArr) {
    const res = await fetch("http://localhost:8000/api/v1/applicants/me/proficiency", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category_id: prof.category_id,
        proficiency: prof.proficiency,
      }),
    });
    if (!res.ok) throw new Error("Failed to save proficiency");
  }
};

const saveWorkExperiences = async (workExperiences) => {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  if (!accessToken) throw new Error("No access token");

  for (const exp of workExperiences) {
    await fetch("http://localhost:8000/api/v1/applicants/me/experience", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(exp), // exp should match your backend schema
    });
  }
};

