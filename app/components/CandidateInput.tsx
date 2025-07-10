"use client";

import { useState, useEffect } from "react";

import { Candidate } from "../types/matching";
import { sampleCandidates } from "../data/sampleCandidates";

interface CandidateInputProps {
  onCandidateSelect: (candidateId: string) => void;
  selectedCandidateId?: string;
}

export default function CandidateInput({
  onCandidateSelect,
  selectedCandidateId,
}: CandidateInputProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );

  useEffect(() => {
    // Load candidates from the data file
    const loadCandidates = async () => {
      try {
        setCandidates(sampleCandidates);
      } catch (error) {
        console.error("Failed to load candidates:", error);
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
    }
  }, [selectedCandidateId, candidates]);

  const handleCandidateSelect = (candidateId: string) => {
    onCandidateSelect(candidateId);
    const candidate = candidates.find((c) => c.id === candidateId);
    setSelectedCandidate(candidate || null);
  };

  const getSkillDisplayName = (skillId: string) => {
    return skillId.charAt(0).toUpperCase() + skillId.slice(1);
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Select a Candidate
      </h2>

      {/* Candidate Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose a candidate to match:
        </label>
        <select
          value={selectedCandidateId || ""}
          onChange={(e) => handleCandidateSelect(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a candidate...</option>
          {candidates.map((candidate) => (
            <option key={candidate.id} value={candidate.id}>
              {candidate.name} - {candidate.summary.substring(0, 50)}...
            </option>
          ))}
        </select>
      </div>

      {/* Candidate Details */}
      {selectedCandidate && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Candidate Profile
          </h3>

          {/* Basic Info */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 text-lg">
              {selectedCandidate.name}
            </h4>
            <p className="text-gray-600">{selectedCandidate.email}</p>
            <p className="text-sm text-gray-600 mt-2">
              {selectedCandidate.summary}
            </p>
          </div>

          {/* Skills */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Skills:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedCandidate.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {getSkillDisplayName(skill)}
                </span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Key Experience:</h4>
            <div className="space-y-3">
              {selectedCandidate.experience.slice(0, 3).map((exp) => (
                <div key={exp.id} className="bg-gray-50 p-3 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {getSkillDisplayName(exp.skillId)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {exp.duration} months
                      </span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Level {exp.complexityLevel}
                      </span>
                      {exp.hasLeadershipRole && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          Leadership
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {exp.projectDescription}
                  </p>
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">
                      Technologies:{" "}
                    </span>
                    <span className="text-xs text-gray-600">
                      {exp.technologies.join(", ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Education:</h4>
            <div className="space-y-2">
              {selectedCandidate.education.map((edu, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded">
                  <div className="font-medium text-gray-900">{edu.degree}</div>
                  <div className="text-sm text-gray-600">{edu.institution}</div>
                  <div className="text-sm text-gray-500">
                    {edu.field} • {edu.graduationYear}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
