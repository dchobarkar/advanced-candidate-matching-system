"use client";

import { useState } from "react";

import { MatchingResult } from "./types/matching";
import JobInput from "./components/JobInput";
import CandidateInput from "./components/CandidateInput";
import MatchingResults from "./components/MatchingResults";
import ScoreBreakdown from "./components/ScoreBreakdown";
import KnowledgeGraph from "./components/KnowledgeGraph";

export default function Page() {
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("");
  const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMatch = async () => {
    if (!selectedJobId || !selectedCandidateId) {
      setError("Please select both a job and a candidate");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/matching", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: selectedJobId,
          candidateId: selectedCandidateId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to perform matching");
      }

      const data = await response.json();
      setMatchingResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Advanced Candidate Matching System
          </h1>
          <p className="text-gray-600">
            AI-powered candidate matching that goes beyond simple text
            comparison
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Job Input */}
          <div>
            <JobInput
              onJobSelect={setSelectedJobId}
              selectedJobId={selectedJobId}
            />
          </div>

          {/* Candidate Input */}
          <div>
            <CandidateInput
              onCandidateSelect={setSelectedCandidateId}
              selectedCandidateId={selectedCandidateId}
            />
          </div>
        </div>

        {/* Match Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleMatch}
            disabled={!selectedJobId || !selectedCandidateId || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            {loading ? "Matching..." : "Perform Matching"}
          </button>
        </div>

        {/* Results */}
        {matchingResult && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <MatchingResults
              result={matchingResult}
              loading={loading}
              error={error}
            />
            <ScoreBreakdown score={matchingResult.score} />
          </div>
        )}

        {/* Knowledge Graph */}
        <div className="mb-8">
          <KnowledgeGraph
            selectedSkills={
              matchingResult?.score?.breakdown?.matchedSkills || []
            }
          />
        </div>
      </div>
    </div>
  );
}
