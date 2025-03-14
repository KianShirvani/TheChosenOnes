// NotificationContext.js
// For handling notification in Header.js so notification message is popped when a user is added/removed from a task
import React, { createContext, useState } from "react";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  // The notification object holds a message and a color.
  const [notification, setNotification] = useState({
    message: "",
    color: "#ccc", // default color
  });

  return (
    <NotificationContext.Provider value={{ notification, setNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
