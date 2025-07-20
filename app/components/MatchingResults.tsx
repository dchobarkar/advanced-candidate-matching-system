"use client";

import React, { memo, useState } from "react";

import { MatchingResult } from "../types/matching";

interface MatchingResultsProps {
  result: MatchingResult | null;
  loading: boolean;
  error: string | null;
}

const MatchingResults = memo(function MatchingResults({
  result,
  loading,
  error,
}: MatchingResultsProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium mb-2">Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <div className="text-lg font-medium mb-2">No Results</div>
          <p>Select a job and candidate to see matching results</p>
        </div>
      </div>
    );
  }

  const { score, explanation, recommendations } = result;
  const { candidate, job } = result;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 80) return "ring-green-500";
    if (score >= 60) return "ring-yellow-500";
    return "ring-red-500";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Matching Results
      </h2>

      {/* Overall Score */}
      <div className="mb-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white border-4 border-gray-200 relative">
            <div
              className={`absolute inset-0 rounded-full ${getScoreBgColor(
                score.overallScore
              )} ${getScoreRingColor(score.overallScore)} ring-4`}
            ></div>
            <span
              className={`text-2xl font-bold ${getScoreColor(
                score.overallScore
              )} relative z-10`}
            >
              {Math.round(score.overallScore * 100)}%
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
            {candidate.name} → {job.title}
          </h3>
          <p className="text-gray-600">{job.company}</p>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-4">Score Breakdown</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Skill Match
              </span>
              <span
                className={`text-sm font-bold ${getScoreColor(
                  score.skillMatchScore
                )}`}
              >
                {Math.round(score.skillMatchScore * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getScoreBgColor(
                  score.skillMatchScore
                )}`}
                style={{ width: `${score.skillMatchScore * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Experience
              </span>
              <span
                className={`text-sm font-bold ${getScoreColor(
                  score.experienceScore
                )}`}
              >
                {Math.round(score.experienceScore * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getScoreBgColor(
                  score.experienceScore
                )}`}
                style={{ width: `${score.experienceScore * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Transferable Skills
              </span>
              <span
                className={`text-sm font-bold ${getScoreColor(
                  score.transferableSkillsScore
                )}`}
              >
                {Math.round(score.transferableSkillsScore * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getScoreBgColor(
                  score.transferableSkillsScore
                )}`}
                style={{ width: `${score.transferableSkillsScore * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Potential
              </span>
              <span
                className={`text-sm font-bold ${getScoreColor(
                  score.potentialScore
                )}`}
              >
                {Math.round(score.potentialScore * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getScoreBgColor(
                  score.potentialScore
                )}`}
                style={{ width: `${score.potentialScore * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Analysis</h4>
        <div className="bg-blue-50 p-4 rounded">
          <p className="text-gray-700 text-sm leading-relaxed">{explanation}</p>
        </div>
      </div>

      {/* Detailed Breakdown Toggle */}
      <div className="mb-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
        >
          {showDetails ? "Hide" : "Show"} Detailed Breakdown
          <svg
            className={`ml-1 w-4 h-4 transform transition-transform ${
              showDetails ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Detailed Analysis</h4>

          {/* Matched Skills */}
          {score.breakdown.matchedSkills.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-green-700 mb-2">
                ✓ Matched Skills
              </h5>
              <div className="flex flex-wrap gap-2">
                {score.breakdown.matchedSkills.map((skillId) => (
                  <span
                    key={skillId}
                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                  >
                    {skillId.charAt(0).toUpperCase() + skillId.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Skills */}
          {score.breakdown.relatedSkills.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-blue-700 mb-2">
                🔗 Related Skills
              </h5>
              <div className="flex flex-wrap gap-2">
                {score.breakdown.relatedSkills.map((skillId) => (
                  <span
                    key={skillId}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                  >
                    {skillId.charAt(0).toUpperCase() + skillId.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {score.breakdown.missingSkills.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-red-700 mb-2">
                ✗ Missing Skills
              </h5>
              <div className="flex flex-wrap gap-2">
                {score.breakdown.missingSkills.map((skillId) => (
                  <span
                    key={skillId}
                    className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded"
                  >
                    {skillId.charAt(0).toUpperCase() + skillId.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience Gaps */}
          {score.breakdown.experienceGaps.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-orange-700 mb-2">
                ⚠ Experience Gaps
              </h5>
              <div className="space-y-2">
                {score.breakdown.experienceGaps.map((gap, index) => (
                  <div key={index} className="bg-orange-50 p-2 rounded text-xs">
                    <span className="font-medium">
                      {gap.skillId.charAt(0).toUpperCase() +
                        gap.skillId.slice(1)}
                      :
                    </span>
                    <span className="text-orange-700 ml-1">
                      {gap.candidateDuration} months vs {gap.requiredDuration}{" "}
                      months required
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span className="text-sm text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

export default MatchingResults;
