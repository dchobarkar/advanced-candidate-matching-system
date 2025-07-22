interface StatusIndicatorProps {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
}

const StatusIndicator = ({ status, message }: StatusIndicatorProps) => {
  const statusConfig = {
    idle: {
      icon: "⏳",
      color: "text-gray-500",
      bgColor: "bg-gray-100",
      text: "Ready to match",
    },
    loading: {
      icon: "🔄",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      text: "Processing...",
    },
    success: {
      icon: "✅",
      color: "text-green-600",
      bgColor: "bg-green-100",
      text: "Match complete",
    },
    error: {
      icon: "❌",
      color: "text-red-600",
      bgColor: "bg-red-100",
      text: "Error occurred",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}
    >
      <span className="mr-2">{config.icon}</span>
      <span>{message || config.text}</span>
    </div>
  );
};

export default StatusIndicator;
