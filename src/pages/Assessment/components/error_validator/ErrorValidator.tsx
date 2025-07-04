import React from "react";

import { XCircleIcon } from "@heroicons/react/24/solid"; // If you use Heroicons, or swap for any icon

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
  const errorMessages = flattenErrors(errors);

  if (errorMessages.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1000,
        minWidth: 320,
        maxWidth: 400,
        background: "rgba(255,255,255,0.97)",
        border: "1px solid #f87171",
        borderRadius: 12,
        boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)",
        padding: "20px 24px",
        color: "#b91c1c",
        fontFamily: "inherit",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <XCircleIcon width={24} height={24} color="#ef4444" style={{ marginRight: 8 }} />
        <span style={{ fontWeight: 600, fontSize: 18 }}>Form Errors</span>
      </div>
      <ul style={{ paddingLeft: 24, margin: 0 }}>
        {errorMessages.map((msg, idx) => (
          <li key={idx} style={{ marginBottom: 6, fontSize: 15, lineHeight: 1.4 }}>
            {msg}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ErrorValidator;
