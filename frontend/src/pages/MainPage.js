import React from "react";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import Testimonials from "../components/Testimonials";
import CallToAction from "../components/CallToAction";

const MainPage = () => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <Testimonials />
      <CallToAction />
    </>
  );
};

export default MainPage;