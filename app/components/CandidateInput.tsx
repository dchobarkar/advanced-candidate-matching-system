"use client";

import { useState, useEffect } from "react";

import { Candidate } from "../types/matching";
import { sampleCandidates } from "../data/sampleCandidates";

interface CandidateInputProps {
  onCandidateSelect: (candidateId: string) => void;
  selectedCandidateId: string;
}

export default function CandidateInput({
  onCandidateSelect,
  selectedCandidateId,
}: CandidateInputProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        setCandidates(sampleCandidates);
      } catch (err) {
        setError("Failed to load candidates. Please try again.");
        console.error("Error loading candidates:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, []);

  useEffect(() => {
    if (selectedCandidateId) {
      const candidate = candidates.find((c) => c.id === selectedCandidateId);
      setSelectedCandidate(candidate || null);
    } else {
      setSelectedCandidate(null);
    }
  }, [selectedCandidateId, candidates]);

  const handleCandidateSelect = (candidateId: string) => {
    // Clear any previous validation errors
    setValidationError(null);

    // Validate candidate selection
    if (!candidateId) {
      setValidationError("Please select a candidate");
      return;
    }

    const selectedCandidate = candidates.find(
      (candidate) => candidate.id === candidateId
    );
    if (!selectedCandidate) {
      setValidationError("Selected candidate not found");
      return;
    }

    // Additional validation
    if (
      !selectedCandidate.name ||
      !selectedCandidate.skills ||
      selectedCandidate.skills.length === 0
    ) {
      setValidationError("Selected candidate has incomplete information");
      return;
    }

    setSelectedCandidate(selectedCandidate);
    onCandidateSelect(candidateId);
  };

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateCandidateData = (candidate: Candidate): string[] => {
    const errors: string[] = [];

    if (!candidate.name?.trim()) {
      errors.push("Candidate name is missing");
    }

    if (!candidate.email?.trim()) {
      errors.push("Candidate email is missing");
    }

    if (!candidate.skills || candidate.skills.length === 0) {
      errors.push("Candidate has no skills listed");
    }

    if (!candidate.experience || candidate.experience.length === 0) {
      errors.push("Candidate has no experience listed");
    }

    if (!candidate.summary?.trim()) {
      errors.push("Candidate summary is missing");
    }

    return errors;
  };

  const getSkillCount = (candidate: Candidate) => {
    return candidate.skills.length;
  };

  const getExperienceYears = (candidate: Candidate) => {
    const totalMonths = candidate.experience.reduce(
      (total, exp) => total + exp.duration,
      0
    );
    return Math.round((totalMonths / 12) * 10) / 10; // Round to 1 decimal place
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Select Candidate
        </h3>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Select Candidate
        </h3>
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
                className="mt-2 text-sm text-red-600 hover:text-red-500 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Select Candidate
      </h3>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search candidates by name, email, or summary..."
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

      {/* Candidate List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            {searchTerm
              ? "No candidates found matching your search."
              : "No candidates available."}
          </div>
        ) : (
          filteredCandidates.map((candidate) => {
            const errors = validateCandidateData(candidate);
            const hasErrors = errors.length > 0;

            return (
              <button
                key={candidate.id}
                onClick={() => handleCandidateSelect(candidate.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedCandidateId === candidate.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                } ${hasErrors ? "border-orange-300 bg-orange-50" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {candidate.name}
                    </h4>
                    <p className="text-sm text-gray-600">{candidate.email}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>{getSkillCount(candidate)} skills</span>
                      <span>{getExperienceYears(candidate)} years exp.</span>
                    </div>
                    {hasErrors && (
                      <div className="mt-1">
                        <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                          Incomplete data
                        </span>
                      </div>
                    )}
                  </div>
                  {selectedCandidateId === candidate.id && (
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

      {/* Selected Candidate Details */}
      {selectedCandidate && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Selected Candidate</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Name:</span>{" "}
              {selectedCandidate.name}
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>{" "}
              {selectedCandidate.email}
            </div>
            <div>
              <span className="font-medium text-gray-700">Skills:</span>
              <div className="text-gray-600 mt-1">
                {selectedCandidate.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedCandidate.skills
                      .slice(0, 5)
                      .map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    {selectedCandidate.skills.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{selectedCandidate.skills.length - 5} more
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No skills listed</p>
                )}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Experience:</span>
              <div className="text-gray-600 mt-1">
                {selectedCandidate.experience.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {selectedCandidate.experience
                      .slice(0, 3)
                      .map((exp, index) => (
                        <li key={index} className="text-sm">
                          {exp.skillId} - {exp.duration} months (Level{" "}
                          {exp.complexityLevel})
                        </li>
                      ))}
                    {selectedCandidate.experience.length > 3 && (
                      <li className="text-sm text-gray-500">
                        +{selectedCandidate.experience.length - 3} more
                        experiences
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No experience listed</p>
                )}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Summary:</span>
              <p className="text-gray-600 mt-1 text-sm">
                {selectedCandidate.summary.length > 100
                  ? `${selectedCandidate.summary.substring(0, 100)}...`
                  : selectedCandidate.summary}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
