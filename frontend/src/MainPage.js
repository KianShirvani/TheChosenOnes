import React from "react";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import Testimonials from "./components/Testimonials";
import CallToAction from "./components/CallToAction";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

const MainPage = () => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <Testimonials />
      <CallToAction />
      <Footer />
    </>
  );
};

export default MainPage;