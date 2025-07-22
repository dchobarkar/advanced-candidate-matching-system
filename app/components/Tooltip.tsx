"use client";

import { useState } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

const Tooltip = ({
  content,
  children,
  position = "top",
  className = "",
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
      case "bottom":
        return "top-full left-1/2 transform -translate-x-1/2 mt-2";
      case "left":
        return "right-full top-1/2 transform -translate-y-1/2 mr-2";
      case "right":
        return "left-full top-1/2 transform -translate-y-1/2 ml-2";
      default:
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
    }
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap ${getPositionClasses()}`}
          role="tooltip"
        >
          {content}
          {/* Arrow */}
          <div
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === "top"
                ? "top-full left-1/2 -translate-x-1/2 -mt-1"
                : position === "bottom"
                ? "bottom-full left-1/2 -translate-x-1/2 -mb-1"
                : position === "left"
                ? "left-full top-1/2 -translate-y-1/2 -ml-1"
                : "right-full top-1/2 -translate-y-1/2 -mr-1"
            }`}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
