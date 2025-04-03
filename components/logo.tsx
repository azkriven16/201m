// components/Logo201Manager.jsx
import React from "react";

const Logo201Manager = ({ className = "", size = "medium" }) => {
    const sizeClasses = {
        small: "h-8 w-8",
        medium: "h-12 w-12",
        large: "h-16 w-16",
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <svg
                className={sizeClasses[size]}
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Main circle background */}
                <circle cx="50" cy="50" r="45" fill="#4F46E5" />

                {/* The "201" text */}
                <text
                    x="50"
                    y="58"
                    fontFamily="Arial"
                    fontSize="28"
                    fontWeight="bold"
                    fill="white"
                    textAnchor="middle"
                >
                    201
                </text>

                {/* Document icon shape on top */}
                <path
                    d="M34 25 L66 25 L66 75 L34 75 Z"
                    fill="#818CF8"
                    stroke="white"
                    strokeWidth="2"
                />

                {/* Lines representing text on document */}
                <line
                    x1="40"
                    y1="35"
                    x2="60"
                    y2="35"
                    stroke="white"
                    strokeWidth="2"
                />
                <line
                    x1="40"
                    y1="45"
                    x2="60"
                    y2="45"
                    stroke="white"
                    strokeWidth="2"
                />
                <line
                    x1="40"
                    y1="55"
                    x2="50"
                    y2="55"
                    stroke="white"
                    strokeWidth="2"
                />
            </svg>
            <span className="text-xl font-bold text-slate-800">
                201 Manager
            </span>
        </div>
    );
};

export default Logo201Manager;
