import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import Footer from "./components/Footer"; 
import SignupPage from "./pages/SignupPage";
import TaskBoard from "./components/TaskBoard";  
import AdminDashboard from "./components/AdminDashboard";
import AdminManagement from "./pages/AdminManagement";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <Router>
      <Header />  {/* ✅ This remains across all pages */}
      <Routes>
        <Route path="/" element={<MainPage />} />   {/* ✅ Home Page */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/tasks" element={<TaskBoard />} />  {/* ✅ Task Management Page */}
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/adminManagement" element={<AdminManagement />} /> {/* admin page to view users & promote them */}
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
