"use client";

import { useState } from "react";

import { MatchingResult } from "./types/matching";
import JobInput from "./components/JobInput";
import CandidateInput from "./components/CandidateInput";
import MatchingResults from "./components/MatchingResults";
import ScoreBreakdown from "./components/ScoreBreakdown";
import KnowledgeGraph from "./components/KnowledgeGraph";
import LoadingSpinner from "./components/LoadingSpinner";
import StatusIndicator from "./components/StatusIndicator";
import MatchingProgress from "./components/MatchingProgress";
import WelcomeGuide from "./components/WelcomeGuide";
import Tooltip from "./components/Tooltip";

export default function Page() {
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("");
  const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"matching" | "knowledge">(
    "matching"
  );
  const [progressStep, setProgressStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);

  const progressSteps = [
    "Analyzing job requirements",
    "Evaluating candidate skills",
    "Calculating experience match",
    "Assessing transferable skills",
    "Generating final score",
  ];

  const handleMatch = async () => {
    // Enhanced validation
    if (!selectedJobId && !selectedCandidateId) {
      setError("Please select both a job and a candidate to perform matching");
      return;
    }

    if (!selectedJobId) {
      setError("Please select a job to match against");
      return;
    }

    if (!selectedCandidateId) {
      setError("Please select a candidate to match");
      return;
    }

    setLoading(true);
    setError(null);
    setProgressStep(0);

    // Simulate progress steps
    const progressInterval = setInterval(() => {
      setProgressStep((prev) => {
        if (prev < progressSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(progressInterval);
          return prev;
        }
      });
    }, 800);

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

      const data = await response.json();

      if (!response.ok) {
        // Handle specific API errors
        if (data.code === "RESOURCE_NOT_FOUND") {
          throw new Error(
            `Matching failed: ${data.details || "Job or candidate not found"}`
          );
        } else if (data.code === "MISSING_REQUIRED_FIELDS") {
          throw new Error(
            "Matching failed: Missing required job or candidate information"
          );
        } else if (data.code === "INVALID_REQUEST") {
          throw new Error(
            `Matching failed: ${data.details || "Invalid request parameters"}`
          );
        } else {
          throw new Error(
            `Matching failed: ${data.details || data.error || "Unknown error"}`
          );
        }
      }

      if (!data.result) {
        throw new Error("Matching failed: No result returned from server");
      }

      setMatchingResult(data.result);
      setActiveTab("matching");
      clearInterval(progressInterval);
      setProgressStep(progressSteps.length - 1);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during matching";
      setError(errorMessage);
      clearInterval(progressInterval);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedJobId("");
    setSelectedCandidateId("");
    setMatchingResult(null);
    setError(null);
    setProgressStep(0);
  };

  const getStatus = () => {
    if (loading) return "loading";
    if (error) return "error";
    if (matchingResult) return "success";
    return "idle";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Welcome Guide */}
      {showWelcome && <WelcomeGuide onDismiss={() => setShowWelcome(false)} />}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Advanced Candidate Matching System
              </h1>
              <p className="text-gray-600 mt-1">
                AI-powered matching that goes beyond simple text comparison
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <StatusIndicator status={getStatus()} />
              <Tooltip content="Get help and learn how to use the system">
                <button
                  onClick={() => setShowWelcome(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Help
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("matching")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "matching"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Candidate Matching
            </button>
            <button
              onClick={() => setActiveTab("knowledge")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "knowledge"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Knowledge Graph
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "matching" ? (
          <div className="space-y-8">
            {/* Input Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <JobInput
                onJobSelect={setSelectedJobId}
                selectedJobId={selectedJobId}
              />
              <CandidateInput
                onCandidateSelect={setSelectedCandidateId}
                selectedCandidateId={selectedCandidateId}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-4">
              <Tooltip
                content={
                  !selectedJobId && !selectedCandidateId
                    ? "Please select both a job and a candidate first"
                    : !selectedJobId
                    ? "Please select a job to match against"
                    : !selectedCandidateId
                    ? "Please select a candidate to match"
                    : "Click to perform AI-powered matching analysis"
                }
              >
                <button
                  onClick={handleMatch}
                  disabled={!selectedJobId || !selectedCandidateId || loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Perform Matching</span>
                    </>
                  )}
                </button>
              </Tooltip>

              <Tooltip content="Clear all selections and start over">
                <button
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Reset
                </button>
              </Tooltip>
            </div>

            {/* Progress Indicator */}
            {loading && (
              <div className="max-w-2xl mx-auto">
                <MatchingProgress
                  currentStep={progressStep}
                  totalSteps={progressSteps.length}
                  stepLabels={progressSteps}
                />
              </div>
            )}

            {/* Error Display */}
            {error && (
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
                  </div>
                </div>
              </div>
            )}

            {/* Results Section */}
            {matchingResult && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Matching Results
                  </h2>
                  <p className="text-gray-600">
                    Analysis complete for {matchingResult.candidate.name} →{" "}
                    {matchingResult.job.title}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <MatchingResults
                    result={matchingResult}
                    loading={loading}
                    error={error}
                  />
                  <ScoreBreakdown score={matchingResult.score} />
                </div>

                {/* Additional Insights */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {matchingResult.score.breakdown.matchedSkills.length}
                      </div>
                      <div className="text-sm text-blue-800">
                        Matched Skills
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {matchingResult.score.breakdown.relatedSkills.length}
                      </div>
                      <div className="text-sm text-green-800">
                        Related Skills
                      </div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {matchingResult.score.breakdown.experienceGaps.length}
                      </div>
                      <div className="text-sm text-orange-800">
                        Experience Gaps
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Knowledge Graph Tab */
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Knowledge Graph
              </h2>
              <p className="text-gray-600">
                Explore skill relationships and understand how our matching
                system works
              </p>
            </div>

            <KnowledgeGraph
              selectedSkills={
                matchingResult?.score?.breakdown?.matchedSkills || []
              }
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Advanced Candidate Matching System • Built with Next.js 15.3.5 •
              AI-Powered Matching
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
