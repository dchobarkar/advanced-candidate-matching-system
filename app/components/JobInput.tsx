"use client";

import { useState, useEffect } from "react";

import { Job } from "../types/matching";
import { sampleJobs } from "../data/sampleJobs";

interface JobInputProps {
  onJobSelect: (jobId: string) => void;
  selectedJobId?: string;
}

export default function JobInput({
  onJobSelect,
  selectedJobId,
}: JobInputProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    // Load jobs from the data file
    const loadJobs = async () => {
      try {
        setJobs(sampleJobs);
      } catch (error) {
        console.error("Failed to load jobs:", error);
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
    }
  }, [selectedJobId, jobs]);

  const handleJobSelect = (jobId: string) => {
    onJobSelect(jobId);
    const job = jobs.find((j) => j.id === jobId);
    setSelectedJob(job || null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Job</h2>

      {/* Job Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose a job to match against:
        </label>
        <select
          value={selectedJobId || ""}
          onChange={(e) => handleJobSelect(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a job...</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title} at {job.company}
            </option>
          ))}
        </select>
      </div>

      {/* Job Details */}
      {selectedJob && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Job Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="font-medium text-gray-900">{selectedJob.title}</h4>
              <p className="text-gray-600">{selectedJob.company}</p>
              <p className="text-sm text-gray-500">{selectedJob.location}</p>
              {selectedJob.salary && (
                <p className="text-sm text-green-600 font-medium">
                  {selectedJob.salary}
                </p>
              )}
            </div>

            <div className="text-sm text-gray-600">
              <p className="mb-2">
                {selectedJob.description.substring(0, 150)}...
              </p>
            </div>
          </div>

          {/* Requirements */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">
              Key Requirements:
            </h4>
            <div className="space-y-2">
              {selectedJob.requirements.map((req, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {req.skillId.charAt(0).toUpperCase() + req.skillId.slice(1)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {req.minDuration} months
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Level {req.requiredLevel}
                    </span>
                    {req.isRequired && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Required
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Responsibilities */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              Responsibilities:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              {selectedJob.responsibilities.slice(0, 3).map((resp, index) => (
                <li key={index}>{resp}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
