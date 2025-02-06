import React from "react";
import "./App.css";
import Header from "./components/Header"; 
import Navbar from "./components/Navbar"; 
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection"; 
import Testimonials from "./components/Testimonials"; 
import CallToAction from "./components/CallToAction";
import Footer from "./components/Footer"; 

function App() {
  return (
    <div className="App">
      <Header /> 
      <HeroSection /> 
      <FeaturesSection />
      <Testimonials />
      <CallToAction />
      <Footer />
    </div>
  );
}

export default App;
