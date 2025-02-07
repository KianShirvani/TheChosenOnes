import React from "react";

export const Input = ({ style, ...props }) => {
  return (
    <input
      style={{
        padding: "8px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        width: "100%",
        ...style,
      }}
      {...props}
    />
  );
};