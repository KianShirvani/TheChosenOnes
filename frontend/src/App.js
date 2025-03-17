import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route,Navigate } from "react-router-dom";
import Header from "./components/Header";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import Footer from "./components/Footer"; 
import SignupPage from "./pages/SignupPage";
import TaskBoard from "./components/TaskBoard";  
import AdminDashboard from "./components/AdminDashboard";
import AdminManagement from "./pages/AdminManagement";
import ChatPage from "./pages/ChatPage";
import axios from "axios";
import { NotificationProvider } from "./components/NotificationContext";

const ProtectedRoute = ({ element, adminOnly }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && role !== "admin") {
    return <Navigate to="/tasks" />;
  }

  return element;
};
function App() {
  useEffect(() => {
    // Load data when the app starts
    axios.get("http://localhost:5000/load-data")
      .then(response => console.log("Mock data loaded:", response.data))
      .catch(error => console.error("Error loading mock data:", error));
  }, []);  // Empty dependency array → Runs only on first render
  return (
    <Router>
      <NotificationProvider>
        <Header />  {/* This remains across all pages */}
        <Routes>
          <Route path="/" element={<MainPage />} />   {/* Home Page */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/tasks" element={<ProtectedRoute element={<TaskBoard />} />} />
          <Route
            path="/admindashboard"
            element={<ProtectedRoute element={<AdminDashboard />} adminOnly />}
          />
          <Route
            path="/adminManagement"
            element={<ProtectedRoute element={<AdminManagement />} adminOnly />}
          />
          <Route path="/chat" element={<ProtectedRoute element={<ChatPage />} />} />
        </Routes>
        <Footer />
      </NotificationProvider>
    </Router>
  );
}

export default App;
