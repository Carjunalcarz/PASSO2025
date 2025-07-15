import React, { useState } from "react";

import { XCircleIcon, XMarkIcon } from "@heroicons/react/24/solid"; // If you use Heroicons, or swap for any icon

interface ErrorValidatorProps {
  errors: any;
}

const flattenErrors = (errors: any, prefix = ""): string[] => {
  let messages: string[] = [];
  Object.keys(errors).forEach((key) => {
    const error = errors[key];
    const field = prefix ? `${prefix}.${key}` : key;
    if (error?.message) {
      messages.push(`${field.replace(/\./g, " → ")}: ${error.message}`);
    } else if (typeof error === "object" && error !== null) {
      messages = messages.concat(flattenErrors(error, field));
    }
  });
  return messages;
};

const ErrorValidator: React.FC<ErrorValidatorProps> = ({ errors }) => {
  const [isVisible, setIsVisible] = useState(true);
  const errorMessages = flattenErrors(errors);

  if (errorMessages.length === 0 || !isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1000,
        minWidth: 320,
        maxWidth: 400,
        maxHeight: "80vh", // Limit height to 80% of viewport height
        background: "rgba(255,255,255,0.97)",
        border: "1px solid #f87171",
        borderRadius: 12,
        boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)",
        padding: "20px 24px",
        color: "#b91c1c",
        fontFamily: "inherit",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <XCircleIcon width={24} height={24} color="#ef4444" style={{ marginRight: 8 }} />
          <span style={{ fontWeight: 600, fontSize: 18 }}>Form Errors ({errorMessages.length})</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6b7280",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
            e.currentTarget.style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#6b7280";
          }}
          title="Close error messages"
        >
          <XMarkIcon width={20} height={20} />
        </button>
      </div>
      <div
        style={{
          overflowY: "auto",
          maxHeight: "calc(80vh - 80px)", // Subtract header height and padding
          paddingRight: "8px", // Space for scrollbar
        }}
        className="scrollbar-hover" // Use the existing scrollbar styles
      >
        <ul style={{ paddingLeft: 24, margin: 0 }}>
          {errorMessages.map((msg, idx) => (
            <li key={idx} style={{ marginBottom: 6, fontSize: 15, lineHeight: 1.4 }}>
              {msg}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ErrorValidator;
