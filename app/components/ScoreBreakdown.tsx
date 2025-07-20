"use client";

import React, { memo } from "react";

import { MatchingScore } from "../types/matching";

interface ScoreBreakdownProps {
  score: MatchingScore;
}

const ScoreBreakdown = memo(function ScoreBreakdown({
  score,
}: ScoreBreakdownProps) {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 0.8) return "bg-green-500";
    if (score >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const factors = [
    {
      name: "Skill Match",
      score: score.skillMatchScore,
      weight: 0.4,
      description: "Direct skill matches and related skills",
    },
    {
      name: "Experience",
      score: score.experienceScore,
      weight: 0.3,
      description: "Experience depth and complexity level",
    },
    {
      name: "Transferable Skills",
      score: score.transferableSkillsScore,
      weight: 0.2,
      description: "Skills that can be applied to the role",
    },
    {
      name: "Potential",
      score: score.potentialScore,
      weight: 0.1,
      description: "Learning ability and growth trajectory",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Score Breakdown</h3>

      <div className="space-y-6">
        {factors.map((factor, index) => (
          <div
            key={index}
            className="border-b border-gray-200 pb-4 last:border-b-0"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-gray-900">{factor.name}</h4>
                <p className="text-sm text-gray-600">{factor.description}</p>
              </div>
              <div className="text-right">
                <div
                  className={`text-lg font-bold ${getScoreColor(factor.score)}`}
                >
                  {Math.round(factor.score * 100)}%
                </div>
                <div className="text-xs text-gray-500">
                  Weight: {Math.round(factor.weight * 100)}%
                </div>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className={`h-3 rounded-full ${getScoreBarColor(
                  factor.score
                )} transition-all duration-300`}
                style={{ width: `${factor.score * 100}%` }}
              ></div>
            </div>

            <div className="text-xs text-gray-500">
              Contribution to overall score:{" "}
              {Math.round(factor.score * factor.weight * 100)}%
            </div>
          </div>
        ))}
      </div>

      {/* Overall Score Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold text-gray-900">Overall Score</h4>
          <div
            className={`text-2xl font-bold ${getScoreColor(
              score.overallScore
            )}`}
          >
            {Math.round(score.overallScore * 100)}%
          </div>
        </div>

        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full ${getScoreBarColor(
                score.overallScore
              )} transition-all duration-300`}
              style={{ width: `${score.overallScore * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Score Interpretation */}
      <div className="mt-4 p-4 bg-gray-50 rounded">
        <h5 className="font-medium text-gray-900 mb-2">Score Interpretation</h5>
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>80-100%: Excellent match</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span>60-79%: Good match with some gaps</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Below 60%: Significant gaps</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ScoreBreakdown;
