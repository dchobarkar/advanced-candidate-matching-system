import { useState } from "react";

interface WelcomeGuideProps {
  onDismiss: () => void;
}

export default function WelcomeGuide({ onDismiss }: WelcomeGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Advanced Candidate Matching",
      description:
        "This AI-powered system goes beyond simple keyword matching to provide intelligent candidate-job matching.",
      icon: "🎯",
    },
    {
      title: "Select a Job",
      description:
        "Choose from our sample jobs or the job you want to match candidates against. Each job has detailed requirements and responsibilities.",
      icon: "💼",
    },
    {
      title: "Select a Candidate",
      description:
        "Pick a candidate from our sample database. Each candidate has comprehensive skills, experience, and education data.",
      icon: "👤",
    },
    {
      title: "Run the Matching",
      description:
        "Click 'Perform Matching' to analyze the candidate against the job requirements using our sophisticated scoring algorithm.",
      icon: "⚡",
    },
    {
      title: "Review Results",
      description:
        "Explore detailed matching results, score breakdowns, and recommendations to understand the match quality.",
      icon: "📊",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onDismiss();
    }
  };

  const handleSkip = () => {
    onDismiss();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Getting Started</h2>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Step Content */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">{steps[currentStep].icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {steps[currentStep].description}
            </p>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span>
                {Math.round(((currentStep + 1) / steps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
