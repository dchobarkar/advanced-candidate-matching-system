interface MatchingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

const MatchingProgress = ({
  currentStep,
  totalSteps,
  stepLabels,
}: MatchingProgressProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Matching Progress
      </h3>

      <div className="space-y-4">
        {stepLabels.map((label, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={index} className="flex items-center">
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isCurrent
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? "✓" : index + 1}
              </div>

              <div className="ml-4 flex-1">
                <div
                  className={`text-sm font-medium ${
                    isCompleted
                      ? "text-green-600"
                      : isCurrent
                      ? "text-blue-600"
                      : "text-gray-500"
                  }`}
                >
                  {label}
                </div>

                {isCurrent && (
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full animate-pulse"
                        style={{ width: "60%" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <div className="text-sm text-gray-600">
          Step {currentStep + 1} of {totalSteps}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default MatchingProgress;
