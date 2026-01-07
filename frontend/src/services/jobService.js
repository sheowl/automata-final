const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

class JobService {
  async getAllJobs() {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  }

  async getJobsByCompany(companyId) {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/jobs/company/${companyId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching company jobs:', error);
      throw error;
    }
  }

  async createJob(jobData) {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  async getJobById(jobId) {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  }

  async updateJob(jobId, jobData) {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  async deleteJob(jobId) {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }

  // Updated method to fetch jobs for a specific company
  async getCompanyJobs(companyId = 2) { // Default to company ID 2
    try {
      return await this.getJobsByCompany(companyId);
    } catch (error) {
      console.error('Error fetching company jobs:', error);
      throw error;
    }
  }

  // Transform backend data to frontend format
  transformJobData(backendJob) {
    return {
      id: backendJob.job_id,
      jobTitle: backendJob.job_title || 'Untitled Job',
      companyName: backendJob.company_name || backendJob.Company?.company_name || 'Unknown Company',
      location: backendJob.location || 'Remote', // Default to Remote if no location
      type: this.mapWorkSetting(backendJob.setting),
      employment: this.mapWorkType(backendJob.work_type),
      description: backendJob.description || 'No description available',
      status: backendJob.status || 'Active',
      postedDaysAgo: this.calculateDaysAgo(backendJob.created_at || backendJob.date_added),
      
      // Ensure salary values are properly formatted
      salaryMin: backendJob.salary_min ? Number(backendJob.salary_min) : null,
      salaryMax: backendJob.salary_max ? Number(backendJob.salary_max) : null,
      salaryRange: this.formatSalaryRange(backendJob.salary_min, backendJob.salary_max),
      
      // Ensure position count is a number
      positionCount: backendJob.position_count ? Number(backendJob.position_count) : 1,
      availablePositions: backendJob.position_count ? Number(backendJob.position_count) : 1,
      
      // Add applicant count (will be fetched separately)
      applicantCount: backendJob.applicant_count || 0,
      
      // Backend fields
      requiredCategoryId: backendJob.required_category_id,
      requiredProficiency: backendJob.required_proficiency,
      companyId: backendJob.company_id,
      dateAdded: backendJob.date_added,
      createdAt: backendJob.created_at
    };
  }

  // Format salary range for display
  formatSalaryRange(salaryMin, salaryMax) {
    if (!salaryMin && !salaryMax) return 'Salary not specified';
    if (!salaryMin) return `Up to ₱${Number(salaryMax).toLocaleString()}`;
    if (!salaryMax) return `₱${Number(salaryMin).toLocaleString()}+`;
    if (salaryMin === salaryMax) return `₱${Number(salaryMin).toLocaleString()}`;
    return `₱${Number(salaryMin).toLocaleString()} - ₱${Number(salaryMax).toLocaleString()}`;
  }

  // Transform frontend data to backend format
  transformToBackendFormat(frontendJob) {
    return {
      job_title: frontendJob.jobTitle,
      company_id: frontendJob.companyId || 2,
      
      // Ensure numbers are properly converted
      salary_min: frontendJob.salaryMin ? Number(frontendJob.salaryMin) : null,
      salary_max: frontendJob.salaryMax ? Number(frontendJob.salaryMax) : null,
      position_count: frontendJob.positions || frontendJob.positionCount || frontendJob.availablePositions || 1,
      
      setting: this.mapSettingToBackend(frontendJob.modality || frontendJob.type),
      work_type: this.mapWorkTypeToBackend(frontendJob.workType || frontendJob.employment),
      description: frontendJob.description,
      date_added: frontendJob.dateAdded || new Date().toISOString().split('T')[0],
      created_at: frontendJob.createdAt || new Date().toISOString(),
      required_category_id: frontendJob.requiredCategoryId || 2,
      required_proficiency: frontendJob.requiredProficiency || 3
    };
  }

  // Get job with applicant count
  async getJobWithApplicants(jobId) {
    try {
      const job = await this.getJobById(jobId);
      const applicants = await this.getJobApplicants(jobId);
      
      return {
        ...this.transformJobData(job),
        applicantCount: applicants.length
      };
    } catch (error) {
      console.error('Error fetching job with applicants:', error);
      throw error;
    }
  }

  // Get applicants for a job
  async getJobApplicants(jobId) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/job/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching job applicants:', error);
      return []; // Return empty array if error
    }
  }

  // Helper methods for mapping enum values
  mapWorkSetting(setting) {
    const settingMap = {
      'onsite': 'On-Site',
      'remote': 'Remote',
      'hybrid': 'Hybrid'
    };
    return settingMap[setting] || 'On-Site';
  }

  mapWorkType(workType) {
    const typeMap = {
      'fulltime': 'Full-Time',
      'part-time': 'Part-Time',
      'contractual': 'Contractual',
      'internship': 'Internship'
    };
    return typeMap[workType] || 'Full-Time';
  }

  mapSettingToBackend(setting) {
    const settingMap = {
      'On-Site': 'onsite',
      'Remote': 'remote',
      'Hybrid': 'hybrid'
    };
    return settingMap[setting] || 'onsite';
  }

  mapWorkTypeToBackend(workType) {
    const typeMap = {
      'Full-Time': 'fulltime',
      'Part-Time': 'part-time',
      'Contractual': 'contractual',
      'Internship': 'internship'
    };
    return typeMap[workType] || 'fulltime';
  }

  calculateDaysAgo(createdAt) {
    if (!createdAt) return 0;
    
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
}

export default new JobService();