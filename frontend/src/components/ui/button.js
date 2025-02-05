import React from "react";

export const Button = ({ children, style, ...props }) => {
  return (
    <button
      style={{
        padding: "10px 20px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
};
