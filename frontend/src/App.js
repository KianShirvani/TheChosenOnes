import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import MainPage from "./MainPage";
import LoginPage from "./LoginPage";
import Footer from "./components/Footer"; 
import SignupPage from "./SignupPage";
import TaskBoard from "./components/TaskBoard";  
import AboutPage from "./AboutPage";
import ContactPage from "./ContactPage";

function App() {
  return (
    <Router>
      <Header />  {/* This remains across all pages */}
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/tasks" element={<TaskBoard />} />
        <Route path="/about" element={<AboutPage />} />  
        <Route path="/contact" element={<ContactPage />} />  
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
