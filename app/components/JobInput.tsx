"use client";

import { useState, useEffect } from "react";

import { Job } from "../types/matching";
import { sampleJobs } from "../data/sampleJobs";

interface JobInputProps {
  onJobSelect: (jobId: string) => void;
  selectedJobId: string;
}

const JobInput = ({ onJobSelect, selectedJobId }: JobInputProps) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        setJobs(sampleJobs);
      } catch (err) {
        setError("Failed to load jobs. Please try again.");
        console.error("Error loading jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      const job = jobs.find((j) => j.id === selectedJobId);
      setSelectedJob(job || null);
    } else {
      setSelectedJob(null);
    }
  }, [selectedJobId, jobs]);

  const handleJobSelect = (jobId: string) => {
    // Clear any previous validation errors
    setValidationError(null);

    // Validate job selection
    if (!jobId) {
      setValidationError("Please select a job");
      return;
    }

    const selectedJob = jobs.find((job) => job.id === jobId);
    if (!selectedJob) {
      setValidationError("Selected job not found");
      return;
    }

    // Additional validation
    if (!selectedJob.title || !selectedJob.requirements) {
      setValidationError("Selected job has incomplete information");
      return;
    }

    setSelectedJob(selectedJob);
    onJobSelect(jobId);
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateJobData = (job: Job): string[] => {
    const errors: string[] = [];

    if (!job.title?.trim()) {
      errors.push("Job title is missing");
    }

    if (!job.requirements || job.requirements.length === 0) {
      errors.push("Job requirements are missing");
    }

    if (!job.company?.trim()) {
      errors.push("Company name is missing");
    }

    if (!job.location?.trim()) {
      errors.push("Job location is missing");
    }

    return errors;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Job</h3>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Job</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Job</h3>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search jobs by title, company, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-4 w-4 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-sm text-red-700">{validationError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Job List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            {searchTerm
              ? "No jobs found matching your search."
              : "No jobs available."}
          </div>
        ) : (
          filteredJobs.map((job) => {
            const errors = validateJobData(job);
            const hasErrors = errors.length > 0;

            return (
              <button
                key={job.id}
                onClick={() => handleJobSelect(job.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedJobId === job.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                } ${hasErrors ? "border-orange-300 bg-orange-50" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{job.title}</h4>
                    <p className="text-sm text-gray-600">{job.company}</p>
                    <p className="text-xs text-gray-500">{job.location}</p>
                    {hasErrors && (
                      <div className="mt-1">
                        <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                          Incomplete data
                        </span>
                      </div>
                    )}
                  </div>
                  {selectedJobId === job.id && (
                    <svg
                      className="h-5 w-5 text-blue-500 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Selected Job Details */}
      {selectedJob && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Selected Job</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Title:</span>{" "}
              {selectedJob.title}
            </div>
            <div>
              <span className="font-medium text-gray-700">Company:</span>{" "}
              {selectedJob.company}
            </div>
            <div>
              <span className="font-medium text-gray-700">Location:</span>{" "}
              {selectedJob.location}
            </div>
            <div>
              <span className="font-medium text-gray-700">Requirements:</span>
              <div className="text-gray-600 mt-1">
                {selectedJob.requirements.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {selectedJob.requirements.map((req, index) => (
                      <li key={index} className="text-sm">
                        {req.skillId} - {req.minDuration} months (Level{" "}
                        {req.requiredLevel})
                        {req.isRequired && (
                          <span className="text-red-600 ml-1">*Required</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">
                    No specific requirements listed
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobInput;
